export const WES_EXPORT_COLUMNS: string[];

export function buildWesEventRows(input?: {
  experiences?: Array<Record<string, unknown>>;
  reactions?: Array<Record<string, unknown>>;
  comments?: Array<Record<string, unknown>>;
  remixes?: Array<Record<string, unknown>>;
}): Array<Record<string, string | number>>;

export function toCsv(rows: Array<Record<string, unknown>>, columns?: string[]): string;
