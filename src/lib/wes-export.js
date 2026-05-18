export const WES_EXPORT_COLUMNS = [
  'event_type',
  'event_id',
  'post_id',
  'post_title',
  'occurred_at',
  'value',
  'duration_seconds',
  'traffic_source',
  'detail',
  'wes_weight',
];

const WEIGHTS = {
  experience: 1,
  experience_minute: 0.8,
  reaction: 1.5,
  comment: 2,
  remix: 5,
};

function eventTime(row) {
  return row.created_at ?? row.started_at ?? '';
}

export function buildWesEventRows({ experiences = [], reactions = [], comments = [], remixes = [] } = {}) {
  return [
    ...experiences.map((row) => ({
      event_type: 'experience',
      event_id: row.id,
      post_id: row.post_id,
      post_title: row.post_title,
      occurred_at: row.started_at,
      value: 1,
      duration_seconds: row.duration_seconds ?? 0,
      traffic_source: row.traffic_source ?? 'direct',
      detail: '',
      wes_weight: WEIGHTS.experience,
    })),
    ...reactions.map((row) => ({
      event_type: 'reaction',
      event_id: `${row.post_id}:${row.created_at}:${row.reaction}`,
      post_id: row.post_id,
      post_title: row.post_title,
      occurred_at: eventTime(row),
      value: 1,
      duration_seconds: '',
      traffic_source: '',
      detail: row.reaction,
      wes_weight: WEIGHTS.reaction,
    })),
    ...comments.map((row) => ({
      event_type: 'comment',
      event_id: row.id,
      post_id: row.post_id,
      post_title: row.post_title,
      occurred_at: eventTime(row),
      value: 1,
      duration_seconds: '',
      traffic_source: '',
      detail: '',
      wes_weight: WEIGHTS.comment,
    })),
    ...remixes.map((row) => ({
      event_type: 'remix',
      event_id: row.id,
      post_id: row.remix_of,
      post_title: row.original_title,
      occurred_at: eventTime(row),
      value: 1,
      duration_seconds: '',
      traffic_source: '',
      detail: row.id,
      wes_weight: WEIGHTS.remix,
    })),
  ].sort((a, b) => String(a.occurred_at).localeCompare(String(b.occurred_at)));
}

function csvCell(value) {
  const text = String(value ?? '');
  if (!/[",\n\r]/.test(text)) return text;
  return `"${text.replaceAll('"', '""')}"`;
}

export function toCsv(rows, columns = WES_EXPORT_COLUMNS) {
  return [
    columns.join(','),
    ...rows.map((row) => columns.map((column) => csvCell(row[column])).join(',')),
  ].join('\n');
}

function parseCsvLine(line) {
  const cells = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
      continue;
    }
    if (char === '"') {
      quoted = !quoted;
      continue;
    }
    if (char === ',' && !quoted) {
      cells.push(cell);
      cell = '';
      continue;
    }
    cell += char;
  }

  cells.push(cell);
  return cells;
}

function monthBounds(month) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month ?? '')) return null;
  const [year, monthNumber] = month.split('-').map(Number);
  return {
    start: Date.UTC(year, monthNumber - 1, 1),
    end: Date.UTC(year, monthNumber, 1),
  };
}

export function validateWesExportCsv(csv, { month, columns = WES_EXPORT_COLUMNS } = {}) {
  const lines = String(csv ?? '').trimEnd().split(/\r?\n/);
  const headers = lines[0] ? parseCsvLine(lines[0]) : [];
  const errors = [];
  const missingColumns = columns.filter((column) => !headers.includes(column));
  const occurredAtIndex = headers.indexOf('occurred_at');
  const bounds = monthBounds(month);

  if (missingColumns.length) {
    errors.push(`Missing columns: ${missingColumns.join(', ')}`);
  }

  const rows = lines.slice(1).filter((line) => line.length > 0);
  if (bounds && occurredAtIndex >= 0) {
    rows.forEach((line, index) => {
      const occurredAt = parseCsvLine(line)[occurredAtIndex];
      const time = Date.parse(occurredAt);
      if (!Number.isFinite(time) || time < bounds.start || time >= bounds.end) {
        errors.push(`Row ${index + 1} occurred_at is outside ${month}`);
      }
    });
  }

  return {
    ok: errors.length === 0,
    rowCount: rows.length,
    errors,
  };
}
