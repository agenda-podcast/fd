import { loadCsv } from './csv.js';
import { formatLocalTime, todayKey } from './clock.js';
import { getCelestialState, evaluateTradition } from './logic.js';
import { buildText, parseNames } from './spell.js';
import { jewishPack } from './packs/jewish.js';
import { catholicPack } from './packs/catholic.js';
import { zoroastrianPack } from './packs/zoroastrian.js';
import { buddhistPack } from './packs/buddhist.js';

const packs = [jewishPack, catholicPack, zoroastrianPack, buddhistPack];
const state = {
  pack: packs[0],
  location: { lat: 40.7128, lon: -74.0060 },
  data: { calendar: [], templates: [], events: [] },
  currentContext: null,
};

const els = {
  digitalClock: document.getElementById('digitalClock'),
  traditionSelect: document.getElementById('traditionSelect'),
  occasionSelect: document.getElementById('occasionSelect'),
  locationInput: document.getElementById('locationInput'),
  locationLabel: document.getElementById('locationLabel'),
  applyLocationBtn: document.getElementById('applyLocationBtn'),
  buildTextBtn: document.getElementById('buildTextBtn'),
  builtText: document.getElementById('builtText'),
  timingSummary: document.getElementById('timingSummary'),
  alertsSummary: document.getElementById('alertsSummary'),
  formHints: document.getElementById('formHints'),
  onBehalfInput: document.getElementById('onBehalfInput'),
  livingInput: document.getElementById('livingInput'),
  deceasedInput: document.getElementById('deceasedInput'),
  sectionTitleNow: document.getElementById('sectionTitleNow'),
  sectionTitleTiming: document.getElementById('sectionTitleTiming'),
  sectionTitleAlerts: document.getElementById('sectionTitleAlerts'),
  sectionTitleBuilder: document.getElementById('sectionTitleBuilder'),
};

init();

async function init() {
  state.data.calendar = await loadCsv('./data/calendar_days.csv');
  state.data.templates = await loadCsv('./data/templates.csv');
  state.data.events = await loadCsv('./data/events.csv');
  renderTraditionOptions();
  bindEvents();
  setPack(packs[0].id);
  tick();
  setInterval(tick, 1000);
}

function bindEvents() {
  els.traditionSelect.addEventListener('change', (event) => setPack(event.target.value));
  els.applyLocationBtn.addEventListener('click', applyLocation);
  els.buildTextBtn.addEventListener('click', handleBuild);
}

function renderTraditionOptions() {
  els.traditionSelect.innerHTML = packs.map((pack) => `<option value="${pack.id}">${pack.label}</option>`).join('');
}

function setPack(packId) {
  state.pack = packs.find((pack) => pack.id === packId) || packs[0];
  applyTheme(state.pack.theme);
  renderOccasions();
  renderTitles();
  updateFormState();
  tick();
}

function renderOccasions() {
  els.occasionSelect.innerHTML = state.pack.occasions.map((item) => `<option value="${item.id}">${item.label}</option>`).join('');
}

function renderTitles() {
  els.sectionTitleNow.textContent = state.pack.titles.now;
  els.sectionTitleTiming.textContent = state.pack.titles.timing;
  els.sectionTitleAlerts.textContent = state.pack.titles.alerts;
  els.sectionTitleBuilder.textContent = state.pack.titles.builder;
}

function applyTheme(theme) {
  const root = document.documentElement;
  Object.keys(theme).forEach((key) => root.style.setProperty(`--${key}`, theme[key]));
}

function applyLocation() {
  const raw = els.locationInput.value.trim();
  const parts = raw.split(',').map((item) => Number(item.trim()));
  if (parts.length !== 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) {
    alert('Use latitude,longitude');
    return;
  }
  state.location = { lat: parts[0], lon: parts[1] };
  els.locationLabel.textContent = `Location: ${parts[0].toFixed(4)}, ${parts[1].toFixed(4)}`;
  tick();
}

function tick() {
  const now = new Date();
  els.digitalClock.textContent = formatLocalTime(now);
  const calendarRows = state.data.calendar.filter((row) => row.date === todayKey(now));
  const celestial = getCelestialState(now, state.location);
  state.currentContext = evaluateTradition(state.pack, now, celestial, calendarRows);
  renderDial();
  renderSummaries();
  updateFormState();
}

function renderDial() {
  const bindings = state.pack.slotBindings;
  const slots = ['top_medallion', 'top_row_1', 'top_row_2', 'top_row_3', 'center_row_1', 'center_row_2', 'bottom_row_1', 'bottom_row_2', 'bottom_row_3', 'bottom_medallion'];
  slots.forEach((slot) => {
    const el = document.getElementById(`slot_${slot}`);
    const key = bindings[slot];
    el.textContent = state.currentContext[key] || '';
  });
}

function renderSummaries() {
  const lines = [
    `Active: ${state.currentContext.activePeriod}`,
    `Window: ${state.currentContext.activeWindow}`,
    `Sunrise: ${state.currentContext.sunriseLabel}`,
    `Sunset: ${state.currentContext.sunsetLabel}`,
    `Moon: ${state.currentContext.moonLabel}`,
  ];
  els.timingSummary.innerHTML = lines.map((line) => `<div class="card-line">${line}</div>`).join('');
  const next = state.currentContext.nextEvent;
  const alerts = [
    `Next event: ${next.label}`,
    `At: ${state.currentContext.nextTime}`,
    `Countdown: ${state.currentContext.nextCountdown}`,
    `Calendar: ${state.currentContext.calendarLabel}`,
  ];
  els.alertsSummary.innerHTML = alerts.map((line) => `<div class="card-line">${line}</div>`).join('');
}

function updateFormState() {
  const occasion = getSelectedOccasion();
  els.onBehalfInput.disabled = !occasion.allowOnBehalfOf;
  els.livingInput.disabled = !occasion.allowLiving;
  els.deceasedInput.disabled = !occasion.allowDeceased;
  const hints = [];
  if (occasion.allowOnBehalfOf) hints.push('On behalf of: single');
  if (occasion.allowLiving) hints.push('Living mentions: multiple');
  if (occasion.allowDeceased) hints.push('Departed mentions: multiple');
  els.formHints.textContent = hints.join(' | ');
}

function getSelectedOccasion() {
  const selectedId = els.occasionSelect.value || state.pack.occasions[0].id;
  return state.pack.occasions.find((item) => item.id === selectedId) || state.pack.occasions[0];
}

function handleBuild() {
  const occasion = getSelectedOccasion();
  const text = buildText(state.pack, occasion, {
    onBehalfOf: els.onBehalfInput.value.trim(),
    living: occasion.allowLiving ? parseNames(els.livingInput.value) : [],
    deceased: occasion.allowDeceased ? parseNames(els.deceasedInput.value) : [],
  });
  els.builtText.textContent = text;
}
