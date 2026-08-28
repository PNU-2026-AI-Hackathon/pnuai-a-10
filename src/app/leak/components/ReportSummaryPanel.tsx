"use client";

import { useState } from "react";
import type {
  LeakAnalysisResult,
  ReportDamageStatus,
  ReportSummaryRequest,
  ReportSummaryResponse,
} from "../../../types/analysis";

type ReportSummaryPanelProps = {
  analysisResult: LeakAnalysisResult;
};

type FormState = {
  leakNoticeDate: string;
  discoveryMethod: string;
  damageStatus: ReportDamageStatus;
  damageDate: string;
  damageAmount: string;
  damageDescription: string;
  suspiciousContact: string;
  evidenceItems: string;
  actionsTaken: string;
  requestPurpose: string;
};

const initialFormState: FormState = {
  leakNoticeDate: "",
  discoveryMethod: "",
  damageStatus: "none",
  damageDate: "",
  damageAmount: "",
  damageDescription: "",
  suspiciousContact: "",
  evidenceItems: "",
  actionsTaken: "",
  requestPurpose: "",
};

const sectionLabels = {
  incidentOverview: "사건 개요",
  leakedInformation: "확인된 유출 정보",
  damageStatus: "현재 피해 상태",
  evidence: "보유 증거 및 의심 연락",
  actionsTaken: "이미 취한 조치",
  requestDetails: "상담·신고 요청 내용",
} as const;

const splitItems = (value: string) =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const optionalText = (value: string) => value.trim() || undefined;

export default function ReportSummaryPanel({
  analysisResult,
}: ReportSummaryPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [summary, setSummary] = useState<ReportSummaryResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  const updateForm = <K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrorMessage("");
    setCopyMessage("");
  };

  const generateSummary = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setErrorMessage("");
    setCopyMessage("");

    try {
      const evidenceItems = splitItems(form.evidenceItems);
      const actionsTaken = splitItems(form.actionsTaken);
      const parsedDamageAmount = form.damageAmount.trim()
        ? Number(form.damageAmount)
        : undefined;

      const payload: ReportSummaryRequest = {
        company: analysisResult.company,
        service: optionalText(analysisResult.service ?? ""),
        leakedItems: analysisResult.leakedItems,
        leakNoticeDate: optionalText(form.leakNoticeDate),
        discoveryMethod: optionalText(form.discoveryMethod),
        damageStatus: form.damageStatus,
        suspiciousContact: optionalText(form.suspiciousContact),
        evidenceItems: evidenceItems.length > 0 ? evidenceItems : undefined,
        actionsTaken: actionsTaken.length > 0 ? actionsTaken : undefined,
        requestPurpose: optionalText(form.requestPurpose),
        ...(form.damageStatus !== "none"
          ? {
              damageDate: optionalText(form.damageDate),
              damageAmount:
                parsedDamageAmount !== undefined &&
                Number.isFinite(parsedDamageAmount)
                  ? parsedDamageAmount
                  : undefined,
              damageDescription: optionalText(form.damageDescription),
            }
          : {}),
      };

      const response = await fetch("/api/report-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data: ReportSummaryResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data === "object" &&
            data !== null &&
            "message" in data &&
            typeof data.message === "string"
            ? data.message
            : "요약문을 생성하지 못했습니다."
        );
      }

      setSummary(data);
    } catch (error) {
      console.error("신고·상담용 요약문 생성 실패:", error);
      setErrorMessage(
        "신고·상담용 요약문을 만드는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const copySummary = async () => {
    if (!summary?.summaryText) return;

    try {
      await navigator.clipboard.writeText(summary.summaryText);
      setCopyMessage("복사되었습니다.");
    } catch (error) {
      console.error("요약문 복사 실패:", error);
      setCopyMessage("복사하지 못했습니다.");
    }
  };

  return (
    <article className="info-card full">
      <h4>
        <span className="icon-dot"></span> 신고·상담용 요약문
      </h4>
      <p style={{ marginTop: "8px", lineHeight: 1.65, color: "#626977" }}>
        공식 신고서를 대신 제출하는 기능이 아니라, 상담 또는 신고할 때 전달할
        사실을 정리하는 기능입니다.
      </p>

      <div className="action-buttons" style={{ marginTop: "14px" }}>
        <button
          type="button"
          className="small-btn leak-result-action"
          onClick={() => setIsOpen((current) => !current)}
        >
          신고·상담용 요약문 만들기
        </button>
      </div>

      {isOpen && (
        <div style={{ marginTop: "20px" }}>
          <div
            style={{
              padding: "16px",
              border: "1px solid #e3e6eb",
              borderRadius: "14px",
              background: "#f8f9fb",
              lineHeight: 1.7,
            }}
          >
            <strong style={{ display: "block", marginBottom: "6px" }}>
              분석 결과에서 자동 입력된 정보
            </strong>
            <div>기업명: {analysisResult.company}</div>
            {analysisResult.service && <div>서비스: {analysisResult.service}</div>}
            <div>
              유출 항목: {analysisResult.leakedItems.join(", ") || "확인되지 않음"}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gap: "16px",
              marginTop: "18px",
            }}
          >
            <label style={{ display: "grid", gap: "8px" }}>
              <strong>유출 안내 확인일</strong>
              <input
                type="date"
                value={form.leakNoticeDate}
                onChange={(event) =>
                  updateForm("leakNoticeDate", event.target.value)
                }
              />
            </label>

            <label style={{ display: "grid", gap: "8px" }}>
              <strong>유출 사실을 알게 된 경로</strong>
              <input
                type="text"
                value={form.discoveryMethod}
                onChange={(event) =>
                  updateForm("discoveryMethod", event.target.value)
                }
                placeholder="예: 기업 이메일 안내, 문자 공지, 뉴스 기사"
              />
            </label>

            <fieldset
              style={{
                margin: 0,
                padding: "16px",
                border: "1px solid #e3e6eb",
                borderRadius: "14px",
              }}
            >
              <legend style={{ padding: "0 6px", fontWeight: 700 }}>
                피해 상태
              </legend>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                {[
                  ["none", "피해 없음"],
                  ["suspected", "피해 의심"],
                  ["confirmed", "피해 확인"],
                ].map(([value, label]) => (
                  <label
                    key={value}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "7px",
                      padding: "9px 12px",
                      border: "1px solid #dfe3e8",
                      borderRadius: "10px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      name="damageStatus"
                      value={value}
                      checked={form.damageStatus === value}
                      onChange={() =>
                        updateForm(
                          "damageStatus",
                          value as ReportDamageStatus
                        )
                      }
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>

            {form.damageStatus !== "none" && (
              <>
                <label style={{ display: "grid", gap: "8px" }}>
                  <strong>피해 발생일</strong>
                  <input
                    type="date"
                    value={form.damageDate}
                    onChange={(event) =>
                      updateForm("damageDate", event.target.value)
                    }
                  />
                </label>

                <label style={{ display: "grid", gap: "8px" }}>
                  <strong>피해 금액</strong>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    value={form.damageAmount}
                    onChange={(event) =>
                      updateForm("damageAmount", event.target.value)
                    }
                    placeholder="숫자만 입력해 주세요."
                  />
                </label>

                <label style={{ display: "grid", gap: "8px" }}>
                  <strong>피해 내용 또는 의심 정황</strong>
                  <textarea
                    value={form.damageDescription}
                    onChange={(event) =>
                      updateForm("damageDescription", event.target.value)
                    }
                    placeholder="발생한 피해나 의심되는 정황을 입력해 주세요."
                    rows={4}
                  />
                </label>
              </>
            )}

            <label style={{ display: "grid", gap: "8px" }}>
              <strong>의심 문자·전화·링크 내용</strong>
              <textarea
                value={form.suspiciousContact}
                onChange={(event) =>
                  updateForm("suspiciousContact", event.target.value)
                }
                placeholder="관련 내용이 있을 때만 입력해 주세요."
                rows={4}
              />
            </label>

            <label style={{ display: "grid", gap: "8px" }}>
              <strong>보유 증거</strong>
              <textarea
                value={form.evidenceItems}
                onChange={(event) =>
                  updateForm("evidenceItems", event.target.value)
                }
                placeholder={"한 줄에 하나씩 입력해 주세요.\n예: 유출 안내 이메일 캡처\n의심 문자 캡처"}
                rows={5}
              />
            </label>

            <label style={{ display: "grid", gap: "8px" }}>
              <strong>이미 취한 조치</strong>
              <textarea
                value={form.actionsTaken}
                onChange={(event) =>
                  updateForm("actionsTaken", event.target.value)
                }
                placeholder={"한 줄에 하나씩 입력해 주세요.\n예: 비밀번호 변경\n카드사에 사용 정지 요청"}
                rows={5}
              />
            </label>

            <label style={{ display: "grid", gap: "8px" }}>
              <strong>상담·신고 목적</strong>
              <textarea
                value={form.requestPurpose}
                onChange={(event) =>
                  updateForm("requestPurpose", event.target.value)
                }
                placeholder="예: 추가 피해 예방 방법 상담, 금전 피해 신고"
                rows={4}
              />
            </label>
          </div>

          {errorMessage && (
            <p
              role="alert"
              style={{ marginTop: "14px", color: "#b42318", lineHeight: 1.6 }}
            >
              {errorMessage}
            </p>
          )}

          <div className="action-buttons" style={{ marginTop: "18px" }}>
            <button
              type="button"
              className="small-btn"
              onClick={generateSummary}
              disabled={isGenerating}
            >
              {isGenerating
                ? "요약문 만드는 중…"
                : summary
                  ? "수정 내용으로 다시 만들기"
                  : "요약문 만들기"}
            </button>
          </div>

          {summary && (
            <div
              style={{
                marginTop: "22px",
                padding: "20px",
                border: "1px solid #e3e6eb",
                borderRadius: "16px",
                background: "#ffffff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div>
                  <h4 style={{ margin: 0 }}>{summary.title}</h4>
                  {summary.generationMode === "template" && (
                    <p
                      style={{
                        marginTop: "8px",
                        fontSize: "12px",
                        lineHeight: 1.6,
                        color: "#7a808c",
                      }}
                    >
                      AI 문장 정리가 일시적으로 지연되어 기본 형식으로
                      작성되었습니다.
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  className="small-btn"
                  onClick={copySummary}
                >
                  전체 요약문 복사
                </button>
              </div>

              {copyMessage && (
                <p role="status" style={{ marginTop: "10px" }}>
                  {copyMessage}
                </p>
              )}

              <div
                className="message-card"
                style={{
                  marginTop: "16px",
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                  lineHeight: 1.75,
                }}
              >
                {summary.summaryText}
              </div>

              <div style={{ display: "grid", gap: "14px", marginTop: "20px" }}>
                {Object.entries(sectionLabels).map(([key, label]) => (
                  <section key={key}>
                    <strong style={{ display: "block", marginBottom: "6px" }}>
                      {label}
                    </strong>
                    <p
                      style={{
                        margin: 0,
                        whiteSpace: "pre-wrap",
                        overflowWrap: "anywhere",
                        lineHeight: 1.7,
                        color: "#626977",
                      }}
                    >
                      {summary.sections[
                        key as keyof ReportSummaryResponse["sections"]
                      ]}
                    </p>
                  </section>
                ))}
              </div>

              {summary.missingFields.length > 0 && (
                <div
                  style={{
                    marginTop: "20px",
                    padding: "16px",
                    borderRadius: "14px",
                    background: "#f8f9fb",
                  }}
                >
                  <strong>
                    다음 정보는 입력되지 않아 요약문에 포함되지 않았습니다.
                  </strong>
                  <ul style={{ marginBottom: 0, lineHeight: 1.7 }}>
                    {summary.missingFields.map((field) => (
                      <li key={field}>{field}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
