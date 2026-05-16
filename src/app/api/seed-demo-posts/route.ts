import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DEMO_SEED_POSTS } from '@/lib/demo-seed-posts';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('users')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile) {
    const fallbackHandle = `user_${user.id.slice(0, 8)}`;
    const { error: profileError } = await supabase.from('users').insert({
      id: user.id,
      email: user.email ?? null,
      handle: fallbackHandle,
      display_name: user.user_metadata?.name ?? '새 창작자',
      avatar_emoji: 'N',
      avatar_bg: '#F7F0E6',
      partner_tier: 'seedling',
    } as never);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }
  }

  const seedUrls = DEMO_SEED_POSTS.map((post) => post.iframeUrl);
  const { data: existingPosts } = await supabase
    .from('posts')
    .select('iframe_url')
    .eq('author_id', user.id)
    .in('iframe_url', seedUrls);

  const existingUrls = new Set((existingPosts ?? []).map((post: { iframe_url: string | null }) => post.iframe_url));
  const postsToInsert = DEMO_SEED_POSTS
    .filter((post) => !existingUrls.has(post.iframeUrl))
    .map((post) => ({
      author_id: user.id,
      title: post.title,
      text: post.text,
      content_type: post.contentType,
      iframe_url: post.iframeUrl,
      cover_emoji: post.coverEmoji,
      bg_gradient: post.bgGradient,
      detail_description: post.detailDescription ?? null,
      tool_used: post.toolUsed ?? null,
      remixable: true,
    }));

  if (!postsToInsert.length) {
    return NextResponse.json({
      created: 0,
      skipped: DEMO_SEED_POSTS.length,
      message: '이미 seed 앱이 모두 생성되어 있어요.',
    });
  }

  const { data: insertedPosts, error } = await supabase
    .from('posts')
    .insert(postsToInsert as never)
    .select('id,title');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    created: insertedPosts?.length ?? 0,
    skipped: DEMO_SEED_POSTS.length - (insertedPosts?.length ?? 0),
    posts: insertedPosts,
  }, { status: 201 });
}
