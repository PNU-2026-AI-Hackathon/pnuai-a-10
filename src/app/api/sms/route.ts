import { NextResponse } from "next/server";
import type { SmsAnalysisResult } from "../../../types/analysis";
import { analyzeSuspiciousMessage } from "../../../lib/gemini";
import { createServerSupabaseClient } from "../../../lib/supabase/server";

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

    const inputText = body?.inputText?.trim();

    if (!inputText) {
      return NextResponse.json(
        { message: "inputText가 필요합니다." },
        { status: 400 }
      );
    }

    const result = await analyzeSuspiciousMessage(inputText);

    await saveSmsHistoryIfLoggedIn(result);

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "의심 문자 분석 중 알 수 없는 오류가 발생했습니다.";

    return NextResponse.json({ message }, { status: 500 });
  }
}