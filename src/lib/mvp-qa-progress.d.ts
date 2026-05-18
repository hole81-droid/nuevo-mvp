export type QaItemStatus = 'pending' | 'pass' | 'fail';

export type QaItemProgress = {
  status: QaItemStatus;
  note: string;
};

export type QaProgressMap = Record<string, QaItemProgress>;

export function getInitialQaProgress(items?: Array<{ id: string }>): QaProgressMap;

export function setQaItemStatus(
  progress: QaProgressMap,
  itemId: string,
  status: QaItemStatus | string,
  note?: string,
): QaProgressMap;

export function summarizeQaProgress(
  items?: Array<{ id: string }>,
  progress?: QaProgressMap,
): {
  total: number;
  pass: number;
  fail: number;
  pending: number;
  complete: number;
  completionPercent: number;
};

export function buildQaProgressReport(
  items?: Array<Record<string, unknown> & { id: string }>,
  progress?: QaProgressMap,
  options?: { generatedAt?: string; target?: Record<string, string> | null },
): {
  generatedAt: string;
  target?: Record<string, string>;
  summary: ReturnType<typeof summarizeQaProgress>;
  items: Array<Record<string, unknown> & { id: string; status: QaItemStatus; note: string; targetUrl?: string }>;
};

export function buildQaMarkdownReport(
  items?: Array<Record<string, unknown> & { id: string }>,
  progress?: QaProgressMap,
  options?: { generatedAt?: string; target?: Record<string, string> | null },
): string;

export function buildQaTargetLinksMarkdown(
  items?: Array<Record<string, unknown> & { id: string }>,
  target?: Record<string, string>,
): string;

export function filterQaItemsByStatus<T extends { id: string }>(
  items?: T[],
  progress?: QaProgressMap,
  status?: QaItemStatus | 'all' | 'evidence-missing',
): T[];

export function getMvpReleaseGate(
  items?: Array<{ id: string }>,
  progress?: QaProgressMap,
): { status: 'ready' | 'blocked'; message: string };

export function importQaProgressReport(
  items?: Array<{ id: string }>,
  reportText?: string,
): {
  ok: boolean;
  imported: number;
  progress: QaProgressMap;
  target?: Record<string, string>;
  error: string;
};

export function importMobileLcpQaReport(
  items?: Array<{ id: string }>,
  progress?: QaProgressMap,
  reportText?: string,
): {
  ok: boolean;
  imported: number;
  progress: QaProgressMap;
  error: string;
};

export function importWesExportCsvQa(
  items?: Array<{ id: string }>,
  progress?: QaProgressMap,
  csv?: string,
  month?: string,
): {
  ok: boolean;
  imported: number;
  progress: QaProgressMap;
  error: string;
};
