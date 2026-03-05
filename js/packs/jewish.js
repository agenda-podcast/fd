export const jewishPack = {
  id: 'jewish',
  label: 'Jewish',
  titles: {
    now: 'Now',
    timing: 'Zmanim',
    alerts: 'Alerts',
    builder: 'Guided Blessing',
  },
  theme: {
    color1: '#0a0f1f',
    color2: '#f5f1d8',
    color3: '#16233a',
    color4: '#d4af37',
    color5: '#556b8a',
    color6: '#c14953',
  },
  occasions: [
    { id: 'general', label: 'Daily Blessing', templateKey: 'general', allowLiving: true, allowDeceased: true, allowOnBehalfOf: true },
    { id: 'living', label: 'Prayer for the Living', templateKey: 'living', allowLiving: true, allowDeceased: false, allowOnBehalfOf: true },
    { id: 'deceased', label: 'Memorial Mention', templateKey: 'deceased', allowLiving: false, allowDeceased: true, allowOnBehalfOf: true },
  ],
  formatters: {
    standard: { single: '{name}', pair: '{name1} and {name2}', multi: '{items_comma} and {last_item}' },
    memorial: { single: '{name}', pair: '{name1} and {name2}', multi: '{items_comma} and {last_item}' },
  },
  templates: {
    general: [
      { type: 'text', value: 'May this blessing be offered' },
      { type: 'slot', key: 'onBehalfOf' },
      { type: 'slot', key: 'living' },
      { type: 'slot', key: 'deceased' },
      { type: 'text', value: 'and bring peace.' },
    ],
    living: [
      { type: 'text', value: 'May this prayer rise' },
      { type: 'slot', key: 'onBehalfOf' },
      { type: 'slot', key: 'living' },
      { type: 'text', value: 'for healing and strength.' },
    ],
    deceased: [
      { type: 'text', value: 'May this memorial prayer be lifted' },
      { type: 'slot', key: 'onBehalfOf' },
      { type: 'slot', key: 'deceased' },
      { type: 'text', value: 'with remembrance and mercy.' },
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
    const seasonalHour = celestial.dayLengthMs / 12;
    const dawn = new Date(celestial.sunrise.getTime() - (72 * 60000));
    const shema = new Date(celestial.sunrise.getTime() + (3 * seasonalHour));
    const shacharitEnd = new Date(celestial.sunrise.getTime() + (4 * seasonalHour));
    const minchaStart = new Date(celestial.solarNoon.getTime() + (30 * 60000));
    const nightfall = new Date(celestial.sunset.getTime() + (40 * 60000));
    const periods = [
      { label: 'Pre-Dawn Reflection', start: dawn, end: celestial.sunrise },
      { label: 'Shema Window', start: celestial.sunrise, end: shema },
      { label: 'Shacharit Window', start: celestial.sunrise, end: shacharitEnd },
      { label: 'Mincha Window', start: minchaStart, end: celestial.sunset },
      { label: 'Maariv Window', start: nightfall, end: endOfDay(now) },
    ];
    return buildCommon(now, celestial, periods, calendarRows, 'Jewish cycle');
  },
};

function buildCommon(now, celestial, periods, calendarRows, currentLabel) {
  const active = periods.find((item) => now >= item.start && now < item.end) || { label: 'Between Windows', start: now, end: now };
  const next = periods.find((item) => item.start > now) || { label: 'Next dawn cycle', at: periods[0].start };
  const calendarLabel = pickCalendar(calendarRows, 'jewish');
  return {
    currentLabel,
    activePeriod: active.label,
    activeWindow: `${hm(active.start)} - ${hm(active.end)}`,
    nextEvent: { label: next.label || next.at, at: next.start || next.at },
    nextLabel: next.label || 'Next cycle',
    nextTime: hm(next.start || next.at),
    calendarLabel,
    sunLabel: `Sun ${hm(celestial.sunrise)} / ${hm(celestial.sunset)}`,
    moonLabel: `${celestial.moonPhase}`,
    periods,
  };
}

function hm(date) {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function endOfDay(now) {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
}

function pickCalendar(rows, tradition) {
  const match = rows.find((row) => row.tradition === tradition);
  return match ? match.label : 'Today';
}
