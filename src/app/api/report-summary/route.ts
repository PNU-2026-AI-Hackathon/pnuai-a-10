import { NextResponse } from "next/server";

import { buildReportSummaryTemplate } from "../../../lib/reportSummary";
import { generateReportSummaryWithGemini } from "../../../lib/reportSummaryGemini";
import { TimeoutError, withTimeout } from "../../../lib/timeout";
import { createPersonalInfoTokenMasker } from "../../../utils/personalInfoMasking";

import type {
  ReportDamageStatus,
  ReportSummaryRequest,
} from "../../../types/analysis";

const MAX_REPORT_SUMMARY_INPUT_LENGTH = 20_000;
const GEMINI_REPORT_SUMMARY_TIMEOUT_MS = 30_000;

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function countStringCharacters(
  value: unknown
): number {
  if (typeof value === "string") {
    return value.length;
  }

  if (Array.isArray(value)) {
    return value.reduce<number>(
      (total, item) =>
        total + countStringCharacters(item),
      0
    );
  }

  if (isRecord(value)) {
    return Object.values(value).reduce<number>(
      (total, item) =>
        total + countStringCharacters(item),
      0
    );
  }

  return 0;
}

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

function maskStringArray(
  values: string[],
  mask: (value: string) => string
): string[] {
  return values.map((value) => mask(value));
}

function maskOptionalString(
  value: string | undefined,
  mask: (value: string) => string
): string | undefined {
  return value ? mask(value) : undefined;
}

function maskReportSummaryRequest(
  input: ReportSummaryRequest,
  mask: (value: string) => string
): ReportSummaryRequest {
  return {
    company: mask(input.company),
    service: maskOptionalString(input.service, mask),
    leakedItems: maskStringArray(input.leakedItems, mask),
    leakNoticeDate: maskOptionalString(
      input.leakNoticeDate,
      mask
    ),
    discoveryMethod: maskOptionalString(
      input.discoveryMethod,
      mask
    ),
    damageStatus: input.damageStatus,
    damageDate: maskOptionalString(
      input.damageDate,
      mask
    ),
    damageAmount: input.damageAmount,
    damageDescription: maskOptionalString(
      input.damageDescription,
      mask
    ),
    suspiciousContact: maskOptionalString(
      input.suspiciousContact,
      mask
    ),
    evidenceItems: maskStringArray(
      input.evidenceItems ?? [],
      mask
    ),
    actionsTaken: maskStringArray(
      input.actionsTaken ?? [],
      mask
    ),
    requestPurpose: maskOptionalString(
      input.requestPurpose,
      mask
    ),
  };
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

    if (
      countStringCharacters(body) >
      MAX_REPORT_SUMMARY_INPUT_LENGTH
    ) {
      return NextResponse.json(
        {
          message:
            "요약문 작성 내용이 너무 깁니다. 입력 내용을 줄여 주세요.",
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
      const personalInfoMasker =
        createPersonalInfoTokenMasker();
      const maskedReportInput =
        maskReportSummaryRequest(
          reportInput,
          personalInfoMasker.mask
        );
      const maskedTemplate = {
        ...template,
        summaryText: personalInfoMasker.mask(
          template.summaryText
        ),
        sections: {
          incidentOverview:
            personalInfoMasker.mask(
              template.sections.incidentOverview
            ),
          leakedInformation:
            personalInfoMasker.mask(
              template.sections.leakedInformation
            ),
          damageStatus:
            personalInfoMasker.mask(
              template.sections.damageStatus
            ),
          evidence: personalInfoMasker.mask(
            template.sections.evidence
          ),
          actionsTaken:
            personalInfoMasker.mask(
              template.sections.actionsTaken
            ),
          requestDetails:
            personalInfoMasker.mask(
              template.sections.requestDetails
            ),
        },
      };

      const generated =
        await runWithTimeout(
          (signal) =>
            generateReportSummaryWithGemini(
              maskedReportInput,
              maskedTemplate,
              signal
            ),
          GEMINI_REPORT_SUMMARY_TIMEOUT_MS
        );

      return NextResponse.json({
        ...generated,
        summaryText: personalInfoMasker.restore(
          generated.summaryText
        ),
        sections: {
          incidentOverview:
            personalInfoMasker.restore(
              generated.sections.incidentOverview
            ),
          leakedInformation:
            personalInfoMasker.restore(
              generated.sections.leakedInformation
            ),
          damageStatus:
            personalInfoMasker.restore(
              generated.sections.damageStatus
            ),
          evidence: personalInfoMasker.restore(
            generated.sections.evidence
          ),
          actionsTaken:
            personalInfoMasker.restore(
              generated.sections.actionsTaken
            ),
          requestDetails:
            personalInfoMasker.restore(
              generated.sections.requestDetails
            ),
        },
      });
    } catch (geminiError) {
      // Gemini 오류가 발생해도 API 전체를 실패시키지 않고
      // 기존 템플릿 결과를 그대로 반환합니다.
      if (geminiError instanceof TimeoutError) {
        console.error("Report summary Gemini timeout");
      } else {
        console.error(
          "Report summary Gemini error:",
          geminiError
        );
      }

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
