import { createClient } from '@/lib/supabase/server';
import { monthKey } from '@/lib/wes';
import { buildWesEventRows, toCsv, WES_EXPORT_COLUMNS } from '@/lib/wes-export';

type PostPick = { id: string; title: string };

function monthRange(month: string) {
  const start = new Date(month);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

function titleMap(posts: PostPick[]) {
  return new Map(posts.map((post) => [post.id, post.title]));
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const url = new URL(request.url);
  const month = url.searchParams.get('month') ?? monthKey();
  const { start, end } = monthRange(month);

  const { data: posts } = await supabase
    .from('posts')
    .select('id,title')
    .eq('author_id', user.id);

  const creatorPosts = (posts ?? []) as PostPick[];
  const postIds = creatorPosts.map((post) => post.id);
  const titles = titleMap(creatorPosts);

  if (!postIds.length) {
    return new Response(toCsv([], WES_EXPORT_COLUMNS), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="nuevo-wes-${month}.csv"`,
      },
    });
  }

  const [
    { data: experiences },
    { data: reactions },
    { data: comments },
    { data: remixes },
  ] = await Promise.all([
    supabase
      .from('experience_events')
      .select('id,post_id,started_at,duration_seconds,traffic_source')
      .in('post_id', postIds)
      .gte('started_at', start)
      .lt('started_at', end),
    supabase
      .from('post_reactions')
      .select('post_id,reaction,created_at')
      .in('post_id', postIds)
      .gte('created_at', start)
      .lt('created_at', end),
    supabase
      .from('comments')
      .select('id,post_id,created_at')
      .in('post_id', postIds)
      .gte('created_at', start)
      .lt('created_at', end),
    supabase
      .from('posts')
      .select('id,remix_of,created_at')
      .in('remix_of', postIds)
      .gte('created_at', start)
      .lt('created_at', end),
  ]);

  const rows = buildWesEventRows({
    experiences: ((experiences ?? []) as Array<Record<string, unknown>>).map((row) => ({
      ...row,
      post_title: titles.get(String(row.post_id)) ?? '',
    })),
    reactions: ((reactions ?? []) as Array<Record<string, unknown>>).map((row) => ({
      ...row,
      post_title: titles.get(String(row.post_id)) ?? '',
    })),
    comments: ((comments ?? []) as Array<Record<string, unknown>>).map((row) => ({
      ...row,
      post_title: titles.get(String(row.post_id)) ?? '',
    })),
    remixes: ((remixes ?? []) as Array<Record<string, unknown>>).map((row) => ({
      ...row,
      original_title: titles.get(String(row.remix_of)) ?? '',
    })),
  });

  return new Response(toCsv(rows, WES_EXPORT_COLUMNS), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="nuevo-wes-${month}.csv"`,
    },
  });
}
