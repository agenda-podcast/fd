export function parseNames(text) {
  return text.split(',').map((item) => item.trim()).filter(Boolean);
}

export function buildText(pack, occasion, inputs) {
  const template = pack.templates[occasion.templateKey];
  const parts = [];
  template.forEach((segment) => {
    if (segment.type === 'text') {
      parts.push(segment.value);
    }
    if (segment.type === 'slot') {
      const value = resolveSlot(segment.key, inputs, pack.formatters);
      if (value) {
        parts.push(value);
      }
    }
  });
  return normalizeSpacing(parts.join(' '));
}

function resolveSlot(key, inputs, formatters) {
  if (key === 'onBehalfOf' && inputs.onBehalfOf) {
    return `on behalf of ${inputs.onBehalfOf}`;
  }
  if (key === 'living' && inputs.living.length > 0) {
    return `for the living: ${formatList(inputs.living, formatters.standard)}`;
  }
  if (key === 'deceased' && inputs.deceased.length > 0) {
    return `in memory of ${formatList(inputs.deceased, formatters.memorial)}`;
  }
  return '';
}

function formatList(items, formatter) {
  if (items.length === 1) {
    return formatter.single.replace('{name}', items[0]);
  }
  if (items.length === 2) {
    return formatter.pair.replace('{name1}', items[0]).replace('{name2}', items[1]);
  }
  const head = items.slice(0, -1).join(', ');
  return formatter.multi.replace('{items_comma}', head).replace('{last_item}', items[items.length - 1]);
}

function normalizeSpacing(text) {
  return text.replace(/\s+/g, ' ').replace(/\s+([,.;:])/g, '$1').trim();
}
