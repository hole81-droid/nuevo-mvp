export type MvpQaArea = 'external-deeplink' | 'mobile-lcp' | 'wes-export' | 'visual-review';

export type MvpQaChecklistItem = {
  id: string;
  area: MvpQaArea;
  source: string;
  title: string;
  route: string;
  expected: string;
  requiresLiveData: boolean;
  evidenceRequired: boolean;
};

export const MVP_QA_CHECKLIST: MvpQaChecklistItem[];

export function getMvpQaChecklistByArea(
  area: MvpQaArea,
  checklist?: MvpQaChecklistItem[],
): MvpQaChecklistItem[];

export function getMvpQaSummary(
  checklist?: MvpQaChecklistItem[],
): { total: number; byArea: Partial<Record<MvpQaArea, number>> };
