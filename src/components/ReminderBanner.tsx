"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "../lib/supabase/client";

export default function ReminderBanner() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const hasIncompleteChecklist = true;

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setIsLoggedIn(Boolean(session));
    };

    checkSession();
  }, []);

  if (!isLoggedIn || isDismissed || !hasIncompleteChecklist) {
    return null;
  }

  return (
    <div
      style={{
        padding: "12px 24px",
        background: "#fff7ed",
        borderBottom: "1px solid #fed7aa",
        color: "#9a3412",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        fontSize: "14px",
        fontWeight: 600,
      }}
    >
      <span>
        아직 완료하지 않은 대응 체크리스트가 있습니다. 마이페이지에서 확인해보세요.
      </span>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <a
          href="/mypage"
          style={{
            padding: "8px 12px",
            borderRadius: "999px",
            background: "#ffffff",
            border: "1px solid #fdba74",
            color: "#9a3412",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          확인하기
        </a>

        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          style={{
            border: "none",
            background: "transparent",
            color: "#9a3412",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          닫기
        </button>
      </div>
    </div>
  );
}