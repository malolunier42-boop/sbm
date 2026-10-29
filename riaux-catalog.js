// Documentary presets transcribed from the Riaux catalogue supplied for SBM.
// Dimensions below are sketch controls, never manufacturer production limits.
export const STRUCTURE_TYPES = [
  { id: "auto", label: "Dessin libre", detail: "La structure de l’esquisse d’origine." },
  { id: "limon", label: "Limons latéraux", detail: "Deux lignes continues de part et d’autre des marches." },
  { id: "cut", label: "Limon découpé LDFC", detail: "Un profil découpé façon crémaillère." },
  { id: "offset", label: "Crémaillère décalée", detail: "La marche se détache de la structure latérale." },
  { id: "double", label: "Double crémaillère rapprochée", detail: "Deux appuis rapprochés sous les marches." },
  { id: "central-wood", label: "Crémaillère centrale bois", detail: "Une âme centrale creuse, dans l’esprit CCAC." },
  { id: "metal-double", label: "Crémaillère métal à entretoises", detail: "Deux profils centraux reliés par des entretoises." },
  { id: "metal-limon", label: "Limons métalliques", detail: "Un dessin latéral fin en métal thermolaqué." },
  { id: "metal-central", label: "Poutre centrale métallique", detail: "Les marches prennent appui sur une poutre centrale." },
  { id: "metal-cut", label: "Limon métal découpé", detail: "Une ligne métallique qui accompagne chaque marche." },
  { id: "wall", label: "Escalier entre cloisons", detail: "Une intention encloisonnée, à définir sur étude." },
  { id: "post", label: "Fût central", detail: "Les marches s’enroulent autour d’un fût." },
];
export const WOOD_FINISHES = [
  { id: "natural", label: "Vernis incolore", detail: "Préserver la couleur naturelle du bois." },
  { id: "pitch-pin", label: "Teinte pitch pin", detail: "Une nuance ambrée ; il s’agit d’une teinte." },
  { id: "grey-light", label: "Teinte gris clair", detail: "Un voile gris doux sur le veinage." },
  { id: "grey-dark", label: "Teinte gris foncé", detail: "Un veinage souligné par une nuance profonde." },
  { id: "blanched", label: "Chêne blanchi", detail: "La finition blanchie réservée au chêne." },
  { id: "sandblasted", label: "Mat sablé blanchi", detail: "La finition du chêne massif rustique." },
  { id: "wenge", label: "Teinte wengé", detail: "Une teinte brune soutenue." },
];
export const HANDRAILS = [
  { id: "auto", label: "Ligne de l’esquisse", detail: "La main courante du dessin libre." },
  { id: "round-wood", label: "Ronde en bois", detail: "Un profil rond sur supports." },
  { id: "rect-wood", label: "Rectangulaire en bois", detail: "Une prise en main au dessin net." },
  { id: "english-wood", label: "Bois à l’anglaise", detail: "Une continuité classique au-dessus des balustres." },
  { id: "flat-metal", label: "Fer plat", detail: "Une ligne fine en métal thermolaqué." },
  { id: "round-metal", label: "Ronde en métal", detail: "Un profil rond thermolaqué." },
  { id: "round-inox", label: "Ronde en inox", detail: "Une main courante aux reflets argentés." },
  { id: "wall-wood", label: "Murale ronde en bois", detail: "Sur écuyers, pour un escalier entre cloisons." },
  { id: "wall-rect-wood", label: "Murale droite en bois", detail: "Un profil rectangulaire sur écuyers." },
  { id: "wall-metal", label: "Murale en fer plat", detail: "Un profil mural sur écuyers." },
  { id: "wall-round-metal", label: "Murale ronde en métal", detail: "Un profil rond thermolaqué sur écuyers." },
  { id: "wall-inox", label: "Murale ronde en inox", detail: "Un profil rond inox sur écuyers." },
];
export const START_STEPS = [
  { id: "straight", label: "Départ droit" },
  { id: "front-post", label: "Départ devant poteau" },
  { id: "projecting", label: "Départ saillant" },
  { id: "rounded", label: "Départ arrondi" },
  { id: "double", label: "Double départ devant poteau" },
  { id: "double-projecting", label: "Double départ saillant" },
  { id: "double-rounded", label: "Double départ arrondi" },
  { id: "curved", label: "Double départ galbé" },
];
export const NOSINGS = [
  { id: "double-rounded", label: "Nez double arrondi" },
  { id: "square", label: "Nez carré" },
  { id: "none", label: "Sans nez de marche" },
  { id: "beak", label: "Bec de corbin" },
  { id: "under-rounded", label: "Arrondi dessous" },
];
export const LANDING_GUARDS = [
  { id: "none", label: "Sans palier représenté", detail: "Le palier et ses protections restent à définir." },
  { id: "vertical", label: "Balustres verticaux", detail: "Un barreaudage régulier au palier." },
  { id: "glass", label: "Verre sur pinces", detail: "Un soubassement transparent au palier." },
  { id: "wood", label: "Panneaux bois ajourés", detail: "La chaleur du bois au palier." },
  { id: "laser-curve", label: "Tôle laser · Courbe", detail: "Des lignes courbes qui se croisent." },
  { id: "laser-nature", label: "Tôle laser · Nature", detail: "Une inspiration végétale." },
  { id: "laser-wave", label: "Tôle laser · Vague", detail: "Un mouvement graphique souple." },
  { id: "laser-vitrail", label: "Tôle laser · Vitrail", detail: "Une composition géométrique dense." },
];
export const ANTI_SLIPS = [
  { id: "none", label: "Sans détail antidérapant représenté" },
  { id: "grooves", label: "Stries continues" },
  { id: "insert", label: "Profil aluminium et bande polymère" },
];
export const POST_CAPS = [
  { id: "flat", label: "Tête plate" },
  { id: "round", label: "Tête arrondie" },
  { id: "chamfer", label: "Tête chanfreinée" },
  { id: "diamond", label: "Tête diamant" },
  { id: "diamond-chamfer", label: "Tête diamant congé" },
  { id: "ball", label: "Boule bois" },
  { id: "acorn", label: "Gland" },
  { id: "brass-ball", label: "Boule laiton" },
  { id: "disk", label: "Galette contre cloison" },
  { id: "scroll", label: "Volute contre cloison" },
];
export const BALUSTER_STYLES = [
  { id: "plain", label: "Balustre droit sans motif" },
  ...Array.from({ length: 7 }, (_, index) => ({ id: `wood-t${index}`, label: `Bois tourné T${index}` })),
  { id: "metal-m0", label: "Métal M0 · Ø 18 mm" },
  { id: "metal-m1", label: "Métal M1 · bague à collerette" },
  { id: "metal-m2", label: "Métal M2 · bagues simples" },
  { id: "metal-m3", label: "Métal M3 · manchon et bagues à collerette" },
  { id: "metal-m4", label: "Métal M4 · manchon et bagues simples" },
  { id: "metal-m5", label: "Métal M5 · manchon et bagues à collerette" },
];
export const POST_STYLES = [
  { id: "standard", label: "Poteau du modèle" },
  { id: "marine-wood", label: "Poteau marine bois" },
  { id: "marine-inox", label: "Poteau marine inox" },
  { id: "marine-metal", label: "Poteau marine métal" },
  { id: "marine-crook", label: "Poteau marine et crosse bois" },
  { id: "cast-iron", label: "Poteau fonte" },
];
export const SLAB_TRIMS = [
  { id: "none", label: "Sans habillage représenté" },
  { id: "wood", label: "Habillage bois massif et cornière bois" },
  { id: "plywood", label: "Habillage complet contreplaqué" },
  { id: "painted", label: "Habillage médium à peindre" },
  { id: "metal", label: "Cornière métal" },
  { id: "inox", label: "Cornière inox" },
];
export const RAIL_MATERIALS = [
  { id: "inox", label: "Lisses inox" },
  { id: "metal", label: "Métal thermolaqué" },
  { id: "aluminium", label: "Aluminium anodisé mat" },
  { id: "wood", label: "Balustres bois" },
];
export const RAIL_PATTERNS = [
  { id: "standard", label: "Lisses régulières" },
  { id: "one-three-one", label: "Lisses 1–3–1" },
  { id: "rings", label: "Balustres avec bagues" },
];
export const STRUCTURE_FINISHES = [
  { id: "natural", label: "Bois naturel ou métal apparent" },
  { id: "painted", label: "Structure peinte" },
];
export const QUARTER_POSITIONS = [
  { id: "low", label: "Quart tournant bas" },
  { id: "middle", label: "Quart tournant milieu" },
  { id: "high", label: "Quart tournant haut" },
];
export const TURN_LAYOUTS = [
  { id: "balanced", label: "Deux quarts tournants" },
  { id: "square-well", label: "Jour carré" },
  { id: "stacked", label: "Rampe sur rampe" },
  { id: "landing", label: "Avec palier de repos" },
];
export const TRICOLORE_PALETTES = [
  { id: "roze-on-art", label: "Roze On’Art", structureColor: "#8d463d", postColor: "#1c1c1b" },
  { id: "amandine", label: "Amandine", structureColor: "#53565a", postColor: "#a3b39a" },
  { id: "plume", label: "Plume", structureColor: "#56585d", postColor: "#24616a" },
  { id: "cocoa", label: "Cocoa", structureColor: "#6a5146", postColor: "#e4dfd3" },
];

const RECTILINEAR = ["straight", "quarter", "half"];
const WOOD_FLOOR_GUARDS = ["glass", "wood", "laser-curve", "laser-nature", "laser-wave", "laser-vitrail"];
const METAL_FLOOR_GUARDS = ["glass", "laser-curve", "laser-nature", "laser-wave", "laser-vitrail"];
const WOOD_MATERIALS = ["beech", "wood"];
const WOOD_TREADS = ["beech", "oak"];
const JOINERY_NOTES = [
  "Implantation, dimensions et protections définitives à confirmer sur étude.",
  "Les teintes affichées sont des simulations : choisissez les échantillons avec l’atelier.",
];
function woodModel(id, label, pages, structureType, handrail, settings = {}) {
  const family = settings.family || "wood";
  const collection = settings.collection || "collection-2";
  const catalogueRisers = settings.risers || [false];
  const simpleStarts = settings.allowed?.startStep || ["projecting"];
  const startVariants = { straight: ["front-post", "double"], projecting: ["double-projecting"], rounded: ["double-rounded", "curved"] };
  const startSteps = family === "enclosed" ? simpleStarts
    : [...new Set(simpleStarts.flatMap((start) => [start, ...(startVariants[start] || [])]))];
  return {
    id, label, pages, family, collection,
    collectionLabel: collection === "collection-1" ? "Avec ou sans contremarches" : "Collection sans contremarches",
    description: settings.description || `${label} associe une structure en bois à un dessin ${family === "mixed" ? "mixte, bois et métal" : "soigné dans chaque détail"}.`,
    defaults: {
      shape: "quarter", quarterPosition: "low", structureMaterial: "beech", treadMaterial: "beech",
      structureType, handrail, railing: "horizontal", railMaterial: "inox",
      railPattern: "standard", woodFinish: "natural", structureFinish: "natural",
      startStep: "projecting", nosing: structureType === "central-wood" ? "under-rounded" : "double-rounded",
      landingGuard: "glass", postColor: "#383d3a", risers: false, led: false,
      ...settings.defaults,
    },
    allowed: {
      shape: RECTILINEAR, structureMaterial: WOOD_MATERIALS, treadMaterial: WOOD_TREADS,
      structureType: [structureType], handrail: [handrail], railing: ["horizontal"],
      railMaterial: ["inox"], railPattern: ["standard"],
      structureFinish: ["natural", "painted"],
      nosing: [structureType === "central-wood" ? "under-rounded" : "double-rounded"],
      landingGuard: WOOD_FLOOR_GUARDS, risers: catalogueRisers, led: [false],
      packDeco: [false], postCap: POST_CAPS.map((item) => item.id),
      ...settings.allowed,
      startStep: startSteps,
    },
    notes: [...(settings.notes || []), ...JOINERY_NOTES],
  };
}

const collectionOne = { collection: "collection-1", risers: [false, true] };
const lcaWoods = ["beech-lca", "beech", "wood"];
const lcaTreads = ["beech-lca", "beech", "oak"];
const paired = { structureMaterial: lcaWoods, treadMaterial: lcaTreads, startStep: ["straight", "projecting"] };
const rusticPair = { treadMaterial: ["beech", "oak", "oak-rustic"] };
const marine = { family: "mixed", allowed: { railMaterial: ["metal"], landingGuard: METAL_FLOOR_GUARDS } };

function metalModel(id, label, pages, structureType, settings = {}) {
  return {
    id, label, pages, collection: "collection-2", collectionLabel: "Collection sans contremarches", family: "metal",
    description: settings.description || `${label} dessine une silhouette métallique avec des marches en bois.`,
    defaults: {
      shape: "quarter", quarterPosition: "low", structureMaterial: "steel", treadMaterial: "beech", structureType,
      structureColor: "#1c1c1b", structureFinish: "painted", woodFinish: "natural",
      handrail: "round-wood", railing: "horizontal", railMaterial: "metal", railPattern: "standard",
      startStep: "projecting", nosing: "square", landingGuard: "glass",
      risers: false, led: false, postColor: "#1c1c1b", ...settings.defaults,
    },
    allowed: {
      shape: RECTILINEAR, structureMaterial: ["steel"], treadMaterial: ["beech-lca", "beech", "oak", "oak-rustic"],
      structureType: [structureType], structureFinish: ["painted"],
      handrail: ["round-wood", "round-metal", "flat-metal"], railing: ["horizontal"],
      railMaterial: ["metal"], railPattern: ["standard"], startStep: ["projecting"], nosing: ["square"],
      landingGuard: METAL_FLOOR_GUARDS, risers: [false], led: [false], packDeco: [false], postCap: ["flat"],
      ...settings.allowed,
    },
    notes: [...(settings.notes || []), ...JOINERY_NOTES],
  };
}

export const MODELS = [
  {
    id: "custom", label: "Création libre", collection: "custom", collectionLabel: "Votre esquisse sur mesure", family: "custom",
    description: "Partez d’une page blanche et explorez librement vos idées avec l’atelier.", pages: "",
    defaults: {}, allowed: {}, notes: ["Chaque combinaison libre reste une intention à faire étudier par l’atelier."],
  },
  woodModel("elementaire", "Élément’aire", "12–13 · annexe 64", "limon", "rect-wood", {
    ...collectionOne,
    description: "L’hévéa clair et l’aluminium anodisé mat, dans un dessin essentiel.",
    defaults: { shape: "straight", structureMaterial: "hevea", treadMaterial: "hevea", railMaterial: "aluminium", startStep: "straight", landingGuard: "vertical" },
    allowed: { structureMaterial: ["hevea"], treadMaterial: ["hevea"], railMaterial: ["aluminium"], woodFinish: ["natural"], structureFinish: ["natural"], landingGuard: ["vertical"], startStep: ["straight", "projecting"] },
    notes: ["Mise à jour 2026 : garde-corps d’étage à balustres aluminium anodisé mat uniquement ; l’ancien panneau PLB est arrêté.", "Pas de garde-corps cintré."],
  }),
  woodModel("origine", "Origine", "14–15", "limon", "rect-wood", {
    ...collectionOne, description: "Une ligne de bois intemporelle, avec plusieurs dessins de lisses ou de balustres.",
    allowed: { ...paired, structureMaterial: ["hevea", ...lcaWoods], treadMaterial: ["hevea", ...lcaTreads], railing: ["horizontal", "vertical"], railMaterial: ["inox", "metal", "wood"], landingGuard: ["vertical", ...WOOD_FLOOR_GUARDS], packDeco: [false, true] },
    notes: ["Le Pack Déco est réservé aux droits et quarts tournants bas ou hauts, avec lisses inox.", "Les variantes de lisses métalliques de cette fiche sont proposées en noir, blanc cassé ou gun métal."],
  }),
  woodModel("harmonie", "Harmonie", "16–17", "cut", "rect-wood", {
    ...collectionOne, description: "Le limon découpé donne une cadence légère à la structure en bois.",
    allowed: { ...paired, railing: ["horizontal", "vertical"], railMaterial: ["inox", "metal"], landingGuard: ["vertical", ...WOOD_FLOOR_GUARDS] },
    notes: ["La fiche propose les variantes thermolaquées en noir, blanc cassé ou gun métal."],
  }),
  woodModel("tricolore", "Tricolore", "18–19", "limon", "rect-wood", {
    ...collectionOne, description: "Trois lectures de couleur : marches naturelles, structure et lisses, poteaux et main courante.",
    defaults: { structureFinish: "painted", structureColor: "#8d463d", postColor: "#1c1c1b", railMaterial: "metal" },
    allowed: { structureMaterial: ["beech"], treadMaterial: ["beech"], railMaterial: ["metal"], structureFinish: ["painted"], woodFinish: ["natural"], startStep: ["straight", "projecting"], landingGuard: ["glass", "wood"] },
    notes: ["Les palettes Roze On’Art, Amandine, Plume et Cocoa sont proposées comme points de départ.", "Le catalogue illustre aussi un dessin appelé Jazz, sans le présenter comme une référence séparée au sommaire."],
  }),
  woodModel("cottage", "Cottage", "20–21", "limon", "english-wood", {
    ...collectionOne, description: "Une main courante à l’anglaise et des balustres métalliques au caractère classique.",
    defaults: { shape: "half", turnLayout: "square-well", railing: "vertical", railMaterial: "metal", railPattern: "rings", startStep: "rounded", landingGuard: "vertical" },
    allowed: { railing: ["vertical"], railMaterial: ["metal"], railPattern: ["standard", "rings"], balusterStyle: ["plain", "metal-m0", "metal-m3"], startStep: ["straight", "rounded"], landingGuard: ["vertical"] },
  }),
  woodModel("ambition", "Ambition", "22–23", "limon", "round-wood", {
    ...collectionOne, description: "Une main courante ronde sur pitons souligne la ligne des limons.",
    defaults: { shape: "half" },
    allowed: { ...paired, packDeco: [false, true] },
    notes: ["Le Pack Déco est réservé aux droits et quarts tournants bas ou hauts, avec lisses inox."],
  }),
  woodModel("boreal", "Boréal", "24–25", "cut", "round-wood", {
    ...collectionOne, description: "Le bois découpé et les lisses inox dessinent un ensemble ouvert et lumineux.",
    defaults: { shape: "half" }, allowed: paired,
    notes: ["Un garde-corps rampant extérieur cintré peut être étudié selon la configuration."],
  }),
  woodModel("escale", "Escale", "26–27", "limon", "round-wood", {
    ...collectionOne, family: "mixed", description: "Limons bois, poteaux en fer plat et lisses inox traversantes.",
    defaults: { quarterPosition: "middle" }, allowed: { startStep: ["straight", "projecting"], landingGuard: ["glass"] },
  }),
  woodModel("duplex", "Duplex", "28–29", "limon", "wall-wood", {
    collection: "collection-1", family: "enclosed", risers: [true],
    description: "Un escalier à contremarches conçu pour prendre place entre deux cloisons.",
    defaults: { shape: "half", risers: true, startStep: "straight", railMaterial: "wood", landingGuard: "none" },
    allowed: { structureMaterial: ["hevea", "beech-lca", "beech", "wood"], treadMaterial: ["hevea", "beech-lca", "beech", "oak"], handrail: ["wall-wood", "wall-rect-wood", "wall-metal", "wall-round-metal", "wall-inox"], railMaterial: ["wood"], woodFinish: ["natural"], structureFinish: ["natural"], startStep: ["straight"], nosing: ["double-rounded", "none"], landingGuard: ["none"] },
    notes: ["Hévéa LCA réservé au Duplex de base, avec nez double arrondi.", "La main courante est murale, sur écuyers ; les cloisons font partie de l’implantation à étudier."],
  }),
  woodModel("style", "Style", "28–29", "cut", "wall-metal", {
    collection: "collection-1", family: "enclosed", risers: [true],
    description: "Entre cloisons, une crémaillère et des marches sans nez pour une lecture nette.",
    defaults: { shape: "straight", risers: true, startStep: "straight", nosing: "none", railMaterial: "wood", landingGuard: "none" },
    allowed: { structureMaterial: ["beech-lca", "beech", "wood"], treadMaterial: ["beech-lca", "beech", "oak"], handrail: ["wall-wood", "wall-rect-wood", "wall-metal", "wall-round-metal", "wall-inox"], railMaterial: ["wood"], woodFinish: ["natural"], structureFinish: ["natural"], startStep: ["straight"], nosing: ["none", "double-rounded"], landingGuard: ["none"] },
  }),
  woodModel("austral", "Austral", "32–33", "offset", "round-wood", {
    description: "Une crémaillère décalée en bois, accompagnée d’une main courante ronde sur pitons.",
    defaults: { quarterPosition: "high" }, allowed: { startStep: ["straight", "projecting"] },
  }),
  woodModel("urbain", "Urbain", "34–35", "double", "round-wood", { allowed: rusticPair }),
  woodModel("chic", "Chic", "34–35", "central-wood", "round-wood", { defaults: { shape: "straight" }, allowed: rusticPair }),
  woodModel("fabrique", "Fabrique", "36–37", "offset", "rect-wood", {
    description: "La crémaillère décalée et les lisses 1–3–1 donnent un rythme d’atelier.",
    defaults: { railPattern: "one-three-one" }, allowed: { railPattern: ["one-three-one"], startStep: ["straight", "projecting"], landingGuard: ["vertical", ...WOOD_FLOOR_GUARDS] },
    notes: ["La main courante rectangulaire sur double pitons reprend la finition des poteaux et de la crémaillère."],
  }),
  woodModel("dynamique", "Dynamique", "38–39", "double", "rect-wood", { defaults: { shape: "half", railPattern: "one-three-one" }, allowed: { ...rusticPair, railPattern: ["one-three-one"], landingGuard: ["vertical", ...WOOD_FLOOR_GUARDS] } }),
  woodModel("rythmique", "Rythmique", "38–39", "central-wood", "rect-wood", { defaults: { quarterPosition: "middle", railPattern: "one-three-one" }, allowed: { ...rusticPair, railPattern: ["one-three-one"], landingGuard: ["vertical", ...WOOD_FLOOR_GUARDS] } }),
  woodModel("sillage", "Sillage", "40–41", "offset", "round-wood", { family: "mixed", defaults: { shape: "half", turnLayout: "square-well" }, allowed: { landingGuard: ["glass"] } }),
  woodModel("transat", "Transat", "42–43", "double", "round-wood", { family: "mixed", defaults: { shape: "half", turnLayout: "landing" }, allowed: { ...rusticPair, landingGuard: ["glass"] } }),
  woodModel("vogue", "Vogue", "42–43", "central-wood", "round-wood", { family: "mixed", allowed: { ...rusticPair, landingGuard: ["glass"] } }),
  woodModel("voile", "Voile", "44–45", "offset", "flat-metal", { ...marine, defaults: { railMaterial: "metal", quarterPosition: "middle" }, allowed: { ...marine.allowed, handrail: ["flat-metal", "round-wood"] } }),
  woodModel("nautique", "Nautique", "46–47", "double", "flat-metal", { ...marine, defaults: { railMaterial: "metal", shape: "half" }, allowed: { ...marine.allowed, ...rusticPair, handrail: ["flat-metal", "round-wood"] } }),
  woodModel("cap", "Cap", "46–47", "central-wood", "flat-metal", { ...marine, defaults: { railMaterial: "metal" }, allowed: { ...marine.allowed, ...rusticPair, handrail: ["flat-metal", "round-wood"] } }),
  metalModel("zephyr", "Zephyr", "48–49", "metal-limon", {
    description: "Deux limons métalliques, des marches en bois et des lisses inox traversantes.",
    defaults: { quarterPosition: "middle", startStep: "straight", railMaterial: "inox" },
    allowed: { handrail: ["round-wood"], railMaterial: ["inox"], startStep: ["straight"], landingGuard: ["glass"], risers: [false, true] },
    notes: ["Les contremarches sont possibles uniquement sans aménagement en dessous."],
  }),
  metalModel("sonora", "Sonora", "50–51", "metal-limon", { defaults: { startStep: "straight" }, allowed: { startStep: ["straight"], risers: [false, true] }, notes: ["Les contremarches sont possibles uniquement sans aménagement en dessous."] }),
  metalModel("levant", "Levant", "52–53", "metal-double", {
    description: "Des marches en bois sur une crémaillère centrale métallique à entretoises inox.",
    defaults: { railMaterial: "inox" }, allowed: { handrail: ["round-wood"], railMaterial: ["inox"], landingGuard: ["glass"] },
    notes: ["La fiche décrit une crémaillère centrale à entretoises inox ; son détail constructif sera confirmé sur étude."],
  }),
  metalModel("lips", "Lips", "54–55", "metal-central", { defaults: { shape: "half", turnLayout: "landing", structureColor: "#53565a", postColor: "#53565a" }, description: "Une poutre centrale métallique porte des marches bois au dessin ouvert." }),
  metalModel("mistral", "Mistral", "56–57", "metal-cut", { defaults: { startStep: "straight", quarterPosition: "high", structureColor: "#8d463d", postColor: "#8d463d" }, allowed: { startStep: ["straight"] } }),
  {
    id: "kit-carre", label: "Kit Carré", pages: "58", collection: "specific", collectionLabel: "Les spécifiques", family: "specific",
    description: "Un escalier qui s’enroule dans un volume carré autour d’un fût central inox.",
    defaults: { shape: "spiral-square", diameter: 220, structureType: "post", structureMaterial: "stainless", structureColor: "#e4dfd3", treadMaterial: "beech", handrail: "round-inox", railMaterial: "inox", railing: "horizontal", risers: false, structureFinish: "natural", woodFinish: "natural", startStep: "straight", nosing: "square", landingGuard: "glass" },
    allowed: { shape: ["spiral-square"], structureType: ["post"], structureMaterial: ["stainless"], treadMaterial: ["beech"], handrail: ["round-inox"], railMaterial: ["inox"], railing: ["horizontal"], risers: [false], led: [false], structureFinish: ["natural"], woodFinish: ["natural"], startStep: ["straight"], nosing: ["square"], landingGuard: ["glass"], railPattern: ["standard"], packDeco: [false], postCap: ["flat"] },
    notes: ["Le fût inox, le limon blanc cassé et les marches hêtre sont ceux présentés au catalogue.", "Configuration, diamètre et protections à définir avec l’atelier."],
  },
  {
    id: "circulaire", label: "Circulaire", pages: "58", collection: "specific", collectionLabel: "Les spécifiques", family: "specific",
    description: "Des marches en bois sur entretoises autour d’un fût métallique central.",
    defaults: { shape: "spiral", diameter: 220, structureType: "post", structureMaterial: "steel", structureColor: "#1c1c1b", treadMaterial: "beech", handrail: "flat-metal", railMaterial: "metal", railing: "horizontal", risers: false, structureFinish: "painted", woodFinish: "natural", startStep: "straight", nosing: "square", landingGuard: "glass" },
    allowed: { shape: ["spiral"], structureType: ["post"], structureMaterial: ["steel"], treadMaterial: ["beech"], handrail: ["flat-metal"], railMaterial: ["metal"], railing: ["horizontal"], risers: [false], led: [false], structureFinish: ["painted"], woodFinish: ["natural"], startStep: ["straight"], nosing: ["square"], landingGuard: ["glass"], railPattern: ["standard"], packDeco: [false], postCap: ["flat"] },
    notes: ["Le catalogue montre des marches hêtre vernies et une structure métallique noire.", "Configuration et diamètre à définir avec l’atelier."],
  },
  {
    id: "outdoor", label: "Extérieur en iroko", pages: "59", collection: "outdoor", collectionLabel: "Outdoor", family: "outdoor",
    description: "Une ligne extérieure en iroko brut, avec crémaillère décalée et balustres bois.",
    defaults: { shape: "straight", structureType: "offset", structureMaterial: "iroko", treadMaterial: "iroko", handrail: "rect-wood", railMaterial: "wood", railing: "vertical", risers: false, structureFinish: "natural", woodFinish: "natural", startStep: "straight", nosing: "double-rounded", landingGuard: "vertical", postCap: "flat" },
    allowed: { shape: ["straight"], structureType: ["offset"], structureMaterial: ["iroko"], treadMaterial: ["iroko"], handrail: ["rect-wood"], railMaterial: ["wood"], railing: ["vertical"], risers: [false], led: [false], structureFinish: ["natural"], woodFinish: ["natural"], startStep: ["straight"], nosing: ["double-rounded"], landingGuard: ["vertical"], railPattern: ["standard"], packDeco: [false], postCap: ["flat", "round"] },
    notes: ["Iroko extérieur, brut de ponçage ; palier d’arrivée et consoles à étudier selon le lieu.", "Le rendu 3D est une intention d’implantation, sans dimensionnement de fixation."],
  },
];

export function getModel(id) {
  return MODELS.find((model) => model.id === id) || MODELS[0];
}
