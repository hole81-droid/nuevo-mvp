const VALID_STATUSES = new Set(['pending', 'pass', 'fail']);

export function getInitialQaProgress(items = []) {
  return Object.fromEntries(
    items.map((item) => [item.id, { status: 'pending', note: '' }]),
  );
}

export function setQaItemStatus(progress, itemId, status, note = '') {
  const safeStatus = VALID_STATUSES.has(status) ? status : 'pending';
  return {
    ...progress,
    [itemId]: {
      status: safeStatus,
      note,
    },
  };
}

export function summarizeQaProgress(items = [], progress = {}) {
  const summary = {
    total: items.length,
    pass: 0,
    fail: 0,
    pending: 0,
    complete: 0,
    completionPercent: 0,
  };

  for (const item of items) {
    const status = progress[item.id]?.status ?? 'pending';
    if (status === 'pass') summary.pass += 1;
    else if (status === 'fail') summary.fail += 1;
    else summary.pending += 1;
  }

  summary.complete = summary.pass + summary.fail;
  summary.completionPercent = summary.total
    ? Math.round((summary.complete / summary.total) * 100)
    : 0;
  return summary;
}

export function buildQaProgressReport(items = [], progress = {}, { generatedAt = new Date().toISOString() } = {}) {
  return {
    generatedAt,
    summary: summarizeQaProgress(items, progress),
    items: items.map((item) => ({
      ...item,
      status: progress[item.id]?.status ?? 'pending',
      note: progress[item.id]?.note ?? '',
    })),
  };
}

function markdownCell(value) {
  return String(value ?? '')
    .replaceAll('|', '\\|')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildQaMarkdownReport(items = [], progress = {}, { generatedAt = new Date().toISOString() } = {}) {
  const summary = summarizeQaProgress(items, progress);
  const releaseGate = getMvpReleaseGate(items, progress);
  const rows = items.map((item) => {
    const itemProgress = progress[item.id] ?? { status: 'pending', note: '' };
    return `| ${markdownCell(item.title ?? item.id)} | ${markdownCell(item.area)} | ${markdownCell(itemProgress.status)} | ${markdownCell(itemProgress.note)} |`;
  });

  return [
    '# nuevo MVP QA Report',
    '',
    `Generated: ${generatedAt}`,
    `Release gate: ${releaseGate.status.toUpperCase()} - ${releaseGate.message}`,
    '',
    `Summary: ${summary.pass} pass / ${summary.fail} fail / ${summary.pending} pending (${summary.completionPercent}%)`,
    '',
    '| Item | Area | Status | Note |',
    '| --- | --- | --- | --- |',
    ...rows,
    '',
  ].join('\n');
}

export function filterQaItemsByStatus(items = [], progress = {}, status = 'all') {
  if (status === 'all') return items;
  if (status === 'evidence-missing') {
    return items.filter((item) => (
      item.evidenceRequired &&
      (progress[item.id]?.status ?? 'pending') === 'pass' &&
      !String(progress[item.id]?.note ?? '').trim()
    ));
  }
  return items.filter((item) => (progress[item.id]?.status ?? 'pending') === status);
}

export function getMvpReleaseGate(items = [], progress = {}) {
  const summary = summarizeQaProgress(items, progress);
  if (summary.fail > 0) {
    return { status: 'blocked', message: `${summary.fail} QA item(s) failed.` };
  }
  if (summary.pending > 0) {
    return { status: 'blocked', message: `${summary.pending} QA item(s) still pending.` };
  }
  const missingEvidence = items.filter((item) => (
    item.evidenceRequired &&
    (progress[item.id]?.status ?? 'pending') === 'pass' &&
    !String(progress[item.id]?.note ?? '').trim()
  )).length;
  if (missingEvidence > 0) {
    return { status: 'blocked', message: `${missingEvidence} QA evidence note(s) missing.` };
  }
  return { status: 'ready', message: 'All MVP QA items passed.' };
}

export function importQaProgressReport(items = [], reportText = '') {
  const initial = getInitialQaProgress(items);
  const knownIds = new Set(items.map((item) => item.id));

  try {
    const report = JSON.parse(reportText);
    if (!Array.isArray(report?.items)) {
      throw new Error('Missing items');
    }

    let imported = 0;
    const progress = { ...initial };
    for (const item of report.items) {
      if (!knownIds.has(item?.id)) continue;
      const status = VALID_STATUSES.has(item.status) ? item.status : 'pending';
      progress[item.id] = {
        status,
        note: String(item.note ?? ''),
      };
      imported += 1;
    }

    return { ok: true, imported, progress, error: '' };
  } catch {
    return {
      ok: false,
      imported: 0,
      progress: initial,
      error: 'Invalid QA report JSON.',
    };
  }
}
