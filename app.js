/* ============================================================
   SALAMA — app.js (v1.0)
   Rebuild propre — Design B « Chaleur malgache »
   data.js et activation.js restent inchangés.
   ============================================================ */

/* ================= Aides génériques ================= */
function $(id) { return document.getElementById(id); }

function echapper(t) {
  return String(t == null ? '' : t)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function sansAccents(t) {
  return String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function lireCle(cle, defaut) {
  try { var v = localStorage.getItem(cle); return (v === null || v === undefined) ? defaut : v; }
  catch (e) { return defaut; }
}
function ecrireCle(cle, val) { try { localStorage.setItem(cle, String(val)); } catch (e) {} }

function dateLisible(iso) {
  var d = new Date(iso);
  if (isNaN(d.getTime())) return echapper(iso);
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

/* ================= Règles grossesse ================= */
var AINS_GROSSESSE = ['ibuprofene', 'aspirine'];        /* ⛔ interdits */
var OK_GROSSESSE = ['serum', 'sro', 'antiseptique'];    /* ✅ sans souci */

/* ================= Profils ================= */
function lireProfils() {
  try {
    var v = JSON.parse(lireCle('salama_profils', '[]'));
    return Array.isArray(v) ? v : [];
  } catch (e) { return []; }
}
function ecrireProfils(liste) { ecrireCle('salama_profils', JSON.stringify(liste)); }

function profilActif() {
  var nom = lireCle('salama_profil_actif', '');
  if (!nom) return null;
  var liste = lireProfils();
  for (var i = 0; i < liste.length; i++) {
    if (liste[i] && liste[i].nom === nom) return liste[i];
  }
  return null;
}

function sexeCode(s) {
  var v = String(s || '').toLowerCase();
  if (v === 'h' || v === 'm' || v === 'homme' || v === 'masculin') return 'm';
  if (v === 'f' || v === 'femme' || v === 'féminin' || v === 'feminin') return 'f';
  return '';
}

function ageDe(p) {
  if (!p) return null;
  if (p.naissancePrecise) {
    var d = new Date(p.naissancePrecise);
    if (!isNaN(d.getTime())) {
      var ans = (Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000);
      if (ans >= 0) return ans;
    }
  }
  if (p.naissance) {
    var annee = parseInt(p.naissance, 10);
    var actuelle = new Date().getFullYear();
    if (annee > 1900 && annee <= actuelle) return actuelle - annee;
  }
  return null;
}

function ageTexte(p) {
  var a = ageDe(p);
  if (a === null) return '';
  if (a < 2) {
    var mois = Math.round(a * 12);
    return mois === 0 ? 'nouveau-né' : mois + ' mois';
  }
  var n = Math.floor(a);
  return n + (n > 1 ? ' ans' : ' an');
}

/* ================= Symptômes ================= */
var coches = new Set();
var dureeSymptomes = 'aujourdhui';

function construireListeSymptomes() {
  var q = sansAccents($('rechercheSymptomes').value);
  var mots = q.split(/\s+/).filter(Boolean);
  var html = '';
  var total = 0;
  categoriesSymptomes.forEach(function (cat) {
    var titreCible = sansAccents(cat.nom);
    var catMatch = mots.every(function (m) { return titreCible.indexOf(m) !== -1; });
    var visibles = cat.symptomes.filter(function (s) {
      if (catMatch) return true;
      var cible = sansAccents(s.nom);
      return mots.every(function (m) { return cible.indexOf(m) !== -1; });
    });
    if (!visibles.length) return;
    total += visibles.length;
    html += '<h3>' + cat.nom + '</h3>';
    visibles.forEach(function (s) {
      var coche = coches.has(s.id) ? ' checked' : '';
      html += '<label><input type="checkbox" data-sym="' + s.id + '"' + coche + '> ' + s.nom + '</label>';
    });
  });
  $('listeSymptomes').innerHTML = html;
  $('aucunSymptome').classList.toggle('visible', total === 0);
  majCompteur();
}

function majCompteur() {
  var n = coches.size;
  $('compteurSymptomes').textContent = n === 0 ? '' : n + ' symptôme' + (n > 1 ? 's' : '') + ' coché' + (n > 1 ? 's' : '');
}

function toutDecocher() {
  coches.clear();
  construireListeSymptomes();
  $('resultats').innerHTML = '';
}

function resetSymptomes() {
  coches.clear();
  dureeSymptomes = 'aujourdhui';
  $('dureeSymptomes').value = 'aujourdhui';
  $('rechercheSymptomes').value = '';
  $('resultats').innerHTML = '';
  construireListeSymptomes();
}

/* ================= Analyse ================= */
function analyser() {
  var res = $('resultats');
  var ids = Array.from(coches);
  if (!ids.length) {
    res.innerHTML = '<div class="carte info"><p>Coche au moins un symptôme, puis tape sur la loupe 🔍 en bas à droite.</p></div>';
    return;
  }
  var p = profilActif();
  var age = ageDe(p);
  var html = '';

  /* 1. Drapeaux rouges (priorité absolue) */
  var draps = drapeauxRouges.filter(function (d) {
    if (d.id === 'fievre_3jours' && dureeSymptomes !== 'plus3') return false;
    if (d.age_max !== undefined && (age === null || age > d.age_max)) return false;
    return d.symptomes.every(function (s) { return ids.indexOf(s) !== -1; });
  });
  draps.forEach(function (d) {
    html += '<div class="carte grave"><h3>' + d.nom + '</h3><p>' + d.message + '</p></div>';
  });

  /* 2. Score de chaque maladie : 65 % couverture + 35 % spécificité, plafond 95 % */
  var poidsMax = {};
  TROUBLES.forEach(function (t) {
    for (var sid in t.symptomes) {
      if (t.symptomes[sid] > (poidsMax[sid] || 0)) poidsMax[sid] = t.symptomes[sid];
    }
  });
  var totalCoches = 0;
  ids.forEach(function (id) { totalCoches += poidsMax[id] || 0; });

  var scores = [];
  TROUBLES.forEach(function (t) {
    if (t.sexe && (!p || sexeCode(p.sexe) !== t.sexe)) return;
    if (age !== null) {
      if (t.age_min !== undefined && age < t.age_min) return;
      if (t.age_max !== undefined && age > t.age_max) return;
    }
    var obtenu = 0, total = 0;
    for (var sid in t.symptomes) {
      total += t.symptomes[sid];
      if (ids.indexOf(sid) !== -1) obtenu += t.symptomes[sid];
    }
    if (!total) return;
    var couverture = obtenu / total;
    var specificite = totalCoches ? obtenu / totalCoches : 0;
    var pct = Math.min(0.65 * couverture + 0.35 * specificite, 0.95);
    pct = Math.round(pct * 100);
    if (pct >= 20) scores.push({ t: t, pct: pct });
  });
  scores.sort(function (a, b) { return b.pct - a.pct; });
  var top = scores.slice(0, 4);

  if (!top.length && !draps.length) {
    html += '<div class="carte info"><p>Pas de piste assez nette avec ces symptômes. Ajoute d\'autres symptômes ou consulte un centre de santé.</p></div>';
  }
  top.forEach(function (s) {
    html += '<div class="carte"><h3>' + echapper(s.t.nom) + ' <span class="badge badge-vert">' + s.pct + '%</span></h3>';
    if (s.t.conseils && s.t.conseils.length) {
      html += '<ul>' + s.t.conseils.map(function (c) { return '<li>' + c + '</li>'; }).join('') + '</ul>';
    }
    html += '<p class="petit">👁 ' + s.t.consulter + '</p>';
    if (s.t.medocs && s.t.medocs.length) {
      html += s.t.medocs.map(function (id) { return ligneMedoc(id, p); }).join('');
    }
    html += '</div>';
  });
  res.innerHTML = html;
  res.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function ligneMedoc(id, p) {
  var m = null;
  for (var i = 0; i < MEDICAMENTS.length; i++) {
    if (MEDICAMENTS[i].id === id) { m = MEDICAMENTS[i]; break; }
  }
  if (!m) return '';
  var extra = '';
  if (p && p.grossesse) {
    if (AINS_GROSSESSE.indexOf(id) !== -1) extra += ' <span class="badge badge-rouge">⛔ Grossesse</span>';
    else if (OK_GROSSESSE.indexOf(id) === -1) extra += ' <span class="badge badge-orange">Prudence grossesse</span>';
  }
  var age = ageDe(p);
  if (m.age_min > 0 && age !== null && age < m.age_min) {
    extra += ' <span class="badge badge-orange">Déconseillé avant ' + m.age_min + (m.age_min > 1 ? ' ans' : ' an') + '</span>';
  }
  return '<p style="margin:6px 0;">💊 <b>' + m.nom + '</b>' + extra + '</p>';
}

/* ================= Médicaments ================= */
function rendreMedocs() {
  $('listeMedocs').innerHTML = MEDICAMENTS.map(function (m) {
    return '<div class="carte" data-medoc="' + m.id + '" style="cursor:pointer;"><b>💊 ' + m.nom + '</b><p class="petit" style="margin:4px 0 0;">' + m.indication + '</p></div>';
  }).join('');
}

function ouvrirFiche(id) {
  var m = null;
  for (var i = 0; i < MEDICAMENTS.length; i++) {
    if (MEDICAMENTS[i].id === id) { m = MEDICAMENTS[i]; break; }
  }
  if (!m) return;
  var p = profilActif();
  var html = '<button data-action="retourMedocs" style="background:var(--champ);color:var(--texte2);border:1.5px solid var(--bord);box-shadow:none;padding:8px 14px;font-size:0.85rem;">← Retour à la liste</button>';
  html += '<h3 style="margin-top:14px;">💊 ' + m.nom + '</h3>';
  html += '<p class="petit">' + m.dci + '</p>';
  html += '<p><b>À quoi ça sert :</b> ' + m.indication + '</p>';
  html += '<p><b>Adulte :</b> ' + m.adulte + '</p>';
  html += '<p><b>Maximum :</b> ' + m.max + '</p>';
  if (m.enfant_mgkg && p && p.poids) {
    var dose = Math.round(m.enfant_mgkg * parseFloat(p.poids));
    html += '<p><b>Dose enfant pour ' + echapper(p.nom) + ' (' + p.poids + ' kg) :</b> environ ' + dose + ' mg par prise (' + m.enfant_mgkg + ' mg/kg)</p>';
  } else if (m.enfant_fixe) {
    html += '<p><b>Enfant :</b> ' + m.enfant_fixe + '</p>';
  }
  if (m.bebe) html += '<p><b>Bébé :</b> ' + m.bebe + '</p>';
  if (m.alertes && m.alertes.length) {
    html += '<ul>' + m.alertes.map(function (a) { return '<li>⚠️ ' + a + '</li>'; }).join('') + '</ul>';
  }
  if (m.interactions && m.interactions.length) {
    html += '<p class="petit">⚠️ Prudence si tu prends déjà : ' + m.interactions.join(', ') + '</p>';
  }
  if (p && p.grossesse) {
    if (AINS_GROSSESSE.indexOf(id) !== -1) html += '<p><span class="badge badge-rouge">⛔ DANGER pendant la grossesse</span></p>';
    else if (OK_GROSSESSE.indexOf(id) !== -1) html += '<p><span class="badge badge-vert">✅ Sans danger connu pendant la grossesse</span></p>';
    else html += '<p><span class="badge badge-orange">Prudence pendant la grossesse : demande un avis médical</span></p>';
  }
  $('ficheMedoc').innerHTML = html;
  $('ficheMedoc').hidden = false;
  $('listeMedocs').hidden = true;
  window.scrollTo(0, 0);
}

function retourMedocs() {
  $('ficheMedoc').hidden = true;
  $('listeMedocs').hidden = false;
}

/* ================= Journal ================= */
function lireJournal() {
  try {
    var v = JSON.parse(lireCle('salama_journal', '[]'));
    if (!Array.isArray(v)) return [];
    return v.filter(function (x) { return x && typeof x === 'object'; });
  } catch (e) { return []; }
}
function ecrireJournal(liste) { ecrireCle('salama_journal', JSON.stringify(liste)); }

function ajouterJournal() {
  var zone = $('texteJournal');
  var texte = zone.value.trim();
  if (!texte) return;
  var p = profilActif();
  var liste = lireJournal();
  liste.push({
    date: new Date().toISOString().slice(0, 10),
    profil: p ? p.nom : '',
    texte: texte
  });
  ecrireJournal(liste);
  zone.value = '';
  rendreJournal();
}

function supprimerJournal(idx) {
  var liste = lireJournal();
  if (idx >= 0 && idx < liste.length) {
    if (!confirm('Supprimer cette note ?')) return;
    liste.splice(idx, 1);
    ecrireJournal(liste);
    rendreJournal();
  }
}

function rendreJournal() {
  var mots = sansAccents($('rechercheJournal').value).split(/\s+/).filter(Boolean);
  var tous = lireJournal();
  var paires = tous.map(function (en, i) { return { en: en, i: i }; }).reverse();
  var visibles = paires.filter(function (pa) {
    if (!mots.length) return true;
    var cible = sansAccents(pa.en.date + ' ' + (pa.en.profil || '') + ' ' + (pa.en.texte || ''));
    return mots.every(function (m) { return cible.indexOf(m) !== -1; });
  });
  var c = $('listeJournal');
  if (!visibles.length) {
    c.innerHTML = '<p class="petit">' + (mots.length ? 'Aucune note trouvée.' : 'Aucune note pour l\'instant.') + '</p>';
    return;
  }
  c.innerHTML = visibles.map(function (pa) {
    var en = pa.en;
    return '<div class="carte"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">'
      + '<div><b>📅 ' + dateLisible(en.date) + '</b>' + (en.profil ? ' <span class="petit">· 👤 ' + echapper(en.profil) + '</span>' : '')
      + '<p style="margin:6px 0 0;white-space:pre-wrap;">' + echapper(en.texte) + '</p></div>'
      + '<button data-action="supprimerJournal" data-idx="' + pa.i + '" aria-label="Supprimer" style="background:var(--terre);padding:8px 10px;font-size:0.9rem;flex-shrink:0;">🗑</button>'
      + '</div></div>';
  }).join('');
}

/* ================= Profils ================= */
var indexEdite = null;
var grossesseChoisie = false;

function utiliserProfil(idx) {
  var profs = lireProfils();
  if (profs[idx]) {
    ecrireCle('salama_profil_actif', profs[idx].nom);
    rendreProfils();
    rendreAccueil();
  }
}

function modifierProfil(idx) {
  var profs = lireProfils();
  var p = profs[idx];
  if (!p) return;
  indexEdite = idx;
  $('pNom').value = p.nom || '';
  $('pSexe').value = sexeCode(p.sexe) === 'f' ? 'f' : 'h';
  $('pNaissance').value = p.naissance || '';
  $('pNaissancePrecise').value = p.naissancePrecise || '';
  $('pPoids').value = p.poids || '';
  grossesseChoisie = !!p.grossesse;
  majBlocGrossesse();
  $('formProfil').scrollIntoView({ behavior: 'smooth' });
}

function supprimerProfil(idx) {
  var profs = lireProfils();
  var p = profs[idx];
  if (!p) return;
  if (!confirm('Supprimer le profil « ' + p.nom + ' » ?')) return;
  profs.splice(idx, 1);
  ecrireProfils(profs);
  if (lireCle('salama_profil_actif', '') === p.nom) ecrireCle('salama_profil_actif', '');
  rendreProfils();
  rendreAccueil();
}

function majBlocGrossesse() {
  var f = $('pSexe').value === 'f';
  $('blocGrossesse').hidden = !f;
  if (!f) grossesseChoisie = false;
  marquerGrossesse();
}

function marquerGrossesse() {
  document.querySelectorAll('#groupeGrossesse button').forEach(function (b) {
    b.classList.toggle('actif', (b.dataset.val === 'oui') === grossesseChoisie);
  });
}

function choisirGrossesse(v) { grossesseChoisie = v; marquerGrossesse(); }

function enregistrerProfil(e) {
  e.preventDefault();
  var erreur = $('erreurProfil');
  function refuser(msg) { erreur.textContent = msg; erreur.hidden = false; }

  var nom = $('pNom').value.trim();
  if (!nom) { refuser('Donne un nom au profil.'); return; }

  var anneeMax = new Date().getFullYear();
  var naissance = '';
  var sAnnee = $('pNaissance').value.trim();
  if (sAnnee) {
    var a = parseInt(sAnnee, 10);
    if (isNaN(a) || a < 1900 || a > anneeMax) {
      refuser('Année de naissance invalide (entre 1900 et ' + anneeMax + ').');
      return;
    }
    naissance = a;
  }

  var poids = '';
  var sPoids = $('pPoids').value.trim();
  if (sPoids) {
    var w = parseFloat(sPoids.replace(',', '.'));
    if (isNaN(w) || w < 1 || w > 300) {
      refuser('Le poids doit être entre 1 et 300 kg.');
      return;
    }
    poids = w;
  }

  var profil = {
    nom: nom,
    sexe: $('pSexe').value,
    naissance: naissance,
    naissancePrecise: $('pNaissancePrecise').value || '',
    grossesse: $('pSexe').value === 'f' ? grossesseChoisie : false,
    poids: poids
  };

  var profs = lireProfils();
  if (indexEdite !== null && indexEdite < profs.length) {
    profs[indexEdite] = profil;
  } else {
    profs.push(profil);
    ecrireCle('salama_profil_actif', nom);
  }
  ecrireProfils(profs);

  indexEdite = null;
  $('formProfil').reset();
  grossesseChoisie = false;
  majBlocGrossesse();
  erreur.hidden = true;
  rendreProfils();
  rendreAccueil();
}

function rendreProfils() {
  var profs = lireProfils();
  var actif = lireCle('salama_profil_actif', '');
  var c = $('listeProfils');
  if (!profs.length) {
    c.innerHTML = '<p class="petit">Aucun profil pour l\'instant — crée le premier ci-dessous 👇</p>';
    return;
  }
  c.innerHTML = profs.map(function (p, i) {
    var estActif = p.nom === actif;
    var h = '<div class="carte"><b>' + (estActif ? '⭐ ' : '👤 ') + echapper(p.nom) + '</b>';
    var infos = [];
    if (ageTexte(p)) infos.push(ageTexte(p));
    if (p.grossesse) infos.push('🤰 grossesse');
    if (p.poids) infos.push(p.poids + ' kg');
    if (infos.length) h += ' <span class="petit">· ' + infos.join(' · ') + '</span>';
    h += '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;">';
    if (!estActif) h += '<button data-action="utiliserProfil" data-idx="' + i + '" style="background:var(--riziere);padding:8px 12px;font-size:0.85rem;">⭐ Utiliser</button>';
    h += '<button data-action="modifierProfil" data-idx="' + i + '" style="background:var(--champ);color:var(--texte2);border:1.5px solid var(--bord);box-shadow:none;padding:8px 12px;font-size:0.85rem;">✏️ Modifier</button>';
    h += '<button data-action="supprimerProfil" data-idx="' + i + '" style="background:var(--terre);padding:8px 12px;font-size:0.85rem;">🗑</button>';
    h += '</div></div>';
    return h;
  }).join('');
}

/* ================= Accueil ================= */
function rendreAccueil() {
  var p = profilActif();
  var c = $('profilActifAccueil');
  if (p) {
    var h = '👤 Profil actif : <b>' + echapper(p.nom) + '</b>';
    if (ageTexte(p)) h += ' · ' + ageTexte(p);
    if (p.grossesse) h += ' · 🤰';
    h += ' <button data-page="profils" style="padding:6px 12px;font-size:0.8rem;margin-left:8px;">Changer</button>';
    c.innerHTML = h;
  } else {
    c.innerHTML = '👤 Aucun profil actif <button data-page="profils" style="padding:6px 12px;font-size:0.8rem;margin-left:8px;">Créer un profil</button>';
  }
}

/* ================= Navigation ================= */
var pageActuelle = 'accueil';

function allerA(page) {
  if (page === pageActuelle) { window.scrollTo(0, 0); return; }
  /* En quittant un onglet, on efface recherches et sélections */
  if (pageActuelle === 'symptomes' && page !== 'symptomes') resetSymptomes();
  if (pageActuelle === 'journal' && page !== 'journal') {
    $('rechercheJournal').value = '';
    rendreJournal();
  }
  document.querySelectorAll('.page').forEach(function (s) { s.classList.remove('active'); });
  var cible = $('page-' + page);
  if (cible) cible.classList.add('active');
  document.querySelectorAll('nav button').forEach(function (b) {
    b.classList.toggle('active', b.dataset.page === page);
  });
  pageActuelle = page;
  $('btnFlottant').hidden = (page !== 'symptomes');
  window.scrollTo(0, 0);
  if (page === 'accueil') rendreAccueil();
  if (page === 'profils') rendreProfils();
  if (page === 'journal') rendreJournal();
  if (page === 'medocs') { $('ficheMedoc').hidden = true; $('listeMedocs').hidden = false; }
}

/* ================= Thème ================= */
function basculerTheme() {
  ecrireCle('salama_theme', lireCle('salama_theme', 'clair') === 'sombre' ? 'clair' : 'sombre');
  appliquerTheme();
}
function appliquerTheme() {
  var sombre = lireCle('salama_theme', 'clair') === 'sombre';
  document.body.classList.toggle('sombre', sombre);
  var b = $('btnTheme');
  if (b) b.textContent = sombre ? '☀️' : '🌙';
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', sombre ? '#211d17' : '#0e7a5f');
}

/* ================= Bannière d'installation ================= */
/* Petite carte d'une ligne, visible sur l'accueil uniquement.
   Fermée par ✕ → revient au bout de 7 jours.
   Après une vraie installation → disparaît pour de bon. */
var promptInstall = null;
var banniereAutorisee = false;
var JOURS_RETOUR_BANNIERE = 7;
var TEXTE_BANNIERE = 'Ajoutez Salama à votre écran d\'accueil.';

window.addEventListener('beforeinstallprompt', function (e) {
  e.preventDefault();
  promptInstall = e;
  var b = $('btnInstaller');
  if (b && $('banniere').classList.contains('visible')) b.hidden = false;
});
window.addEventListener('appinstalled', function () {
  ecrireCle('salama_installe', 'oui');
  cacherBanniere();
});

function verifierDejaInstallee() {
  if (!navigator.getInstalledRelatedApps) return Promise.resolve(false);
  return navigator.getInstalledRelatedApps().then(function (apps) {
    if (apps && apps.length) { ecrireCle('salama_installe', 'oui'); return true; }
    return false;
  }).catch(function () { return false; });
}

function montrerBanniere() {
  if (!banniereAutorisee) return;
  var b = $('banniere');
  if (!b) return;
  $('btnInstaller').hidden = !promptInstall;
  b.classList.add('visible');
}
function cacherBanniere() {
  var b = $('banniere');
  if (b) b.classList.remove('visible');
}
function installerApp() {
  if (promptInstall) {
    promptInstall.prompt();
    promptInstall.userChoice.then(function () { promptInstall = null; cacherBanniere(); });
  } else {
    /* Pas de popup natif disponible : on montre la marche à suivre quelques
       secondes dans la bannière elle-même, sans bloquer les boutons. */
    var t = $('banniereTexte');
    if (t) {
      t.textContent = 'Menu ⋮ du navigateur, puis « Installer l\'application ».';
      setTimeout(function () {
        var x = $('banniereTexte');
        if (x) x.textContent = TEXTE_BANNIERE;
      }, 6000);
    }
  }
}
function fermerBanniere() {
  banniereAutorisee = false;
  ecrireCle('salama_banniere_fermee', Date.now());
  cacherBanniere();
}
function initBanniere() {
  verifierDejaInstallee().then(function (deja) {
    if (deja) return;
    if (lireCle('salama_installe', '') === 'oui') return;
    var fermee = lireCle('salama_banniere_fermee', '');
    if (fermee) {
      /* Ancienne version ('oui') → convertie en fermeture vieille de 8 jours :
         la bannière se ré-affiche une fois pour montrer la nouvelle version. */
      var ts = (fermee === 'oui') ? (Date.now() - (JOURS_RETOUR_BANNIERE + 1) * 24 * 3600 * 1000) : parseInt(fermee, 10);
      if (isNaN(ts) || (Date.now() - ts) < JOURS_RETOUR_BANNIERE * 24 * 3600 * 1000) return;
    }
    banniereAutorisee = true;
    setTimeout(montrerBanniere, 1200);
  });
}

/* ================= Hors ligne + remonter ================= */
function majHorsLigne() {
  var h = $('horsLigne');
  if (!h) return;
  function maj() { h.classList.toggle('visible', !navigator.onLine); }
  window.addEventListener('online', maj);
  window.addEventListener('offline', maj);
  maj();
}

window.addEventListener('scroll', function () {
  $('btnRemonter').style.display = (window.scrollY > 400) ? 'block' : 'none';
});

/* ================= Délégation : un seul écouteur pour tout ================= */
document.addEventListener('click', function (e) {
  var el = e.target.closest('[data-page],[data-medoc],[data-action]');
  if (!el) return;
  if (el.dataset.page) { allerA(el.dataset.page); return; }
  if (el.dataset.medoc) { ouvrirFiche(el.dataset.medoc); return; }
  var action = el.dataset.action;
  if (action === 'analyser') analyser();
  else if (action === 'basculerTheme') basculerTheme();
  else if (action === 'toutDecocher') toutDecocher();
  else if (action === 'ajouterJournal') ajouterJournal();
  else if (action === 'supprimerJournal') supprimerJournal(parseInt(el.dataset.idx, 10));
  else if (action === 'utiliserProfil') utiliserProfil(parseInt(el.dataset.idx, 10));
  else if (action === 'modifierProfil') modifierProfil(parseInt(el.dataset.idx, 10));
  else if (action === 'supprimerProfil') supprimerProfil(parseInt(el.dataset.idx, 10));
  else if (action === 'choisirGrossesse') choisirGrossesse(el.dataset.val === 'oui');
  else if (action === 'retourMedocs') retourMedocs();
  else if (action === 'installer') installerApp();
  else if (action === 'fermerBanniere') fermerBanniere();
  else if (action === 'remonter') window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.addEventListener('change', function (e) {
  var t = e.target;
  if (t.matches('[data-sym]')) {
    if (t.checked) coches.add(t.dataset.sym); else coches.delete(t.dataset.sym);
    majCompteur();
  } else if (t.id === 'dureeSymptomes') {
    dureeSymptomes = t.value;
  } else if (t.id === 'pSexe') {
    majBlocGrossesse();
  }
});

document.addEventListener('input', function (e) {
  if (e.target.id === 'rechercheSymptomes') construireListeSymptomes();
  if (e.target.id === 'rechercheJournal') rendreJournal();
});

/* ================= Démarrage ================= */
function demarrer() {
  appliquerTheme();
  $('dateJour').textContent = '📅 ' + dateLisible(new Date().toISOString().slice(0, 10));
  construireListeSymptomes();
  rendreAccueil();
  rendreMedocs();
  rendreJournal();
  rendreProfils();
  majBlocGrossesse();
  majHorsLigne();
  $('formProfil').addEventListener('submit', enregistrerProfil);
  initBanniere();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer);
else demarrer();
