export function shouldShowRemixCta(post) {
  return post?.remixable === true && !post?.remixOf;
}

export function getRemixCtaCopy() {
  return {
    title: '이 앱을 더 웃기게 바꿔보세요',
    body: '원본 창작자에게 리믹스 알림이 가고, 새 버전은 피드에 다시 노출돼요.',
    action: '리믹스하기',
  };
}
