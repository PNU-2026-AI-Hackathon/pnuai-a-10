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

  skTelecomLineReview: {
    label: "T world 회선 정보 확인",
    url: "https://www.tworld.co.kr/web/info/simple",
    description: "T world에서 본인인증 후 휴대폰 이용내역과 회선 정보를 확인합니다.",
  },

  ktMyAccount: {
    label: "KT 마이 가입정보 확인",
    url: "https://m.kt.com/",
    description: "KT 공식 채널에서 가입정보와 회선 관리 메뉴를 확인합니다.",
  },

  lotteCardManagement: {
    label: "롯데카드 카드관리",
    url: "https://www.lottecard.co.kr/app/LPMAIAA_V170.lc",
    description:
      "롯데카드 보유카드, 카드 비밀번호 변경, 일시정지, 분실 신고를 확인합니다.",
  },

  shinhanCardHome: {
    label: "신한카드 계정·카드 확인",
    url: "https://www.shinhancard.com/",
    description: "신한카드 공식 홈페이지에서 로그인 후 카드 이용내역과 계정 정보를 확인합니다.",
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

  skStoaMyPage: {
    label: "SK스토아 마이페이지",
    url: "https://www.skstoa.com/mypage/myPage",
    description: "SK스토아 로그인 후 마이페이지에서 회원정보와 주문 정보를 확인합니다.",
  },

  dhlotteryAccountInfo: {
    label: "동행복권 개인정보 변경",
    url: "https://www.dhlottery.co.kr/mypage/userPswdInpt?trgtPage=%2Fmypage%2FprvcChg",
    description: "동행복권 로그인 후 개인정보 변경 메뉴를 확인합니다.",
  },

  dhlotteryPasswordChange: {
    label: "동행복권 비밀번호 변경",
    url: "https://www.dhlottery.co.kr/mypage/userPswdInpt?trgtPage=%2Fmypage%2FpasswordChg",
    description: "동행복권 로그인 후 비밀번호 변경 메뉴를 확인합니다.",
  },

  happyPointMemberInfo: {
    label: "해피포인트 회원정보",
    url: "https://www.happypointcard.com/page/member-info/index.spc",
    description: "해피포인트 회원정보와 계정 상태를 확인합니다.",
  },

  happyPointCardPassword: {
    label: "해피포인트 카드 비밀번호",
    url: "https://www.happypointcard.com/page/mypage/card/password.spc",
    description: "해피포인트 로그인 후 카드 비밀번호 관련 메뉴를 확인합니다.",
  },

  tvingLogin: {
    label: "TVING 계정 로그인",
    url: "https://www.tving.com/account/login",
    description: "TVING 계정으로 로그인하고 계정 정보를 확인합니다.",
  },

  netmarblePasswordReset: {
    label: "넷마블 비밀번호 찾기",
    url: "https://member.netmarble.net/Inquiry/PopInquiryPW.asp",
    description: "넷마블 계정의 비밀번호 찾기와 변경 절차를 진행합니다.",
  },

  yes24MemberInfo: {
    label: "YES24 회원정보 확인",
    url: "https://www.yes24.com/Member/MyPage_reconfirmPW.aspx",
    description: "YES24 로그인 후 회원정보와 마이페이지를 확인합니다.",
  },

  fastcampusLogin: {
    label: "패스트캠퍼스 계정 로그인",
    url: "https://fastcampus.co.kr/account/sign-in",
    description: "패스트캠퍼스 계정으로 로그인하고 수강·계정 정보를 확인합니다.",
  },

  modetourMyPage: {
    label: "모두투어 마이페이지",
    url: "https://www.modetour.com/my-page",
    description: "모두투어 로그인 후 예약내역과 마이페이지를 확인합니다.",
  },

  blackyakMemberEdit: {
    label: "BYN 블랙야크 회원정보",
    url: "https://www.byn.kr/member/edit_step1.php",
    description: "BYN 블랙야크 로그인 후 나의 정보 수정 메뉴를 확인합니다.",
  },

  diorAccount: {
    label: "디올 계정 확인",
    url: "https://www.dior.com/ko_kr/fashion",
    description: "디올 공식 사이트에서 로그인 후 계정 정보와 주문 내역을 확인합니다.",
  },
} satisfies Record<string, ActionLink>;

export type ProviderShortcutGroup = {
  keywords: string[];
  links: ActionLink[];
};

export const providerShortcutGroups = [
  {
    keywords: ["LG유플러스", "LG U+", "LGU+", "엘지유플러스"],
    links: [
      providerLinks.lguplusAccountReview,
      providerLinks.lguplusPasswordChange,
    ],
  },
  {
    keywords: ["쿠팡", "Coupang"],
    links: [providerLinks.coupangAccountEdit],
  },
  {
    keywords: ["11번가", "11st", "11Street"],
    links: [
      providerLinks.elevenStreetAccountEdit,
      providerLinks.elevenStreetLoginHistory,
    ],
  },
  {
    keywords: ["G마켓", "지마켓", "Gmarket"],
    links: [providerLinks.gmarketPasswordReset, providerLinks.gmarketLogin],
  },
  {
    keywords: ["토스", "Toss"],
    links: [providerLinks.tossPasswordGuide, providerLinks.tossPrivacyHistory],
  },
  {
    keywords: ["신한카드", "Shinhan Card", "SHINHANCARD"],
    links: [providerLinks.shinhanCardHome],
  },
  {
    keywords: ["SK스토아", "SK Stoa", "SKSTOA"],
    links: [providerLinks.skStoaMyPage],
  },
  {
    keywords: ["동행복권", "Dhlottery"],
    links: [
      providerLinks.dhlotteryAccountInfo,
      providerLinks.dhlotteryPasswordChange,
    ],
  },
  {
    keywords: ["해피포인트", "Happy Point", "Happypoint", "섹타나인"],
    links: [
      providerLinks.happyPointMemberInfo,
      providerLinks.happyPointCardPassword,
    ],
  },
  {
    keywords: ["티빙", "TVING"],
    links: [providerLinks.tvingLogin],
  },
  {
    keywords: ["넷마블", "Netmarble"],
    links: [providerLinks.netmarblePasswordReset],
  },
  {
    keywords: ["YES24", "예스24", "예스이십사"],
    links: [providerLinks.yes24MemberInfo],
  },
  {
    keywords: ["패스트캠퍼스", "Fastcampus"],
    links: [providerLinks.fastcampusLogin],
  },
  {
    keywords: ["모두투어", "Modetour"],
    links: [providerLinks.modetourMyPage],
  },
  {
    keywords: ["블랙야크", "Blackyak", "BYN블랙야크", "비와이엔블랙야크"],
    links: [providerLinks.blackyakMemberEdit],
  },
  {
    keywords: ["디올", "Dior", "크리스챤디올", "Christian Dior"],
    links: [providerLinks.diorAccount],
  },
  {
    keywords: ["SK텔레콤", "SKT", "에스케이텔레콤", "T world", "티월드"],
    links: [providerLinks.skTelecomLineReview],
  },
  {
    keywords: ["KT", "케이티", "마이KT", "마이케이티"],
    links: [providerLinks.ktMyAccount],
  },
  {
    keywords: ["롯데카드", "Lotte Card", "LOTTECARD"],
    links: [providerLinks.lotteCardManagement],
  },
] satisfies ProviderShortcutGroup[];

export type SupportAgencyLink = {
  label: string;
  description: string;
  url?: string;
  phone?: string;
};

export const supportAgencyLinks: SupportAgencyLink[] = [
  {
    label: "개인정보침해 신고·상담",
    description: providerLinks.privacyReport.description ?? "",
    url: providerLinks.privacyReport.url,
  },
  {
    label: "KISA 118 또는 보호나라",
    description: providerLinks.kisaBoho.description ?? "",
    url: providerLinks.kisaBoho.url,
  },
  {
    label: "경찰청 사이버범죄 신고",
    description: providerLinks.policeCyber.description ?? "",
    url: providerLinks.policeCyber.url,
  },
];
