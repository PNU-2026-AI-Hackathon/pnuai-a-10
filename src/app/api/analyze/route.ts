import { NextResponse } from "next/server";
import type { LeakAnalysisResult } from "../../../types/analysis";
import {
  buildChecklist,
  calculateChecklistProgress,
} from "../../../lib/checklist";
import {
  extractKeyInfo,
  analyzeWithSearchContext,
} from "../../../lib/gemini";
import { searchNaverNews } from "../../../lib/googleSearch";
import { createServerSupabaseClient } from "../../../lib/supabase/server";
import { TimeoutError, withTimeout } from "../../../lib/timeout";
import { getRiskSources } from "../../../data/riskSources";
import { maskPersonalInfo } from "../../../utils/personalInfoMasking";

const MAX_ANALYZE_INPUT_LENGTH = 30_000;
const NAVER_SEARCH_TIMEOUT_MS = 8_000;
const GEMINI_ANALYSIS_TIMEOUT_MS = 30_000;

async function runWithTimeout<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number
): Promise<T> {
  const controller = new AbortController();

  try {
    return await withTimeout(
      operation(controller.signal),
      timeoutMs
    );
  } finally {
    controller.abort();
  }
}

async function saveLeakHistoryIfLoggedIn(
  result: LeakAnalysisResult
) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const { error } = await supabase.from("history").insert({
    user_id: user.id,
    type: "leak",
    title: result.company
      ? `${result.company} 유출 안내문 분석`
      : "유출 안내문 분석",
    company: result.company ?? null,
    risk_level: result.riskLevel,
    leaked_items: result.leakedItems ?? [],
    risk_types: result.riskTypes ?? [],
    checklist: result.checklist ?? [],
    checklist_progress: calculateChecklistProgress(
      result.checklist ?? []
    ),
    result_summary:
      result.reportSummary ?? result.reason ?? null,
  });

  if (error) {
    console.error(
      "Failed to save leak history:",
      error.message
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      inputText?: string;
    } | null;

    const rawInputText = body?.inputText;
    const inputText = rawInputText?.trim();

    if (!inputText) {
      return NextResponse.json(
        { message: "inputText가 필요합니다." },
        { status: 400 }
      );
    }

    if (rawInputText.length > MAX_ANALYZE_INPUT_LENGTH) {
      return NextResponse.json(
        {
          message:
            "분석할 내용이 너무 깁니다. 내용을 30,000자 이하로 줄여 주세요.",
        },
        { status: 400 }
      );
    }

    const maskedInputText = maskPersonalInfo(inputText);

    const extracted = await runWithTimeout(
      (signal) => extractKeyInfo(maskedInputText, signal),
      GEMINI_ANALYSIS_TIMEOUT_MS
    );

    const searchQuery =
      extracted.company &&
      extracted.company !== "알 수 없음"
        ? `${extracted.company} 개인정보 유출`
        : "개인정보 유출";

    let searchResults: Awaited<
      ReturnType<typeof searchNaverNews>
    > = [];

    try {
      searchResults = await runWithTimeout(
        (signal) => searchNaverNews(searchQuery, signal),
        NAVER_SEARCH_TIMEOUT_MS
      );
    } catch (error) {
      console.error("Naver search failed:", error);
      searchResults = [];
    }

    const finalText = await runWithTimeout(
      (signal) =>
        analyzeWithSearchContext(
          {
            inputText: maskedInputText,
            extracted,
            searchResults,
          },
          signal
        ),
      GEMINI_ANALYSIS_TIMEOUT_MS
    );

    const checklist = buildChecklist(
      extracted.leakedItems
    );

    const result: LeakAnalysisResult = {
      type: "leak",
      company: extracted.company,
      service: extracted.service,

      riskLevel: extracted.riskLevel,
      riskScore: extracted.riskScore,
      baseScore: extracted.baseScore,
      combinationScore: extracted.combinationScore,
      adjustmentScore: extracted.adjustmentScore,
      riskReasons: extracted.riskReasons,
      matchedCombinationRules:
        extracted.matchedCombinationRules,
      sourceIds: extracted.sourceIds,
      sources: getRiskSources(extracted.sourceIds),

      leakedItems: extracted.leakedItems,

      riskTypes:
        finalText.riskTypes &&
        finalText.riskTypes.length > 0
          ? finalText.riskTypes
          : extracted.riskTypes,

      reason: finalText.reason,

      evidence: searchResults.map((item) => ({
        title: item.title,
        url: item.url,
        summary: item.summary,
      })),

      checklist,
      familyMessage: finalText.familyMessage,
      reportSummary: finalText.reportSummary,
      createdAt: new Date().toISOString(),
    };

    await saveLeakHistoryIfLoggedIn(result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Analyze API error:", error);

    const isGeminiError =
      error instanceof Error &&
      error.message.includes("Gemini API 호출 실패");
    const isTimeoutError = error instanceof TimeoutError;

    return NextResponse.json(
      {
        message:
          isTimeoutError
            ? "분석 서비스 응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요."
            : isGeminiError
              ? "AI 분석 서비스가 일시적으로 지연되고 있습니다. 잠시 후 다시 시도해 주세요."
            : "분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      },
      { status: isTimeoutError || isGeminiError ? 503 : 500 }
    );
  }
}
