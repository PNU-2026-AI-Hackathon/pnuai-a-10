"use client";

import { createBrowserSupabaseClient } from "../../lib/supabase/client";

export default function LoginPage() {
  const signInWithProvider = async (provider: "google" | "kakao") => {
    const supabase = createBrowserSupabaseClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/banner`,
      },
    });

    if (error) {
      alert(error.message);
    }
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
              <button
                className="small-btn"
                onClick={() => signInWithProvider("google")}
              >
                Google로 로그인
              </button>

              <button
                className="small-btn"
                onClick={() => signInWithProvider("kakao")}
              >
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
              버튼을 누르면 Google 또는 Kakao 로그인 화면으로 이동합니다.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}