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
  if (page === 'symptomes') preparerSymptomes();
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

function estInstallee() {
  return window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true;
}
function fermeeRecemment() {
  const ts = localStorage.getItem(CLE_BANNIERE);
  return ts && (Date.now() - Number(ts)) < SEPT_JOURS;
}
function afficherBanniere(avecBouton) {
  const banniere = document.getElementById('banniere');
  if (!banniere || estInstallee() || fermeeRecemment()) return;
  if (!avecBouton) {
    document.getElementById('banniere-detail').textContent = "Menu ⋮ → « Ajouter à l'écran d'accueil »";
    document.getElementById('bouton-installer').style.display = 'none';
  }
  banniere.classList.remove('cachee');
}

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  afficherBanniere(true);
});

document.getElementById('bouton-installer').addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  document.getElementById('banniere').classList.add('cachee');
});

document.getElementById('fermer-banniere').addEventListener('click', () => {
  localStorage.setItem(CLE_BANNIERE, Date.now());
  document.getElementById('banniere').classList.add('cachee');
});

window.addEventListener('appinstalled', () => {
  document.getElementById('banniere').classList.add('cachee');
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

/* =====================================================
   MOTEUR DE SYMPTÔMES (v2)
   ===================================================== */
let symptomesCoches = new Set();
let intensiteChoisie = 3;
let derniereAnalyse = null;

function preparerSymptomes() {
  const badge = document.getElementById('sym-profil');
  const actif = profilActif();
  if (actif) {
    badge.textContent = '👤 Analyse pour : ' + actif.prenom + ' (' + ageDe(actif) + ' ans)';
  } else {
    badge.textContent = '⚠️ Aucun profil actif — crée-en un pour des conseils adaptés';
  }
  badge.classList.add('visible');

  document.querySelectorAll('.niv').forEach(b => {
    b.onclick = () => {
      intensiteChoisie = Number(b.dataset.val);
      document.querySelectorAll('.niv').forEach(x => x.classList.remove('selectionnee'));
      b.classList.add('selectionnee');
    };
  });

  construireListeSymptomes();
  majCompteur();
}

function construireListeSymptomes(filtre = '') {
  const conteneur = document.getElementById('liste-symptomes');
  const filtreMin = filtre.toLowerCase();
  let html = '';
  let derniereCat = '';

  SYMPTOMES.forEach(s => {
    if (filtreMin && !s.nom.toLowerCase().includes(filtreMin)) return;
    if (s.cat !== derniereCat) {
      html += `<div class="cat-titre">${s.cat}</div>`;
      derniereCat = s.cat;
    }
    const coche = symptomesCoches.has(s.id);
    html += `
      <div class="sym-item ${coche ? 'coche' : ''}" onclick="basculerSymptome('${s.id}')">
        <span class="check">${coche ? '✓' : ''}</span>
        <span>${s.nom}</span>
      </div>`;
  });

  conteneur.innerHTML = html || '<div class="journal-vide">Aucun symptôme trouvé</div>';
}

function filtrerSymptomes() {
  construireListeSymptomes(document.getElementById('recherche-symptome').value);
}

function basculerSymptome(id) {
  if (symptomesCoches.has(id)) {
    symptomesCoches.delete(id);
  } else {
    symptomesCoches.add(id);
  }
  construireListeSymptomes(document.getElementById('recherche-symptome').value);
  majCompteur();
}

function majCompteur() {
  const n = symptomesCoches.size;
  document.getElementById('compteur-symptomes').textContent = n;
  document.getElementById('pluriel').textContent = n > 1 ? 's' : '';
}

function analyser() {
  if (symptomesCoches.size === 0) {
    alert('Coche au moins un symptôme.');
    return;
  }

  const coches = [...symptomesCoches];

  /* 1. DRAPEAUX ROUGES d'abord */
  const alertes = DRAPEAUX.filter(d => {
    if (!d.symptomes.every(s => coches.includes(s))) return false;
    if (d.avec.length === 0) return true;
    return d.avec.some(s => coches.includes(s));
  });

  let html = '';

  if (alertes.length > 0) {
    alertes.forEach(a => {
      html += `
        <div class="alerte-rouge">
          <h3>🚨 ${a.titre}</h3>
          <p>${a.message}</p>
          <p class="num">📞 15 (SAMU) ou 112</p>
        </div>`;
    });
    html += `<div class="resultat-actions">
      <button class="btn-secondaire" onclick="recommencer()">← Modifier</button>
    </div>`;
    afficherResultat(html);
    return;
  }

  /* 2. Scoring v2 : couverture + spécificité */
  const resultats = TROUBLES.map(t => {
    let poidsCoches = 0, poidsTotal = 0, nbCoches = 0;
    for (const [sym, poids] of Object.entries(t.symptomes)) {
      poidsTotal += poids;
      if (coches.includes(sym)) { poidsCoches += poids; nbCoches++; }
    }
    if (nbCoches === 0) return { ...t, pct: 0 };
    const couverture = poidsCoches / poidsTotal;
    const specificite = nbCoches / coches.length;
    let pct = Math.round(100 * (0.65 * couverture + 0.35 * specificite));
    if (pct > 95) pct = 95;
    return { ...t, pct };
  })
  .filter(t => t.pct >= 20)
  .sort((a, b) => b.pct - a.pct)
  .slice(0, 3);

  /* 3. Symptômes inconnus de la base */
  const symConnus = new Set();
  TROUBLES.forEach(t => Object.keys(t.symptomes).forEach(s => symConnus.add(s)));
  const inconnus = coches.filter(id => !symConnus.has(id));

  /* 4. Verdict */
  const actif = profilActif();
  const fragile = actif && (ageDe(actif) < 3 || ageDe(actif) > 65);
  const aggravant = intensiteChoisie >= 4 || fragile;

  if (resultats.length === 0) {
    html = `
      <div class="rien">
        🤔 <strong>Aucune piste claire.</strong><br>
        Cette combinaison ne correspond à aucun trouble de la base.
        Surveille l'évolution et consulte un médecin si ça persiste ou s'aggrave.
      </div>`;
  } else {
    const meilleure = resultats[0].pct;
    const pireGravite = resultats.some(r => r.gravite === 'modere');

    if (pireGravite || aggravant) {
      html += `<div class="carte-verdict modere">
        <h3>🟡 ${aggravant ? 'Surveillance renforcée conseillée' : 'Consultation médicale à prévoir'}</h3>
        <p style="font-size:0.88rem;margin-top:4px">${aggravant ? 'Intensité élevée ou profil fragile : ne tarde pas à consulter.' : 'Ces hypothèses justifient généralement l\'avis d\'un médecin.'}</p>
      </div>`;
    } else if (meilleure < 40) {
      html += `<div class="carte-verdict modere">
        <h3>🟡 Pistes incertaines</h3>
        <p style="font-size:0.88rem;margin-top:4px">Peu de symptômes ou combinaison floue : les pistes ci-dessous sont indicatives. En cas de doute, consulte.</p>
      </div>`;
    } else {
      html += `<div class="carte-verdict benin">
        <h3>🟢 Pas de signe de gravité détecté</h3>
        <p style="font-size:0.88rem;margin-top:4px">Automédication raisonnée possible. Surveille l'évolution.</p>
      </div>`;
    }

    resultats.forEach((r, i) => {
      const niveau = r.pct >= 60 ? '🟢 Piste forte'
                   : r.pct >= 40 ? '🟡 Piste possible'
                   : '⚪ Piste faible';
      html += `
        <div class="hypothese">
          <div class="hypo-tete">
            <span class="hypo-nom">${i + 1}. ${r.nom}</span>
            <span class="hypo-pct">${r.pct}%</span>
          </div>
          <div class="hypo-barre"><div style="width:${r.pct}%"></div></div>
          <div class="hypo-niveau">${niveau}</div>
          <ul class="hypo-conseils">
            ${r.conseils.map(c => `<li>${c}</li>`).join('')}
          </ul>
          <div class="hypo-consulter">⚠️ Consulte ${r.consulter}</div>
        </div>`;
    });
  }

  if (inconnus.length > 0) {
    const noms = inconnus.map(id => SYMPTOMES.find(s => s.id === id).nom).join(', ');
    html += `
      <div class="hypothese">
        <div class="hypo-nom">🔎 Non reconnus par la base</div>
        <div class="hypo-conseils" style="margin-top:6px">${noms}</div>
        <div class="hypo-consulter">Ces symptômes ne sont reliés à aucun trouble courant de Salama. Surveille-les et parle-en à un médecin s'ils persistent.</div>
      </div>`;
  }

  html += `
    <div class="resultat-actions">
      <button class="btn-secondaire" onclick="recommencer()">← Modifier</button>
      <button class="btn-principal" onclick="enregistrerAnalyse()">📓 Au journal</button>
    </div>`;

  derniereAnalyse = {
    symptomes: coches.map(id => SYMPTOMES.find(s => s.id === id).nom).join(', '),
    hypotheses: resultats.map(r => `${r.nom} (${r.pct}%)`).join(' · ') || 'Aucune piste claire',
    duree: document.getElementById('sym-duree').value,
    intensite: intensiteChoisie
  };

  afficherResultat(html);
}

function afficherResultat(html) {
  document.getElementById('sym-selection').classList.add('cache');
  const zone = document.getElementById('sym-resultat');
  zone.innerHTML = html;
  zone.classList.remove('cache');
  window.scrollTo(0, 0);
}

function recommencer() {
  document.getElementById('sym-resultat').classList.add('cache');
  document.getElementById('sym-selection').classList.remove('cache');
}

function enregistrerAnalyse() {
  if (!derniereAnalyse) return;
  const actif = profilActif();
  const entrees = chargerJournal();
  entrees.unshift({
    date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    humeur: Math.max(1, 6 - intensiteChoisie),
    symptomes: derniereAnalyse.symptomes,
    notes: `Analyse : ${derniereAnalyse.hypotheses}\nDepuis : ${derniereAnalyse.duree} · Intensité : ${derniereAnalyse.intensite}/5`,
    profil: actif ? actif.prenom : ''
  });
  sauvegarderJournal(entrees);
  symptomesCoches.clear();
  recommencer();
  construireListeSymptomes();
  majCompteur();
  aller('journal');
}
