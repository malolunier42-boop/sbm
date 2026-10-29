import { configurationForModel, normalizeConfig, encodeConfig } from './catalog.js';
import { arrowIcon } from './catalogue-icons.js';

const make = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
};
const project = (model, patch = {}) => `./configurateur.html?${encodeConfig(normalizeConfig({ ...configurationForModel(model), ...patch }))}`;
const woods = [
  { id: 'hevea', name: 'Hévéa LCA', model: 'elementaire', tone: 'hevea', number: '01', heading: 'Clair, tout simplement.', text: 'Une présence douce et un assemblage visible. L’hévéa LCA compose notamment le modèle Élément’aire, avec sa finition vernis incolore.', finish: 'Vernis incolore · selon modèle' },
  { id: 'beech-lca', name: 'Hêtre LCA', model: 'harmonie', tone: 'beech-lca', number: '02', heading: 'Le bois dans son rythme.', text: 'Des nuances assemblées et un esprit naturel. Le vernis ou les teintes disponibles se choisissent selon la fiche du modèle.', finish: 'Incolore ou teinte · selon modèle' },
  { id: 'beech', name: 'Hêtre massif', model: 'origine', tone: 'beech', number: '03', heading: 'Une palette à inventer.', text: 'Verni, teinté ou associé à une structure peinte, le hêtre massif ouvre des compositions de couleurs particulièrement expressives.', finish: 'Teintes & structure peinte · selon modèle' },
  { id: 'oak', name: 'Chêne massif', model: 'chic', tone: 'oak', number: '04', heading: 'La force d’un grain.', text: 'Un veinage présent et une matière chaleureuse. Le chêne se révèle en vernis incolore ou dans une version chêne blanchi.', finish: 'Vernis incolore ou chêne blanchi' },
  { id: 'oak-rustic', name: 'Chêne massif rustique', model: 'urbain', tone: 'oak-rustic', number: '05', heading: 'Un caractère singulier.', text: 'Une lecture plus vivante du bois, associée au vernis mat sablé blanchi. Selon le modèle, une structure en hêtre peut accompagner les marches rustiques.', finish: 'Vernis mat sablé blanchi' },
  { id: 'iroko', name: 'Iroko', model: 'outdoor', tone: 'iroko', number: '06', heading: 'Le naturel prend l’air.', text: 'L’essence du modèle extérieur du catalogue, présenté brut de ponçage avec garde-corps bois et palier d’arrivée. Exposition et entretien se précisent dans l’étude.', finish: 'Extérieur · brut de ponçage' },
];

for (const wood of woods) {
  const card = make('article', 'riaux-wood-card');
  const swatch = make('div', `riaux-wood-sample riaux-grain-${wood.tone}`);
  swatch.setAttribute('aria-hidden', 'true');
  swatch.append(make('span', '', wood.number));
  const body = make('div', 'riaux-wood-copy');
  body.append(make('p', 'riaux-wood-finish', wood.finish), make('h3', '', wood.name), make('strong', 'riaux-wood-heading', wood.heading), make('p', '', wood.text));
  const link = make('a', 'riaux-wood-link', `Explorer ${wood.name === 'Iroko' ? 'l’iroko' : wood.id === 'hevea' ? 'l’hévéa LCA' : `le ${wood.name.toLowerCase()}`}`);
  link.href = project(wood.model, { treadMaterial: wood.id, ...(wood.id === 'beech-lca' ? { structureMaterial: 'beech-lca' } : {}) });
  link.append(arrowIcon());
  body.append(link);
  card.append(swatch, body);
  document.querySelector('#riaux-wood-grid').append(card);
}

const finishes = [
  { id: 'natural', label: 'Vernis incolore', tone: '#d6b47c', model: 'origine', material: 'beech', note: 'Le bois dans sa teinte naturelle' },
  { id: 'pitch-pin', label: 'Pitch pin', tone: '#b97d43', model: 'origine', material: 'beech', note: 'Une teinte dorée sur le bois' },
  { id: 'grey-light', label: 'Gris clair', tone: '#b1ad9d', model: 'origine', material: 'beech', note: 'Une nuance douce et légère' },
  { id: 'grey-dark', label: 'Gris foncé', tone: '#676a61', model: 'origine', material: 'beech', note: 'Une tonalité plus affirmée' },
  { id: 'wenge', label: 'Wengé', tone: '#493b31', model: 'origine', material: 'beech', note: 'La profondeur d’une teinte brune' },
  { id: 'blanched', label: 'Chêne blanchi', tone: '#d8cbb1', model: 'chic', material: 'oak', note: 'Pour le chêne uniquement' },
  { id: 'sandblasted', label: 'Mat sablé blanchi', tone: '#c0b79c', model: 'urbain', material: 'oak-rustic', note: 'Pour le chêne rustique uniquement' },
];
for (const finish of finishes) {
  const link = make('a', 'riaux-finish-chip');
  link.href = project(finish.model, { treadMaterial: finish.material, woodFinish: finish.id });
  const sample = make('span', 'riaux-finish-sample');
  sample.style.setProperty('--wood-tone', finish.tone);
  sample.setAttribute('aria-hidden', 'true');
  link.append(sample, make('strong', '', finish.label), make('small', '', finish.note));
  document.querySelector('#riaux-wood-finishes').append(link);
}

const colors = [
  ['Noir', 'RAL 9005', '#171b18'], ['Anthracite', 'RAL 7016', '#383e42'],
  ['Gun métal', 'Nuance catalogue', '#626460'], ['Gris sablé', 'RAL 2100 S', '#46494a'],
  ['Blanc cassé', 'Nuance catalogue', '#e2dfd1'], ['Cocoa', 'Nuance catalogue', '#766151'],
  ['Vert amande', 'Nuance catalogue', '#aab29a'], ['Bleu ardoise', 'Nuance catalogue', '#4b626c'],
  ['Bleu canard', 'Nuance catalogue', '#1e606c'], ['Rouge de mars', 'Nuance catalogue', '#9a4338'],
];
const colorSupport = document.querySelector('#riaux-color-support');
const colorLinks = [];
for (const [name, reference, hex] of colors) {
  const link = make('a', 'riaux-paint-chip');
  link.setAttribute('aria-label', `Explorer la couleur ${name}, ${reference}`);
  const dot = make('span', 'riaux-paint-sample');
  dot.style.setProperty('--paint-tone', hex);
  dot.setAttribute('aria-hidden', 'true');
  link.append(dot, make('strong', '', name), make('small', '', reference));
  document.querySelector('#riaux-paint-colors').append(link);
  colorLinks.push({ link, hex });
}
function updateColors() {
  const wood = colorSupport.value === 'wood';
  colorLinks.forEach(({ link, hex }) => {
    link.href = project(wood ? 'tricolore' : 'zephyr', { structureColor: hex, structureFinish: wood ? 'painted' : 'natural', ...(wood ? { structureMaterial: 'beech', treadMaterial: 'beech' } : {}) });
  });
  document.querySelector('#riaux-color-support-note').textContent = wood
    ? 'Peinture sur la structure en hêtre massif. Les marches conservent leur finition bois ; les répartitions de couleurs dépendent du modèle.'
    : 'Thermolaquage des composants métalliques. Les possibilités et les associations de couleurs dépendent du modèle retenu.';
}
colorSupport.addEventListener('change', updateColors);
updateColors();

document.querySelectorAll('[data-riaux-detail]').forEach(link => {
  const kind = link.dataset.riauxDetail;
  if (kind.startsWith('laser-')) link.href = project('zephyr', { landingGuard: kind });
  else if (kind === 'start') link.href = project('cottage', { startStep: 'rounded' });
  else if (kind === 'handrail') link.href = project('voile', { handrail: 'flat-metal' });
  else if (kind === 'anti-slip') link.href = project('origine', { antiSlip: 'grooves' });
  else if (kind === 'pack') link.href = project('origine', { packDeco: true, shape: 'straight', railing: 'horizontal', railMaterial: 'inox' });
});
