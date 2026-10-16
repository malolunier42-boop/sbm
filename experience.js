// Shared interaction details; the site stays readable when JavaScript is unavailable.
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const desktop = matchMedia("(min-width: 981px)");
const hover = matchMedia("(hover: hover) and (pointer: fine)");
const header = document.querySelector(".site-header");
const nav = document.querySelector("#main-nav");
const menuToggle = document.querySelector(".menu-toggle");
const chevron =
  '<svg class="nav-chevron" viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>';
let activeDropdown;

function closeDropdown(restoreFocus = false) {
  if (!activeDropdown) return;
  const group = activeDropdown;
  group.querySelector("button").setAttribute("aria-expanded", "false");
  group.querySelector(".nav-dropdown-panel").hidden = true;
  group.classList.remove("expanded");
  activeDropdown = undefined;
  if (restoreFocus) group.querySelector("button").focus();
}
function closeNavigation(restoreFocus = false) {
  closeDropdown();
  if (!menuToggle || !nav) return;
  const wasOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Ouvrir le menu");
  nav.classList.remove("open");
  if (restoreFocus && wasOpen) menuToggle.focus();
}
function extraLink(href, title, description) {
  const a = document.createElement("a");
  a.href = href;
  const strong = document.createElement("span");
  strong.className = "dropdown-title";
  strong.textContent = title;
  const small = document.createElement("small");
  small.textContent = description;
  a.append(strong, small);
  return a;
}
function enhanceLink(anchor, description) {
  const title = anchor.textContent.trim();
  anchor.replaceChildren();
  const span = document.createElement("span");
  span.className = "dropdown-title";
  span.textContent = title;
  const small = document.createElement("small");
  small.textContent = description;
  anchor.append(span, small);
  return anchor;
}
function dropdown(label, id, kicker, links) {
  const group = document.createElement("div");
  group.className = "nav-dropdown";
  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "nav-dropdown-trigger";
  trigger.id = `trigger-${id}`;
  trigger.innerHTML = `${label}${chevron}`;
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-controls", id);
  const panel = document.createElement("div");
  panel.className = "nav-dropdown-panel";
  panel.id = id;
  panel.hidden = true;
  panel.setAttribute("aria-labelledby", trigger.id);
  const heading = document.createElement("span");
  heading.className = "dropdown-kicker";
  heading.textContent = kicker;
  panel.append(heading, ...links);
  group.append(trigger, panel);
  const open = (viaHover = false) => {
    if (activeDropdown !== group) closeDropdown();
    activeDropdown = group;
    group.dataset.hoverOpen = String(viaHover);
    trigger.setAttribute("aria-expanded", "true");
    panel.hidden = false;
    group.classList.add("expanded");
  };
  trigger.addEventListener("click", () => {
    if (activeDropdown === group && group.dataset.hoverOpen !== "true")
      closeDropdown();
    else open();
  });
  trigger.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      open();
      panel.querySelector("a")?.focus();
    }
  });
  let leave;
  group.addEventListener("pointerenter", (e) => {
    clearTimeout(leave);
    if (
      hover.matches &&
      desktop.matches &&
      e.pointerType === "mouse" &&
      activeDropdown !== group
    )
      open(true);
  });
  group.addEventListener("pointerleave", () => {
    leave = setTimeout(() => {
      if (activeDropdown === group && !group.contains(document.activeElement))
        closeDropdown();
    }, 180);
  });
  group.addEventListener("focusout", (event) => {
    if (event.relatedTarget && group.contains(event.relatedTarget)) return;
    setTimeout(() => {
      if (activeDropdown === group && !group.contains(document.activeElement))
        closeDropdown();
    }, 0);
  });
  return group;
}
if (header && nav && menuToggle) {
  const links = [...nav.querySelectorAll(":scope > a")];
  const individual = links.find((a) =>
    a.getAttribute("href")?.includes("particuliers.html"),
  );
  const professional = links.find((a) =>
    a.getAttribute("href")?.includes("professionnels.html"),
  );
  const material = links.find((a) =>
    a.getAttribute("href")?.includes("matieres.html"),
  );
  if (individual && professional && material) {
    const projectMenu = dropdown(
      "Votre projet",
      "project-navigation",
      "UN ESCALIER POUR VOTRE UNIVERS",
      [
        enhanceLink(individual, "Une maison à votre image."),
        enhanceLink(professional, "Des lieux de travail avec du caractère."),
        extraLink(
          "./devis.html",
          "Préparer ma demande",
          "Rassembler vos envies pour un devis sur étude.",
        ),
      ],
    );
    const materialMenu = dropdown(
      "Explorer",
      "inspiration-navigation",
      "LA MATIÈRE COMME INSPIRATION",
      [
        enhanceLink(material, "Bois, métal, couleurs et finitions."),
        extraLink(
          "./#inspirations",
          "Le carnet d’inspirations",
          "Des lignes, des textures et des idées.",
        ),
        extraLink(
          "./configurateur.html?railing=glass",
          "Jouer avec la transparence",
          "Une première intention à composer en 3D.",
        ),
      ],
    );
    nav.prepend(projectMenu, materialMenu);
  }
  menuToggle.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") !== "true";
    closeDropdown();
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute(
      "aria-label",
      open ? "Fermer le menu" : "Ouvrir le menu",
    );
    nav.classList.toggle("open", open);
  });
  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) closeNavigation();
  });
  document.addEventListener("pointerdown", (e) => {
    if (!header.contains(e.target)) {
      closeDropdown();
      if (!desktop.matches) closeNavigation();
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (activeDropdown) {
      e.preventDefault();
      closeDropdown(true);
    } else closeNavigation(true);
  });
  desktop.addEventListener("change", () => closeNavigation());
}

// A small reading guide and a quieter header once the page starts scrolling.
let progress = document.querySelector(".reading-progress");
if (!progress) {
  progress = document.createElement("div");
  progress.className = "reading-progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.prepend(progress);
}
const topButton = document.createElement("button");
topButton.className = "scroll-top";
topButton.type = "button";
topButton.setAttribute("aria-label", "Revenir en haut de la page");
topButton.hidden = true;
topButton.innerHTML =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5m-6 6 6-6 6 6"/></svg>';
document.body.append(topButton);
topButton.addEventListener("click", () => {
  scrollTo({ top: 0, behavior: reducedMotion.matches ? "instant" : "smooth" });
});
let scrollFrame = 0;
function updateScroll() {
  scrollFrame = 0;
  const total = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${total > 0 ? scrollY / total : 0})`;
  header?.classList.toggle("is-scrolled", scrollY > 24);
  topButton.hidden = scrollY < innerHeight * 0.8;
}
addEventListener(
  "scroll",
  () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
  },
  { passive: true },
);
addEventListener("resize", updateScroll, { passive: true });
updateScroll();

// Preserve the original DOM order and emphasis while animating the visible words.
const revealed = [];
function reveal(element) {
  element.classList.add("is-revealed");
}
function animatedWords(heading) {
  const readable = heading.cloneNode(true);
  readable.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
  heading.setAttribute(
    "aria-label",
    readable.textContent.replace(/\s+/g, " ").trim(),
  );
  const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode())
    if (walker.currentNode.textContent.trim()) nodes.push(walker.currentNode);
  let index = 0;
  for (const text of nodes) {
    const fragment = document.createDocumentFragment();
    for (const token of text.textContent.split(/(\s+)/)) {
      if (!token) continue;
      if (/^\s+$/.test(token)) {
        fragment.append(document.createTextNode(token));
        continue;
      }
      const word = document.createElement("span");
      word.className = "reveal-word";
      word.setAttribute("aria-hidden", "true");
      const inner = document.createElement("span");
      inner.className = "reveal-word-inner";
      inner.textContent = token;
      inner.style.setProperty(
        "--word-delay",
        `${Math.min(index++ * 48, 288)}ms`,
      );
      word.append(inner);
      fragment.append(word);
    }
    text.replaceWith(fragment);
  }
  heading.classList.add("word-reveal-ready");
  revealed.push(heading);
}
if (!reducedMotion.matches && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          reveal(entry.target);
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.08, rootMargin: "0px 0px -5% 0px" },
  );
  document.querySelectorAll("main h1,main h2").forEach((heading) => {
    if (
      heading.closest(
        "dialog,#quote-print,.studio-summary,.studio-controls,.quote-result",
      ) ||
      heading.textContent.trim().length < 8
    )
      return;
    animatedWords(heading);
    observer.observe(heading);
  });
  document
    .querySelectorAll(
      ".collection-card,.benefit-card,.service,.process-steps article,.steps-grid article,.material-card,.color-chip,.feature-image,.page-hero-art,.project,.contact-grid>div,.studio-bottom-info>div",
    )
    .forEach((panel, index) => {
      panel.classList.add("reveal-panel");
      panel.style.setProperty("--panel-delay", `${(index % 3) * 65}ms`);
      revealed.push(panel);
      observer.observe(panel);
    });
  document.addEventListener("focusin", (e) => {
    const panel = e.target.closest(".reveal-panel");
    if (panel) {
      reveal(panel);
      observer.unobserve(panel);
    }
  });
  reducedMotion.addEventListener("change", (e) => {
    if (e.matches) {
      revealed.forEach(reveal);
      observer.disconnect();
    }
  });
}
