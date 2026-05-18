export type ExploreEmptyMode = 'default' | 'search' | 'category' | 'tag';

export type ExploreEmptyState = {
  title: string;
  body: string;
  actionLabel: string;
  actionHref?: string;
};

export function getExploreEmptyState(input?: {
  mode?: ExploreEmptyMode;
  query?: string;
  label?: string;
}): ExploreEmptyState;
