import { test as base, expect } from '@playwright/test';

// Exercise the deployed /sbm/ build. Catalogue previews and local dossiers must
// remain usable without remote services or silently transmitting personal data.
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
      if (request.method() !== 'GET') errors.push(`Unexpected submission: ${request.method()} ${request.url()}`);
      return route.continue();
    });
    await use(page);
    expect(errors, 'No browser errors, missing assets or hidden submissions').toEqual([]);
  },
});

const modelIDs = [
  'elementaire', 'origine', 'harmonie', 'tricolore', 'cottage', 'ambition',
  'boreal', 'escale', 'duplex', 'style', 'austral', 'urbain', 'chic',
  'fabrique', 'dynamique', 'rythmique', 'sillage', 'transat', 'vogue',
  'voile', 'nautique', 'cap', 'zephyr', 'sonora', 'levant', 'lips',
  'mistral', 'kit-carre', 'circulaire', 'outdoor',
];
const detailOptions = {
  balusterStyle: ['plain', ...Array.from({ length: 7 }, (_, i) => `wood-t${i}`), ...Array.from({ length: 6 }, (_, i) => `metal-m${i}`)],
  postStyle: ['standard', 'marine-wood', 'marine-inox', 'marine-metal', 'marine-crook', 'cast-iron'],
  slabTrim: ['none', 'wood', 'plywood', 'painted', 'metal', 'inox'],
};

async function studio(page, search = '') {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`./configurateur.html${search}`);
  await expect(page.locator('#studio-stage')).toHaveClass(/ready/);
  await expect(page.locator('#studio-canvas')).toBeVisible();
}

async function revealControl(page, selector, touch = false) {
  const control = page.locator(selector);
  const location = await control.evaluate(element => {
    const details = [];
    for (let parent = element.parentElement; parent; parent = parent.parentElement) {
      if (parent.tagName === 'DETAILS') details.unshift(parent.id);
    }
    return { panel: element.closest('[role="tabpanel"]')?.id, details };
  });
  if (location.panel) {
    const tab = page.locator(`[data-tab="${location.panel.replace('panel-', '')}"]`);
    if (touch) await tab.tap();
    else await tab.click();
  }
  for (const id of location.details) {
    const details = page.locator(`#${id}`);
    if (!(await details.evaluate(element => element.open))) {
      if (touch) await details.locator(':scope > summary').tap();
      else await details.locator(':scope > summary').click();
    }
  }
  await expect(control).toBeVisible();
  return control;
}

async function select(page, selector, value) {
  const control = await revealControl(page, selector);
  await control.selectOption(value);
  await expect(control).toHaveValue(value);
}

async function number(page, selector, value) {
  const control = await revealControl(page, selector);
  await control.fill(String(value));
  await control.press('Tab');
  await expect(control).toHaveValue(String(value));
}

async function renderedChange(page, action) {
  const canvas = page.locator('#studio-canvas');
  const before = await canvas.screenshot();
  await action();
  await expect.poll(async () => !(await canvas.screenshot()).equals(before), {
    message: 'The selected catalogue option must change the rendered staircase',
  }).toBe(true);
}

test('all thirty catalogue models round-trip and enforce documented material and option restrictions', async () => {
  const {
    MODELS, configurationForModel, normalizeConfig, encodeConfig, decodeConfig, availableOptions,
  } = await import('../catalog.js');
  const THREE = await import('three');
  const { buildCatalogueGeometry, drawingMetrics } = await import('../catalogue-geometry.js');
  expect(MODELS.filter(model => model.id !== 'custom').map(model => model.id).sort())
    .toEqual([...modelIDs].sort());

  const narrowSpiral = normalizeConfig({ model: 'custom', shape: 'spiral', width: 125, diameter: 180 });
  expect(drawingMetrics(narrowSpiral)).toMatchObject({ width: 81.5, widthLimited: true });
  expect(drawingMetrics({ ...narrowSpiral, diameter: 280 }))
    .toMatchObject({ width: 125, widthLimited: false });

  function expectFiniteGeometry(configuration, label) {
    const group = new THREE.Group();
    const material = new THREE.MeshStandardMaterial();
    const materials = Object.fromEntries(
      ['structure', 'tread', 'rail', 'handrail', 'post', 'glass', 'inox', 'led', 'wall']
        .map(key => [key, material]),
    );
    buildCatalogueGeometry({
      THREE, config: configuration, materials,
      addMesh(geometry, surface) {
        const mesh = new THREE.Mesh(geometry, surface);
        group.add(mesh);
        return mesh;
      },
    });
    expect(group.children.length, `${label} must have a complete staircase`).toBeGreaterThan(20);
    for (const mesh of group.children) {
      const positions = mesh.geometry.getAttribute('position');
      expect(Array.from(positions.array).every(Number.isFinite), `${label} finite vertices`).toBe(true);
    }
    const bounds = new THREE.Box3().setFromObject(group);
    expect([
      bounds.min.x, bounds.min.y, bounds.min.z,
      bounds.max.x, bounds.max.y, bounds.max.z,
    ].every(Number.isFinite), `${label} finite world bounds`).toBe(true);
    expect(bounds.max.y, `${label} nonempty vertical model`).toBeGreaterThan(2);
    new Set(group.children.map(mesh => mesh.geometry)).forEach(geometry => geometry.dispose());
    material.dispose();
  }

  for (const id of modelIDs) {
    const configuration = configurationForModel(id, { height: 310, width: 105, ambience: 'warm' });
    expect(configuration.model, id).toBe(id);
    expect(normalizeConfig(configuration), `${id} must be stable`).toEqual(configuration);
    expect(decodeConfig(encodeConfig(configuration)), `${id} shared link`).toEqual(configuration);
    expect(Number.isFinite(configuration.height), `${id} height`).toBe(true);
    expect(Number.isFinite(configuration.width), `${id} width`).toBe(true);

    // Construct all thirty real meshes without thirty costly WebGL captures.
    // Rendering checks below then cover representative silhouettes and details.
    expectFiniteGeometry(configuration, id);
  }

  // Every offered profile must survive sharing and produce usable real meshes,
  // including the optional details that are omitted from default shared links.
  for (const [field, values] of Object.entries(detailOptions)) {
    expect(availableOptions({ model: 'custom' })[field].map(option => option.id)).toEqual(values);
    for (const value of values) {
      const configuration = normalizeConfig({
        model: 'custom', shape: 'straight', structureType: 'limon',
        structureMaterial: 'beech', treadMaterial: 'beech', railing: 'vertical',
        railMaterial: field === 'balusterStyle' && value.startsWith('metal-') ? 'metal' : 'wood',
        landingGuard: 'glass', [field]: value,
      });
      expect(configuration[field], `${field} ${value} must remain selectable`).toBe(value);
      expect(decodeConfig(encodeConfig(configuration)), `${field} ${value} shared link`).toEqual(configuration);
      expectFiniteGeometry(configuration, `${field} ${value}`);
    }
    for (const hostile of ['__proto__', 'constructor', '<img src=x onerror=alert(1)>', 'javascript:alert(1)']) {
      expect(decodeConfig(new URLSearchParams({ [field]: hostile }))[field], `${field} must be allowlisted`)
        .toBe(values[0]);
    }
  }

  // These checks come from the actual product restrictions and 2026 appendix,
  // rather than accepting whatever happens to appear in a preset.
  const elementaire = normalizeConfig({
    ...configurationForModel('elementaire'),
    treadMaterial: 'stone', structureMaterial: 'steel', landingGuard: 'laser-wave',
  });
  expect(elementaire.treadMaterial).toBe('hevea');
  expect(elementaire.structureMaterial).toBe('hevea');
  expect(elementaire.landingGuard).toBe('vertical');
  expect(normalizeConfig({ ...configurationForModel('duplex'), risers: false }).risers).toBe(true);
  expect(normalizeConfig({ ...configurationForModel('style'), risers: false }).risers).toBe(true);

  const outdoor = normalizeConfig({
    ...configurationForModel('outdoor'),
    treadMaterial: 'walnut', structureMaterial: 'aluminium', woodFinish: 'wenge',
  });
  expect(outdoor.treadMaterial).toBe('iroko');
  expect(outdoor.structureMaterial).toBe('iroko');
  expect(outdoor.woodFinish).toBe('natural');
  expect(normalizeConfig({ ...configurationForModel('origine'), shape: 'half', packDeco: true }).packDeco).toBe(false);
  expect(normalizeConfig({ ...configurationForModel('sonora'), startStep: 'rounded' }).startStep).toBe('straight');
  expect(normalizeConfig({ ...configurationForModel('zephyr'), startStep: 'projecting' }).startStep).toBe('straight');

  const custom = normalizeConfig({
    model: 'custom', structureMaterial: 'walnut', treadMaterial: 'stone', railing: 'none',
  });
  expect(custom).toMatchObject({ model: 'custom', structureMaterial: 'walnut', treadMaterial: 'stone', railing: 'none' });
});

test('the collection filters all thirty models and opens the selected real preset in the studio', async ({ page }) => {
  await page.goto('./collection.html');
  await expect(page.locator('.riaux-model-card')).toHaveCount(30);
  await expect.poll(() => page.locator('#riaux-hero-drawing img')
    .evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
  const photos = page.locator('.riaux-model-photo');
  await expect(photos).toHaveCount(30);
  // Decode every lazy photo without scrolling the collection or opening 30 tabs.
  const decodedPhotos = await photos.evaluateAll(elements => Promise.all(elements.map(async element => {
    const image = new Image();
    image.src = element.currentSrc || element.src;
    try { await image.decode(); } catch { /* Report the failed URL in the assertion. */ }
    return { url: image.src, width: image.naturalWidth };
  })));
  for (const photo of decodedPhotos) expect(photo.width, photo.url).toBeGreaterThan(0);
  await page.locator('[data-family-filter="metal"]').click();
  await expect(page.locator('.riaux-model-card:visible')).toHaveCount(5);
  await page.locator('[data-family-filter="all"]').click();
  await page.locator('#riaux-search').fill('Mistral');
  await expect(page.locator('.riaux-model-card:visible')).toHaveCount(1);
  await page.locator('.riaux-model-card[data-model="mistral"] .riaux-model-link').click();
  await expect(page.locator('#studio-stage')).toHaveClass(/ready/);
  await expect(page.locator('#model-select')).toHaveValue('mistral');
  expect(new URL(page.url()).searchParams.get('model')).toBe('mistral');
  await expect(page.locator('#model-description')).toContainText(/métal|crémaillère/i);
  await expect(page.locator('#model-select option')).toHaveCount(31);
});

test('wood structures and quarter-turn placement change the actual 3D silhouette', async ({ page }) => {
  test.setTimeout(90_000);
  await studio(page, '?shape=straight&structureMaterial=beech&treadMaterial=beech&structureType=limon&railing=horizontal');
  await renderedChange(page, () => select(page, '#structure-type', 'cut'));
  await renderedChange(page, () => select(page, '#structure-type', 'double'));
  await renderedChange(page, () => select(page, '#structure-type', 'central-wood'));
  await page.locator('[data-tab="shape"]').click();
  await page.locator('[data-shape="quarter"]').click();
  await select(page, '#quarter-position', 'low');
  await renderedChange(page, () => select(page, '#quarter-position', 'high'));
  expect(new URL(page.url()).searchParams.get('quarterPosition')).toBe('high');
  await renderedChange(page, () => number(page, '#going-number', 34));
  expect(new URL(page.url()).searchParams.get('going')).toBe('34');

  await page.goto('./configurateur.html?model=custom&shape=straight&structureMaterial=beech&treadMaterial=beech&structureType=limon&railing=vertical&railMaterial=wood&landingGuard=glass&balusterStyle=wood-t0');
  await expect(page.locator('#studio-stage')).toHaveClass(/ready/);
  await revealControl(page, '#baluster-style');
  await renderedChange(page, () => select(page, '#baluster-style', 'wood-t2'));
  await renderedChange(page, () => select(page, '#post-style', 'marine-wood'));
  await renderedChange(page, () => select(page, '#slab-trim', 'wood'));
  expect(Object.fromEntries(new URL(page.url()).searchParams)).toMatchObject({
    balusterStyle: 'wood-t2', postStyle: 'marine-wood', slabTrim: 'wood',
  });
});

test('square and circular helices, tread sizes and laser infills are visible in the 3D model', async ({ page }) => {
  test.setTimeout(90_000);
  await studio(page, '?model=circulaire');
  await renderedChange(page, () => number(page, '#diameter-number', 230));
  await renderedChange(page, () => page.locator('#model-select').selectOption('kit-carre'));
  expect(new URL(page.url()).searchParams.get('shape')).toBe('spiral-square');
  await renderedChange(page, () => number(page, '#tread-thickness-number', 65));

  await page.goto('./configurateur.html?model=custom&shape=straight&structureType=metal-limon&landingGuard=glass');
  await expect(page.locator('#studio-stage')).toHaveClass(/ready/);
  await renderedChange(page, () => select(page, '#landing-guard', 'laser-nature'));
  await renderedChange(page, () => select(page, '#landing-guard', 'laser-wave'));
  expect(new URL(page.url()).searchParams.get('landingGuard')).toBe('laser-wave');
});

test('a catalogue model, materials, dimensions and accessories survive the quote and downloaded dossier', async ({ page }) => {
  test.setTimeout(90_000);
  await studio(page, '?model=origine&audience=professional');
  await page.locator('[data-tab="material"]').click();
  await page.locator('[data-structure="beech"]').click();
  await page.locator('[data-tread="oak"]').click();
  await select(page, '#wood-finish', 'blanched');
  await select(page, '#rail-material', 'wood');
  await select(page, '#baluster-style', 'wood-t2');
  await select(page, '#post-style', 'marine-wood');
  await select(page, '#slab-trim', 'wood');
  await select(page, '#start-step', 'projecting');
  await select(page, '#landing-guard', 'laser-nature');
  await number(page, '#height-number', 310);
  await number(page, '#width-number', 105);
  await number(page, '#going-number', 28);
  await number(page, '#tread-thickness-number', 45);
  const expected = {
    model: 'origine', structureMaterial: 'beech', treadMaterial: 'oak',
    woodFinish: 'blanched', startStep: 'projecting', landingGuard: 'laser-nature',
    railing: 'vertical', railMaterial: 'wood', balusterStyle: 'wood-t2',
    postStyle: 'marine-wood', slabTrim: 'wood',
    height: '310', width: '105', going: '28', treadThickness: '45',
    audience: 'professional',
  };
  await page.locator('#quote-link').click();
  expect(Object.fromEntries(new URL(page.url()).searchParams)).toMatchObject(expected);
  await expect(page.locator('#quote-model-name')).toHaveText('Origine');
  await expect(page.locator('#configuration-summary')).toContainText('310 cm');
  await expect(page.locator('#configuration-summary')).toContainText('105 cm');
  await expect(page.locator('#configuration-summary')).toContainText('45 mm');
  await expect(page.locator('#configuration-summary')).toContainText(/blanchi/i);
  for (const label of ['T2', /marine.*bois/i, /habillage.*bois|bois.*habillage/i]) {
    await expect(page.locator('#configuration-summary')).toContainText(label);
  }
  await expect(page.locator('[name="compare-material"][value="stone"]')).toHaveCount(0);
  await expect(page.locator('[name="compare-material"][value="walnut"]')).toHaveCount(0);

  await page.locator('#fullname').fill('Camille Exemple');
  await page.locator('#phone').fill('06 12 34 56 78');
  await page.locator('#company').fill('Entreprise Exemple');
  await page.locator('#project-type').selectOption('renovation');
  await page.locator('#timeline').selectOption('3to6');
  await page.locator('.quote-space-details > summary').click();
  await page.locator('#opening-length').fill('340');
  await page.locator('#opening-width').fill('130');
  await page.locator('#access-notes').fill('Accès par cour intérieure, relevé à prévoir.');
  const safeURL = page.url();
  await page.getByRole('button', { name: 'Préparer ma demande', exact: false }).click();
  await expect(page.locator('#quote-result')).toBeVisible();
  await expect(page.locator('#quote-print')).toContainText('Origine');
  await expect(page.locator('#quote-print')).toContainText('340');
  await expect(page.locator('#quote-print')).toContainText('Accès par cour intérieure');
  expect(page.url()).toBe(safeURL);
  expect(page.url()).not.toMatch(/Camille|Entreprise|intérieure/);
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#download-brief').click();
  const download = await downloadPromise;
  const chunks = [];
  for await (const chunk of await download.createReadStream()) chunks.push(chunk);
  const dossier = Buffer.concat(chunks).toString('utf8');
  for (const detail of ['Origine', '310 cm', '105 cm', '45 mm', '340', 'Accès par cour intérieure']) {
    expect(dossier).toContain(detail);
  }
  for (const detail of ['T2', /marine.*bois/i, /habillage.*bois|bois.*habillage/i]) {
    expect(dossier).toMatch(detail instanceof RegExp ? detail : new RegExp(detail));
  }
  expect(dossier).toMatch(/Non envoyé|n.a pas été envoyé/i);
  await page.locator('#edit-configuration').click();
  await expect(page.locator('#studio-stage')).toHaveClass(/ready/);
  expect(Object.fromEntries(new URL(page.url()).searchParams)).toMatchObject(expected);
  await expect(page.locator('#model-select')).toHaveValue('origine');
  await expect(page.locator('#baluster-style')).toHaveValue('wood-t2');
  await expect(page.locator('#post-style')).toHaveValue('marine-wood');
  await expect(page.locator('#slab-trim')).toHaveValue('wood');
});

test.describe('small touch screens', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('the collection, model choices and advanced controls fit phones and keep navigation usable', async ({ page }) => {
    test.setTimeout(90_000);
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('./collection.html');
      await expect(page.locator('.riaux-model-card')).toHaveCount(30);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.locator('#riaux-search').fill('Élément');
      await page.locator('.riaux-model-card[data-model="elementaire"] .riaux-model-link').tap();
      await expect(page.locator('#studio-stage')).toHaveClass(/ready/);
      await expect(page.locator('#model-select')).toHaveValue('elementaire');
      const model = page.locator('#model-select');
      expect(await model.evaluate(element => element.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const going = await revealControl(page, '#going-number', true);
      await going.fill('29');
      await going.press('Tab');
      expect(new URL(page.url()).searchParams.get('going')).toBe('29');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.locator('.menu-toggle').tap();
      const project = page.locator('#trigger-project-navigation');
      await project.tap();
      await project.evaluate(element => element.blur());
      await page.waitForTimeout(350);
      await expect(project).toHaveAttribute('aria-expanded', 'true');
      await page.locator('.menu-toggle').tap();
      await expect(page.locator('.menu-toggle')).toHaveAttribute('aria-expanded', 'false');
    }
  });
});

test('WebGL unavailable retains catalogue choices, safe sharing and the complete quote path', async ({ page }) => {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return this.id === 'studio-canvas' && String(type).startsWith('webgl')
        ? null : getContext.call(this, type, ...args);
    };
  });
  await page.goto('./configurateur.html?model=kit-carre');
  await expect(page.locator('#studio-stage')).toHaveClass(/failed/);
  const fallback = page.locator('.studio-fallback');
  await expect(fallback).toBeVisible();
  await expect.poll(() => fallback.evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
  await page.locator('#model-select').selectOption('outdoor');
  await expect(page.locator('#model-select')).toHaveValue('outdoor');
  await number(page, '#height-number', 220);
  await page.locator('#quote-link').click();
  await expect(page.locator('#configuration-summary')).toContainText(/iroko/i);
  await expect(page.locator('#configuration-summary')).toContainText('220 cm');
  await expect(page.locator('#quote-model-name')).toContainText(/extérieur|outdoor/i);
  await page.locator('#fullname').fill('Lou Exemple');
  await page.locator('#phone').fill('06 12 34 56 78');
  await page.locator('#project-type').selectOption('renovation');
  await page.locator('#timeline').selectOption('3to6');
  await page.getByRole('button', { name: 'Préparer ma demande', exact: false }).click();
  await expect(page.locator('#quote-result')).toBeVisible();
});
