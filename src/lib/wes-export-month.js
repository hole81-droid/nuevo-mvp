const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

function normalizeMonth(value, fallback) {
  if (typeof value === 'string' && MONTH_PATTERN.test(value)) return value;
  if (typeof fallback === 'string' && MONTH_PATTERN.test(fallback)) return fallback;
  return '1970-01';
}

export function getWesExportMonth(value, fallback) {
  const month = normalizeMonth(value, fallback);
  const [year, monthNumber] = month.split('-').map(Number);
  const startDate = new Date(Date.UTC(year, monthNumber - 1, 1));
  const endDate = new Date(Date.UTC(year, monthNumber, 1));

  return {
    month,
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    fallbackUsed: month !== value,
  };
}
