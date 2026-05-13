'use client';

import { useState, useRef, RefObject } from 'react';
import { Comment } from '@/lib/types';

const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'c1',
    author: { id: 'yejin', displayName: '예진', handle: 'yejin_ai', avatarEmoji: '🦊', avatarBg: '#EEFAD6', followerCount: 0 },
    text: '어제 회의록 넣었더니 저 혼자 울었어요 ㅠ ㅋㅋㅋㅋ 너무 공감',
    createdAt: '1시간',
    likes: 34,
  },
  {
    id: 'c2',
    author: { id: 'jaewon', displayName: '재원', handle: 'jaewon_exp', avatarEmoji: '⚗️', avatarBg: '#F7F0E6', followerCount: 0 },
    text: '이거 리믹스해서 긍정적인 버전 만들면 어떨까요? 반전 감동 밈',
    createdAt: '2시간',
    likes: 12,
  },
  {
    id: 'c3',
    author: { id: 'jisu', displayName: '지수', handle: 'jisu_art', avatarEmoji: '🐧', avatarBg: '#EEF0FF', followerCount: 0 },
    text: '팀장님 말씀: "이건 그냥 생각해본 건데요" → 결과물이 너무 정확함',
    createdAt: '3시간',
    likes: 67,
  },
];

interface Props {
  initialComments?: Comment[];
  inputRef?: RefObject<HTMLInputElement | null>;
}

export default function CommentSection({ initialComments = INITIAL_COMMENTS, inputRef }: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [input, setInput] = useState('');
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const localInputRef = useRef<HTMLInputElement>(null);
  const activeInputRef = inputRef ?? localInputRef;

  const replyTo = (handle: string) => {
    setInput(`@${handle} `);
    activeInputRef.current?.focus();
  };

  const handleSubmit = () => {
    const text = input.trim();
    if (!text) return;
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      author: { id: 'me', displayName: '나', handle: 'me', avatarEmoji: '😸', avatarBg: '#FFF0EA', followerCount: 0 },
      text,
      createdAt: '방금',
      likes: 0,
    };
    setComments((prev) => [...prev, newComment]);
    setInput('');
  };

  const toggleLike = (id: string) => {
    const wasLiked = likedIds.has(id);
    setLikedIds((prev) => {
      const next = new Set(prev);
      wasLiked ? next.delete(id) : next.add(id);
      return next;
    });
    setComments((prev) => prev.map((c) =>
      c.id === id ? { ...c, likes: c.likes + (wasLiked ? -1 : 1) } : c
    ));
  };

  return (
    <>
      {/* Comment list */}
      <div className="border-t border-gray-100">
        <div className="px-4 py-3 text-[15px] font-semibold text-gray-900">
          댓글 {comments.length}개
        </div>
        {comments.map((comment) => (
          <div key={comment.id} className="px-4 py-3 border-b border-gray-100 flex gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
              style={{ backgroundColor: comment.author.avatarBg }}
            >
              {comment.author.avatarEmoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-[14px] text-gray-900">{comment.author.displayName}</span>
                <span className="text-[13px] text-gray-500">@{comment.author.handle}</span>
                <span className="text-[12px] text-gray-400">· {comment.createdAt}</span>
              </div>
              <p className="mt-0.5 text-[14px] text-gray-800 leading-normal">{comment.text}</p>
              <div className="mt-1.5 flex items-center gap-3 text-gray-400">
                <button
                  onClick={() => toggleLike(comment.id)}
                  className={`flex items-center gap-1 text-[13px] transition-colors ${likedIds.has(comment.id) ? 'text-red-500' : 'hover:text-red-400'}`}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill={likedIds.has(comment.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  {comment.likes > 0 && comment.likes}
                </button>
                <button
                  onClick={() => replyTo(comment.author.handle)}
                  className="text-[12px] text-gray-400 hover:text-gray-600 transition-colors"
                >
                  답글 달기
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input bar */}
      <div className="sticky bottom-0 border-t border-gray-100 bg-white px-4 py-2.5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sm flex-shrink-0">😸</div>
        <input
          ref={activeInputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="댓글 달기..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-[14px] text-gray-800 placeholder-gray-400 outline-none"
        />
        {input.trim() && (
          <button
            onClick={handleSubmit}
            className="text-[14px] font-bold text-warm"
          >
            게시
          </button>
        )}
      </div>
    </>
  );
}
