"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "../lib/supabase/client";

type NavigationProps = {
  activePage?: "leak" | "sms" | "mypage";
  guideButton?: boolean;
};

export default function Navigation({ activePage, guideButton = false }: NavigationProps) {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted) setIsLoggedIn(Boolean(session));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setIsLoggedIn(Boolean(session))
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleGuideClick = () => {
    document.getElementById("guide")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert("로그아웃에 실패했습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    setIsLoggedIn(false);
    router.push("/banner");
    router.refresh();
  };

  return (
    <header className="nav">
      <a href="/banner" className="brand" aria-label="LeakCare 홈">
        <img className="brand-logo" src="/images/leakcare-logo.png" alt="" />
      </a>
      <nav className="nav-menu" aria-label="주요 메뉴">
        {guideButton ? (
          <button className="nav-text-button" onClick={handleGuideClick}>이용 안내</button>
        ) : (
          <a href="/banner#guide">이용 안내</a>
        )}
        <a href="/leak" aria-current={activePage === "leak" ? "page" : undefined}>유출 안내문 분석</a>
        <a href="/sms" aria-current={activePage === "sms" ? "page" : undefined}>의심 문자 분석</a>
        <a href="/mypage" aria-current={activePage === "mypage" ? "page" : undefined}>마이페이지</a>
        {isLoggedIn ? (
          <button className="nav-text-button" type="button" onClick={handleSignOut}>로그아웃</button>
        ) : (
          <a href="/login">로그인</a>
        )}
      </nav>
    </header>
  );
}
