export function getLocalized(map, lang) {
  if (!map || typeof map !== 'object') return '';
  const v = map[lang] || map.de || map.en || map.fr;
  return v != null ? String(v) : '';
}
