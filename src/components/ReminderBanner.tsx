"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createBrowserSupabaseClient } from "../lib/supabase/client";
import styles from "./ReminderBanner.module.css";

const CHECKLIST_CACHE_PREFIX = "leakcare-incomplete-checklist:";

function readChecklistCache(userId: string) {
  try {
    const cached = sessionStorage.getItem(`${CHECKLIST_CACHE_PREFIX}${userId}`);
    return cached === null ? null : cached === "true";
  } catch {
    return null;
  }
}

function writeChecklistCache(userId: string, hasIncompleteChecklist: boolean) {
  try {
    sessionStorage.setItem(
      `${CHECKLIST_CACHE_PREFIX}${userId}`,
      String(hasIncompleteChecklist)
    );
  } catch {
    // 세션 저장소를 사용할 수 없는 환경에서는 서버 조회 결과만 사용합니다.
  }
}

export default function ReminderBanner() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [hasIncompleteChecklist, setHasIncompleteChecklist] = useState(false);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    let isMounted = true;
    let activeUserId: string | null = null;

    const checkIncompleteChecklist = async (userId: string) => {
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

        writeChecklistCache(userId, hasIncomplete);

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
        activeUserId = session?.user.id ?? null;
        setIsLoggedIn(loggedIn);

        if (session) {
          const cached = readChecklistCache(session.user.id);

          if (cached !== null) {
            setHasIncompleteChecklist(cached);
          }

          await checkIncompleteChecklist(session.user.id);
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
      activeUserId = session?.user.id ?? null;
      setIsLoggedIn(loggedIn);

      if (session) {
        const cached = readChecklistCache(session.user.id);

        if (cached !== null) {
          setHasIncompleteChecklist(cached);
        }

        void checkIncompleteChecklist(session.user.id);
      } else {
        setHasIncompleteChecklist(false);
      }
    });

    const handleChecklistUpdate = () => {
      if (activeUserId) {
        void checkIncompleteChecklist(activeUserId);
      }
    };

    window.addEventListener("checklist-progress-updated", handleChecklistUpdate);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      window.removeEventListener("checklist-progress-updated", handleChecklistUpdate);
    };
  }, []);

  if (
    pathname === "/mypage" ||
    !isLoggedIn ||
    isDismissed ||
    !hasIncompleteChecklist
  ) {
    return null;
  }

  return (
    <aside className={styles.reminder} aria-label="체크리스트 알림">
      <button
        type="button"
        className={styles.closeButton}
        onClick={() => setIsDismissed(true)}
        aria-label="알림 닫기"
      >
        ×
      </button>

      <div className={styles.content}>
        <span className={styles.icon} aria-hidden="true">!</span>
        <div>
          <strong className={styles.title}>미완료 체크리스트가 있어요</strong>
          <p className={styles.description}>
            마이페이지에서 남은 대응 항목을 확인해보세요.
          </p>
        </div>
      </div>

      <a href="/mypage" className={styles.action}>
        확인하기
        <span aria-hidden="true">→</span>
      </a>
    </aside>
  );
}
