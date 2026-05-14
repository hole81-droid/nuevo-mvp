'use client';

import { useEffect, useMemo, useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ContentType, UploadFormData, UploadStep } from '@/lib/types';
import { mockPosts } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { DbPostWithAuthor, mapDbPostToPost } from '@/lib/post-mapper';
import { validateEmbedUrl } from '@/lib/embed-url';
import type { Post } from '@/lib/types';

const INITIAL_FORM: UploadFormData = {
  contentType: null,
  title: '',
  description: '',
  thumbnail: null,
  iframeUrl: '',
  audioFile: null,
  images: [],
  detailedDescription: '',
  tool: '',
  remixable: true,
  promptPublic: false,
  remixOf: '',
};

type UploadIcon = 'interactive' | 'audio' | 'image' | 'thumbnail';

const TYPE_OPTIONS: { type: ContentType; icon: UploadIcon; label: string; desc: string }[] = [
  { type: 'interactive', icon: 'interactive', label: '인터랙티브', desc: '챗봇, 게임, 실험적 인터페이스' },
  { type: 'audio', icon: 'audio', label: '오디오', desc: 'AI 음악, 사운드 실험' },
  { type: 'image', icon: 'image', label: '이미지 / 시리즈', desc: '단일 이미지, 갤러리, 묶음 프로젝트' },
];

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export default function UploadPage() {
  return (
    <Suspense fallback={null}>
      <UploadPageInner />
    </Suspense>
  );
}

function UploadPageInner() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  const remixPostId = searchParams.get('remix');
  const mockOriginalPost = remixPostId ? mockPosts.find((p) => p.id === remixPostId) ?? null : null;
  const [dbOriginalPost, setDbOriginalPost] = useState<Post | null>(null);
  const originalPost = dbOriginalPost ?? mockOriginalPost;

  const [step, setStep] = useState<UploadStep>(1);
  const [form, setForm] = useState<UploadFormData>({
    ...INITIAL_FORM,
    contentType: originalPost?.contentType ?? null,
    remixOf: remixPostId ?? '',
  });
  const [showOptional, setShowOptional] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState('');

  useEffect(() => {
    if (loading || user) return;
    const next = `/upload${remixPostId ? `?remix=${remixPostId}` : ''}`;
    router.replace(`/login?next=${encodeURIComponent(next)}`);
  }, [loading, remixPostId, router, user]);

  useEffect(() => {
    if (!remixPostId || !isUuid(remixPostId)) return;

    const loadOriginal = async () => {
      const { data } = await supabase
        .from('posts')
        .select('*, author:users(*)')
        .eq('id', remixPostId)
        .maybeSingle();

      if (data) {
        const post = mapDbPostToPost(data as DbPostWithAuthor);
        setDbOriginalPost(post);
        setForm((prev) => ({
          ...prev,
          contentType: prev.contentType ?? post.contentType,
          remixOf: remixPostId,
        }));
      }
    };

    loadOriginal();
  }, [remixPostId, supabase]);

  const updateForm = (updates: Partial<UploadFormData>) =>
    setForm((prev) => ({ ...prev, ...updates }));

  const remixBlocked = originalPost?.remixable === false;
  const canProceedStep1 = form.contentType !== null && !remixBlocked;
  const canProceedStep2 =
    form.title.trim().length > 0 &&
    form.description.trim().length > 0 &&
    (form.contentType !== 'interactive' || validateEmbedUrl(form.iframeUrl, { requirePublicUrl: true }).ok);

  const handlePublish = async () => {
    if (!user) {
      const next = `/upload${remixPostId ? `?remix=${remixPostId}` : ''}`;
      router.push(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    setPublishing(true);
    setPublishError('');

    const remixOf = form.remixOf && isUuid(form.remixOf) ? form.remixOf : null;
    const embedUrl = validateEmbedUrl(form.iframeUrl, { requirePublicUrl: true });

    const {
      data: insertedPost,
      error,
    } = await supabase.from('posts').insert({
      author_id: user.id,
      title: form.title.trim(),
      text: form.description.trim(),
      content_type: form.contentType,
      iframe_url: form.contentType === 'interactive' ? embedUrl.normalizedUrl : null,
      cover_emoji: form.contentType === 'audio' ? '🎵' : form.contentType === 'image' ? '🖼️' : '🎮',
      bg_gradient: form.contentType === 'interactive'
        ? 'from-orange-100 to-orange-200'
        : form.contentType === 'audio'
          ? 'from-violet-100 to-violet-200'
          : 'from-pink-100 to-pink-200',
      remixable: form.remixable,
      remix_of: remixOf,
    } as never).select('id').single() as {
      data: { id: string } | null;
      error: { message: string } | null;
    };

    if (error) {
      setPublishError(error.message);
      setPublishing(false);
      return;
    }

    if (remixOf && originalPost && originalPost.author.id !== user.id && insertedPost?.id) {
      await supabase.from('notifications').insert({
        recipient_id: originalPost.author.id,
        type: 'remix',
        actor_id: user.id,
        post_id: remixOf,
        remix_post_id: insertedPost.id,
      } as never);
    }

    setTimeout(() => router.push('/'), 900);
  };

  return (
    <div className="flex flex-col h-full max-w-[430px] mx-auto bg-white">
      {/* Publishing overlay */}
      {publishing && (
        <div className="fixed inset-0 z-[100] bg-[#F7F7F2] flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center shadow-[0_24px_36px_rgba(0,0,0,0.2)] animate-bounce">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="text-[22px] font-bold text-gray-900">게시 완료!</div>
          <div className="text-[14px] text-gray-500">피드에서 확인해보세요</div>
        </div>
      )}
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 flex items-center justify-between px-4 h-[53px]">
        <button onClick={() => (step === 1 ? null : setStep((s) => (s - 1) as UploadStep))} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-700">
          {step === 1 ? (
            <Link href="/">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </Link>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          )}
        </button>
        <span className="text-[17px] font-black tracking-[-0.06em]">UPLOAD</span>
        <span className="text-[14px] text-gray-400 font-medium">{step} / 3</span>
      </header>

      {/* Step indicator */}
      <div className="flex items-center px-6 py-4 gap-0">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold transition-all ${
              step > s ? 'bg-black text-white' : step === s ? 'border-2 border-black text-black bg-[#F7F7F2]' : 'border-2 border-[#D8D8D0] text-[#8A8A84] bg-[#F7F7F2]'
            }`}>
              {step > s ? '✓' : s}
            </div>
            {s < 3 && (
              <div className={`flex-1 h-[2px] mx-1 ${step > s ? 'bg-black' : 'bg-[#D8D8D0]'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Remix origin banner */}
      {originalPost && (
        <div className={`mx-4 mt-3 p-3 rounded-xl border flex items-center gap-3 ${remixBlocked ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 bg-gradient-to-br ${originalPost.media.bgGradient ?? 'from-gray-100 to-gray-200'}`}>
            {originalPost.media.emoji ?? originalPost.media.coverEmoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] text-gray-400 font-medium">원본 작품 리믹스 중</div>
            <div className="text-[13px] font-bold text-gray-900 truncate">{originalPost.title}</div>
            <div className={remixBlocked ? 'text-[11px] text-red-500' : 'text-[11px] text-warm'}>
              {remixBlocked ? '이 작품은 리믹스를 허용하지 않아요' : `@${originalPost.author.handle}`}
            </div>
          </div>
          <div className="text-[20px]">🔁</div>
        </div>
      )}

      {/* Step content */}
      <main className="flex-1 overflow-y-auto scrollbar-hide px-4">
        {step === 1 && (
          <Step1
            selected={form.contentType}
            onSelect={(type) => updateForm({ contentType: type })}
            isRemix={!!originalPost}
          />
        )}
        {step === 2 && (
          <Step2
            form={form}
            updateForm={updateForm}
          />
        )}
        {step === 3 && (
          <Step3
            form={form}
            updateForm={updateForm}
            showOptional={showOptional}
            setShowOptional={setShowOptional}
          />
        )}
      </main>

      {/* Bottom CTA */}
      <div className="px-4 pb-6 pt-3 border-t border-[#DFDFD8] bg-[#F7F7F2]">
        {publishError && (
          <div className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-[13px] text-red-600">
            {publishError}
          </div>
        )}
        {step < 3 ? (
          <button
            disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
            onClick={() => setStep((s) => (s + 1) as UploadStep)}
            className="w-full h-[66px] rounded-full bg-black text-[20px] font-black tracking-[-0.04em] text-white shadow-[0_28px_40px_rgba(0,0,0,0.18)] transition-all active:scale-[0.98] disabled:bg-[#CFCFC7] disabled:shadow-none disabled:cursor-not-allowed"
          >
            다음
          </button>
        ) : (
          <button
            onClick={handlePublish}
            className="w-full h-[66px] rounded-full bg-black text-[20px] font-black tracking-[-0.04em] text-white shadow-[0_28px_40px_rgba(0,0,0,0.18)] transition-all active:scale-[0.98]"
          >
            게시하기
          </button>
        )}
      </div>
    </div>
  );
}

function UploadTypeIcon({ icon, selected, small = false }: { icon: UploadIcon; selected: boolean; small?: boolean }) {
  const sizeClass = small ? 'w-11 h-11 rounded-[18px]' : 'w-16 h-16 rounded-[24px]';
  const stroke = selected ? 'text-white' : 'text-black';

  return (
    <span className={`${sizeClass} flex items-center justify-center flex-shrink-0 border-2 ${
      selected ? 'bg-black border-black' : 'bg-[#FFFDF5] border-[#D8D8D0]'
    } ${stroke}`}>
      {icon === 'interactive' && (
        <svg width={small ? 24 : 34} height={small ? 24 : 34} viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <rect x="8" y="9" width="24" height="18" rx="5" stroke="currentColor" strokeWidth="3" />
          <path d="M17 18.5L22 15.5V21.5L17 18.5Z" fill="currentColor" />
          <path d="M13 32L16 27M27 32L24 27" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
      {icon === 'audio' && (
        <svg width={small ? 24 : 34} height={small ? 24 : 34} viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <path d="M11 24V18M17 29V11M23 26V15M29 22V19" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <path d="M8 20C11 14 14 14 17 20C20 26 23 26 26 20C28 16 30 15 32 17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )}
      {icon === 'image' && (
        <svg width={small ? 24 : 34} height={small ? 24 : 34} viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <rect x="10" y="10" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="3" />
          <path d="M13 27L18 21L22 25L25 22L29 27" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="24.5" cy="15.5" r="2.5" fill="currentColor" />
          <path d="M7 14V8C7 7.44772 7.44772 7 8 7H14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M33 26V32C33 32.5523 32.5523 33 32 33H26" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
      {icon === 'thumbnail' && (
        <svg width={small ? 24 : 34} height={small ? 24 : 34} viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <rect x="9" y="12" width="22" height="17" rx="5" stroke="currentColor" strokeWidth="3" />
          <path d="M15 12L17 8H23L25 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="20" cy="20.5" r="4.5" stroke="currentColor" strokeWidth="3" />
        </svg>
      )}
    </span>
  );
}

/* ─── Step 1: Type selection ─── */
function Step1({ selected, onSelect, isRemix }: { selected: ContentType | null; onSelect: (t: ContentType) => void; isRemix?: boolean }) {
  return (
    <div>
      <h2 className="text-[42px] font-black text-gray-900 mb-3 leading-[0.92] uppercase">
        {isRemix ? <>REMIX<br />AN APP.</> : <>UPLOAD<br />AN APP.</>}
      </h2>
      <p className="mb-8 text-[17px] leading-snug text-gray-500 tracking-[-0.03em]">
        {isRemix ? '원본 앱을 바탕으로 새 체험을 올립니다.' : 'Paste a public URL. Let people play it instantly.'}
      </p>
      <div className="flex flex-col gap-3">
        {TYPE_OPTIONS.map(({ type, icon, label, desc }) => {
          const isSelected = selected === type;
          return (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className={`flex items-center gap-4 p-5 min-h-[86px] rounded-[32px] border-2 text-left transition-all active:scale-[0.98] ${
                isSelected
                  ? 'border-black bg-[#FFFDF5] shadow-[0_18px_34px_rgba(0,0,0,0.08)]'
                  : 'border-[#D8D8D0] bg-[#F7F7F2] hover:border-black/40'
              }`}
            >
              <UploadTypeIcon icon={icon} selected={isSelected} />
              <div>
                <div className="text-[18px] font-black tracking-[-0.04em] text-black">{label}</div>
                <div className="text-[14px] text-[#777772] mt-1 tracking-[-0.03em]">{desc}</div>
              </div>
              {isSelected && (
                <div className="ml-auto w-8 h-8 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

    </div>
  );
}

/* ─── Step 2: Basic info ─── */
function Step2({ form, updateForm }: { form: UploadFormData; updateForm: (u: Partial<UploadFormData>) => void }) {
  const typeLabel = TYPE_OPTIONS.find((t) => t.type === form.contentType)?.label ?? '';

  return (
    <div>
      <h2 className="text-[42px] font-black text-gray-900 mb-3 leading-[0.92] uppercase">ADD<br />DETAILS.</h2>
      <p className="mb-8 text-[17px] leading-snug text-gray-500 tracking-[-0.03em]">
        {typeLabel}을 피드에서 바로 실행할 수 있게 준비합니다.
      </p>

      {/* Thumbnail */}
      <FormGroup label="썸네일" required>
        <div className="w-full aspect-video rounded-[28px] border-2 border-dashed border-[#D8D8D0] flex flex-col items-center justify-center gap-3 bg-[#F7F7F2] active:bg-[#EFEFE8] cursor-pointer">
          <UploadTypeIcon icon="thumbnail" selected={false} />
          <span className="text-[13px] text-gray-500 text-center">탭해서 이미지 선택<br /><span className="text-gray-400">JPG, PNG, GIF · 최대 10MB</span></span>
        </div>
      </FormGroup>

      {/* Title */}
      <FormGroup label="제목" required>
        <div className="relative">
          <input
            type="text"
            maxLength={40}
            value={form.title}
            onChange={(e) => updateForm({ title: e.target.value })}
            placeholder="손 펼치면 꽃이 피는 앱"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[15px] text-gray-900 placeholder-gray-400 outline-none focus:border-warm focus:ring-2 focus:ring-orange-100"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 font-mono">
            {form.title.length}/40
          </span>
        </div>
      </FormGroup>

      {/* 3-second description */}
      <FormGroup label="3초 설명" required hint="피드에서 보이는 한 줄 소개">
        <div className="relative">
          <input
            type="text"
            maxLength={80}
            value={form.description}
            onChange={(e) => updateForm({ description: e.target.value })}
            placeholder="손 제스처로 꽃이 피고 지는 인터랙티브 앱"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[15px] text-gray-900 placeholder-gray-400 outline-none focus:border-warm focus:ring-2 focus:ring-orange-100"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 font-mono">
            {form.description.length}/80
          </span>
        </div>
      </FormGroup>

      {/* Content-type specific fields */}
      {form.contentType === 'interactive' && (
        <IframeUrlField url={form.iframeUrl} onChange={(url) => updateForm({ iframeUrl: url })} />
      )}

      {form.contentType === 'audio' && (
        <FormGroup label="오디오 파일" required>
          <div className="w-full p-4 rounded-[24px] border-2 border-dashed border-[#D8D8D0] flex items-center gap-3 bg-[#F7F7F2] cursor-pointer active:bg-[#EFEFE8]">
            <UploadTypeIcon icon="audio" selected={false} small />
            <div>
              <div className="text-[14px] font-semibold text-gray-700">오디오 파일 업로드</div>
              <div className="text-[12px] text-gray-400 mt-0.5">MP3, WAV, FLAC · 최대 50MB</div>
            </div>
          </div>
        </FormGroup>
      )}

      {form.contentType === 'image' && (
        <FormGroup label="이미지" required hint="여러 장 선택 시 시리즈로 표시됩니다">
          <div className="w-full p-4 rounded-[28px] border-2 border-dashed border-[#D8D8D0] flex flex-col items-center justify-center gap-3 bg-[#F7F7F2] cursor-pointer active:bg-[#EFEFE8] min-h-[120px]">
            <UploadTypeIcon icon="image" selected={false} />
            <div className="text-[13px] text-gray-500 text-center">이미지 선택 (최대 20장)<br /><span className="text-gray-400">JPG, PNG, WebP</span></div>
          </div>
        </FormGroup>
      )}
    </div>
  );
}

/* ─── Step 3: Optional + publish ─── */
function Step3({
  form, updateForm, showOptional, setShowOptional,
}: {
  form: UploadFormData;
  updateForm: (u: Partial<UploadFormData>) => void;
  showOptional: boolean;
  setShowOptional: (v: boolean) => void;
}) {
  return (
    <div>
      <h2 className="text-[42px] font-black text-gray-900 mb-3 leading-[0.92] uppercase">READY<br />TO PLAY.</h2>
      <p className="mb-8 text-[17px] leading-snug text-gray-500 tracking-[-0.03em]">
        피드에서 탭하면 이 자리에서 바로 열립니다.
      </p>

      {/* Preview summary */}
      <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-lg flex-shrink-0">😸</div>
          <div>
            <div className="font-bold text-[14px] text-gray-900">나 <span className="text-gray-400 font-normal">@me</span></div>
            <p className="text-[14px] text-gray-700 mt-0.5">{form.description || '3초 설명이 여기 표시됩니다'}</p>
            <div className="mt-2 px-3 py-2 rounded-xl bg-white border border-gray-200 text-[13px] text-gray-500">
              {form.title || '작품 제목'}
              <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-semibold" style={{
                background: form.contentType === 'interactive' ? '#FFF0EA' : form.contentType === 'audio' ? '#EEE9FF' : '#EEFAD6',
                color: form.contentType === 'interactive' ? '#E8511A' : form.contentType === 'audio' ? '#5B3FD4' : '#5A9200',
              }}>
                {form.contentType === 'interactive' ? '▶ 인터랙티브' : form.contentType === 'audio' ? '♪ 오디오' : '◻ 이미지'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Optional section toggle */}
      <button
        onClick={() => setShowOptional(!showOptional)}
        className="w-full flex items-center justify-between py-3 text-[14px] font-semibold text-gray-600"
      >
        <span>+ 추가 정보 (선택)</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${showOptional ? 'rotate-180' : ''}`}>
          <path d="M6 9l6 6 6-6" strokeLinecap="round"/>
        </svg>
      </button>

      {showOptional && (
        <div className="border-t border-gray-100 pt-4 pb-2 flex flex-col gap-4">
          {/* Detailed description */}
          <FormGroup label="상세 설명">
            <textarea
              value={form.detailedDescription}
              onChange={(e) => updateForm({ detailedDescription: e.target.value })}
              placeholder="만든 과정, 사용한 방식을 더 자세히 써주세요"
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[15px] text-gray-900 placeholder-gray-400 outline-none focus:border-warm focus:ring-2 focus:ring-orange-100 resize-none"
            />
          </FormGroup>

          {/* Tool */}
          <FormGroup label="사용 도구 / 모델">
            <input
              type="text"
              value={form.tool}
              onChange={(e) => updateForm({ tool: e.target.value })}
              placeholder="예: GPT-4o, Midjourney v6, Udio..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[15px] text-gray-900 placeholder-gray-400 outline-none focus:border-warm focus:ring-2 focus:ring-orange-100"
            />
          </FormGroup>

          {/* Toggles */}
          <div className="flex flex-col gap-3">
            <ToggleRow
              label="리믹스 허용"
              desc="다른 사람이 이 작품을 기반으로 새 작품을 만들 수 있어요"
              value={form.remixable}
              onChange={(v) => updateForm({ remixable: v })}
            />
            <ToggleRow
              label="프롬프트 공개"
              desc="사용한 프롬프트를 상세 페이지에서 볼 수 있어요"
              value={form.promptPublic}
              onChange={(v) => updateForm({ promptPublic: v })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Iframe URL field with live preview ─── */
function IframeUrlField({ url, onChange }: { url: string; onChange: (url: string) => void }) {
  const [previewUrl, setPreviewUrl] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [loadIssue, setLoadIssue] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const validation = validateEmbedUrl(url, { requirePublicUrl: true });

  const triggerPreview = () => {
    if (!validation.ok) return;
    setLoaded(false);
    setLoadIssue(false);
    setPreviewUrl(validation.normalizedUrl);
    setShowPreview(true);
  };

  useEffect(() => {
    if (!showPreview || !previewUrl || loaded) return;

    const timer = window.setTimeout(() => {
      setLoadIssue(true);
    }, 10000);

    return () => window.clearTimeout(timer);
  }, [loaded, previewUrl, showPreview]);

  return (
    <FormGroup label="앱 URL" required hint="배포된 앱 주소를 붙여넣으세요">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="url"
          value={url}
          onChange={(e) => {
            onChange(e.target.value);
            setLoaded(false);
            setLoadIssue(false);
            setShowPreview(false);
          }}
          placeholder="https://your-app.vercel.app"
          className={`flex-1 px-4 py-3 rounded-xl border text-[14px] text-gray-900 placeholder-gray-400 outline-none focus:border-warm focus:ring-2 focus:ring-orange-100 font-mono min-w-0 ${
            url.trim() && !validation.ok ? 'border-black' : 'border-gray-200'
          }`}
        />
        <button
          type="button"
          onClick={triggerPreview}
          disabled={!validation.ok}
          className="flex-shrink-0 px-4 py-3 rounded-xl bg-gray-900 text-white text-[13px] font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-opacity active:scale-95"
        >
          미리보기
        </button>
      </div>
      {url.trim() && !validation.ok && (
        <p className="mt-2 text-[12px] font-bold text-black">{validation.message}</p>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {['Vercel', 'GitHub Pages', 'Glitch', 'CodePen'].map((label) => (
          <span key={label} className="px-2 py-1 rounded-full bg-gray-100 text-[11px] text-gray-500">
            {label}
          </span>
        ))}
        <Link href="/guide" className="ml-auto text-[11px] text-warm font-medium underline underline-offset-2">
          임베딩 설정 가이드 →
        </Link>
      </div>

      {showPreview && previewUrl && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-semibold text-gray-600">미리보기</span>
            <button
              onClick={() => setShowPreview(false)}
              className="text-[11px] text-gray-400 hover:text-gray-600"
            >
              닫기
            </button>
          </div>
          {/* Phone frame */}
          <div className="mx-auto rounded-2xl border-2 border-gray-200 overflow-hidden bg-gray-50 relative" style={{ height: 440 }}>
            {!loaded && !loadIssue && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-50">
                <div className="w-7 h-7 border-2 border-warm border-t-transparent rounded-full animate-spin" />
                <span className="text-[12px] text-gray-400">앱 불러오는 중...</span>
              </div>
            )}
            {loadIssue && !loaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#EFEFE8] px-6 text-center">
                <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
                    <path d="M12 9v4" />
                    <path d="M12 17h.01" />
                    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[15px] font-black tracking-[-0.04em] text-black">미리보기가 오래 걸려요</div>
                  <p className="mt-1 text-[12px] text-[#777772] leading-snug">
                    앱에서 iframe 임베딩을 막았거나 응답이 느릴 수 있어요. 새 탭에서 열어 확인해 주세요.
                  </p>
                </div>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-full bg-black text-white text-[13px] font-black"
                >
                  새 탭에서 열기
                </a>
              </div>
            )}
            <iframe
              key={previewUrl}
              src={previewUrl}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              allow="camera; microphone"
              onLoad={() => {
                setLoaded(true);
                setLoadIssue(false);
              }}
              style={{ display: loaded ? 'block' : 'none' }}
              title="앱 미리보기"
            />
          </div>
          {loaded && (
            <p className="mt-2 text-[11px] text-gray-400 text-center">
              이 화면이 피드에서 체험 가능한 앱으로 보입니다
            </p>
          )}
        </div>
      )}
    </FormGroup>
  );
}

/* ─── Shared components ─── */
function FormGroup({ label, required, hint, children }: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-[13px] font-bold text-gray-700">{label}</span>
        {required && <span className="text-[11px] text-warm font-semibold">필수</span>}
        {hint && <span className="text-[12px] text-gray-400">· {hint}</span>}
      </div>
      {children}
    </div>
  );
}

function ToggleRow({ label, desc, value, onChange }: {
  label: string;
  desc: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-1">
        <div className="text-[14px] font-semibold text-gray-900">{label}</div>
        <div className="text-[12px] text-gray-500 mt-0.5">{desc}</div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 mt-0.5 ${value ? 'bg-warm' : 'bg-gray-200'}`}
        role="switch"
        aria-checked={value}
      >
        <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${value ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  );
}
