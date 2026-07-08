"use client";

import { useState } from "react";
import type { SmsAnalysisResult } from "../../types/analysis";

const sampleText = `[Web발신] 개인정보 유출 보상금 지급 대상자입니다.
아래 링크에서 본인인증을 완료하면 보상금이 지급됩니다.
http://leak-pay-support.example`;

export default function SmsPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<SmsAnalysisResult | null>(null);

  const analyze = async () => {
    if (!text.trim()) {
      setErrorMessage("의심 문자를 입력해주세요.");
      return;
    }

    setShowResult(false);
    setResult(null);
    setErrorMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputText: text,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "의심 문자 분석에 실패했습니다.");
      }

      console.log("의심 문자 분석 결과:", data);
      setResult(data);
      setShowResult(true);
    } catch (error) {
      const message = 
      error instanceof Error
      ? error.message
      : "분석 중 알 수 없는 오류가 발생했습니다.";

      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
    };

  const reset = () => {
    setText("");
    setShowResult(false);
    setLoading(false);
    setResult(null);
    setErrorMessage("");
  };

  return (
    <main className="analysis-page">
      <header className="analysis-header">
        <a href="/" className="brand">
          <span className="brand-badge">L</span>
          <span>LeakCare</span>
        </a>

        <button className="ghost-btn" onClick={reset}>
          초기화
        </button>
      </header>

      <section className="workspace single-workspace">
        <div className="section-heading">
          <div>
            <h2>의심 문자 분석</h2>
            <p>
              유출 사고 이후 받은 보상금, 환불, 본인인증 요구 문자의
              피싱·스미싱 가능성을 분석합니다.
            </p>
          </div>
        </div>

        <div className="app-shell">
          <section className="panel">
            <div className="input-area">
              <label className="field-label">
                <span>의심 문자 입력</span>
                <span>링크·발신 내용·요구 행동 분석</span>
              </label>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="해킹 또는 개인정보 유출이 의심되는 문자를 입력해주세요."
              />

              <div className="sample-row">
                <button className="sample-btn" onClick={() => setText(sampleText)}>
                  의심 문자 예시 불러오기
                </button>
              </div>

              <div className="analyze-row">
                <p className="notice">
                  문자의 링크, 발신 내용, 요구 행동을 기준으로 위험 유형과
                  위험도를 분석합니다.
                </p>

                <button className="primary-btn" onClick={analyze}>
                  AI 분석하기
                </button>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="results">
              {errorMessage && (
                <div className="info-card full">
                  <h4>
                    <span className="icon-dot"></span>입력 오류
                  </h4>
                  <p>{errorMessage}</p>
                  </div>
              )}
              {loading && (
                <div className="result-top">
                  <div>
                    <h3>AI 분석 중입니다</h3>
                    <p>링크, 발신 내용, 요구 행동을 기준으로 위험성을 분석합니다.</p>
                  </div>
                  <div className="score-badge">
                    <strong>···</strong>
                    <span>분석 중</span>
                  </div>
                </div>
              )}

              {!loading && !showResult && (
                <div className="result-top">
                  <div>
                    <h3>분석 결과 대기 중</h3>
                    <p>의심 문자를 입력하고 AI 분석하기 버튼을 눌러주세요.</p>
                  </div>
                  <div className="score-badge">
                    <strong>--</strong>
                    <span>위험도</span>
                  </div>
                </div>
              )}

              {showResult &&  result && (
                <>
                  <div className="result-top">
                    <div>
                      <h3>의심 문자 분석 결과</h3>
                      <p>
                        {result.reason}
                      </p>
                    </div>
                    <div className="score-badge">
                      <strong>{result.riskLevel}</strong>
                      <span>위험도</span>
                    </div>
                  </div>

                  <div className="card-grid">
                    <article className="info-card">
                      <h4>
                        <span className="icon-dot"></span> 위험 신호
                      </h4>
                      <div className="chips">
                        <span className="chip danger">외부 링크 포함</span>
                        <span className="chip danger">본인인증 요구</span>
                        <span className="chip danger">보상금 사칭</span>
                      </div>
                    </article>

                    <article className="info-card">
                      <h4>
                        <span className="icon-dot"></span> 위험 유형
                      </h4>
                      <div className="chips">
                          {result.riskTypes.map((item) => (
                            <span className="chip danger" key={item}>
                              {item}
                            </span>
                          ))}
                        </div>  
                    </article>

                    <article className="info-card full">
                      <h4>
                        <span className="icon-dot"></span> 우선 대응 체크리스트
                      </h4>
                      <ul className="check-list">
                        {result.recommendedActions.map((item, index) => (
                          <li key={`${item.id}-${index}`}>
                            <span className="num">{index + 1}</span>
                            <span>
                              <strong>{item.title}</strong>
                              <br />
                              {item.description}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </article>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}