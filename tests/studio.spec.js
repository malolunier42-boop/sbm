import { test as base, expect } from '@playwright/test';

// Exercise the production build at the same /sbm/ prefix as GitHub Pages.
// The studio and the local project dossier must work without third-party APIs.
const test = base.extend({
  page: async ({ page, baseURL }, use, testInfo) => {
    const errors = [];
    const origin = new URL(baseURL).origin;
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
      const expectedWebGLFailure = testInfo.title.includes('WebGL unavailable')
        && /Error creating WebGL context/.test(message.text());
      if (message.type() === 'error' && !expectedWebGLFailure) errors.push(message.text());
    });
    page.on('response', response => {
      if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
    });
    await page.route('**/*', route => {
      const request = route.request();
      if (new URL(request.url()).origin !== origin) {
        errors.push(`Unexpected external request: ${request.url()}`);
        return route.abort();
      }
      // Preparing a dossier is a local action, never a hidden submission.
      if (request.method() !== 'GET') errors.push(`Unexpected submission: ${request.method()} ${request.url()}`);
      return route.continue();
    });
    await use(page);
    expect(errors, 'No unexpected browser errors, failed assets or remote submissions').toEqual([]);
  },
});

async function studio(page, search = '') {
  await page.goto(`./configurateur.html${search}`);
  await expect(page.locator('#studio-stage')).toHaveClass(/ready/);
  await expect(page.locator('#studio-canvas')).toBeVisible();
}

async function tab(page, key) {
  await page.locator(`[data-tab="${key}"]`).click();
  await expect(page.locator(`#panel-${key}`)).toBeVisible();
}

async function scene(page) {
  return page.locator('#studio-canvas').screenshot();
}

async function renderedChange(page, action) {
  const before = await scene(page);
  await action();
  // The controller debounces geometry rebuilds. Compare actual canvas pixels,
  // rather than only asserting that a button or summary label changed.
  await expect.poll(async () => !(await scene(page)).equals(before)).toBe(true);
}

async function chooseAmbience(page, value) {
  const panel = page.locator('.studio-ambience');
  const trigger = panel.locator('summary');
  if (!(await panel.evaluate(element => element.open))) await trigger.click();
  await expect(page.locator(`[data-ambience="${value}"]`)).toBeVisible();
  await page.locator(`[data-ambience="${value}"]`).click();
  await expect(panel).not.toHaveAttribute('open', '');
  await expect(trigger).toBeFocused();
  await expect(page.locator(`[data-ambience="${value}"]`)).toHaveAttribute('aria-pressed', 'true');
}

async function validContact(page) {
  await expect(page.locator('#quote-fields')).toBeEnabled();
  await page.locator('#fullname').fill('Alex Martin');
  await page.locator('#phone').fill('06 12 34 56 78');
  await page.locator('#project-type').selectOption('renovation');
  await page.locator('#timeline').selectOption('3to6');
}

function disableWebGL(page) {
  return page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return this.id === 'studio-canvas' && String(type).startsWith('webgl')
        ? null : getContext.call(this, type, ...args);
    };
  });
}

test('all four stair shapes, direction and dimensions change the rendered geometry', async ({ page }) => {
  test.setTimeout(60_000);
  await studio(page);
  for (const shape of ['straight', 'quarter', 'half', 'spiral']) {
    await renderedChange(page, () => page.locator(`[data-shape="${shape}"]`).click());
    await expect(page.locator(`[data-shape="${shape}"]`)).toHaveAttribute('aria-pressed', 'true');
    expect(new URL(page.url()).searchParams.get('shape')).toBe(shape);
  }
  await renderedChange(page, () => page.locator('[data-direction="left"]').click());
  await tab(page, 'project');
  await renderedChange(page, async () => {
    await page.locator('#height-number').fill('330');
    await page.locator('#height-number').press('Tab');
  });
  // Give the helical sketch enough diameter for a 125cm radial width. At
  // 180cm diameter the centre post physically limits both 90 and 125cm wishes
  // to the same drawn width; that limit is explained beside the width control.
  await page.locator('#advanced-project > summary').click();
  await renderedChange(page, async () => {
    await page.locator('#diameter-number').fill('280');
    await page.locator('#diameter-number').press('Tab');
  });
  await renderedChange(page, async () => {
    await page.locator('#width-number').fill('125');
    await page.locator('#width-number').press('Tab');
  });
  await expect(page.locator('#summary-detail')).toContainText('330 × 125 cm');
});

test('tread materials, finishes and six independent structure materials change actual canvas pixels', async ({ page }) => {
  test.setTimeout(90_000);
  await studio(page, '?shape=straight');
  await tab(page, 'material');
  for (const material of ['walnut', 'ash', 'steel', 'stone', 'oak']) {
    await renderedChange(page, () => page.locator(`[data-tread="${material}"]`).click());
    await expect(page.locator(`[data-tread="${material}"]`)).toHaveAttribute('aria-pressed', 'true');
  }
  for (const finish of ['brushed', 'polished', 'matte']) {
    await renderedChange(page, () => page.locator(`#finish-options [data-finish="${finish}"]`).click());
  }
  await renderedChange(page, () => page.locator('[data-color="#254d3f"]').click());
  await renderedChange(page, () => page.locator('#custom-color').fill('#c95d91'));
  await expect(page.locator('#color-hex')).toHaveText('#C95D91');
  // Treads stay oak throughout: changing a structure must have its own visible
  // effect instead of only changing the wood selected for the steps.
  for (const [structure, label] of [['wood', 'Chêne'], ['walnut', 'Noyer'], ['ash', 'Frêne'], ['aluminium', 'Aluminium'], ['stainless', 'Inox'], ['steel', 'Acier']]) {
    await renderedChange(page, () => page.locator(`[data-structure="${structure}"]`).click());
    await expect(page.locator(`[data-structure="${structure}"]`)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-tread="oak"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#summary-detail')).toContainText(`Structure ${label}`);
    expect(new URL(page.url()).searchParams.get('structureMaterial')).toBe(structure);
    expect(new URL(page.url()).searchParams.get('treadMaterial')).toBe('oak');
  }
});

test('all railing designs, risers and lighting change the rendered model', async ({ page }) => {
  test.setTimeout(60_000);
  await studio(page, '?shape=quarter');
  await tab(page, 'details');
  for (const railing of ['horizontal', 'glass', 'solid', 'vertical']) {
    await renderedChange(page, () => page.locator(`[data-railing="${railing}"]`).click());
    await expect(page.locator(`[data-railing="${railing}"]`)).toHaveAttribute('aria-pressed', 'true');
  }
  await renderedChange(page, () => page.locator('#risers').check());
  await renderedChange(page, () => page.locator('#led').check());
  expect(new URL(page.url()).searchParams.get('risers')).toBe('1');
  expect(new URL(page.url()).searchParams.get('led')).toBe('1');
});

test('railings can be removed and restored on every staircase shape', async ({ page }) => {
  test.setTimeout(90_000);
  await studio(page);
  for (const shape of ['straight', 'quarter', 'half', 'spiral']) {
    await tab(page, 'shape');
    await renderedChange(page, () => page.locator(`[data-shape="${shape}"]`).click());
    await tab(page, 'details');
    await renderedChange(page, () => page.locator('[data-railing="none"]').click());
    await expect(page.locator('[data-railing="none"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#summary-detail')).toContainText('Sans garde-corps');
    expect(new URL(page.url()).searchParams.get('railing')).toBe('none');
    const quoteURL = new URL(await page.locator('#quote-link').getAttribute('href'));
    expect(quoteURL.searchParams.get('railing')).toBe('none');
    expect(quoteURL.searchParams.get('shape')).toBe(shape);
    await renderedChange(page, () => page.locator('[data-railing="vertical"]').click());
    await expect(page.locator('[data-railing="vertical"]')).toHaveAttribute('aria-pressed', 'true');
  }
});

test('a walnut structure without railings survives a shared link, quote dossier and return to the studio', async ({ page }) => {
  await studio(page, '?shape=half&structureMaterial=walnut&treadMaterial=ash&railing=none&ambience=warm&structureColor=%238b4020&metalFinish=polished');
  await tab(page, 'material');
  await expect(page.locator('[data-structure="walnut"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-tread="ash"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#metal-color-fields')).toBeHidden();
  await expect(page.locator('#metal-finish-fields')).toBeHidden();
  await tab(page, 'details');
  await expect(page.locator('[data-railing="none"]')).toHaveAttribute('aria-pressed', 'true');
  await page.goto(page.url());
  await expect(page.locator('#studio-stage')).toHaveClass(/ready/);
  await expect(page.locator('#summary-detail')).toContainText('Structure Noyer');
  await expect(page.locator('#summary-detail')).toContainText('Sans garde-corps');
  await page.locator('#quote-link').click();
  await expect(page.locator('#configuration-summary')).toContainText('Noyer');
  await expect(page.locator('#configuration-summary')).toContainText('Frêne');
  await expect(page.locator('#configuration-summary')).toContainText('Sans garde-corps');
  await expect(page.locator('#configuration-summary')).toContainText('Bois naturel');
  await expect(page.locator('#configuration-summary')).not.toContainText('Couleur');
  const editURL = new URL(await page.locator('#edit-configuration').getAttribute('href'));
  expect(editURL.searchParams.get('structureMaterial')).toBe('walnut');
  expect(editURL.searchParams.get('treadMaterial')).toBe('ash');
  expect(editURL.searchParams.get('railing')).toBe('none');
  await validContact(page);
  await page.getByRole('button', { name: 'Préparer ma demande', exact: false }).click();
  for (const label of ['Noyer', 'Frêne', 'Sans garde-corps']) await expect(page.locator('#quote-print')).toContainText(label);
  const resumeURL = new URL(await page.locator('.brief-config-link').getAttribute('href'));
  expect(resumeURL.searchParams.get('structureMaterial')).toBe('walnut');
  expect(resumeURL.searchParams.get('railing')).toBe('none');
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#download-brief').click();
  const download = await downloadPromise;
  const chunks = [];
  for await (const chunk of await download.createReadStream()) chunks.push(chunk);
  const dossier = Buffer.concat(chunks).toString('utf8');
  for (const label of ['Noyer', 'Frêne', 'Sans garde-corps']) expect(dossier).toContain(label);
  await page.locator('#edit-configuration').click();
  await expect(page.locator('#studio-stage')).toHaveClass(/ready/);
  await tab(page, 'material');
  await expect(page.locator('[data-structure="walnut"]')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('[data-structure="steel"]').click();
  await expect(page.locator('#metal-color-fields')).toBeVisible();
  await expect(page.locator('#metal-finish-fields')).toBeVisible();
  await expect(page.locator('#custom-color')).toHaveValue('#8b4020');
  await expect(page.locator('[data-finish="polished"]')).toHaveAttribute('aria-pressed', 'true');
  await tab(page, 'details');
  await expect(page.locator('[data-railing="none"]')).toHaveAttribute('aria-pressed', 'true');
});

test('optional room ambiences change the scene while preserving the staircase and point of view', async ({ page }) => {
  test.setTimeout(75_000);
  await studio(page, '?shape=quarter&treadMaterial=walnut&structureColor=%23785abb&height=320&width=110&steps=18&led=1');
  const original = Object.fromEntries(new URL(await page.locator('#quote-link').getAttribute('href')).searchParams);
  expect(original.ambience).toBe('studio');
  await page.locator('[data-view="front"]').click();
  for (const ambience of ['warm', 'contemporary', 'professional', 'studio']) {
    await renderedChange(page, () => chooseAmbience(page, ambience));
    expect(new URL(page.url()).searchParams.get('ambience')).toBe(ambience);
    await expect(page.locator('[data-view="front"]')).toHaveAttribute('aria-pressed', 'true');
    const current = Object.fromEntries(new URL(await page.locator('#quote-link').getAttribute('href')).searchParams);
    expect(current).toEqual({ ...original, ambience });
  }
  await expect(page.locator('[data-shape="quarter"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#summary-title')).toContainText('Noyer');
  await expect(page.locator('#summary-detail')).toContainText('320 × 110 cm');
  await chooseAmbience(page, 'professional');
  const savedURL = page.url();
  await page.goto(savedURL);
  await expect(page.locator('#studio-stage')).toHaveClass(/ready/);
  await expect(page.locator('[data-ambience="professional"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#ambience-note')).toContainText('Espace professionnel');
  await expect(page.locator('#summary-title')).toContainText('Noyer');
});

test('an ambience travels with the shared project, quote and downloaded dossier', async ({ page }) => {
  await studio(page, '?shape=half&treadMaterial=ash&height=310&width=105&steps=18&ambience=warm');
  await expect(page.locator('[data-ambience="warm"]')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#quote-link').click();
  await expect(page.locator('#configuration-summary')).toContainText('Maison chaleureuse');
  const editURL = new URL(await page.locator('#edit-configuration').getAttribute('href'));
  expect(editURL.searchParams.get('ambience')).toBe('warm');
  expect(editURL.searchParams.get('shape')).toBe('half');
  await validContact(page);
  await page.getByRole('button', { name: 'Préparer ma demande', exact: false }).click();
  await expect(page.locator('#quote-print')).toContainText('Maison chaleureuse');
  const resumeLink = new URL(await page.locator('.brief-config-link').getAttribute('href'));
  expect(resumeLink.searchParams.get('ambience')).toBe('warm');
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#download-brief').click();
  const download = await downloadPromise;
  const chunks = [];
  for await (const chunk of await download.createReadStream()) chunks.push(chunk);
  expect(Buffer.concat(chunks).toString('utf8')).toContain('Maison chaleureuse');
  await page.locator('#edit-configuration').click();
  await expect(page.locator('#studio-stage')).toHaveClass(/ready/);
  await expect(page.locator('[data-ambience="warm"]')).toHaveAttribute('aria-pressed', 'true');
});

test('ambience choices remain accessible on small phones and inside the immersive view', async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 360, height: 800 });
  await studio(page);
  await chooseAmbience(page, 'contemporary');
  await page.locator('.studio-ambience summary').click();
  for (const [width, height] of [[320, 700], [360, 800], [390, 800]]) {
    await page.setViewportSize({ width, height });
    await expect(page.locator('[data-ambience="professional"]')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const menuBounds = await page.locator('.ambience-options').boundingBox();
    expect(menuBounds.y + menuBounds.height).toBeLessThanOrEqual(height);
  }
  // The last choice must be reachable in the short preview, not clipped by it.
  await chooseAmbience(page, 'professional');
  const enlarge = page.locator('#studio-fullscreen');
  await enlarge.click();
  await expect(page.locator('#studio-dialog .studio-ambience')).toBeVisible();
  await chooseAmbience(page, 'warm');
  await expect(page.locator('#studio-canvas')).toHaveCSS('touch-action', 'none');
  expect(await page.locator('#studio-dialog').evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.locator('#studio-dialog')).not.toBeVisible();
  await expect(enlarge).toBeFocused();
  await expect(page.locator('.studio-preview-column .studio-ambience')).toHaveCount(1);
  await expect(page.locator('[data-ambience="warm"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#studio-canvas')).toHaveCSS('touch-action', 'pan-y');
});

test('material inspiration becomes an editable configuration and a professional dossier with variants', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto('./matieres.html');
  await page.getByRole('link', { name: 'Explorer le noyer', exact: false }).click();
  await expect(page.locator('#studio-stage')).toHaveClass(/ready/);
  await expect(page.locator('#summary-title')).toContainText('Noyer');
  await page.locator('[data-shape="quarter"]').click();
  await page.locator('[data-direction="left"]').click();
  await tab(page, 'material');
  await page.locator('[data-structure="wood"]').click();
  await page.locator('#custom-color').fill('#785abb');
  await page.locator('#finish-options [data-finish="polished"]').click();
  await tab(page, 'details');
  await page.locator('[data-railing="glass"]').click();
  await page.locator('#risers').check();
  await page.locator('#led').check();
  await tab(page, 'project');
  await page.locator('#height-number').fill('320');
  await page.locator('#height-number').press('Tab');
  await page.locator('#width-number').fill('110');
  await page.locator('#width-number').press('Tab');
  await page.locator('#steps').focus();
  await page.keyboard.press('End');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  await page.locator('[data-audience="professional"]').click();
  const expected = { shape: 'quarter', structureMaterial: 'wood', structureColor: '#785abb', metalFinish: 'polished', treadMaterial: 'walnut', railing: 'glass', risers: '1', led: '1', direction: 'left', height: '320', width: '110', steps: '18', ambience: 'studio', audience: 'professional' };
  await page.locator('#quote-link').click();
  await expect(page).toHaveURL(/\/sbm\/devis\.html\?/);
  expect(Object.fromEntries(new URL(page.url()).searchParams)).toEqual(expected);
  await expect(page.locator('[name="audience"][value="professional"]')).toBeChecked();
  await expect(page.locator('#configuration-summary')).toContainText('Quart tournant');
  await expect(page.locator('#configuration-summary')).toContainText('320 cm');
  await expect(page.locator('#configuration-summary')).toContainText('Intention LED chaud');
  await validContact(page);
  await page.locator('#company').fill('Atelier Test');
  await page.locator('#email').fill('alex@example.test');
  await page.locator('#city').fill('Luriecq 42380');
  await page.locator('#budget').fill('15000');
  await page.locator('[name="compare-material"][value="oak"]').check();
  await page.locator('[name="compare-material"][value="steel"]').check();
  await page.locator('#message').fill('Accueil professionnel, accès à étudier. <b>Une idée personnelle</b>');
  const urlBeforeContact = page.url();
  await page.getByRole('button', { name: 'Préparer ma demande', exact: false }).click();
  await expect(page.locator('#quote-result')).toBeVisible();
  await expect(page.locator('#quote-status')).toContainText('Il n’a pas été envoyé');
  await expect(page.locator('#quote-print')).toContainText('Atelier Test');
  await expect(page.locator('#quote-print')).toContainText('Chêne · Noyer · Acier');
  await expect(page.locator('#quote-print')).toContainText('<b>Une idée personnelle</b>');
  await expect(page.locator('#quote-print b')).toHaveCount(0);
  expect(page.url()).toBe(urlBeforeContact);
  const resumeLink = new URL(await page.locator('.brief-config-link').getAttribute('href'));
  expect(Object.fromEntries(resumeLink.searchParams)).toEqual(expected);
  expect(resumeLink.search).not.toMatch(/Alex|Martin|example|Atelier|Luriecq|15000/);
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#download-brief').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('projet-escalier-sbm-alex-martin.txt');
  const chunks = [];
  for await (const chunk of await download.createReadStream()) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString('utf8');
  for (const detail of ['Non envoyé à l’atelier', 'Professionnel', 'Atelier Test', 'Chêne · Noyer · Acier', 'Quart tournant', 'Noyer', '320 cm', '110 cm', '18 (intention visuelle)', 'Panneaux de verre', 'Intention LED chaud', '#785abb', 'aucun prix automatique']) expect(text).toContain(detail);
  await page.locator('#edit-configuration').click();
  await expect(page.locator('#studio-stage')).toHaveClass(/ready/);
  expect(Object.fromEntries(new URL(page.url()).searchParams)).toEqual(expected);
  await expect(page.locator('[data-shape="quarter"]')).toHaveAttribute('aria-pressed', 'true');
});

test('individual and professional validation protects the dossier and invalidates stale exports', async ({ page }) => {
  await page.goto('./devis.html');
  await expect(page.locator('#quote-fields')).toBeEnabled();
  await page.getByRole('button', { name: 'Préparer ma demande', exact: false }).click();
  await expect(page.locator('#quote-result')).toBeHidden();
  await validContact(page);
  await page.locator('#phone').fill('pas un numéro');
  await page.getByRole('button', { name: 'Préparer ma demande', exact: false }).click();
  expect(await page.locator('#phone').evaluate(input => input.validity.valid)).toBe(false);
  await expect(page.locator('#quote-result')).toBeHidden();
  await page.locator('#phone').fill('+33 6 12 34 56 78');
  await page.locator('[name="audience"][value="professional"]').check();
  await expect(page.locator('#company')).toBeVisible();
  await page.getByRole('button', { name: 'Préparer ma demande', exact: false }).click();
  expect(await page.locator('#company').evaluate(input => input.validity.valueMissing)).toBe(true);
  await page.locator('#company').fill('   ');
  await page.getByRole('button', { name: 'Préparer ma demande', exact: false }).click();
  expect(await page.locator('#company').evaluate(input => input.validity.customError)).toBe(true);
  await page.locator('[name="audience"][value="individual"]').check();
  await expect(page.locator('#company-field')).toBeHidden();
  await page.getByRole('button', { name: 'Préparer ma demande', exact: false }).click();
  await expect(page.locator('#quote-result')).toBeVisible();
  await expect(page.locator('#quote-print')).toContainText('Particulier');
  await expect(page.locator('#quote-print')).not.toContainText('Entreprise / agence');
  await expect(page.locator('#download-brief')).toBeEnabled();
  await page.locator('#message').fill('Une nouvelle contrainte à prendre en compte.');
  await expect(page.locator('#download-brief')).toBeDisabled();
  await expect(page.locator('#print-brief')).toBeDisabled();
  await expect(page.locator('#copy-brief')).toBeDisabled();
  await expect(page.locator('#quote-status')).toContainText('Le formulaire a changé');
  await page.getByRole('button', { name: 'Préparer ma demande', exact: false }).click();
  await expect(page.locator('#quote-print')).toContainText('Une nouvelle contrainte');
  await expect(page.locator('#download-brief')).toBeEnabled();
});

test('keyboard tabs, canvas controls and reduced motion remain usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await studio(page);
  await expect(page.locator('#studio-rotate')).toBeDisabled();
  await expect(page.locator('#studio-rotate')).toHaveAttribute('aria-pressed', 'false');
  await page.locator('#tab-shape').focus();
  for (const [key, tabId] of [['ArrowRight', 'material'], ['ArrowRight', 'details'], ['End', 'project'], ['ArrowRight', 'shape'], ['ArrowLeft', 'project'], ['Home', 'shape']]) {
    await page.keyboard.press(key);
    await expect(page.locator(`#tab-${tabId}`)).toBeFocused();
    await expect(page.locator(`#tab-${tabId}`)).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator(`#panel-${tabId}`)).toBeVisible();
    await expect(page.locator('[role="tab"][tabindex="0"]')).toHaveCount(1);
    await expect(page.locator('[role="tabpanel"]:visible')).toHaveCount(1);
  }
  await page.locator('#studio-canvas').focus();
  await renderedChange(page, () => page.keyboard.press('ArrowRight'));
  await renderedChange(page, () => page.keyboard.press('+'));
  await page.keyboard.press('Home');
  await expect(page.locator('[data-view="perspective"]')).toHaveAttribute('aria-pressed', 'true');
  await tab(page, 'material');
  await page.locator('[data-tread="walnut"]').click();
  await expect(page.locator('#summary-title')).toContainText('Noyer');
});

test('WebGL unavailable keeps all configuration choices and the quote flow working', async ({ page }) => {
  await disableWebGL(page);
  await page.goto('./configurateur.html?shape=straight');
  await expect(page.locator('#studio-stage')).toHaveClass(/failed/);
  const image = page.locator('.studio-fallback');
  await expect(image).toBeVisible();
  await expect.poll(() => image.evaluate(node => node.complete && node.naturalWidth > 0)).toBe(true);
  await expect(page.locator('#studio-canvas')).not.toBeVisible();
  await expect(page.locator('#studio-fullscreen')).toBeDisabled();
  await page.locator('[data-shape="half"]').click();
  await expect.poll(() => image.evaluate(node => node.complete && node.naturalWidth > 0 && node.src.includes('half.jpg'))).toBe(true);
  await tab(page, 'material');
  await page.locator('[data-tread="stone"]').click();
  await page.locator('[data-color="#a75d43"]').click();
  await chooseAmbience(page, 'professional');
  await expect(page.locator('#ambience-note')).toContainText(/non simulé/i);
  await expect(page.locator('#material-label')).toContainText('MATIÈRES NON SIMULÉES');
  await page.locator('#quote-link').click();
  await expect(page.locator('#configuration-summary')).toContainText('Demi-tournant');
  await expect(page.locator('#configuration-summary')).toContainText('Pierre minérale');
  await expect(page.locator('#configuration-summary')).toContainText('Espace professionnel');
  await validContact(page);
  await page.getByRole('button', { name: 'Préparer ma demande', exact: false }).click();
  await expect(page.locator('#quote-result')).toBeVisible();
});

test('hostile and out-of-range configuration URLs are normalised without executing markup', async ({ page }) => {
  await page.addInitScript(() => { window.injectedByQuery = false; });
  const hostile = new URLSearchParams({ shape: '<img src=x onerror="window.injectedByQuery=true">', treadMaterial: '__proto__', structureColor: 'javascript:alert(1)', metalFinish: 'unknown', railing: '<svg onload=alert(1)>', height: '99999', width: '-12', steps: 'NaN', direction: 'backward', led: 'false', risers: 'true', ambience: '<img src=x onerror="window.injectedByQuery=true">', audience: 'administrator', fullname: 'Private name', email: 'private@example.test' });
  await studio(page, `?${hostile}`);
  await expect(page.locator('#summary-title')).toHaveText('Hélicoïdal. Chêne naturel.');
  await tab(page, 'project');
  await expect(page.locator('#height-number')).toHaveValue('360');
  await expect(page.locator('#width-number')).toHaveValue('70');
  await expect(page.locator('#steps')).toHaveValue('16');
  expect(await page.evaluate(() => window.injectedByQuery)).toBe(false);
  const link = new URL(await page.locator('#quote-link').getAttribute('href'));
  expect(link.searchParams.get('structureColor')).toBe('#383d3a');
  expect(link.searchParams.get('risers')).toBe('1');
  expect(link.searchParams.get('led')).toBe('0');
  expect(link.searchParams.get('ambience')).toBe('studio');
  expect(link.searchParams.get('audience')).toBe('individual');
  expect(link.searchParams.has('fullname')).toBe(false);
  expect(link.searchParams.has('email')).toBe(false);
  await page.locator('#quote-link').click();
  await expect(page.locator('#configuration-summary')).not.toContainText('javascript:');
  await expect(page.locator('#configuration-summary')).not.toContainText('<img');
  await expect(page.locator('#fullname')).toHaveValue('');
});

test('new pages fit small phones and mobile navigation preserves access to the studio', async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 360, height: 800 });
  for (const path of ['particuliers.html', 'professionnels.html', 'matieres.html', 'configurateur.html', 'devis.html']) {
    await page.goto(`./${path}`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    if (path === 'configurateur.html') await expect(page.locator('#studio-stage')).toHaveClass(/ready/);
    for (const width of [360, 390]) {
      await page.setViewportSize({ width, height: 800 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${path} at ${width}px`).toBe(true);
    }
  }
  const menu = page.locator('.menu-toggle');
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toBeFocused();
  await menu.click();
  await page.locator('#main-nav a[href="./configurateur.html"]').click();
  await expect(page).toHaveURL(/\/sbm\/configurateur\.html/);
  await expect(page.locator('#studio-stage')).toHaveClass(/ready/);
  await expect(page.locator('.menu-toggle')).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#studio-canvas')).toHaveCSS('touch-action', 'pan-y');
  const enlarge = page.locator('#studio-fullscreen');
  await enlarge.scrollIntoViewIfNeeded();
  await enlarge.click();
  await expect(page.locator('#studio-dialog')).toBeVisible();
  await expect(page.locator('#studio-dialog #studio-canvas')).toBeVisible();
  await expect(page.locator('#studio-canvas')).toHaveCSS('touch-action', 'none');
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  await page.keyboard.press('Escape');
  await expect(page.locator('#studio-dialog')).not.toBeVisible();
  await expect(enlarge).toBeFocused();
  await expect(page.locator('.studio-preview-column #studio-stage')).toHaveCount(1);
  await expect(page.locator('#studio-canvas')).toHaveCSS('touch-action', 'pan-y');
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
});
