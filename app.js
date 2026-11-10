// ================= OUTILS =================
function $(id) { return document.getElementById(id); }

function lireCle(cle, defaut) {
  try {
    const v = localStorage.getItem(cle);
    return v ? JSON.parse(v) : defaut;
  } catch (e) { return defaut; }
}

function ecrireCle(cle, valeur) {
  localStorage.setItem(cle, JSON.stringify(valeur));
}

// ================= THÈME =================
function basculerTheme() {
  const sombre = document.body.classList.toggle('sombre');
  ecrireCle('salama_theme', sombre ? 'sombre' : 'clair');
  $('btnTheme').textContent = sombre ? '☀️' : '🌙';
}

function appliquerTheme() {
  if (lireCle('salama_theme', 'clair') === 'sombre') {
    document.body.classList.add('sombre');
    $('btnTheme').textContent = '☀️';
  }
}

// ================= PROFILS =================
function profils() { return lireCle('salama_profils', []); }

function profilActif() {
  const liste = profils();
  const id = lireCle('salama_profil_actif', null);
  return liste.find(p => p.id === id) || null;
}

function ageDe(profil) {
  if (!profil || !profil.naissance) return null;
  return new Date().getFullYear() - profil.naissance;
}

function nouveauProfil() {
  $('formProfil').classList.remove('cache');
  $('btnNouveauProfil').classList.add('cache');
}

function enregistrerProfil() {
  const prenom = $('pPrenom').value.trim();
  const naissance = parseInt($('pNaissance').value);
  const poids = parseFloat($('pPoids').value);
  if (!prenom || !naissance || !poids) {
    alert('Remplis au moins le prénom, l\u2019année de naissance et le poids.');
    return;
  }
  const liste = profils();
  const profil = {
    id: Date.now(),
    prenom: prenom,
    naissance: naissance,
    poids: poids,
    allergies: $('pAllergies').value.trim().toLowerCase(),
    traitements: $('pTraitements').value.trim().toLowerCase()
  };
  liste.push(profil);
  ecrireCle('salama_profils', liste);
  if (!profilActif()) ecrireCle('salama_profil_actif', profil.id);
  ['pPrenom', 'pNaissance', 'pPoids', 'pAllergies', 'pTraitements'].forEach(id => { $(id).value = ''; });
  $('formProfil').classList.add('cache');
  $('btnNouveauProfil').classList.remove('cache');
  afficherProfils();
}

function activerProfil(id) {
  ecrireCle('salama_profil_actif', id);
  afficherProfils();
}

function supprimerProfil(id) {
  if (!confirm('Supprimer ce profil ?')) return;
  const liste = profils().filter(p => p.id !== id);
  ecrireCle('salama_profils', liste);
  if (lireCle('salama_profil_actif', null) === id) {
    ecrireCle('salama_profil_actif', liste.length ? liste[0].id : null);
  }
  afficherProfils();
}

function afficherProfils() {
  const liste = profils();
  const actif = profilActif();
  const zone = $('listeProfils');
  if (!liste.length) {
    zone.innerHTML = '<p class="vide">Aucun profil. Crée le premier !</p>';
    return;
  }
  zone.innerHTML = liste.map(p => {
    const age = ageDe(p);
    const estActif = actif && actif.id === p.id;
    return '<div class="item-liste">' +
      '<strong>' + p.prenom + '</strong>' + (estActif ? '<span class="mini-badge">actif</span>' : '') +
      '<br>' + (age !== null ? age + ' ans · ' : '') + p.poids + ' kg' +
      (p.allergies ? '<br>Allergies : ' + p.allergies : '') +
      (p.traitements ? '<br>Traitements : ' + p.traitements : '') +
      '<div class="ligne-btns">' +
      (estActif ? '' : '<button class="btn-petit" onclick="activerProfil(' + p.id + ')">Activer</button>') +
      '<button class="btn-petit danger" onclick="supprimerProfil(' + p.id + ')">Supprimer</button>' +
      '</div></div>';
  }).join('');
}
// ================= SYMPTÔMES =================
function preparerSymptomes() {
  $('listeSymptomes').innerHTML = SYMPTOMES.map(cat =>
    '<div class="categorie"><h3>' + cat.categorie + '</h3><div class="chips">' +
    cat.items.map(s =>
      '<button class="chip" data-id="' + s.id + '" onclick="basculerChip(this)">' + s.nom + '</button>'
    ).join('') +
    '</div></div>'
  ).join('');
}

function basculerChip(btn) { btn.classList.toggle('on'); }

function symptomesCoches() {
  return Array.from(document.querySelectorAll('.chip.on')).map(c => c.dataset.id);
}

function nomSymptome(id) {
  for (const cat of SYMPTOMES) {
    const s = cat.items.find(i => i.id === id);
    if (s) return s.nom;
  }
  return id;
}
// ================= ANALYSE =================
let derniereAnalyse = null;

function analyser() {
  const coches = symptomesCoches();
  const zone = $('resultats');
  if (!coches.length) {
    zone.innerHTML = '<div class="carte"><p>Coche au moins un symptôme pour lancer l\u2019analyse.</p></div>';
    return;
  }

  let html = '';

  // 1. Drapeaux rouges EN PREMIER
  const alertes = DRAPEAUX.filter(d => d.symptomes.every(s => coches.includes(s)));
  if (alertes.length) {
    html += alertes.map(a =>
      '<div class="carte danger"><h3>🚨 URGENCE</h3><p>' + a.message + '</p></div>'
    ).join('');
  }

  // 2. Scoring
  const profil = profilActif();
  const age = ageDe(profil);
  const fragile = age !== null && (age < 3 || age > 65);

  const resultats = TROUBLES.map(t => {
    const ids = Object.keys(t.symptomes);
    const trouves = ids.filter(id => coches.includes(id));
    if (!trouves.length) return null;
    const poidsTotal = ids.reduce((s, id) => s + t.symptomes[id], 0);
    const poidsTrouve = trouves.reduce((s, id) => s + t.symptomes[id], 0);
    const couverture = poidsTrouve / poidsTotal;
    const specificite = trouves.length / coches.length;
    let pct = Math.round(100 * (0.65 * couverture + 0.35 * specificite));
    if (pct > 95) pct = 95;
    return { trouble: t, pct: pct };
  }).filter(r => r && r.pct >= 20).sort((a, b) => b.pct - a.pct);

  // 3. Affichage des hypothèses
  if (!resultats.length) {
    html += '<div class="carte"><h3>🤔 Aucune piste claire</h3>' +
      '<p>Ces symptômes ne correspondent à rien dans la base actuelle. Surveille l\u2019évolution et consulte si ça persiste ou s\u2019aggrave.</p></div>';
  } else {
    resultats.slice(0, 4).forEach(r => {
      const badge = r.pct >= 60 ? '<span class="badge b-vert">🟢 forte probabilité</span>'
                  : r.pct >= 40 ? '<span class="badge b-jaune">🟡 possible</span>'
                  : '<span class="badge b-gris">⚪ piste faible</span>';
      
      // 🆕 Bloc posologie pour cette maladie
      let blocMedocs = '';
      if (r.trouble.medocs && r.trouble.medocs.length) {
        blocMedocs = '<div style="margin-top:10px;padding-top:8px;border-top:1px solid var(--bordure)">' +
          '<strong>💊 Médicaments suggérés :</strong>' +
          r.trouble.medocs.map(id => {
            const m = MEDICAMENTS.find(x => x.id === id);
            if (!m) return '';
            const alertes = alertesProfilPour(m);
            const interdit = alertes.some(a => a.grave);
            const doseTexte = posologiePourTexte(m);
            return '<div style="margin-top:6px;padding:8px;background:var(--accent-clair);border-radius:8px;font-size:0.88rem">' +
              '<strong>' + m.nom + '</strong>' +
              (interdit ? ' <span class="badge b-rouge">⛔ déconseillé</span>' : '') +
              (doseTexte ? '<br>' + doseTexte : '') +
              (alertes.length && !interdit ? '<br><span style="color:#8a6100">' + alertes.map(a => a.texte).join('<br>') + '</span>' : '') +
              '</div>';
          }).join('') + '</div>';
      }

      html += '<div class="carte"><h3>' + r.trouble.nom + ' — ' + r.pct + ' %</h3>' + badge +
        '<p style="margin-top:8px"><strong>Conseils :</strong></p><ul>' +
        r.trouble.conseils.map(c => '<li>' + c + '</li>').join('') + '</ul>' +
        '<p style="margin-top:6px"><strong>Consulter si :</strong> ' + r.trouble.consulter + '</p>' +
        blocMedocs + '</div>';
    });
  }

  // 4. Profil fragile
  if (fragile) {
    html += '<div class="carte danger"><p>⚠️ <strong>' + profil.prenom + ' a ' + age +
      ' ans (profil fragile)</strong> : consulte un médecin plus rapidement qu\u2019un adulte en bonne santé.</p></div>';
  }

  // 5. Symptômes non reconnus
  const connus = new Set();
  TROUBLES.forEach(t => Object.keys(t.symptomes).forEach(id => connus.add(id)));
  const inconnus = coches.filter(id => !connus.has(id));
  if (inconnus.length) {
    html += '<div class="carte"><p>ℹ️ <strong>Non reconnus par la base :</strong> ' +
      inconnus.map(nomSymptome).join(', ') + '</p></div>';
  }

  // 6. Mémorise + bouton journal
  derniereAnalyse = {
    date: new Date().toISOString(),
    profil: profil ? profil.prenom : 'Sans profil',
    symptomes: coches,
    hypotheses: resultats.slice(0, 3).map(r => ({ nom: r.trouble.nom, pct: r.pct })),
    duree: $('duree').value,
    intensite: $('intensite').value
  };

  html += '<button class="btn-principal" onclick="enregistrerAnalyse()">📓 Enregistrer dans le journal</button>';
  zone.innerHTML = html;
  zone.scrollIntoView({ behavior: 'smooth' });
}

function enregistrerAnalyse() {
  if (!derniereAnalyse) return;
  const journal = lireCle('salama_journal', []);
  journal.unshift(derniereAnalyse);
  ecrireCle('salama_journal', journal);
  alert('Enregistré dans le journal ✅');
  aller('journal');
}
// ================= JOURNAL =================
function afficherJournal() {
  const journal = lireCle('salama_journal', []);
  const zone = $('listeJournal');
  if (!journal.length) {
    zone.innerHTML = '<p class="vide">Journal vide. Lance une analyse pour commencer.</p>';
    return;
  }
  zone.innerHTML = journal.map((e, i) => {
    const d = new Date(e.date);
    const dateStr = d.toLocaleDateString('fr-FR') + ' ' +
      d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const hypoStr = (e.hypotheses || []).map(h => h.nom + ' (' + h.pct + '%)').join(', ');
    return '<div class="item-liste">' +
      '<div class="date">' + dateStr + ' · ' + e.profil + ' · ' + e.duree + ' · intensité ' + e.intensite + '</div>' +
      '<strong>Symptômes :</strong> ' + e.symptomes.map(nomSymptome).join(', ') + '<br>' +
      '<strong>Pistes :</strong> ' + (hypoStr || 'aucune') +
      '<div class="ligne-btns"><button class="btn-petit danger" onclick="supprimerEntree(' + i + ')">Supprimer</button></div>' +
      '</div>';
  }).join('');
}

function supprimerEntree(i) {
  const journal = lireCle('salama_journal', []);
  journal.splice(i, 1);
  ecrireCle('salama_journal', journal);
  afficherJournal();
}

// ================= POSOLOGIE TEXTE (🆕 pour l'analyse) =================
function posologiePourTexte(m) {
  const profil = profilActif();
  if (!profil) return m.adulte + ' (dose adulte)';
  const age = ageDe(profil);
  const poids = profil.poids;
  if (m.age_min !== null && age < m.age_min) {
    return '⛔ Déconseillé avant ' + m.age_min + ' ans';
  }
  if (age >= 15 || poids >= 50) {
    return m.adulte + ' — ' + m.max;
  }
  if (m.enfant_mgkg) {
    const dose = Math.round(m.enfant_mgkg * poids / 10) * 10;
    return dose + ' mg par prise (' + m.enfant_mgkg + ' mg/kg) — ' + m.max;
  }
  if (m.enfant_fixe) {
    return m.enfant_fixe + ' — ' + m.max;
  }
  return m.adulte;
}

// ================= MÉDICAMENTS =================
function preparerMedocs() {
  const profil = profilActif();
  $('medocsProfil').textContent = profil
    ? 'Dosages calculés pour : ' + profil.prenom + ' (' + ageDe(profil) + ' ans, ' + profil.poids + ' kg)'
    : 'Aucun profil actif : dosages adulte standard affichés.';
  $('ficheMedoc').classList.add('cache');
  $('listeMedocs').classList.remove('cache');
  $('listeMedocs').innerHTML = MEDICAMENTS.map(m => {
    const alertes = alertesProfilPour(m);
    const badge = alertes.some(a => a.grave) ? ' <span class="badge b-rouge">⛔ déconseillé</span>'
                : alertes.length ? ' <span class="badge b-jaune">⚠️ prudence</span>' : '';
    return '<div class="item-liste" onclick="ficheMedoc(\'' + m.id + '\')" style="cursor:pointer">' +
      '<strong>' + m.nom + '</strong>' + badge +
      '<br><span style="color:var(--texte-doux);font-size:0.82rem">' + m.indication + '</span></div>';
  }).join('');
}

function posologiePour(m) {
  const profil = profilActif();
  const age = ageDe(profil);
  const poids = profil ? profil.poids : null;
  let html = '<p style="margin-top:6px"><strong>Adulte :</strong> ' + m.adulte +
    '<br><strong>Maximum :</strong> ' + m.max + '</p>';
  if (age !== null && poids) {
    if (m.age_min !== null && age < m.age_min) {
      html += '<div class="alerte-ligne interdit">⛔ Déconseillé avant ' + m.age_min +
        ' ans — ' + profil.prenom + ' a ' + age + ' ans.</div>';
    } else if (age >= 15 || poids >= 50) {
      html += '<p style="margin-top:6px"><strong>' + profil.prenom + ' (' + age + ' ans) :</strong> dose adulte.</p>';
    } else if (m.enfant_mgkg) {
      const dose = Math.round(m.enfant_mgkg * poids / 10) * 10;
      html += '<p style="margin-top:6px"><strong>' + profil.prenom + ' (' + age + ' ans, ' + poids + ' kg) :</strong> ' +
        dose + ' mg par prise (' + m.enfant_mgkg + ' mg/kg), sans dépasser la dose adulte.</p>';
    } else if (m.enfant_fixe) {
      html += '<p style="margin-top:6px"><strong>' + profil.prenom + ' :</strong> ' + m.enfant_fixe + '</p>';
    }
    if (age < 3 && m.bebe) html += '<p style="margin-top:6px"><em>🍼 ' + m.bebe + '</em></p>';
  }
  return html;
}

function alertesProfilPour(m) {
  const profil = profilActif();
  const alertes = [];
  if (!profil) return alertes;
  if (profil.allergies) {
    const mots = profil.allergies.split(/[,\s]+/).filter(Boolean);
    m.allergie_mots.forEach(am => {
      if (mots.some(mot => am.indexOf(mot) !== -1 || mot.indexOf(am) !== -1)) {
        alertes.push({ texte: '🚫 NE PAS PRENDRE : allergie connue (' + am + ')', grave: true });
      }
    });
  }
  if (profil.traitements) {
    const mots = profil.traitements.split(/[,\s]+/).filter(Boolean);
    m.interactions.forEach(int => {
      if (mots.some(mot => int.indexOf(mot) !== -1 || mot.indexOf(int) !== -1)) {
        alertes.push({ texte: '⚠️ Interaction possible avec ton traitement (' + int + ') : demande conseil à un pharmacien.', grave: false });
      }
    });
  }
  const age = ageDe(profil);
  if (age !== null && m.age_min && age < m.age_min) {
    alertes.push({ texte: '⛔ Déconseillé avant ' + m.age_min + ' ans', grave: true });
  }
  return alertes;
}

function ficheMedoc(id) {
  const m = MEDICAMENTS.find(x => x.id === id);
  const alertes = alertesProfilPour(m);
  $('ficheMedoc').innerHTML = '<div class="carte"><h3>💊 ' + m.nom + '</h3>' +
    '<p style="color:var(--texte-doux);font-size:0.82rem">' + m.dci + '</p>' +
    '<p style="margin-top:8px"><strong>Indication :</strong> ' + m.indication + '</p>' +
    posologiePour(m) +
    alertes.map(a => '<div class="alerte-ligne' + (a.grave ? ' interdit' : '') + '">' + a.texte + '</div>').join('') +
    m.alertes.map(a => '<div class="alerte-ligne">⚠️ ' + a + '</div>').join('') +
    '<button class="btn-petit" style="margin-top:10px" onclick="preparerMedocs()">← Retour à la liste</button></div>';
  $('listeMedocs').classList.add('cache');
  $('ficheMedoc').classList.remove('cache');
  window.scrollTo(0, 0);
}
// ================= NAVIGATION =================
function aller(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('cache'));
  $('page-' + page).classList.remove('cache');
  const idx = ['accueil', 'symptomes', 'medocs', 'journal', 'profils'].indexOf(page);
  const btns = document.querySelectorAll('#navBas button');
  btns.forEach(b => b.classList.remove('actif'));
  if (idx >= 0 && btns[idx]) btns[idx].classList.add('actif');
  window.scrollTo(0, 0);
  if (page === 'journal') afficherJournal();
  if (page === 'profils') afficherProfils();
  if (page === 'medocs') preparerMedocs();
  if (page === 'accueil') majAccueil();
}

function majAccueil() {
  const p = profilActif();
  $('profilActifAccueil').textContent = p
    ? '👤 Profil actif : ' + p.prenom
    : '👤 Aucun profil — crée-en un dans l\u2019onglet Profils';
}

// ================= BANNIÈRE INSTALLATION =================
let evenementInstall = null;

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  evenementInstall = e;
  afficherBanniere();
});

window.addEventListener('appinstalled', () => {
  $('banniere').classList.add('cache');
  evenementInstall = null;
});

function afficherBanniere() {
  if (window.matchMedia('(display-mode: standalone)').matches) return;
  const fermee = lireCle('salama_banniere_fermee', 0);
  if (Date.now() - fermee < 7 * 24 * 60 * 60 * 1000) return;
  $('banniere').classList.remove('cache');
}

function initialiserBanniere() {
  $('btnInstaller').addEventListener('click', () => {
    if (evenementInstall) {
      evenementInstall.prompt();
      evenementInstall = null;
    } else {
      alert('Pour installer : menu ⋮ de Chrome → « Ajouter à l\u2019écran d\u2019accueil »');
    }
  });
  $('btnFermerBanniere').addEventListener('click', () => {
    $('banniere').classList.add('cache');
    ecrireCle('salama_banniere_fermee', Date.now());
  });
  afficherBanniere();
}

// ================= DÉMARRAGE =================
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}

appliquerTheme();
preparerSymptomes();
initialiserBanniere();
aller('accueil');
