const menu = document.querySelector(".menu-toggle");
const nav = document.querySelector("#main-nav");
if (menu && nav) {
  const close = (restore = false) => {
    const open = menu.getAttribute("aria-expanded") === "true";
    menu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-label", "Ouvrir le menu");
    nav.classList.remove("open");
    if (open && restore) menu.focus();
  };
  menu.addEventListener("click", () => {
    const open = menu.getAttribute("aria-expanded") !== "true";
    menu.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    nav.classList.toggle("open", open);
  });
  nav
    .querySelectorAll("a")
    .forEach((a) => a.addEventListener("click", () => close()));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close(true);
  });
  matchMedia("(min-width: 981px)").addEventListener("change", (e) => {
    if (e.matches) close();
  });
}
