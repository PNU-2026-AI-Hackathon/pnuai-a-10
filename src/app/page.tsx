"use client";

import { useState } from "react";

type SampleType = "leak" | "sms" | "safe";
type TabType = "leak" | "sms";
type LevelClass = "danger" | "warning" | "safe";

type AnalysisResult = {
  score: number;
  level: string;
  levelClass: LevelClass;
  leakedItems: string[];
  riskTypes: string[];
  checklist: string[];
  familyMessage: string;
};

const samples: Record<SampleType, string> = {
  leak: `개인정보 유출 안내

고객님의 이름, 휴대전화번호, 이메일, 주소, 주문내역 일부가 외부로 유출된 사실을 확인했습니다. 결제 비밀번호 및 카드번호는 유출 대상에 포함되지 않았습니다. 유출 사실을 악용한 택배 사칭 문자, 환불 안내 문자, 본인인증 요구에 주의해주시기 바랍니다.`,

  sms: `[Web발신] 개인정보 유출 보상금 지급 대상자입니다. 아래 링크에서 본인인증을 완료하면 보상금이 지급됩니다. http://leak-pay-support.example`,

  safe: `안내드립니다. 개인정보 처리방침이 개정되어 6월 1일부터 적용됩니다. 자세한 내용은 공식 홈페이지 공지사항에서 확인하실 수 있습니다. 본 안내는 개인정보 유출 사고와 관련이 없습니다.`,
};

function analyzeMockText(text: string): AnalysisResult {
  const isPhishing = /보상금|본인인증|링크|http|지급|대상자/.test(text);
  const isLeak = /유출|개인정보|휴대전화|주소|주문내역|이메일/.test(text);
  const isSafe =
    /처리방침|개정|공지사항|관련이 없습니다/.test(text) &&
    !/보상금|본인인증/.test(text);

  const score = isSafe ? 22 : isPhishing ? 91 : isLeak ? 76 : 48;
  const level =
    score >= 80
      ? "매우 위험"
      : score >= 60
      ? "주의 필요"
      : score >= 35
      ? "확인 필요"
      : "낮은 위험";

  const levelClass: LevelClass =
    score >= 80 ? "danger" : score >= 60 ? "warning" : "safe";

  const leakedItems: string[] = [];

  if (/이름/.test(text)) leakedItems.push("이름");
  if (/휴대전화|전화번호/.test(text)) leakedItems.push("전화번호");
  if (/이메일/.test(text)) leakedItems.push("이메일");
  if (/주소/.test(text)) leakedItems.push("주소");
  if (/주문내역/.test(text)) leakedItems.push("주문내역");
  if (/카드|결제/.test(text)) leakedItems.push("결제 관련 정보");

  if (leakedItems.length === 0 && isPhishing) {
    leakedItems.push("입력된 문자 기준 유출 항목 없음");
  }

  if (leakedItems.length === 0) {
    leakedItems.push("명확한 유출 항목 없음");
  }

  const riskTypes = isSafe
    ? ["공식 공지 가능성", "낮은 위험"]
    : isPhishing
    ? ["보상금 사칭 피싱", "본인인증 유도", "링크 클릭 위험"]
    : ["스미싱 위험", "택배 사칭 가능성", "계정 탈취 시도 주의"];

  const checklist = isSafe
    ? [
        "문자 속 링크 대신 공식 홈페이지나 앱에서 직접 공지사항을 확인합니다.",
        "개인정보 입력을 요구하지 않는 안내인지 다시 확인합니다.",
        "불안할 경우 고객센터 번호를 직접 검색해 문의합니다.",
      ]
    : isPhishing
    ? [
        "문자에 포함된 링크를 누르지 않습니다.",
        "보상금, 환불, 본인인증을 요구하는 안내는 공식 앱이나 홈페이지에서 직접 확인합니다.",
        "이미 링크를 눌렀다면 비밀번호를 변경하고 2단계 인증을 설정합니다.",
        "가족에게 같은 유형의 문자를 조심하라고 공유합니다.",
      ]
    : [
        "해당 서비스의 비밀번호를 변경하고 같은 비밀번호를 쓰는 사이트도 함께 변경합니다.",
        "주소와 주문내역이 유출된 경우 택배 사칭 문자와 환불 안내 전화를 주의합니다.",
        "이메일과 전화번호가 포함된 경우 스미싱, 피싱 메일, 보이스피싱 가능성을 주의합니다.",
        "의심 문자를 받으면 링크를 누르지 말고 공식 고객센터로 직접 확인합니다.",
      ];

  const familyMessage = isPhishing
    ? "개인정보 유출 보상금이나 환불을 이유로 본인인증 링크를 보내는 문자는 피싱일 수 있습니다. 링크를 누르지 말고 공식 앱이나 홈페이지에서만 확인해주세요."
    : isSafe
    ? "개인정보 처리방침 변경 안내처럼 보이지만, 링크를 누르기 전 공식 홈페이지에서 직접 확인하는 것이 안전합니다."
    : "최근 개인정보 유출로 인해 택배 사칭 문자, 환불 안내 문자, 고객센터 사칭 전화가 올 수 있습니다. 문자 링크를 누르지 말고 공식 앱이나 홈페이지에서 확인해주세요.";

  return {
    score,
    level,
    levelClass,
    leakedItems,
    riskTypes,
    checklist,
    familyMessage,
  };
}

export default function Home() {
  const [currentTab, setCurrentTab] = useState<TabType>("leak");
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const scrollToAnalyze = () => {
    document.getElementById("analyze")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const showToast = (message: string) => {
    setToast(message);
    setToastVisible(true);

    setTimeout(() => {
      setToastVisible(false);
    }, 1800);
  };

  const switchTab = (tab: TabType) => {
    setCurrentTab(tab);
  };

  const runAnalyze = (text: string) => {
    if (!text.trim()) {
      showToast("분석할 내용을 먼저 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setResult(null);

    setTimeout(() => {
      setResult(analyzeMockText(text));
      setIsLoading(false);
    }, 900);
  };

  const loadSample = (type: SampleType) => {
    const nextTab: TabType = type === "sms" ? "sms" : "leak";
    const nextText = samples[type];

    setCurrentTab(nextTab);
    setInputText(nextText);
    runAnalyze(nextText);
    scrollToAnalyze();
  };

  const resetAll = () => {
    setInputText("");
    setResult(null);
    setIsLoading(false);
  };

  const copyFamilyMessage = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result.familyMessage);
      showToast("안내문이 복사되었습니다.");
    } catch {
      showToast("복사 기능은 브라우저 권한에 따라 제한될 수 있습니다.");
    }
  };

  const resultTitle = result
    ? result.score >= 80
      ? "즉시 주의가 필요한 위험 신호가 있습니다"
      : result.score >= 60
      ? "2차 피해 가능성을 확인해야 합니다"
      : "큰 위험은 낮지만 공식 경로 확인이 필요합니다"
    : "분석 결과 대기 중";

  return (
    <div className="page">
      <header className="nav">
        <a href="#" className="brand" aria-label="LeakCare 홈">
          <span className="brand-badge">L</span>
          <span>LeakCare</span>
        </a>

        <nav className="nav-menu">
          <a href="#analyze">분석하기</a>
          <a href="#flow">이용 흐름</a>
          <a href="#">대응 가이드</a>
          <button className="nav-button" onClick={scrollToAnalyze}>
            시작하기
          </button>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div>
            <span className="eyebrow">
              개인정보 유출 후, 무엇부터 해야 할지 알려주는 AI 가이드
            </span>

            <h1>
              유출 통지문을
              <br />
              대응 체크리스트로.
            </h1>

            <p>
              LeakCare는 사용자가 받은 개인정보 유출 안내문과 의심 문자를
              분석하여 유출 항목, 2차 피해 가능성, 우선순위별 대응 방법을 한
              화면에 정리해주는 웹서비스입니다.
            </p>

            <div className="hero-actions">
              <button className="primary-btn" onClick={scrollToAnalyze}>
                유출 안내문 분석하기
              </button>
              <button
                className="secondary-btn"
                onClick={() => loadSample("leak")}
              >
                샘플로 보기
              </button>
            </div>
          </div>

          <div className="hero-card" aria-label="서비스 미리보기">
            <div className="phone-preview">
              <div className="phone-top">
                <span>LeakCare AI</span>
                <span>위험도 분석 중</span>
              </div>

              <div className="mini-input">
                [안내] 고객님의 이름, 휴대전화번호, 주소, 주문내역 일부가
                외부로 유출된 사실을 확인했습니다. 추가 피해 예방을 위해 주의
                바랍니다.
              </div>

              <div className="mini-result">
                <div className="mini-risk">
                  <strong>2차 피해 위험 높음</strong>
                  <div className="risk-meter">
                    <span className="risk-pin"></span>
                  </div>
                </div>

                <div className="mini-list">
                  <span>주소 + 주문내역 → 택배 사칭 주의</span>
                  <span>전화번호 → 스미싱·보이스피싱 주의</span>
                  <span>우선 조치: 비밀번호 변경, 링크 클릭 금지</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="stats" aria-label="서비스 핵심 지표">
          <div className="stat-card">
            <strong>3단계</strong>
            <span>통지문 입력 → 유출 항목 추출 → 대응 체크리스트 생성</span>
          </div>

          <div className="stat-card">
            <strong>2차 피해</strong>
            <span>스미싱, 피싱, 택배 사칭, 계정 탈취 위험을 함께 분석</span>
          </div>

          <div className="stat-card">
            <strong>쉬운 설명</strong>
            <span>가족에게 공유할 수 있는 짧고 쉬운 안내문 자동 생성</span>
          </div>
        </section>

        <section className="workspace" id="analyze">
          <div className="section-heading">
            <div>
              <h2>AI 분석 데모</h2>
              <p>
                현재 화면은 UI 시연용입니다. 실제 API 연결 전에도 발표용 흐름을
                보여줄 수 있습니다.
              </p>
            </div>

            <button className="ghost-btn" onClick={resetAll}>
              초기화
            </button>
          </div>

          <div className="app-shell">
            <section className="panel" aria-label="입력 영역">
              <div className="panel-header">
                <div className="tabs">
                  <button
                    className={`tab ${currentTab === "leak" ? "active" : ""}`}
                    onClick={() => switchTab("leak")}
                  >
                    유출 통지문
                  </button>

                  <button
                    className={`tab ${currentTab === "sms" ? "active" : ""}`}
                    onClick={() => switchTab("sms")}
                  >
                    의심 문자
                  </button>
                </div>
              </div>

              <div className="input-area">
                <label className="field-label" htmlFor="inputText">
                  <span>
                    {currentTab === "leak"
                      ? "개인정보 유출 안내문 입력"
                      : "유출 이후 받은 의심 문자 입력"}
                  </span>
                  <span>텍스트 또는 OCR 결과</span>
                </label>

                <textarea
                  id="inputText"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    currentTab === "leak"
                      ? "예: 고객님의 이름, 휴대전화번호, 주소, 주문내역 일부가 유출되었습니다..."
                      : "예: 개인정보 유출 보상금 지급 대상자입니다. 아래 링크에서 본인인증을 완료하세요..."
                  }
                />

                <div className="upload-box">
                  <span>
                    스크린샷 업로드 UI 영역입니다. 실제 OCR은 추후 연결할 수
                    있습니다.
                  </span>
                  <span className="upload-pill">이미지 업로드</span>
                </div>

                <div className="sample-row">
                  <button
                    className="sample-btn"
                    onClick={() => loadSample("leak")}
                  >
                    유출 안내문 샘플
                  </button>
                  <button
                    className="sample-btn"
                    onClick={() => loadSample("sms")}
                  >
                    피싱 문자 샘플
                  </button>
                  <button
                    className="sample-btn"
                    onClick={() => loadSample("safe")}
                  >
                    낮은 위험 샘플
                  </button>
                </div>

                <div className="analyze-row">
                  <p className="notice">
                    실제 개인정보, 주민등록번호, 카드번호 등 민감정보는 입력하지
                    않는다는 안내 문구를 서비스에 포함합니다.
                  </p>

                  <button
                    className="primary-btn"
                    onClick={() => runAnalyze(inputText)}
                  >
                    AI 분석하기
                  </button>
                </div>
              </div>
            </section>

            <section className="panel" aria-label="분석 결과 영역">
              <div className="results">
                {isLoading ? (
                  <div className="result-top">
                    <div>
                      <h3>AI 분석 중입니다</h3>
                      <p>
                        입력된 문장에서 유출 항목, 위험 유형, 대응 우선순위를
                        구성하는 중입니다.
                      </p>
                    </div>

                    <div className="score-badge">
                      <strong>···</strong>
                      <span>분석 중</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="result-top">
                      <div>
                        <h3>{resultTitle}</h3>
                        <p>
                          {result
                            ? "입력된 내용을 기준으로 AI 분석 결과를 구성한 UI 예시입니다. 실제 서비스에서는 LLM과 검색 API를 연결하여 더 정교하게 분석할 수 있습니다."
                            : "왼쪽에 유출 안내문 또는 의심 문자를 입력하고 분석 버튼을 누르면 결과가 표시됩니다."}
                        </p>
                      </div>

                      <div className="score-badge">
                        <strong>{result ? result.score : "--"}</strong>
                        <span>{result ? result.level : "위험도"}</span>
                      </div>
                    </div>

                    <div className="card-grid">
                      <article className="info-card">
                        <h4>
                          <span className="icon-dot"></span> 유출 항목
                        </h4>
                        <div className="chips">
                          {result ? (
                            result.leakedItems.map((item) => (
                              <span
                                className={`chip ${result.levelClass}`}
                                key={item}
                              >
                                {item}
                              </span>
                            ))
                          ) : (
                            <span className="chip">입력 대기</span>
                          )}
                        </div>
                      </article>

                      <article className="info-card">
                        <h4>
                          <span className="icon-dot"></span> 위험 유형
                        </h4>
                        <div className="chips">
                          {result ? (
                            result.riskTypes.map((item) => (
                              <span
                                className={`chip ${result.levelClass}`}
                                key={item}
                              >
                                {item}
                              </span>
                            ))
                          ) : (
                            <span className="chip">분석 전</span>
                          )}
                        </div>
                      </article>

                      <article className="info-card full">
                        <h4>
                          <span className="icon-dot"></span> 우선 대응
                          체크리스트
                        </h4>
                        <ul className="check-list">
                          {result ? (
                            result.checklist.map((item, index) => (
                              <li key={item}>
                                <span className="num">{index + 1}</span>
                                <span>{item}</span>
                              </li>
                            ))
                          ) : (
                            <li>
                              <span className="num">1</span>
                              <span>
                                분석 결과가 생성되면 우선순위별 대응 방법이
                                표시됩니다.
                              </span>
                            </li>
                          )}
                        </ul>
                      </article>

                      {result && (
                        <>
                          <article className="info-card full">
                            <h4>
                              <span className="icon-dot"></span> 가족 공유용
                              안내문
                            </h4>
                            <div className="message-card">
                              <strong>공유 문구</strong>
                              <br />
                              {result.familyMessage}
                            </div>
                          </article>

                          <article className="info-card full">
                            <h4>
                              <span className="icon-dot"></span> 다음 작업
                            </h4>
                            <div className="action-buttons">
                              <button
                                className="small-btn"
                                onClick={copyFamilyMessage}
                              >
                                안내문 복사
                              </button>
                              <button
                                className="small-btn"
                                onClick={() =>
                                  showToast(
                                    "PDF 다운로드 기능은 추후 연결 예정입니다."
                                  )
                                }
                              >
                                PDF 저장
                              </button>
                              <button
                                className="small-btn"
                                onClick={() =>
                                  showToast(
                                    "신고용 요약문 생성 화면으로 이동 예정입니다."
                                  )
                                }
                              >
                                신고용 요약문 생성
                              </button>
                            </div>
                          </article>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </section>
          </div>
        </section>

        <section className="flow" id="flow">
          <div className="section-heading">
            <div>
              <h2>서비스 이용 흐름</h2>
              <p>
                단순 보안 수칙 안내가 아니라, 사용자가 받은 실제 문서를 행동
                가능한 결과로 바꿉니다.
              </p>
            </div>
          </div>

          <div className="flow-grid">
            <article className="flow-card">
              <div className="flow-num">1</div>
              <h3>통지문 입력</h3>
              <p>
                문자, 이메일, 공지문 내용을 붙여넣거나 스크린샷으로
                업로드합니다.
              </p>
            </article>

            <article className="flow-card">
              <div className="flow-num">2</div>
              <h3>유출 항목 추출</h3>
              <p>
                AI가 이름, 전화번호, 주소, 주문내역 등 핵심 항목을 찾아냅니다.
              </p>
            </article>

            <article className="flow-card">
              <div className="flow-num">3</div>
              <h3>2차 피해 분석</h3>
              <p>
                유출 정보 조합을 기준으로 스미싱, 피싱, 사칭 위험을 예측합니다.
              </p>
            </article>

            <article className="flow-card">
              <div className="flow-num">4</div>
              <h3>대응 문서 생성</h3>
              <p>
                체크리스트, 가족 공유 안내문, 상담·신고용 요약문을 생성합니다.
              </p>
            </article>
          </div>
        </section>
      </main>

      <footer className="footer">
        <span>LeakCare UI Mockup</span>
        <span>
          본 화면은 해커톤 기획·시연용이며 법률 자문이나 공식 신고 서비스를
          대체하지 않습니다.
        </span>
      </footer>

      <div className={`toast ${toastVisible ? "show" : ""}`}>{toast}</div>
    </div>
  );
}