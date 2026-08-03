import { NextResponse } from "next/server";

import { buildReportSummaryTemplate } from "../../../lib/reportSummary";
import { generateReportSummaryWithGemini } from "../../../lib/reportSummaryGemini";

import type {
  ReportDamageStatus,
  ReportSummaryRequest,
} from "../../../types/analysis";

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function readString(
  value: unknown
): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const cleaned = value.trim();

  return cleaned || undefined;
}

function readStringArray(
  value: unknown
): string[] {
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

function readNumber(
  value: unknown
): number | undefined {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0
  ) {
    return undefined;
  }

  return value;
}

function isDamageStatus(
  value: unknown
): value is ReportDamageStatus {
  return (
    value === "none" ||
    value === "suspected" ||
    value === "confirmed"
  );
}

export async function POST(
  request: Request
) {
  try {
    const body: unknown =
      await request.json();

    if (!isRecord(body)) {
      return NextResponse.json(
        {
          message:
            "요약문 생성에 필요한 입력값이 올바르지 않습니다.",
        },
        { status: 400 }
      );
    }

    if (!isDamageStatus(body.damageStatus)) {
      return NextResponse.json(
        {
          message:
            "피해 상태를 선택해 주세요.",
        },
        { status: 400 }
      );
    }

    const reportInput: ReportSummaryRequest = {
      company:
        readString(body.company) ??
        "알 수 없음",

      service: readString(body.service),

      leakedItems: readStringArray(
        body.leakedItems
      ),

      leakNoticeDate: readString(
        body.leakNoticeDate
      ),

      discoveryMethod: readString(
        body.discoveryMethod
      ),

      damageStatus: body.damageStatus,

      damageDate: readString(
        body.damageDate
      ),

      damageAmount: readNumber(
        body.damageAmount
      ),

      damageDescription: readString(
        body.damageDescription
      ),

      suspiciousContact: readString(
        body.suspiciousContact
      ),

      evidenceItems: readStringArray(
        body.evidenceItems
      ),

      actionsTaken: readStringArray(
        body.actionsTaken
      ),

      requestPurpose: readString(
        body.requestPurpose
      ),
    };

    // Gemini가 없어도 항상 만들 수 있는
    // 기본 신고·상담용 요약문입니다.
    const template =
      buildReportSummaryTemplate(
        reportInput
      );

    try {
      const generated =
        await generateReportSummaryWithGemini(
          reportInput,
          template
        );

      return NextResponse.json(generated);
    } catch (geminiError) {
      // Gemini 오류가 발생해도 API 전체를 실패시키지 않고
      // 기존 템플릿 결과를 그대로 반환합니다.
      console.error(
        "Report summary Gemini error:",
        geminiError
      );

      return NextResponse.json(template);
    }
  } catch (error) {
    console.error(
      "Report summary API error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "신고·상담용 요약문을 만드는 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}