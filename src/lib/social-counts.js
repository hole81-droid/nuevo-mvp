export function mergeSocialCounts(stats, metric) {
  return {
    ...stats,
    replies: Math.max(stats.replies ?? 0, metric?.replies ?? 0),
    saves: Math.max(stats.saves ?? 0, metric?.saves ?? 0),
    shares: Math.max(stats.shares ?? 0, metric?.shares ?? 0),
  };
}
