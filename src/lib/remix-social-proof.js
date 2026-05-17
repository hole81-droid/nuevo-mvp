export function shouldShowRemixSocialProof(count) {
  return Number(count) > 0;
}

function formatCompactCount(count) {
  if (count >= 10000) return `${(count / 10000).toFixed(1).replace(/\.0$/, '')}만`;
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(count);
}

export function getRemixSocialProofLabel(count) {
  if (!shouldShowRemixSocialProof(count)) return '';
  return `${formatCompactCount(Number(count))}회 리믹스됨`;
}
