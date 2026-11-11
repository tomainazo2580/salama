/* ============================================================
   SALAMA — activation.js (v0.18)
   Verrou d'activation : 1 clé unique par appareil.
   Fichier autonome : il s'injecte tout seul dans la page.
   ============================================================ */

(function () {

  /* ⚠️ cleAttendue() doit rester IDENTIQUE dans generateur.html */

  function normaliserId(id) {
    var brut = (id || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (brut.length === 11 && brut.indexOf('SLM') === 0) {
      return brut.slice(0, 3) + '-' + brut.slice(3, 7) + '-' + brut.slice(7, 11);
    }
    return null;
  }

  function cleAttendue(id) {
    var h = 7;
    for (var i = 0; i < id.length; i++) {
      h = (h * 33 + id.charCodeAt(i)) % 1000000;
    }
    h = (h * 13 + 5107) % 1000000;
    var n = '000000' + h;
    n = n.slice(n.length - 6);
    return n.slice(0, 3) + '-' + n.slice(3);
  }

  function genererIdAppareil() {
    var lettres = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    var id = 'SLM-';
    for (var i = 0; i < 4; i++) id += lettres.charAt(Math.floor(Math.random() * lettres.length));
    id += '-';
    for (var j = 0; j < 4; j++) id += lettres.charAt(Math.floor(Math.random() * lettres.length));
    return id;
  }

  function idAppareil() {
    var id = null;
    try { id = localStorage.getItem('salama_appareil_id'); } catch (e) {}
    if (!normaliserId(id)) {
      id = genererIdAppareil();
      try { localStorage.setItem('salama_appareil_id', id); } catch (e) {}
    }
    return id;
  }
     /* Déjà activé sur cet appareil ? Alors on ne fait rien. */
  var dejaActif = false;
  try { dejaActif = (localStorage.getItem('salama_active') === 'oui'); } catch (e) {}
  if (dejaActif) return;

  var monId = idAppareil();

  var ecran = document.createElement('div');
  ecran.id = 'ecranActivation';
  ecran.setAttribute('style',
    'position:fixed;top:0;left:0;right:0;bottom:0;z-index:99999;' +
    'background:linear-gradient(135deg,#0e7a5f,#0b5f4a);' +
    'display:flex;align-items:center;justify-content:center;' +
    'padding:20px;font-family:-apple-system,Roboto,Arial,sans-serif;');

  ecran.innerHTML =
    '<div style="background:#ffffff;border-radius:18px;padding:28px 22px;max-width:360px;width:100%;' +
    'box-shadow:0 10px 30px rgba(0,0,0,.35);text-align:center;color:#222;">' +
    '<div style="font-size:44px;color:#c0392b;line-height:1;">✚</div>' +
    '<div style="font-size:26px;font-weight:700;color:#0b5f4a;margin:6px 0 2px;">Salama</div>' +
    '<div style="font-size:13px;color:#666;margin-bottom:18px;">Outil familial de santé</div>' +
    '<div style="font-size:14px;color:#444;margin-bottom:10px;">Cet appareil n\'est pas encore activé.<br>' +
    'Envoie cet <b>ID</b> par <a href="https://tomainazo2580.github.io/tsiky/" target="_blank" style="color:#0e7a5f;font-weight:700;">💬 Tsiky</a> (la messagerie malgache gratuite 🇲🇬) au <b>034 39 949 07</b> pour recevoir ta clé :</div>' +
    '<div style="font-size:20px;font-weight:700;letter-spacing:2px;color:#0b5f4a;' +
    'background:#eef7f4;border:1px solid #cfe5de;border-radius:10px;padding:10px;margin-bottom:8px;">' + monId + '</div>' +
    '<button id="actiCopier" style="background:none;border:1px solid #0e7a5f;color:#0e7a5f;border-radius:8px;' +
    'padding:6px 14px;font-size:13px;margin-bottom:16px;cursor:pointer;">📋 Copier l\'ID</button>' +
    '<input id="actiCle" type="text" inputmode="numeric" autocomplete="off" placeholder="Clé : 000-000" maxlength="7" ' +
    'style="width:100%;box-sizing:border-box;font-size:20px;text-align:center;letter-spacing:3px;padding:10px;' +
    'border:2px solid #0e7a5f;border-radius:10px;margin-bottom:10px;outline:none;">' +
    '<button id="actiBouton" style="width:100%;background:#0e7a5f;color:#fff;border:none;border-radius:10px;' +
    'padding:13px;font-size:16px;font-weight:700;cursor:pointer;">🔓 Activer</button>' +
    '<div id="actiErreur" style="display:none;color:#c0392b;font-size:13px;margin-top:10px;">❌ Clé incorrecte pour cet appareil.</div>' +
    '</div>';
     function demarrer() {
    document.body.appendChild(ecran);

    var champ = document.getElementById('actiCle');
    var erreur = document.getElementById('actiErreur');

    champ.addEventListener('input', function () {
      var v = champ.value.replace(/[^0-9]/g, '').slice(0, 6);
      champ.value = (v.length > 3) ? v.slice(0, 3) + '-' + v.slice(3) : v;
      erreur.style.display = 'none';
    });

    champ.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') essayer();
    });

    document.getElementById('actiBouton').addEventListener('click', essayer);

    function essayer() {
      var saisie = champ.value.replace(/[^0-9]/g, '');
      var bonne = cleAttendue(monId).replace(/[^0-9]/g, '');
      if (saisie.length === 6 && saisie === bonne) {
        try { localStorage.setItem('salama_active', 'oui'); } catch (e) {}
        ecran.style.transition = 'opacity .4s';
        ecran.style.opacity = '0';
        setTimeout(function () {
          if (ecran.parentNode) ecran.parentNode.removeChild(ecran);
        }, 420);
      } else {
        erreur.style.display = 'block';
        champ.value = '';
        champ.focus();
      }
    }

    document.getElementById('actiCopier').addEventListener('click', function () {
      var btn = this;
      function ok() {
        btn.textContent = '✅ ID copié !';
        setTimeout(function () { btn.textContent = '📋 Copier l\'ID'; }, 2000);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(monId).then(ok, ok);
      } else {
        var zone = document.createElement('textarea');
        zone.value = monId;
        document.body.appendChild(zone);
        zone.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(zone);
        ok();
      }
    });
  }

  if (document.body) demarrer();
  else document.addEventListener('DOMContentLoaded', demarrer);

})();
    '<div style="font-size:11px;color:#999;margin-top:14px;">Découvre <a href="https://tomainazo2580.github.io/tsiky/" target="_blank" style="color:#0e7a5f;font-weight:600;">Tsiky</a>, la messagerie malgache gratuite 🇲🇬</div>' +
