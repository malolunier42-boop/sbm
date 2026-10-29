import {
  SHAPES,
  MATERIALS,
  STRUCTURES,
  RAILINGS,
  METAL_FINISHES,
  COLORS,
  AMBIENCES,
  DEFAULT_CONFIG,
  normalizeConfig,
  decodeConfig,
  encodeConfig,
  configurationForModel,
} from "./catalog.js";
import { mountCatalogueStudio } from "./studio-catalogue.js";
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [
  ...scope.querySelectorAll(selector),
];
let configuration = decodeConfig(location.search);
let audience =
  new URLSearchParams(location.search).get("audience") === "professional"
    ? "professional"
    : "individual";
let viewer;
let renderTimer;
const motion = matchMedia("(prefers-reduced-motion: reduce)");
const stage = $("#studio-stage");
const canvas = $("#studio-canvas");
const originalStagePosition = document.createComment("studio-viewer-home");
stage.before(originalStagePosition);
const dialog = $("#studio-dialog");
const catalogueControls = mountCatalogueStudio({
  read: () => configuration,
  change,
  selectModel(id) {
    configuration = configurationForModel(id, configuration);
    syncUI();
    syncURL();
    viewer?.setConfiguration(configuration);
  },
});
const labels = (list, key) =>
  list.find((option) => option.id === key)?.label ?? "";
const ambiencePanel = $(".studio-ambience");
const ambienceSummary = $("summary", ambiencePanel);
function sizeAmbienceMenu() {
  if (!ambiencePanel.open) return;
  const bottom = ambienceSummary.getBoundingClientRect().bottom;
  const available = Math.max(80, Math.min(innerHeight - bottom - 24, stage.getBoundingClientRect().bottom - bottom - 18));
  ambiencePanel.style.setProperty("--ambience-viewport-space", `${available}px`);
}
ambiencePanel.addEventListener("toggle", sizeAmbienceMenu);
addEventListener("resize", sizeAmbienceMenu);
addEventListener("scroll", sizeAmbienceMenu, { passive: true });
AMBIENCES.forEach((option) => {
  const button = optionButton(option, "ambience", `<span class="ambience-sample ambience-${option.id}" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="${option.icon}"/></svg></span><span><strong>${option.label}</strong><small>${option.detail}</small></span><span class="ambience-check" aria-hidden="true">✓</span>`);
  button.addEventListener("click", () => {
    change({ ambience: option.id });
    ambiencePanel.open = false;
    ambienceSummary.focus({ preventScroll: true });
  });
  $("#ambience-choices").append(button);
});
document.addEventListener("pointerdown", (event) => {
  if (!ambiencePanel.contains(event.target)) ambiencePanel.open = false;
});
ambiencePanel.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && ambiencePanel.open) {
    event.preventDefault();
    event.stopPropagation();
    ambiencePanel.open = false;
    ambienceSummary.focus({ preventScroll: true });
  }
});
function optionButton(option, kind, content) {
  const button = document.createElement("button");
  button.type = "button";
  button.dataset[kind] = option.id;
  button.setAttribute("aria-pressed", "false");
  button.innerHTML = content;
  return button;
}
SHAPES.forEach((option) => {
  const button = optionButton(
    option,
    "shape",
    `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="${option.path}"/></svg><strong>${option.label}</strong><small>${option.subtitle}</small>`,
  );
  button.addEventListener("click", () => change({ shape: option.id }));
  $("#shape-options").append(button);
});
STRUCTURES.forEach((option) => {
  const button = optionButton(option, "structure", `<span class="material-chip ${option.className}" aria-hidden="true"></span><span><strong>${option.label}</strong><small>${option.detail}</small></span>`);
  button.addEventListener("click", () => change({ structureMaterial: option.id }));
  $("#structure-options").append(button);
});
MATERIALS.forEach((option) => {
  const button = optionButton(
    option,
    "tread",
    `<span class="material-chip ${option.className}" aria-hidden="true"></span><span>${option.label}</span>`,
  );
  button.addEventListener("click", () => change({ treadMaterial: option.id }));
  $("#tread-options").append(button);
});
RAILINGS.forEach((option) => {
  const button = optionButton(
    option,
    "railing",
    `<span class="rail-sketch rail-${option.id}" aria-hidden="true">${option.id === "none" ? '<svg viewBox="0 0 65 38"><path d="M5 32h12v-7h12v-7h12v-7h12V4M5 36h16v-7h12v-7h12v-7h13"/></svg>' : ""}</span><strong>${option.short}</strong>`,
  );
  button.setAttribute("aria-label", option.label);
  button.addEventListener("click", () => change({ railing: option.id }));
  $("#railing-options").append(button);
});
METAL_FINISHES.forEach((option) => {
  const button = optionButton(option, "finish", option.label);
  button.addEventListener("click", () => change({ metalFinish: option.id }));
  $("#finish-options").append(button);
});
COLORS.forEach((option) => {
  const button = document.createElement("button");
  button.className = "color-pick";
  button.dataset.color = option.hex;
  button.title = option.label;
  button.setAttribute("aria-label", `${option.label}, ${option.reference}`);
  button.setAttribute("aria-pressed", "false");
  button.style.setProperty("--swatch", option.hex);
  const span = document.createElement("span");
  button.append(span);
  button.addEventListener("click", () =>
    change({ structureColor: option.hex }),
  );
  $("#color-options").append(button);
});
function selected(selector, property, value) {
  $$(selector).forEach((button) => {
    const active = button.dataset[property] === value;
    button.setAttribute("aria-pressed", String(active));
    button.classList.toggle("selected", active);
  });
}
function projectURL(page = "configurateur.html") {
  return new URL(
    `${page}?${encodeConfig(configuration)}&audience=${audience}`,
    location.href,
  ).href;
}
function syncUI() {
  const catalogue = catalogueControls.sync(configuration);
  selected("[data-ambience]", "ambience", configuration.ambience);
  // The stage uses a separate data attribute from the choice buttons.
  stage.dataset.room = configuration.ambience;
  $("#ambience-label").textContent = labels(AMBIENCES, configuration.ambience);
  $("#ambience-note").textContent = `${labels(AMBIENCES, configuration.ambience)} · ${stage.classList.contains("failed") ? "décor non simulé ; votre préférence reste enregistrée." : configuration.ambience === "studio" ? "choisissez une ambiance pour vous projeter." : "décor d’inspiration, à explorer en tournant autour de l’escalier."}`;
  selected("[data-shape]", "shape", configuration.shape);
  selected("[data-tread]", "tread", configuration.treadMaterial);
  selected("[data-railing]", "railing", configuration.railing);
  selected("[data-finish]", "finish", configuration.metalFinish);
  selected("[data-direction]", "direction", configuration.direction);
  selected("[data-structure]", "structure", configuration.structureMaterial);
  selected("[data-color]", "color", configuration.structureColor);
  selected("[data-audience]", "audience", audience);
  const color = COLORS.find(
    (option) => option.hex === configuration.structureColor,
  );
  const structure = STRUCTURES.find((option) => option.id === configuration.structureMaterial);
  const woodStructure = structure.family === "wood";
  const paintedWood = woodStructure && configuration.structureFinish === "painted";
  const noRailing = configuration.railing === "none";
  $("#structure-note").textContent = catalogue.catalogue
    ? `${structure.label} pour la structure. Les essences et finitions proposées ci-dessous suivent les options de ${catalogue.model.label}.`
    : woodStructure
    ? `${structure.label} naturel pour la structure. La matière des marches se choisit séparément.`
    : configuration.structureMaterial === "steel"
      ? "Personnalisez la teinte et l’aspect de votre structure en acier."
      : `${structure.label} dans sa teinte naturelle. Choisissez son aspect mat, brossé ou poli.`;
  $("#metal-color-fields").hidden = catalogue.catalogue
    ? woodStructure && configuration.structureFinish !== "painted"
    : !paintedWood && configuration.structureMaterial !== "steel" && noRailing;
  $("#metal-finish-fields").hidden = woodStructure && noRailing;
  $("#metal-color-label").textContent = catalogue.catalogue || paintedWood ? "La couleur de la structure" : configuration.structureMaterial === "steel" ? "La couleur du métal" : "La couleur de la main courante";
  $("#metal-finish-label").textContent = woodStructure ? "L’aspect de la main courante" : "L’aspect du métal";
  $("#color-options").setAttribute("aria-label", configuration.structureMaterial === "steel" ? "Couleur de la structure métallique" : "Couleur de la main courante");
  $("#railing-note").hidden = !noRailing;
  $("#color-name").textContent = color?.label ?? "Personnalisée";
  $("#custom-color").value = configuration.structureColor;
  $("#color-hex").textContent = configuration.structureColor.toUpperCase();
  $("#risers").checked = configuration.risers;
  $("#led").checked = configuration.led;
  ["height", "width", "steps"].forEach((key) => {
    $(`#${key}`).value = configuration[key];
    const number = $(`#${key}-number`);
    if (number) number.value = configuration[key];
  });
  $("#steps-value").textContent = String(configuration.steps);
  $("#shape-label").textContent = labels(
    SHAPES,
    configuration.shape,
  ).toUpperCase();
  $("#model-index").textContent = String(
    SHAPES.findIndex((shape) => shape.id === configuration.shape) + 1,
  ).padStart(2, "0");
  $("#summary-title").textContent =
    `${catalogue.catalogue ? `${catalogue.model.label} · ` : ""}${labels(SHAPES, configuration.shape)}. ${labels(MATERIALS, configuration.treadMaterial)}.`;
  $("#summary-detail").textContent =
    `Structure ${structure.label} · ${labels(RAILINGS, configuration.railing)} · ${configuration.height} × ${configuration.width} cm`;
  $("#material-label").textContent =
    `${labels(MATERIALS, configuration.treadMaterial)} · ${configuration.structureMaterial === "steel" ? (color?.label ?? configuration.structureColor) : `STRUCTURE ${structure.label}`}`.toUpperCase();
  $("#quote-link").href = projectURL("devis.html");
  $("#studio-mobile-quote").href = projectURL("devis.html");
  $("#studio-mobile-label").textContent = `${catalogue.catalogue ? catalogue.model.label : labels(SHAPES, configuration.shape)} · ${structure.label}`;
  $(".header-contact").href = projectURL("devis.html");
  if (stage.classList.contains("failed"))
    $("#material-label").textContent =
      "VISUEL D’INSPIRATION · MATIÈRES NON SIMULÉES";
  const fallback = $(".studio-fallback");
  const next = `${import.meta.env.BASE_URL}models/${configuration.shape === "spiral-square" ? "spiral" : configuration.shape}.jpg`;
  if (fallback.dataset.modelShape !== configuration.shape) {
    fallback.dataset.modelShape = configuration.shape;
    fallback.src = next;
  }
  if ($("#share-link-input")) $("#share-link-input").value = projectURL();
}
function syncURL() {
  history.replaceState(null, "", projectURL());
}
function change(patch) {
  configuration = normalizeConfig({ ...configuration, ...patch });
  syncUI();
  catalogueControls.announceAdjustment(patch, configuration);
  syncURL();
  clearTimeout(renderTimer);
  renderTimer = setTimeout(() => viewer?.setConfiguration(configuration), 70);
}
function switchTab(key, focus = false) {
  $$("[data-tab]").forEach((button) => {
    const active = button.dataset.tab === key;
    button.setAttribute("aria-selected", String(active));
    button.tabIndex = active ? 0 : -1;
    if (active && focus) button.focus();
  });
  $$('[role="tabpanel"]').forEach((panel) => {
    panel.hidden = panel.id !== `panel-${key}`;
  });
}
$$("[data-tab]").forEach((button, index, buttons) => {
  button.addEventListener("click", () => switchTab(button.dataset.tab));
  button.addEventListener("keydown", (event) => {
    const target =
      event.key === "ArrowRight"
        ? (index + 1) % buttons.length
        : event.key === "ArrowLeft"
          ? (index + buttons.length - 1) % buttons.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? buttons.length - 1
              : null;
    if (target !== null) {
      event.preventDefault();
      switchTab(buttons[target].dataset.tab, true);
    }
  });
});
$$("[data-next]").forEach((button) =>
  button.addEventListener("click", () => {
    switchTab(button.dataset.next, true);
  }),
);
$$("[data-direction]").forEach((button) =>
  button.addEventListener("click", () =>
    change({ direction: button.dataset.direction }),
  ),
);
$$("[data-audience]").forEach((button) =>
  button.addEventListener("click", () => {
    audience = button.dataset.audience;
    syncUI();
    syncURL();
  }),
);
$("#custom-color").addEventListener("input", (event) =>
  change({ structureColor: event.target.value }),
);
["risers", "led"].forEach((key) =>
  $(`#${key}`).addEventListener("change", (event) =>
    change({ [key]: event.target.checked }),
  ),
);
["height", "width", "steps"].forEach((key) => {
  $(`#${key}`).addEventListener("input", (event) =>
    change({ [key]: event.target.value }),
  );
  const input = $(`#${key}-number`);
  if (input)
    input.addEventListener("change", (event) =>
      change({ [key]: event.target.value }),
    );
});
$("#reset-config").addEventListener("click", () => {
  configuration = { ...DEFAULT_CONFIG };
  viewer?.reset();
  change(configuration);
  $("#config-message").textContent = "Votre esquisse a été réinitialisée.";
});
addEventListener("popstate", () => {
  configuration = decodeConfig(location.search);
  audience =
    new URLSearchParams(location.search).get("audience") === "professional"
      ? "professional"
      : "individual";
  syncUI();
  viewer?.setConfiguration(configuration);
});
$("#share-config").addEventListener("click", async () => {
  const url = projectURL();
  try {
    if (!navigator.clipboard) throw Error("clipboard");
    await navigator.clipboard.writeText(url);
    $("#config-message").textContent =
      "Lien copié. Vos choix sont prêts à partager.";
  } catch {
    let holder = $(".share-link-field");
    if (!holder) {
      holder = document.createElement("div");
      holder.className = "share-link-field";
      const label = document.createElement("label");
      label.htmlFor = "share-link-input";
      label.textContent = "Copiez ce lien pour retrouver votre escalier";
      const input = document.createElement("input");
      input.id = "share-link-input";
      input.type = "url";
      input.readOnly = true;
      holder.append(label, input);
      $(".studio-summary").after(holder);
    }
    const input = $("#share-link-input");
    input.value = url;
    input.focus();
    input.select();
    $("#config-message").textContent = "Votre lien est prêt à être copié.";
  }
});
function errorState() {
  stage.classList.add("failed");
  stage.classList.remove("ready");
  $("#render-status").textContent = "APERÇU 3D INDISPONIBLE";
  $("#material-label").textContent =
    "VISUEL D’INSPIRATION · MATIÈRES NON SIMULÉES";
  syncUI();
  $$(
    ".studio-toolbar button, .studio-view-options button, #studio-rotate, #studio-edit-preview, #studio-dock-preview",
  ).forEach((button) => {
    button.disabled = button.id !== "studio-close";
  });
}
function viewerState(state) {
  $("#studio-rotate").setAttribute("aria-pressed", String(state.autoRotate));
  $$("[data-view]").forEach((button) =>
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.view === state.view),
    ),
  );
}
$$("[data-view]").forEach((button) =>
  button.addEventListener("click", () => viewer?.setView(button.dataset.view)),
);
$("#studio-left").addEventListener("click", () => viewer?.rotate(-Math.PI / 7));
$("#studio-right").addEventListener("click", () => viewer?.rotate(Math.PI / 7));
$("#studio-in").addEventListener("click", () => viewer?.zoom(1.13));
$("#studio-out").addEventListener("click", () => viewer?.zoom(1 / 1.13));
$("#studio-reset").addEventListener("click", () => viewer?.reset());
$("#studio-rotate").addEventListener("click", () =>
  viewer?.setAutoRotate(
    $("#studio-rotate").getAttribute("aria-pressed") !== "true",
  ),
);
stage.addEventListener("focusin", () => viewer?.setAutoRotate(false));
canvas.addEventListener("keydown", (event) => {
  const actions = {
    ArrowLeft: () => viewer?.rotate(-Math.PI / 12),
    ArrowRight: () => viewer?.rotate(Math.PI / 12),
    "+": () => viewer?.zoom(1.1),
    "=": () => viewer?.zoom(1.1),
    "-": () => viewer?.zoom(1 / 1.1),
    Home: () => viewer?.reset(),
  };
  if (actions[event.key]) {
    event.preventDefault();
    actions[event.key]();
  }
});
let savedScroll = 0;
let immersiveTrigger;
const compactScreen = matchMedia("(max-width: 760px)");
const mobileDock = $("#studio-mobile-dock");
let dockFrame = 0;
function refreshMobileDock() {
  dockFrame = 0;
  const controls = $(".studio-controls").getBoundingClientRect();
  const preview = canvas.getBoundingClientRect();
  const summary = $(".studio-summary").getBoundingClientRect();
  const headerBottom = $(".site-header").getBoundingClientRect().bottom + 12;
  const editing = document.activeElement?.matches("input, select, textarea");
  const show = compactScreen.matches && !dialog.open && !editing
    && preview.bottom < headerBottom && controls.top < innerHeight - 90
    && controls.bottom > headerBottom && summary.top > innerHeight - 80;
  mobileDock.hidden = !show;
  document.body.classList.toggle("mobile-dock-visible", show);
}
function scheduleMobileDock() {
  if (!dockFrame) dockFrame = requestAnimationFrame(refreshMobileDock);
}
addEventListener("scroll", scheduleMobileDock, { passive: true });
addEventListener("resize", scheduleMobileDock);
document.addEventListener("focusin", scheduleMobileDock);
document.addEventListener("focusout", scheduleMobileDock);
compactScreen.addEventListener("change", scheduleMobileDock);
function studioGestureHint(immersive = false) {
  return matchMedia("(pointer: coarse)").matches
    ? immersive ? "Glissez pour tourner · Pincez pour zoomer" : "Glissez ↔ · Pincez pour zoomer"
    : immersive ? "Glissez pour explorer · Échap pour fermer" : "Glissez pour explorer";
}
function openStudioPreview(event) {
  if (!viewer) return;
  immersiveTrigger = event.currentTarget;
  savedScroll = scrollY;
  ambiencePanel.open = false;
  dialog.append(stage);
  dialog.showModal();
  document.body.style.overflow = "hidden";
  viewer.setInteraction(true);
  $("#studio-hint").textContent = studioGestureHint(true);
  refreshMobileDock();
  $("#studio-close").focus({ preventScroll: true });
  requestAnimationFrame(() => viewer.resize());
}
for (const id of ["studio-fullscreen", "studio-edit-preview", "studio-dock-preview"])
  $(`#${id}`).addEventListener("click", openStudioPreview);
$("#studio-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("close", () => {
  ambiencePanel.open = false;
  originalStagePosition.after(stage);
  viewer?.setInteraction(false);
  document.body.style.overflow = "";
  $("#studio-hint").textContent = studioGestureHint();
  scrollTo({ top: savedScroll, behavior: "instant" });
  refreshMobileDock();
  requestAnimationFrame(() => {
    viewer?.resize();
    (immersiveTrigger || $("#studio-fullscreen")).focus({ preventScroll: true });
    scheduleMobileDock();
  });
});
motion.addEventListener("change", (event) => {
  $("#studio-rotate").disabled = event.matches;
  if (event.matches) viewer?.setAutoRotate(false);
});
$("#studio-hint").textContent = studioGestureHint();
scheduleMobileDock();
syncUI();
$$(
  ".studio-toolbar button, .studio-view-options button, #studio-rotate, #studio-edit-preview, #studio-dock-preview",
).forEach((button) => {
  button.disabled = button.id !== "studio-close";
});
async function start() {
  try {
    const { initViewer } = await import("./viewer.js");
    viewer = await initViewer({
      stage,
      canvas,
      theme: "light",
      initialConfiguration: configuration,
      onReady(controller) {
        viewer = controller;
        stage.classList.add("ready");
        stage.classList.remove("failed");
        syncUI();
        $("#render-status").textContent = "VOTRE CRÉATION EN 3D";
        $$(
          ".studio-toolbar button, .studio-view-options button, #studio-rotate, #studio-edit-preview, #studio-dock-preview",
        ).forEach((button) => {
          button.disabled = false;
        });
        $("#studio-rotate").disabled = motion.matches;
        viewer.setConfiguration(configuration);
      },
      onChange: viewerState,
      onError: errorState,
    });
  } catch {
    errorState();
  }
}
start();
