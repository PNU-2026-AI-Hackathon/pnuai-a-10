import type { AnalysisType, ChecklistItem, RiskLevel } from "./analysis";

export type LoginProvider = "google" | "kakao" | "unknown";

export type UserProfile = {
  id: string;
  name: string | null;
  email: string | null;
  avatarUrl?: string | null;
  provider: LoginProvider;
};

export type AnalysisHistoryItem = {
  id: string;
  userId: string;
  type: AnalysisType;
  title: string;
  company?: string | null;
  riskLevel: RiskLevel;
  leakedItems: string[];
  riskTypes: string[];
  checklist: ChecklistItem[];
  checklistProgress: number;
  resultSummary?: string | null;
  createdAt: string;
};