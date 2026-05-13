'use client';

import { useState } from 'react';
import Link from 'next/link';

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 relative ${
        value ? 'bg-warm' : 'bg-gray-200'
      }`}
    >
      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
        value ? 'translate-x-[22px]' : 'translate-x-0.5'
      }`} />
    </button>
  );
}

function SettingsRow({ label, desc, value, onChange }: {
  label: string;
  desc?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3.5 px-4 border-b border-gray-50 last:border-0">
      <div className="flex-1 pr-4">
        <div className="text-[15px] font-medium text-gray-900">{label}</div>
        {desc && <div className="text-[12px] text-gray-400 mt-0.5">{desc}</div>}
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="px-4 pt-6 pb-2">
      <div className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider">{title}</div>
    </div>
  );
}

function LinkRow({ label, desc, href, danger }: { label: string; desc?: string; href: string; danger?: boolean }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between py-3.5 px-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
    >
      <div>
        <div className={`text-[15px] font-medium ${danger ? 'text-red-500' : 'text-gray-900'}`}>{label}</div>
        {desc && <div className="text-[12px] text-gray-400 mt-0.5">{desc}</div>}
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </Link>
  );
}

export default function SettingsClient() {
  const [notif, setNotif] = useState({
    likes: true,
    comments: true,
    remixes: true,
    follows: true,
    revenue: true,
    tierUp: true,
    marketing: false,
  });

  const [privacy, setPrivacy] = useState({
    publicProfile: true,
    showRevenue: false,
    allowRemix: true,
    allowDm: true,
  });

  const [content, setContent] = useState({
    autoplay: true,
    reducedMotion: false,
    highContrast: false,
  });

  return (
    <div className="pb-4">
      {/* Profile summary */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-2xl flex-shrink-0">
          😸
        </div>
        <div className="flex-1">
          <div className="text-[15px] font-bold text-gray-900">민수</div>
          <div className="text-[13px] text-gray-500">@minsu_lab</div>
        </div>
        <Link
          href="/profile/me"
          className="px-3 py-1.5 rounded-full border border-gray-200 text-[13px] font-medium text-gray-700 hover:bg-gray-50"
        >
          프로필 보기
        </Link>
      </div>

      {/* 알림 설정 */}
      <SectionHeader title="알림" />
      <div className="mx-4 rounded-2xl bg-white border border-gray-100 overflow-hidden">
        <SettingsRow
          label="좋아요"
          desc="내 작품에 좋아요를 받으면 알림"
          value={notif.likes}
          onChange={(v) => setNotif((p) => ({ ...p, likes: v }))}
        />
        <SettingsRow
          label="댓글"
          value={notif.comments}
          onChange={(v) => setNotif((p) => ({ ...p, comments: v }))}
        />
        <SettingsRow
          label="리믹스"
          desc="내 작품이 리믹스되면 알림"
          value={notif.remixes}
          onChange={(v) => setNotif((p) => ({ ...p, remixes: v }))}
        />
        <SettingsRow
          label="팔로우"
          value={notif.follows}
          onChange={(v) => setNotif((p) => ({ ...p, follows: v }))}
        />
        <SettingsRow
          label="수익 정산"
          desc="월별 예상 수익 및 정산 완료 알림"
          value={notif.revenue}
          onChange={(v) => setNotif((p) => ({ ...p, revenue: v }))}
        />
        <SettingsRow
          label="파트너 등급 변경"
          value={notif.tierUp}
          onChange={(v) => setNotif((p) => ({ ...p, tierUp: v }))}
        />
        <SettingsRow
          label="마케팅 / 이벤트"
          desc="nuevo 새 기능, 이벤트 안내"
          value={notif.marketing}
          onChange={(v) => setNotif((p) => ({ ...p, marketing: v }))}
        />
      </div>

      {/* 공개 / 프라이버시 */}
      <SectionHeader title="공개 및 프라이버시" />
      <div className="mx-4 rounded-2xl bg-white border border-gray-100 overflow-hidden">
        <SettingsRow
          label="공개 프로필"
          desc="비공개로 설정하면 팔로워만 작품 조회 가능"
          value={privacy.publicProfile}
          onChange={(v) => setPrivacy((p) => ({ ...p, publicProfile: v }))}
        />
        <SettingsRow
          label="수익 공개"
          desc="프로필에서 수익 정보를 다른 사람이 볼 수 있게"
          value={privacy.showRevenue}
          onChange={(v) => setPrivacy((p) => ({ ...p, showRevenue: v }))}
        />
        <SettingsRow
          label="리믹스 허용 (기본값)"
          desc="새로 올리는 작품의 리믹스 허용 여부 기본값"
          value={privacy.allowRemix}
          onChange={(v) => setPrivacy((p) => ({ ...p, allowRemix: v }))}
        />
        <SettingsRow
          label="DM 허용"
          value={privacy.allowDm}
          onChange={(v) => setPrivacy((p) => ({ ...p, allowDm: v }))}
        />
      </div>

      {/* 콘텐츠 설정 */}
      <SectionHeader title="콘텐츠" />
      <div className="mx-4 rounded-2xl bg-white border border-gray-100 overflow-hidden">
        <SettingsRow
          label="인터랙티브 자동 실행"
          desc="피드에서 카드 확장 시 앱 자동 로드"
          value={content.autoplay}
          onChange={(v) => setContent((p) => ({ ...p, autoplay: v }))}
        />
        <SettingsRow
          label="애니메이션 줄이기"
          value={content.reducedMotion}
          onChange={(v) => setContent((p) => ({ ...p, reducedMotion: v }))}
        />
        <SettingsRow
          label="고대비 모드"
          value={content.highContrast}
          onChange={(v) => setContent((p) => ({ ...p, highContrast: v }))}
        />
      </div>

      {/* 계정 */}
      <SectionHeader title="계정" />
      <div className="mx-4 rounded-2xl bg-white border border-gray-100 overflow-hidden">
        <LinkRow label="파트너 프로그램 신청" href="/studio" />
        <LinkRow label="출금 계좌 관리" href="/studio" />
        <LinkRow label="창작자 가이드" href="/guide" />
        <LinkRow label="브랜드 파트너십" href="/brand" />
        <LinkRow label="서비스 이용약관" href="#" />
        <LinkRow label="개인정보 처리방침" href="#" />
      </div>

      {/* 위험 구역 */}
      <SectionHeader title="위험 구역" />
      <div className="mx-4 rounded-2xl bg-white border border-gray-100 overflow-hidden">
        <LinkRow label="로그아웃" href="#" />
        <LinkRow label="계정 비활성화" href="#" danger />
        <LinkRow label="계정 삭제" href="#" danger />
      </div>

      {/* Version */}
      <div className="text-center text-[12px] text-gray-300 mt-6">
        nuevo v0.3.0 · MVP
      </div>
    </div>
  );
}
