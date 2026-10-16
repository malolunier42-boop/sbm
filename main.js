const menu = document.querySelector('.menu');
const nav = document.querySelector('nav');
const closeMenu = () => { menu.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); };
menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); nav.classList.toggle('open', open); });
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
 document.querySelectorAll('[data-filter]').forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); });
 document.querySelectorAll('.project').forEach(card => { card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter; });
}));
const projectDialog = document.querySelector('#project-dialog');
document.querySelectorAll('.project').forEach(card => card.addEventListener('click', () => { projectDialog.querySelector('h2').textContent = card.dataset.title; projectDialog.querySelector('.dialog-description').textContent = card.dataset.description; projectDialog.showModal(); }));
document.querySelector('#legal-open').addEventListener('click', () => document.querySelector('#legal-dialog').showModal());
document.querySelectorAll('dialog').forEach(dialog => { dialog.querySelector('.close').addEventListener('click', () => dialog.close()); dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } }); });
document.querySelector('#year').textContent = new Date().getFullYear();
