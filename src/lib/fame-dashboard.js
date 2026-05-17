export function getAverageExperienceMinutes(stats) {
  const sessions = Number(stats?.sessions ?? 0);
  if (sessions <= 0) return 0;
  return Number((Number(stats?.minutes ?? 0) / sessions).toFixed(1));
}

export function buildFameMetrics(stats) {
  return [
    { key: 'sessions', label: '체험 수', value: stats.sessions, suffix: '회' },
    { key: 'avgMinutes', label: '평균 체험 시간', value: getAverageExperienceMinutes(stats), suffix: '분' },
    { key: 'reactions', label: '반응', value: stats.reactions, suffix: '개' },
    { key: 'comments', label: '댓글', value: stats.comments, suffix: '개' },
    { key: 'saves', label: '저장', value: stats.saves, suffix: '회' },
    { key: 'shares', label: '공유', value: stats.shares, suffix: '회' },
    { key: 'remixes', label: '리믹스', value: stats.remixes, suffix: '개' },
  ];
}
