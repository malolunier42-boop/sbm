// Shared, allowlisted project vocabulary. No commercial prices are inferred here.
import {
  MODELS, STRUCTURE_TYPES, WOOD_FINISHES, HANDRAILS, START_STEPS, NOSINGS,
  LANDING_GUARDS, ANTI_SLIPS, POST_CAPS, RAIL_MATERIALS, RAIL_PATTERNS,
  BALUSTER_STYLES, POST_STYLES, SLAB_TRIMS,
  STRUCTURE_FINISHES, QUARTER_POSITIONS, TURN_LAYOUTS, TRICOLORE_PALETTES, getModel,
} from "./riaux-catalog.js";
export {
  MODELS, STRUCTURE_TYPES, WOOD_FINISHES, HANDRAILS, START_STEPS, NOSINGS,
  LANDING_GUARDS, ANTI_SLIPS, POST_CAPS, RAIL_MATERIALS, RAIL_PATTERNS,
  BALUSTER_STYLES, POST_STYLES, SLAB_TRIMS,
  STRUCTURE_FINISHES, QUARTER_POSITIONS, TURN_LAYOUTS, TRICOLORE_PALETTES, getModel,
};
export const SHAPES = [
  {
    id: "spiral",
    label: "Hélicoïdal",
    subtitle: "Une présence sculpturale",
    path: "M21 8c-12 0-16 8-7 13s20 9 10 15S5 43 5 52m16-44v45",
  },
  {
    id: "straight",
    label: "Droit",
    subtitle: "La pureté d’une ligne",
    path: "M7 50h9V40h9V30h9V20h9V10h10M9 33 47 4",
  },
  {
    id: "quarter",
    label: "Quart tournant",
    subtitle: "Le sens de l’espace",
    path: "M8 52V30h26V8h18M8 44h26M8 37h26M34 30V8M42 8v22M50 8v22",
  },
  {
    id: "half",
    label: "Demi-tournant",
    subtitle: "Un rythme architectural",
    path: "M9 51V10h42v41M9 16h42M9 24h16m-16 8h16M9 40h16m10-16h16m-16 8h16m-16 8h16M25 51V24h10v27",
  },
];
export const MATERIALS = [
  {
    id: "oak",
    label: "Chêne naturel",
    short: "Chêne",
    detail: "Un grain vivant, une teinte lumineuse.",
    className: "wood-oak",
  },
  {
    id: "walnut",
    label: "Noyer",
    short: "Noyer",
    detail: "Des nuances profondes et chaleureuses.",
    className: "wood-walnut",
  },
  {
    id: "ash",
    label: "Frêne clair",
    short: "Frêne",
    detail: "La douceur d’un bois blond.",
    className: "wood-ash",
  },
  {
    id: "steel",
    label: "Acier",
    short: "Acier",
    detail: "Un esprit industriel affirmé.",
    className: "material-steel",
  },
  {
    id: "stone",
    label: "Pierre minérale",
    short: "Pierre",
    detail: "Une intention minérale, nette et intemporelle.",
    className: "material-stone",
  },
];
export const METAL_FINISHES = [
  { id: "matte", label: "Mat", detail: "Un reflet discret." },
  { id: "brushed", label: "Brossé", detail: "La matière sous la lumière." },
  { id: "polished", label: "Poli", detail: "Des reflets plus présents." },
];
export const STRUCTURES = [
  { id: "steel", label: "Acier", detail: "Une structure aux couleurs de votre choix.", className: "structure-steel", family: "metal" },
  { id: "wood", label: "Chêne", detail: "Un bois naturel, clair et chaleureux.", className: "wood-oak", family: "wood" },
  { id: "walnut", label: "Noyer", detail: "Une structure en bois aux tons profonds.", className: "wood-walnut", family: "wood" },
  { id: "ash", label: "Frêne", detail: "Un bois blond à l’allure lumineuse.", className: "wood-ash", family: "wood" },
  { id: "aluminium", label: "Aluminium", detail: "Un métal clair, dans sa teinte naturelle.", className: "structure-aluminium", family: "metal" },
  { id: "stainless", label: "Inox", detail: "L’acier inoxydable et ses reflets argentés.", className: "structure-stainless", family: "metal" },
];
export const RAILINGS = [
  { id: "none", label: "Sans garde-corps", short: "Sans garde-corps", detail: "Explorer la ligne de l’escalier seule." },
  {
    id: "vertical",
    label: "Barreaudage vertical",
    short: "Vertical",
    detail: "Un dessin fin et régulier.",
  },
  {
    id: "horizontal",
    label: "Lignes horizontales",
    short: "Horizontal",
    detail: "Un rythme graphique.",
  },
  {
    id: "glass",
    label: "Panneaux de verre",
    short: "Verre",
    detail: "Une transparence visuelle.",
  },
  {
    id: "solid",
    label: "Ruban plein",
    short: "Ruban plein",
    detail: "Une silhouette sculpturale.",
  },
];
export const COLORS = [
  {
    id: "graphite",
    label: "Graphite",
    hex: "#383d3a",
    reference: "inspiration RAL 9011",
  },
  {
    id: "ivory",
    label: "Ivoire",
    hex: "#e2dfd1",
    reference: "inspiration RAL 9002",
  },
  {
    id: "anthracite",
    label: "Anthracite",
    hex: "#41484b",
    reference: "inspiration RAL 7016",
  },
  {
    id: "forest",
    label: "Vert forêt",
    hex: "#254d3f",
    reference: "inspiration RAL 6005",
  },
  {
    id: "blue",
    label: "Bleu ardoise",
    hex: "#3c5361",
    reference: "inspiration RAL 5008",
  },
  {
    id: "terracotta",
    label: "Terre cuite",
    hex: "#a75d43",
    reference: "inspiration RAL 8004",
  },
  {
    id: "bronze",
    label: "Bronze",
    hex: "#ac8057",
    reference: "nuance d’inspiration",
  },
  {
    id: "sand",
    label: "Sable",
    hex: "#c3b494",
    reference: "nuance d’inspiration",
  },
];
export const AMBIENCES = [
  { id: "studio", label: "Studio épuré", detail: "L’escalier, tout simplement.", short: "Studio", icon: "M5 18h14M8 15V9l4-3 4 3v6" },
  { id: "warm", label: "Maison chaleureuse", detail: "Parquet, tons doux et lumière chaude.", short: "Maison", icon: "m3 11 9-7 9 7M5 10v10h14V10M10 20v-7h4v7" },
  { id: "contemporary", label: "Intérieur contemporain", detail: "Volumes clairs et matières minérales.", short: "Contemporain", icon: "M4 20V5h10v15M14 10h6v10M8 8h2m-2 4h2m-2 4h2M3 20h18" },
  { id: "professional", label: "Espace professionnel", detail: "Un accueil soigné, une autre perspective.", short: "Professionnel", icon: "M3 20h18M5 20V4h14v16M8 8h2m4 0h2M8 12h2m4 0h2M10 20v-4h4v4" },
];
SHAPES.push({
  id: "spiral-square", label: "Hélicoïdal carré", subtitle: "Un enroulement dans un volume carré",
  path: "M9 52V10h43v42H20V23h20v17H29M9 16h43M9 27h11m-11 12h11M28 10v13m12-13v13M40 40v12M20 40h20",
});
MATERIALS.push(
  { id: "hevea", label: "Hévéa LCA", short: "Hévéa", detail: "Une essence claire aux nuances discrètes.", className: "wood-hevea", family: "wood" },
  { id: "beech-lca", label: "Hêtre LCA", short: "Hêtre LCA", detail: "Une composition de bois aux tons doux et réguliers.", className: "wood-beech-lca", family: "wood" },
  { id: "beech", label: "Hêtre massif", short: "Hêtre", detail: "Un grain fin pour le vernis, la teinte ou une structure peinte.", className: "wood-beech", family: "wood" },
  { id: "oak-rustic", label: "Chêne massif rustique", short: "Chêne rustique", detail: "Un bois expressif en finition mat sablé blanchi.", className: "wood-oak-rustic", family: "wood" },
  { id: "iroko", label: "Iroko extérieur", short: "Iroko", detail: "Le bois de la proposition extérieure du catalogue.", className: "wood-iroko", family: "wood" },
);
STRUCTURES.push(
  { id: "hevea", label: "Hévéa LCA", detail: "La structure claire du modèle Élément’aire.", className: "wood-hevea", family: "wood" },
  { id: "beech-lca", label: "Hêtre LCA", detail: "Une structure en bois aux tons réguliers.", className: "wood-beech-lca", family: "wood" },
  { id: "beech", label: "Hêtre massif", detail: "À associer aux marches bois et aux finitions du modèle.", className: "wood-beech", family: "wood" },
  { id: "oak-rustic", label: "Chêne rustique", detail: "Une intention de bois au caractère marqué.", className: "wood-oak-rustic", family: "wood" },
  { id: "iroko", label: "Iroko extérieur", detail: "Une structure en bois pour la proposition Outdoor.", className: "wood-iroko", family: "wood" },
);
COLORS.push(
  { id: "black-9005", label: "Noir", hex: "#1c1c1b", reference: "nuance indicative RAL 9005" },
  { id: "off-white", label: "Blanc cassé", hex: "#e4dfd3", reference: "nuancier du catalogue Riaux" },
  { id: "gun-metal", label: "Gun métal", hex: "#53565a", reference: "nuancier du catalogue Riaux" },
  { id: "sanded-2100", label: "RAL 2100 S sablé", hex: "#56585d", reference: "simulation du nuancier Riaux" },
  { id: "cocoa", label: "Cocoa", hex: "#6a5146", reference: "nuancier du catalogue Riaux" },
  { id: "almond", label: "Vert amande", hex: "#a3b39a", reference: "nuancier du catalogue Riaux" },
  { id: "duck-blue", label: "Bleu canard", hex: "#24616a", reference: "nuancier du catalogue Riaux" },
  { id: "mars-red", label: "Rouge de mars", hex: "#8d463d", reference: "nuancier du catalogue Riaux" },
);

export const DIMENSION_LIMITS = Object.freeze({
  custom: { height: [240, 360], width: [70, 130], steps: [12, 20] },
  catalogue: { height: [150, 420], width: [60, 180], steps: [6, 28] },
  going: [18, 40], landingDepth: [60, 200], diameter: [120, 320], treadThickness: [25, 100],
});
export function dimensionLimits(config = {}) {
  return { ...DIMENSION_LIMITS, ...(getModel(config.model).id === "custom" ? DIMENSION_LIMITS.custom : DIMENSION_LIMITS.catalogue) };
}

export const DEFAULT_CONFIG = Object.freeze({
  shape: "spiral",
  structureMaterial: "steel",
  structureColor: "#383d3a",
  metalFinish: "matte",
  treadMaterial: "oak",
  railing: "vertical",
  risers: false,
  led: false,
  direction: "right",
  height: 280,
  width: 90,
  steps: 16,
  ambience: "studio",
  model: "custom",
  structureType: "auto",
  quarterPosition: "middle",
  turnLayout: "balanced",
  going: 26,
  landingDepth: 90,
  diameter: 180,
  treadThickness: 40,
  handrail: "auto",
  railMaterial: "inox",
  railPattern: "standard",
  woodFinish: "natural",
  structureFinish: "natural",
  postColor: "#383d3a",
  startStep: "straight",
  nosing: "double-rounded",
  landingGuard: "none",
  antiSlip: "none",
  postCap: "flat",
  balusterStyle: "plain",
  postStyle: "standard",
  slabTrim: "none",
  packDeco: false,
});
const option = (list, value, fallback) =>
  list.some((item) => item.id === value) ? value : fallback;
const number = (value, fallback, min, max) =>
  value === "" || value == null || !Number.isFinite(Number(value))
    ? fallback
    : Math.round(Math.min(max, Math.max(min, Number(value))));
const boolean = (value, fallback = false) => value == null
  ? fallback
  : value === true || value === "true" || value === 1 || value === "1";
const colorValue = (value, fallback) => typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value)
  ? value.toLowerCase() : fallback;
const OPTION_LISTS = {
  model: MODELS,
  shape: SHAPES,
  structureMaterial: STRUCTURES,
  treadMaterial: MATERIALS,
  railing: RAILINGS,
  metalFinish: METAL_FINISHES,
  ambience: AMBIENCES,
  structureType: STRUCTURE_TYPES,
  quarterPosition: QUARTER_POSITIONS,
  turnLayout: TURN_LAYOUTS,
  handrail: HANDRAILS,
  railMaterial: RAIL_MATERIALS,
  railPattern: RAIL_PATTERNS,
  woodFinish: WOOD_FINISHES,
  structureFinish: STRUCTURE_FINISHES,
  startStep: START_STEPS,
  nosing: NOSINGS,
  landingGuard: LANDING_GUARDS,
  antiSlip: ANTI_SLIPS,
  postCap: POST_CAPS,
  balusterStyle: BALUSTER_STYLES,
  postStyle: POST_STYLES,
  slabTrim: SLAB_TRIMS,
};
const CATALOGUE_COLORS = ["#1c1c1b", "#41484b", "#53565a", "#56585d", "#e4dfd3", "#6a5146", "#a3b39a", "#3c5361", "#24616a", "#8d463d"];
const LIMITED_RAIL_COLORS = ["#1c1c1b", "#e4dfd3", "#53565a"];
const LEGACY_FIELDS = ["shape", "structureMaterial", "structureColor", "metalFinish", "treadMaterial", "railing", "risers", "led", "direction", "height", "width", "steps", "ambience"];
const ACCESSORY_FIELDS = ["balusterStyle", "postStyle", "slabTrim"];
const MARINE_12_MODELS = ["zephyr", "levant", "escale", "sillage", "transat", "vogue", "fabrique", "dynamique", "rythmique"];
const METAL_POST_MODELS = ["escale", "sillage", "transat", "vogue", "voile", "nautique", "cap"];
const intersection = (ids, candidates) => ids.filter((id) => candidates.includes(id));

function compatibleIds(model, c) {
  const ids = Object.fromEntries(Object.entries(OPTION_LISTS).map(([key, options]) => [key, model.allowed[key] || options.map((item) => item.id)]));
  ids.risers = model.allowed.risers || [false, true];
  ids.led = model.allowed.led || [false, true];
  ids.packDeco = model.allowed.packDeco || [false, true];
  ids.structureColor = model.allowed.structureColor || (model.id === "custom" ? COLORS.map((item) => item.hex) : CATALOGUE_COLORS);
  ids.postColor = model.allowed.postColor || (model.id === "custom" ? COLORS.map((item) => item.hex) : CATALOGUE_COLORS);
  if (model.id === "custom") return ids;

  // A selected structure and its treads form an actual material pairing.
  const structure = STRUCTURES.find((item) => item.id === c.structureMaterial);
  const visiblePosts = c.railing !== "none" && !c.handrail.startsWith("wall-");
  const woodBalusters = c.railing === "vertical" && c.railMaterial === "wood";
  const metalBalusters = c.railing === "vertical" && c.railMaterial === "metal";
  ids.balusterStyle = ids.balusterStyle.filter((id) => id === "plain"
    || (model.family !== "outdoor" && woodBalusters && id.startsWith("wood-"))
    || (metalBalusters && id.startsWith("metal-")));
  const marine12 = c.railing === "horizontal" && c.railMaterial === "inox" && MARINE_12_MODELS.includes(model.id);
  ids.postStyle = ids.postStyle.filter((id) => id === "standard" || (visiblePosts && (
    (id === "marine-wood" && structure?.family === "wood" && model.family !== "outdoor")
    || (["marine-inox", "marine-metal", "marine-crook"].includes(id) && marine12)
    || (id === "cast-iron" && metalBalusters)
  )));
  const woodPost = visiblePosts && structure?.family === "wood"
    && (c.postStyle === "marine-wood" || (c.postStyle === "standard" && !METAL_POST_MODELS.includes(model.id)));
  if (!woodPost) ids.postCap = intersection(ids.postCap, ["flat"]);
  ids.slabTrim = intersection(ids.slabTrim, structure?.family === "wood"
    ? ["none", "wood", "plywood", "painted"] : ["none", "metal", "inox"]);
  const pairs = {
    hevea: ["hevea"], "beech-lca": ["beech-lca"], beech: ["beech", "oak", "oak-rustic"],
    wood: ["oak"], "oak-rustic": ["oak-rustic"], iroko: ["iroko"],
  };
  if (structure?.family === "wood" && pairs[c.structureMaterial]) {
    const paired = intersection(ids.treadMaterial, pairs[c.structureMaterial]);
    if (paired.length) ids.treadMaterial = paired;
  }
  const finishes = {
    hevea: ["natural"], iroko: ["natural"], oak: ["natural", "blanched"],
    "oak-rustic": ["sandblasted"],
    beech: ["natural", "pitch-pin", "grey-light", "grey-dark", "wenge"],
    "beech-lca": ["natural", "pitch-pin", "grey-light", "grey-dark", "wenge"],
  };
  ids.woodFinish = intersection(ids.woodFinish, finishes[c.treadMaterial] || ["natural"]);
  if (structure?.family === "wood" && c.structureMaterial !== "beech") {
    ids.structureFinish = intersection(ids.structureFinish, ["natural"]);
  }
  ids.metalFinish = ["matte"];
  if (["origine", "harmonie"].includes(model.id) && c.railMaterial === "metal") {
    ids.postColor = LIMITED_RAIL_COLORS;
  }
  if (model.id === "duplex" && c.structureMaterial === "hevea") ids.nosing = ["double-rounded"];
  const deco = ["origine", "ambition"].includes(model.id)
    && (c.shape === "straight" || (c.shape === "quarter" && c.quarterPosition !== "middle"))
    && c.railing === "horizontal" && c.railMaterial === "inox";
  if (!deco) ids.packDeco = [false];
  return ids;
}

export function normalizeConfig(value = {}) {
  const source = value && typeof value === "object" ? value : {};
  const model = getModel(source.model);
  const fallback = { ...DEFAULT_CONFIG, ...model.defaults, model: model.id };
  const limits = dimensionLimits(fallback);
  const c = {
    shape: option(SHAPES, source.shape, fallback.shape),
    structureMaterial: option(STRUCTURES, source.structureMaterial, fallback.structureMaterial),
    structureColor: colorValue(source.structureColor, fallback.structureColor),
    metalFinish: option(METAL_FINISHES, source.metalFinish, fallback.metalFinish),
    treadMaterial: option(MATERIALS, source.treadMaterial, fallback.treadMaterial),
    railing: option(RAILINGS, source.railing, fallback.railing),
    risers: boolean(source.risers, fallback.risers),
    led: boolean(source.led, fallback.led),
    direction: source.direction === "left" ? "left" : "right",
    height: number(source.height, fallback.height, ...limits.height),
    width: number(source.width, fallback.width, ...limits.width),
    steps: number(source.steps, fallback.steps, ...limits.steps),
    ambience: option(AMBIENCES, source.ambience, fallback.ambience),
    model: model.id,
    structureType: option(STRUCTURE_TYPES, source.structureType, fallback.structureType),
    quarterPosition: option(QUARTER_POSITIONS, source.quarterPosition, fallback.quarterPosition),
    turnLayout: option(TURN_LAYOUTS, source.turnLayout, fallback.turnLayout),
    going: number(source.going, fallback.going, ...limits.going),
    landingDepth: number(source.landingDepth, fallback.landingDepth, ...limits.landingDepth),
    diameter: number(source.diameter, fallback.diameter, ...limits.diameter),
    treadThickness: number(source.treadThickness, fallback.treadThickness, ...limits.treadThickness),
    handrail: option(HANDRAILS, source.handrail, fallback.handrail),
    railMaterial: option(RAIL_MATERIALS, source.railMaterial, fallback.railMaterial),
    railPattern: option(RAIL_PATTERNS, source.railPattern, fallback.railPattern),
    woodFinish: option(WOOD_FINISHES, source.woodFinish, fallback.woodFinish),
    structureFinish: option(STRUCTURE_FINISHES, source.structureFinish, fallback.structureFinish),
    postColor: colorValue(source.postColor, fallback.postColor),
    startStep: option(START_STEPS, source.startStep, fallback.startStep),
    nosing: option(NOSINGS, source.nosing, fallback.nosing),
    landingGuard: option(LANDING_GUARDS, source.landingGuard, fallback.landingGuard),
    antiSlip: option(ANTI_SLIPS, source.antiSlip, fallback.antiSlip),
    postCap: option(POST_CAPS, source.postCap, fallback.postCap),
    balusterStyle: option(BALUSTER_STYLES, source.balusterStyle, fallback.balusterStyle),
    postStyle: option(POST_STYLES, source.postStyle, fallback.postStyle),
    slabTrim: option(SLAB_TRIMS, source.slabTrim, fallback.slabTrim),
    packDeco: boolean(source.packDeco, fallback.packDeco),
  };
  if (model.id === "custom") return c;
  if (model.id === "origine" && c.railMaterial === "wood") c.railing = "vertical";
  // Re-evaluate after each pass: a corrected wood pairing can change its finish.
  for (let pass = 0; pass < 3; pass += 1) {
    const ids = compatibleIds(model, c);
    for (const key of [...Object.keys(OPTION_LISTS), "risers", "led", "packDeco", "structureColor", "postColor"]) {
      const allowed = ids[key];
      if (!allowed?.length || allowed.includes(c[key])) continue;
      c[key] = allowed.includes(fallback[key]) ? fallback[key] : allowed[0];
    }
  }
  // Keep the sketch's tread boxes apart; this is not a production dimension.
  c.treadThickness = Math.min(c.treadThickness, Math.floor(c.height * 10 / c.steps) - 5);
  return c;
}

export function availableOptions(config = {}) {
  const c = normalizeConfig(config);
  const ids = compatibleIds(getModel(c.model), c);
  return {
    ...Object.fromEntries(Object.entries(OPTION_LISTS).map(([key, options]) => [key, options.filter((item) => ids[key].includes(item.id))])),
    structureColor: COLORS.filter((item) => ids.structureColor.includes(item.hex)),
    postColor: COLORS.filter((item) => ids.postColor.includes(item.hex)),
    risers: [...ids.risers], led: [...ids.led], packDeco: [...ids.packDeco],
  };
}

export function configurationForModel(id, current = {}) {
  const model = getModel(id);
  if (model.id === "custom") return normalizeConfig({ ...current, model: "custom" });
  const carry = ["height", "width", "steps", "going", "landingDepth", "diameter", "treadThickness", "direction", "ambience"];
  return normalizeConfig({
    ...DEFAULT_CONFIG,
    ...Object.fromEntries(carry.filter((key) => current[key] != null).map((key) => [key, current[key]])),
    ...model.defaults,
    model: model.id,
  });
}

export function encodeConfig(config) {
  const normalized = normalizeConfig(config);
  return new URLSearchParams(
    Object.entries(normalized)
      .filter(([key, value]) => !ACCESSORY_FIELDS.includes(key) || value !== DEFAULT_CONFIG[key])
      .filter(([key, value]) => normalized.model !== "custom" || LEGACY_FIELDS.includes(key) || value !== DEFAULT_CONFIG[key])
      .map(([key, value]) => [key, typeof value === "boolean" ? (value ? "1" : "0") : String(value)]),
  ).toString();
}
export function decodeConfig(search = "") {
  const params = search instanceof URLSearchParams ? search : new URLSearchParams(search);
  return normalizeConfig(Object.fromEntries(Object.keys(DEFAULT_CONFIG)
    .filter((key) => params.has(key)).map((key) => [key, params.get(key)])));
}

export function describeConfiguration(config) {
  const c = normalizeConfig(config);
  const model = getModel(c.model);
  const label = (list, key) => list.find((item) => item.id === key)?.label || key;
  const describeColor = (hex) => {
    const color = COLORS.find((item) => item.hex === hex);
    return color ? `${color.label} (${hex})` : `Couleur personnalisée ${hex}`;
  };
  const structure = STRUCTURES.find((item) => item.id === c.structureMaterial);
  const woodStructure = structure.family === "wood";
  const catalogue = c.model !== "custom";
  const advanced = catalogue || c.shape === "spiral-square" || Object.keys(DEFAULT_CONFIG).some((key) => !LEGACY_FIELDS.includes(key) && c[key] !== DEFAULT_CONFIG[key]);
  const paintedWood = woodStructure && c.structureFinish === "painted";
  const mural = c.handrail.startsWith("wall-");
  return [
    ...(catalogue ? [{ label: "Modèle du catalogue Riaux", value: model.label }, { label: "Collection", value: model.collectionLabel }] : []),
    { label: "Forme", value: label(SHAPES, c.shape) },
    { label: "Ambiance de projection (décor indicatif)", value: label(AMBIENCES, c.ambience) },
    { label: "Structure", value: structure.label },
    ...(advanced ? [{ label: "Dessin de la structure", value: label(STRUCTURE_TYPES, c.structureType) }] : []),
    { label: "Marches", value: catalogue && c.treadMaterial === "oak" ? "Chêne massif" : label(MATERIALS, c.treadMaterial) },
    ...(c.structureMaterial === "steel" || paintedWood ? [{ label: "Couleur de structure", value: describeColor(c.structureColor) }] : [
      { label: "Finition de structure", value: c.model === "outdoor" ? "Iroko brut de ponçage" : woodStructure ? "Bois naturel" : `${structure.label} naturel` },
      ...(c.railing === "none" || catalogue ? [] : [{ label: "Couleur de la main courante", value: describeColor(c.structureColor) }]),
    ]),
    ...(woodStructure && c.railing === "none" ? [] : [{ label: woodStructure ? "Aspect de la main courante" : "Aspect de la structure métallique", value: label(METAL_FINISHES, c.metalFinish) }]),
    { label: "Garde-corps", value: mural ? "Main courante murale — escalier encloisonné" : label(RAILINGS, c.railing) },
    ...(advanced ? [
      { label: "Traitement de la structure", value: c.model === "outdoor" ? "Iroko brut de ponçage" : paintedWood ? "Peinture sur la structure bois" : woodStructure ? "Bois naturel" : c.structureMaterial === "steel" ? "Métal thermolaqué" : `${structure.label} naturel` },
      { label: "Finition des marches", value: c.model === "outdoor" ? "Iroko brut de ponçage" : label(WOOD_FINISHES, c.woodFinish) },
      { label: "Main courante", value: label(HANDRAILS, c.handrail) },
      ...(!mural && c.railing !== "none" ? [
        { label: "Lisses ou balustres", value: `${label(RAIL_MATERIALS, c.railMaterial)} · ${label(RAIL_PATTERNS, c.railPattern)}` },
        ...(c.railing === "vertical" ? [{ label: "Profil des balustres", value: label(BALUSTER_STYLES, c.balusterStyle) }] : []),
        { label: "Poteaux de départ", value: label(POST_STYLES, c.postStyle) },
        { label: "Couleur complémentaire du garde-corps", value: describeColor(c.postColor) },
      ] : []),
      { label: "Garde-corps d’étage", value: label(LANDING_GUARDS, c.landingGuard) },
      { label: "Habillage de dalle", value: label(SLAB_TRIMS, c.slabTrim) },
      { label: "Marche de départ", value: label(START_STEPS, c.startStep) },
      { label: "Nez de marche", value: label(NOSINGS, c.nosing) },
      { label: "Antidérapant représenté", value: label(ANTI_SLIPS, c.antiSlip) },
      ...(!mural && c.railing !== "none" ? [{ label: "Tête de poteau", value: label(POST_CAPS, c.postCap) }] : []),
      ...(c.packDeco ? [{ label: "Pack Déco", value: "Insert inox au premier tiers du limon" }] : []),
    ] : []),
    { label: "Hauteur à franchir", value: `${c.height} cm (indicative)` },
    { label: "Largeur", value: `${c.width} cm (indicative)` },
    { label: "Nombre de marches", value: `${c.steps} (intention visuelle)` },
    ...(advanced ? [
      { label: "Giron visuel", value: `${c.going} cm (indicatif)` },
      { label: "Épaisseur des marches", value: `${c.treadThickness} mm (indicative)` },
      ...(c.shape.startsWith("spiral") ? [{ label: "Diamètre d’encombrement", value: `${c.diameter} cm (indicatif)` }] : []),
      ...(c.shape === "quarter" ? [{ label: "Position du tournant", value: label(QUARTER_POSITIONS, c.quarterPosition) }] : []),
      ...(c.shape === "half" ? [{ label: "Implantation du demi-tournant", value: label(TURN_LAYOUTS, c.turnLayout) }] : []),
      ...(c.turnLayout === "landing" || c.landingGuard !== "none" ? [{ label: "Profondeur du palier représenté", value: `${c.landingDepth} cm (indicative)` }] : []),
    ] : []),
    { label: "Sens de montée", value: c.direction === "left" ? "À gauche" : "À droite" },
    { label: "Contremarches", value: c.risers ? "Avec contremarches" : "Marches ouvertes" },
    { label: "Lumière", value: c.led ? "Intention LED chaud" : "Sans éclairage intégré" },
    ...(catalogue ? [{ label: "Points à étudier avec l’atelier", value: model.notes.join(" ") }] : []),
  ];
}
