import { test as base, expect } from '@playwright/test';

// Every scenario uses the production build at the GitHub Pages subpath.
// Network access is restricted to that server so tests need no external service.
const test = base.extend({
  page: async ({ page, baseURL }, use, testInfo) => {
    const errors = [];
    const origin = new URL(baseURL).origin;
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
      const expectedWebGLError = testInfo.title.includes('WebGL unavailable')
        && /^(THREE\.WebGLRenderer: ){1,2}Error creating WebGL context\.?$/.test(message.text());
      if (message.type() === 'error' && !expectedWebGLError) errors.push(message.text());
    });
    page.on('response', response => {
      if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
    });
    await page.route('**/*', route => {
      if (new URL(route.request().url()).origin === origin) return route.continue();
      errors.push(`Unexpected external request: ${route.request().url()}`);
      return route.abort();
    });
    await use(page);
    expect(errors, 'No unexpected JavaScript, HTTP or external-service errors').toEqual([]);
  },
});

async function openViewer(page) {
  await page.goto('./');
  await expect(page.locator('#model-stage')).toHaveClass(/ready/);
  await expect(page.locator('#stair-canvas')).toBeVisible();
}

async function sceneImage(page) {
  // Compare the rendered scene between user actions, never a machine-specific golden.
  return page.locator('#stair-canvas').screenshot();
}

async function expectSceneChange(page, previous) {
  await expect.poll(async () => !(await sceneImage(page)).equals(previous)).toBe(true);
}

test('three material choices change the rendered 3D scene', async ({ page }) => {
  await openViewer(page);
  const graphite = await sceneImage(page);
  await page.getByRole('button', { name: 'Bronze brossé et chêne', exact: true }).click();
  await expect(page.locator('#finish-name')).toHaveText('Bronze brossé & chêne');
  await expect(page.locator('[data-finish="bronze"]')).toHaveAttribute('aria-pressed', 'true');
  await expectSceneChange(page, graphite);
  const bronze = await sceneImage(page);
  await page.getByRole('button', { name: 'Ivoire et chêne', exact: true }).click();
  await expect(page.locator('#finish-name')).toHaveText('Ivoire & chêne');
  await expectSceneChange(page, bronze);
  await page.getByRole('button', { name: 'Acier graphite et chêne', exact: true }).click();
  await expect(page.locator('[data-finish="graphite"]')).toHaveAttribute('aria-pressed', 'true');
});

test('view presets, keyboard rotation and zoom work without a pointer', async ({ page }) => {
  await openViewer(page);
  for (const name of ['Face', 'Dessus', 'Perspective']) {
    await page.getByRole('button', { name, exact: true }).click();
    await expect(page.getByRole('button', { name, exact: true })).toHaveAttribute('aria-pressed', 'true');
  }
  const canvas = page.locator('#stair-canvas');
  await canvas.focus();
  const original = await sceneImage(page);
  await page.keyboard.press('ArrowRight');
  await expectSceneChange(page, original);
  const rotated = await sceneImage(page);
  await page.keyboard.press('+');
  await expectSceneChange(page, rotated);
  for (const key of ['ArrowLeft', '-', 'Home']) await page.keyboard.press(key);
  await expect(page.getByRole('button', { name: 'Perspective', exact: true })).toHaveAttribute('aria-pressed', 'true');
});

test('automatic rotation animates the model and stops on keyboard focus', async ({ page }) => {
  await openViewer(page);
  await page.locator('#auto-rotate').click();
  await expect(page.locator('#auto-rotate')).toHaveAttribute('aria-pressed', 'true');
  const previous = await sceneImage(page);
  await expectSceneChange(page, previous);
  await page.locator('#stair-canvas').focus();
  await expect(page.locator('#auto-rotate')).toHaveAttribute('aria-pressed', 'false');
});

test('gallery filters and accessible dialogs preserve keyboard focus', async ({ page }) => {
  await page.goto('./');
  for (const [filter, count] of [['escalier', 1], ['matiere', 2], ['all', 3]]) {
    const button = page.locator(`[data-filter="${filter}"]`);
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.project:visible')).toHaveCount(count);
    await expect(page.locator('.filter-count')).toHaveText(`${count} inspiration${count > 1 ? 's' : ''}`);
  }
  for (const card of await page.locator('.project').all()) {
    await card.click();
    const dialog = page.locator('#inspiration-dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading')).not.toBeEmpty();
    for (let index = 0; index < 3; index++) {
      await page.keyboard.press('Tab');
      // Native dialogs may tab to browser chrome (reported as body), but never
      // to links or buttons in the inert page behind the modal.
      expect(await dialog.evaluate(element => element.contains(document.activeElement)
        || document.activeElement === document.body)).toBe(true);
    }
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(card).toBeFocused();
  }
});

test.describe('mobile', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test('navigation closes after choosing an anchor and leaves touch scrolling available', async ({ page }) => {
    await openViewer(page);
    await expect(page.getByRole('link', { name: 'Appeler S.B.M. au 04 77 50 15 65', exact: true })).toBeVisible();
    const menu = page.locator('.menu-toggle');
    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await menu.click();
    await page.locator('#main-nav').getByRole('link', { name: 'L’atelier', exact: true }).click();
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await expect(page).toHaveURL(/#atelier$/);
    await expect(page.locator('#stair-canvas')).toHaveCSS('touch-action', 'pan-y');
  });

  test('immersive mode restores the model, touch scrolling, page position and focus', async ({ page }) => {
    await openViewer(page);
    const trigger = page.locator('#fullscreen-view');
    await trigger.scrollIntoViewIfNeeded();
    const scroll = await page.evaluate(() => scrollY);
    await trigger.click();
    const dialog = page.locator('#immersive-dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('#stair-canvas')).toBeVisible();
    await expect(page.locator('#stair-canvas')).toHaveCSS('touch-action', 'none');
    await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
    await dialog.getByRole('button', { name: 'Fermer la vue immersive', exact: true }).focus();
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(page.locator('#experience #stair-canvas')).toHaveCount(1);
    await expect(trigger).toBeFocused();
    await expect(page.locator('#stair-canvas')).toHaveCSS('touch-action', 'pan-y');
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
    await expect.poll(async () => Math.abs(await page.evaluate(() => scrollY) - scroll)).toBeLessThan(3);
  });
});

test('legal and privacy pages are published with verified identifiers and supplied publisher', async ({ page }) => {
  await page.goto('./');
  for (const [label, path] of [['Mentions légales', 'mentions-legales.html'], ['Confidentialité', 'confidentialite.html']]) {
    await page.locator('.footer-bottom').getByRole('link', { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/sbm/${path}$`));
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('main')).toContainText('334 201 639 00039');
    await expect(page.locator('main')).toContainText('Malo Lunier');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCSS('font-family', /Manrope/);
    await page.getByRole('link', { name: 'Revenir à l’atelier', exact: false }).click();
    await expect(page).toHaveURL(/\/sbm\/$/);
  }
});

test('reduced motion disables automatic rotation while keeping material controls usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openViewer(page);
  await expect(page.locator('#auto-rotate')).toBeDisabled();
  await expect(page.locator('#auto-rotate')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('html')).toHaveCSS('scroll-behavior', 'auto');
  await page.getByRole('button', { name: 'Ivoire et chêne', exact: true }).click();
  await expect(page.locator('#finish-name')).toHaveText('Ivoire & chêne');
});

test('WebGL unavailable shows an illustration while contact and gallery remain usable', async ({ page }) => {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return this.id === 'stair-canvas' && type.startsWith('webgl') ? null : getContext.call(this, type, ...args);
    };
  });
  await page.goto('./');
  await expect(page.locator('#model-stage')).toHaveClass(/failed/);
  await expect(page.locator('.scene-fallback')).toBeVisible();
  await expect.poll(() => page.locator('.scene-fallback').evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
  await expect(page.locator('#stair-canvas')).not.toBeVisible();
  await expect(page.locator('#finish-name')).toContainText('indisponible');
  await expect(page.locator('[data-finish="bronze"]')).toBeDisabled();
  await expect(page.locator('#fullscreen-view')).toBeDisabled();
  await expect(page.locator('.contact-phone')).toHaveAttribute('href', 'tel:+33477501565');
  await page.locator('[data-filter="escalier"]').click();
  await expect(page.locator('.project:visible')).toHaveCount(1);
  await page.locator('.project:visible').click();
  await expect(page.locator('#inspiration-dialog')).toBeVisible();
});

test('homepage stays within the viewport from small phones to desktop', async ({ page }) => {
  await openViewer(page);
  for (const width of [320, 360, 390, 620, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Width ${width}`).toBe(true);
  }
});
