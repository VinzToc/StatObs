/* eps-xlsx.js — lecture / écriture de classeurs .xlsx, 100 % local et hors ligne.
   Écriture au format type « Mes Apps EPS » : feuille « Élèves », une feuille par
   application (mode « lignes »), feuille cachée « _meta », cellules inlineStr,
   archive zip non compressée, en-têtes en gras sur fond bleu clair. */
(function () {
  'use strict';
  const enc = new TextEncoder();

  /* ── CRC32 + zip « stored » ── */
  const CRC = (() => { const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
    return t; })();
  const crc32 = b => { let c = ~0; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (~c) >>> 0; };

  function zip(files) {
    const d = new Date();
    const time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
    const date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    const parts = [], central = []; let off = 0;
    for (const f of files) {
      const name = enc.encode(f.name), data = typeof f.data === 'string' ? enc.encode(f.data) : f.data, crc = crc32(data);
      const h = new DataView(new ArrayBuffer(30));
      h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true);
      h.setUint16(10, time, true); h.setUint16(12, date, true); h.setUint32(14, crc, true);
      h.setUint32(18, data.length, true); h.setUint32(22, data.length, true); h.setUint16(26, name.length, true); h.setUint16(28, 0, true);
      parts.push(new Uint8Array(h.buffer), name, data);
      const c = new DataView(new ArrayBuffer(46));
      c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint16(10, 0, true);
      c.setUint16(12, time, true); c.setUint16(14, date, true); c.setUint32(16, crc, true);
      c.setUint32(20, data.length, true); c.setUint32(24, data.length, true); c.setUint16(28, name.length, true);
      c.setUint32(42, off, true);
      central.push(new Uint8Array(c.buffer), name);
      off += 30 + name.length + data.length;
    }
    const csize = central.reduce((s, a) => s + a.length, 0);
    const e = new DataView(new ArrayBuffer(22));
    e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true);
    e.setUint32(12, csize, true); e.setUint32(16, off, true);
    return new Blob([...parts, ...central, new Uint8Array(e.buffer)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  /* ── Écriture ── */
  const x = s => String(s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const col = i => { let s = ''; i++; while (i) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = (i - m - 1) / 26; } return s; };
  const HEAD = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
  const NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';

  function sheetXml(rows) {
    const n = Math.max(0, ...rows.map(r => r.length));
    const w = Array.from({ length: n }, (_, j) => {
      const m = Math.max(0, ...rows.map(r => r[j] == null ? 0 : Math.max(...String(r[j]).split('\n').map(l => l.length))));
      return Math.max(8, Math.min(60, m + 2));
    });
    let s = HEAD + `<worksheet xmlns="${NS}"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>`;
    if (n) s += '<cols>' + w.map((v, j) => `<col min="${j + 1}" max="${j + 1}" width="${v}" customWidth="1"/>`).join('') + '</cols>';
    s += '<sheetData>';
    rows.forEach((r, i) => {
      s += `<row r="${i + 1}">`;
      r.forEach((v, j) => {
        if (v == null || v === '') return;
        const ref = col(j) + (i + 1), st = i === 0 ? ' s="1"' : '';
        if (typeof v === 'number' && isFinite(v)) s += `<c r="${ref}"${st}><v>${v}</v></c>`;
        else s += `<c r="${ref}"${st} t="inlineStr"><is><t xml:space="preserve">${x(v)}</t></is></c>`;
      });
      s += '</row>';
    });
    return s + '</sheetData></worksheet>';
  }

  const STYLES = HEAD + `<styleSheet xmlns="${NS}"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFDDEBFF"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;

  /* sheets : [{ name, rows: [[en-têtes], [valeurs]…], hidden }] → Blob .xlsx */
  function build(sheets) {
    const R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
    const files = [
      { name: '[Content_Types].xml', data: HEAD + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
        sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('') + '</Types>' },
      { name: '_rels/.rels', data: HEAD + `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${R}/officeDocument" Target="xl/workbook.xml"/></Relationships>` },
      { name: 'xl/workbook.xml', data: HEAD + `<workbook xmlns="${NS}" xmlns:r="${R}"><sheets>` +
        sheets.map((s, i) => `<sheet name="${x(s.name.slice(0, 31))}" sheetId="${i + 1}"${s.hidden ? ' state="hidden"' : ''} r:id="rId${i + 1}"/>`).join('') + '</sheets></workbook>' },
      { name: 'xl/_rels/workbook.xml.rels', data: HEAD + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="${R}/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('') +
        `<Relationship Id="rId${sheets.length + 1}" Type="${R}/styles" Target="styles.xml"/></Relationships>` },
      { name: 'xl/styles.xml', data: STYLES }
    ];
    sheets.forEach((s, i) => files.push({ name: `xl/worksheets/sheet${i + 1}.xml`, data: sheetXml(s.rows) }));
    return zip(files);
  }

  /* ── Lecture ── */
  async function inflate(bytes) {
    if (typeof DecompressionStream === 'undefined') throw new Error('Ce navigateur ne sait pas lire ce fichier .xlsx compressé : enregistrez-le en CSV.');
    const s = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return new Uint8Array(await new Response(s).arrayBuffer());
  }
  async function unzip(buf) {
    const u = new Uint8Array(buf), v = new DataView(buf); let e = -1;
    for (let i = u.length - 22; i >= Math.max(0, u.length - 65557); i--) if (v.getUint32(i, true) === 0x06054b50) { e = i; break; }
    if (e < 0) throw new Error('Fichier .xlsx illisible.');
    const n = v.getUint16(e + 10, true); let p = v.getUint32(e + 16, true); const out = {};
    const dec = new TextDecoder();
    for (let k = 0; k < n; k++) {
      const meth = v.getUint16(p + 10, true), csz = v.getUint32(p + 20, true), nl = v.getUint16(p + 28, true),
            xl = v.getUint16(p + 30, true), cl = v.getUint16(p + 32, true), lo = v.getUint32(p + 42, true);
      const name = dec.decode(u.subarray(p + 46, p + 46 + nl));
      const ds = lo + 30 + v.getUint16(lo + 26, true) + v.getUint16(lo + 28, true);
      const raw = u.subarray(ds, ds + csz);
      out[name] = { meth, raw };
      p += 46 + nl + xl + cl;
    }
    return { async text(name) { const f = out[name]; if (!f) return null; return dec.decode(f.meth === 8 ? await inflate(f.raw) : f.raw); } };
  }
  const tags = (node, t) => [...node.getElementsByTagNameNS('*', t)];
  const txt = node => tags(node, 't').map(t => t.textContent).join('');
  const colIdx = ref => { let n = 0; for (const ch of ref.replace(/\d+/g, '')) n = n * 26 + ch.charCodeAt(0) - 64; return n - 1; };

  /* → [{ name, hidden, rows: [[…]] }] (les nombres restent des nombres) */
  async function read(buf) {
    const z = await unzip(buf), P = new DOMParser(), xml = async n => { const t = await z.text(n); return t ? P.parseFromString(t, 'application/xml') : null; };
    const wb = await xml('xl/workbook.xml'); if (!wb) throw new Error('Ce fichier n\'est pas un classeur Excel.');
    const rels = await xml('xl/_rels/workbook.xml.rels'), map = {};
    if (rels) tags(rels, 'Relationship').forEach(r => { map[r.getAttribute('Id')] = r.getAttribute('Target'); });
    const ssx = await xml('xl/sharedStrings.xml'), ss = ssx ? tags(ssx, 'si').map(txt) : [];
    const res = [];
    for (const s of tags(wb, 'sheet')) {
      const rid = s.getAttribute('r:id') || s.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id');
      let tg = map[rid] || ''; tg = tg.startsWith('/') ? tg.slice(1) : 'xl/' + tg;
      const sx = await xml(tg); if (!sx) continue;
      const rows = [];
      tags(sx, 'row').forEach(r => {
        const row = [];
        tags(r, 'c').forEach((c, j) => {
          const ref = c.getAttribute('r'), i = ref ? colIdx(ref) : j, t = c.getAttribute('t');
          const vv = tags(c, 'v')[0], val = vv ? vv.textContent : '';
          row[i] = t === 's' ? (ss[+val] || '') : t === 'inlineStr' ? txt(c) : t === 'str' || t === 'b' || t === 'e' ? val : (val === '' ? '' : +val);
        });
        rows[(+r.getAttribute('r') || rows.length + 1) - 1] = Array.from(row, v => v == null ? '' : v);
      });
      res.push({ name: s.getAttribute('name'), hidden: s.getAttribute('state') === 'hidden', rows: Array.from(rows, r => r || []) });
    }
    return res;
  }

  const serialToFr = n => { const d = new Date(Math.round((n - 25569) * 864e5)); const p = k => String(k).padStart(2, '0');
    return `${p(d.getUTCDate())}/${p(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`; };

  /* Feuille « Élèves » d'un classeur Mes Apps EPS → texte CSV (pour EPS.importCSV) */
  function elevesToCSV(sheets) {
    const nm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const sh = sheets.find(s => nm(s.name) === 'eleves') || sheets.find(s => !s.hidden && s.rows.some(r => r.some(v => nm(v) === 'classe'))) || sheets[0];
    if (!sh) throw new Error('Feuille « Élèves » introuvable.');
    const hi = sh.rows.findIndex(r => r.some(v => nm(v) === 'classe'));
    const dateCols = hi >= 0 ? sh.rows[hi].map((v, j) => /^(ne|nee|naissance|datedenaissance)/.test(nm(v)) ? j : -1).filter(j => j >= 0) : [];
    const q = v => '"' + String(v).replace(/"/g, '""') + '"';
    return sh.rows.map((r, i) => r.map((v, j) => (i > hi && dateCols.includes(j) && typeof v === 'number' && v > 59) ? serialToFr(v) : v).map(q).join(';')).join('\r\n');
  }

  /* Téléchargement (partage natif sur iPhone / iPad) */
  async function save(blob, name) {
    const file = new File([blob], name, { type: blob.type });
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (ios && navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: name }); return; }
      catch (e) { if (e && e.name === 'AbortError') return; }
    }
    const url = URL.createObjectURL(file), a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  window.EPSXLSX = { build, read, elevesToCSV, save, crc32 };
})();
