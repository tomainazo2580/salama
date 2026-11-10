/* ===== Base de symptômes ===== */
const SYMPTOMES = [
  { id: 'fievre', nom: 'Fièvre', cat: 'Général' },
  { id: 'frissons', nom: 'Frissons', cat: 'Général' },
  { id: 'fatigue', nom: 'Fatigue intense', cat: 'Général' },
  { id: 'perte_appetit', nom: "Perte d'appétit", cat: 'Général' },
  { id: 'courbatures', nom: 'Courbatures / douleurs musculaires', cat: 'Général' },
  { id: 'sueurs', nom: 'Sueurs anormales', cat: 'Général' },
  { id: 'perte_connaissance', nom: 'Perte de conscience / malaise', cat: 'Général' },

  { id: 'toux_seche', nom: 'Toux sèche', cat: 'Respiration' },
  { id: 'toux_grasse', nom: 'Toux grasse (avec glaires)', cat: 'Respiration' },
  { id: 'essoufflement', nom: 'Essoufflement / difficulté à respirer', cat: 'Respiration' },
  { id: 'sifflement', nom: 'Respiration sifflante', cat: 'Respiration' },
  { id: 'douleur_thorax', nom: 'Douleur dans la poitrine', cat: 'Respiration' },

  { id: 'nez_coule', nom: 'Nez qui coule', cat: 'Nez et gorge' },
  { id: 'eternuements', nom: 'Éternuements fréquents', cat: 'Nez et gorge' },
  { id: 'congestion', nom: 'Nez bouché', cat: 'Nez et gorge' },
  { id: 'mal_gorge', nom: 'Mal de gorge', cat: 'Nez et gorge' },
  { id: 'deglutition', nom: 'Douleur en avalant', cat: 'Nez et gorge' },
  { id: 'taches_gorge', nom: 'Taches blanches dans la gorge', cat: 'Nez et gorge' },
  { id: 'douleur_face', nom: 'Douleur du visage (joues, front)', cat: 'Nez et gorge' },
  { id: 'ganglions', nom: 'Ganglions gonflés (cou)', cat: 'Nez et gorge' },
  { id: 'perte_odorat', nom: "Perte d'odorat ou de goût", cat: 'Nez et gorge' },

  { id: 'maux_tete', nom: 'Maux de tête', cat: 'Tête' },
  { id: 'sensibilite_lumiere', nom: 'Gêné par la lumière', cat: 'Tête' },
  { id: 'vertiges', nom: 'Vertiges', cat: 'Tête' },
  { id: 'confusion', nom: 'Confusion / difficulté à parler', cat: 'Tête' },
  { id: 'raideur_nuque', nom: 'Nuque raide et douloureuse', cat: 'Tête' },
  { id: 'douleur_oreille', nom: "Douleur d'oreille", cat: 'Tête' },
  { id: 'ecoulement_oreille', nom: "Écoulement de l'oreille", cat: 'Tête' },
  { id: 'yeux_rouges', nom: 'Yeux rouges', cat: 'Tête' },
  { id: 'yeux_larmoyants', nom: 'Yeux qui piquent / larmoient', cat: 'Tête' },
  { id: 'yeux_colles', nom: 'Yeux collés au réveil', cat: 'Tête' },

  { id: 'nausees', nom: 'Nausées', cat: 'Ventre' },
  { id: 'vomissements', nom: 'Vomissements', cat: 'Ventre' },
  { id: 'diarrhee', nom: 'Diarrhée', cat: 'Ventre' },
  { id: 'douleur_abdo', nom: 'Douleur au ventre', cat: 'Ventre' },
  { id: 'douleur_abdo_intense', nom: 'Douleur au ventre intense et brutale', cat: 'Ventre' },
  { id: 'brulures_estomac', nom: "Brûlures d'estomac", cat: 'Ventre' },
  { id: 'remontees_acides', nom: 'Remontées acides', cat: 'Ventre' },
  { id: 'ballonnements', nom: 'Ballonnements / ventre gonflé', cat: 'Ventre' },
  { id: 'constipation', nom: 'Constipation', cat: 'Ventre' },
  { id: 'sang_selles', nom: 'Sang dans les selles ou les vomissements', cat: 'Ventre' },

  { id: 'brulures_urinaires', nom: 'Brûlures en urinant', cat: 'Urinaire' },
  { id: 'urines_frequentes', nom: "Envies fréquentes d'uriner", cat: 'Urinaire' },
  { id: 'douleur_bas_ventre', nom: 'Douleur en bas du ventre', cat: 'Urinaire' },

  { id: 'eruption', nom: 'Éruption sur la peau (boutons, plaques)', cat: 'Peau' },
  { id: 'demangeaisons', nom: 'Démangeaisons', cat: 'Peau' },
  { id: 'gonflement_visage', nom: 'Gonflement du visage ou de la gorge', cat: 'Peau' },

  { id: 'douleur_lombaire', nom: 'Douleur en bas du dos', cat: 'Douleurs' },
  { id: 'douleur_unilaterale', nom: "Maux de tête d'un seul côté", cat: 'Douleurs' }
];

/* ===== Drapeaux rouges ===== */
const DRAPEAUX = [
  {
    symptomes: ['douleur_thorax'],
    avec: ['essoufflement', 'sueurs'],
    titre: 'Douleur thoracique',
    message: "Une douleur dans la poitrine, surtout avec essoufflement ou sueurs, peut être grave. Appelez le 15 ou le 112 immédiatement."
  },
  {
    symptomes: ['essoufflement'],
    avec: [],
    titre: 'Difficulté à respirer',
    message: "Une difficulté à respirer nécessite une évaluation rapide. Appelez le 15 si elle est importante ou s'aggrave."
  },
  {
    symptomes: ['confusion'],
    avec: [],
    titre: 'Signes neurologiques',
    message: "Confusion, difficulté à parler ou faiblesse d'un côté du corps : appelez le 15 immédiatement (risque d'AVC)."
  },
  {
    symptomes: ['raideur_nuque', 'fievre'],
    avec: [],
    titre: 'Fièvre avec nuque raide',
    message: "Fièvre + nuque raide peuvent évoquer une méningite. Consultez en urgence ou appelez le 15."
  },
  {
    symptomes: ['perte_connaissance'],
    avec: [],
    titre: 'Perte de conscience',
    message: "Toute perte de conscience mérite une évaluation médicale urgente. Appelez le 15."
  },
  {
    symptomes: ['sang_selles'],
    avec: [],
    titre: 'Saignement digestif',
    message: "Du sang dans les selles ou les vomissements nécessite une consultation urgente."
  },
  {
    symptomes: ['douleur_abdo_intense'],
    avec: [],
    titre: 'Douleur abdominale intense',
    message: "Une douleur au ventre brutale et intense peut être une urgence chirurgicale. Consultez immédiatement."
  },
  {
    symptomes: ['gonflement_visage'],
    avec: [],
    titre: 'Réaction allergique sévère',
    message: "Un gonflement du visage ou de la gorge peut étouffer les voies respiratoires. Appelez le 15 immédiatement."
  }
];

/* ===== Troubles courants ===== */
const TROUBLES = [
  {
    id: 'rhume', nom: 'Rhume', gravite: 'benin',
    symptomes: { nez_coule: 3, eternuements: 3, congestion: 3, mal_gorge: 2, toux_seche: 1, fievre: 1, fatigue: 1 },
    conseils: ["Repos et hydratation", "Lavage de nez au sérum physiologique", "Paracétamol si gêne"],
    consulter: "si fièvre > 3 jours ou symptômes > 10 jours",
    medocs: ['paracetamol', 'serum']
  },
  {
    id: 'grippe', nom: 'Grippe', gravite: 'modere',
    symptomes: { fievre: 3, frissons: 3, courbatures: 3, fatigue: 3, maux_tete: 2, toux_seche: 2, perte_appetit: 1 },
    conseils: ["Repos strict", "Boire beaucoup", "Paracétamol pour la fièvre et les courbatures"],
    consulter: "rapidement si personne fragile, essoufflement, ou fièvre > 39,5°C",
    medocs: ['paracetamol']
  },
  {
    id: 'covid', nom: 'COVID-19', gravite: 'modere',
    symptomes: { toux_seche: 3, perte_odorat: 3, fievre: 2, fatigue: 2, mal_gorge: 1, essoufflement: 2 },
    conseils: ["Faire un test si possible", "Repos, hydratation", "Éviter les contacts fragiles"],
    consulter: "si essoufflement ou difficulté à respirer",
    medocs: ['paracetamol']
  },
  {
    id: 'gastro', nom: 'Gastro-entérite', gravite: 'benin',
    symptomes: { nausees: 3, vomissements: 3, diarrhee: 3, douleur_abdo: 2, fievre: 1, perte_appetit: 2, ballonnements: 1 },
    conseils: ["S'hydrater par petites gorgées", "Riz, carottes, bananes", "Éviter laitages et aliments gras"],
    consulter: "si sang dans les selles, déshydratation, ou > 3 jours",
    medocs: ['sro', 'smecta', 'spasfon', 'loperamide']
  },
  {
    id: 'migraine', nom: 'Migraine', gravite: 'benin',
    symptomes: { maux_tete: 3, douleur_unilaterale: 3, sensibilite_lumiere: 3, nausees: 2 },
    conseils: ["Repos dans le noir et le calme", "Paracétamol ou ibuprofène dès le début", "Boire de l'eau"],
    consulter: "si maux de tête inhabituels, brutaux ou très fréquents",
    medocs: ['paracetamol', 'ibuprofene']
  },
  {
    id: 'angine', nom: 'Angine', gravite: 'modere',
    symptomes: { mal_gorge: 3, deglutition: 3, taches_gorge: 3, fievre: 2, ganglions: 2, fatigue: 1 },
    conseils: ["Paracétamol pour la douleur", "Boissons tièdes, miel", "Repos de la voix"],
    consulter: "pour un test (angine bactérienne = antibiotiques possibles)",
    medocs: ['paracetamol']
  },
  {
    id: 'sinusite', nom: 'Sinusite', gravite: 'benin',
    symptomes: { douleur_face: 3, congestion: 3, maux_tete: 2, nez_coule: 2, fievre: 1 },
    conseils: ["Lavage de nez fréquent", "Inhalations de vapeur", "Paracétamol si douleur"],
    consulter: "si > 10 jours, fièvre élevée ou douleur intense",
    medocs: ['paracetamol', 'serum']
  },
  {
    id: 'allergie', nom: 'Allergie saisonnière', gravite: 'benin',
    symptomes: { eternuements: 3, yeux_larmoyants: 3, demangeaisons: 2, nez_coule: 2, congestion: 1 },
    conseils: ["Éviter les allergènes (pollen, poussière)", "Antihistaminique en vente libre", "Se rincer le visage après être sorti"],
    consulter: "si gêne importante malgré le traitement",
    medocs: ['cetirizine', 'loratadine']
  },
  {
    id: 'cystite', nom: 'Cystite (infection urinaire)', gravite: 'modere',
    symptomes: { brulures_urinaires: 3, urines_frequentes: 3, douleur_bas_ventre: 2, fievre: 1 },
    conseils: ["Boire beaucoup d'eau", "Ne pas se retenir d'uriner"],
    consulter: "rapidement : une cystite se traite avec des antibiotiques sur ordonnance",
    medocs: []
  },
  {
    id: 'lombalgie', nom: 'Lombalgie (mal de dos)', gravite: 'benin',
    symptomes: { douleur_lombaire: 3 },
    conseils: ["Rester actif (éviter le lit)", "Chaleur sur la zone", "Paracétamol si douleur"],
    consulter: "si douleur qui descend dans la jambe, ou perte de force",
    medocs: ['paracetamol']
  },
  {
    id: 'conjonctivite', nom: 'Conjonctivite', gravite: 'benin',
    symptomes: { yeux_rouges: 3, yeux_colles: 3, yeux_larmoyants: 2, demangeaisons: 1 },
    conseils: ["Nettoyer les yeux au sérum physiologique", "Se laver les mains souvent", "Ne pas se frotter les yeux"],
    consulter: "si douleur, gêne à la lumière ou troubles de la vision",
    medocs: ['serum']
  },
  {
    id: 'otite', nom: 'Otite', gravite: 'modere',
    symptomes: { douleur_oreille: 3, ecoulement_oreille: 3, fievre: 2, fatigue: 1 },
    conseils: ["Paracétamol pour la douleur", "Ne rien introduire dans l'oreille"],
    consulter: "pour examen de l'oreille (surtout chez l'enfant)",
    medocs: ['paracetamol']
  },
  {
    id: 'intoxication', nom: 'Intoxication alimentaire', gravite: 'benin',
    symptomes: { vomissements: 3, diarrhee: 3, douleur_abdo: 2, nausees: 2, fievre: 1 },
    conseils: ["S'hydrater par petites gorgées", "Alimentation légère", "Repos"],
    consulter: "si déshydratation, sang dans les selles ou > 2-3 jours",
    medocs: ['sro', 'smecta', 'spasfon']
  },
  {
    id: 'bronchite', nom: 'Bronchite', gravite: 'modere',
    symptomes: { toux_grasse: 3, fatigue: 2, fievre: 1, sifflement: 2, douleur_thorax: 1 },
    conseils: ["Hydratation abondante", "Éviter le tabac", "Miel pour apaiser la toux"],
    consulter: "si essoufflement, fièvre persistante ou toux > 3 semaines",
    medocs: ['paracetamol']
  },
  {
    id: 'varicelle', nom: 'Varicelle', gravite: 'modere',
    symptomes: { eruption: 3, demangeaisons: 3, fievre: 2, fatigue: 1 },
    conseils: ["Ne pas gratter les boutons", "Paracétamol UNIQUEMENT (jamais d'ibuprofène)", "Isoler la personne"],
    consulter: "pour confirmer, surtout chez un adulte ou une personne fragile",
    medocs: ['paracetamol', 'antiseptique']
  },
  {
    id: 'rgo', nom: "Reflux gastrique (brûlures d'estomac)", gravite: 'benin',
    symptomes: { brulures_estomac: 3, remontees_acides: 3, ballonnements: 1, nausees: 1 },
    conseils: ["Éviter les repas lourds et gras le soir", "Ne pas se coucher juste après manger", "Anti-acide en vente libre"],
    consulter: "si brûlures fréquentes (> 2 fois/semaine) ou difficulté à avaler",
    medocs: ['gaviscon']
  },
  {
    id: 'constipation_t', nom: 'Constipation', gravite: 'benin',
    symptomes: { constipation: 3, ballonnements: 2, douleur_abdo: 1 },
    conseils: ["Boire plus d'eau", "Fibres : fruits, légumes, céréales complètes", "Marcher régulièrement"],
    consulter: "si douleur intense, sang dans les selles ou > 1 semaine",
    medocs: []
  },
  {
    id: 'coup_chaleur', nom: 'Coup de chaleur / déshydratation', gravite: 'modere',
    symptomes: { vertiges: 3, maux_tete: 2, nausees: 2, fatigue: 2, sueurs: 2 },
    conseils: ["Se mettre au frais immédiatement", "Boire de l'eau fraîche par petites gorgées", "Se reposer à l'ombre"],
    consulter: "si confusion, fièvre élevée ou malaise",
    medocs: ['sro']
  }
];

/* ===== Médicaments en vente libre ===== */
const MEDICAMENTS = [
  {
    id: 'paracetamol', nom: 'Paracétamol',
    marques: 'Doliprane, Efferalgan, Dafalgan',
    usage: 'Douleur et fièvre',
    adulte: '1g par prise (2 comprimés de 500mg), à renouveler toutes les 6h si besoin',
    max: 'Maximum 3g par jour — jamais plus',
    enfant_mgkg: 15,
    enfant_rythme: 'par prise, toutes les 6h',
    age_min: null, bebe: null,
    alertes: [
      'Ne jamais dépasser la dose maximale quotidienne',
      'Présent dans beaucoup de médicaments (Fervex, Actifed...) : ne jamais cumuler',
      'Danger en cas de maladie du foie'
    ],
    allergie_mots: ['paracetamol', 'paracétamol', 'doliprane', 'efferalgan', 'dafalgan'],
    interactions: []
  },
  {
    id: 'ibuprofene', nom: 'Ibuprofène',
    marques: 'Advil, Nurofen, Spedifen',
    usage: 'Douleur, fièvre, inflammation',
    adulte: '200 à 400mg par prise, au milieu d\'un repas',
    max: 'Maximum 1200mg par jour en automédication',
    enfant_mgkg: 10,
    enfant_rythme: 'par prise, 3 fois par jour pendant les repas',
    age_min: null,
    bebe: 'Déconseillé avant 3 mois.',
    alertes: [
      'Toujours pendant un repas (protège l\'estomac)',
      'Déconseillé en cas d\'ulcère, de varicelle, de déshydratation ou de grossesse',
      'Boire suffisamment d\'eau'
    ],
    allergie_mots: ['ibuprofene', 'ibuprofène', 'advil', 'nurofen', 'ains', 'aspirine', 'anti-inflammatoire'],
    interactions: ['anticoagulant', 'aspirine', 'cortisone', 'corticoide']
  },
  {
    id: 'aspirine', nom: 'Aspirine',
    marques: 'Aspégic, Aspro',
    usage: 'Douleur et fièvre (adulte uniquement)',
    adulte: '500mg à 1g par prise, au cours d\'un repas',
    max: 'Maximum 3g par jour',
    enfant_mgkg: null, enfant_fixe: null,
    age_min: 16, bebe: null,
    alertes: [
      'JAMAIS avant 16 ans (risque de syndrome de Reye, maladie grave)',
      'Irrite l\'estomac : toujours pendant un repas',
      'Déconseillée avec des anticoagulants'
    ],
    allergie_mots: ['aspirine', 'ains', 'anti-inflammatoire', 'ibuprofene', 'ibuprofène'],
    interactions: ['anticoagulant', 'ibuprofene', 'cortisone']
  },
  {
    id: 'spasfon', nom: 'Spasfon (phloroglucinol)',
    marques: 'Spasfon, génériques',
    usage: 'Douleurs et spasmes du ventre',
    adulte: '2 comprimés par prise, jusqu\'à 3 fois par jour',
    max: 'Ne pas dépasser 6 comprimés par jour',
    enfant_fixe: 'Forme adaptée à l\'âge (suppositoire ou lyoc) — suis la notice',
    age_min: null, bebe: null,
    alertes: ['Réservé aux douleurs de type spasmes (ventre, règles)'],
    allergie_mots: ['spasfon', 'phloroglucinol'],
    interactions: []
  },
  {
    id: 'gaviscon', nom: 'Gaviscon (anti-acide)',
    marques: 'Gaviscon, Gavisconell',
    usage: 'Brûlures d\'estomac, remontées acides',
    adulte: '1 sachet ou 2 comprimés après les repas et au coucher',
    max: 'Maximum 4 prises par jour',
    enfant_fixe: 'Possible chez l\'enfant sur avis du pharmacien',
    age_min: null, bebe: null,
    alertes: ['À prendre à distance des autres médicaments (2h)'],
    allergie_mots: ['gaviscon'],
    interactions: []
  },
  {
    id: 'smecta', nom: 'Smecta (diosmectite)',
    marques: 'Smecta, génériques',
    usage: 'Diarrhée',
    adulte: '1 sachet 3 fois par jour, dilué dans un verre d\'eau',
    max: null,
    enfant_fixe: '1 à 2 sachets par jour selon l\'âge, dilués dans un biberon ou un verre d\'eau',
    age_min: null, bebe: null,
    alertes: [
      'À prendre à distance des autres médicaments (2h)',
      'Pense à boire beaucoup : le danger de la diarrhée, c\'est la déshydratation'
    ],
    allergie_mots: ['smecta', 'diosmectite'],
    interactions: []
  },
  {
    id: 'sro', nom: 'Solution de réhydratation (SRO)',
    marques: 'Adiaril, génériques',
    usage: 'Déshydratation (gastro, forte chaleur)',
    adulte: 'Boire par petites gorgées régulières, autant que nécessaire',
    max: null,
    enfant_fixe: 'Boire par petites gorgées régulières, autant que nécessaire',
    age_min: null, bebe: null,
    alertes: ['Le traitement le plus important de la gastro, à tout âge'],
    allergie_mots: [],
    interactions: []
  },
  {
    id: 'loperamide', nom: 'Lopéramide',
    marques: 'Imodium, génériques',
    usage: 'Diarrhée aiguë (adulte uniquement)',
    adulte: '2mg après chaque selle liquide, sans dépasser 8mg par jour',
    max: 'Maximum 2 jours d\'utilisation',
    enfant_mgkg: null, enfant_fixe: null,
    age_min: 15, bebe: null,
    alertes: [
      'STOP si fièvre ou sang dans les selles : consulte',
      'Ne remplace pas la réhydratation (SRO)'
    ],
    allergie_mots: ['loperamide', 'lopéramide', 'imodium'],
    interactions: []
  },
  {
    id: 'cetirizine', nom: 'Cétirizine',
    marques: 'Zyrtec, génériques',
    usage: 'Allergie (éternuements, yeux qui piquent, urticaire)',
    adulte: '1 comprimé (10mg) une fois par jour',
    max: null,
    enfant_fixe: 'À partir de 6 ans : 1/2 à 1 comprimé par jour (sirop dès 2 ans)',
    age_min: null, bebe: null,
    alertes: ['Peut donner somnolence : prudence si tu conduis'],
    allergie_mots: ['cetirizine', 'cétirizine', 'zyrtec'],
    interactions: []
  },
  {
    id: 'loratadine', nom: 'Loratadine',
    marques: 'Clarityne, génériques',
    usage: 'Allergie (alternative, moins de somnolence)',
    adulte: '1 comprimé (10mg) une fois par jour',
    max: null,
    enfant_fixe: 'Enfant de plus de 30kg : 1 comprimé par jour ; sinon sirop adapté',
    age_min: null, bebe: null,
    alertes: [],
    allergie_mots: ['loratadine', 'clarityne'],
    interactions: []
  },
  {
    id: 'serum', nom: 'Sérum physiologique',
    marques: 'Toutes marques (dosettes)',
    usage: 'Lavage du nez et des yeux',
    adulte: '1 dosette par narine ou par œil, plusieurs fois par jour',
    max: null,
    enfant_fixe: '1 dosette par narine ou par œil, plusieurs fois par jour',
    age_min: null, bebe: null,
    alertes: ['Sans danger à tout âge, y compris nourrisson'],
    allergie_mots: [],
    interactions: []
  },
  {
    id: 'antiseptique', nom: 'Antiseptique cutané',
    marques: 'Biseptine, chlorhexidine aqueuse',
    usage: 'Plaies, boutons (varicelle), peau',
    adulte: 'Appliquer sur la zone 2 fois par jour',
    max: null,
    enfant_fixe: 'Appliquer sur la zone 1 à 2 fois par jour',
    age_min: null, bebe: null,
    alertes: ['Usage externe uniquement : ne pas avaler, éviter yeux et oreilles'],
    allergie_mots: ['chlorhexidine', 'biseptine'],
    interactions: []
  }
];
