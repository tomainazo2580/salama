/* ===== Navigation ===== */
const titres = {
  accueil: 'Ton assistant santé personnel',
  symptomes: 'Analyse de symptômes',
  journal: 'Ton journal de santé',
  medicaments: 'Ta pharmacie',
  profils: 'Profils de la famille'
};

function aller(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.querySelectorAll('.nav-bas button[data-page]').forEach(b =>
    b.classList.toggle('actif', b.dataset.page === page)
  );
  document.getElementById('sous-titre').textContent = titres[page];
  if (page === 'journal') afficherJournal();
  if (page === 'profils') afficherProfils();
  window.scrollTo(0, 0);
}

/* ===== Mode sombre ===== */
const CLE_THEME = 'salama_theme';
function appliquerTheme(theme) {
  document.body.classList.toggle('sombre', theme === 'sombre');
  document.getElementById('ico-sombre').textContent = theme === 'sombre' ? '☀️' : '🌙';
}
function basculerSombre() {
  const nouveau = document.body.classList.contains('sombre') ? 'clair' : 'sombre';
  localStorage.setItem(CLE_THEME, nouveau);
  appliquerTheme(nouveau);
}
appliquerTheme(localStorage.getItem(CLE_THEME) || 'clair');

/* ===== Service Worker ===== */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}

/* ===== Bannière d'installation ===== */
const CLE_BANNIERE = 'salama_banniere_fermee';
const SEPT_JOURS = 7 * 24 * 60 * 60 * 1000;
let deferredPrompt = null;

const banniere = document.getElementById('banniere');
const btnInstaller = document.getElementById('bouton-installer');
const btnFermer = document.getElementById('fermer-banniere');
const detail = document.getElementById('banniere-detail');

function estInstallee() {
  return window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true;
}
function fermeeRecemment() {
  const ts = localStorage.getItem(CLE_BANNIERE);
  return ts && (Date.now() - Number(ts)) < SEPT_JOURS;
}
function afficherBanniere(avecBouton) {
  if (estInstallee() || fermeeRecemment()) return;
  if (!avecBouton) {
    detail.textContent = "Menu ⋮ → « Ajouter à l'écran d'accueil »";
    btnInstaller.style.display = 'none';
  }
  banniere.classList.remove('cachee');
}

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  afficherBanniere(true);
});

btnInstaller.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  banniere.classList.add('cachee');
});

btnFermer.addEventListener('click', () => {
  localStorage.setItem(CLE_BANNIERE, Date.now());
  banniere.classList.add('cachee');
});

window.addEventListener('appinstalled', () => {
  banniere.classList.add('cachee');
  localStorage.removeItem(CLE_BANNIERE);
});

setTimeout(() => { if (!deferredPrompt) afficherBanniere(false); }, 4000);

/* ===== Profils ===== */
const CLE_PROFILS = 'salama_profils';
const CLE_PROFIL_ACTIF = 'salama_profil_actif';

function chargerProfils() {
  const data = localStorage.getItem(CLE_PROFILS);
  return data ? JSON.parse(data) : [];
}
function sauvegarderProfils(profils) {
  localStorage.setItem(CLE_PROFILS, JSON.stringify(profils));
}
function profilActif() {
  const i = Number(localStorage.getItem(CLE_PROFIL_ACTIF));
  const profils = chargerProfils();
  return (i >= 0 && i < profils.length) ? profils[i] : null;
}
function ageDe(profil) {
  return new Date().getFullYear() - Number(profil.annee);
}

function afficherProfils() {
  const profils = chargerProfils();
  const actif = Number(localStorage.getItem(CLE_PROFIL_ACTIF));
  const liste = document.getElementById('liste-profils');
  if (profils.length === 0) {
    liste.innerHTML = '<div class="journal-vide">👥<br>Aucun profil.<br>Crée le premier membre de la famille !</div>';
    return;
  }
  liste.innerHTML = profils.map((p, i) => `
    <div class="profil ${i === actif ? 'actif' : ''}">
      <div class="profil-tete">
        <span class="profil-nom">${p.prenom}</span>
        ${i === actif ? '<span class="badge-actif">Actif</span>' : ''}
      </div>
      <div class="profil-infos">${ageDe(p)} ans · ${p.poids} kg</div>
      ${p.allergies ? `<div class="profil-alertes">⚠️ Allergies : ${p.allergies}</div>` : ''}
      ${p.traitements ? `<div class="profil-alertes">💊 Traitements : ${p.traitements}</div>` : ''}
      <div class="profil-actions">
        ${i !== actif ? `<button class="btn-mini activer" onclick="activerProfil(${i})">Définir comme actif</button>` : ''}
        <button class="btn-mini supprimer" onclick="supprimerProfil(${i})">🗑</button>
      </div>
    </div>
  `).join('');
}

function activerProfil(i) {
  localStorage.setItem(CLE_PROFIL_ACTIF, i);
  afficherProfils();
}

function ouvrirFormProfil() {
  ['p-prenom', 'p-annee', 'p-poids', 'p-allergies', 'p-traitements']
    .forEach(id => document.getElementById(id).value = '');
  document.getElementById('formulaire-profil').classList.remove('cache');
}
function fermerFormProfil() {
  document.getElementById('formulaire-profil').classList.add('cache');
}

function sauvegarderProfil() {
  const prenom = document.getElementById('p-prenom').value.trim();
  const annee = document.getElementById('p-annee').value.trim();
  const poids = document.getElementById('p-poids').value.trim();
  if (!prenom || !annee || !poids) {
    alert('Prénom, année de naissance et poids sont obligatoires.');
    return;
  }
  const profils = chargerProfils();
  profils.push({
    prenom,
    annee,
    poids,
    allergies: document.getElementById('p-allergies').value.trim(),
    traitements: document.getElementById('p-traitements').value.trim()
  });
  sauvegarderProfils(profils);
  if (profils.length === 1) {
    localStorage.setItem(CLE_PROFIL_ACTIF, 0);
  }
  fermerFormProfil();
  afficherProfils();
}

function supprimerProfil(i) {
  if (!confirm('Supprimer ce profil ?')) return;
  const profils = chargerProfils();
  profils.splice(i, 1);
  sauvegarderProfils(profils);
  localStorage.setItem(CLE_PROFIL_ACTIF, profils.length > 0 ? 0 : -1);
  afficherProfils();
}

/* ===== Journal de santé ===== */
const CLE_JOURNAL = 'salama_journal';
let humeurChoisie = 3;

function chargerJournal() {
  const data = localStorage.getItem(CLE_JOURNAL);
  return data ? JSON.parse(data) : [];
}
function sauvegarderJournal(entrees) {
  localStorage.setItem(CLE_JOURNAL, JSON.stringify(entrees));
}

function afficherJournal() {
  const badge = document.getElementById('journal-profil');
  const actif = profilActif();
  if (actif) {
    badge.textContent = '👤 Journal de : ' + actif.prenom;
    badge.classList.add('visible');
  } else {
    badge.classList.remove('visible');
  }

  const entrees = chargerJournal();
  const liste = document.getElementById('liste-journal');
  if (entrees.length === 0) {
    liste.innerHTML = '<div class="journal-vide">📓<br>Aucune entrée pour l\'instant.<br>Commence par en ajouter une !</div>';
    return;
  }
  liste.innerHTML = entrees.map((e, i) => `
    <div class="entree">
      <div class="entree-tete">
        <span class="entree-date">${e.date}${e.profil ? ' · 👤 ' + e.profil : ''}</span>
        <span class="entree-humeur">${['😫','😕','😐','🙂','😄'][e.humeur - 1]}</span>
      </div>
      ${e.symptomes ? `<div class="entree-symptomes">🤒 ${e.symptomes}</div>` : ''}
      ${e.notes ? `<div class="entree-notes">${e.notes}</div>` : ''}
      <div style="text-align:right;margin-top:6px">
        <button class="entree-supp" onclick="supprimerEntree(${i})">🗑 Supprimer</button>
      </div>
    </div>
  `).join('');
}

function ouvrirFormulaire() {
  humeurChoisie = 3;
  document.querySelectorAll('.humeur').forEach(h => {
    h.classList.toggle('selectionnee', Number(h.dataset.val) === 3);
    h.onclick = () => {
      humeurChoisie = Number(h.dataset.val);
      document.querySelectorAll('.humeur').forEach(x => x.classList.remove('selectionnee'));
      h.classList.add('selectionnee');
    };
  });
  document.getElementById('f-symptomes').value = '';
  document.getElementById('f-notes').value = '';
  document.getElementById('formulaire-journal').classList.remove('cache');
}

function fermerFormulaire() {
  document.getElementById('formulaire-journal').classList.add('cache');
}

function sauvegarderEntree() {
  const actif = profilActif();
  const entrees = chargerJournal();
  entrees.unshift({
    date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    humeur: humeurChoisie,
    symptomes: document.getElementById('f-symptomes').value.trim(),
    notes: document.getElementById('f-notes').value.trim(),
    profil: actif ? actif.prenom : ''
  });
  sauvegarderJournal(entrees);
  fermerFormulaire();
  afficherJournal();
}

function supprimerEntree(index) {
  if (!confirm('Supprimer cette entrée ?')) return;
  const entrees = chargerJournal();
  entrees.splice(index, 1);
  sauvegarderJournal(entrees);
  afficherJournal();
}
