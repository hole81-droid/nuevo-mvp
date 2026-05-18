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
  steps: string[];
  evidenceHint: string;
  passCriteria: string;
};

export const MVP_QA_CHECKLIST: MvpQaChecklistItem[];

export function getMvpQaChecklistByArea(
  area: MvpQaArea,
  checklist?: MvpQaChecklistItem[],
): MvpQaChecklistItem[];

export function getMvpQaSummary(
  checklist?: MvpQaChecklistItem[],
): { total: number; byArea: Partial<Record<MvpQaArea, number>> };

export function buildMvpQaTargetUrl(
  route?: string,
  target?: {
    baseUrl?: string;
    creatorHandle?: string;
    appSlug?: string;
    postId?: string;
    month?: string;
  },
): string;

export function getDefaultMvpQaTarget(
  options?: { month?: string },
): {
  baseUrl: string;
  creatorHandle: string;
  appSlug: string;
  postId: string;
  month: string;
};

export function normalizeMvpQaTarget(
  target?: unknown,
  options?: { month?: string },
): ReturnType<typeof getDefaultMvpQaTarget>;
