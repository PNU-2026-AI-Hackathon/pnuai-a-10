import { NextResponse } from "next/server";
import type { SmsAnalysisResult } from "../../../types/analysis";
import { analyzeSuspiciousMessage } from "../../../lib/gemini";
import { createServerSupabaseClient } from "../../../lib/supabase/server";
import { TimeoutError, withTimeout } from "../../../lib/timeout";
import { maskPersonalInfo } from "../../../utils/personalInfoMasking";

const MAX_SMS_INPUT_LENGTH = 5_000;
const GEMINI_SMS_TIMEOUT_MS = 30_000;

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

async function saveSmsHistoryIfLoggedIn(result: SmsAnalysisResult) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const resultForSummary = result as {
    reason?: string;
    summary?: string;
    reportSummary?: string;
  };

  const { error } = await supabase.from("history").insert({
    user_id: user.id,
    type: "sms",
    title: "의심 문자 분석",
    company: null,
    risk_level: result.riskLevel,
    leaked_items: [],
    risk_types: result.riskTypes ?? [],
    checklist: [],
    checklist_progress: 0,
    result_summary:
      resultForSummary.reportSummary ??
      resultForSummary.summary ??
      resultForSummary.reason ??
      null,
  });

  if (error) {
    console.error("Failed to save sms history:", error.message);
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

    if (rawInputText.length > MAX_SMS_INPUT_LENGTH) {
      return NextResponse.json(
        {
          message:
            "분석할 문자 내용이 너무 깁니다. 내용을 5,000자 이하로 줄여 주세요.",
        },
        { status: 400 }
      );
    }

    const maskedInputText = maskPersonalInfo(inputText);

    const result = await runWithTimeout(
      (signal) =>
        analyzeSuspiciousMessage(maskedInputText, signal),
      GEMINI_SMS_TIMEOUT_MS
    );

    await saveSmsHistoryIfLoggedIn(result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("SMS analysis API error:", error);

    return NextResponse.json(
      {
        message:
          error instanceof TimeoutError
            ? "의심 문자 분석 서비스 응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요."
            : "의심 문자 분석 서비스가 일시적으로 지연되고 있습니다. 잠시 후 다시 시도해 주세요.",
      },
      { status: 500 }
    );
  }
}
