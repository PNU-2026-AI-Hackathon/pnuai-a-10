import type {
  RiskLevel,
  SmsAnalysisResult,
} from "../types/analysis";
import type { NaverNewsResult } from "./googleSearch";
import { providerLinks } from "../data/providerLinks";
import { calculateRiskLevel } from "../data/riskCriteria";

export type ExtractedKeyInfo = {
  company: string;
  service?: string;
  leakedItems: string[];
  riskTypes: string[];
  riskLevel: RiskLevel;

  riskScore: number;
  baseScore: number;
  combinationScore: number;
  adjustmentScore: number;
  riskReasons: string[];
  matchedCombinationRules: string[];
  sourceIds: number[];

  reason: string;
};

type LeakFinalText = {
  riskLevel?: RiskLevel;
  riskTypes?: string[];
  reason: string;
  familyMessage: string;
  reportSummary: string;
};

function getGeminiApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY가 설정되지 않았습니다.");
  }

  return apiKey;
}

function normalizeRiskLevel(value: unknown): RiskLevel {
  if (
    value === "낮음" ||
    value === "보통" ||
    value === "높음"
  ) {
    return value;
  }

  return "보통";
}

function normalizeLeakedItem(item: string): string {
  const normalized = item.replace(/\s/g, "");

  const map: Record<string, string> = {
    휴대전화번호: "전화번호",
    휴대폰번호: "전화번호",
    핸드폰번호: "전화번호",
    전화: "전화번호",

    메일: "이메일",
    이메일주소: "이메일",
    전자우편: "이메일",

    거주지: "주소",
    배송지: "주소",

    주문정보: "주문내역",
    구매내역: "주문내역",

    계정ID: "계정정보",
    아이디: "계정정보",
    로그인정보: "계정정보",

    패스워드: "비밀번호",

    카드번호: "카드정보",
    신용카드정보: "카드정보",

    결제수단: "결제정보",

    주민번호: "주민등록번호",
    주민등록: "주민등록번호",
  };

  return map[normalized] ?? item.trim();
}

function uniqueStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter(
          (item): item is string =>
            typeof item === "string"
        )
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
}

function parseJsonFromGemini<T>(text: string): T {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);

    if (!match) {
      throw new Error(
        "Gemini 응답에서 JSON을 찾지 못했습니다."
      );
    }

    return JSON.parse(match[0]) as T;
  }
}

async function callGeminiJson<T>(
  prompt: string,
  signal?: AbortSignal
): Promise<T> {
  const apiKey = getGeminiApiKey();
  const model =
    process.env.GEMINI_MODEL || "gemini-2.5-flash";

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
      signal,
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Gemini API 호출 실패: ${response.status} ${errorText}`
    );
  }

  const data = await response.json();

  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map(
        (part: { text?: string }) =>
          part.text ?? ""
      )
      .join("") ?? "";

  if (!text) {
    throw new Error("Gemini 응답이 비어 있습니다.");
  }

  return parseJsonFromGemini<T>(text);
}

export async function extractKeyInfo(
  inputText: string,
  signal?: AbortSignal
): Promise<ExtractedKeyInfo> {
  const prompt = `
너는 개인정보 유출 안내문을 분석하는 보안 도우미다.

아래 입력문을 분석해서 반드시 JSON만 반환해라.
마크다운 코드블록을 쓰지 말고 JSON 객체만 반환해라.

반환 형식:
{
  "company": "기업명 또는 알 수 없음",
  "service": "서비스명 또는 빈 문자열",
  "leakedItems": ["이름", "전화번호", "이메일", "주소", "주문내역", "계정정보", "비밀번호", "결제정보", "카드정보", "계좌번호", "생년월일", "주민등록번호"],
  "riskTypes": ["스미싱", "피싱", "택배 사칭", "계정 탈취", "명의도용"],
  "riskLevel": "낮음" | "보통" | "높음",
  "reason": "위험도 판단 이유 한두 문장"
}

규칙:
- 유출 항목은 입력문에 명시되거나 명확한 근거가 있을 때만 넣어라.
- 입력문에 없는 개인정보를 유출 항목에 임의로 추가하지 마라.
- 확실하지 않은 항목은 제외해라.
- 피해가 발생했다고 명시되지 않았다면 피해가 이미 발생했다고 단정하지 마라.
- 카드번호가 실제로 유출된 경우에만 "카드정보"를 넣어라.
- 은행 계좌번호가 실제로 유출된 경우에만 "계좌번호"를 넣어라.
- 결제일시, 결제금액, 결제수단 종류가 유출된 경우 "결제정보"를 넣어라.
- 결제정보가 유출되었다는 이유만으로 카드번호나 계좌번호가 유출되었다고 추정하지 마라.
- riskLevel은 반드시 "낮음", "보통", "높음" 중 하나만 사용해라.
- company를 모르면 "알 수 없음"으로 써라.

입력문:
"""
${inputText}
"""
`;

  const result =
    await callGeminiJson<
      Partial<ExtractedKeyInfo>
    >(prompt, signal);

  const leakedItems = uniqueStringArray(
    result.leakedItems
  ).map(normalizeLeakedItem);

  const riskCalculation =
    calculateRiskLevel(leakedItems);

  return {
    company:
      typeof result.company === "string" &&
      result.company.trim()
        ? result.company.trim()
        : "알 수 없음",

    service:
      typeof result.service === "string" &&
      result.service.trim()
        ? result.service.trim()
        : undefined,

    leakedItems,

    riskTypes: uniqueStringArray(
      result.riskTypes
    ),

    riskLevel: riskCalculation.riskLevel,
    riskScore: riskCalculation.score,
    baseScore: riskCalculation.baseScore,
    combinationScore:
      riskCalculation.combinationScore,
    adjustmentScore:
      riskCalculation.adjustmentScore,
    riskReasons: riskCalculation.riskReasons,
    matchedCombinationRules:
      riskCalculation.matchedCombinationRules,
    sourceIds: riskCalculation.sourceIds,

    reason:
      typeof result.reason === "string" &&
      result.reason.trim()
        ? result.reason.trim()
        : "입력문에 포함된 유출 항목을 기준으로 위험도를 판단했습니다.",
  };
}

export async function analyzeWithSearchContext(
  params: {
    inputText: string;
    extracted: ExtractedKeyInfo;
    searchResults: NaverNewsResult[];
  },
  signal?: AbortSignal
): Promise<LeakFinalText> {
  const {
    inputText,
    extracted,
    searchResults,
  } = params;

  const evidenceText = searchResults
    .map(
      (item, index) =>
        `${index + 1}. 제목: ${
          item.title
        }\n요약: ${item.summary}\nURL: ${
          item.url
        }`
    )
    .join("\n\n");

  const confirmedLeakedItems =
    extracted.leakedItems.length > 0
      ? extracted.leakedItems.join(", ")
      : "확인된 유출 항목 없음";

  const confirmedRiskTypes =
    extracted.riskTypes.length > 0
      ? extracted.riskTypes.join(", ")
      : "확인된 위험 유형 없음";

  const prompt = `
너는 개인정보 유출 사고 내용을 사용자가 이해하기 쉽게 설명하는 보안 도우미다.

현재 사고에서 확인된 사실만 사용해 최종 분석 문구를 작성해라.
반드시 JSON 객체만 반환하고 마크다운 코드블록은 사용하지 마라.

반환 형식:
{
  "riskLevel": "낮음" | "보통" | "높음",
  "riskTypes": ["스미싱", "피싱", "택배 사칭"],
  "reason": "확인된 유출 항목을 기준으로 한 간단한 설명",
  "familyMessage": "가족에게 전달할 수 있는 쉬운 주의 안내문",
  "reportSummary": "상담 또는 신고 시 사용할 수 있는 사실 중심 요약문"
}

[사실 사용 규칙]
- 현재 사고의 사실은 입력문과 확인된 유출 항목만을 기준으로 판단해라.
- 확인된 유출 항목에 없는 개인정보를 임의로 추가하거나 유출되었다고 추정하지 마라.
- 입력문에 없는 피해 사실을 만들어내지 마라.
- 입력문에 없는 공격이나 범죄가 이미 발생했다고 단정하지 마라.
- 확인된 위험 유형의 범위 안에서만 riskTypes를 작성해라.
- riskLevel과 riskScore는 LeakCare 규칙으로 계산된 결과이므로 변경하거나 재평가하지 마라.

[검색 결과 사용 규칙]
- 검색 결과는 일반적인 사고 사례와 사칭 수법을 설명하는 참고 맥락일 뿐이다.
- 검색 결과를 현재 사용자의 실제 유출 사실이나 피해 발생 증거로 사용하지 마라.
- 검색 기사에 등장하는 다른 기업, 피해자, 유출 항목을 현재 사고에 섞지 마라.
- 검색 결과에 현재 사고와 직접 관련된 정보가 없으면 억지로 언급하지 마라.
- 검색 결과가 부족하더라도 확인되지 않은 사실을 추정하지 마라.

[금융 관련 제한]
- 카드정보 또는 계좌번호가 확인된 유출 항목에 없는 경우 카드 정지, 계좌 정지, 지급정지, 금융계좌 모니터링, 부정결제 대응을 권고하지 마라.
- 결제정보만 유출된 경우 실제 카드번호나 계좌번호가 유출된 것처럼 설명하지 마라.
- 결제정보만 유출된 경우 무단결제나 계좌 탈취가 이미 발생했다고 단정하지 마라.
- 금전 피해가 입력문에 명시되지 않았다면 금전 피해가 발생했다고 단정하지 마라.

[계정 관련 제한]
- 비밀번호가 확인된 유출 항목에 없는 경우 비밀번호 변경을 필수 조치로 권고하지 마라.
- 계정정보만 유출된 경우 비밀번호까지 유출되었다고 추정하지 마라.
- 계정 탈취가 입력문에 명시되지 않았다면 계정이 이미 탈취되었다고 단정하지 마라.

[명의도용 관련 제한]
- 주민등록번호가 확인된 유출 항목에 없는 경우 주민등록번호 변경을 권고하지 마라.
- 주민등록번호가 확인된 유출 항목에 없는 경우 명의도용이 이미 발생했다고 단정하지 마라.
- 명의도용 피해가 입력문에 명시되지 않았다면 피해가 발생했다고 단정하지 마라.

[표현 제한]
- 피해 가능성을 설명할 때 "주의가 필요합니다", "악용될 수 있습니다", "사칭에 이용될 수 있습니다"처럼 표현해라.
- "반드시 피해가 발생합니다", "피해 가능성이 매우 높습니다", "즉시 피해가 발생합니다"처럼 확률을 단정하지 마라.
- 사용자의 불안을 과도하게 유발하는 표현을 사용하지 마라.
- 짧고 구체적인 문장으로 작성해라.
- 현재 사고와 무관한 대응 방법을 추가하지 마라.

[출력 항목별 규칙]
- reason에는 확인된 유출 항목과 악용 가능한 사칭 유형만 간단히 설명해라.
- familyMessage에는 가족이 조심해야 할 문자, 전화 또는 링크 유형만 포함해라.
- reportSummary에는 회사명, 확인된 유출 항목, 예상 가능한 사칭 유형만 포함해라.
- reportSummary에 입력문으로 확인되지 않은 금융 피해, 계정 탈취, 명의도용 피해를 추가하지 마라.

[입력문]
${inputText}

[확인된 회사]
${extracted.company}

[확인된 유출 항목]
${confirmedLeakedItems}

[LeakCare 위험도 계산 결과]
- 위험등급: ${extracted.riskLevel}
- 위험지수: ${extracted.riskScore}
- 확인된 위험 유형: ${confirmedRiskTypes}

[검색 참고 자료]
${evidenceText || "검색 결과 없음"}
`;

  const result =
    await callGeminiJson<
      Partial<LeakFinalText>
    >(prompt, signal);

  const allowedRiskTypes = new Set(
    extracted.riskTypes
  );

  const filteredRiskTypes =
    uniqueStringArray(
      result.riskTypes
    ).filter((riskType) =>
      allowedRiskTypes.has(riskType)
    );

  return {
    // 위험등급은 Gemini가 아니라
    // LeakCare 규칙 계산 결과를 사용합니다.
    riskLevel: extracted.riskLevel,

    // Gemini가 새로운 위험 유형을
    // 임의로 추가하지 못하게 제한합니다.
    riskTypes:
      filteredRiskTypes.length > 0
        ? filteredRiskTypes
        : extracted.riskTypes,

    reason:
      typeof result.reason === "string" &&
      result.reason.trim()
        ? result.reason.trim()
        : extracted.reason,

    familyMessage:
      typeof result.familyMessage ===
        "string" &&
      result.familyMessage.trim()
        ? result.familyMessage.trim()
        : `${extracted.company} 관련 개인정보 유출 안내가 확인되었습니다. 의심스러운 문자나 링크에 주의해 주세요.`,

    reportSummary:
      typeof result.reportSummary ===
        "string" &&
      result.reportSummary.trim()
        ? result.reportSummary.trim()
        : `${extracted.company}에서 ${confirmedLeakedItems} 유출이 확인되었습니다.`,
  };
}

export async function analyzeSuspiciousMessage(
  inputText: string,
  signal?: AbortSignal
): Promise<SmsAnalysisResult> {
  const prompt = `
너는 스미싱/피싱 의심 문자를 분석하는 보안 도우미다.

아래 문자를 분석해서 반드시 JSON만 반환해라.
마크다운 코드블록을 쓰지 마라.

반환 형식:
{
  "riskLevel": "낮음" | "보통" | "높음",
  "isSmishing": true,
  "riskTypes": ["스미싱", "본인인증 사칭", "택배 사칭", "환불 사칭"],
  "reason": "판단 근거 한두 문장"
}

판단 기준:
- 링크 클릭 유도
- 본인인증 요구
- 앱 설치 요구
- 계좌/카드/비밀번호 입력 요구
- 보상금/환불/배송 실패/계정 정지 등 긴급 표현
- 공식 기관이나 기업을 사칭하는 표현

규칙:
- 문자에 실제로 포함된 내용만 근거로 판단해라.
- 입력되지 않은 링크나 요구사항을 만들어내지 마라.
- 피해가 발생했다고 명시되지 않았다면 피해가 이미 발생했다고 단정하지 마라.
- 위험 가능성과 실제 피해 사실을 구분해서 설명해라.

입력 문자:
"""
${inputText}
"""
`;

  const result =
    await callGeminiJson<{
      riskLevel?: RiskLevel;
      isSmishing?: boolean;
      riskTypes?: string[];
      reason?: string;
    }>(prompt, signal);

  const riskLevel = normalizeRiskLevel(
    result.riskLevel
  );

  const isSmishing = Boolean(
    result.isSmishing
  );

  const riskTypes = uniqueStringArray(
    result.riskTypes
  );

  return {
    type: "sms",
    riskLevel,
    isSmishing,
    riskTypes,

    reason:
      typeof result.reason === "string" &&
      result.reason.trim()
        ? result.reason.trim()
        : "문자 내용의 링크, 요구 행동, 표현 패턴을 기준으로 위험 여부를 판단했습니다.",

    recommendedActions: [
      {
        id: "sms-do-not-click",
        priority: "즉시 조치",
        title:
          "문자에 포함된 링크를 누르지 마세요.",
        description:
          "의심 문자는 링크를 누르지 말고 공식 앱이나 홈페이지를 직접 열어 확인해야 합니다.",
        isCompleted: false,
        link: providerLinks.kisaBoho,
      },
      {
        id: "sms-report-if-needed",
        priority: "필요 시 관리",
        title:
          "피해가 의심되면 신고 기관에 상담하세요.",
        description:
          "개인정보를 입력했거나 금전 피해가 의심된다면 관련 기관에 상담 또는 신고하세요.",
        isCompleted: false,
        link: providerLinks.privacyReport,
      },
    ],
  };
}