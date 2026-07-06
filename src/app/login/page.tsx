"use client";

export default function LoginPage() {
  const showComingSoon = () => {
    alert("추후 로그인 연동 예정입니다.");
  };

  return (
    <main className="analysis-page">
      <header className="analysis-header">
        <a href="/banner" className="brand">
          <span className="brand-badge">L</span>
          <span>LeakCare</span>
        </a>
      </header>

      <section
        className="workspace"
        style={{
          minHeight: "calc(100vh - 90px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          className="panel"
          style={{
            width: "100%",
            maxWidth: "480px",
            padding: "36px",
          }}
        >
          <div className="results">
            <div
              className="result-top"
              style={{
                marginBottom: "24px",
              }}
            >
              <div>
                <h3>로그인</h3>
                <p>
                  Google 또는 Kakao 계정으로 LeakCare를 이용할 수 있습니다.
                </p>
              </div>
            </div>

            <div
              className="action-buttons"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <button className="small-btn" onClick={showComingSoon}>
                Google로 로그인
              </button>

              <button className="small-btn" onClick={showComingSoon}>
                Kakao로 로그인
              </button>
            </div>

            <p
              style={{
                marginTop: "20px",
                color: "#64748b",
                fontSize: "14px",
                lineHeight: "1.6",
              }}
            >
              현재는 로그인 화면 UI만 제공되며, 실제 소셜 로그인 연동은 추후
              추가됩니다.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}