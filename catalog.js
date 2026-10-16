// Shared, allowlisted project vocabulary. No commercial prices are inferred here.
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
});
const option = (list, value, fallback) =>
  list.some((item) => item.id === value) ? value : fallback;
const number = (value, fallback, min, max) =>
  value === "" || value == null || !Number.isFinite(Number(value))
    ? fallback
    : Math.round(Math.min(max, Math.max(min, Number(value))));
const boolean = (value) =>
  value === true || value === "true" || value === 1 || value === "1";
export function normalizeConfig(value = {}) {
  const source = value && typeof value === "object" ? value : {};
  return {
    shape: option(SHAPES, source.shape, DEFAULT_CONFIG.shape),
    structureMaterial: option(STRUCTURES, source.structureMaterial, DEFAULT_CONFIG.structureMaterial),
    structureColor:
      typeof source.structureColor === "string" &&
      /^#[0-9a-f]{6}$/i.test(source.structureColor)
        ? source.structureColor.toLowerCase()
        : DEFAULT_CONFIG.structureColor,
    metalFinish: option(
      METAL_FINISHES,
      source.metalFinish,
      DEFAULT_CONFIG.metalFinish,
    ),
    treadMaterial: option(
      MATERIALS,
      source.treadMaterial,
      DEFAULT_CONFIG.treadMaterial,
    ),
    railing: option(RAILINGS, source.railing, DEFAULT_CONFIG.railing),
    risers: boolean(source.risers),
    led: boolean(source.led),
    direction: source.direction === "left" ? "left" : "right",
    height: number(source.height, DEFAULT_CONFIG.height, 240, 360),
    width: number(source.width, DEFAULT_CONFIG.width, 70, 130),
    steps: number(source.steps, DEFAULT_CONFIG.steps, 12, 20),
    ambience: option(AMBIENCES, source.ambience, DEFAULT_CONFIG.ambience),
  };
}
export function encodeConfig(config) {
  const normalized = normalizeConfig(config);
  return new URLSearchParams(
    Object.entries(normalized).map(([key, value]) => [
      key,
      typeof value === "boolean" ? (value ? "1" : "0") : String(value),
    ]),
  ).toString();
}
export function decodeConfig(search = "") {
  const params =
    search instanceof URLSearchParams ? search : new URLSearchParams(search);
  return normalizeConfig(
    Object.fromEntries(
      Object.keys(DEFAULT_CONFIG)
        .filter((key) => params.has(key))
        .map((key) => [key, params.get(key)]),
    ),
  );
}
export function describeConfiguration(config) {
  const c = normalizeConfig(config);
  const label = (list, key) => list.find((item) => item.id === key)?.label;
  const color = COLORS.find((item) => item.hex === c.structureColor);
  const structure = STRUCTURES.find((item) => item.id === c.structureMaterial);
  const colorDescription = color
    ? `${color.label} (${color.hex})`
    : `Couleur personnalisée ${c.structureColor}`;
  return [
    { label: "Forme", value: label(SHAPES, c.shape) },
    { label: "Ambiance de projection (décor indicatif)", value: label(AMBIENCES, c.ambience) },
    {
      label: "Structure",
      value: structure.label,
    },
    { label: "Marches", value: label(MATERIALS, c.treadMaterial) },
    ...(c.structureMaterial === "steel" ? [{ label: "Couleur de structure", value: colorDescription }] : [
      { label: "Finition de structure", value: structure.family === "wood" ? "Bois naturel" : `${structure.label} naturel` },
      ...(c.railing === "none" ? [] : [{ label: "Couleur de la main courante", value: colorDescription }]),
    ]),
    ...(structure.family === "wood" && c.railing === "none" ? [] : [{ label: structure.family === "wood" ? "Aspect de la main courante" : "Aspect de la structure métallique", value: label(METAL_FINISHES, c.metalFinish) }]),
    { label: "Garde-corps", value: label(RAILINGS, c.railing) },
    { label: "Hauteur à franchir", value: `${c.height} cm (indicative)` },
    { label: "Largeur", value: `${c.width} cm (indicative)` },
    { label: "Nombre de marches", value: `${c.steps} (intention visuelle)` },
    {
      label: "Sens de montée",
      value: c.direction === "left" ? "À gauche" : "À droite",
    },
    {
      label: "Contremarches",
      value: c.risers ? "Avec contremarches" : "Marches ouvertes",
    },
    {
      label: "Lumière",
      value: c.led ? "Intention LED chaud" : "Sans éclairage intégré",
    },
  ];
}
