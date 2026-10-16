import { test, expect } from '@playwright/test';

// Real Chromium touch input is essential here: dispatching a synthetic pointer
// event would bypass the browser's native scrolling and pinch arbitration.
test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });

async function openViewer(page, home = false) {
  await page.goto(home ? './' : './configurateur.html?shape=quarter');
  const stage = page.locator(home ? '#model-stage' : '#studio-stage');
  const canvas = page.locator(home ? '#stair-canvas' : '#studio-canvas');
  await expect(stage).toHaveClass(/ready/);
  await canvas.scrollIntoViewIfNeeded();
  await canvas.evaluate(element => {
    const rect = element.getBoundingClientRect();
    scrollTo({ top: scrollY + rect.top - Math.max(80, (innerHeight - rect.height) / 2), behavior: 'instant' });
  });
  return { stage, canvas };
}

function point(box, x, y, id = 1) {
  return { id, x: box.x + box.width * x, y: box.y + box.height * y, radiusX: 2, radiusY: 2, force: 1 };
}

async function gesture(session, page, start, end, steps = 12) {
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: start });
  try {
    for (let step = 1; step <= steps; step += 1) {
      const fraction = step / steps;
      const touchPoints = start.map((touch, index) => ({ ...touch,
        x: touch.x + (end[index].x - touch.x) * fraction,
        y: touch.y + (end[index].y - touch.y) * fraction,
      }));
      await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints });
      // Spread input over several rendered frames, as a human gesture would.
      await page.waitForTimeout(20);
    }
  } finally {
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  }
}

async function visibleChange(canvas, action) {
  const before = await canvas.screenshot();
  await action();
  await expect.poll(async () => !(await canvas.screenshot()).equals(before), {
    message: 'The touch gesture must change the rendered staircase, not only UI state',
  }).toBe(true);
}

async function horizontalRotation(page, session, canvas) {
  const box = await canvas.boundingBox();
  const initialScroll = await page.evaluate(() => scrollY);
  await visibleChange(canvas, () => gesture(session, page,
    [point(box, 0.27, 0.5)], [point(box, 0.73, 0.5)]));
  expect(Math.abs(await page.evaluate(() => scrollY) - initialScroll)).toBeLessThan(3);
}

async function nativeVerticalScroll(page, session, canvas) {
  const box = await canvas.boundingBox();
  const initialScroll = await page.evaluate(() => scrollY);
  await gesture(session, page, [point(box, 0.5, 0.76)], [point(box, 0.5, 0.23)]);
  await expect.poll(async () => (await page.evaluate(() => scrollY)) - initialScroll, {
    message: 'A vertical swipe starting on the 3D plan must still scroll the document',
  }).toBeGreaterThan(40);
}

test('mobile studio rotates with a horizontal swipe while vertical gestures scroll the page', async ({ page }) => {
  const { canvas } = await openViewer(page);
  const session = await page.context().newCDPSession(page);
  await horizontalRotation(page, session, canvas);
  await nativeVerticalScroll(page, session, canvas);
  await session.detach();
});

test('the homepage 3D preview accepts the same native touch gestures', async ({ page }) => {
  const { canvas } = await openViewer(page, true);
  const session = await page.context().newCDPSession(page);
  await horizontalRotation(page, session, canvas);
  await nativeVerticalScroll(page, session, canvas);
  await session.detach();
});

test('pinch zooms the model and immersive touch restores scrolling and focus when closed', async ({ page }) => {
  test.setTimeout(60_000);
  const { canvas } = await openViewer(page);
  const session = await page.context().newCDPSession(page);
  const embeddedScroll = await page.evaluate(() => scrollY);
  const initialScale = await page.evaluate(() => visualViewport.scale);
  let box = await canvas.boundingBox();
  await visibleChange(canvas, () => gesture(session, page,
    [point(box, 0.4, 0.5, 1), point(box, 0.6, 0.5, 2)],
    [point(box, 0.22, 0.5, 1), point(box, 0.78, 0.5, 2)]));
  expect(await page.evaluate(() => visualViewport.scale)).toBeCloseTo(initialScale, 2);
  expect(Math.abs(await page.evaluate(() => scrollY) - embeddedScroll)).toBeLessThan(3);

  const enlarge = page.locator('#studio-fullscreen');
  await enlarge.scrollIntoViewIfNeeded();
  const openingScroll = await page.evaluate(() => scrollY);
  await enlarge.click();
  await expect(page.locator('#studio-dialog')).toBeVisible();
  await expect(canvas).toHaveCSS('touch-action', 'none');
  const immersiveScroll = await page.evaluate(() => scrollY);
  box = await canvas.boundingBox();
  await visibleChange(canvas, () => gesture(session, page,
    [point(box, 0.5, 0.7)], [point(box, 0.56, 0.35)]));
  expect(await page.evaluate(() => scrollY)).toBe(immersiveScroll);
  box = await canvas.boundingBox();
  await visibleChange(canvas, () => gesture(session, page,
    [point(box, 0.25, 0.5, 1), point(box, 0.75, 0.5, 2)],
    [point(box, 0.38, 0.5, 1), point(box, 0.62, 0.5, 2)]));
  expect(await page.evaluate(() => visualViewport.scale)).toBeCloseTo(initialScale, 2);

  await page.locator('#studio-close').tap();
  await expect(page.locator('#studio-dialog')).toBeHidden();
  await expect(enlarge).toBeFocused();
  await expect(canvas).toHaveCSS('touch-action', 'pan-y');
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  expect(Math.abs(await page.evaluate(() => scrollY) - openingScroll)).toBeLessThan(3);
  await canvas.evaluate(element => {
    const rect = element.getBoundingClientRect();
    scrollTo({ top: scrollY + rect.top - Math.max(80, (innerHeight - rect.height) / 2), behavior: 'instant' });
  });
  await nativeVerticalScroll(page, session, canvas);
  await session.detach();
});

test('small portrait and landscape immersive controls have clear 44px touch targets', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await openViewer(page);
  await page.locator('#studio-fullscreen').tap();
  const stage = page.locator('#studio-dialog #studio-stage');
  for (const viewport of [{ width: 320, height: 740 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(viewport);
    await expect(stage).toBeVisible();
    const controls = stage.locator('.studio-toolbar > button:visible, .studio-view-options > button:visible, .studio-ambience > summary:visible, #studio-rotate:visible');
    const boxes = [];
    for (const control of await controls.all()) {
      const box = await control.boundingBox();
      const label = await control.getAttribute('aria-label') || await control.textContent();
      expect(box.width, `${label} width at ${viewport.width}px`).toBeGreaterThanOrEqual(44);
      expect(box.height, `${label} height at ${viewport.width}px`).toBeGreaterThanOrEqual(44);
      expect(box.x, label).toBeGreaterThanOrEqual(0);
      expect(box.y, label).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width, label).toBeLessThanOrEqual(viewport.width + 1);
      expect(box.y + box.height, label).toBeLessThanOrEqual(viewport.height + 1);
      expect(await control.evaluate(element => {
        const rect = element.getBoundingClientRect();
        const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
        return element === hit || element.contains(hit);
      }), `${label} must receive a touch at its center`).toBe(true);
      boxes.push({ ...box, label });
    }
    for (let i = 0; i < boxes.length; i += 1) {
      for (let j = i + 1; j < boxes.length; j += 1) {
        const a = boxes[i];
        const b = boxes[j];
        const overlapWidth = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
        const overlapHeight = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
        expect(overlapWidth > 1 && overlapHeight > 1, `${a.label} overlaps ${b.label} at ${viewport.width}px`).toBe(false);
      }
    }
  }
});

test('mobile editing keeps a reachable 3D preview and passes the latest choices to the quote', async ({ page }) => {
  await openViewer(page);
  await page.locator('#tab-material').tap();
  await page.locator('[data-structure="walnut"]').tap();
  await page.locator('#structure-options').scrollIntoViewIfNeeded();
  const dock = page.locator('#studio-mobile-dock');
  const dockPreview = page.locator('#studio-dock-preview');
  await expect(dock).toBeVisible();
  const quote = page.locator('#studio-mobile-quote');
  const quoteURL = new URL(await quote.getAttribute('href'), page.url());
  expect(quoteURL.searchParams.get('shape')).toBe('quarter');
  expect(quoteURL.searchParams.get('structureMaterial')).toBe('walnut');

  const editingScroll = await page.evaluate(() => scrollY);
  await dockPreview.tap();
  await expect(page.locator('#studio-dialog')).toBeVisible();
  await expect(dock).toBeHidden();
  await page.locator('#studio-close').tap();
  await expect(page.locator('#studio-dialog')).toBeHidden();
  await expect(dockPreview).toBeFocused();
  expect(Math.abs(await page.evaluate(() => scrollY) - editingScroll)).toBeLessThan(3);

  const inlinePreview = page.locator('#studio-edit-preview');
  await inlinePreview.tap();
  await expect(page.locator('#studio-dialog')).toBeVisible();
  await page.locator('#studio-close').tap();
  await expect(inlinePreview).toBeFocused();
  await page.locator('#structure-options').scrollIntoViewIfNeeded();
  await expect(dock).toBeVisible();
  await quote.tap();
  await expect(page).toHaveURL(/\/sbm\/devis\.html\?/);
  await expect(page.locator('#configuration-summary')).toContainText('Noyer');
  await expect(page.locator('#configuration-summary')).toContainText('Quart tournant');
});
