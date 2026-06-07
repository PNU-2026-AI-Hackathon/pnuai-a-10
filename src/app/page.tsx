export default function Home() {
  return (
    <main className="landing-page">
      <section className="netflix-hero">
        <header className="landing-nav">
          <div className="landing-logo">LeakCare</div>

          <div className="landing-actions">
            <button className="language-btn">한국어</button>
            <button className="login-btn">시연용</button>
          </div>
        </header>

        <div className="poster-bg">
          {Array.from({ length: 28 }).map((_, index) => (
            <div className="poster-card" key={index}>
              <span></span>
            </div>
          ))}
        </div>

        <div className="hero-overlay"></div>

        <div className="landing-content">
          <h1>
            개인정보 유출,
            <br />
            무엇부터 해야 할까요?
          </h1>

          <p className="landing-sub">
            유출 안내문과 의심 문자를 AI가 분석하여 위험도와 대응 순서를
            한눈에 정리합니다.
          </p>

          <p className="landing-desc">
            개인정보 유출 문자, 이메일, 공지문 또는 의심 문자를 입력하고
            맞춤형 대응 체크리스트를 확인하세요.
          </p>

          <div className="landing-start-row">
            <a href="/banner" className="start-main-button">
              시작하기
              <span>›</span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}