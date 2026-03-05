export const zoroastrianPack = {
  id: 'zoroastrian',
  label: 'Zoroastrian',
  titles: {
    now: 'Now',
    timing: 'Gah',
    alerts: 'Alerts',
    builder: 'Guided Devotion',
  },
  theme: {
    color1: '#0f120f',
    color2: '#f4f0d8',
    color3: '#223127',
    color4: '#f2c14e',
    color5: '#6c7a6b',
    color6: '#d95d39',
  },
  occasions: [
    { id: 'general', label: 'Daily Devotion', templateKey: 'general', allowLiving: true, allowDeceased: true, allowOnBehalfOf: true },
    { id: 'living', label: 'Blessing for the Living', templateKey: 'living', allowLiving: true, allowDeceased: false, allowOnBehalfOf: true },
    { id: 'deceased', label: 'Memory of the Departed', templateKey: 'deceased', allowLiving: false, allowDeceased: true, allowOnBehalfOf: true },
  ],
  formatters: {
    standard: { single: '{name}', pair: '{name1} and {name2}', multi: '{items_comma} and {last_item}' },
    memorial: { single: '{name}', pair: '{name1} and {name2}', multi: '{items_comma} and {last_item}' },
  },
  templates: {
    general: [
      { type: 'text', value: 'May this devotion be carried' },
      { type: 'slot', key: 'onBehalfOf' },
      { type: 'slot', key: 'living' },
      { type: 'slot', key: 'deceased' },
      { type: 'text', value: 'with light and good purpose.' },
    ],
    living: [
      { type: 'text', value: 'May this blessing be offered' },
      { type: 'slot', key: 'onBehalfOf' },
      { type: 'slot', key: 'living' },
      { type: 'text', value: 'for strength and right mind.' },
    ],
    deceased: [
      { type: 'text', value: 'May this remembrance be spoken' },
      { type: 'slot', key: 'onBehalfOf' },
      { type: 'slot', key: 'deceased' },
      { type: 'text', value: 'with honor and peace.' },
    ],
  },
  slotBindings: {
    top_medallion: 'currentLabel',
    top_row_1: 'calendarLabel',
    top_row_2: 'sunLabel',
    top_row_3: 'moonLabel',
    center_row_1: 'activePeriod',
    center_row_2: 'activeWindow',
    bottom_row_1: 'nextLabel',
    bottom_row_2: 'nextTime',
    bottom_row_3: 'nextCountdown',
    bottom_medallion: 'nextLabel',
  },
  compute(now, celestial, calendarRows) {
    const noon = celestial.solarNoon;
    const threePm = atFrom(noon, 3, 0);
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    const periods = [
      { label: 'Havan Gah', start: celestial.sunrise, end: noon },
      { label: 'Rapithwin Gah', start: noon, end: threePm },
      { label: 'Uziran Gah', start: threePm, end: celestial.sunset },
      { label: 'Aiwisruthrem Gah', start: celestial.sunset, end: at(now, 23, 59) },
      { label: 'Ushahin Gah', start: at(now, 0, 0), end: celestial.sunrise },
    ];
    const active = periods.find((item) => now >= item.start && now < item.end) || { label: 'Between Gahs', start: now, end: now };
    const next = periods.filter((item) => item.start > now).sort((a, b) => a.start - b.start)[0] || { label: 'Havan Gah', at: nextDay(now, celestial.sunrise) };
    return {
      currentLabel: 'Five Gah cycle',
      activePeriod: active.label,
      activeWindow: `${hm(active.start)} - ${hm(active.end)}`,
      nextEvent: { label: next.label, at: next.start || next.at || midnight },
      nextLabel: next.label,
      nextTime: hm(next.start || next.at || midnight),
      calendarLabel: pickCalendar(calendarRows, 'zoroastrian'),
      sunLabel: `Sun ${hm(celestial.sunrise)} / ${hm(celestial.sunset)}`,
      moonLabel: `${celestial.moonPhase}`,
      periods,
    };
  },
};

function at(now, hour, minute) {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0);
}

function atFrom(base, hourDelta, minuteDelta) {
  return new Date(base.getTime() + (hourDelta * 3600000) + (minuteDelta * 60000));
}

function nextDay(now, exemplar) {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, exemplar.getHours(), exemplar.getMinutes(), 0);
}

function hm(date) {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function pickCalendar(rows, tradition) {
  const match = rows.find((row) => row.tradition === tradition);
  return match ? match.label : 'Today';
}
