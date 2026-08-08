import type { RiskSource } from "../types/analysis";

/**
 * LeakCare 위험도 산정에 참고한 공식 자료입니다.
 *
 * sourceId는 riskCriteria.ts의 sourceIds와 연결됩니다.
 * 각 기관이 LeakCare의 점수를 직접 부여한 것은 아니며,
 * 개인정보 분류, 보호 수준, 피해 사례와 대응 방법을
 * 판단하기 위한 참고 근거로 사용합니다.
 */
export const RISK_SOURCES: Record<number, RiskSource> = {
  1: {
    sourceId: 1,
    organization: "개인정보 포털",
    title: "개인정보의 종류",
    url: "https://www.privacy.go.kr/front/contents/cntntsView.do?contsNo=35",
  },

  2: {
    sourceId: 2,
    organization: "개인정보보호위원회",
    title: "개인정보 영향평가 수행안내서(2025.10. 개정)",
    url: "https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS217&mCode=D010030020&nttId=11680",
  },

  3: {
    sourceId: 3,
    organization: "한국인터넷진흥원 보호나라",
    title: "계정 탈취 유형 스미싱·피싱 주의 권고",
    url: "https://www.boho.or.kr/kr/bbs/view.do?bbsId=B0000133&menuNo=205020&nttId=72139&pageIndex=1",
  },

  4: {
    sourceId: 4,
    organization: "한국인터넷진흥원 보호나라",
    title: "개인정보 유출 사고 악용 스미싱·피싱 주의 권고",
    url: "https://www.boho.or.kr/kr/bbs/view.do?bbsId=B0000133&menuNo=205020&nttId=72078&pageIndex=1",
  },

  5: {
    sourceId: 5,
    organization: "개인정보보호위원회·국가법령정보센터",
    title: "개인정보의 안전성 확보조치 기준",
    url: "https://www.law.go.kr/LSW/admRulInfoP.do?admRulSeq=2100000281400&chrClsCd=010201",
  },

  6: {
    sourceId: 6,
    organization: "한국인터넷진흥원 보호나라",
    title: "SNS·소셜커머스 등 계정 탈취를 노리는 스미싱 주의 권고",
    url: "https://www.boho.or.kr/kr/bbs/view.do?bbsId=B0000133&menuNo=205020&nttId=71555&pageIndex=1",
  },

  7: {
    sourceId: 7,
    organization: "개인정보 포털",
    title: "털린 내 정보 찾기 서비스",
    url: "https://www.privacy.go.kr/front/contents/cntntsView.do?contsNo=246",
  },

  8: {
    sourceId: 8,
    organization: "개인정보보호위원회",
    title:
      "주민등록번호 유출 관련 글로벌 경매사업자 제재 사례",
    url: "https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS212&mCode=C040030000&nttId=11995",
  },

  9: {
    sourceId: 9,
    organization: "개인정보보호위원회",
    title: "개인정보위 조사공문 사칭 전화사기 피해 주의",
    url: "https://m.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS074&mCode=C020010000&nttId=10691",
  },
};

/**
 * 위험도 계산 결과의 sourceIds를
 * 프론트에 전달할 실제 출처 객체로 변환합니다.
 */
export function getRiskSources(
  sourceIds: number[]
): RiskSource[] {
  return Array.from(new Set(sourceIds))
    .map((sourceId) => RISK_SOURCES[sourceId])
    .filter(
      (source): source is RiskSource =>
        source !== undefined
    );
}