import { NextResponse } from "next/server";
import type { SmsAnalysisResult } from "../../../types/analysis";
import { analyzeSuspiciousMessage } from "../../../lib/gemini";
import { createServerSupabaseClient } from "../../../lib/supabase/server";
import { maskPersonalInfo } from "../../../utils/personalInfoMasking";

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

    const maskedInputText = maskPersonalInfo(inputText);

    const result = await analyzeSuspiciousMessage(maskedInputText);

    await saveSmsHistoryIfLoggedIn(result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("SMS analysis API error:", error);

    return NextResponse.json(
      {
        message:
          "의심 문자 분석 서비스가 일시적으로 지연되고 있습니다. 잠시 후 다시 시도해 주세요.",
      },
      { status: 500 }
    );
  }
}
