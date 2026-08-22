"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "../lib/supabase/client";
import LogoutConfirmModal from "./LogoutConfirmModal";

type NavigationProps = {
  activePage?: "leak" | "sms" | "mypage";
  guideButton?: boolean;
};

export default function Navigation({ activePage, guideButton = false }: NavigationProps) {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

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

  const handleSignOut = async () => {
    setIsSigningOut(true);

    const { error } = await supabase.auth.signOut();
    if (error) {
      setIsSigningOut(false);
      alert("로그아웃에 실패했습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    setIsLogoutModalOpen(false);
    setIsLoggedIn(false);
    router.push("/banner");
    router.refresh();
  };

  const renderMenuItems = () => (
    <>
      <a href={guideButton ? "#guide" : "/banner#guide"}>이용 안내</a>
      <a href="/leak" aria-current={activePage === "leak" ? "page" : undefined}>유출 안내문 분석</a>
      <a href="/sms" aria-current={activePage === "sms" ? "page" : undefined}>의심 문자 분석</a>
      <a href="/mypage" aria-current={activePage === "mypage" ? "page" : undefined}>마이페이지</a>
      {isLoggedIn ? (
        <button className="nav-text-button" type="button" onClick={() => setIsLogoutModalOpen(true)}>로그아웃</button>
      ) : (
        <a href="/login">로그인</a>
      )}
    </>
  );

  return (
    <>
      <header className="nav">
      <a href="/banner" className="brand" aria-label="LeakCare 홈">
        <img className="brand-logo" src="/images/leakcare-logo.png" alt="" />
      </a>
      <nav className="nav-menu nav-menu-desktop" aria-label="주요 메뉴">
        {renderMenuItems()}
      </nav>
      <details className="nav-mobile-menu">
        <summary aria-label="메뉴 열기">
          <span></span>
          <span></span>
          <span></span>
        </summary>
        <nav className="nav-menu nav-menu-mobile" aria-label="모바일 주요 메뉴">
          {renderMenuItems()}
        </nav>
      </details>
      </header>
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        isLoading={isSigningOut}
        onCancel={() => setIsLogoutModalOpen(false)}
        onConfirm={handleSignOut}
      />
    </>
  );
}
