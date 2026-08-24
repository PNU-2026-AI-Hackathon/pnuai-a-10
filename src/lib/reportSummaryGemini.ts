import type {
  ReportSummaryRequest,
  ReportSummaryResponse,
  ReportSummarySections,
} from "../types/analysis";

type GeminiReportSummaryResult = {
  summaryText?: unknown;
  sections?: {
    incidentOverview?: unknown;
    leakedInformation?: unknown;
    damageStatus?: unknown;
    evidence?: unknown;
    actionsTaken?: unknown;
    requestDetails?: unknown;
  };
};

type OpenRouterChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

const OPENROUTER_ENDPOINT =
  "https://openrouter.ai/api/v1/chat/completions";

function getOpenRouterApiKey(): string {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Gemini 신고 요약문 생성 실패: OPENROUTER_API_KEY가 설정되지 않았습니다."
    );
  }

  return apiKey;
}

function getOpenRouterModel(): string {
  return (
    process.env.OPENROUTER_MODEL?.trim() ||
    "google/gemini-2.5-flash"
  );
}

function parseJsonFromGemini<T>(
  text: string
): T {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const jsonMatch =
      cleaned.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error(
        "Gemini 응답에서 JSON을 찾지 못했습니다."
      );
    }

    return JSON.parse(jsonMatch[0]) as T;
  }
}

function readGeneratedText(
  value: unknown,
  fallback: string
): string {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return fallback;
  }

  return value.trim();
}

async function callGeminiForReport(
  prompt: string,
  signal?: AbortSignal
): Promise<GeminiReportSummaryResult> {
  const apiKey = getOpenRouterApiKey();
  const model = getOpenRouterModel();

  const response = await fetch(OPENROUTER_ENDPOINT, {
    method: "POST",

    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer":
        process.env.NEXT_PUBLIC_SITE_URL ??
        "https://leakcare.vercel.app",
      "X-OpenRouter-Title": "LeakCare",
    },

    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.1,
      response_format: {
        type: "json_object",
      },
    }),

    signal,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Gemini 신고 요약문 생성 실패: ${response.status}`
    );
  }

  const data =
    (await response.json()) as OpenRouterChatCompletionResponse;

  const responseText =
    data.choices?.[0]?.message?.content?.trim() ?? "";

  if (!responseText) {
    throw new Error(
      "Gemini 신고 요약문 응답이 비어 있습니다."
    );
  }

  return parseJsonFromGemini<GeminiReportSummaryResult>(
    responseText
  );
}

export async function generateReportSummaryWithGemini(
  input: ReportSummaryRequest,
  template: ReportSummaryResponse,
  signal?: AbortSignal
): Promise<ReportSummaryResponse> {
  const prompt = `
너는 개인정보 유출 사건의 신고·상담용 요약문을 정리하는 문서 작성 도우미다.

아래 사용자가 입력한 사실과 기본 템플릿만 사용해서 문장을 자연스럽고 명확하게 다듬어라.

반드시 JSON 객체만 반환하고 마크다운 코드블록은 사용하지 마라.

반환 형식:
{
  "summaryText": "전체 신고·상담용 요약문",
  "sections": {
    "incidentOverview": "사건 개요",
    "leakedInformation": "확인된 유출 정보",
    "damageStatus": "현재 피해 상태",
    "evidence": "보유 증거 및 의심 연락",
    "actionsTaken": "이미 취한 조치",
    "requestDetails": "상담 또는 신고 요청 내용"
  }
}

[절대 규칙]
- 입력된 사실과 기본 템플릿에 포함된 내용만 사용해라.
- 입력에 없는 날짜, 금액, 피해 내용, 범죄 사실을 만들어내지 마라.
- 피해가 없다고 입력된 경우 피해가 발생한 것처럼 작성하지 마라.
- 피해가 의심된다고 입력된 경우 피해가 확정된 것처럼 작성하지 마라.
- 기업명이나 서비스명을 임의로 추정하지 마라.
- 확인되지 않은 유출 항목을 추가하지 마라.
- 사용자가 취하지 않은 대응 조치를 추가하지 마라.
- 특정 기관에 이미 신고한 것처럼 작성하지 마라.
- 법률적 판단이나 범죄 성립 여부를 단정하지 마라.
- 누락된 정보는 임의로 채우지 마라.
- 과장되거나 불안을 유발하는 표현을 사용하지 마라.
- 신고 기관 담당자가 이해하기 쉽도록 사실 중심으로 작성해라.
- 각 항목은 짧고 명확하게 작성해라.
- 기본 템플릿의 의미를 바꾸지 말고 문장만 자연스럽게 다듬어라.
- 입력에 포함된 LeakCare 내부 마스킹 토큰은 어떤 경우에도 수정, 번역, 삭제, 분리, 병합, 재정렬하지 말고 토큰 문자열을 정확히 그대로 출력해라.

[사용자 입력]
${JSON.stringify(input, null, 2)}

[기본 템플릿]
${JSON.stringify(template, null, 2)}
`;

  const generated =
    await callGeminiForReport(prompt, signal);

  const generatedSections =
    generated.sections ?? {};

  const sections: ReportSummarySections = {
    incidentOverview: readGeneratedText(
      generatedSections.incidentOverview,
      template.sections.incidentOverview
    ),

    leakedInformation: readGeneratedText(
      generatedSections.leakedInformation,
      template.sections.leakedInformation
    ),

    damageStatus: readGeneratedText(
      generatedSections.damageStatus,
      template.sections.damageStatus
    ),

    evidence: readGeneratedText(
      generatedSections.evidence,
      template.sections.evidence
    ),

    actionsTaken: readGeneratedText(
      generatedSections.actionsTaken,
      template.sections.actionsTaken
    ),

    requestDetails: readGeneratedText(
      generatedSections.requestDetails,
      template.sections.requestDetails
    ),
  };

  return {
    // 제목은 고정값을 유지합니다.
    title: template.title,

    summaryText: readGeneratedText(
      generated.summaryText,
      template.summaryText
    ),

    sections,

    // 누락 항목 판단은 Gemini가 아니라
    // 서버 템플릿 계산 결과를 유지합니다.
    missingFields: template.missingFields,

    generationMode: "gemini",
  };
}
