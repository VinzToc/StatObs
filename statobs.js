/* StatObs (Mes Apps EPS, version prof) – fonctions communes : séance en cours,
   enregistrement dans la base Mes Apps EPS (eps-core.js v2.2, mode « lignes »),
   import des sauvegardes StatObs (fichiers élèves ou export général), export .xlsx,
   installation PWA. 100 % local. */
(function () {
  'use strict';

  const APP = 'statobs';                      // identifiant de l'app (apps.json, ext.statobs, feuille « statobs »)
  const K = { config: 'statobsConfig', counts: 'statobsCounts', cur: 'statobsCurrent', final: 'statobsFinal' };
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

  const who = list => list.map(o => o.classe ? `${o.nom} (${o.classe})` : o.nom).join(', ');

  /* Une ligne de la feuille « statobs » sous forme d'objet {colonne: valeur} (cases vides omises,
     pour qu'un export puis un réimport ne crée pas de doublon) */
  function ligne(f, pid, role, w) {
    const B = StatObsBilan, cells = B.sheetCells(f, pid, role, w), head = B.header(f.items.length), o = {};
    cells.forEach((v, i) => {
      if (v == null) return;
      if (typeof v === 'string') { v = v.trim(); if (!v) return; }
      o[head[i]] = v;
    });
    return o;
  }

  /* Enregistre la séance dans la base Mes Apps EPS : une ligne par pratiquant et par observateur */
  S.saveSession = async f => {
    let ok = 0, fail = 0;
    const jobs = f.joueurs.map(p => [p.id, ligne(f, p.id, 'Pratiquant', { observateurs: who(f.observateurs), observes: p.nom })])
      .concat(f.observateurs.map(o => [o.id, ligne(f, o.id, 'Observateur', { observateurs: o.nom, observes: who(f.joueurs) })]));
    for (const [id, l] of jobs) {
      try { await EPS.addLigne(APP, id, l); ok++; } catch (e) { fail++; }
    }
    return { ok, fail };
  };

  const lignes = e => { const d = (e.ext || {})[APP]; return d && Array.isArray(d.lignes) ? d.lignes : []; };

  S.countSessions = async () => {
    const set = new Set();
    (await EPS.all()).forEach(e => lignes(e).forEach(l => set.add([l.Date, l.Heure, l['Activité']].join('|'))));
    return set.size;
  };

  /* Import d'une sauvegarde StatObs : fichier d'un élève (StatObs Élèves) ou export général StatObs.
     Seule la feuille « statobs » est lue : la liste des élèves de Mes Apps EPS n'est jamais modifiée. */
  S.importSave = async file => {
    const sheets = await EPSXLSX.read(await file.arrayBuffer());
    const n = s => StatObsBilan.norm(s);
    const meta = sheets.find(s => s.name === '_meta');
    let name = APP;
    if (meta) { const r = meta.rows.find(r => n(r[1]) === APP); if (r) name = String(r[0]); }
    const sh = sheets.find(s => s.name === name) || sheets.find(s => n(s.name) === APP);
    if (!sh || sh.rows.length < 2) throw new Error(`« ${file.name} » n'est pas une sauvegarde StatObs (feuille « statobs » absente ou vide).`);
    const rows = sh.rows.filter(r => r && r.some(v => v !== ''));
    const before = (await EPS.all()).reduce((s, e) => s + lignes(e).length, 0);
    const buf = await EPSXLSX.build([{ name: APP, rows }, { name: '_meta', hidden: true, rows: [['Feuille', 'Application', 'Mode'], [APP, APP, 'lignes']] }]).arrayBuffer();
    const r = await EPS.importXLSX(buf, file.name);
    const after = (await EPS.all()).reduce((s, e) => s + lignes(e).length, 0);
    return { lues: rows.length - 1, ajoutees: after - before, ignorees: r.ign || 0 };
  };

  /* Export .xlsx au format Mes Apps EPS : Élèves + statobs (lignes) + _meta */
  S.exportXlsx = async () => {
    const bytes = await EPS.exportXLSX({ apps: [APP] });
    await EPSXLSX.save(new Blob([bytes], { type: EPS.XLSX_MIME }), 'StatObs_export_' + StatObsBilan.dateOf({ id: Date.now() }) + '.xlsx');
  };

  /* Reprise des séances enregistrées par les versions précédentes (historique local + colonnes ext.statobs) */
  S.migrate = async () => {
    const old = S.read('statobsHistory');
    if (Array.isArray(old)) { for (const f of old) { try { await S.saveSession(f); } catch (e) {} } localStorage.removeItem('statobsHistory'); }
    const L = await EPS.all(), touched = [];
    for (const e of L) {
      const d = (e.ext || {})[APP]; if (!d) continue;
      const keys = Object.keys(d).filter(k => k !== 'lignes'); if (!keys.length) continue;
      const add = keys.map(k => {
        const m = /^(\d{4}-\d{2}-\d{2}) (\d{2})h(\d{2}) ?(.*)$/.exec(k) || [], v = String(d[k]);
        const o = { Date: m[1] || k, Heure: m[2] ? `${m[2]}:${m[3]}` : '', 'Activité': m[4] || '', 'Rôle': v.startsWith('Observateur') ? 'Observateur' : 'Pratiquant', 'Bilan du coach': v };
        Object.keys(o).forEach(c => { if (o[c] === '') delete o[c]; });
        return o;
      });
      const have = new Set((d.lignes || []).map(l => [l.Date, l.Heure, l['Activité'], l['Rôle']].join('|')));
      e.ext[APP] = { lignes: (d.lignes || []).concat(add.filter(o => !have.has([o.Date, o.Heure, o['Activité'], o['Rôle']].join('|')))) };
      touched.push(e);
    }
    if (touched.length) {
      const db = await EPS.open();
      await new Promise((ok, ko) => { const t = db.transaction('eleves', 'readwrite'), o = t.objectStore('eleves'); touched.forEach(e => o.put(e)); t.oncomplete = ok; t.onerror = () => ko(t.error); });
    }
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
