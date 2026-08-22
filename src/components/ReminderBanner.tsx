"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "../lib/supabase/client";

export default function ReminderBanner() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [hasIncompleteChecklist, setHasIncompleteChecklist] = useState(false);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    let isMounted = true;

    const checkIncompleteChecklist = async () => {
      try {
        const response = await fetch("/api/history", { cache: "no-store" });

        if (!response.ok) {
          setHasIncompleteChecklist(false);
          return;
        }

        const data = await response.json();
        const history = Array.isArray(data.history) ? data.history : [];
        const hasIncomplete = history.some(
          (item) =>
            Array.isArray(item.checklist) &&
            item.checklist.length > 0 &&
            item.checklist.some((checkItem: { isCompleted?: boolean }) => !checkItem.isCompleted)
        );

        if (isMounted) {
          setHasIncompleteChecklist(hasIncomplete);
        }
      } catch {
        if (isMounted) {
          setHasIncompleteChecklist(false);
        }
      }
    };

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (isMounted) {
        const loggedIn = Boolean(session);
        setIsLoggedIn(loggedIn);

        if (loggedIn) {
          await checkIncompleteChecklist();
        } else {
          setHasIncompleteChecklist(false);
        }
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const loggedIn = Boolean(session);
      setIsLoggedIn(loggedIn);

      if (loggedIn) {
        void checkIncompleteChecklist();
      } else {
        setHasIncompleteChecklist(false);
      }
    });

    const handleChecklistUpdate = () => {
      void checkIncompleteChecklist();
    };

    window.addEventListener("checklist-progress-updated", handleChecklistUpdate);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      window.removeEventListener("checklist-progress-updated", handleChecklistUpdate);
    };
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
          flexShrink: 0,
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
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          닫기
        </button>
      </div>
    </div>
  );
}
