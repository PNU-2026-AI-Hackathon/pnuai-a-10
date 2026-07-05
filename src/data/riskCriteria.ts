import type { RiskLevel } from "../types/analysis";

// 유출 항목별 위험 가중치. actionRules.ts의 키와 반드시 동일해야 함.
export const RISK_ITEM_WEIGHTS: Record<string, number> = {
  이름: 5,
  생년월일: 10,
  이메일: 10,
  주소: 15,
  주문내역: 10,
  전화번호: 15,
  계정정보: 20,
  결제정보: 25,
  카드정보: 30,
  비밀번호: 30,
  주민등록번호: 55,
};

const HIGH_THRESHOLD = 50;
const MEDIUM_THRESHOLD = 20;

export function calculateRiskLevel(leakedItems: string[]): {
  riskLevel: RiskLevel;
  score: number;
} {
  const score = Math.min(
    100,
    leakedItems.reduce((sum, item) => sum + (RISK_ITEM_WEIGHTS[item] ?? 0), 0)
  );

  const riskLevel: RiskLevel =
    score >= HIGH_THRESHOLD ? "높음" : score >= MEDIUM_THRESHOLD ? "보통" : "낮음";

  return { riskLevel, score };
}