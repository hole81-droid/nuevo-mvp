export type WesExportMonth = {
  month: string;
  start: string;
  end: string;
  fallbackUsed: boolean;
};

export function getWesExportMonth(value?: string | null, fallback?: string): WesExportMonth;
