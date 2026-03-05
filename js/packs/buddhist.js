export const buddhistPack = {
  id: 'buddhist',
  label: 'Buddhist',
  titles: {
    now: 'Now',
    timing: 'Lunar Observance',
    alerts: 'Alerts',
    builder: 'Guided Chant',
  },
  theme: {
    color1: '#12100e',
    color2: '#f7f3e8',
    color3: '#2b2621',
    color4: '#d97706',
    color5: '#7c6f64',
    color6: '#ef4444',
  },
  occasions: [
    { id: 'general', label: 'Daily Dedication', templateKey: 'general', allowLiving: true, allowDeceased: true, allowOnBehalfOf: true },
    { id: 'living', label: 'Dedication for the Living', templateKey: 'living', allowLiving: true, allowDeceased: false, allowOnBehalfOf: true },
    { id: 'deceased', label: 'Memorial Dedication', templateKey: 'deceased', allowLiving: false, allowDeceased: true, allowOnBehalfOf: true },
  ],
  formatters: {
    standard: { single: '{name}', pair: '{name1} and {name2}', multi: '{items_comma} and {last_item}' },
    memorial: { single: '{name}', pair: '{name1} and {name2}', multi: '{items_comma} and {last_item}' },
  },
  templates: {
    general: [
      { type: 'text', value: 'May the merit of this practice be shared' },
      { type: 'slot', key: 'onBehalfOf' },
      { type: 'slot', key: 'living' },
      { type: 'slot', key: 'deceased' },
      { type: 'text', value: 'for the benefit of all.' },
    ],
    living: [
      { type: 'text', value: 'May this chant be dedicated' },
      { type: 'slot', key: 'onBehalfOf' },
      { type: 'slot', key: 'living' },
      { type: 'text', value: 'for well-being and calm.' },
    ],
    deceased: [
      { type: 'text', value: 'May this remembrance be dedicated' },
      { type: 'slot', key: 'onBehalfOf' },
      { type: 'slot', key: 'deceased' },
      { type: 'text', value: 'with compassion and release.' },
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
    const dawn = new Date(celestial.sunrise.getTime() - (30 * 60000));
    const midday = at(now, 12, 0);
    const evening = new Date(celestial.sunset.getTime() + (20 * 60000));
    const periods = [
      { label: 'Morning Practice', start: dawn, end: at(now, 8, 0) },
      { label: 'Midday Mindfulness', start: midday, end: at(now, 13, 0) },
      { label: 'Evening Chanting', start: evening, end: at(now, 21, 0) },
    ];
    const uposatha = isUposatha(celestial.moonPhase) ? 'Uposatha' : 'Daily Practice';
    const active = periods.find((item) => now >= item.start && now < item.end) || { label: uposatha, start: now, end: now };
    const next = periods.find((item) => item.start > now) || { label: 'Morning Practice', at: nextMorning(now, dawn) };
    return {
      currentLabel: uposatha,
      activePeriod: active.label,
      activeWindow: `${hm(active.start)} - ${hm(active.end)}`,
      nextEvent: { label: next.label, at: next.start || next.at },
      nextLabel: next.label,
      nextTime: hm(next.start || next.at),
      calendarLabel: pickCalendar(calendarRows, 'buddhist'),
      sunLabel: `Sun ${hm(celestial.sunrise)} / ${hm(celestial.sunset)}`,
      moonLabel: `${celestial.moonPhase}`,
      periods,
    };
  },
};

function isUposatha(phase) {
  return ['New Moon', 'Full Moon', 'First Quarter', 'Last Quarter'].includes(phase);
}

function at(now, hour, minute) {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0);
}

function nextMorning(now, exemplar) {
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
