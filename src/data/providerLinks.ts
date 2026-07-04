import type { ActionLink } from "../types/analysis";

export const providerLinks = {
  googleSecurity: {
    label: "Google 계정 보안 점검",
    url: "https://myaccount.google.com/intro/security-checkup",
    description: "Google 계정의 보안 상태, 최근 보안 활동, 2단계 인증 설정을 확인합니다.",
  },

  naverLoginHistory: {
    label: "네이버 로그인 기록 확인",
    url: "https://help.naver.com/service/5640/contents/21445",
    description: "네이버 계정의 로그인 기록 확인 방법을 안내합니다.",
  },

  kakaoAccount: {
    label: "카카오 계정 보안 설정",
    url: "https://accounts.kakao.com",
    description: "카카오 계정 로그인 및 보안 설정을 확인합니다.",
  },

  kakaoSafetyGuide: {
    label: "카카오 계정 보호 안내",
    url: "https://talksafety.kakao.com/toolandguide/account",
    description: "카카오 계정 보호와 2단계 인증 관련 안내를 확인합니다.",
  },

  kisaBoho: {
    label: "KISA 보호나라",
    url: "https://www.boho.or.kr",
    description: "스미싱, 피싱, 악성코드 등 사이버 침해 대응 정보를 확인합니다.",
  },

  privacyReport: {
    label: "개인정보침해 신고센터",
    url: "https://privacy.kisa.or.kr",
    description: "개인정보 침해 상담 및 신고를 진행할 수 있습니다.",
  },

  policeCyber: {
    label: "경찰청 사이버범죄 신고",
    url: "https://ecrm.police.go.kr",
    description: "사이버범죄 피해 신고를 진행할 수 있습니다.",
  },
} satisfies Record<string, ActionLink>;