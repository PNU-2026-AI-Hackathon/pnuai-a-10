import type { RiskLevel } from "../types/analysis";

/**
 * LeakCare 내부 상대적 위험도 기준입니다.
 *
 * 아래 점수는 공식기관이 직접 부여한 점수가 아닙니다.
 * 개인정보의 성격, 보호 수준, 예상되는 2차 피해를 바탕으로
 * LeakCare가 대응 우선순위를 계산하기 위해 자체 설계한 값입니다.
 */

type RiskCriterion = {
  weight: number;
  category: string;
  riskReason: string;
  possibleDamages: string[];
  sourceIds: number[];
};

export const RISK_CRITERIA = {
  이름: {
    weight: 5,
    category: "일반 개인정보 / 인적사항",
    riskReason:
      "이름은 단독 위험은 비교적 낮지만 다른 개인정보와 결합되면 개인화된 사칭에 활용될 수 있습니다.",
    possibleDamages: ["개인화된 사칭", "피싱"],
    sourceIds: [1, 2, 4],
  },

  생년월일: {
    weight: 5,
    category: "일반 개인정보 / 인적사항",
    riskReason:
      "생년월일은 이름이나 연락처와 결합될 경우 본인확인 사칭에 활용될 수 있습니다.",
    possibleDamages: ["본인확인 사칭", "개인 식별"],
    sourceIds: [1, 2],
  },

  이메일: {
    weight: 10,
    category: "통신정보",
    riskReason:
      "이메일은 피싱 메일과 계정 공격에 사용될 수 있는 직접적인 접근 경로입니다.",
    possibleDamages: ["피싱", "계정정보 탈취"],
    sourceIds: [1, 3],
  },

  주소: {
    weight: 5,
    category: "일반 개인정보 / 인적사항",
    riskReason:
      "주소는 연락처나 주문정보와 결합될 경우 배송지 확인 등을 사칭하는 데 활용될 수 있습니다.",
    possibleDamages: ["배송 사칭", "개인화된 피싱"],
    sourceIds: [1, 2, 4],
  },

  주문내역: {
    weight: 5,
    category: "구매·성향 관련 정보",
    riskReason:
      "주문내역은 연락처와 결합될 경우 실제 거래를 알고 있는 것처럼 위장한 사칭에 활용될 수 있습니다.",
    possibleDamages: ["주문 사칭", "배송 사칭", "환불 사칭"],
    sourceIds: [1, 4],
  },

  전화번호: {
    weight: 10,
    category: "일반 개인정보 / 연락처",
    riskReason:
      "전화번호는 스미싱과 보이스피싱에 사용될 수 있는 직접적인 연락 경로입니다.",
    possibleDamages: ["스미싱", "보이스피싱", "번호 사칭"],
    sourceIds: [1, 3, 4],
  },

  계정정보: {
    weight: 10,
    category: "계정 식별정보",
    riskReason:
      "로그인 ID나 사용자명은 비밀번호 또는 이메일과 결합될 경우 계정 공격에 활용될 수 있습니다.",
    possibleDamages: ["로그인 시도", "계정 사칭", "계정 탈취"],
    sourceIds: [3, 6, 7],
  },

  CI: {
    weight: 20,
    category: "본인확인 연계정보",
    riskReason:
      "CI는 본인확인 과정에서 생성되는 연계정보로, 여러 서비스에서 동일인을 연결하는 데 이용될 수 있어 다른 개인정보와 결합될 경우 개인 식별 및 사칭 위험을 높일 수 있습니다.",
    possibleDamages: [
      "개인 식별 보강",
      "개인화된 피싱·사칭",
      "서비스 간 정보 연계",
    ],
    sourceIds: [10],
  },

  DI: {
    weight: 10,
    category: "본인확인 식별정보",
    riskReason:
      "DI는 서비스 내 중복가입 여부 확인 등에 사용되는 정보로, 계정정보나 연락처와 결합될 경우 사용자 식별과 사칭을 보강할 수 있습니다.",
    possibleDamages: [
      "계정 식별 보강",
      "개인화된 피싱·사칭",
    ],
    sourceIds: [10],
  },

  통신가입자식별정보: {
    weight: 10,
    category: "통신 가입자 식별정보",
    riskReason:
      "통신 가입자를 식별하는 정보는 통신사 사칭이나 본인확인 사칭에 활용될 수 있습니다.",
    possibleDamages: ["통신사 사칭", "본인인증 사칭", "명의도용 주의"],
    sourceIds: [1, 3, 4],
  },

  결제내역: {
    weight: 10,
    category: "구매·결제 관련 정보",
    riskReason:
      "결제일시와 금액 등의 정보는 실제 결제를 알고 있는 것처럼 위장한 환불·결제 사칭에 활용될 수 있습니다.",
    possibleDamages: ["결제 사칭", "환불 사칭", "개인화된 피싱"],
    sourceIds: [1, 4, 6],
  },

  계좌번호: {
    weight: 20,
    category: "신용·금융 관련 정보",
    riskReason:
      "계좌번호는 금융기관이나 송금을 사칭하는 범죄에 활용될 수 있는 금융 관련 정보입니다.",
    possibleDamages: ["금융 사칭", "송금 사칭", "보이스피싱"],
    sourceIds: [1, 5, 9],
  },

  카드번호: {
    weight: 25,
    category: "신용·금융 관련 정보",
    riskReason:
      "카드번호는 무단결제와 금융사기 등 직접적인 금전 피해로 이어질 수 있습니다.",
    possibleDamages: ["무단결제", "금융사기", "결제 사칭"],
    sourceIds: [1, 5],
  },

  비밀번호: {
    weight: 30,
    category: "인증정보",
    riskReason:
      "비밀번호는 계정 접근에 직접 사용되는 인증정보이므로 단독 유출만으로도 계정 탈취 위험이 있습니다.",
    possibleDamages: ["계정 탈취", "다른 서비스 계정 침해", "결제수단 악용"],
    sourceIds: [3, 5, 6, 7],
  },

  IMEI: {
    weight: 10,
    category: "통신 단말 식별정보",
    riskReason:
      "IMEI는 휴대전화 단말을 식별하는 정보로, 휴대전화번호나 가입자 식별정보와 결합될 경우 특정 사용자와 단말을 연결하는 데 활용될 수 있습니다.",
    possibleDamages: [
      "단말 식별",
      "통신사 사칭 보강",
      "개인화된 피싱·사칭",
    ],
    sourceIds: [11, 12],
  },

  통신인증정보: {
    weight: 30,
    category: "통신 인증정보",
    riskReason:
      "유심 인증키와 같은 통신 인증정보는 회선 보호와 본인인증 안전에 직접 관련된 민감한 인증정보입니다.",
    possibleDamages: ["통신사 사칭", "본인인증 악용", "명의도용 주의"],
    sourceIds: [1, 3, 5],
  },

  주민등록번호: {
    weight: 35,
    category: "고유식별정보",
    riskReason:
      "주민등록번호는 변경과 회복이 어려운 고유식별정보로 명의도용과 본인인증 악용에 이용될 수 있습니다.",
    possibleDamages: ["명의도용", "본인인증 악용", "불법 가입"],
    sourceIds: [5, 8],
  },

  여권번호: {
    weight: 35,
    category: "고유식별정보",
    riskReason:
      "여권번호는 공식 신분 확인에 사용되는 고유식별정보로, 신분 사칭이나 본인확인 악용에 활용될 수 있습니다.",
    possibleDamages: ["신분 사칭", "본인확인 악용", "피싱·사칭"],
    sourceIds: [1, 5],
  },

  운전면허번호: {
    weight: 35,
    category: "고유식별정보",
    riskReason:
      "운전면허번호는 공식 신분증에 포함되는 고유식별정보로, 신분 사칭이나 본인확인 과정에 악용될 수 있습니다.",
    possibleDamages: ["신분 사칭", "본인확인 악용", "피싱·사칭"],
    sourceIds: [1, 5],
  },

  외국인등록번호: {
    weight: 35,
    category: "고유식별정보",
    riskReason:
      "외국인등록번호는 국내 체류 외국인을 식별하는 고유식별정보로, 명의도용이나 본인확인 악용에 활용될 수 있습니다.",
    possibleDamages: ["명의도용", "본인확인 악용", "신분 사칭"],
    sourceIds: [1, 5],
  },
} satisfies Record<string, RiskCriterion>;

export type RiskItemKey = keyof typeof RISK_CRITERIA;

/**
 * 기존 Gemini·체크리스트 코드와의 호환을 위한 항목명 변환입니다.
 * 다른 파일의 명칭을 모두 바꿀 때까지 유지합니다.
 */
const RISK_ITEM_ALIASES: Record<string, RiskItemKey> = {
  이름: "이름",
  성명: "이름",
  실명: "이름",
  입력한이름: "이름",

  생년월일: "생년월일",

  이메일: "이메일",
  이메일주소: "이메일",

  주소: "주소",
  거주지: "주소",
  배송지: "주소",
  본인주소: "주소",

  주문내역: "주문내역",
  주문정보: "주문내역",
  구매내역: "주문내역",

  전화번호: "전화번호",
  휴대전화번호: "전화번호",
  휴대폰번호: "전화번호",
  가입자전화번호: "전화번호",

  계정정보: "계정정보",
  계정ID: "계정정보",
  로그인정보: "계정정보",

  CI: "CI",
  연계정보: "CI",

  DI: "DI",
  중복가입확인정보: "DI",

  통신가입자식별정보: "통신가입자식별정보",
  IMSI: "통신가입자식별정보",
  가입자식별번호: "통신가입자식별정보",
  "가입자식별번호(IMSI)": "통신가입자식별정보",
  국제이동가입자식별번호: "통신가입자식별정보",

  IMEI: "IMEI",
  단말기식별번호: "IMEI",

  통신인증정보: "통신인증정보",
  유심인증키: "통신인증정보",
  USIM인증키: "통신인증정보",
  SIM인증키: "통신인증정보",

  결제내역: "결제내역",
  결제정보: "결제내역",

  계좌번호: "계좌번호",
  계좌정보: "계좌번호",
  통장계좌번호: "계좌번호",
  은행계좌번호: "계좌번호",
  환불계좌번호: "계좌번호",

  카드번호: "카드번호",
  카드정보: "카드번호",
  신용카드정보: "카드번호",

  비밀번호: "비밀번호",
  패스워드: "비밀번호",
  로그인패스워드: "비밀번호",
  계정패스워드: "비밀번호",
  계정로그인패스워드: "비밀번호",
  로그인비밀번호: "비밀번호",
  계정비밀번호: "비밀번호",
  계정로그인비밀번호: "비밀번호",

  주민등록번호: "주민등록번호",
  주민번호: "주민등록번호",

  여권번호: "여권번호",

  운전면허번호: "운전면허번호",

  외국인등록번호: "외국인등록번호",
};

export const RISK_ITEM_WEIGHTS: Record<RiskItemKey, number> =
  Object.fromEntries(
    Object.entries(RISK_CRITERIA).map(([item, criterion]) => [
      item,
      criterion.weight,
    ])
  ) as Record<RiskItemKey, number>;

type CombinationGroup =
  | "personalizedFraud"
  | "accountTakeover"
  | "financialDamage";

type CombinationRule = {
  id: string;
  label: string;
  group: CombinationGroup;
  items: RiskItemKey[];
  bonus: number;
  riskTypes: string[];
  reason: string;
  sourceIds: number[];
};

export const COMBINATION_RULES: CombinationRule[] = [
  {
    id: "name-phone",
    label: "이름 + 전화번호",
    group: "personalizedFraud",
    items: ["이름", "전화번호"],
    bonus: 5,
    riskTypes: ["개인화된 스미싱", "사칭"],
    reason:
      "이름과 전화번호가 함께 유출되어 사용자를 특정한 연락과 사칭이 가능해졌습니다.",
    sourceIds: [1, 3, 4],
  },
  {
    id: "phone-order",
    label: "전화번호 + 주문내역",
    group: "personalizedFraud",
    items: ["전화번호", "주문내역"],
    bonus: 10,
    riskTypes: ["주문 사칭", "배송 사칭"],
    reason:
      "전화번호와 주문내역이 함께 유출되어 실제 구매 정보를 이용한 사칭 가능성이 증가했습니다.",
    sourceIds: [1, 4],
  },
  {
    id: "name-phone-address",
    label: "이름 + 전화번호 + 주소",
    group: "personalizedFraud",
    items: ["이름", "전화번호", "주소"],
    bonus: 15,
    riskTypes: ["정교한 개인 사칭", "피싱"],
    reason:
      "여러 식별정보와 연락처가 함께 유출되어 신뢰도 높은 개인화 사칭이 가능해졌습니다.",
    sourceIds: [1, 2, 4],
  },
  {
    id: "name-phone-order",
    label: "이름 + 전화번호 + 주문내역",
    group: "personalizedFraud",
    items: ["이름", "전화번호", "주문내역"],
    bonus: 15,
    riskTypes: ["구매 사칭", "배송 사칭", "피싱"],
    reason:
      "사용자의 이름과 연락처, 실제 주문정보가 결합되어 구매·배송 관련 사칭 가능성이 크게 증가했습니다.",
    sourceIds: [1, 4],
  },
  {
    id: "email-password",
    label: "이메일 + 비밀번호",
    group: "accountTakeover",
    items: ["이메일", "비밀번호"],
    bonus: 20,
    riskTypes: ["계정 탈취", "다른 서비스 계정 침해"],
    reason:
      "이메일과 비밀번호가 함께 유출되어 계정에 직접 접근할 가능성이 증가했습니다.",
    sourceIds: [3, 5, 6, 7],
  },
  {
    id: "bank-account-phone",
    label: "계좌번호 + 전화번호",
    group: "financialDamage",
    items: ["계좌번호", "전화번호"],
    bonus: 10,
    riskTypes: ["금융기관 사칭", "송금 사칭", "보이스피싱"],
    reason:
      "계좌번호와 연락처가 함께 유출되어 실제 금융정보를 이용한 사칭 가능성이 증가했습니다.",
    sourceIds: [1, 4, 5, 9],
  },
  {
    id: "card-payment",
    label: "카드번호 + 결제내역",
    group: "financialDamage",
    items: ["카드번호", "결제내역"],
    bonus: 15,
    riskTypes: ["무단결제", "결제 사칭", "금융사기"],
    reason:
      "카드번호와 실제 결제 맥락이 함께 유출되어 직접적인 결제 피해 가능성이 증가했습니다.",
    sourceIds: [1, 4, 5],
  },
];

type AdjustmentRule = {
  id: string;
  items: RiskItemKey[];
  bonus: number;
  minimumScore: number;
  reason: string;
  sourceIds: number[];
};

export const IMPORTANT_INFORMATION_RULES: AdjustmentRule[] = [
  {
    id: "rrn-minimum-high",
    items: ["주민등록번호"],
    bonus: 15,
    minimumScore: 40,
    reason:
      "주민등록번호는 회복과 변경이 어려운 고유식별정보이므로 최소 높은 위험으로 판단합니다.",
    sourceIds: [5, 8],
  },
  {
    id: "passport-number-minimum-high",
    items: ["여권번호"],
    bonus: 15,
    minimumScore: 40,
    reason:
      "여권번호는 공식 신분 확인에 사용되는 고유식별정보이므로 최소 높은 위험으로 판단합니다.",
    sourceIds: [1, 5],
  },
  {
    id: "driver-license-number-minimum-high",
    items: ["운전면허번호"],
    bonus: 15,
    minimumScore: 40,
    reason:
      "운전면허번호는 공식 신분증에 포함되는 고유식별정보이므로 최소 높은 위험으로 판단합니다.",
    sourceIds: [1, 5],
  },
  {
    id: "alien-registration-number-minimum-high",
    items: ["외국인등록번호"],
    bonus: 15,
    minimumScore: 40,
    reason:
      "외국인등록번호는 국내 체류 외국인을 식별하는 고유식별정보이므로 최소 높은 위험으로 판단합니다.",
    sourceIds: [1, 5],
  },
  {
    id: "password-minimum-high",
    items: ["비밀번호"],
    bonus: 15,
    minimumScore: 40,
    reason:
      "비밀번호는 계정 접근에 직접 사용되는 인증정보이므로 최소 높은 위험으로 판단합니다.",
    sourceIds: [3, 5, 6, 7],
  },
  {
    id: "card-minimum-medium",
    items: ["카드번호"],
    bonus: 10,
    minimumScore: 20,
    reason:
      "카드번호는 무단결제 등 직접적인 금융 피해 가능성이 있어 최소 보통 위험으로 판단합니다.",
    sourceIds: [1, 5],
  },
  {
    id: "bank-account-minimum-medium",
    items: ["계좌번호"],
    bonus: 10,
    minimumScore: 20,
    reason:
      "계좌번호는 금융사기와 금융기관 사칭에 활용될 수 있어 최소 보통 위험으로 판단합니다.",
    sourceIds: [1, 5, 9],
  },
];

const BASE_SCORE_LIMIT = 60;
const COMBINATION_SCORE_LIMIT = 25;
const MAX_SCORE = 100;

const HIGH_THRESHOLD = 40;
const MEDIUM_THRESHOLD = 20;

export function normalizeRiskItem(item: string): RiskItemKey | null {
  const normalized = item.replace(/\s/g, "").trim();
  const alias = RISK_ITEM_ALIASES[normalized];

  if (alias) {
    return alias;
  }

  const withoutTrailingParenthetical = normalized.replace(/\([^()]*\)$/, "");
  const aliasWithoutTrailingParenthetical =
    withoutTrailingParenthetical !== normalized
      ? RISK_ITEM_ALIASES[withoutTrailingParenthetical]
      : null;

  if (aliasWithoutTrailingParenthetical) {
    return aliasWithoutTrailingParenthetical;
  }

  if (normalized.startsWith("가입자식별번호(")) {
    return "통신가입자식별정보";
  }

  if (
    normalized.startsWith("유심인증키") ||
    normalized.startsWith("USIM인증키") ||
    normalized.startsWith("SIM인증키")
  ) {
    return "통신인증정보";
  }

  return null;
}

function includesAllItems(
  leakedItemSet: Set<RiskItemKey>,
  requiredItems: RiskItemKey[]
): boolean {
  return requiredItems.every((item) => leakedItemSet.has(item));
}

export type RiskCalculationResult = {
  riskLevel: RiskLevel;
  score: number;
  baseScore: number;
  combinationScore: number;
  adjustmentScore: number;
  evaluatedItems: RiskItemKey[];
  riskReasons: string[];
  matchedCombinationRules: string[];
  sourceIds: number[];
};

export function calculateRiskLevel(
  leakedItems: string[]
): RiskCalculationResult {
  const evaluatedItems = Array.from(
    new Set(
      leakedItems
        .map(normalizeRiskItem)
        .filter((item): item is RiskItemKey => item !== null)
    )
  );

  const leakedItemSet = new Set<RiskItemKey>(evaluatedItems);

  const rawBaseScore = evaluatedItems.reduce(
    (sum, item) => sum + RISK_CRITERIA[item].weight,
    0
  );

  const baseScore = Math.min(rawBaseScore, BASE_SCORE_LIMIT);

  const matchedRules = COMBINATION_RULES.filter((rule) =>
    includesAllItems(leakedItemSet, rule.items)
  );

  /**
   * 같은 피해 유형의 조합이 여러 개 일치하면
   * 가장 높은 가중치 규칙 하나만 적용합니다.
   */
  const highestRuleByGroup = new Map<
    CombinationGroup,
    CombinationRule
  >();

  for (const rule of matchedRules) {
    const currentRule = highestRuleByGroup.get(rule.group);

    if (!currentRule || rule.bonus > currentRule.bonus) {
      highestRuleByGroup.set(rule.group, rule);
    }
  }

  const appliedCombinationRules = Array.from(
    highestRuleByGroup.values()
  );

  const rawCombinationScore = appliedCombinationRules.reduce(
    (sum, rule) => sum + rule.bonus,
    0
  );

  const combinationScore = Math.min(
    rawCombinationScore,
    COMBINATION_SCORE_LIMIT
  );

  const appliedAdjustmentRules = IMPORTANT_INFORMATION_RULES.filter(
    (rule) => includesAllItems(leakedItemSet, rule.items)
  );

  /**
   * 중요정보가 여러 개 포함되더라도 보정점수는
   * 가장 높은 값 하나만 적용합니다.
   */
  const adjustmentScore = appliedAdjustmentRules.reduce(
    (highest, rule) => Math.max(highest, rule.bonus),
    0
  );

  const minimumRequiredScore = appliedAdjustmentRules.reduce(
    (highest, rule) => Math.max(highest, rule.minimumScore),
    0
  );

  const calculatedScore = Math.min(
    baseScore + combinationScore + adjustmentScore,
    MAX_SCORE
  );

  const score = Math.min(
    Math.max(calculatedScore, minimumRequiredScore),
    MAX_SCORE
  );

  const riskLevel: RiskLevel =
    score >= HIGH_THRESHOLD
      ? "높음"
      : score >= MEDIUM_THRESHOLD
        ? "보통"
        : "낮음";

  const riskReasons = Array.from(
    new Set([
      ...evaluatedItems.map(
        (item) => RISK_CRITERIA[item].riskReason
      ),
      ...appliedCombinationRules.map((rule) => rule.reason),
      ...appliedAdjustmentRules.map((rule) => rule.reason),
    ])
  );

  const sourceIds = Array.from(
    new Set([
      ...evaluatedItems.flatMap(
        (item) => RISK_CRITERIA[item].sourceIds
      ),
      ...appliedCombinationRules.flatMap(
        (rule) => rule.sourceIds
      ),
      ...appliedAdjustmentRules.flatMap(
        (rule) => rule.sourceIds
      ),
    ])
  ).sort((a, b) => a - b);

  return {
    riskLevel,
    score,
    baseScore,
    combinationScore,
    adjustmentScore,
    evaluatedItems,
    riskReasons,
    matchedCombinationRules: appliedCombinationRules.map(
      (rule) => rule.label
    ),
    sourceIds,
  };
}
