/* Enregistrement du service worker, bouton d'installation,
   et renvoi des données Google Sheets en attente. */
(function () {
  'use strict';

  // ── Service worker ──
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function (e) {
        console.warn('Service worker non enregistré :', e);
      });
    });
  }

  // ── Bouton « Installer l'application » (page d'accueil) ──
  var deferredPrompt = null;
  var btn = document.getElementById('installBtn');

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    if (btn) btn.hidden = false;
  });

  if (btn) {
    btn.addEventListener('click', async function () {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      btn.hidden = true;
    });
  }

  window.addEventListener('appinstalled', function () { if (btn) btn.hidden = true; });

  // ── File d'attente Google Sheets (envois faits hors ligne) ──
  var QKEY = 'pendingSheets';

  function readQ() {
    try { return JSON.parse(localStorage.getItem(QKEY)) || []; } catch (e) { return []; }
  }
  function writeQ(q) {
    try { localStorage.setItem(QKEY, JSON.stringify(q)); } catch (e) {}
  }

  window.queueSheetSend = function (url, data, ts) {
    var q = readQ();
    if (!q.some(function (i) { return i.ts === ts; })) {
      q.push({ url: url, data: data, ts: ts });
      writeQ(q);
    }
  };

  function toast(msg) {
    var n = document.createElement('div');
    n.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#2ecc71;color:#fff;padding:12px 20px;border-radius:12px;box-shadow:0 8px 25px rgba(0,0,0,.25);z-index:10000;font:600 0.95em system-ui,sans-serif;';
    n.textContent = msg;
    document.body.appendChild(n);
    setTimeout(function () { n.remove(); }, 4000);
  }

  function flush() {
    if (!navigator.onLine) return;
    var q = readQ();
    if (!q.length) return;
    var item = q[0];
    var fd = new FormData();
    fd.append('data', JSON.stringify(item.data));
    fetch(item.url, { method: 'POST', mode: 'no-cors', body: fd }).then(function () {
      writeQ(readQ().filter(function (i) { return i.ts !== item.ts; }));
      try {
        var f = JSON.parse(localStorage.getItem('observationFinalData'));
        if (f && String(f.timestamp) === item.ts) localStorage.setItem('sheetSentFor', item.ts);
      } catch (e) {}
      toast('✓ Séance en attente envoyée à Google Sheets');
      flush();
    }).catch(function () { /* on réessaiera plus tard */ });
  }

  window.addEventListener('online', flush);
  window.addEventListener('load', flush);
})();
