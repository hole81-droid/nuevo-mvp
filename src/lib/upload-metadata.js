const MAX_TAGS = 5;
const MAX_TAG_LENGTH = 20;
const MAX_EXTERNAL_LINKS = 3;

export function normalizeTags(input) {
  const rawTags = Array.isArray(input) ? input : String(input ?? '').split(',');
  const seen = new Set();
  const tags = [];

  for (const rawTag of rawTags) {
    const tag = String(rawTag ?? '')
      .trim()
      .replace(/^#+/, '')
      .replace(/\s+/g, ' ')
      .slice(0, MAX_TAG_LENGTH)
      .replace(/[-_\s]+$/g, '')
      .trim();
    const key = tag.toLocaleLowerCase();

    if (!tag || seen.has(key)) continue;
    seen.add(key);
    tags.push(tag);

    if (tags.length === MAX_TAGS) break;
  }

  return tags;
}

export function normalizeExternalLinks(input) {
  const links = [];

  for (const item of input ?? []) {
    if (links.length === MAX_EXTERNAL_LINKS) break;

    const rawUrl = String(item?.url ?? '').trim();
    let normalizedUrl;

    try {
      const parsed = new URL(rawUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) continue;
      normalizedUrl = parsed.toString();
    } catch {
      continue;
    }

    const label = String(item?.label ?? '').trim().slice(0, 24).trim() || `Link ${links.length + 1}`;
    links.push({ label, url: normalizedUrl });
  }

  return links;
}
