export const BOTTOM_NAV_CLASS =
  'fixed bottom-0 left-1/2 z-50 grid w-full max-w-[430px] -translate-x-1/2 grid-cols-5 items-center border-t border-gray-200 bg-white px-2 pt-1 shadow-[0_-12px_30px_rgba(0,0,0,0.08)]';

export const BOTTOM_NAV_STYLE = {
  height: 'calc(64px + env(safe-area-inset-bottom, 0px))',
  paddingBottom: 'max(8px, env(safe-area-inset-bottom, 0px))',
};

export const BOTTOM_NAV_ITEM_CLASS =
  'relative flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-1 text-[10px] font-black leading-none transition-colors';

export const BOTTOM_NAV_CENTER_CLASS =
  'mx-auto flex h-10 w-12 items-center justify-center rounded-full bg-warm text-white shadow-sm';

export const BOTTOM_NAV_SCROLL_PADDING_CLASS =
  'pb-[calc(80px+env(safe-area-inset-bottom,0px))]';
