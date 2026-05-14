export function safeNextPath(value: string | null | undefined, fallback = '/') {
  if (!value) return fallback;
  if (!value.startsWith('/')) return fallback;
  if (value.startsWith('//')) return fallback;
  return value;
}
