import { test, expect } from "@playwright/test";

test("desktop dropdowns support click, keyboard, Escape and outside dismissal", async ({
  page,
}) => {
  await page.goto("./particuliers.html");
  const project = page.getByRole("button", {
    name: "Votre projet",
    exact: true,
  });
  await project.click();
  await expect(project).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#project-navigation")).toBeVisible();
  await expect(
    page
      .locator("#project-navigation")
      .getByRole("link", { name: "Professionnels", exact: false }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(project).toHaveAttribute("aria-expanded", "false");
  await expect(project).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.locator("#project-navigation a").first()).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator("#project-navigation a").nth(1)).toBeFocused();
  const explorer = page.getByRole("button", { name: "Explorer", exact: true });
  await explorer.click();
  await expect(project).toHaveAttribute("aria-expanded", "false");
  await expect(explorer).toHaveAttribute("aria-expanded", "true");
  await page.locator("h1").click();
  await expect(explorer).toHaveAttribute("aria-expanded", "false");
});

test("mobile dropdown navigation preserves access to the professional journey", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");
  const menu = page.locator(".menu-toggle");
  await menu.click();
  await page.getByRole("button", { name: "Votre projet", exact: true }).click();
  await expect(page.locator("#project-navigation")).toBeVisible();
  await page
    .locator('#project-navigation a[href="./professionnels.html"]')
    .click();
  await expect(page).toHaveURL(/professionnels\.html$/);
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator(".menu-toggle")).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.locator(".menu-toggle").click();
  await page.getByRole("button", { name: "Explorer", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Explorer", exact: true }),
  ).toBeFocused();
  await expect(page.locator(".menu-toggle")).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  await page.keyboard.press("Escape");
  await expect(page.locator(".menu-toggle")).toBeFocused();
  await expect(page.locator(".menu-toggle")).toHaveAttribute(
    "aria-expanded",
    "false",
  );
});

test("scroll reveals retain readable headings and reduced-motion support", async ({
  page,
}) => {
  await page.goto("./matieres.html");
  const heading = page.locator("h1");
  await expect(heading).toHaveClass(/word-reveal-ready/);
  await expect(heading).toHaveClass(/is-revealed/);
  expect(await heading.getAttribute("aria-label")).toMatch(/\S/);
  const lower = page.locator(".page-cta h2");
  await lower.scrollIntoViewIfNeeded();
  await expect(lower).toHaveClass(/is-revealed/);
  await expect(lower.locator(".reveal-word-inner").first()).toHaveCSS(
    "opacity",
    "1",
  );

  await expect(
    page.getByRole("button", { name: "Revenir en haut de la page" }),
  ).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(lower.locator(".reveal-word-inner").first()).toHaveCSS(
    "transform",
    "none",
  );
  await page.goto("./matieres.html");
  await expect(page.locator("h1")).not.toHaveClass(/word-reveal-ready/);
  await expect(page.locator(".page-cta h2")).toBeVisible();
  const text = await page.locator(".page-cta h2").textContent();
  expect(text.trim().length).toBeGreaterThan(10);
});
