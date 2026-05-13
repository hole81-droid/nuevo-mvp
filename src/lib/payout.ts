export const MIN_PAYOUT_KRW = 10_000;

export type PayoutEligibility =
  | { eligible: true; reason: null }
  | { eligible: false; reason: string };

export function getPayoutEligibility(amountKrw: number, existingRequestStatus?: string | null): PayoutEligibility {
  if (existingRequestStatus && existingRequestStatus !== 'rejected') {
    return { eligible: false, reason: '이미 이번 달 정산 요청이 접수되어 있어요.' };
  }

  if (amountKrw < MIN_PAYOUT_KRW) {
    return { eligible: false, reason: `최소 정산 금액은 ${MIN_PAYOUT_KRW.toLocaleString()}원입니다.` };
  }

  return { eligible: true, reason: null };
}
