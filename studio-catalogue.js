import {
  MODELS, STRUCTURE_TYPES, WOOD_FINISHES, HANDRAILS, START_STEPS, NOSINGS,
  LANDING_GUARDS, ANTI_SLIPS, POST_CAPS, COLORS, getModel, availableOptions,
  BALUSTER_STYLES, POST_STYLES, SLAB_TRIMS, TRICOLORE_PALETTES, dimensionLimits,
} from "./catalog.js";
import { drawingMetrics } from "./catalogue-geometry.js";
import { arrowIcon } from "./catalogue-icons.js";

// Native selectors keep the catalogue usable with touch, keyboard and screen
// readers. Updating a choice never replaces its focused select element.
const choices = (values) => values.map(([id, label]) => ({ id, label }));
const OPTIONS = {
  structureType: STRUCTURE_TYPES,
  quarterPosition: choices([["low", "Quart tournant bas"], ["middle", "Quart tournant milieu"], ["high", "Quart tournant haut"]]),
  turnLayout: choices([["balanced", "Deux quarts tournants"], ["square-well", "À jour carré"], ["stacked", "Rampe sur rampe"], ["landing", "Avec palier de repos"]]),
  woodFinish: WOOD_FINISHES,
  structureFinish: choices([["natural", "Bois naturel / verni"], ["painted", "Structure bois peinte"]]),
  handrail: HANDRAILS,
  railMaterial: choices([["inox", "Inox"], ["metal", "Métal thermolaqué"], ["aluminium", "Aluminium anodisé mat"], ["wood", "Bois"]]),
  railPattern: choices([["standard", "Lignes régulières"], ["one-three-one", "Rythme de lisses 1–3–1"], ["rings", "Balustres avec bagues"]]),
  startStep: START_STEPS,
  nosing: NOSINGS,
  landingGuard: LANDING_GUARDS,
  antiSlip: ANTI_SLIPS,
  postCap: POST_CAPS,
  balusterStyle: BALUSTER_STYLES,
  postStyle: POST_STYLES,
  slabTrim: SLAB_TRIMS,
};
const groupNames = {
  shape: ["Implantation et structure", "Le dessin de votre escalier, au-delà de sa forme."],
  material: ["Finitions du bois et de la rampe", "Choisissez séparément les nuances et les composants."],
  details: ["Départs, mains courantes et paliers", "Les détails qui signent votre composition."],
  project: ["Proportions et encombrement", "Mesures d’esquisse en centimètres, épaisseur en millimètres."],
};
const fields = [
  ["shape", "structureType", "structure-type", "Le dessin de la structure"],
  ["shape", "quarterPosition", "quarter-position", "La position du quart tournant"],
  ["shape", "turnLayout", "turn-layout", "L’implantation du demi-tournant"],
  ["material", "woodFinish", "wood-finish", "La finition des marches en bois"],
  ["material", "structureFinish", "structure-finish", "La finition de la structure bois"],
  ["material", "railMaterial", "rail-material", "La matière des lisses et balustres"],
  ["material", "railPattern", "rail-pattern", "Le dessin des lisses et balustres"],
  ["details", "handrail", "handrail", "Le profil de la main courante"],
  ["details", "startStep", "start-step", "La marche de départ"],
  ["details", "nosing", "nosing", "Le nez de marche"],
  ["details", "landingGuard", "landing-guard", "Le garde-corps du palier d’arrivée"],
  ["details", "antiSlip", "anti-slip", "Le détail antidérapant"],
  ["details", "postCap", "post-cap", "La tête des poteaux"],
  ["details", "balusterStyle", "baluster-style", "Le profil des balustres"],
  ["details", "postStyle", "post-style", "Les poteaux de départ"],
  ["details", "slabTrim", "slab-trim", "L’habillage de la dalle d’arrivée"],
];
const numericFields = [
  ["going", "going-number", "Profondeur visuelle des marches", "cm", 18, 40, 26],
  ["diameter", "diameter-number", "Diamètre extérieur", "cm", 120, 320, 180],
  ["treadThickness", "tread-thickness-number", "Épaisseur des marches", "mm", 25, 100, 40],
  ["landingDepth", "landing-depth-number", "Profondeur du palier", "cm", 60, 200, 90],
];

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}
const optionId = (option) => typeof option === "object" ? option.id : option;
function fillSelect(select, options, value) {
  const signature = options.map((item) => `${optionId(item)}:${item.label ?? item}`).join("|");
  if (select.dataset.options !== signature) {
    select.replaceChildren(...options.map((item) => {
      const option = document.createElement("option");
      option.value = String(optionId(item));
      option.textContent = item.label ?? String(item);
      return option;
    }));
    select.dataset.options = signature;
  }
  select.value = String(value);
  select.disabled = options.length < 2;
}

export function mountCatalogueStudio({ read, change, selectModel }) {
  const picker = element("div", "studio-model-picker");
  const eyebrow = element("div", "studio-model-eyebrow", "LE POINT DE DÉPART");
  const label = element("label", "studio-model-label", "Un modèle, ou votre création libre.");
  label.htmlFor = "model-select";
  const select = element("select", "studio-model-select");
  select.id = "model-select";
  const groups = new Map();
  for (const model of MODELS) {
    const name = model.id === "custom" ? "Votre création" : model.family === "outdoor" || model.id === "outdoor" ? "Extérieur" : model.collectionLabel ?? model.collection ?? "Collection Riaux";
    if (!groups.has(name)) {
      const group = document.createElement("optgroup");
      group.label = name;
      select.append(group);
      groups.set(name, group);
    }
    const option = document.createElement("option");
    option.value = model.id;
    option.textContent = model.id === "custom" ? "Création libre — sur étude" : model.label;
    groups.get(name).append(option);
  }
  select.addEventListener("change", () => selectModel(select.value));
  const status = element("p", "studio-model-status");
  status.id = "model-status";
  const description = element("p", "studio-model-description");
  description.id = "model-description";
  const information = element("details", "studio-model-information");
  information.append(element("summary", null, "Les repères de ce modèle"));
  const notes = element("ul");
  notes.id = "model-notes";
  information.append(notes);
  const browse = element("a", "studio-model-browse", "Comparer les 30 modèles de la collection");
  browse.append(arrowIcon());
  browse.href = "./collection.html";
  picker.append(eyebrow, label, select, status, description, information, browse);
  document.querySelector(".studio-control-heading").after(picker);

  const groupsUI = {};
  for (const [key, [title, subtitle]] of Object.entries(groupNames)) {
    const details = element("details", "studio-advanced-group");
    details.id = `advanced-${key}`;
    const summary = element("summary");
    const copy = element("span");
    copy.append(element("strong", null, title), element("small", null, subtitle));
    summary.append(copy, element("span", "studio-expand-mark", "+"));
    const grid = element("div", "studio-advanced-grid");
    details.append(summary, grid);
    const panel = document.querySelector(`#panel-${key}`);
    const next = panel.querySelector(".panel-next");
    if (next) next.before(details);
    else panel.append(details);
    groupsUI[key] = { details, grid };
    details.addEventListener("toggle", () => dispatchEvent(new Event("resize")));
  }
  const inputs = new Map();
  for (const [group, key, id, title] of fields) {
    const field = element("div", "studio-catalogue-field");
    field.dataset.field = key;
    const label = element("label", null, title);
    label.htmlFor = id;
    const input = element("select");
    input.id = id;
    input.addEventListener("change", () => change({ [key]: input.value }));
    field.append(label, input);
    groupsUI[group].grid.append(field);
    inputs.set(key, { input, field });
  }
  for (const [key, id, title, unit, min, max, value] of numericFields) {
    const field = element("div", "studio-catalogue-field");
    const label = element("label", null, title);
    label.htmlFor = id;
    const line = element("div", "studio-measure-input");
    const input = element("input");
    Object.assign(input, { id, type: "number", min: String(min), max: String(max), step: "1", value: String(value), inputMode: "numeric" });
    input.addEventListener("change", () => change({ [key]: input.value }));
    line.append(input, element("span", null, unit));
    field.append(label, line);
    groupsUI.project.grid.append(field);
    inputs.set(key, { input, field });
  }
  const postField = element("div", "studio-catalogue-field studio-post-color");
  const postLabel = element("label", null, "La couleur des poteaux et de la main courante");
  postLabel.htmlFor = "post-color";
  const postInput = element("input");
  Object.assign(postInput, { id: "post-color", type: "color", value: "#383d3a" });
  postInput.addEventListener("input", () => change({ postColor: postInput.value }));
  const postSwatches = element("div", "studio-post-swatches");
  postSwatches.setAttribute("role", "group");
  postSwatches.setAttribute("aria-label", "Nuancier des poteaux et de la main courante");
  const postColorLabel = element("span", "studio-post-color-label");
  postColorLabel.id = "post-color-name";
  postField.append(postLabel, postInput, postColorLabel, postSwatches);
  groupsUI.material.grid.append(postField);
  const palettes = element("div", "studio-tricolore-palettes");
  palettes.append(element("p", "field-label", "Les accords Tricolore"));
  const paletteChoices = element("div", "studio-tricolore-choices");
  for (const palette of TRICOLORE_PALETTES) {
    const button = element("button");
    button.type = "button";
    button.dataset.tricolore = palette.id;
    const sample = element("span", "studio-tricolore-sample");
    sample.style.background = `linear-gradient(135deg, ${palette.structureColor} 50%, ${palette.postColor} 50%)`;
    sample.setAttribute("aria-hidden", "true");
    button.append(sample, element("span", null, palette.label));
    button.addEventListener("click", () => change({ structureColor: palette.structureColor, postColor: palette.postColor }));
    paletteChoices.append(button);
  }
  palettes.append(paletteChoices);
  groupsUI.material.grid.append(palettes);
  const packField = element("label", "studio-catalogue-check");
  const packInput = element("input");
  Object.assign(packInput, { id: "pack-deco", type: "checkbox" });
  packInput.addEventListener("change", () => change({ packDeco: packInput.checked }));
  const packText = element("span");
  packText.append(element("strong", null, "Insert inox Pack Déco"), element("small", null, "Une signature dans le premier tiers du limon, selon le modèle et l’implantation."));
  packField.append(packInput, packText);
  groupsUI.details.grid.append(packField);
  const dimensionalNote = element("p", "studio-dimension-note");
  dimensionalNote.id = "dimension-guidance";
  dimensionalNote.setAttribute("role", "status");
  groupsUI.project.grid.append(dimensionalNote);
  const dimensionAdjustment = element("p", "studio-dimension-note studio-dimension-adjustment");
  dimensionAdjustment.id = "dimension-adjustment";
  dimensionAdjustment.setAttribute("role", "status");
  dimensionAdjustment.hidden = true;
  document.getElementById("width").closest(".dimension-field").append(dimensionAdjustment);
  const ruleNote = element("p", "studio-catalogue-rule");
  ruleNote.id = "catalogue-rule";
  ruleNote.textContent = "Les choix s’adaptent au modèle. La création libre permet d’explorer d’autres intentions pour une étude avec l’atelier.";
  picker.append(ruleNote);
  const modelCaption = element("p", "studio-compatibility-message");
  modelCaption.id = "catalogue-message";
  modelCaption.setAttribute("role", "status");
  picker.append(modelCaption);

  let previousModel;
  function sync(configuration) {
    const model = getModel(configuration.model);
    const catalogue = configuration.model !== "custom";
    const available = availableOptions(configuration);
    document.body.classList.toggle("catalogue-configuration", catalogue);
    select.value = configuration.model;
    status.textContent = catalogue ? `COLLECTION RIAUX · ${model.label} · 2026` : "CRÉATION LIBRE · VOTRE PROJET SUR ÉTUDE";
    description.textContent = model.description;
    if (previousModel !== model.id) {
      notes.replaceChildren(...(model.notes ?? []).map((note) => element("li", null, note)));
      information.hidden = !notes.children.length;
      previousModel = model.id;
      modelCaption.textContent = "";
    }
    ruleNote.hidden = !catalogue;
    palettes.hidden = configuration.model !== "tricolore";
    paletteChoices.querySelectorAll("button").forEach((button) => {
      const palette = TRICOLORE_PALETTES.find((item) => item.id === button.dataset.tricolore);
      button.setAttribute("aria-pressed", String(palette.structureColor === configuration.structureColor && palette.postColor === configuration.postColor));
    });
    const datasets = { shape: "shape", structure: "structureMaterial", tread: "treadMaterial", railing: "railing", finish: "metalFinish" };
    for (const [dataset, key] of Object.entries(datasets)) {
      const options = available[key];
      if (!options) continue;
      const allowed = new Set(options.map(optionId));
      document.querySelectorAll(`[data-${dataset}]`).forEach((button) => {
        const compatible = allowed.has(button.dataset[dataset]);
        button.disabled = !compatible;
        button.hidden = !compatible;
      });
    }
    for (const [key, fallback] of Object.entries(OPTIONS)) {
      const { input, field } = inputs.get(key);
      const allowed = available[key];
      const options = allowed?.length && typeof allowed[0] === "object" ? allowed : allowed?.length ? fallback.filter((item) => allowed.includes(item.id)) : fallback;
      fillSelect(input, options, configuration[key]);
      field.hidden = (key === "quarterPosition" && configuration.shape !== "quarter")
        || (key === "turnLayout" && configuration.shape !== "half")
        || (key === "structureFinish" && !["wood", "walnut", "ash", "hevea", "beech-lca", "beech", "oak-rustic", "iroko"].includes(configuration.structureMaterial));
    }
    for (const [key] of numericFields) {
      const { input, field } = inputs.get(key);
      input.value = configuration[key];
      field.hidden = (key === "diameter" && !configuration.shape.startsWith("spiral"))
        || (key === "going" && configuration.shape.startsWith("spiral"));
    }
    const limits = dimensionLimits(configuration);
    for (const key of ["height", "width", "steps"]) {
      const limit = limits[key];
      if (!limit) continue;
      const min = Array.isArray(limit) ? limit[0] : limit.min;
      const max = Array.isArray(limit) ? limit[1] : limit.max;
      for (const id of [key, `${key}-number`]) {
        const input = document.getElementById(id);
        if (input) { input.min = min; input.max = max; }
      }
      const range = document.getElementById(key);
      const captions = range?.nextElementSibling?.querySelectorAll(":scope > span");
      if (captions?.length === 2) {
        captions[0].textContent = `${min} ${key === "steps" ? "marches" : "cm"}`;
        captions[1].textContent = `${max} ${key === "steps" ? "marches" : "cm"}`;
      }
    }
    const risersAllowed = available.risers;
    const risers = document.getElementById("risers");
    risers.disabled = !!risersAllowed && risersAllowed.length < 2;
    risers.closest("label").classList.toggle("catalogue-fixed-option", risers.disabled);
    const led = document.getElementById("led");
    led.disabled = !!available.led && available.led.length < 2;
    led.closest("label").classList.toggle("catalogue-fixed-option", led.disabled);
    packInput.checked = configuration.packDeco;
    packInput.disabled = !!available.packDeco && !available.packDeco.includes(true);
    packField.hidden = catalogue && packInput.disabled && !configuration.packDeco;
    postInput.value = configuration.postColor;
    const palette = available.postColor?.filter((item) => item.hex) ?? COLORS;
    const signature = palette.map((item) => item.hex).join("|");
    if (postSwatches.dataset.palette !== signature) {
      postSwatches.replaceChildren(...palette.map((color) => {
        const button = element("button");
        button.type = "button";
        button.dataset.postColor = color.hex;
        button.style.setProperty("--swatch", color.hex);
        button.setAttribute("aria-label", `${color.label}, poteaux et main courante`);
        button.title = color.label;
        button.addEventListener("click", () => change({ postColor: color.hex }));
        return button;
      }));
      postSwatches.dataset.palette = signature;
    }
    postSwatches.querySelectorAll("button").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.postColor === configuration.postColor)));
    postColorLabel.textContent = palette.find((item) => item.hex === configuration.postColor)?.label ?? configuration.postColor.toUpperCase();
    postInput.hidden = catalogue;
    postField.hidden = configuration.railing === "none" || configuration.handrail.startsWith("wall-");
    const colors = available.structureColor;
    if (colors) {
      const hexes = new Set(colors.map((item) => item.hex ?? item.id ?? item));
      document.querySelectorAll("#color-options [data-color]").forEach((button) => {
        button.hidden = !hexes.has(button.dataset.color);
      });
    }
    document.querySelector("#custom-color").closest(".custom-color").hidden = catalogue;
    const stepHeight = configuration.height / configuration.steps;
    const metrics = drawingMetrics(configuration);
    dimensionAdjustment.hidden = !metrics.widthLimited;
    dimensionAdjustment.textContent = metrics.widthLimited
      ? `Dans ce diamètre de ${configuration.diameter} cm, l’aperçu représente une largeur radiale de ${metrics.width.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} cm autour du fût. Votre largeur souhaitée de ${configuration.width} cm reste à étudier. Augmentez le diamètre dans « Proportions et encombrement » pour élargir le dessin.`
      : "";
    dimensionalNote.textContent = `Hauteur moyenne d’une marche : ${stepHeight.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} cm. ${configuration.shape.startsWith("spiral") ? `Diamètre d’esquisse : ${configuration.diameter} cm.` : `Profondeur d’esquisse : ${configuration.going} cm par marche.`} ${metrics.widthLimited ? `Dans ce diamètre, la largeur radiale représentée est limitée à ${metrics.width.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} cm autour du fût ; votre largeur souhaitée reste ${configuration.width} cm.` : ""} ${metrics.thicknessLimited ? `L’épaisseur représentée est ajustée à ${metrics.treadThickness.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} mm pour laisser les marches distinctes.` : ""} Les proportions et l’encombrement définitifs sont à valider sur relevé.`;
    return { catalogue, model, available };
  }
  return {
    sync,
    announceAdjustment(patch, normalized) {
      const adjusted = Object.entries(patch).some(([key, value]) => String(normalized[key]) !== String(value));
      modelCaption.textContent = adjusted ? "Certains choix ont été ajustés pour conserver les options de ce modèle. Retrouvez les autres possibilités en création libre." : "";
    },
  };
}
