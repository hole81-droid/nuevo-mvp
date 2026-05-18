const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function getUploadRemixState({ remixPostId, originalPost, hasCheckedOriginal }) {
  if (!remixPostId) {
    return {
      status: 'none',
      canContinue: true,
      title: '',
      message: '',
    };
  }

  if (originalPost) {
    return originalPost.remixable === false
      ? {
          status: 'blocked',
          canContinue: false,
          title: '리믹스가 닫혀 있어요',
          message: '이 작품은 리믹스를 허용하지 않아요. 다른 작품에서 리믹스를 시작해 주세요.',
        }
      : {
          status: 'ready',
          canContinue: true,
          title: '원본 작품 리믹스 중',
          message: '원본 앱을 바탕으로 새 체험을 올립니다.',
        };
  }

  if (!UUID_RE.test(remixPostId)) {
    return {
      status: 'invalid',
      canContinue: false,
      title: '리믹스 링크를 확인해 주세요',
      message: '리믹스 링크가 올바르지 않아요. 원본 상세에서 다시 리믹스를 시작해 주세요.',
    };
  }

  if (!hasCheckedOriginal && !originalPost) {
    return {
      status: 'loading',
      canContinue: false,
      title: '원본 작품 확인 중',
      message: '리믹스할 원본 작품을 불러오고 있어요.',
    };
  }

  if (!originalPost) {
    return {
      status: 'missing',
      canContinue: false,
      title: '원본 작품을 찾을 수 없어요',
      message: '원본 작품을 찾을 수 없어요. 삭제되었거나 더 이상 접근할 수 없는 작품입니다.',
    };
  }

  throw new Error('unreachable upload remix state');
}
