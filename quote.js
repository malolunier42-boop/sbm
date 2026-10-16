import {
  decodeConfig,
  encodeConfig,
  describeConfiguration,
} from "./catalog.js";

const configuration = decodeConfig(window.location.search);
const description = describeConfiguration(configuration);
const form = document.querySelector("#quote-form");
const fields = document.querySelector("#quote-fields");
const company = document.querySelector("#company");
const phone = document.querySelector("#phone");
const audienceInputs = [...form.querySelectorAll('[name="audience"]')];
const configurationSummary = document.querySelector("#configuration-summary");
const result = document.querySelector("#quote-result");
const printDocument = document.querySelector("#quote-print");
const actionStatus = document.querySelector("#brief-action-status");
const materialNames = {
  oak: "Chêne",
  walnut: "Noyer",
  ash: "Frêne",
  steel: "Acier",
  stone: "Pierre",
};
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

const initialAudience = new URLSearchParams(window.location.search).get(
  "audience",
);
if (initialAudience === "professional")
  audienceInputs.find((input) => input.value === "professional").checked = true;
const initialMaterial = form.querySelector(
  `[name="compare-material"][value="${Object.hasOwn(materialNames, configuration.treadMaterial) ? configuration.treadMaterial : "oak"}"]`,
);
if (initialMaterial) initialMaterial.checked = true;

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
  ].map((input) => materialNames[input.value]);
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
    { title: "VOTRE CONFIGURATION D’INSPIRATION", entries: description },
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
