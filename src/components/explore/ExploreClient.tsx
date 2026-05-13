'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { mockPosts } from '@/lib/mock-data';
import { Post } from '@/lib/types';
import PostCard from '@/components/post/PostCard';
import { useFollow } from '@/contexts/FollowContext';
import NuevoGlyph from '@/components/ui/NuevoGlyph';

const TRENDING_TAGS = [
  '직장인', '고양이', '철학', '밈생성', '전생', '시',
  'GPT-4o', 'Claude', 'Udio', 'Midjourney', '서울', 'ASMR',
];

function fmt(n: number) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}만`;
  if (n >= 1000)  return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

/* ── Mini thumbnail used in section lists ── */
function PostThumb({ post, rank }: { post: Post; rank?: number }) {
  return (
    <div
      className="relative w-[58px] h-[58px] rounded-[22px] flex items-center justify-center flex-shrink-0 bg-[#FFFDF5] border-2 border-[#D8D8D0] overflow-hidden"
    >
      <NuevoGlyph kind={post.contentType} size={38} />

      {/* Content type badge */}
      {post.contentType === 'interactive' && (
        <div className="absolute bottom-1 right-1 w-[18px] h-[18px] rounded-full bg-black flex items-center justify-center">
          <svg width="8" height="8" viewBox="0 0 10 10" fill="white"><path d="M3 1.5l5 3.5-5 3.5z"/></svg>
        </div>
      )}
      {post.contentType === 'audio' && (
        <div className="absolute bottom-1 right-1 w-[18px] h-[18px] rounded-full bg-black flex items-center justify-center">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/></svg>
        </div>
      )}

      {/* Rank badge */}
      {rank !== undefined && (
        <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-black flex items-center justify-center">
          <span className="text-[10px] font-black text-white">{rank + 1}</span>
        </div>
      )}
    </div>
  );
}

/* ── Row item in a list section ── */
function PostListRow({
  post, rank, expanded, onToggle,
}: {
  post: Post; rank?: number; expanded: boolean; onToggle: () => void;
}) {
  if (expanded) {
    return (
      <PostCard post={post} expanded onToggle={onToggle} />
    );
  }
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-[#EFEFE8] transition-colors"
    >
      <PostThumb post={post} rank={rank} />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[14px] text-gray-900 leading-tight truncate pr-1">{post.title}</div>
        <div className="text-[12px] text-gray-500 mt-0.5">@{post.author.handle}</div>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-[11px] text-black font-black flex items-center gap-1">
            <svg width="9" height="9" viewBox="0 0 10 10" fill="currentColor"><path d="M3 1.5l5 3.5-5 3.5z"/></svg>
            {fmt(post.stats.experienceSessions)}회 체험
          </span>
          <span className="text-[11px] text-gray-400">❤ {fmt(post.stats.likes)}</span>
          {post.tags?.[0] && (
            <span className="text-[11px] text-gray-400">#{post.tags[0]}</span>
          )}
        </div>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-gray-300 flex-shrink-0">
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </button>
  );
}

/* ── Section wrapper ── */
function Section({
  title, posts, expandedId, onToggle, showRank = false,
}: {
  title: string; posts: Post[]; expandedId: string | null;
  onToggle: (id: string) => void; showRank?: boolean;
}) {
  if (!posts.length) return null;
  return (
    <section className="mt-5">
      <div className="px-4 mb-1">
        <h2 className="text-[16px] font-black tracking-[-0.04em] text-gray-900">{title}</h2>
      </div>
      <div className="divide-y divide-gray-50">
        {posts.map((p, i) => (
          <PostListRow
            key={p.id}
            post={p}
            rank={showRank ? i : undefined}
            expanded={expandedId === p.id}
            onToggle={() => onToggle(p.id)}
          />
        ))}
      </div>
    </section>
  );
}

/* ── Image grid section ── */
function ImageSection({ posts, expandedId, onToggle }: {
  posts: Post[]; expandedId: string | null; onToggle: (id: string) => void;
}) {
  if (!posts.length) return null;
  return (
    <section className="mt-5">
      <div className="px-4 mb-1">
        <h2 className="text-[16px] font-black tracking-[-0.04em] text-gray-900">이미지</h2>
      </div>
      <div className="grid grid-cols-2 gap-px bg-gray-100">
        {posts.map((post) => (
          expandedId === post.id
            ? (
              <div key={post.id} className="col-span-2 bg-white">
                <PostCard post={post} expanded onToggle={() => onToggle(post.id)} />
              </div>
            )
            : (
              <button
                key={post.id}
                onClick={() => onToggle(post.id)}
                className="bg-white text-left"
              >
                <div className="aspect-video flex items-center justify-center bg-[#F7F7F2] border-b border-[#D8D8D0] relative">
                  <NuevoGlyph kind="image" size={58} />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/70 backdrop-blur-sm text-[10px] font-semibold text-gray-600">
                    1/{post.media.imageCount ?? 1}
                  </div>
                </div>
                <div className="px-2.5 pt-2 pb-2.5">
                  <div className="text-[12px] font-semibold text-gray-800 leading-tight line-clamp-2">{post.title}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">@{post.author.handle}</div>
                </div>
              </button>
            )
        ))}
      </div>
    </section>
  );
}

/* ── Empty state ── */
function EmptyState({ query }: { query?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-8">
      <div className="mb-4"><NuevoGlyph kind="search" size={64} /></div>
      <div className="text-[16px] font-bold text-gray-900 mb-1">
        {query ? `"${query}" 검색 결과 없음` : '작품이 없어요'}
      </div>
      <div className="text-[14px] text-gray-500">다른 검색어나 태그를 시도해 보세요</div>
    </div>
  );
}

const PARTNER_BADGE: Record<string, string> = {
  seedling: '✦', growth: '✦✦', pro: '✦✦✦', champion: '✦✦✦✦',
};
const PARTNER_COLOR: Record<string, string> = {
  seedling: 'text-emerald-500', growth: 'text-blue-500',
  pro: 'text-purple-500', champion: 'text-amber-500',
};

function CreatorSection({ posts }: { posts: Post[] }) {
  const { isFollowing, toggle } = useFollow();
  const creators = Array.from(
    new Map(posts.map((post) => [post.author.id, post.author])).values(),
  );

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between px-4 mb-2.5">
        <h2 className="text-[16px] font-black tracking-[-0.04em] text-gray-900">지금 팔로우할 창작자</h2>
        <Link href="/leaderboard" className="text-[12px] text-black font-black">전체 보기</Link>
      </div>
      <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide pb-1">
        {creators.map((author) => {
          const followed = isFollowing(author.id);
          const postCount = posts.filter((p) => p.author.id === author.id).length;
          return (
            <div
              key={author.id}
              className="flex-shrink-0 w-[130px] flex flex-col items-center p-3 rounded-[28px] bg-[#F7F7F2] border-2 border-[#D8D8D0]"
            >
              <Link href={`/profile/${author.handle}`}>
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 border-white shadow-sm mb-1.5"
                  style={{ backgroundColor: author.avatarBg }}
                >
                  {author.avatarEmoji}
                </div>
              </Link>
              <div className="text-[13px] font-bold text-gray-900 text-center truncate w-full px-1">
                {author.displayName}
              </div>
              {author.partnerTier && (
                <div className={`text-[10px] font-semibold ${PARTNER_COLOR[author.partnerTier]}`}>
                  {PARTNER_BADGE[author.partnerTier]} {author.partnerTier === 'champion' ? '챔피언' : author.partnerTier === 'pro' ? '프로' : author.partnerTier === 'growth' ? '성장' : '새싹'}
                </div>
              )}
              <div className="text-[11px] text-gray-400 mt-0.5">{postCount}개 작품</div>
              <button
                onClick={() => toggle(author.id)}
                className={`mt-2 w-full py-1.5 rounded-full text-[12px] font-bold transition-all active:scale-95 ${
                  followed
                    ? 'border border-gray-200 text-gray-500 bg-white'
                    : 'bg-gray-900 text-white'
                }`}
              >
                {followed ? '팔로잉' : '팔로우'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   Main ExploreClient
══════════════════════════════════════════════ */
export default function ExploreClient({ posts = mockPosts }: { posts?: Post[] }) {
  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  const isSearching = query.trim().length > 0;
  const isTagFiltering = !isSearching && selectedTag !== null;

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.author.handle.toLowerCase().includes(q) ||
        p.author.displayName.toLowerCase().includes(q) ||
        (p.tags ?? []).some((t) => t.toLowerCase().includes(q))
    );
  }, [posts, query]);

  const tagResults = useMemo(
    () => (!selectedTag ? [] : posts.filter((p) => (p.tags ?? []).includes(selectedTag))),
    [posts, selectedTag]
  );

  const hotPosts = useMemo(
    () => [...posts]
      .filter((p) => p.contentType === 'interactive' || p.contentType === 'audio')
      .sort((a, b) => b.stats.experienceSessions - a.stats.experienceSessions)
      .slice(0, 5),
    [posts],
  );

  const interactivePosts = posts.filter((p) => p.contentType === 'interactive');
  const audioPosts = posts.filter((p) => p.contentType === 'audio');
  const imagePosts = posts.filter((p) => p.contentType === 'image');

  return (
    <>
      {/* Search bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-2.5">
        <div className="flex items-center gap-3 bg-gray-100 rounded-full px-4 py-2.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-gray-400 flex-shrink-0">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            className="flex-1 bg-transparent text-[15px] text-gray-700 placeholder-gray-400 outline-none"
            placeholder="작품, 창작자, 태그 검색"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedTag(null); setExpandedId(null); }}
          />
          {query && (
            <button onClick={() => { setQuery(''); setExpandedId(null); }} className="text-gray-400 hover:text-gray-600">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          )}
        </div>
      </header>

      {/* ── Search results ── */}
      {isSearching && (
        <div className="flex-1 overflow-y-auto pb-[54px] scrollbar-hide">
          <div className="px-4 py-3 text-[13px] text-gray-500">
            <span className="font-bold text-gray-900">「{query}」</span> 검색 결과 {searchResults.length}개
          </div>
          {searchResults.length > 0
            ? (
              <div className="divide-y divide-gray-50">
                {searchResults.map((p) => (
                  <PostListRow
                    key={p.id}
                    post={p}
                    expanded={expandedId === p.id}
                    onToggle={() => toggle(p.id)}
                  />
                ))}
              </div>
            )
            : <EmptyState query={query} />
          }
        </div>
      )}

      {/* ── Tag filter results ── */}
      {isTagFiltering && (
        <div className="flex-1 overflow-y-auto pb-[54px] scrollbar-hide">
          <div className="flex items-center gap-2 px-4 py-3">
            <span className="text-[14px] font-bold text-gray-900">#{selectedTag}</span>
            <span className="text-[13px] text-gray-400">{tagResults.length}개 작품</span>
            <button
              onClick={() => { setSelectedTag(null); setExpandedId(null); }}
              className="ml-auto flex items-center gap-1 text-[13px] text-gray-500 hover:text-gray-700"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
              초기화
            </button>
          </div>
          {tagResults.length > 0
            ? (
              <div className="divide-y divide-gray-50">
                {tagResults.map((p) => (
                  <PostListRow
                    key={p.id}
                    post={p}
                    expanded={expandedId === p.id}
                    onToggle={() => toggle(p.id)}
                  />
                ))}
              </div>
            )
            : <EmptyState />
          }
        </div>
      )}

      {/* ── Default explore ── */}
      {!isSearching && !isTagFiltering && (
        <div className="flex-1 overflow-y-auto pb-[54px] scrollbar-hide">

          {/* Trending tags */}
          <div className="px-4 pt-4 pb-1">
            <h2 className="text-[12px] font-black text-gray-400 uppercase tracking-wider mb-2.5">트렌딩 태그</h2>
            <div className="flex flex-wrap gap-2">
              {TRENDING_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => { setSelectedTag(tag); setExpandedId(null); }}
                  className="px-3 py-1.5 rounded-full border border-[#D8D8D0] text-[13px] text-gray-700 font-black hover:border-black hover:text-black hover:bg-[#EFEFE8] active:scale-95 transition-all"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Creators */}
          <CreatorSection posts={posts} />

          {/* 🔥 Hot experience section */}
          <Section
            title="지금 핫한 체험"
            posts={hotPosts}
            expandedId={expandedId}
            onToggle={toggle}
            showRank
          />

          {/* Interactive */}
          <Section
            title="▶ 인터랙티브"
            posts={interactivePosts}
            expandedId={expandedId}
            onToggle={toggle}
          />

          {/* Audio */}
          <Section
            title="♪ 오디오"
            posts={audioPosts}
            expandedId={expandedId}
            onToggle={toggle}
          />

          {/* Images */}
          <ImageSection
            posts={imagePosts}
            expandedId={expandedId}
            onToggle={toggle}
          />

          <div className="h-6" />
        </div>
      )}
    </>
  );
}
