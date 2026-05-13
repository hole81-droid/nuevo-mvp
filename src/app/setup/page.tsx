'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

const AVATARS = ['😸', '🎸', '🌸', '🦊', '⚗️', '🦁', '🎨', '🌊'];
const AVATAR_BGS = ['#FFF0EA', '#EEE9FF', '#FFE8F4', '#EEFAD6', '#F7F0E6', '#E0F0FF'];

export default function SetupPage() {
  const router = useRouter();
  const supabase = createClient();
  const { user, profile, loading, refreshProfile } = useAuth();
  const [handle, setHandle] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarEmoji, setAvatarEmoji] = useState('😸');
  const [avatarBg, setAvatarBg] = useState('#FFF0EA');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) router.replace('/login?next=/setup');
  }, [loading, router, user]);

  useEffect(() => {
    if (!profile) return;
    setHandle(profile.handle.startsWith('user_') ? '' : profile.handle);
    setDisplayName(profile.display_name);
    setBio(profile.bio ?? '');
    setAvatarEmoji(profile.avatar_emoji);
    setAvatarBg(profile.avatar_bg);
  }, [profile]);

  const cleanHandle = handle.toLowerCase().replace(/[^a-z0-9_]/g, '');
  const canSubmit = cleanHandle.length >= 3 && displayName.trim().length >= 1 && !!user;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user || !canSubmit) return;

    setSaving(true);
    setError('');

    const { error: updateError } = await (supabase.from('users') as any)
      .update({
        handle: cleanHandle,
        display_name: displayName.trim(),
        bio: bio.trim() || null,
        avatar_emoji: avatarEmoji,
        avatar_bg: avatarBg,
      })
      .eq('id', user.id);

    if (updateError) {
      setError(updateError.message.includes('duplicate') ? '이미 사용 중인 핸들입니다.' : updateError.message);
      setSaving(false);
      return;
    }

    await refreshProfile();
    router.replace('/');
  };

  return (
    <div className="min-h-full max-w-[430px] mx-auto bg-white flex flex-col">
      <header className="sticky top-0 z-40 h-[53px] px-4 flex items-center justify-center border-b border-gray-100 bg-white">
        <span className="text-[17px] font-bold">프로필 설정</span>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 px-4 py-6 flex flex-col gap-6">
        <div>
          <h1 className="text-[24px] font-black text-gray-950 leading-tight">창작자 프로필을<br />만들어 주세요</h1>
          <p className="mt-2 text-[14px] text-gray-500">업로드와 수익 정산에 사용할 공개 프로필입니다.</p>
        </div>

        <div className="flex items-center gap-4">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-[36px] border-4 border-white shadow"
            style={{ backgroundColor: avatarBg }}
          >
            {avatarEmoji}
          </div>
          <div className="flex-1">
            <div className="text-[13px] font-bold text-gray-700 mb-2">아바타</div>
            <div className="flex flex-wrap gap-1.5">
              {AVATARS.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setAvatarEmoji(emoji)}
                  className={`w-9 h-9 rounded-full text-[19px] border ${avatarEmoji === emoji ? 'border-warm bg-orange-50' : 'border-gray-100 bg-white'}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {AVATAR_BGS.map((color) => (
            <button
              type="button"
              key={color}
              onClick={() => setAvatarBg(color)}
              className={`w-9 h-9 rounded-full border-2 ${avatarBg === color ? 'border-warm' : 'border-white'}`}
              style={{ backgroundColor: color }}
              aria-label={`배경색 ${color}`}
            />
          ))}
        </div>

        <label className="block">
          <span className="text-[13px] font-bold text-gray-700">이름</span>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-[16px] outline-none focus:border-warm"
            placeholder="민수"
          />
        </label>

        <label className="block">
          <span className="text-[13px] font-bold text-gray-700">핸들</span>
          <div className="mt-2 flex items-center rounded-2xl border border-gray-200 px-4 py-3 focus-within:border-warm">
            <span className="text-gray-400">@</span>
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="flex-1 bg-transparent text-[16px] outline-none"
              placeholder="minsu_lab"
            />
          </div>
          <div className="mt-1 text-[12px] text-gray-400">영문 소문자, 숫자, 밑줄만 사용합니다.</div>
        </label>

        <label className="block">
          <span className="text-[13px] font-bold text-gray-700">소개</span>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="mt-2 w-full min-h-24 rounded-2xl border border-gray-200 px-4 py-3 text-[15px] outline-none focus:border-warm resize-none"
            placeholder="이상한 AI 앱을 만드는 사람"
            maxLength={120}
          />
        </label>

        {error && <div className="rounded-2xl bg-red-50 px-4 py-3 text-[13px] text-red-600">{error}</div>}

        <button
          type="submit"
          disabled={!canSubmit || saving}
          className="mt-auto w-full h-14 rounded-2xl bg-warm text-white text-[16px] font-bold disabled:opacity-40 active:scale-[0.98]"
        >
          {saving ? '저장 중...' : '시작하기'}
        </button>
      </form>
    </div>
  );
}
