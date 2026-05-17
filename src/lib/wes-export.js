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
