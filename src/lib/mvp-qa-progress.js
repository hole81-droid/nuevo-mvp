import { validateWesExportCsv } from './wes-export.js';
import { buildMvpQaTargetUrl } from './mvp-qa-checklist.js';

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

export function buildQaProgressReport(items = [], progress = {}, { generatedAt = new Date().toISOString(), target = null } = {}) {
  return {
    generatedAt,
    ...(target ? { target } : {}),
    summary: summarizeQaProgress(items, progress),
    items: items.map((item) => ({
      ...item,
      ...(target ? { targetUrl: buildMvpQaTargetUrl(item.route ?? '', target) } : {}),
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

function markdownLinkLabel(value) {
  return String(value ?? '')
    .replaceAll('[', '\\[')
    .replaceAll(']', '\\]')
    .trim();
}

function markdownLinkUrl(value) {
  return String(value ?? '')
    .replaceAll(')', '%29')
    .trim();
}

export function buildQaMarkdownReport(items = [], progress = {}, { generatedAt = new Date().toISOString(), target = null } = {}) {
  const summary = summarizeQaProgress(items, progress);
  const releaseGate = getMvpReleaseGate(items, progress);
  const rows = items.map((item) => {
    const itemProgress = progress[item.id] ?? { status: 'pending', note: '' };
    const targetUrl = target ? buildMvpQaTargetUrl(item.route ?? '', target) : '';
    return `| ${markdownCell(item.title ?? item.id)} | ${markdownCell(item.area)} | ${markdownCell(itemProgress.status)} | ${markdownCell(targetUrl)} | ${markdownCell(item.passCriteria ?? '')} | ${markdownCell(itemProgress.note)} |`;
  });

  return [
    '# nuevo MVP QA Report',
    '',
    `Generated: ${generatedAt}`,
    `Release gate: ${releaseGate.status.toUpperCase()} - ${releaseGate.message}`,
    '',
    `Summary: ${summary.pass} pass / ${summary.fail} fail / ${summary.pending} pending (${summary.completionPercent}%)`,
    '',
    '| Item | Area | Status | Target URL | Pass Criteria | Note |',
    '| --- | --- | --- | --- | --- | --- |',
    ...rows,
    '',
  ].join('\n');
}

export function buildQaTargetLinksMarkdown(items = [], target = {}) {
  return [
    '# nuevo MVP QA Target Links',
    '',
    ...items.map((item) => {
      const targetUrl = buildMvpQaTargetUrl(item.route ?? '', target);
      return `- [${markdownLinkLabel(item.title ?? item.id)}](${markdownLinkUrl(targetUrl)}) \`${markdownCell(item.area ?? '')}\``;
    }),
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

    return {
      ok: true,
      imported,
      progress,
      ...(report.target && typeof report.target === 'object' ? { target: report.target } : {}),
      error: '',
    };
  } catch {
    return {
      ok: false,
      imported: 0,
      progress: initial,
      error: 'Invalid QA report JSON.',
    };
  }
}

function lcpItemIdForPath(path = '') {
  return String(path).includes('autoplay=true') ? 'lcp-autoplay' : 'lcp-detail';
}

function formatLcpNote(check = {}) {
  const lcpMs = typeof check.lcpMs === 'number' ? `${check.lcpMs}ms` : 'not captured';
  const targetMs = typeof check.targetMs === 'number' ? `${check.targetMs}ms` : 'unknown';
  const failedRequestCount = Number(check.failedRequestCount ?? 0);
  const exceptionCount = Number(check.exceptionCount ?? 0);
  const iframeText = check.autoplayIframeMounted === false ? 'missing' : 'ok';
  const reasons = Array.isArray(check.reasons) && check.reasons.length
    ? ` Reasons: ${check.reasons.join('; ')}`
    : '';

  return `Mobile LCP import: ${check.path ?? 'unknown path'} - LCP ${lcpMs} / target ${targetMs}; network failures: ${failedRequestCount}; runtime exceptions: ${exceptionCount}; autoplay iframe: ${iframeText}.${reasons}`;
}

export function importMobileLcpQaReport(items = [], progress = {}, reportText = '') {
  const knownIds = new Set(items.map((item) => item.id));

  try {
    const report = JSON.parse(reportText);
    const checks = report?.summary?.checks;
    if (!Array.isArray(checks)) {
      throw new Error('Missing summary checks');
    }

    let imported = 0;
    const nextProgress = { ...progress };
    for (const check of checks) {
      const itemId = lcpItemIdForPath(check?.path);
      if (!knownIds.has(itemId)) continue;
      nextProgress[itemId] = {
        status: check.status === 'pass' ? 'pass' : 'fail',
        note: formatLcpNote(check),
      };
      imported += 1;
    }

    return { ok: true, imported, progress: nextProgress, error: '' };
  } catch {
    return {
      ok: false,
      imported: 0,
      progress,
      error: 'Invalid mobile LCP QA JSON.',
    };
  }
}

function isValidMonth(month = '') {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(month);
}

function wesErrorsForType(errors = [], type) {
  if (type === 'columns') return errors.filter((error) => String(error).startsWith('Missing columns:'));
  return errors.filter((error) => String(error).includes('occurred_at is outside'));
}

function formatWesNote({ month, rowCount, type, errors }) {
  const label = type === 'columns' ? 'columns' : 'month filter';
  const status = errors.length ? 'failed' : 'ok';
  const detail = errors.length ? ` Errors: ${errors.join('; ')}` : '';
  return `WES CSV import: month ${month}; rows ${rowCount}; ${label} ${status}.${detail}`;
}

export function importWesExportCsvQa(items = [], progress = {}, csv = '', month = '') {
  if (!isValidMonth(month)) {
    return {
      ok: false,
      imported: 0,
      progress,
      error: 'Enter a valid YYYY-MM month before importing WES CSV.',
    };
  }

  const knownIds = new Set(items.map((item) => item.id));
  const validation = validateWesExportCsv(csv, { month });
  const nextProgress = { ...progress };
  let imported = 0;

  if (knownIds.has('wes-live-columns')) {
    const errors = wesErrorsForType(validation.errors, 'columns');
    nextProgress['wes-live-columns'] = {
      status: errors.length ? 'fail' : 'pass',
      note: formatWesNote({ month, rowCount: validation.rowCount, type: 'columns', errors }),
    };
    imported += 1;
  }

  if (knownIds.has('wes-live-month')) {
    const errors = wesErrorsForType(validation.errors, 'month');
    nextProgress['wes-live-month'] = {
      status: errors.length ? 'fail' : 'pass',
      note: formatWesNote({ month, rowCount: validation.rowCount, type: 'month', errors }),
    };
    imported += 1;
  }

  return { ok: true, imported, progress: nextProgress, error: '' };
}
