import * as catalog from './catalog.js';
import { arrowIcon } from './catalogue-icons.js';

const models = catalog.MODELS.filter(model => model.id !== 'custom');
const grid = document.querySelector('#riaux-model-grid');
const search = document.querySelector('#riaux-search');
const collection = document.querySelector('#riaux-collection');
const status = document.querySelector('#riaux-results');
const buttons = [...document.querySelectorAll('[data-family-filter]')];
const familyLabels = { wood: 'Bois', mixed: 'Bois & métal', metal: 'Structure métal', enclosed: 'Encloisonné', specific: 'Hélicoïdal', outdoor: 'Extérieur' };
let family = 'all';
const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const element = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
};
const label = (options, id) => options?.find(option => option.id === id)?.label ?? id;
const points = values => values.map(point => point.map(value => value.toFixed(1)).join(',')).join(' ');

// Original isometric drawings generated locally, rather than photographs of
// projects. The selected model's structure and railings inform its silhouette.
function silhouette(model, hero = false) {
  const c = model.defaults;
  const id = `drawing-${hero ? 'hero-' : ''}${model.id}`;
  const metal = model.family === 'metal' || model.family === 'specific';
  const structure = c.structureColor || (metal ? '#293b35' : '#bc9366');
  const treads = c.treadMaterial === 'beech' ? '#d8b681' : c.treadMaterial === 'hevea' ? '#e0c69e' : c.treadMaterial === 'iroko' ? '#a77948' : '#c6a06f';
  const supports = c.structureType || 'limon';
  const iso = ([x, y, z]) => [182 + (x - z) * 35, 197 + (x + z) * 13 - y * 36];
  let drawing = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${treads}"/><stop offset="1" stop-color="#efdec2"/></linearGradient></defs><ellipse cx="182" cy="215" rx="119" ry="16" fill="currentColor" opacity=".055"/>`;
  const polygon = (vertices, fill, opacity = 1) => `<polygon points="${points(vertices.map(iso))}" fill="${fill}" opacity="${opacity}" stroke="#20382b" stroke-opacity=".1" stroke-width=".45" stroke-linejoin="round"/>`;
  const line = (vertices, stroke, width) => `<polyline points="${points(vertices.map(iso))}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const stepCenters = [];
  const spiral = c.shape === 'spiral' || c.shape === 'spiral-square' || model.family === 'specific';
  for (let i = 0; i < 12; i += 1) {
    const y = .22 + i * .235;
    let x = -.35, z = i * .29 - 1.65, angle = 0;
    if (spiral) {
      angle = i * .39 - 1.15;
      x = Math.cos(angle) * .82;
      z = Math.sin(angle) * .82;
    } else if (c.shape === 'quarter' && i >= 5) {
      x += (i - 4) * .29;
      z = -.49;
      angle = -Math.PI / 2;
    } else if (c.shape === 'half') {
      if (i >= 5 && i <= 7) { x += (i - 4) * .4; z = -.49; angle = -Math.PI / 2; }
      if (i > 7) { x += 1.4; z = -.49 - (i - 7) * .29; angle = Math.PI; }
    }
    const corner = (dx, dz, dy = 0) => [x + dx * Math.cos(angle) - dz * Math.sin(angle), y + dy, z + dx * Math.sin(angle) + dz * Math.cos(angle)];
    const vertices = [corner(-.57, -.16), corner(.57, -.16), corner(.57, .16), corner(-.57, .16)];
    drawing += polygon([vertices[0], vertices[1], corner(.57, -.16, -.07), corner(-.57, -.16, -.07)], '#aa8054');
    drawing += polygon([vertices[1], vertices[2], corner(.57, .16, -.07), corner(.57, -.16, -.07)], '#b99161');
    if (c.risers) drawing += polygon([vertices[0], vertices[1], corner(.57, -.16, -.23), corner(-.57, -.16, -.23)], c.structureFinish === 'painted' ? structure : '#c6ae8b');
    drawing += polygon(vertices, `url(#${id})`);
    stepCenters.push({ x, y, z, angle, corner });
  }
  const central = /central|double|post/.test(supports) || spiral;
  if (spiral) drawing += line([[0, .05, 0], [0, 3.05, 0]], metal ? '#63726b' : structure, 8);
  else {
    const offsets = central ? (/double/.test(supports) ? [-.19, .19] : [0]) : [-.54, .54];
    for (const offset of offsets) {
      const path = stepCenters.map(step => step.corner(offset, 0, -.19));
      drawing += line(path, structure, /cut|offset|double/.test(supports) ? 5 : 10);
      if (/offset|cut|double/.test(supports)) {
        for (const step of stepCenters) drawing += line([step.corner(offset, -.1, -.19), step.corner(offset, -.1, -.07), step.corner(offset, .12, -.07)], structure, 4);
      }
    }
  }
  const rail = c.railMaterial === 'wood' ? '#a58158' : c.railMaterial === 'aluminium' || c.railMaterial === 'inox' ? '#8c9692' : c.postColor || structure;
  const handrail = /wood/.test(c.handrail) ? '#b48e5f' : rail;
  if (model.family === 'enclosed') {
    for (const offset of [-.7, .7]) drawing += line(stepCenters.map(step => step.corner(offset, 0, .72)), '#b28e65', 3);
  } else {
    drawing += line(stepCenters.map(step => step.corner(.58, 0, .86)), handrail, /rect|flat/.test(c.handrail) ? 4 : 3);
    if (c.railing === 'vertical') {
      for (const step of stepCenters) drawing += line([step.corner(.58, 0, 0), step.corner(.58, 0, .84)], rail, c.railPattern === 'rings' ? 2.4 : 1.5);
    } else {
      for (const height of c.railPattern === 'one-three-one' ? [.18, .44, .5, .56, .76] : [.21, .43, .65]) drawing += line(stepCenters.map(step => step.corner(.58, 0, height)), rail, 1.3);
      for (const i of [0, 5, 11]) drawing += line([stepCenters[i].corner(.58, 0, -.02), stepCenters[i].corner(.58, 0, .88)], rail, 2.5);
    }
  }
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 364 248');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.innerHTML = drawing;
  return svg;
}

function card(model, index) {
  const article = element('article', 'riaux-model-card');
  article.id = model.id;
  article.dataset.model = model.id;
  article.dataset.family = model.family;
  article.dataset.collection = model.collection;
  article.dataset.search = normalize([model.label, model.description, familyLabels[model.family], model.collectionLabel, ...(model.notes || [])].join(' '));
  const visual = element('div', 'riaux-model-art');
  const photo = element('img', 'riaux-model-photo');
  photo.src = `${import.meta.env.BASE_URL}riaux-models/${model.id}.webp`;
  photo.alt = `${model.label}, visuel du catalogue Riaux Escaliers 2026`;
  photo.width = 1171;
  photo.height = 828;
  photo.loading = index < 3 ? 'eager' : 'lazy';
  photo.decoding = 'async';
  visual.append(photo, element('span', 'riaux-model-number', String(index + 1).padStart(2, '0')), element('span', 'riaux-model-kind', familyLabels[model.family] || 'Sur mesure'));
  const body = element('div', 'riaux-model-body');
  body.append(element('p', 'riaux-model-collection', model.collectionLabel), element('h3', '', model.label), element('p', 'riaux-model-description', model.description));
  const badges = element('div', 'riaux-model-badges');
  badges.append(element('span', '', label(catalog.STRUCTURE_TYPES, model.defaults.structureType)), element('span', '', model.defaults.risers ? 'Avec contremarches' : 'Marches ouvertes'));
  body.append(badges);
  const details = element('details', 'riaux-model-details');
  const summary = element('summary', '', 'Matières & détails');
  summary.append(element('span', '', '+'));
  details.append(summary);
  const diagram = element('div', 'riaux-detail-drawing');
  diagram.append(silhouette(model), element('small', '', 'Lecture graphique de la silhouette'));
  details.append(diagram);
  const rows = element('dl', 'riaux-model-specs');
  const fields = [
    ['Structure', 'structureMaterial', catalog.STRUCTURES],
    ['Marches', 'treadMaterial', catalog.MATERIALS],
    ['Main courante', 'handrail', catalog.HANDRAILS],
    ['Finitions bois', 'woodFinish', catalog.WOOD_FINISHES],
    ['Départ', 'startStep', catalog.START_STEPS],
  ];
  for (const [title, key, options] of fields) {
    const values = model.allowed?.[key] || [model.defaults[key]];
    if (!values?.length) continue;
    rows.append(element('dt', '', title), element('dd', '', values.map(value => label(options, value)).join(' · ')));
  }
  details.append(rows);
  if (model.id === 'elementaire') details.append(element('p', 'riaux-model-update', 'Version 2026 : garde-corps d’étage à balustres aluminium anodisé mat. Le panneau PLB visible sur l’ancienne illustration du catalogue est retiré.'));
  if (model.notes?.length) {
    const notes = element('ul', 'riaux-model-notes');
    model.notes.forEach(note => notes.append(element('li', '', note)));
    details.append(notes);
  }
  details.append(element('p', 'riaux-model-source', `Catalogue Riaux 2026 · pages ${model.pages}. Aperçu graphique indicatif.`));
  const fullPhoto = element('a', 'riaux-full-photo', 'Voir le visuel du catalogue en entier');
  fullPhoto.append(arrowIcon());
  fullPhoto.href = photo.src;
  fullPhoto.target = '_blank';
  fullPhoto.rel = 'noopener';
  details.append(fullPhoto);
  body.append(details);
  const link = element('a', 'riaux-model-link', `Personnaliser ${model.label}`);
  link.href = `./configurateur.html?${catalog.encodeConfig(catalog.configurationForModel(model.id))}`;
  link.append(arrowIcon());
  link.setAttribute('aria-label', `Personnaliser le modèle ${model.label} en 3D`);
  body.append(link);
  article.append(visual, body);
  return article;
}

models.forEach((model, index) => grid.append(card(model, index)));
document.querySelectorAll('[data-riaux-count]').forEach(node => { node.textContent = models.length; });
const hero = models.find(model => model.id === 'chic') || models[0];
if (hero) document.querySelector('#riaux-hero-drawing').append(silhouette(hero, true));

function sync(writeURL = true) {
  const query = normalize(search.value.trim());
  let count = 0;
  [...grid.children].forEach(card => {
    const visible = (family === 'all' || card.dataset.family === family) && (!collection.value || card.dataset.collection === collection.value) && (!query || card.dataset.search.includes(query));
    card.hidden = !visible;
    if (visible) count += 1;
  });
  buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.familyFilter === family)));
  status.textContent = `${count} modèle${count > 1 ? 's' : ''} à explorer`;
  document.querySelector('#riaux-empty').hidden = count !== 0;
  document.querySelector('#riaux-reset').hidden = !query && family === 'all' && !collection.value;
  if (writeURL) {
    const url = new URL(location.href);
    url.search = '';
    if (family !== 'all') url.searchParams.set('family', family);
    if (collection.value) url.searchParams.set('collection', collection.value);
    if (search.value.trim()) url.searchParams.set('q', search.value.trim());
    history.replaceState(null, '', url);
  }
}
function readURL() {
  const params = new URLSearchParams(location.search);
  family = buttons.some(button => button.dataset.familyFilter === params.get('family')) ? params.get('family') : 'all';
  collection.value = [...collection.options].some(option => option.value === params.get('collection')) ? params.get('collection') : '';
  search.value = params.get('q')?.slice(0, 100) || '';
  sync(false);
}
function reset() { family = 'all'; collection.value = ''; search.value = ''; sync(); search.focus({ preventScroll: true }); }
buttons.forEach(button => button.addEventListener('click', () => { family = button.dataset.familyFilter; sync(); }));
search.addEventListener('input', () => sync());
collection.addEventListener('change', () => sync());
document.querySelector('#riaux-reset').addEventListener('click', reset);
document.querySelector('#riaux-empty-reset').addEventListener('click', reset);
addEventListener('popstate', readURL);
readURL();
