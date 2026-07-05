"use client";

import { useState } from "react";
import { mockResult } from "../data/mockResult";

const sampleText = `개인정보 유출 안내

고객님의 이름, 휴대전화번호, 이메일, 주소, 주문내역 일부가 외부로 유출된 사실을 확인했습니다.
결제 비밀번호 및 카드번호는 유출 대상에 포함되지 않았습니다.
유출 사실을 악용한 택배 사칭 문자, 환불 안내 문자, 본인인증 요구에 주의해주시기 바랍니다.`;

export default function LeakPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const analyze = () => {
    if (!text.trim()) {
      alert("유출 안내문을 입력해주세요.");
      return;
    }

    setShowResult(false);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setShowResult(true);
    }, 1000);
  };

  const reset = () => {
    setText("");
    setShowResult(false);
    setLoading(false);
  };

  const showComingSoon = () => {
  alert("추후 추가할 예정입니다.");
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
            <h2>유출 안내문 분석</h2>
            <p>
              개인정보 유출 문자, 이메일, 공지문을 입력하면 유출 항목과 후속
              위험을 분석합니다.
            </p>
          </div>
        </div>

        <div className="app-shell">
          <section className="panel">
            <div className="input-area">
              <label className="field-label">
                <span>개인정보 유출 안내문 입력</span>
                <span>문자·이메일·공지문</span>
              </label>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="개인정보 유출 안내 문자, 이메일, 공지문 내용을 입력해주세요."
              />

              <div className="upload-box">
                <span>이미지 업로드 시 OCR 기능을 통해 텍스트를 추출합니다.</span>
                <span className="upload-pill">이미지 업로드</span>
              </div>

              <div className="sample-row">
                <button className="sample-btn" onClick={() => setText(sampleText)}>
                  유출 안내문 예시 불러오기
                </button>
              </div>

              <div className="analyze-row">
                <p className="notice">
                  입력 내용은 분석 전 개인정보 마스킹 처리를 통해 민감정보를
                  보호합니다.
                </p>

                <button className="primary-btn" onClick={analyze}>
                  AI 분석하기
                </button>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="results">
              {loading && (
                <div className="result-top">
                  <div>
                    <h3>AI 분석 중입니다</h3>
                    <p>기업명, 유출 항목, 사고 키워드, 위험 유형을 분석합니다.</p>
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
                    <p>유출 안내문을 입력하고 AI 분석하기 버튼을 눌러주세요.</p>
                  </div>
                  <div className="score-badge">
                    <strong>--</strong>
                    <span>위험도</span>
                  </div>
                </div>
              )}

              {showResult && (
                <>
                  <div className="result-top">
                    <div>
                      <h3>유출 안내문 분석 결과</h3>
                      <p>
                        입력문과 관련 자료를 기반으로 유출 항목, 위험 유형,
                        대응 우선순위를 분석했습니다.
                      </p>
                    </div>
                    <div className="score-badge">
                      <strong>78</strong>
                      <span>주의 필요</span>
                    </div>
                  </div>

                  <div className="card-grid">
                    <article className="info-card">
                      <h4>
                        <span className="icon-dot"></span> 유출 항목
                      </h4>
                      <div className="chips">
                        <span className="chip warning">이름</span>
                        <span className="chip warning">전화번호</span>
                        <span className="chip warning">이메일</span>
                        <span className="chip warning">주소</span>
                        <span className="chip warning">주문내역</span>
                      </div>
                    </article>

                    <article className="info-card">
                      <h4>
                        <span className="icon-dot"></span> 위험 유형
                      </h4>
                      <div className="chips">
                        <span className="chip warning">스미싱</span>
                        <span className="chip warning">택배 사칭</span>
                        <span className="chip warning">환불 안내 사칭</span>
                      </div>
                    </article>

                    <article className="info-card full">
                      <h4>
                        <span className="icon-dot"></span> 우선 대응 체크리스트
                      </h4>
                      <ul className="check-lisk">
                        {mockResult.checklist.map((item, index) => (
                          <li key={`${item.id}-${index}`}>
                            <span className="num">{index + 1}</span>
                            <span>
                              <strong>{item.title}</strong>
                              <br />
                              {item.description}
                            </span>

                            {item.link && (
                              <a
                              className="small-btn"
                              href={item.link.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              바로가기
                            </a>
                            )}
                          </li>
                        ))}
                      </ul>
                    </article>

                    <article className="info-card full">
                      <h4>
                        <span className="icon-dot"></span> 가족 공유용 안내문
                      </h4>
                      <div className="message-card">
                        개인정보 일부가 유출된 안내를 받은 상태입니다. 택배 사칭
                        문자, 환불 안내 문자, 본인인증 요구 문자가 올 수 있으니
                        링크를 누르지 말고 공식 홈페이지나 고객센터를 통해
                        확인해주세요.
                      </div>
                    </article>

                    <article className="info-card full">
                      <h4>
                        <span className="icon-dot"></span> 다음 작업
                      </h4>
                      <div className="action-buttons">
                        <button className="small-btn" onClick={showComingSoon}>안내문 복사</button>
                        <button className="small-btn" onClick={showComingSoon}>PDF 저장</button>
                        <button className="small-btn"onClick={showComingSoon}>신고용 요약문 생성</button>
                      </div>
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