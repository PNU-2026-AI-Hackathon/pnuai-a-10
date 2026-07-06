"use client";

export default function BannerPage() {
  const scrollToGuide = () => {
    document.getElementById("guide")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="page">
      <header className="nav">
        <a href="/" className="brand">
          <span className="brand-badge">L</span>
          <span>LeakCare</span>
        </a>

        <nav className="nav-menu">
          <button className="nav-text-button" onClick={scrollToGuide}>
            이용 안내
          </button>

          <a href="/leak" target="_blank" rel="noopener noreferrer">
            유출 안내문 분석
          </a>

          <a href="/sms" target="_blank" rel="noopener noreferrer">
            의심 문자 분석
          </a>
          <a href="/login" className="secondary=btn">
            로그인</a>
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
              <a
                className="primary-btn"
                href="/leak"
                target="_blank"
                rel="noopener noreferrer"
              >
                유출 안내문 분석하기
              </a>

              <a
                className="secondary-btn"
                href="/sms"
                target="_blank"
                rel="noopener noreferrer"
              >
                의심 문자 분석하기
              </a>
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

        <section className="flow" id="guide">
          <div className="section-heading">
            <div>
              <h2>이용 안내</h2>
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
    </div>
  );
}
