// 상수 정의 - 하드코딩 제거

export const UI_CONSTANTS = {
  // 레이아웃
  MOBILE_MAX_WIDTH: 480,
  MOBILE_TOUCH_TARGET: 44,
  MOBILE_BOTTOM_NAV_HEIGHT: 64,
  MOBILE_HEADER_HEIGHT: 56,

  // 간격
  SPACING: {
    XS: 0.5, // 8px
    SM: 0.75, // 12px
    MD: 1, // 16px
    LG: 1.5, // 24px
    XL: 2, // 32px
  },

  // 논문 관련
  PAPER: {
    ABSTRACT_PREVIEW_LENGTH: 150,
    MAX_DISPLAYED_AUTHORS: 3,
    MAX_DISPLAYED_TAGS: 3,
    FEATURED_COUNT: 5,
    MIN_TAGS_FOR_ONBOARDING: 3,
  },

  // 온보딩
  ONBOARDING: {
    MIN_DAILY_COUNT: 5,
    MAX_DAILY_COUNT: 30,
    DEFAULT_DAILY_COUNT: 10,
    DEFAULT_TAG_WEIGHT: 3,
  },

  // 애니메이션
  ANIMATION: {
    FADE_DURATION: 200,
    TRANSITION_DURATION: 300,
  },
} as const;

export const ROUTES = {
  HOME: "/",
  SEARCH: "/search",
  MYPAGE: "/mypage",
  LOGIN: "/login",
  ONBOARDING: "/onboarding",
  SETTINGS: "/settings",
} as const;

export const COLORS = {
  // 메인 컬러 (흰색 + 남색)
  PRIMARY: {
    NAVY: "220 60% 35%", // 남색
    WHITE: "0 0% 100%", // 흰색
  },
} as const;
