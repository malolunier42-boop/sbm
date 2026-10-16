import { SHAPES } from "./catalog.js";
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [
  ...scope.querySelectorAll(selector),
];
const motion = matchMedia("(prefers-reduced-motion: reduce)");
const menu = $(".menu-toggle");
const nav = $("#main-nav");
const closeMenu = () => {
  menu.setAttribute("aria-expanded", "false");
  menu.setAttribute("aria-label", "Ouvrir le menu");
  nav.classList.remove("open");
};
menu.addEventListener("click", () => {
  const open = menu.getAttribute("aria-expanded") !== "true";
  menu.setAttribute("aria-expanded", String(open));
  menu.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
  nav.classList.toggle("open", open);
});
$$("a", nav).forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});
matchMedia("(min-width: 981px)").addEventListener("change", (event) => {
  if (event.matches) closeMenu();
});
$("#year").textContent = new Date().getFullYear();

// A visual reading guide; it never changes the document's reading order.
let scrollFrame = 0;
const updateProgress = () => {
  scrollFrame = 0;
  const total = document.documentElement.scrollHeight - innerHeight;
  $(".reading-progress").style.transform =
    `scaleX(${total > 0 ? scrollY / total : 0})`;
};
addEventListener(
  "scroll",
  () => {
    if (!scrollFrame && !motion.matches)
      scrollFrame = requestAnimationFrame(updateProgress);
  },
  { passive: true },
);
addEventListener("resize", updateProgress, { passive: true });
updateProgress();

// All times are evaluated in the workshop's timezone, including daylight savings.
function updateHours() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Paris",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const part = (type) => parts.find((value) => value.type === type)?.value;
  const weekday = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(
    part("weekday"),
  );
  const minute = Number(part("hour")) * 60 + Number(part("minute"));
  const open =
    weekday >= 0 &&
    weekday < 5 &&
    ((minute >= 480 && minute < 720) ||
      (weekday < 4 && minute >= 780 && minute < 1050));
  $("#hours-status").textContent = open
    ? "CRÉNEAU D’OUVERTURE"
    : "HORS HORAIRES";
  $$(".hours dl > div").forEach((row, index) =>
    row.classList.toggle("today", index === Math.min(weekday, 5)),
  );
}
updateHours();
setInterval(updateHours, 60000);

const projects = {
  sculpture: {
    title: "La ligne sculpturale",
    text: "Un escalier pensé comme une ligne dans l’espace. La structure sombre répond aux tons du bois, tandis que les marches ouvertes laissent la lumière circuler. Une étude de style pour commencer à parler de volumes et de proportions.",
    art: "architecture",
  },
  bronze: {
    title: "La chaleur du métal",
    text: "Une nuance bronze apporte une présence chaleureuse. Ses reflets évoluent avec l’éclairage et le point de vue. Cette exploration visuelle suggère une ambiance ; une finition, son échantillon et son entretien sont à discuter avec l’atelier.",
    art: "bronze-study",
  },
  light: {
    title: "Ce que la lumière révèle",
    text: "Quelques lignes verticales suffisent à transformer la perception d’un lieu. Elles filtrent le regard, dessinent des ombres et accompagnent la lumière. Une invitation à imaginer un garde-corps ou une séparation sans alourdir l’espace.",
    art: "light-study",
  },
};
$$("[data-filter]").forEach((button) =>
  button.addEventListener("click", () => {
    $$("[data-filter]").forEach((other) => {
      other.classList.toggle("active", other === button);
      other.setAttribute("aria-pressed", String(other === button));
    });
    let count = 0;
    $$(".project").forEach((card) => {
      card.hidden =
        button.dataset.filter !== "all" &&
        card.dataset.category !== button.dataset.filter;
      if (!card.hidden) count++;
    });
    $(".filter-count").textContent =
      `${count} inspiration${count > 1 ? "s" : ""}`;
  }),
);
const projectDialog = $("#inspiration-dialog");
let projectTrigger;
$$(".project").forEach((button) =>
  button.addEventListener("click", () => {
    projectTrigger = button;
    const project = projects[button.dataset.project];
    $("#inspiration-title").textContent = project.title;
    $(".dialog-description").textContent = project.text;
    const art = $(".dialog-art");
    art.className = "dialog-art";
    art.replaceChildren();
    if (project.art === "architecture") {
      const image = new Image();
      image.src = `${import.meta.env.BASE_URL}stair-study.jpg`;
      image.alt = "";
      art.append(image);
    } else {
      art.classList.add(project.art);
      if (project.art === "bronze-study") {
        ["bronze-fold fold-one", "bronze-fold fold-two"].forEach(
          (className) => {
            const span = document.createElement("span");
            span.className = className;
            art.append(span);
          },
        );
      } else {
        const span = document.createElement("span");
        span.className = "light-bars";
        art.append(span);
      }
    }
    projectDialog.showModal();
  }),
);
$(".dialog-close", projectDialog).addEventListener("click", () =>
  projectDialog.close(),
);
projectDialog.addEventListener("close", () =>
  projectTrigger?.focus({ preventScroll: true }),
);
projectDialog.addEventListener("click", (event) => {
  if (event.target !== projectDialog) return;
  const box = projectDialog.getBoundingClientRect();
  if (
    event.clientX < box.left ||
    event.clientX > box.right ||
    event.clientY < box.top ||
    event.clientY > box.bottom
  )
    projectDialog.close();
});

let viewer;
let requestedFinish = "graphite";
let requestedShape = "spiral";
const stage = $("#model-stage");
const canvas = $("#stair-canvas");
const rotationButton = $("#auto-rotate");
const finishNames = {
  graphite: "Acier graphite & chêne",
  bronze: "Bronze brossé & chêne",
  ivory: "Ivoire & chêne",
};
const viewerButtons = () => [...$$("button", stage), ...$$(".swatch")];
function updateViewerState(state) {
  rotationButton.setAttribute("aria-pressed", String(state.autoRotate));
  $$("[data-view]").forEach((button) => {
    const active = button.dataset.view === state.view;
    button.classList.toggle("selected", active);
    button.setAttribute("aria-pressed", String(active));
  });
}
function handleViewerError() {
  stage.classList.remove("ready");
  stage.classList.add("failed");
  $("#scene-status").textContent = "ILLUSTRATION DE REMPLACEMENT";
  $(".finish-name").textContent = "Vue 3D indisponible sur cet appareil";
  viewerButtons().forEach((button) => {
    button.disabled = !button.classList.contains("immersive-close");
  });
  $(".view-presets").hidden = true;
}
async function startViewer() {
  try {
    const { initViewer } = await import("./viewer.js");
    viewer = await initViewer({
      stage,
      canvas,
      onReady(controller) {
        viewer = controller;
        stage.classList.add("ready");
        stage.classList.remove("failed");
        $("#scene-status").textContent = "EXPÉRIENCE 3D EN DIRECT";
        $("#finish-name").textContent = finishNames[requestedFinish];
        viewerButtons().forEach((button) => {
          button.disabled = false;
        });
        $(".view-presets").hidden = false;
        viewer.setConfiguration({ shape: requestedShape });
        viewer.setFinish(requestedFinish);
        if (motion.matches) {
          rotationButton.disabled = true;
          rotationButton.title =
            "Rotation automatique désactivée selon vos préférences de mouvement";
        }
      },
      onError: handleViewerError,
      onChange: updateViewerState,
    });
  } catch {
    handleViewerError();
  }
}
$$(".swatch").forEach((button) =>
  button.addEventListener("click", () => {
    requestedFinish = button.dataset.finish;
    viewer?.setFinish(requestedFinish);
    $("#finish-name").textContent = finishNames[requestedFinish];
    $$(".swatch").forEach((other) => {
      const selected = other === button;
      other.classList.toggle("selected", selected);
      other.setAttribute("aria-pressed", String(selected));
    });
  }),
);
$$("[data-preview-shape]").forEach((button) =>
  button.addEventListener("click", () => {
    requestedShape = button.dataset.previewShape;
    viewer?.setConfiguration({ shape: requestedShape });
    viewer?.setFinish(requestedFinish);
    $$("[data-preview-shape]").forEach((other) =>
      other.setAttribute("aria-pressed", String(other === button)),
    );
    $(".scene-caption .label").textContent = SHAPES.find(
      (shape) => shape.id === requestedShape,
    ).label.toUpperCase();
  }),
);
$("#rotate-left").addEventListener("click", () => viewer?.rotate(-Math.PI / 7));
$("#rotate-right").addEventListener("click", () => viewer?.rotate(Math.PI / 7));
$("#zoom-in").addEventListener("click", () => viewer?.zoom(1.13));
$("#zoom-out").addEventListener("click", () => viewer?.zoom(1 / 1.13));
$("#reset-view").addEventListener("click", () => viewer?.reset());
rotationButton.addEventListener("click", () =>
  viewer?.setAutoRotate(rotationButton.getAttribute("aria-pressed") !== "true"),
);
canvas.addEventListener("keydown", (event) => {
  if (!viewer) return;
  const actions = {
    ArrowLeft: () => viewer.rotate(-Math.PI / 12),
    ArrowRight: () => viewer.rotate(Math.PI / 12),
    "+": () => viewer.zoom(1.1),
    "=": () => viewer.zoom(1.1),
    "-": () => viewer.zoom(1 / 1.1),
    Home: () => viewer.reset(),
  };
  if (actions[event.key]) {
    event.preventDefault();
    actions[event.key]();
  }
});
// Automatic motion stops whenever keyboard focus enters the interactive model.
stage.addEventListener("focusin", () => {
  viewer?.setAutoRotate(false);
});
motion.addEventListener("change", (event) => {
  rotationButton.disabled = event.matches;
  if (event.matches) viewer?.setAutoRotate(false);
});
const presetGroup = document.createElement("div");
presetGroup.className = "view-presets";
presetGroup.setAttribute("role", "group");
presetGroup.setAttribute("aria-label", "Choisir le point de vue");
[
  ["perspective", "Perspective"],
  ["front", "Face"],
  ["top", "Dessus"],
].forEach(([key, label]) => {
  const button = document.createElement("button");
  button.dataset.view = key;
  button.textContent = label;
  button.setAttribute("aria-pressed", String(key === "perspective"));
  button.classList.toggle("selected", key === "perspective");
  button.addEventListener("click", () => viewer?.setView(key));
  presetGroup.append(button);
});
stage.append(presetGroup);
const immersiveDialog = $("#immersive-dialog");
const stageMarker = document.createComment("model-stage-home");
stage.before(stageMarker);
const fullscreenTrigger = $("#fullscreen-view");
let immersiveScroll = 0;
fullscreenTrigger.addEventListener("click", () => {
  if (!viewer) return;
  immersiveScroll = scrollY;
  immersiveDialog.append(stage);
  immersiveDialog.showModal();
  document.body.style.overflow = "hidden";
  viewer.setInteraction(true);
  $(".drag-hint span").textContent =
    "Glissez pour explorer · Échap pour fermer";
  requestAnimationFrame(() => viewer.resize());
});
$(".immersive-close").addEventListener("click", () => immersiveDialog.close());
immersiveDialog.addEventListener("close", () => {
  stageMarker.after(stage);
  viewer?.setInteraction(false);
  document.body.style.overflow = "";
  $(".drag-hint span").textContent = matchMedia("(pointer: coarse)").matches
    ? "Flèches pour pivoter · Grand écran tactile"
    : "Glissez pour explorer";
  scrollTo({ top: immersiveScroll, behavior: "instant" });
  requestAnimationFrame(() => {
    viewer?.resize();
    fullscreenTrigger.focus({ preventScroll: true });
  });
});
if (matchMedia("(pointer: coarse)").matches)
  $(".drag-hint span").textContent =
    "Flèches pour pivoter · Grand écran tactile";
viewerButtons().forEach((button) => {
  button.disabled = true;
});
startViewer();
