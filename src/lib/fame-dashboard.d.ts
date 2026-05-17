export type FameMetric = {
  key: string;
  label: string;
  value: number;
  suffix: string;
};

export function getAverageExperienceMinutes(stats: { sessions: number; minutes: number }): number;

export function buildFameMetrics(stats: {
  sessions: number;
  minutes: number;
  reactions: number;
  comments: number;
  remixes: number;
  saves: number;
  shares: number;
}): FameMetric[];
