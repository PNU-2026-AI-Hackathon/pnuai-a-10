import type {
  ReportSummaryRequest,
  ReportSummaryResponse,
} from "../types/analysis";

const UNKNOWN_VALUE = "확인되지 않음";

function cleanText(
  value: string | undefined
): string | undefined {
  const cleaned = value?.trim();
  return cleaned || undefined;
}

function cleanList(
  values: string[] | undefined
): string[] {
  return Array.from(
    new Set(
      (values ?? [])
        .map((value) => value.trim())
        .filter(Boolean)
    )
  );
}

function formatAmount(
  amount: number | undefined
): string | undefined {
  if (
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    amount < 0
  ) {
    return undefined;
  }

  return `${Math.round(amount).toLocaleString(
    "ko-KR"
  )}원`;
}

function buildDamageDescription(
  input: ReportSummaryRequest
): string {
  const damageDate = cleanText(input.damageDate);
  const damageDescription = cleanText(
    input.damageDescription
  );
  const damageAmount = formatAmount(
    input.damageAmount
  );

  if (input.damageStatus === "none") {
    return "현재까지 확인된 피해는 없습니다.";
  }

  const details: string[] = [];

  if (input.damageStatus === "suspected") {
    details.push(
      "피해가 의심되지만 아직 확인되지 않았습니다."
    );
  }

  if (input.damageStatus === "confirmed") {
    details.push("피해가 확인되었습니다.");
  }

  if (damageDate) {
    details.push(`피해 발생일: ${damageDate}`);
  }

  if (damageAmount) {
    details.push(`피해 금액: ${damageAmount}`);
  }

  if (damageDescription) {
    details.push(`피해 내용: ${damageDescription}`);
  } else {
    details.push(
      "구체적인 피해 내용은 추가 확인이 필요합니다."
    );
  }

  return details.join("\n");
}

function collectMissingFields(
  input: ReportSummaryRequest
): string[] {
  const missingFields: string[] = [];

  const company = cleanText(input.company);
  const leakedItems = cleanList(
    input.leakedItems
  );
  const evidenceItems = cleanList(
    input.evidenceItems
  );
  const actionsTaken = cleanList(
    input.actionsTaken
  );

  if (
    !company ||
    company === "알 수 없음"
  ) {
    missingFields.push("관련 기업 또는 서비스명");
  }

  if (!cleanText(input.leakNoticeDate)) {
    missingFields.push("유출 안내 확인일");
  }

  if (!cleanText(input.discoveryMethod)) {
    missingFields.push("유출 사실 확인 경로");
  }

  if (leakedItems.length === 0) {
    missingFields.push("확인된 유출 항목");
  }

  if (
    input.damageStatus !== "none" &&
    !cleanText(input.damageDescription)
  ) {
    missingFields.push("피해 또는 의심 정황");
  }

  if (
    input.damageStatus === "confirmed" &&
    !cleanText(input.damageDate)
  ) {
    missingFields.push("피해 발생일");
  }

  if (
    evidenceItems.length === 0 &&
    !cleanText(input.suspiciousContact)
  ) {
    missingFields.push(
      "보유 증거 또는 의심 연락 내용"
    );
  }

  if (actionsTaken.length === 0) {
    missingFields.push("이미 취한 조치");
  }

  if (!cleanText(input.requestPurpose)) {
    missingFields.push("상담·신고 목적");
  }

  return missingFields;
}

export function buildReportSummaryTemplate(
  input: ReportSummaryRequest
): ReportSummaryResponse {
  const company =
    cleanText(input.company) ??
    "알 수 없는 기관";

  const service = cleanText(input.service);

  const targetName = service
    ? `${company}의 ${service} 서비스`
    : company;

  const leakNoticeDate =
    cleanText(input.leakNoticeDate) ??
    UNKNOWN_VALUE;

  const discoveryMethod =
    cleanText(input.discoveryMethod) ??
    UNKNOWN_VALUE;

  const leakedItems = cleanList(
    input.leakedItems
  );

  const suspiciousContact = cleanText(
    input.suspiciousContact
  );

  const evidenceItems = cleanList(
    input.evidenceItems
  );

  const actionsTaken = cleanList(
    input.actionsTaken
  );

  const requestPurpose = cleanText(
    input.requestPurpose
  );

  const incidentOverview = [
    `${targetName}와 관련된 개인정보 유출 사실을 확인했습니다.`,
    `유출 안내 확인일: ${leakNoticeDate}`,
    `확인 경로: ${discoveryMethod}`,
  ].join("\n");

  const leakedInformation =
    leakedItems.length > 0
      ? leakedItems.join(", ")
      : "구체적인 유출 항목이 확인되지 않았습니다.";

  const damageStatus =
    buildDamageDescription(input);

  const evidenceParts: string[] = [];

  if (suspiciousContact) {
    evidenceParts.push(
      `의심 연락 내용: ${suspiciousContact}`
    );
  }

  if (evidenceItems.length > 0) {
    evidenceParts.push(
      `보유 자료: ${evidenceItems.join(", ")}`
    );
  }

  const evidence =
    evidenceParts.length > 0
      ? evidenceParts.join("\n")
      : "현재 입력된 증거 자료가 없습니다.";

  const actionsTakenText =
    actionsTaken.length > 0
      ? actionsTaken.join(", ")
      : "현재 입력된 대응 조치가 없습니다.";

  const requestDetails =
    requestPurpose ??
    "개인정보 악용 가능성과 필요한 대응 절차에 대한 상담을 요청합니다.";

  const summaryParts: string[] = [
    `${targetName}와 관련된 개인정보 유출 사실을 확인했습니다.`,
  ];

  if (input.leakNoticeDate) {
    summaryParts.push(
      `${leakNoticeDate}에 해당 사실을 확인했습니다.`
    );
  }

  if (input.discoveryMethod) {
    summaryParts.push(
      `${discoveryMethod}을 통해 유출 사실을 알게 되었습니다.`
    );
  }

  if (leakedItems.length > 0) {
    summaryParts.push(
      `확인된 유출 항목은 ${leakedItems.join(
        ", "
      )}입니다.`
    );
  } else {
    summaryParts.push(
      "구체적인 유출 항목은 확인되지 않았습니다."
    );
  }

  summaryParts.push(
    damageStatus.replace(/\n/g, " ")
  );

  if (suspiciousContact) {
    summaryParts.push(
      `의심 연락 또는 정황은 ${suspiciousContact}입니다.`
    );
  }

  if (evidenceItems.length > 0) {
    summaryParts.push(
      `보유한 자료는 ${evidenceItems.join(
        ", "
      )}입니다.`
    );
  }

  if (actionsTaken.length > 0) {
    summaryParts.push(
      `현재까지 ${actionsTaken.join(
        ", "
      )} 조치를 취했습니다.`
    );
  }

  summaryParts.push(requestDetails);

  return {
    title: "개인정보 유출 신고·상담용 요약문",

    summaryText: summaryParts.join(" "),

    sections: {
      incidentOverview,
      leakedInformation,
      damageStatus,
      evidence,
      actionsTaken: actionsTakenText,
      requestDetails,
    },

    missingFields: collectMissingFields(input),

    generationMode: "template",
  };
}