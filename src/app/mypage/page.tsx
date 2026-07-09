"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createBrowserSupabaseClient } from "../../lib/supabase/client";

export default function MyPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
      setLoading(false);
    };

    loadUser();
  }, []);

  const signOut = async () => {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <main className="analysis-page">
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
      <header className="analysis-header">
        <a href="/banner" className="brand">
          <span className="brand-badge">L</span>
          <span>LeakCare</span>
        </a>
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
                    <ul className="check-list">
                      <li>
                        <span className="num">1</span>
                        <span>최근 개인정보 유출 안내문 분석 결과</span>
                      </li>
                      <li>
                        <span className="num">2</span>
                        <span>최근 의심 문자 분석 결과</span>
                      </li>
                    </ul>
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