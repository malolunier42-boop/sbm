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
  await page.keyboard.press("Tab");
  await expect(page.locator("#project-navigation a").nth(2)).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(explorer).toBeFocused();
  await expect(project).toHaveAttribute("aria-expanded", "false");
  await explorer.click();
  await expect(project).toHaveAttribute("aria-expanded", "false");
  await expect(explorer).toHaveAttribute("aria-expanded", "true");
  await page.locator("h1").click();
  await expect(explorer).toHaveAttribute("aria-expanded", "false");

  // Hybrid devices can switch back to mouse hover after a touch interaction.
  await page.locator(".site-header .brand").dispatchEvent("pointerdown", { pointerType: "touch" });
  await project.hover();
  await expect(project).toHaveAttribute("aria-expanded", "true");
  await page.locator("h1").hover();
  await expect(project).toHaveAttribute("aria-expanded", "false");
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

test.describe("touch navigation", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });

  test("submenus stay open after a finger is lifted without focusing the button", async ({ page }) => {
    // Safari on iOS does not focus buttons on tap. Cancel only the compatibility
    // mousedown default to reproduce that behavior with real Chromium touch input.
    await page.addInitScript(() => {
      document.addEventListener("mousedown", (event) => {
        if (event.target.closest(".nav-dropdown-trigger")) event.preventDefault();
      });
    });
    await page.goto("./particuliers.html");
    const menu = page.locator(".menu-toggle");
    const project = page.getByRole("button", { name: "Votre projet", exact: true });
    const explorer = page.getByRole("button", { name: "Explorer", exact: true });

    await menu.tap();
    await project.tap();
    await expect(project).not.toBeFocused();
    // Wait past the old hover-dismissal delay: the menu must remain usable.
    await page.waitForTimeout(350);
    await expect(project).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#project-navigation")).toBeVisible();

    await explorer.tap();
    await page.waitForTimeout(350);
    await expect(project).toHaveAttribute("aria-expanded", "false");
    await expect(explorer).toHaveAttribute("aria-expanded", "true");
    await explorer.tap();
    await expect(explorer).toHaveAttribute("aria-expanded", "false");
    await expect(menu).toHaveAttribute("aria-expanded", "true");

    await project.tap();
    await page.waitForTimeout(350);
    await page.locator('#project-navigation a[href="./professionnels.html"]').tap();
    await expect(page).toHaveURL(/professionnels\.html$/);
    await expect(page.locator(".menu-toggle")).toHaveAttribute("aria-expanded", "false");
  });

  test("touch focus changes do not dismiss a submenu and outside taps still close navigation", async ({ page }) => {
    await page.goto("./matieres.html");
    const menu = page.locator(".menu-toggle");
    const project = page.locator("#trigger-project-navigation");
    await menu.tap();
    await project.tap();
    await project.evaluate((button) => button.blur());
    await page.waitForTimeout(350);
    await expect(project).toHaveAttribute("aria-expanded", "true");
    await expect(menu).toHaveAttribute("aria-expanded", "true");

    const navigation = await page.locator("#main-nav").boundingBox();
    await page.touchscreen.tap(5, navigation.y + 20);
    await expect(project).toHaveAttribute("aria-expanded", "false");
    await expect(menu).toHaveAttribute("aria-expanded", "false");
    await menu.tap();
    await page.waitForTimeout(350);
    await expect(menu).toHaveAttribute("aria-expanded", "true");
    await menu.tap();
    await expect(menu).toHaveAttribute("aria-expanded", "false");
  });
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
