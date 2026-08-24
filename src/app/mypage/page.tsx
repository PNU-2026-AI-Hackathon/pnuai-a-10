"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createBrowserSupabaseClient } from "../../lib/supabase/client";
import Navigation from "../../components/Navigation";
import LogoutConfirmModal from "../../components/LogoutConfirmModal";

type HistoryItem = {
  id: string;
  userId: string;
  type: "leak" | "sms";
  title: string;
  company?: string | null;
  riskLevel: string;
  riskScore?: number;
  leakedItems?: string[] | null;
  riskTypes?: string[] | null;
  checklist?: unknown[] | null;
  checklistProgress?: number | null;
  resultSummary?: string | null;
  createdAt: string;
};

type HistoryChecklistItem = {
  id?: string;
  priority?: string;
  title?: string;
  description?: string;
  isCompleted?: boolean;
};

export default function MyPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [historyPage, setHistoryPage] = useState(1);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(
    null
  );
  const [updatingChecklistKey, setUpdatingChecklistKey] = useState<string | null>(null);

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
    setIsSigningOut(true);

    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      setIsSigningOut(false);
      alert("로그아웃에 실패했습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    setUser(null);
    router.push("/banner");
    router.refresh();
  };

  const toggleChecklistItem = async (
    historyId: string,
    checklistIndex: number,
    isCompleted: boolean
  ) => {
    const updateKey = `${historyId}-${checklistIndex}`;
    const previousHistory = history;

    const nextHistory = history.map((historyItem) => {
      if (historyItem.id !== historyId || !Array.isArray(historyItem.checklist)) {
        return historyItem;
      }

      const checklist = historyItem.checklist.map((checkItem, index) =>
        index === checklistIndex && typeof checkItem === "object" && checkItem !== null
          ? { ...checkItem, isCompleted }
          : checkItem
      );
      const validItems = checklist.filter(
        (checkItem): checkItem is HistoryChecklistItem =>
          typeof checkItem === "object" && checkItem !== null && "title" in checkItem
      );
      const completedCount = validItems.filter((checkItem) => checkItem.isCompleted).length;

      return {
        ...historyItem,
        checklist,
        checklistProgress:
          validItems.length > 0
            ? Math.round((completedCount / validItems.length) * 100)
            : 0,
      };
    });

    setHistory(nextHistory);
    setUpdatingChecklistKey(updateKey);
    setHistoryError("");

    try {
      const response = await fetch("/api/history", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ historyId, checklistIndex, isCompleted }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "체크 상태를 저장하지 못했습니다.");
      }

      setHistory((currentHistory) =>
        currentHistory.map((historyItem) =>
          historyItem.id === historyId ? data.history : historyItem
        )
      );
      window.dispatchEvent(new Event("checklist-progress-updated"));
    } catch (error) {
      setHistory(previousHistory);
      setHistoryError(
        error instanceof Error ? error.message : "체크 상태를 저장하지 못했습니다."
      );
    } finally {
      setUpdatingChecklistKey(null);
    }
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

  const historyItemsPerPage = 5;
  const historyPageCount = Math.ceil(history.length / historyItemsPerPage);
  const visibleHistory = history.slice(
    (historyPage - 1) * historyItemsPerPage,
    historyPage * historyItemsPerPage
  );

  if (loading) {
    return (
      <main className="analysis-page">
        <Navigation activePage="mypage" />

        <section className="workspace single-workspace mypage-workspace mypage-loading-workspace">
          <div className="mypage-loading-card" role="status" aria-live="polite">
            <div className="mypage-loading-icon" aria-hidden="true">
              <span></span>
            </div>
            <h2>마이페이지를 준비하고 있어요</h2>
            <p>로그인 정보를 안전하게 확인하는 중입니다.</p>
            <div className="mypage-loading-dots" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="analysis-page">
      <Navigation activePage="mypage" />

      <section className="workspace single-workspace mypage-workspace">
        <div className="section-heading">
          <div>
            <h2>마이페이지</h2>
            <p>로그인 정보와 분석 이력을 확인합니다.</p>
          </div>
        </div>

        {!user ? (
          <div className="panel mypage-login-panel">
            <div className="result-top">
              <div>
                <h3>로그인이 필요합니다</h3>
                <p>마이페이지를 이용하려면 먼저 로그인해주세요.</p>
              </div>
            </div>

            <div className="action-buttons">
              <a href="/login" className="small-btn mypage-login-btn">
                로그인
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
                        <>
                        <ul className="check-list">
                          {visibleHistory.map((item) => (
                            <li
                              key={item.id}
                              className="history-card"
                              style={{
                                background:
                                  "linear-gradient(135deg, #EEF2FF 0%, #EDE9FE 100%)",
                                border: "1px solid #ddd6fe",
                                width: "calc(100% - 16px)",
                                margin: "0 auto",
                                boxSizing: "border-box",
                                padding: "14px 18px",
                                minHeight: "auto",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "stretch",
                                gap: "12px",
                              }}
                            >
                              <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "16px",
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
                                    marginBottom: "6px",
                                    transform: "translateY(-2px)",
                                  }}
                                >
                                  {item.type === "leak"
                                    ? item.company
                                      ? `${item.company} 유출 안내문 분석`
                                      : item.title
                                    : item.title}
                                </strong>

                                <span
                                  className="history-risk-level"
                                  data-risk-level={item.riskLevel}
                                  style={{
                                    whiteSpace: "nowrap",
                                    fontSize: "14px",
                                    transform: "translateY(2px)",
                                  }}
                                >
                                  위험도 {item.riskLevel}
                                  {item.type === "leak" && item.riskScore !== undefined
                                    ? ` (${item.riskScore}점)`
                                    : ""}
                                </span>

                              </span>

                              {Array.isArray(item.checklist) && item.checklist.length > 0 && (
                                <span
                                  style={{
                                    minWidth: "90px",
                                    paddingRight: 0,
                                    alignSelf: "flex-start",
                                    textAlign: "center",
                                    fontWeight: 800,
                                    fontSize: "28px",
                                    lineHeight: 1.1,
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
                              )}
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "flex-end",
                                  justifyContent: "space-between",
                                  gap: "12px",
                                }}
                              >
                                <span
                                  style={{
                                    whiteSpace: "nowrap",
                                    fontSize: "14px",
                                    color: "#64748b",
                                  }}
                                >
                                  {item.createdAt
                                    ? new Date(item.createdAt).toLocaleString("ko-KR")
                                    : "날짜 없음"}
                                </span>
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
                                >
                                  {expandedHistoryId === item.id ? "상세 닫기" : "상세 보기"}
                                </button>
                              </div>
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

                                          const itemData = checkItem as HistoryChecklistItem;
                                          const checklistKey = `${item.id}-${index}`;
                                          const isUpdating = updatingChecklistKey === checklistKey;

                                          return (
                                            <div
                                              key={itemData.id ?? `${item.id}-check-${index}`}
                                              className={`history-check-item${
                                                itemData.isCompleted ? " is-completed" : ""
                                              }`}
                                            >
                                              <div
                                                style={{
                                                  display: "flex",
                                                  alignItems: "center",
                                                  gap: "8px",
                                                  marginBottom: itemData.description ? "6px" : 0,
                                                }}
                                              >
                                                <button
                                                  type="button"
                                                  className="history-check-button"
                                                  aria-label={`${itemData.title ?? "체크리스트 항목"} ${
                                                    itemData.isCompleted ? "완료 취소" : "완료"
                                                  }`}
                                                  aria-pressed={Boolean(itemData.isCompleted)}
                                                  disabled={isUpdating}
                                                  onClick={() =>
                                                    toggleChecklistItem(
                                                      item.id,
                                                      index,
                                                      !itemData.isCompleted
                                                    )
                                                  }
                                                >
                                                  {itemData.isCompleted ? "✓" : ""}
                                                </button>

                                                <strong
                                                  className="history-check-title"
                                                >
                                                  {itemData.title}
                                                </strong>

                                              </div>

                                              {itemData.description && (
                                                <p
                                                  style={{
                                                    margin: 0,
                                                    paddingLeft: "26px",
                                                    color: "#64748b",
                                                    fontSize: "14px",
                                                    lineHeight: 1.6,
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
                        {historyPageCount > 1 && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "12px",
                              marginTop: "18px",
                            }}
                          >
                            <button
                              type="button"
                              className="small-btn"
                              disabled={historyPage === 1}
                              onClick={() => {
                                setExpandedHistoryId(null);
                                setHistoryPage((page) => Math.max(1, page - 1));
                              }}
                            >
                              이전
                            </button>
                            <span style={{ color: "#64748b", fontSize: "14px" }}>
                              {historyPage} / {historyPageCount}
                            </span>
                            <button
                              type="button"
                              className="small-btn"
                              disabled={historyPage === historyPageCount}
                              onClick={() => {
                                setExpandedHistoryId(null);
                                setHistoryPage((page) => Math.min(historyPageCount, page + 1));
                              }}
                            >
                              다음
                            </button>
                          </div>
                        )}
                        </>
                      )}
                  </article>

                  <article className="info-card full">
                    <h4>
                      <span className="icon-dot"></span> 계정 관리
                    </h4>

                    <button className="small-btn" onClick={() => setIsLogoutModalOpen(true)}>
                      로그아웃
                    </button>
                  </article>
                </div>
              </div>
            </section>
          </div>
        )}
      </section>
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        isLoading={isSigningOut}
        onCancel={() => setIsLogoutModalOpen(false)}
        onConfirm={signOut}
      />
    </main>
  );
}
