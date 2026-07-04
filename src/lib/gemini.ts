import type {
  LeakAnalysisResult,
  RiskLevel,
  SmsAnalysisResult,
} from "../types/analysis";
import type { NaverNewsResult } from "./googleSearch";
import { providerLinks } from "../data/providerLinks";

export type ExtractedKeyInfo = {
  company: string;
  service?: string;
  leakedItems: string[];
  riskTypes: string[];
  riskLevel: RiskLevel;
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
  if (value === "낮음" || value === "보통" || value === "높음") {
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
        .filter((item): item is string => typeof item === "string")
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
      throw new Error("Gemini 응답에서 JSON을 찾지 못했습니다.");
    }

    return JSON.parse(match[0]) as T;
  }
}

async function callGeminiJson<T>(prompt: string): Promise<T> {
  const apiKey = getGeminiApiKey();
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

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
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API 호출 실패: ${response.status} ${errorText}`);
  }

  const data = await response.json();

  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text ?? "")
      .join("") ?? "";

  if (!text) {
    throw new Error("Gemini 응답이 비어 있습니다.");
  }

  return parseJsonFromGemini<T>(text);
}

export async function extractKeyInfo(inputText: string): Promise<ExtractedKeyInfo> {
  const prompt = `
너는 개인정보 유출 안내문을 분석하는 보안 도우미다.

아래 입력문을 분석해서 반드시 JSON만 반환해라.
마크다운 코드블록을 쓰지 말고 JSON 객체만 반환해라.

반환 형식:
{
  "company": "기업명 또는 알 수 없음",
  "service": "서비스명 또는 빈 문자열",
  "leakedItems": ["이름", "전화번호", "이메일", "주소", "주문내역", "계정정보", "비밀번호", "결제정보", "카드정보", "생년월일", "주민등록번호"],
  "riskTypes": ["스미싱", "피싱", "택배 사칭", "계정 탈취", "명의도용"],
  "riskLevel": "낮음" | "보통" | "높음",
  "reason": "위험도 판단 이유 한두 문장"
}

규칙:
- 유출 항목은 입력문에 근거가 있을 때만 넣어라.
- 확실하지 않으면 과장하지 마라.
- riskLevel은 반드시 "낮음", "보통", "높음" 중 하나만 사용해라.
- company를 모르면 "알 수 없음"으로 써라.

입력문:
"""
${inputText}
"""
`;

  const result = await callGeminiJson<Partial<ExtractedKeyInfo>>(prompt);

  return {
    company:
      typeof result.company === "string" && result.company.trim()
        ? result.company.trim()
        : "알 수 없음",
    service:
      typeof result.service === "string" && result.service.trim()
        ? result.service.trim()
        : undefined,
    leakedItems: uniqueStringArray(result.leakedItems).map(normalizeLeakedItem),
    riskTypes: uniqueStringArray(result.riskTypes),
    riskLevel: normalizeRiskLevel(result.riskLevel),
    reason:
      typeof result.reason === "string" && result.reason.trim()
        ? result.reason.trim()
        : "입력문에 포함된 유출 항목을 기준으로 위험도를 판단했습니다.",
  };
}

export async function analyzeWithSearchContext(params: {
  inputText: string;
  extracted: ExtractedKeyInfo;
  searchResults: NaverNewsResult[];
}): Promise<LeakFinalText> {
  const { inputText, extracted, searchResults } = params;

  const evidenceText = searchResults
    .map(
      (item, index) =>
        `${index + 1}. 제목: ${item.title}\n요약: ${item.summary}\nURL: ${item.url}`
    )
    .join("\n\n");

  const prompt = `
너는 개인정보 유출 사고 대응을 돕는 보안 도우미다.

아래 정보들을 바탕으로 최종 분석 문구를 작성해라.
반드시 JSON만 반환해라.
마크다운 코드블록을 쓰지 마라.

반환 형식:
{
  "riskLevel": "낮음" | "보통" | "높음",
  "riskTypes": ["스미싱", "피싱", "택배 사칭"],
  "reason": "검색 결과와 입력문을 종합한 판단 근거",
  "familyMessage": "가족에게 전달할 수 있는 쉬운 안내문",
  "reportSummary": "상담 또는 신고 시 사용할 수 있는 요약문"
}

주의:
- 검색 결과가 부족하면 입력문 기준으로 판단하되, 근거가 부족하다고 명시해라.
- 사용자가 바로 이해할 수 있게 짧고 명확하게 작성해라.
- riskLevel은 반드시 "낮음", "보통", "높음" 중 하나만 사용해라.

[입력문]
${inputText}

[1차 추출 결과]
${JSON.stringify(extracted, null, 2)}

[검색 결과]
${evidenceText || "검색 결과 없음"}
`;

  const result = await callGeminiJson<Partial<LeakFinalText>>(prompt);

  return {
    riskLevel: normalizeRiskLevel(result.riskLevel ?? extracted.riskLevel),
    riskTypes:
      result.riskTypes && result.riskTypes.length > 0
        ? uniqueStringArray(result.riskTypes)
        : extracted.riskTypes,
    reason:
      typeof result.reason === "string" && result.reason.trim()
        ? result.reason.trim()
        : extracted.reason,
    familyMessage:
      typeof result.familyMessage === "string" && result.familyMessage.trim()
        ? result.familyMessage.trim()
        : "개인정보 유출 가능성이 있어 의심 문자나 링크를 주의해 주세요.",
    reportSummary:
      typeof result.reportSummary === "string" && result.reportSummary.trim()
        ? result.reportSummary.trim()
        : `${extracted.company} 관련 개인정보 유출 안내문을 확인했습니다.`,
  };
}

export async function analyzeSuspiciousMessage(
  inputText: string
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

입력 문자:
"""
${inputText}
"""
`;

  const result = await callGeminiJson<{
    riskLevel?: RiskLevel;
    isSmishing?: boolean;
    riskTypes?: string[];
    reason?: string;
  }>(prompt);

  const riskLevel = normalizeRiskLevel(result.riskLevel);
  const isSmishing = Boolean(result.isSmishing);
  const riskTypes = uniqueStringArray(result.riskTypes);

  return {
    type: "sms",
    riskLevel,
    isSmishing,
    riskTypes,
    reason:
      typeof result.reason === "string" && result.reason.trim()
        ? result.reason.trim()
        : "문자 내용의 링크, 요구 행동, 표현 패턴을 기준으로 위험 여부를 판단했습니다.",
    recommendedActions: [
      {
        id: "sms-do-not-click",
        priority: "즉시 조치",
        title: "문자에 포함된 링크를 누르지 마세요.",
        description:
          "의심 문자는 링크를 누르지 말고 공식 앱이나 홈페이지를 직접 열어 확인해야 합니다.",
        isCompleted: false,
        link: providerLinks.kisaBoho,
      },
      {
        id: "sms-report-if-needed",
        priority: "필요 시 관리",
        title: "피해가 의심되면 신고 기관에 상담하세요.",
        description:
          "개인정보를 입력했거나 금전 피해가 의심된다면 관련 기관에 상담 또는 신고하세요.",
        isCompleted: false,
        link: providerLinks.privacyReport,
      },
    ],
  };
}