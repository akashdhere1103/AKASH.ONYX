import { profiles, roles } from './cv-data.js';

const $ = selector => document.querySelector(selector);
const tabs = [...document.querySelectorAll('[role="tab"]')];
const dialog = $('#fit-dialog');
const roleSelect = $('#role-select');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const softwareEntries = Object.fromEntries(profiles.software.experience.map(entry => [entry.id, entry]));
const workFiles = {
  enerlogs: {
    label: 'Enerlogs internship', title: 'Full-stack development', path: 'experience / enerlogs',
    meta: 'Enerlogs Analytics Pvt. Ltd. · 13 Oct 2025 – 10 Apr 2026', notesTitle: 'Internship record',
    groups: [['Application development', [0, 1]], ['Backend and interface', [3, 4, 5]], ['Portal support', [2]]]
  },
  meter: {
    label: 'Meter monitoring', title: 'Meter monitoring', path: 'projects / meter-monitoring',
    meta: 'A demo for exploring date-based meter readings and energy values in tables and charts.', notesTitle: 'Implementation notes',
    groups: [['Data flow', [2]], ['Meter readings', [1]], ['Web interface', [0]]]
  },
  mern: {
    label: 'MERN training', title: 'MERN stack training', path: 'training / mern-stack',
    meta: 'MongoDB · Express.js · ReactJS · Node.js', notesTitle: 'Training record',
    groups: [['Training focus', [0]]]
  }
};
let activeProfile = 'software';
let studio;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function bullets(points) {
  const list = el('ul', 'points');
  for (const point of points) list.append(el('li', '', point));
  return list;
}

let workAnimations = [];
function cancelWorkMotion() {
  workAnimations.forEach(animation => animation.cancel());
  workAnimations = [];
}
function switchWork(key) {
  if ($('#work-index button[aria-pressed="true"]')?.value === key) return;
  if (reducedMotion.matches || !Element.prototype.animate) {
    renderWork(key);
    return;
  }
  const boxes = [$('.studio'), $('#work-hero')];
  // Read the displayed sizes before canceling an interrupted transition.
  const start = boxes.map(box => box.getBoundingClientRect().height);
  renderWork(key);
  const end = boxes.map(box => box.getBoundingClientRect().height);
  const timing = {duration:380, easing:'cubic-bezier(.22,.68,.24,1)'};
  boxes.forEach((box,i) => {
    if (Math.abs(start[i]-end[i]) > .5) {
      workAnimations.push(box.animate([
        {height:start[i]+'px'}, {height:end[i]+'px'}
      ],timing));
    }
  });
  for (const node of [$('.work-heading'), $('.notes-heading'), $('#work-notes')]) {
    workAnimations.push(node.animate([
      {opacity:0,transform:'translateY(5px)'}, {opacity:1,transform:'none'}
    ],{duration:240,easing:'ease-out'}));
  }
}
function renderWork(key, evidenceNote) {
  cancelWorkMotion();
  const entry = softwareEntries[key];
  const file = workFiles[key];
  $('#file-path').textContent = file.path;
  $('#work-kind').textContent = entry.type;
  $('#work-title').textContent = file.title;
  $('#work-meta').textContent = file.meta;
  document.dispatchEvent(new Event('portfolio-work-change'));
  $('#notes-title').textContent = file.notesTitle;
  $('#work-hero').toggleAttribute('data-evidence', Boolean(evidenceNote));
  for (const button of $('#work-index').children) button.setAttribute('aria-pressed', String(button.value === key));
  $('#work-notes').replaceChildren(...file.groups.map(([name, indices]) => {
    const note = el('section', 'note');
    if (name === evidenceNote) note.dataset.evidence = '';
    const heading = el('h3', 'note-name', name);
    heading.tabIndex = -1;
    note.append(heading, bullets(indices.map(i => entry.points[i])));
    return note;
  }));
}

for (const [key, file] of Object.entries(workFiles)) {
  const button = el('button', 'index-item', file.label);
  button.value = key;
  button.addEventListener('click', () => switchWork(key));
  $('#work-index').append(button);
}

for (const key of ['taneja', 'agni', 'enerlogs']) {
  const entry = profiles.aero.experience.find(item => item.id === key);
  const record = el('article', 'log-entry');
  record.id = 'log-' + key;
  const heading = el('div', 'log-info');
  heading.append(el('span', 'log-type', entry.type), el('h3', '', entry.title), el('p', '', entry.organisation));
  const header = el('header', 'log-header');
  heading.querySelector('h3').tabIndex = -1;
  const year = { taneja: '2021', agni: '2023', enerlogs: '2025' }[key];
  header.append(el('span', 'year', year), heading);
  const body = el('div', 'log-body');
  body.append(el('p', 'log-date', entry.dates), bullets(entry.points));
  record.append(header, body);
  $('#log-entries').append(record);
}

function loadAircraft() {
  if ($('#hangar-image img')) return;
  const image = new Image(1600, 533);
  image.alt = '';
  image.sizes = '100vw';
  image.srcset = 'assets/aero-hero-720.webp 720w, assets/aero-hero-1600.webp 1600w';
  image.src = 'assets/aero-hero-1600.webp';
  image.addEventListener('error', () => image.remove(), { once: true });
  $('#hangar-image').append(image);
}

const skillArrival = !CSS.supports('animation-timeline: view()') && 'IntersectionObserver' in window
  ? new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        skillArrival.unobserve(entry.target);
        if (!reducedMotion.matches) entry.target.animate([
          {opacity:.3, transform:'translateY(28px)'}, {opacity:1, transform:'none'}
        ], {duration:450, easing:'ease-out'});
      }
    })
  : null;
let roleChosen = false;
function renderSkills(filter = 'All', animate = false) {
  const grid = $('#skill-groups');
  const fromHeight = grid.getBoundingClientRect().height;
  grid.getAnimations().forEach(animation => animation.cancel());
  const motion = animate && !reducedMotion.matches && typeof grid.animate === 'function';
  const groups = profiles[activeProfile].skills;
  const role = roles[roleSelect.value];
  for (const button of $('#skill-filters').children) button.setAttribute('aria-pressed', String(button.textContent === filter));
  skillArrival?.disconnect();
  grid.replaceChildren(...groups.filter(group => filter === 'All' || group.name === filter).map(group => {
    const block = el('section', 'skill-group');
    const list = el('ul', 'tags');
    for (const skill of group.items) {
      const tag = el('li', '', skill);
      if (roleChosen && activeProfile === role.fit && role.signals.includes(skill)) {
        tag.dataset.match = '';
        tag.title = 'Relevant to ' + role.label;
        tag.setAttribute('aria-label', skill + ', ' + tag.title);
      }
      list.append(tag);
    }
    block.append(el('h3', '', group.name), list);
    return block;
  }));
  if (!animate) for (const card of grid.children) skillArrival?.observe(card);
  if (motion) {
    const height = grid.getBoundingClientRect().height;
    grid.animate([
      {height:fromHeight+'px',opacity:.35,clipPath:'inset(0)'},
      {height:height+'px',opacity:1,clipPath:'inset(0)'}
    ], {duration:260,easing:'cubic-bezier(.22,.78,.25,1)'});
  }
}

function setProfile(key) {
  activeProfile = key;
  document.body.dataset.profile = key;
  for (const tab of tabs) {
    const selected = tab.id === 'tab-' + key;
    tab.tabIndex = selected ? 0 : -1;
    tab.setAttribute('aria-selected', String(selected));
    document.getElementById(tab.getAttribute('aria-controls')).hidden = !selected;
  }
  $('#skills-title').textContent = key === 'software' ? 'Technical skills' : 'Engineering skills';
  $('#skill-filters').replaceChildren(...['All', ...profiles[key].skills.map(group => group.name)].map(name => {
    const button = el('button', '', name);
    button.addEventListener('click', () => {
      if (button.getAttribute('aria-pressed') !== 'true') renderSkills(name, true);
    });
    return button;
  }));
  renderSkills();
}

function changeProfile(key, returnToTop = true) {
  if (activeProfile === key) return;
  const previousBounds = returnToTop && studio ? document.querySelector('.model-canvas')?.getBoundingClientRect() : null;
  if (key === 'aero') loadAircraft();
  setProfile(key);
  document.dispatchEvent(new Event("portfolio-profile-change"));
  if (returnToTop) window.scrollTo({top: 0, behavior: 'instant'});
  studio?.switchTo(key, returnToTop, previousBounds);
}

for (const [index, tab] of tabs.entries()) {
  tab.addEventListener('click', () => changeProfile(tab.id.slice(4)));
  tab.addEventListener('keydown', event => {
    let target;
    if (event.key === 'Home') target = tabs[0];
    if (event.key === 'End') target = tabs[1];
    if (['ArrowLeft', 'ArrowRight'].includes(event.key)) target = tabs[1 - index];
    if (!target) return;
    event.preventDefault();
    target.focus({preventScroll:true});
    changeProfile(target.id.slice(4));
  });
}

function clearEvidence() {
  document.querySelectorAll('[data-evidence]').forEach(node => node.removeAttribute('data-evidence'));
}

function renderRole() {
  clearEvidence();
  const role = roles[roleSelect.value];
  const other = role.fit === 'software' ? 'aero' : 'software';
  dialog.dataset.fit = activeProfile;
  const signals = el('ul', 'tags');
  for (const skill of role.signals) signals.append(el('li', '', skill));
  $('#role-result').replaceChildren(el('p', 'eyebrow', 'Closer CV fit'), el('h3', '', profiles[role.fit].label), el('p', 'evidence', role.evidence), signals);
  $('#comparison-body').replaceChildren(...[[role.fit, role.detail], [other, role.other]].map(([key, detail]) => {
    const item = el('section');
    item.append(el('h3', '', profiles[key].label), el('p', '', detail));
    return item;
  }));
  renderSkills($('#skill-filters [aria-pressed="true"]')?.textContent || 'All');
}

for (const [key, role] of Object.entries(roles)) roleSelect.add(new Option(role.label, key));
roleSelect.addEventListener('change', () => { roleChosen = true; renderRole(); });
$('#open-fit').addEventListener('click', () => {
  dialog.dataset.fit = activeProfile;
  dialog.showModal();
});
$('#close-fit').addEventListener('click', () => dialog.close());
$('#show-evidence').addEventListener('click', () => {
  roleChosen = true;
  renderRole();
  const role = roles[roleSelect.value];
  dialog.close();
  changeProfile(role.fit, false);
  clearEvidence();
  let target;
  if (role.fit === 'software') {
    renderWork(role.entry, role.note);
    target = $('#work-notes [data-evidence] h3');
  } else {
    const record = $('#log-' + role.entry);
    record.dataset.evidence = '';
    target = record.querySelector('h3');
  }
  target.focus({preventScroll:true});
  target.scrollIntoView({block:'center', behavior:reducedMotion.matches ? 'instant' : 'smooth'});
});

renderWork('enerlogs');
setProfile('software');
renderRole();

function openLinkedSection() {
  const hash = location.hash;
  if (hash === '#role-fit' && !dialog.open) dialog.showModal();
  if (hash === '#experience') {
    $(activeProfile === 'aero' ? '#training-log' : '#software-experience').scrollIntoView();
  }
  if (hash === '#training-log' && activeProfile !== 'aero') {
    changeProfile('aero', false);
    $('#training-log').scrollIntoView();
  }
}
window.addEventListener('hashchange', openLinkedSection);
openLinkedSection();

// Let the CV and first still render while the model's geometry is prepared.
requestAnimationFrame(() => {
  import('./studio.js').then(async ({setupStudio}) => {
    studio = await setupStudio(reducedMotion);
    if (activeProfile !== 'software') studio.switchTo(activeProfile, false);
  }).catch(() => {
    // The model posters and the CV remain usable without a renderer.
  });
});
