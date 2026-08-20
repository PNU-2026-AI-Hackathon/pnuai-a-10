"use client";

import { useEffect } from "react";

type LogoutConfirmModalProps = {
  isOpen: boolean;
  isLoading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function LogoutConfirmModal({
  isOpen,
  isLoading = false,
  onCancel,
  onConfirm,
}: LogoutConfirmModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isLoading) onCancel();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="logout-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isLoading) onCancel();
      }}
    >
      <section
        className="logout-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-modal-title"
        aria-describedby="logout-modal-description"
      >
        <h2 id="logout-modal-title">로그아웃 하시겠습니까?</h2>
        <p id="logout-modal-description">
          로그아웃하면 다시 로그인하기 전까지 개인 분석 이력을 확인할 수 없습니다.
        </p>
        <div className="logout-modal-actions">
          <button type="button" className="logout-modal-cancel" onClick={onCancel} disabled={isLoading}>
            취소
          </button>
          <button type="button" className="logout-modal-confirm" onClick={onConfirm} disabled={isLoading} autoFocus>
            {isLoading ? "로그아웃 중..." : "로그아웃"}
          </button>
        </div>
      </section>
    </div>
  );
}
