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
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(
    null
  );

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

  const loginProvider =
    user?.app_metadata?.provider ?? user?.identities?.[0]?.provider ?? "";

  const accountEmail =
    user?.email ??
    user?.identities?.find(
      (identity) => identity.provider === loginProvider
    )?.identity_data?.email ??
    user?.user_metadata.email ??
    "";

  if (loading) {
    return (
      <main className="analysis-page">
        <header className="nav">
          <a href="/banner" className="brand">
            <span className="brand-badge">L</span>
            <span>LeakCare</span>
          </a>

          <nav className="nav-menu" aria-label="주요 메뉴">
            <a href="/banner#guide">이용 안내</a>
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
        <a href="/banner" className="brand">
          <span className="brand-badge">L</span>
          <span>LeakCare</span>
        </a>

        <nav className="nav-menu" aria-label="주요 메뉴">
          <a href="/banner#guide">이용 안내</a>
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
                <div className="result-top mypage-info-header">
                  <div>
                    <h3>내 정보</h3>
                    <p>현재 로그인된 계정 정보입니다.</p>
                  </div>
                </div>

                <div className="card-grid">
                  <article className="info-card full">
                   <h4 className="account-title">
                      <span className="icon-dot"></span>
                      <span>계정</span>

                      {loginProvider === "google" && (
                        <span
                          className="login-provider-logo google-logo"
                          title="Google 계정으로 로그인"
                          aria-label="Google 계정으로 로그인"
                        >
                          <svg viewBox="0 0 48 48" aria-hidden="true">
                            <path
                              fill="#FFC107"
                              d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5Z"
                            />
                            <path
                              fill="#FF3D00"
                              d="m6.3 14.7 6.6 4.8C14.7 15.2 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7Z"
                            />
                            <path
                              fill="#4CAF50"
                              d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 39.5 16.3 44 24 44Z"
                            />
                            <path
                              fill="#1976D2"
                              d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.2 5.2C41 35.4 44 30.4 44 24c0-1.2-.1-2.4-.4-3.5Z"
                            />
                          </svg>
                        </span>
                          )}

                      {loginProvider === "kakao" && (
                        <span
                          className="login-provider-logo kakao-logo"
                          title="카카오 계정으로 로그인"
                          aria-label="카카오 계정으로 로그인"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path d="M12 4C6.48 4 2 7.45 2 11.7c0 2.73 1.85 5.13 4.64 6.5l-.95 3.5c-.08.3.26.54.52.36l4.18-2.78c.52.07 1.06.11 1.61.11 5.52 0 10-3.45 10-7.69S17.52 4 12 4Z" />
                          </svg>
                        </span>
                      )}
                    </h4>
                    <p>
                        {accountEmail ||
                          (loginProvider === "kakao"
                            ? "카카오 계정에서 이메일을 제공하지 않았습니다."
                            : "이메일 정보 없음")}
                      </p>
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
                                flexDirection: "column",
                                alignItems: "stretch",
                                gap: "16px",
                              }}
                            >
                              <div
                              style={{
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
                              </div>
                              <button
                                type="button"
                                className="small-btn"
                                onClick={() =>
                                  setExpandedHistoryId((currentId) =>
                                    currentId === item.id ? null : item.id
                                  )
                                }
                                aria-expanded={expandedHistoryId === item.id}
                                aria-controls={`history-detail-${item.id}`}
                                style={{
                                  alignSelf: "flex-end",
                                }}
                              >
                                {expandedHistoryId === item.id ? "상세 닫기" : "상세 보기"}
                              </button>
                              {expandedHistoryId === item.id && (
                                <div
                                  id={`history-detail-${item.id}`}
                                  style={{
                                    width: "100%",
                                    borderTop: "1px solid #cbd5e1",
                                    paddingTop: "16px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "16px",
                                  }}
                                >
                                  {item.resultSummary && (
                                    <section>
                                      <h5
                                        style={{
                                          margin: "0 0 8px",
                                          fontSize: "15px",
                                          color: "#1e293b",
                                        }}
                                      >
                                        분석 요약
                                      </h5>

                                      <p
                                        style={{
                                          margin: 0,
                                          color: "#475569",
                                          lineHeight: 1.6,
                                          whiteSpace: "pre-wrap",
                                          wordBreak: "break-word",
                                        }}
                                      >
                                        {item.resultSummary}
                                      </p>
                                    </section>
                                  )}

                                  {item.leakedItems && item.leakedItems.length > 0 && (
                                    <section>
                                      <h5
                                        style={{
                                          margin: "0 0 8px",
                                          fontSize: "15px",
                                          color: "#1e293b",
                                        }}
                                      >
                                        유출된 개인정보
                                      </h5>

                                      <div
                                        style={{
                                          display: "flex",
                                          flexWrap: "wrap",
                                          gap: "8px",
                                        }}
                                      >
                                        {item.leakedItems.map((leakedItem) => (
                                          <span
                                            key={leakedItem}
                                            style={{
                                              padding: "6px 10px",
                                              borderRadius: "999px",
                                              background: "#ffffff",
                                              border: "1px solid #c7d2fe",
                                              fontSize: "13px",
                                              color: "#4338ca",
                                            }}
                                          >
                                            {leakedItem}
                                          </span>
                                        ))}
                                      </div>
                                    </section>
                                  )}

                                  {item.riskTypes && item.riskTypes.length > 0 && (
                                    <section>
                                      <h5
                                        style={{
                                          margin: "0 0 8px",
                                          fontSize: "15px",
                                          color: "#1e293b",
                                        }}
                                      >
                                        {item.type === "leak" ? "예상되는 위험" : "탐지된 위험 유형"}
                                      </h5>

                                      <div
                                        style={{
                                          display: "flex",
                                          flexWrap: "wrap",
                                          gap: "8px",
                                        }}
                                      >
                                        {item.riskTypes.map((riskType) => (
                                          <span
                                            key={riskType}
                                            style={{
                                              padding: "6px 10px",
                                              borderRadius: "999px",
                                              background: "#fff7ed",
                                              border: "1px solid #fed7aa",
                                              fontSize: "13px",
                                              color: "#c2410c",
                                            }}
                                          >
                                            {riskType}
                                          </span>
                                        ))}
                                      </div>
                                    </section>
                                  )}
                                  {Array.isArray(item.checklist) && item.checklist.length > 0 && (
                                    <section>
                                      <h5
                                        style={{
                                          margin: "0 0 8px",
                                          fontSize: "15px",
                                          color: "#1e293b",
                                        }}
                                      >
                                        대응 체크리스트
                                      </h5>

                                      <div
                                        style={{
                                          display: "flex",
                                          flexDirection: "column",
                                          gap: "10px",
                                        }}
                                      >
                                        {item.checklist.map((checkItem, index) => {
                                          if (
                                            typeof checkItem !== "object" ||
                                            checkItem === null ||
                                            !("title" in checkItem)
                                          ) {
                                            return null;
                                          }

                                          const itemData = checkItem as {
                                            id?: string;
                                            priority?: string;
                                            title?: string;
                                            description?: string;
                                            isCompleted?: boolean;
                                          };

                                          return (
                                            <div
                                              key={itemData.id ?? `${item.id}-check-${index}`}
                                              style={{
                                                padding: "12px 14px",
                                                borderRadius: "12px",
                                                background: "#ffffff",
                                                border: "1px solid #e2e8f0",
                                              }}
                                            >
                                              <div
                                                style={{
                                                  display: "flex",
                                                  alignItems: "center",
                                                  gap: "8px",
                                                  marginBottom: itemData.description ? "6px" : 0,
                                                }}
                                              >
                                                <span
                                                  aria-hidden="true"
                                                  style={{
                                                    width: "18px",
                                                    height: "18px",
                                                    borderRadius: "50%",
                                                    border: itemData.isCompleted
                                                      ? "1px solid #4f46e5"
                                                      : "1px solid #94a3b8",
                                                    background: itemData.isCompleted ? "#4f46e5" : "#ffffff",
                                                    color: "#ffffff",
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: "12px",
                                                    flexShrink: 0,
                                                  }}
                                                >
                                                  {itemData.isCompleted ? "✓" : ""}
                                                </span>

                                                <strong
                                                  style={{
                                                    color: "#1e293b",
                                                    fontSize: "14px",
                                                  }}
                                                >
                                                  {itemData.title}
                                                </strong>

                                                {itemData.priority && (
                                                  <span
                                                    style={{
                                                      marginLeft: "auto",
                                                      fontSize: "12px",
                                                      color: "#64748b",
                                                    }}
                                                  >
                                                    {itemData.priority}
                                                  </span>
                                                )}
                                              </div>

                                              {itemData.description && (
                                                <p
                                                  style={{
                                                    margin: 0,
                                                    paddingLeft: "26px",
                                                    color: "#64748b",
                                                    fontSize: "13px",
                                                    lineHeight: 1.5,
                                                    wordBreak: "break-word",
                                                  }}
                                                >
                                                  {itemData.description}
                                                </p>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </section>
                                  )}
                                </div>
                              )}
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
