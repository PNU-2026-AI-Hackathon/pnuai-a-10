import { NextResponse } from "next/server";
import type { LeakAnalysisResult } from "../../../types/analysis";
import { buildChecklist } from "../../../lib/checklist";
import { extractKeyInfo, analyzeWithSearchContext } from "../../../lib/gemini";
import { searchNaverNews } from "../../../lib/googleSearch";

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

    const extracted = await extractKeyInfo(inputText);

    const searchQuery =
      extracted.company && extracted.company !== "알 수 없음"
        ? `${extracted.company} 개인정보 유출`
        : "개인정보 유출";

    const searchResults = await searchNaverNews(searchQuery);

    const finalText = await analyzeWithSearchContext({
      inputText,
      extracted,
      searchResults,
    });

    const checklist = buildChecklist(extracted.leakedItems);

    const result: LeakAnalysisResult = {
      type: "leak",
      company: extracted.company,
      service: extracted.service,
      riskLevel: finalText.riskLevel ?? extracted.riskLevel,
      leakedItems: extracted.leakedItems,
      riskTypes:
        finalText.riskTypes && finalText.riskTypes.length > 0
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

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "분석 중 알 수 없는 오류가 발생했습니다.";

    return NextResponse.json(
      {
        message,
      },
      { status: 500 }
    );
  }
}