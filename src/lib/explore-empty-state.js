const COPY = {
  default: {
    title: '아직 올라온 앱이 없어요',
    body: '첫 번째 앱 URL을 올려서 바로 체험 가능한 피드를 시작해 보세요.',
    actionLabel: '앱 올리기',
    actionHref: '/upload',
  },
  search: {
    title: (value) => `"${value}" 검색 결과가 없어요`,
    body: '태그나 앱 제목을 조금 다르게 입력해 보세요.',
    actionLabel: '검색 지우기',
  },
  category: {
    title: (value) => `${value} 앱이 아직 없어요`,
    body: '다른 카테고리를 보거나 첫 번째 앱을 올려 보세요.',
    actionLabel: '카테고리 해제',
  },
  tag: {
    title: (value) => `#${value} 태그 앱이 아직 없어요`,
    body: '다른 태그를 보거나 관련 앱을 먼저 올려 보세요.',
    actionLabel: '태그 해제',
  },
};

export function getExploreEmptyState({ mode = 'default', query = '', label = '' } = {}) {
  const copy = COPY[mode] ?? COPY.default;
  const value = (mode === 'search' ? query : label).trim();
  return {
    title: typeof copy.title === 'function' ? copy.title(value) : copy.title,
    body: copy.body,
    actionLabel: copy.actionLabel,
    actionHref: copy.actionHref,
  };
}
