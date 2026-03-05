export const catholicPack = {
  id: 'catholic',
  label: 'Catholic',
  titles: {
    now: 'Now',
    timing: 'Hours',
    alerts: 'Alerts',
    builder: 'Guided Prayer',
  },
  theme: {
    color1: '#101418',
    color2: '#f4f2ea',
    color3: '#1f2933',
    color4: '#9f7aea',
    color5: '#6b7280',
    color6: '#e76f51',
  },
  occasions: [
    { id: 'general', label: 'Daily Office Intention', templateKey: 'general', allowLiving: true, allowDeceased: true, allowOnBehalfOf: true },
    { id: 'living', label: 'Intercession for the Living', templateKey: 'living', allowLiving: true, allowDeceased: false, allowOnBehalfOf: true },
    { id: 'deceased', label: 'Memorial for the Departed', templateKey: 'deceased', allowLiving: false, allowDeceased: true, allowOnBehalfOf: true },
  ],
  formatters: {
    standard: { single: '{name}', pair: '{name1} and {name2}', multi: '{items_comma} and {last_item}' },
    memorial: { single: '{name}', pair: '{name1} and {name2}', multi: '{items_comma} and {last_item}' },
  },
  templates: {
    general: [
      { type: 'text', value: 'This offering is placed' },
      { type: 'slot', key: 'onBehalfOf' },
      { type: 'slot', key: 'living' },
      { type: 'slot', key: 'deceased' },
      { type: 'text', value: 'within the prayer of the day.' },
    ],
    living: [
      { type: 'text', value: 'This intercession is offered' },
      { type: 'slot', key: 'onBehalfOf' },
      { type: 'slot', key: 'living' },
      { type: 'text', value: 'for grace and protection.' },
    ],
    deceased: [
      { type: 'text', value: 'This memorial prayer is offered' },
      { type: 'slot', key: 'onBehalfOf' },
      { type: 'slot', key: 'deceased' },
      { type: 'text', value: 'for rest and remembrance.' },
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
    const morning = new Date(celestial.sunrise.getTime() - (30 * 60000));
    const office = at(now, 5, 0);
    const daytime = at(now, 12, 0);
    const evening = new Date(celestial.sunset.getTime() + (15 * 60000));
    const night = at(now, 21, 0);
    const periods = [
      { label: 'Office of Readings', start: office, end: morning },
      { label: 'Morning Prayer', start: morning, end: at(now, 9, 0) },
      { label: 'Daytime Prayer', start: daytime, end: at(now, 15, 0) },
      { label: 'Evening Prayer', start: evening, end: night },
      { label: 'Night Prayer', start: night, end: endOfDay(now) },
    ];
    const active = periods.find((item) => now >= item.start && now < item.end) || { label: 'Ordinary Time', start: now, end: now };
    const next = periods.find((item) => item.start > now) || { label: 'Office of Readings', at: atTomorrow(now, 5, 0) };
    return {
      currentLabel: 'Catholic cycle',
      activePeriod: active.label,
      activeWindow: `${hm(active.start)} - ${hm(active.end)}`,
      nextEvent: { label: next.label, at: next.start || next.at },
      nextLabel: next.label,
      nextTime: hm(next.start || next.at),
      calendarLabel: pickCalendar(calendarRows, 'catholic'),
      sunLabel: `Sun ${hm(celestial.sunrise)} / ${hm(celestial.sunset)}`,
      moonLabel: `${celestial.moonPhase}`,
      periods,
    };
  },
};

function at(now, hour, minute) {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0);
}

function atTomorrow(now, hour, minute) {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, hour, minute, 0);
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
