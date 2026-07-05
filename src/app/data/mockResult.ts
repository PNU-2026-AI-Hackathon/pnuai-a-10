import type { LeakAnalysisResult } from "../../types/analysis";

export const sampleNotice = `[안내] 고객님의 개인정보 일부가 외부로 유출된 정황이 확인되었습니다.
유출 가능 항목은 이름, 전화번호, 이메일, 가입정보입니다.
추가 피해 예방을 위해 비밀번호 변경 및 의심 문자 주의를 부탁드립니다.`;

export const mockResult: LeakAnalysisResult = {
  type: "leak",

  company: "SK텔레콤",

  service: "이동통신 서비스",

  riskLevel: "높음",

  leakedItems: ["이름", "전화번호", "이메일", "가입 정보"],

  riskTypes: ["스미싱", "피싱", "통신사 사칭", "계정 탈취"],

  reason:
    "이름, 전화번호, 이메일, 가입 정보가 유출되면 통신사를 사칭한 스미싱 문자, 피싱 링크, 계정 탈취 시도 등 2차 피해로 이어질 가능성이 있습니다.",

  evidence: [
    {
      title: "통신사 개인정보 유출 관련 기사",
      url: "https://example.com/news",
      summary:
        "통신사 고객정보 유출 이후 이름, 연락처, 이메일 등이 사칭 문자에 악용될 가능성이 있습니다.",
    },
    {
      title: "개인정보 유출 사고 대응 안내",
      url: "https://example.com/privacy-guide",
      summary:
        "개인정보 유출 이후에는 비밀번호 변경, 2단계 인증 설정, 의심 링크 클릭 금지 등의 조치가 필요합니다.",
    },
  ],

  checklist: [
    {
      id: "change-password",
      priority: "즉시 조치",
      title: "비밀번호 변경",
      description: "동일한 비밀번호를 사용하는 사이트의 비밀번호를 변경하세요.",
    },
    {
      id: "enable-2fa",
      priority: "즉시 조치",
      title: "2단계 인증 설정",
      description: "이메일, 통신사, 금융 계정에 2단계 인증을 설정하세요.",
    },
    {
      id: "avoid-links",
      priority: "즉시 조치",
      title: "의심 링크 클릭 금지",
      description: "문자에 포함된 링크는 누르지 말고 공식 홈페이지로 직접 접속하세요.",
    },
    {
      id: "check-impersonation",
      priority: "1주 이내 확인",
      title: "사칭 문자 주의",
      description: "보상금, 환불, 본인인증을 요구하는 문자는 피싱 가능성을 의심하세요.",
    },
    {
      id: "contact-center",
      priority: "필요 시 관리",
      title: "공식 고객센터 확인",
      description: "추가로 받은 의심 문자는 공식 고객센터를 통해 확인하세요.",
    },
  ],

  familyMessage:
    "개인정보 유출 안내를 받은 상태입니다. 문자 링크를 누르지 말고, 비밀번호 변경과 2단계 인증 설정을 먼저 진행하는 것이 좋습니다. 보상금이나 본인인증을 요구하는 문자는 사칭일 수 있으니 공식 고객센터를 통해 확인해야 합니다.",

  reportSummary:
    "사용자는 개인정보 유출 안내문을 수신하였으며, 이름·전화번호·이메일 등 개인정보 유출 가능성이 있습니다. 후속 위험으로 스미싱, 피싱, 통신사 사칭 가능성이 있으며, 비밀번호 변경 및 2단계 인증 설정이 우선 권장됩니다.",
};