import type { ActionLink } from "../types/analysis";

export const providerLinks = {
  googleSecurity: {
    label: "Google 계정 보안 점검",
    url: "https://myaccount.google.com/intro/security-checkup",
    description:
      "Google 계정의 보안 상태, 최근 보안 활동, 2단계 인증 설정을 확인합니다.",
  },

  naverLoginHistory: {
    label: "네이버 로그인 기록 확인",
    url: "https://nid.naver.com/user2/help/userLoginLog?m=viewLoginStatus&lang=ko_KR",
    description: "네이버 계정의 로그인 이력을 확인합니다.",
  },

  naverPasswordChange: {
    label: "네이버 비밀번호 변경",
    url: "https://nid.naver.com/user2/help/myInfo?m=viewChangePasswd&lang=ko_KR",
    description: "네이버 계정의 비밀번호를 변경합니다.",
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

  kakaoPasswordChange: {
    label: "카카오 비밀번호 변경",
    url: "https://accounts.kakao.com/weblogin/account/security/change_password",
    description: "카카오 계정의 비밀번호를 변경합니다.",
  },

  kakaoLoginHistory: {
    label: "카카오 로그인 기록 조회",
    url: "https://accounts.kakao.com/weblogin/account/security/login_history",
    description: "카카오 계정의 로그인 기록을 확인합니다.",
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

  lguplusPasswordChange: {
    label: "LG U+ 비밀번호 변경",
    url: "https://www.lguplus.com/login/password-update/complete",
    description: "LG U+ 계정의 비밀번호를 변경합니다.",
  },

  lguplusAccountReview: {
    label: "LG U+ 계정 점검",
    url: "https://www.lguplus.com/account-overview/quick-review",
    description: "LG U+ 계정 정보를 빠르게 확인합니다.",
  },

  coupangAccountEdit: {
    label: "쿠팡 회원정보 수정",
    url: "https://login.coupang.com/login/userModify.pang",
    description: "쿠팡 계정의 회원정보 및 비밀번호를 변경합니다.",
  },

  elevenStreetAccountEdit: {
    label: "11번가 회원정보 수정",
    url: "https://www.11st.co.kr/register/memInfoEditForm.tmall?method=getMemberInfo",
    description: "11번가 계정의 회원정보 및 비밀번호를 변경합니다.",
  },

  elevenStreetLoginHistory: {
    label: "11번가 로그인 기록 조회",
    url: "https://www.11st.co.kr/register/viewLoginLog.tmall?method=viewLoginLog&isSSL=Y",
    description: "11번가 계정의 로그인 기록을 확인합니다.",
  },

  gmarketPasswordReset: {
    label: "지마켓 비밀번호 찾기/변경",
    url: "https://sslmember2.gmarket.co.kr/FindPW/FindPW",
    description: "지마켓 계정의 비밀번호를 찾거나 변경합니다.",
  },

  gmarketLogin: {
    label: "지마켓 로그인",
    url: "https://mobile.gmarket.co.kr/login/login",
    description:
      "지마켓 로그인 페이지입니다. 별도 로그인 기록 조회 페이지는 추가 확인이 필요합니다.",
  },

  tossPasswordGuide: {
    label: "토스 비밀번호 관련 안내",
    url: "https://support.toss.im/faq/212",
    description: "토스 비밀번호 및 계정 보안 관련 안내를 확인합니다.",
  },

  tossPrivacyHistory: {
    label: "토스 개인정보 이용내역",
    url: "https://toss.im/user/privacy-history",
    description: "토스 계정의 개인정보 이용내역을 확인합니다.",
  },
} satisfies Record<string, ActionLink>;