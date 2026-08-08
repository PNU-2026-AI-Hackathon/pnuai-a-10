import type { ChecklistItem } from "../types/analysis";
import { providerLinks } from "./providerLinks";

export const actionRules: Record<string, ChecklistItem[]> = {
  이름: [
    {
      id: "name-phishing-warning",
      priority: "필요 시 관리",
      title: "본인 이름을 언급하는 연락에 주의하세요.",
      description:
        "이름이 유출되면 실제 사용자처럼 보이도록 가장한 문자, 전화, 이메일이 올 수 있습니다.",
    },
  ],

  전화번호: [
    {
      id: "phone-smishing-warning",
      priority: "즉시 조치",
      title: "의심 문자 링크를 누르지 마세요.",
      description:
        "전화번호가 유출되면 보상금, 환불, 본인인증, 배송 확인을 사칭한 스미싱 문자가 올 수 있습니다.",
      link: providerLinks.kisaBoho,
    },
    {
      id: "phone-family-share",
      priority: "1주 이내 확인",
      title: "가족에게 사칭 문자 주의 안내를 공유하세요.",
      description:
        "가족이나 지인에게도 본인 명의의 사고를 사칭한 연락이 갈 수 있으므로 주의 안내가 필요합니다.",
    },
  ],

  이메일: [
    {
      id: "email-password-change",
      priority: "즉시 조치",
      title: "이메일 계정 비밀번호를 변경하세요.",
      description:
        "이메일이 유출되면 피싱 메일, 계정 탈취, 비밀번호 재설정 시도가 발생할 수 있습니다.",
      link: providerLinks.googleSecurity,
    },
    {
      id: "email-two-factor",
      priority: "즉시 조치",
      title: "2단계 인증을 설정하세요.",
      description:
        "비밀번호가 직접 유출되지 않았더라도 피싱 공격을 줄이기 위해 2단계 인증 설정이 필요합니다.",
      link: providerLinks.googleSecurity,
    },
  ],

  주소: [
    {
      id: "address-delivery-warning",
      priority: "1주 이내 확인",
      title: "택배 사칭 문자를 주의하세요.",
      description:
        "주소가 유출되면 배송지 확인, 반송 안내, 추가 배송비 결제 등을 사칭한 문자를 받을 수 있습니다.",
    },
  ],

  주문내역: [
    {
      id: "order-refund-warning",
      priority: "1주 이내 확인",
      title: "환불·보상금 안내 문자를 주의하세요.",
      description:
        "주문내역이 유출되면 실제 구매 정보를 이용한 환불, 보상금, 배송 관련 사칭 문자가 올 수 있습니다.",
    },
  ],

  계정정보: [
    {
      id: "account-login-check-google",
      priority: "즉시 조치",
      title: "주요 계정의 로그인 기록을 확인하세요.",
      description:
        "계정 ID나 이메일이 유출되면 다른 사람이 로그인을 시도할 수 있으므로 최근 로그인 기록 확인이 필요합니다.",
      link: providerLinks.googleSecurity,
    },
    {
      id: "account-login-check-naver",
      priority: "1주 이내 확인",
      title: "네이버 계정 로그인 기록을 확인하세요.",
      description:
        "네이버 계정을 사용 중이라면 로그인 기록에서 낯선 접속이 있었는지 확인하세요.",
      link: providerLinks.naverLoginHistory,
    },
    {
      id: "account-login-check-kakao",
      priority: "1주 이내 확인",
      title: "카카오 계정 보안 설정을 확인하세요.",
      description:
        "카카오 계정을 사용 중이라면 계정 보안 설정과 2단계 인증 여부를 확인하세요.",
      link: providerLinks.kakaoAccount,
    },
  ],

  비밀번호: [
    {
      id: "password-change-all",
      priority: "즉시 조치",
      title: "같은 비밀번호를 사용하는 계정을 모두 변경하세요.",
      description:
        "동일한 비밀번호를 여러 사이트에서 사용했다면 다른 계정까지 탈취될 수 있습니다.",
      link: providerLinks.googleSecurity,
    },
  ],

  결제정보: [
    {
      id: "payment-history-check",
      priority: "즉시 조치",
      title: "최근 결제 내역을 확인하세요.",
      description:
        "결제정보가 유출된 경우 승인하지 않은 결제가 있는지 카드사나 결제 앱에서 확인해야 합니다.",
    },
  ],

  카드정보: [
    {
      id: "card-history-check",
      priority: "즉시 조치",
      title: "카드 승인 내역을 확인하세요.",
      description:
        "카드정보 유출 가능성이 있으면 승인하지 않은 결제 내역이 있는지 확인하고 필요 시 카드사에 문의하세요.",
    },
  ],

  생년월일: [
    {
      id: "birthdate-identity-warning",
      priority: "필요 시 관리",
      title: "본인확인 사칭 연락을 주의하세요.",
      description:
        "생년월일은 다른 정보와 결합될 경우 본인확인 사칭에 악용될 수 있습니다.",
    },
  ],

  주민등록번호: [
    {
      id: "identity-theft-report",
      priority: "즉시 조치",
      title: "명의도용 가능성을 확인하세요.",
      description:
        "주민등록번호가 유출되면 명의도용, 불법 가입, 금융 피해로 이어질 수 있으므로 즉시 확인이 필요합니다.",
      link: providerLinks.privacyReport,
    },
  ],
};