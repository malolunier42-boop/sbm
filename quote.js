import {
  decodeConfig,
  encodeConfig,
  describeConfiguration,
  MATERIALS,
  STRUCTURES,
  availableOptions,
  getModel,
} from "./catalog.js";
import "./riaux-quote.css";
import { drawingMetrics } from "./catalogue-geometry.js";

const configuration = decodeConfig(window.location.search);
const description = describeConfiguration(configuration);
const drawn = drawingMetrics(configuration);
if (drawn.widthLimited) description.push({
  label: "Largeur radiale représentée dans l’aperçu",
  value: `${drawn.width.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} cm dans le diamètre ${drawn.diameter} cm. Largeur souhaitée : ${configuration.width} cm, à étudier avec l’atelier.`,
});
if (drawn.thicknessLimited) description.push({
  label: "Épaisseur représentée dans l’aperçu",
  value: `${drawn.treadThickness.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} mm pour laisser les marches distinctes. Épaisseur souhaitée : ${configuration.treadThickness} mm, à étudier.`,
});
const form = document.querySelector("#quote-form");
const fields = document.querySelector("#quote-fields");
const company = document.querySelector("#company");
const phone = document.querySelector("#phone");
const audienceInputs = [...form.querySelectorAll('[name="audience"]')];
const configurationSummary = document.querySelector("#configuration-summary");
const model = getModel(configuration.model);
const catalogueModel = configuration.model !== "custom";
const result = document.querySelector("#quote-result");
const printDocument = document.querySelector("#quote-print");
const actionStatus = document.querySelector("#brief-action-status");
// Keep the familiar short names in the dossier while accepting every essence
// supported by the shared catalogue. Availability is evaluated for this model
// and its actual structure, rather than offering all materials indiscriminately.
const materialNames = Object.fromEntries(
  MATERIALS.map((material) => [material.id, material.short || material.label]),
);
const comparisonMaterials = availableOptions(configuration).treadMaterial;
const comparisonIDs = new Set(comparisonMaterials.map((material) => material.id));
let briefText = "";
let exportName = "projet-escalier-sbm.txt";

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function addDescription(parent, entries) {
  for (const { label, value } of entries) {
    const row = element("div");
    row.append(element("dt", label), element("dd", String(value)));
    parent.append(row);
  }
}

addDescription(configurationSummary, description);

const modelCard = document.querySelector("#quote-model-card");
document.querySelector("#quote-model-source").textContent = catalogueModel
  ? "COLLECTION RIAUX · 2026"
  : "VOTRE CRÉATION SUR MESURE";
document.querySelector("#quote-model-name").textContent = model.label;
document.querySelector("#quote-model-description").textContent = model.description;
modelCard.dataset.model = configuration.model;
modelCard.hidden = false;
document.body.classList.toggle("quote-catalogue", catalogueModel);
const quickFacts = document.querySelector("#quote-model-facts");
for (const [label, detail] of [
  ["Marches", MATERIALS.find((item) => item.id === configuration.treadMaterial)?.label],
  ["Structure", STRUCTURES.find((item) => item.id === configuration.structureMaterial)?.label],
  ["Votre espace", `${configuration.height} × ${configuration.width} cm`],
]) {
  const fact = element("div");
  fact.append(element("span", label), element("strong", detail));
  quickFacts.append(fact);
}
document.querySelector("#quote-config-details").open = !catalogueModel;
document.querySelector("#quote-config-count").textContent = `${description.length} repères`;
const modelNotes = document.querySelector("#quote-model-notes");
const notes = Array.isArray(model.notes) ? model.notes : model.notes ? [model.notes] : [];
for (const note of notes) modelNotes.append(element("li", note));
document.querySelector("#quote-model-details").hidden = notes.length === 0;
if (model.family === "outdoor") document.querySelector("#installation-place").value = "outside";

// Shared links may contain options from a different model. Show when an explicit
// preference was adapted, so the visitor reviews the actual dossier values.
const supplied = new URLSearchParams(location.search);
const configNames = {
  model: "modèle", shape: "forme", structureMaterial: "matière de structure",
  structureType: "silhouette de structure", treadMaterial: "matière des marches",
  railing: "garde-corps", risers: "contremarches", handrail: "main courante",
  railMaterial: "matière des lisses", railPattern: "dessin des lisses",
  woodFinish: "finition du bois", structureFinish: "finition de structure",
  startStep: "marche de départ", nosing: "nez de marche", landingGuard: "garde-corps d’étage",
  antiSlip: "antidérapant", postCap: "tête de poteau", packDeco: "Pack Déco",
  balusterStyle: "profil des balustres", postStyle: "poteaux de départ", slabTrim: "habillage de dalle",
  height: "hauteur", width: "largeur", steps: "nombre de marches", going: "profondeur des marches",
  landingDepth: "profondeur du palier", diameter: "diamètre", treadThickness: "épaisseur des marches",
  quarterPosition: "position du quart tournant", turnLayout: "implantation du demi-tournant",
  structureColor: "couleur de structure", postColor: "couleur des poteaux", metalFinish: "aspect du métal",
};
const adjusted = Object.entries(configuration).filter(([key, current]) => {
  if (!supplied.has(key) || !configNames[key]) return false;
  const original = supplied.get(key);
  if (typeof current === "number") return original.trim() === "" || Number(original) !== current;
  if (typeof current === "boolean") {
    const accepted = current ? ["1", "true"] : ["0", "false"];
    return !accepted.includes(original);
  }
  return original.toLowerCase() !== String(current).toLowerCase();
}).map(([key]) => configNames[key]);
const adjustmentNote = document.querySelector("#quote-config-adjustments");
adjustmentNote.hidden = adjusted.length === 0;
if (adjusted.length) {
  adjustmentNote.textContent = `Choix adaptés aux possibilités de cette configuration : ${adjusted.join(", ")}. Retrouvez les valeurs retenues dans le récapitulatif ; vous pouvez les modifier dans le studio 3D.`;
}

const comparison = document.querySelector("#comparison-material-options");
comparison.replaceChildren();
for (const material of comparisonMaterials) {
  const label = element("label");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.name = "compare-material";
  checkbox.value = material.id;
  checkbox.checked = material.id === configuration.treadMaterial;
  const sample = element("span", undefined, `quote-material-sample ${material.className || ""}`);
  sample.setAttribute("aria-hidden", "true");
  label.append(checkbox, sample, element("span", materialNames[material.id]));
  comparison.append(label);
}
document.querySelector("#comparison-material-help").textContent = catalogueModel
  ? "Les essences ci-dessous correspondent au modèle et à la structure choisis. Cochez celles que vous souhaitez comparer sur devis. Pour étudier une autre structure, revenez au studio 3D."
  : "Choisissez les variantes de marches que vous aimeriez faire chiffrer. L’atelier précisera leur faisabilité et leurs différences de prix.";

const initialAudience = new URLSearchParams(window.location.search).get(
  "audience",
);
if (initialAudience === "professional")
  audienceInputs.find((input) => input.value === "professional").checked = true;

function audienceValue() {
  return audienceInputs.find((input) => input.checked)?.value || "individual";
}

function configurationURL(page) {
  const url = new URL(page, window.location.href);
  url.search = encodeConfig(configuration);
  url.searchParams.set("audience", audienceValue());
  url.hash = "";
  return url;
}

function updateAudience() {
  const professional = audienceValue() === "professional";
  document.querySelector("#company-field").hidden = !professional;
  company.required = professional;
  company.setCustomValidity("");
  document.querySelector("#edit-configuration").href = configurationURL(
    "./configurateur.html",
  ).href;
}

for (const input of audienceInputs)
  input.addEventListener("change", updateAudience);
updateAudience();

function validatePhone() {
  const value = phone.value.trim();
  const digits = value.replace(/\D/g, "");
  const allowed = /^[+\d\s().\/-]+$/u.test(value);
  phone.setCustomValidity(
    value && (!allowed || digits.length < 7 || digits.length > 20)
      ? "Indiquez un numéro de téléphone valide, de 7 à 20 chiffres, avec son indicatif si nécessaire."
      : "",
  );
}
phone.addEventListener("input", validatePhone);

function selectedLabel(id) {
  const select = document.querySelector(`#${id}`);
  return select.options[select.selectedIndex]?.textContent || "À préciser";
}

function value(id) {
  return document.querySelector(`#${id}`).value.trim();
}

function section(title, entries) {
  const block = element("section");
  block.append(element("h3", title));
  const list = element("dl", undefined, "brief-details");
  addDescription(list, entries);
  block.append(list);
  return block;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  validatePhone();
  // Whitespace alone is not a usable contact name or company.
  document
    .querySelector("#fullname")
    .setCustomValidity(
      value("fullname") ? "" : "Indiquez votre nom et prénom.",
    );
  company.setCustomValidity(
    company.required && !company.value.trim()
      ? "Indiquez votre entreprise ou agence."
      : "",
  );
  if (!form.reportValidity()) return;

  const isProfessional = audienceValue() === "professional";
  const contact = [
    {
      label: "Profil",
      value: isProfessional ? "Professionnel" : "Particulier",
    },
    { label: "Nom et prénom", value: value("fullname") },
    ...(isProfessional
      ? [{ label: "Entreprise / agence", value: value("company") }]
      : []),
    { label: "Téléphone", value: value("phone") },
    ...(value("email") ? [{ label: "E-mail", value: value("email") }] : []),
  ];
  const variants = [
    ...form.querySelectorAll('[name="compare-material"]:checked'),
  ].filter((input) => comparisonIDs.has(input.value)).map((input) => materialNames[input.value]);
  const project = [
    { label: "Lieu du projet", value: value("city") || "À préciser ensemble" },
    { label: "Contexte", value: selectedLabel("project-type") },
    { label: "Horizon souhaité", value: selectedLabel("timeline") },
    {
      label: "Budget indiqué par le client",
      value: value("budget")
        ? `${new Intl.NumberFormat("fr-FR").format(Number(value("budget")))} €`
        : "Non communiqué",
    },
    {
      label: "Variantes de marches à étudier",
      value: variants.length
        ? variants.join(" · ")
        : "Selon la configuration, à discuter avec l’atelier",
    },
  ];
  const space = [
    ...["installation-place", "project-use", "floor-support"].flatMap((id) => {
      if (!value(id)) return [];
      const labels = { "installation-place": "Emplacement", "project-use": "Usage du lieu", "floor-support": "Support à l’arrivée" };
      return [{ label: labels[id], value: selectedLabel(id) }];
    }),
    ...(value("opening-length") ? [{ label: "Longueur de trémie renseignée", value: `${value("opening-length")} cm (mesure du client, à vérifier)` }] : []),
    ...(value("opening-width") ? [{ label: "Largeur de trémie renseignée", value: `${value("opening-width")} cm (mesure du client, à vérifier)` }] : []),
    ...(value("floor-guard-length") ? [{ label: "Longueur de garde-corps d’étage souhaitée", value: `${value("floor-guard-length")} cm (à vérifier)` }] : []),
    ...(value("access-notes") ? [{ label: "Accès, circulation et contraintes", value: value("access-notes") }] : []),
  ];
  const date = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeZone: "Europe/Paris",
  }).format(new Date());
  const projectMessage = value("message") || "Aucune précision complémentaire.";
  const configLink = configurationURL("./configurateur.html").href;
  const disclaimer =
    "Dossier préparatoire non contractuel. Aucun envoi à S.B.M., aucune commande, aucun prix automatique. Dimensions, faisabilité, sécurité, matériaux, pose, prix et délais à valider avec l’atelier. Les variantes de matières sont des demandes d’étude, sans engagement de disponibilité.";
  const sections = [
    { title: "VOTRE CONTACT", entries: contact },
    { title: "VOTRE PROJET", entries: project },
    ...(space.length ? [{ title: "VOTRE ESPACE À ÉTUDIER", entries: space }] : []),
    { title: "VOTRE CONFIGURATION D’INSPIRATION", entries: description },
    ...(catalogueModel ? [{
      title: "REPÈRES DU MODÈLE",
      entries: [
        { label: "Référence documentaire", value: `Catalogue Riaux 2026 · ${model.label}${model.pages ? ` · pages PDF ${model.pages}` : ""}` },
        ...(notes.length ? [{ label: "Points à étudier avec l’atelier", value: notes.join(" ") }] : []),
      ],
    }] : []),
  ];

  printDocument.replaceChildren();
  const header = element("header", undefined, "brief-header");
  header.append(
    element("p", "S.B.M. DÉCOR STYLISÉ", "small-label"),
    element("h2", "Mon projet d’escalier"),
    element("p", `Dossier préparé le ${date} · À transmettre à l’atelier`),
  );
  printDocument.append(header);
  for (const item of sections)
    printDocument.append(section(item.title, item.entries));
  const messageSection = element("section");
  messageSection.append(
    element("h3", "VOS ENVIES ET CONTRAINTES"),
    element("p", projectMessage, "brief-message"),
  );
  const linkSection = element("section");
  linkSection.append(element("h3", "REPRENDRE LA CONFIGURATION"));
  const link = element("a", configLink, "brief-config-link");
  link.href = configLink;
  linkSection.append(
    link,
    element(
      "p",
      "Ce lien contient uniquement les choix de l’escalier et le type de client ; il ne contient pas vos coordonnées.",
    ),
  );
  printDocument.append(
    messageSection,
    linkSection,
    element("p", disclaimer, "quote-note"),
  );
  const footer = element("footer", undefined, "brief-footer");
  footer.append(
    element(
      "strong",
      "Contactez S.B.M. pour organiser l’étude et la transmission du dossier.",
    ),
    element(
      "p",
      "04 77 50 15 65 · ZI La Gravoux, boulevard de l’Europe · 42380 Luriecq",
    ),
  );
  printDocument.append(footer);

  briefText = [
    "S.B.M. DÉCOR STYLISÉ — MON PROJET D’ESCALIER",
    `Dossier préparé le ${date} — Non envoyé à l’atelier`,
    ...sections.flatMap((item) => [
      "",
      item.title,
      ...item.entries.map((entry) => `${entry.label} : ${entry.value}`),
    ]),
    "",
    "VOS ENVIES ET CONTRAINTES",
    projectMessage,
    "",
    "REPRENDRE LA CONFIGURATION",
    configLink,
    "Ce lien ne contient pas vos coordonnées.",
    "",
    disclaimer,
    "",
    "POUR OBTENIR UN DEVIS",
    "Appelez S.B.M. au 04 77 50 15 65 pour organiser l’étude et la transmission de ce dossier.",
    "ZI La Gravoux, boulevard de l’Europe — 42380 Luriecq",
  ].join("\n");
  const name = value("fullname")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  exportName = `projet-escalier-sbm${name ? `-${name}` : ""}.txt`;
  result.hidden = false;
  document.querySelector("#quote-status").textContent =
    "Dossier préparé sur votre appareil. Il n’a pas été envoyé à S.B.M.";
  for (const id of ["download-brief", "print-brief", "copy-brief"])
    document.querySelector(`#${id}`).disabled = false;
  actionStatus.textContent = "";
  document.querySelector("#quote-result-title").focus({ preventScroll: true });
  result.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
    block: "start",
  });
});

// Clear a previous validation message as soon as the person corrects that field.
for (const id of ["fullname", "company"])
  document
    .querySelector(`#${id}`)
    .addEventListener("input", (event) => event.target.setCustomValidity(""));

form.addEventListener("input", () => {
  if (!result.hidden) {
    document.querySelector("#quote-status").textContent =
      "Le formulaire a changé depuis la préparation de ce dossier. Cliquez à nouveau sur « Préparer ma demande » pour actualiser le dossier et réactiver ses exports. Aucun envoi à S.B.M.";
    for (const id of ["download-brief", "print-brief", "copy-brief"])
      document.querySelector(`#${id}`).disabled = true;
  }
});

document.querySelector("#download-brief").addEventListener("click", () => {
  if (!briefText) return;
  const url = URL.createObjectURL(
    new Blob(["\uFEFF", briefText], { type: "text/plain;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = exportName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  actionStatus.textContent =
    "Téléchargement du dossier demandé à votre navigateur. Il contient vos coordonnées : conservez-le ou partagez-le avec les personnes de votre choix. Il n’a pas été envoyé à S.B.M.";
});

document.querySelector("#print-brief").addEventListener("click", () => {
  if (briefText) window.print();
});

async function copyText(text, status, success) {
  let copied = false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      copied = true;
    }
  } catch {
    // Some browsers expose the Clipboard API but deny permission; try the
    // user-initiated selection fallback before showing an unavailable state.
  }
  if (!copied) {
    try {
      const previousFocus = document.activeElement;
      const area = element("textarea", text);
      area.setAttribute("aria-label", "Texte à copier");
      area.style.cssText = "position:fixed;left:-9999px;top:0";
      document.body.append(area);
      area.select();
      copied = document.execCommand("copy");
      area.remove();
      previousFocus?.focus({ preventScroll: true });
    } catch {
      copied = false;
    }
  }
  status.textContent = copied
    ? success
    : "La copie n’est pas disponible dans ce navigateur. Vous pouvez sélectionner le lien ou le texte du résumé, ou télécharger le dossier si vous l’avez préparé.";
}

document.querySelector("#copy-brief").addEventListener("click", () => {
  if (briefText)
    copyText(
      briefText,
      actionStatus,
      "Résumé copié. Vous pouvez le transmettre par le moyen convenu avec l’atelier. Aucun envoi automatique.",
    );
});

document.querySelector("#copy-config").addEventListener("click", () => {
  copyText(
    configurationURL("./configurateur.html").href,
    document.querySelector("#config-copy-status"),
    "Lien de configuration copié, sans vos coordonnées personnelles.",
  );
});

fields.disabled = false;
document.querySelector("#copy-config").disabled = false;
document.querySelector("#quote-load-status").hidden = true;
