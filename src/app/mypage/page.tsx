"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createBrowserSupabaseClient } from "../../lib/supabase/client";

type HistoryItem = {
  id: string;
  userId: string;
  type: "leak" | "sms";
  title: string;
  company?: string | null;
  riskLevel: string;
  leakedItems?: string[] | null;
  riskTypes?: string[] | null;
  checklist?: unknown[] | null;
  checklistProgress?: number | null;
  resultSummary?: string | null;
  createdAt: string;
};

export default function MyPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    const loadUserAndHistory = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);

      if (!user) {
        setLoading(false);
        return;
      }

      setHistoryLoading(true);

      try {
        const response = await fetch("/api/history");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "분석 이력을 불러오지 못했습니다.");
        }

        setHistory(data.history ?? []);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "분석 이력을 불러오는 중 오류가 발생했습니다.";

        setHistoryError(message);
      } finally {
        setHistoryLoading(false);
        setLoading(false);
      }
    };

    loadUserAndHistory();
  }, []);

  const signOut = async () => {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <main className="analysis-page">
        <header className="nav">
          <a href="/" className="brand">
            <span className="brand-badge">L</span>
            <span>LeakCare</span>
          </a>

          <nav className="nav-menu" aria-label="주요 메뉴">
            <a href="/#guide">이용 안내</a>
            <a href="/leak">유출 안내문 분석</a>
            <a href="/sms">의심 문자 분석</a>
            <a href="/login">로그인</a>
            <a href="/mypage" aria-current="page">
              마이페이지
            </a>
          </nav>
        </header>

        <section className="workspace single-workspace">
          <div className="panel">
            <p>로그인 상태를 확인하는 중입니다.</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="analysis-page">
      <header className="nav">
        <a href="/" className="brand">
          <span className="brand-badge">L</span>
          <span>LeakCare</span>
        </a>

        <nav className="nav-menu" aria-label="주요 메뉴">
          <a href="/#guide">이용 안내</a>
          <a href="/leak">유출 안내문 분석</a>
          <a href="/sms">의심 문자 분석</a>
          <a href="/login">로그인</a>
          <a href="/mypage" aria-current="page">
            마이페이지
          </a>
        </nav>
      </header>

      <section className="workspace single-workspace">
        <div className="section-heading">
          <div>
            <h2>마이페이지</h2>
            <p>로그인 정보와 분석 이력을 확인합니다.</p>
          </div>
        </div>

        {!user ? (
          <div className="panel">
            <div className="result-top">
              <div>
                <h3>로그인이 필요합니다</h3>
                <p>마이페이지를 이용하려면 먼저 로그인해주세요.</p>
              </div>
            </div>

            <div className="action-buttons">
              <a href="/login" className="small-btn">
                로그인하러 가기
              </a>
            </div>
          </div>
        ) : (
          <div className="app-shell">
            <section className="panel">
              <div className="results">
                <div className="result-top">
                  <div>
                    <h3>내 정보</h3>
                    <p>현재 로그인된 계정 정보입니다.</p>
                  </div>
                </div>

                <div className="card-grid">
                  <article className="info-card full">
                    <h4>
                      <span className="icon-dot"></span> 계정
                    </h4>
                    <p>{user.email ?? "이메일 정보 없음"}</p>
                  </article>

                  <article className="info-card full">
                    <h4>
                      <span className="icon-dot"></span> 최근 분석 이력
                    </h4>

                    {historyLoading && (
                      <p>분석 이력을 불러오는 중입니다.</p>
                    )}

                    {historyError && <p>{historyError}</p>}

                    {!historyLoading &&
                      !historyError &&
                      history.length === 0 && (
                        <p>아직 저장된 분석 이력이 없습니다.</p>
                      )}

                    {!historyLoading &&
                      !historyError &&
                      history.length > 0 && (
                        <ul className="check-list">
                          {history.map((item) => (
                            <li
                              key={item.id}
                              style={{
                                background:
                                  "linear-gradient(135deg, #EEF2FF 0%, #EDE9FE 100%)",
                                border: "1px solid #ddd6fe",
                                padding: "18px 20px",
                                minHeight: "auto",
                                display: "flex",
                                alignItems: "center",
                                gap: "20px",
                              }}
                            >
                              <span
                                style={{
                                  flex: 1,
                                  minWidth: 0,
                                  lineHeight: 1.5,
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "center",
                                }}
                              >
                                <strong
                                  style={{
                                    display: "block",
                                    whiteSpace: "nowrap",
                                    fontSize: "18px",
                                    fontWeight: 800,
                                    marginBottom: "10px",
                                    transform: "translateY(-4px)",
                                  }}
                                >
                                  {item.type === "leak"
                                    ? "유출 안내문 분석"
                                    : "의심 문자 분석"}
                                </strong>

                                <span
                                  style={{
                                    whiteSpace: "nowrap",
                                    fontSize: "14px",
                                    color: "#334155",
                                    transform: "translateY(4px)",
                                  }}
                                >
                                  위험도 {item.riskLevel}
                                </span>

                                <span
                                  style={{
                                    whiteSpace: "nowrap",
                                    fontSize: "14px",
                                    color: "#64748b",
                                    transform: "translateY(6px)",
                                  }}
                                >
                                  {item.createdAt
                                    ? new Date(
                                        item.createdAt
                                      ).toLocaleString("ko-KR")
                                    : "날짜 없음"}
                                </span>
                              </span>

                              <span
                                style={{
                                  minWidth: "90px",
                                  textAlign: "center",
                                  fontWeight: 800,
                                  fontSize: "24px",
                                  color: "#4f46e5",
                                }}
                              >
                                {item.checklistProgress ?? 0}%
                                <br />

                                <small
                                  style={{
                                    fontSize: "12px",
                                    color: "#64748b",
                                    fontWeight: 600,
                                  }}
                                >
                                  진행률
                                </small>
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                  </article>

                  <article className="info-card full">
                    <h4>
                      <span className="icon-dot"></span> 계정 관리
                    </h4>

                    <button className="small-btn" onClick={signOut}>
                      로그아웃
                    </button>
                  </article>
                </div>
              </div>
            </section>
          </div>
        )}
      </section>
    </main>
  );
}