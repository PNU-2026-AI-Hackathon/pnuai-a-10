export type RiskLevel = "낮음" | "보통" | "높음";

export type ChecklistPriority =
  | "즉시 조치"
  | "1주 이내 확인"
  | "필요 시 관리";

export type AnalysisType = "leak" | "sms";

export type ActionLink = {
  label: string;
  url: string;
  description?: string;
};

export type ChecklistItem = {
  id: string;
  priority: ChecklistPriority;
  title: string;
  description: string;
  isCompleted?: boolean;
  link?: ActionLink;
};

export type EvidenceItem = {
  title: string;
  url: string;
  summary?: string;
};

export type RiskSource = {
  sourceId: number;
  organization: string;
  title: string;
  url?: string;
};

export type LeakAnalysisResult = {
  type: "leak";
  company: string;
  service?: string;

  riskLevel: RiskLevel;

  /**
   * 위험도 상세 계산 결과
   * API와 프론트 연결이 완료될 때까지 선택 필드로 유지합니다.
   */
  riskScore?: number;
  baseScore?: number;
  combinationScore?: number;
  adjustmentScore?: number;
  riskReasons?: string[];
  matchedCombinationRules?: string[];
  sourceIds?: number[];
  sources?: RiskSource[];

  leakedItems: string[];
  riskTypes: string[];
  reason: string;
  evidence: EvidenceItem[];
  checklist: ChecklistItem[];
  familyMessage: string;
  reportSummary: string;
  createdAt?: string;
};

export type SmsAnalysisResult = {
  type: "sms";
  riskLevel: RiskLevel;
  isSmishing: boolean;
  riskTypes: string[];
  reason: string;
  recommendedActions: ChecklistItem[];
  createdAt?: string;
};

export type AnalysisResult =
  | LeakAnalysisResult
  | SmsAnalysisResult;

export type ReportDamageStatus =
  | "none"
  | "suspected"
  | "confirmed";

export type ReportSummaryRequest = {
  // 기존 분석 결과에서 자동으로 가져오는 정보
  company: string;
  service?: string;
  leakedItems: string[];

  // 사용자가 추가로 입력하는 정보
  leakNoticeDate?: string;
  discoveryMethod?: string;

  damageStatus: ReportDamageStatus;
  damageDate?: string;
  damageAmount?: number;
  damageDescription?: string;

  suspiciousContact?: string;
  evidenceItems?: string[];
  actionsTaken?: string[];

  requestPurpose?: string;
};

export type ReportSummarySections = {
  incidentOverview: string;
  leakedInformation: string;
  damageStatus: string;
  evidence: string;
  actionsTaken: string;
  requestDetails: string;
};

export type ReportSummaryResponse = {
  title: string;
  summaryText: string;
  sections: ReportSummarySections;

  // 사용자가 입력하지 않아 확인할 수 없는 항목
  missingFields: string[];

  // Gemini 실패 시 템플릿으로 작성했는지 구분
  generationMode: "gemini" | "template";
};