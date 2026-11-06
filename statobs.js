/* StatObs (Mes Apps EPS, version enseignant) – fonctions communes : séance en cours,
   lecture de la base élèves Mes Apps EPS (eps-core.js, .xlsx ou .csv), enregistrement
   des séances, export .xlsx au format type « Mes Apps EPS », installation PWA. 100 % local. */
(function () {
  'use strict';

  const APP = 'statobs';                      // identifiant de l'app dans eps-core (ext.statobs) et nom de la feuille
  const K = { config: 'statobsConfig', counts: 'statobsCounts', cur: 'statobsCurrent', final: 'statobsFinal' };
  const HIST = 'statobsHistory';              // séances terminées (détail complet, pour l'export)
  const S = window.StatObs = { APP, K };

  S.read  = k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  S.write = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  S.clearSession = () => Object.values(K).forEach(k => localStorage.removeItem(k));
  S.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  S.name = e => ((e.nom || '') + ' ' + (e.prenom || '')).trim();
  S.byName = (a, b) => S.name(a).localeCompare(S.name(b), 'fr');
  S.fmtDuration = ms => {
    const m = Math.floor(ms / 60000), s = Math.floor((ms % 60000) / 1000);
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  };
  S.toast = msg => {
    const n = document.createElement('div');
    n.className = 'toast'; n.textContent = msg;
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 3500);
  };

  /* ── Import de la base élèves : fichier Mes Apps EPS (.xlsx) ou export Pronote (.csv) ── */
  S.importFile = async file => {
    if (/\.xlsx$/i.test(file.name) || /spreadsheetml/.test(file.type)) {
      const csv = EPSXLSX.elevesToCSV(await EPSXLSX.read(await file.arrayBuffer()));
      return EPS.importCSV(new File([csv], file.name, { type: 'text/csv' }));
    }
    return EPS.importCSV(file);
  };

  /* ── Colonne de la séance dans ext.statobs : « 2026-10-31 14h05 Basket » ── */
  S.field = cfg => {
    const d = new Date(cfg.id), p = n => String(n).padStart(2, '0');
    const act = String(cfg.activite || '').replace(/[_;"\r\n]+/g, ' ').trim();
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}h${p(d.getMinutes())} ${act}`.trim();
  };
  const who = list => list.map(o => o.classe ? `${o.nom} (${o.classe})` : o.nom).join(', ');

  S.playerValue = (f, pid) => {
    const B = StatObsBilan, acts = B.actsOf(f, pid), r = B.coach({ nom: '', activite: f.activite, acts, ms: B.msOf(f) });
    const obs = acts.map(a => `${a.label} (${a.polarity === 'negative' ? '-' : '+'}) : ${a.count}`).join(' ; ');
    return `${obs} | durée ${f.duration} | observé par ${who(f.observateurs)} | ${r.niveau}${r.prio ? ' · priorité : ' + r.prio.label : ''}`;
  };
  S.observerValue = f => 'Observateur de ' + who(f.joueurs);

  S.history = () => S.read(HIST) || [];

  /* Enregistre la séance : détail dans l'historique + résumé dans la base élèves partagée */
  S.saveSession = async f => {
    const h = S.history().filter(x => x.id !== f.id); h.push(f); h.sort((a, b) => a.id - b.id); S.write(HIST, h);
    const field = S.field(f);
    let ok = 0, fail = 0;
    const jobs = f.joueurs.map(p => [p.id, S.playerValue(f, p.id)]).concat(f.observateurs.map(o => [o.id, S.observerValue(f)]));
    for (const [id, value] of jobs) {
      try { await EPS.setExt(APP, id, { [field]: value }); ok++; } catch (e) { fail++; }
    }
    return { field, ok, fail };
  };

  S.countSessions = async () => {
    const set = new Set(S.history().map(S.field));
    try { (await EPS.all()).forEach(e => Object.keys((e.ext && e.ext[APP]) || {}).forEach(k => set.add(k))); } catch (e) {}
    return set.size;
  };

  /* ── Export .xlsx au format type Mes Apps EPS : Élèves + statobs (lignes) + _meta ── */
  S.exportXlsx = async () => {
    const B = StatObsBilan, base = await EPS.all(), byId = new Map(base.map(e => [e.id, e]));
    const ident = (p) => { const e = byId.get(p.id); return e ? [e.nom, e.prenom, e.naissance, e.classe] : [p.nom, '', '', p.classe || '']; };
    const rows = [], hist = S.history(), done = new Set(hist.map(S.field));
    for (const f of hist) {
      f.joueurs.forEach(p => rows.push(ident(p).concat(B.sheetCells(f, p.id, 'Pratiquant', { observateurs: who(f.observateurs), observes: p.nom }))));
      f.observateurs.forEach(o => rows.push(ident(o).concat(B.sheetCells(f, o.id, 'Observateur', { observateurs: o.nom, observes: who(f.joueurs) }))));
    }
    /* Séances plus anciennes, connues seulement par leur résumé dans la base élèves */
    base.forEach(e => Object.entries((e.ext && e.ext[APP]) || {}).forEach(([k, v]) => {
      if (done.has(k)) return;
      const m = /^(\d{4}-\d{2}-\d{2}) (\d{2})h(\d{2}) ?(.*)$/.exec(k) || [];
      const obs = String(v).startsWith('Observateur');
      const r = [e.nom, e.prenom, e.naissance, e.classe, m[1] || k, m[2] ? `${m[2]}:${m[3]}` : '', m[4] || '', obs ? 'Observateur' : 'Pratiquant'];
      r[4 + 14] = String(v); rows.push(Array.from(r, x => x == null ? '' : x));
    }));
    rows.sort((a, b) => (a[4] + a[5]).localeCompare(b[4] + b[5]) || String(a[3]).localeCompare(String(b[3]), 'fr', { numeric: true }) || String(a[0]).localeCompare(String(b[0]), 'fr'));
    const nObs = Math.max(0, ...hist.map(f => f.items.length));
    const eleves = [...base].sort((a, b) => String(a.classe).localeCompare(String(b.classe), 'fr', { numeric: true }) || S.byName(a, b))
      .map(e => [e.nom, e.prenom, e.naissance, e.classe, e.regime]);
    const blob = EPSXLSX.build([
      { name: 'Élèves', rows: [['Nom', 'Prénom', 'Né(e) le', 'Classe', 'Régime'], ...eleves] },
      { name: APP, rows: [['Nom', 'Prénom', 'Né(e) le', 'Classe', ...B.header(nObs)], ...rows] },
      { name: '_meta', hidden: true, rows: [['Feuille', 'Application', 'Mode'], [APP, APP, 'lignes']] }
    ]);
    await EPSXLSX.save(blob, 'Mes_Apps_EPS_StatObs_' + B.dateOf({ id: Date.now() }) + '.xlsx');
  };

  /* ── PWA : service worker, bouton d'installation (Android/PC), aide iOS ── */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(e => console.warn('SW', e)));
  }
  let deferred = null;
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault(); deferred = e;
    const b = document.getElementById('installBtn'); if (b) b.hidden = false;
  });
  window.addEventListener('appinstalled', () => { const b = document.getElementById('installBtn'); if (b) b.hidden = true; });
  document.addEventListener('DOMContentLoaded', () => {
    const b = document.getElementById('installBtn');
    if (b) b.addEventListener('click', async () => { if (!deferred) return; deferred.prompt(); await deferred.userChoice; deferred = null; b.hidden = true; });
    const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const h = document.getElementById('iosHint');
    if (h && ios && !standalone) h.hidden = false;
  });
})();
