"use client";

import { useState, type CSSProperties } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { extractTextFromImage } from "../../lib/ocr";
import {
  providerLinks,
  supportAgencyLinks,
} from "../../data/providerLinks";
import type {
  ActionLink,
  ChecklistItem,
  LeakAnalysisResult,
} from "../../types/analysis";
import ReportSummaryPanel from "./components/ReportSummaryPanel";
import Navigation from "../../components/Navigation";

const sampleText = `개인정보 유출 안내

고객님의 이름, 휴대전화번호, 이메일, 주소, 주문내역 일부가 외부로 유출된 사실을 확인했습니다.
결제 비밀번호 및 카드번호는 유출 대상에 포함되지 않았습니다.
유출 사실을 악용한 택배 사칭 문자, 환불 안내 문자, 본인인증 요구에 주의해주시기 바랍니다.`;

const leakCareShareUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://leakcare.vercel.app";

type RiskGaugeProps = {
  riskLevel: "낮음" | "보통" | "높음";
  riskScore?: number;
};

function RiskGauge({ riskLevel, riskScore }: RiskGaugeProps) {
  const fallbackScore = {
    낮음: 10,
    보통: 30,
    높음: 70,
  }[riskLevel];

  const score = Math.max(0, Math.min(100, riskScore ?? fallbackScore));

  // 0점은 왼쪽, 100점은 오른쪽입니다.
  const needleAngle = -90 + score * 1.8;

  return (
    <div
      className="risk-gauge"
      role="img"
      aria-label={`위험도 ${riskLevel}, 위험지수 ${score}점`}
    >
      <svg viewBox="0 0 180 115" aria-hidden="true">
        <defs>
          {/* 낮음 → 보통 경계 혼합 */}
          <linearGradient
            id="lowMediumBlend"
            x1="39.34"
            y1="58.85"
            x2="43.77"
            y2="52.75"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#63D3B1" />
            <stop offset="50%" stopColor="#AEDB82" />
            <stop offset="100%" stopColor="#F6C95C" />
          </linearGradient>

          {/* 보통 → 높음 경계 혼합 */}
          <linearGradient
            id="mediumHighBlend"
            x1="67.91"
            y1="35.21"
            x2="75.08"
            y2="32.89"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#F6C95C" />
            <stop offset="50%" stopColor="#F4A76A" />
            <stop offset="100%" stopColor="#F07778" />
          </linearGradient>

          <filter
            id="needleShadow"
            x="-40%"
            y="-40%"
            width="180%"
            height="180%"
          >
            <feDropShadow
              dx="0"
              dy="1"
              stdDeviation="1"
              floodColor="#4338CA"
              floodOpacity="0.16"
            />
          </filter>
        </defs>

        {/* 계기판 뒤쪽 트랙 */}
        <path
          d="M 30 91 A 60 60 0 0 1 150 91"
          fill="none"
          stroke="#F1F3F6"
          strokeWidth="30"
          strokeLinecap="round"
        />

        {/* 낮음: 0~19점, 약 20% */}
        <path
          d="M 30 91 A 60 60 0 0 1 41.46 55.73"
          fill="none"
          stroke="#63D3B1"
          strokeWidth="28"
          strokeLinecap="butt"
        />

        {/* 보통: 20~39점, 약 20% */}
        <path
          d="M 41.46 55.73 A 60 60 0 0 1 71.46 33.94"
          fill="none"
          stroke="#F6C95C"
          strokeWidth="28"
          strokeLinecap="butt"
        />

        {/* 높음: 40~100점, 약 60% */}
        <path
          d="M 71.46 33.94 A 60 60 0 0 1 150 91"
          fill="none"
          stroke="#F07778"
          strokeWidth="28"
          strokeLinecap="butt"
        />

        {/* 낮음과 보통 사이를 짧고 부드럽게 연결 */}
        <path
          d="M 39.34 58.85 A 60 60 0 0 1 43.77 52.75"
          fill="none"
          stroke="url(#lowMediumBlend)"
          strokeWidth="28"
          strokeLinecap="butt"
        />

        {/* 보통과 높음 사이를 짧고 부드럽게 연결 */}
        <path
          d="M 67.91 35.21 A 60 60 0 0 1 75.08 32.89"
          fill="none"
          stroke="url(#mediumHighBlend)"
          strokeWidth="28"
          strokeLinecap="butt"
        />

        {/* 양 끝 둥근 마감 */}
        <circle cx="30" cy="91" r="14" fill="#63D3B1" />
        <circle cx="150" cy="91" r="14" fill="#F07778" />

        {/* 바늘 */}
        <g
          transform={`rotate(${needleAngle} 90 91)`}
          filter="url(#needleShadow)"
        >
          <line
            x1="90"
            y1="91"
            x2="90"
            y2="47"
            stroke="#554BE7"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx="90" cy="47" r="2.5" fill="#554BE7" />
        </g>

        {/* 바늘 중심 */}
        <circle cx="90" cy="91" r="7" fill="#FFFFFF" />
        <circle cx="90" cy="91" r="4" fill="#554BE7" />
      </svg>
    </div>
  );
}

type ShortcutItem = {
  id: string;
  label: string;
  description: string;
  url?: string;
  phone?: string;
};

type ShortcutGroup = {
  id: string;
  label: string;
  description: string;
  links: ShortcutItem[];
};

const shortcutPanelStyle: CSSProperties = {
  marginTop: "14px",
  padding: "4px 18px",
  border: "1px solid #ddd6fe",
  borderRadius: "14px",
  background: "linear-gradient(135deg, #EEF2FF 0%, #EDE9FE 100%)",
};

const shortcutRowTextStyle: CSSProperties = {
  display: "block",
  fontSize: "13px",
  lineHeight: 1.55,
  color: "#626977",
};

const shortcutActionStyle: CSSProperties = {
  flexShrink: 0,
  color: "inherit",
  fontSize: "13px",
  fontWeight: 700,
  textDecoration: "underline",
  textUnderlineOffset: "3px",
};

const accountShortcutStyles = `
.shortcut-action-link:hover,
.shortcut-action-link:focus-visible {
  color: #4f46e5;
  outline: 2px solid #4f46e5;
  outline-offset: 3px;
}

.account-shortcut-group {
  display: flex;
  overflow: hidden;
  border: 1px solid #ddd6fe;
  border-radius: 12px;
  background: linear-gradient(135deg, #EEF2FF 0%, #EDE9FE 100%);
  margin: 12px 0;
}

.account-shortcut-link {
  flex: 1 1 0;
  min-width: 0;
  padding: 14px 16px;
  color: #4338ca;
  text-decoration: none;
}

.account-shortcut-link + .account-shortcut-link {
  border-left: 1px solid #ddd6fe;
}

.account-shortcut-link:hover,
.account-shortcut-link:focus-visible {
  background: #EDE9FE;
  color: #4f46e5;
  outline: none;
}

.account-shortcut-link strong,
.account-shortcut-link span {
  display: block;
}

.account-shortcut-link strong {
  margin-bottom: 5px;
  font-size: 14px;
}

.account-shortcut-link span {
  font-size: 12px;
  line-height: 1.55;
}

@media (max-width: 520px) {
  .account-shortcut-group {
    flex-direction: column;
  }

  .account-shortcut-link + .account-shortcut-link {
    border-left: 0;
    border-top: 1px solid #ddd6fe;
  }
}
`;

function renderShortcutRows(shortcuts: ShortcutItem[]) {
  return shortcuts.map((shortcut, index) => (
    <div
      key={shortcut.id}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "18px",
        padding: "15px 0",
        borderBottom:
          index === shortcuts.length - 1 ? "none" : "1px solid #dde1e7",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <strong
          style={{
            display: "block",
            marginBottom: "4px",
            fontSize: "14px",
          }}
        >
          {shortcut.label}
        </strong>
        <span style={shortcutRowTextStyle}>{shortcut.description}</span>
        {shortcut.phone && (
          <span
            style={{
              display: "block",
              marginTop: "4px",
              fontSize: "12px",
              fontWeight: 800,
              color: "#475569",
            }}
          >
            {shortcut.phone}
          </span>
        )}
      </div>

      {shortcut.url && (
        <a
          href={shortcut.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shortcut-action-link"
          style={shortcutActionStyle}
        >
          바로가기
        </a>
      )}
    </div>
  ));
}

function isValidShortcutUrl(url: string | undefined): url is string {
  if (!url?.trim()) {
    return false;
  }

  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === "https:" || parsedUrl.protocol === "http:";
  } catch {
    return false;
  }
}

const accountSecurityChecklistIds = new Set([
  "email-password-change",
  "email-two-factor",
  "account-login-check-google",
  "account-login-check-naver",
  "account-login-check-kakao",
  "password-change-all",
]);

const accountSecurityLinkUrls = new Set(
  [
    providerLinks.googleSecurity.url,
    providerLinks.naverLoginHistory.url,
  ].map((url) => url.trim().toLowerCase())
);

const supportAgencyLinkUrls = new Set(
  supportAgencyLinks
    .map((link) => link.url?.trim().toLowerCase())
    .filter((url): url is string => Boolean(url))
);

function toShortcutItem(
  id: string,
  link: ActionLink,
  fallbackDescription: string
): ShortcutItem | null {
  if (!isValidShortcutUrl(link.url)) {
    return null;
  }

  return {
    id,
    label: link.label,
    description: link.description ?? fallbackDescription,
    url: link.url,
  };
}

function hasAccountSecurityChecklist(checklist: ChecklistItem[]): boolean {
  return checklist.some((item) => {
    if (accountSecurityChecklistIds.has(item.id)) {
      return true;
    }

    const linkUrl = item.link?.url.trim().toLowerCase();

    return Boolean(linkUrl && accountSecurityLinkUrls.has(linkUrl));
  });
}

function buildShortcutLinks(checklist: ChecklistItem[]): {
  accountSecurityGroup?: ShortcutGroup;
  shortcuts: ShortcutItem[];
} {
  const shortcuts: ShortcutItem[] = [];
  const seenUrls = new Set<string>();
  const shouldShowAccountSecurityGroup =
    hasAccountSecurityChecklist(checklist);

  if (shouldShowAccountSecurityGroup) {
    accountSecurityLinkUrls.forEach((url) => seenUrls.add(url));
  }

  supportAgencyLinkUrls.forEach((url) => seenUrls.add(url));

  const addShortcut = (shortcut: ShortcutItem) => {
    if (shortcut.url) {
      const normalizedUrl = shortcut.url.trim().toLowerCase();

      if (seenUrls.has(normalizedUrl)) {
        return;
      }

      seenUrls.add(normalizedUrl);
    }

    shortcuts.push(shortcut);
  };

  checklist.forEach((item, index) => {
    if (!item.link) {
      return;
    }

    const shortcut = toShortcutItem(
      `checklist-${item.id}-${index}`,
      item.link,
      item.title
    );

    if (shortcut) {
      addShortcut(shortcut);
    }
  });

  const accountSecurityGroup = shouldShowAccountSecurityGroup
    ? {
        id: "account-security-shortcuts",
        label: "주요 계정 보안 확인",
        description:
          "사용 중인 이메일·계정 서비스를 직접 골라 보안 상태와 로그인 기록을 확인하세요.",
        links: [
          {
            id: "account-security-google",
            label: providerLinks.googleSecurity.label,
            description: providerLinks.googleSecurity.description ?? "",
            url: providerLinks.googleSecurity.url,
          },
          {
            id: "account-security-naver",
            label: providerLinks.naverLoginHistory.label,
            description: providerLinks.naverLoginHistory.description ?? "",
            url: providerLinks.naverLoginHistory.url,
          },
        ].filter((link) => isValidShortcutUrl(link.url)),
      }
    : undefined;

  return {
    accountSecurityGroup,
    shortcuts,
  };
}

export default function LeakPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<LeakAnalysisResult | null>(null);
  const {
    accountSecurityGroup,
    shortcuts: shortcutLinks,
  } = result ? buildShortcutLinks(result.checklist) : { shortcuts: [] };
  const supportShortcutLinks = supportAgencyLinks
    .filter((link) => isValidShortcutUrl(link.url))
    .map((link, index) => ({
      id: `support-${index}`,
      label: link.label,
      description: link.description,
      url: link.url,
      phone: link.phone,
    }));

  const analyze = async () => {
    if (!text.trim()) {
      setErrorMessage("유출 안내문을 입력해주세요.");
      return;
    }

    setShowResult(false);
    setResult(null);
    setErrorMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputText: text,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "유출 안내문 분석에 실패했습니다.");
      }

      console.log("유출 안내문 분석 결과:", data);
      setResult(data);
      setShowResult(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "분석 중 알 수 없는 오류가 발생했습니다.";

      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setText("");
    setShowResult(false);
    setLoading(false);
    setResult(null);
    setErrorMessage("");
  };

  const loadSampleText = () => {
    setText(sampleText);
    setErrorMessage("");
    setShowResult(false);
    setResult(null);
  };

  const copyFamilyMessage = async () => {
    if (!result?.familyMessage) {
      alert("복사할 안내문이 없습니다.");
      return;
    }

    try {
      await navigator.clipboard.writeText(result.familyMessage);
      alert("안내문이 클립보드에 복사되었습니다.");
    } catch (error) {
      console.error("클립보드 복사 실패:", error);
      alert("안내문을 복사하지 못했습니다.");
    }
  };

  const saveAsPdf = async () => {
    if (!result) {
      alert("저장할 분석 결과가 없습니다.");
      return;
    }

    try {
      const pdfDocument = await PDFDocument.create();
      pdfDocument.registerFontkit(fontkit);

      const fontResponse = await fetch("/fonts/NanumGothic-Regular.ttf");

      if (!fontResponse.ok) {
        throw new Error("한글 폰트 파일을 불러오지 못했습니다.");
      }

      const fontBytes = await fontResponse.arrayBuffer();
      const koreanFont = await pdfDocument.embedFont(fontBytes, {
        subset: true,
      });

      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const margin = 50;
      const contentWidth = pageWidth - margin * 2;

      let page = pdfDocument.addPage([pageWidth, pageHeight]);
      let y = pageHeight - margin;

      const wrapText = (
        value: string,
        fontSize: number,
        maxWidth: number
      ) => {
        const lines: string[] = [];

        for (const paragraph of value.split("\n")) {
          if (!paragraph) {
            lines.push("");
            continue;
          }

          let currentLine = "";

          for (const character of paragraph) {
            const testLine = currentLine + character;
            const testWidth = koreanFont.widthOfTextAtSize(
              testLine,
              fontSize
            );

            if (testWidth > maxWidth && currentLine) {
              lines.push(currentLine);
              currentLine = character;
            } else {
              currentLine = testLine;
            }
          }

          if (currentLine) {
            lines.push(currentLine);
          }
        }

        return lines;
      };

      const addText = (
        value: string,
        fontSize = 11,
        gapAfter = 10,
        color = rgb(0.12, 0.12, 0.12)
      ) => {
        const lineHeight = fontSize + 6;
        const lines = wrapText(value, fontSize, contentWidth);

        for (const line of lines) {
          if (y < margin + lineHeight) {
            page = pdfDocument.addPage([pageWidth, pageHeight]);
            y = pageHeight - margin;
          }

          if (line) {
            page.drawText(line, {
              x: margin,
              y,
              size: fontSize,
              font: koreanFont,
              color,
            });
          }

          y -= lineHeight;
        }

        y -= gapAfter;
      };

      const company = result.company?.trim() || "확인되지 않음";
      const leakedItems =
        result.leakedItems.length > 0
          ? result.leakedItems.join(", ")
          : "확인되지 않음";
      const riskTypes =
        result.riskTypes.length > 0
          ? result.riskTypes.join(", ")
          : "구체적인 위험 유형이 확인되지 않았습니다.";
      const situationSummary =
        result.reason?.trim() ||
        "입력된 안내문을 바탕으로 개인정보 유출 가능성과 후속 위험을 분석했습니다.";

      addText(
        "LeakCare 개인정보 유출 분석 보고서",
        19,
        24,
        rgb(0.2, 0.12, 0.35)
      );

      addText(
        "1. 유출 기업 또는 주체",
        14,
        6,
        rgb(0.25, 0.16, 0.4)
      );
      addText(company, 11, 18);

      addText(
        "2. 유출 정보 및 위험도",
        14,
        6,
        rgb(0.25, 0.16, 0.4)
      );
      addText(`유출 정보: ${leakedItems}`, 11, 4);
      addText(`위험도: ${result.riskLevel}`, 11, 4);

      if (result.riskScore !== undefined) {
        addText(
          `LeakCare 상대적 위험지수: ${result.riskScore} / 100`,
          11,
          4
        );
        addText(
          `기본점수 ${result.baseScore ?? 0}점 · 조합점수 ${
            result.combinationScore ?? 0
          }점 · 보정점수 ${result.adjustmentScore ?? 0}점`,
          11,
          18
        );
      }

      addText(
        "3. 위험도 판단 근거",
        14,
        6,
        rgb(0.25, 0.16, 0.4)
      );

      if (result.riskReasons?.length) {
        result.riskReasons.forEach((reason, index) => {
          addText(`${index + 1}. ${reason}`, 11, 4);
        });
        y -= 10;
      } else {
        addText(situationSummary, 11, 18);
      }

      addText(
        "4. 예상되는 위험",
        14,
        6,
        rgb(0.25, 0.16, 0.4)
      );
      addText(
        `${riskTypes} 등의 2차 피해가 발생할 수 있습니다.`,
        11,
        18
      );

      addText(
        "5. 우선 대응 방법",
        14,
        6,
        rgb(0.25, 0.16, 0.4)
      );

      const priorityChecklist = result.checklist.slice(0, 5);

      if (priorityChecklist.length > 0) {
        priorityChecklist.forEach((item, index) => {
          addText(`${index + 1}. ${item.title}`, 11, 4);
        });
      } else {
        addText("제공된 대응 방법이 없습니다.", 11, 4);
      }

      y -= 14;

      addText(
        "6. 공식 참고 자료",
        14,
        6,
        rgb(0.25, 0.16, 0.4)
      );

      if (result.sources?.length) {
        result.sources.forEach((source, index) => {
          addText(
            `${index + 1}. [${source.organization}] ${source.title}${
              source.url ? `\n${source.url}` : ""
            }`,
            10,
            6
          );
        });
      } else {
        addText("연결된 공식 참고 자료가 없습니다.", 11, 10);
      }

      addText(
        "7. 현재 상황 요약",
        14,
        6,
        rgb(0.25, 0.16, 0.4)
      );
      addText(situationSummary, 11, 18);

      addText(
        "※ 본 점수는 개인정보보호위원회와 KISA 등의 공식 자료를 참고해 LeakCare가 자체 설계한 상대적 위험지수이며, 피해 발생 확률이나 공식기관의 위험등급이 아닙니다.",
        9,
        12,
        rgb(0.35, 0.35, 0.35)
      );

      const pdfBytes = await pdfDocument.save();
      const pdfBlob = new Blob([new Uint8Array(pdfBytes)], {
        type: "application/pdf",
      });
      const downloadUrl = URL.createObjectURL(pdfBlob);
      const downloadLink = document.createElement("a");

      downloadLink.href = downloadUrl;
      downloadLink.download = "LeakCare_개인정보_유출_분석_보고서.pdf";

      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("PDF 저장 실패:", error);
      alert("PDF를 저장하지 못했습니다.");
    }
  };

  const shareLeakCare = async () => {
    const familyGuideText = result?.familyMessage;

    if (!familyGuideText) {
      alert("공유할 안내문이 없습니다.");
      return;
    }

    const shareData = {
      title: "LeakCare",
      text: familyGuideText,
      url: leakCareShareUrl,
    };

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("공유 실패:", error);
        alert("공유하지 못했습니다.");
      }

      return;
    }

    try {
      await navigator.clipboard.writeText(
        `${familyGuideText}\n\n${leakCareShareUrl}`
      );
      alert("공유할 내용이 복사되었습니다.");
    } catch (error) {
      console.error("링크 복사 실패:", error);
      alert("링크를 복사하지 못했습니다.");
    }
  };

  const handleImageUpload = async (file: File | undefined) => {
    if (!file) return;

    setOcrLoading(true);

    try {
      const extractedText = await extractTextFromImage(file);
      setText(extractedText);
    } catch (error) {
      console.error("OCR 처리 실패:", error);
      alert("이미지에서 텍스트를 추출하지 못했습니다.");
    } finally {
      setOcrLoading(false);
    }
  };

  return (
    <main className="analysis-page">
      <Navigation activePage="leak" />

      <section className="workspace single-workspace">
        <div className="section-heading">
          <div>
            <h2>유출 안내문 분석</h2>
            <p>
              개인정보 유출 문자, 이메일, 공지문을 입력하면 유출 항목과 후속
              위험을 분석합니다.
            </p>
          </div>
        </div>

        <div className="app-shell">
          <section className="panel">
            <div className="input-area">
              <label className="field-label">
                <span>개인정보 유출 안내문 입력</span>
                <span>문자·이메일·공지문</span>
              </label>

              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="개인정보 유출 안내 문자, 이메일, 공지문 내용을 입력해주세요."
              />

              <label className="upload-box">
                <span>
                  {ocrLoading
                    ? "이미지에서 텍스트를 추출하는 중입니다."
                    : "이미지 업로드 시 ocr 기능을 통해 텍스트를 추출합니다."}
                </span>

                <span className="upload-pill">
                  {ocrLoading ? (
                    <span
                      className="loading-dots"
                      role="status"
                      aria-label="이미지 텍스트 추출 중"
                    >
                      <span></span>
                      <span></span>
                      <span></span>
                    </span>
                  ) : (
                    "이미지 업로드"
                  )}
                </span>

                <input
                  type="file"
                  accept="image/*"
                  hidden
                  disabled={ocrLoading}
                  onChange={(event) =>
                    handleImageUpload(event.target.files?.[0])
                  }
                />
              </label>

              <div className="sample-row">
                <button
                  type="button"
                  className="sample-btn"
                  onClick={loadSampleText}
                >
                  유출 안내문 예시 불러오기
                </button>
              </div>

              <div className="analyze-row">
                <p className="notice">
                  입력 내용은 분석 전 개인정보 마스킹 처리를 통해 민감정보를
                  보호합니다.
                </p>

                <div className="analyze-buttons">
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={reset}
                    disabled={loading}
                  >
                    초기화
                  </button>

                  <button
                    type="button"
                    className="primary-btn"
                    onClick={analyze}
                    disabled={loading}
                  >
                    {loading ? "분석 중..." : "AI 분석하기"}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="results">
              {errorMessage && (
                <div className="info-card full">
                  <h4>
                    <span className="icon-dot"></span>
                    입력 오류
                  </h4>
                  <p>{errorMessage}</p>
                </div>
              )}

              {loading && (
                <div className="result-top">
                  <div>
                    <h3>AI 분석 중입니다</h3>
                    <p>
                      기업명, 유출 항목, 사고 키워드, 위험 유형을 분석합니다.
                    </p>
                  </div>

                  <div className="score-badge">
                    <div
                      className="loading-dots"
                      role="status"
                      aria-label="AI 분석 중"
                    >
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <span>분석 중</span>
                  </div>
                </div>
              )}

              {!loading && !showResult && (
                <div className="result-top">
                  <div>
                    <h3>분석 결과 대기 중</h3>
                    <p>
                      유출 안내문을 입력하고 AI 분석하기 버튼을 눌러주세요.
                    </p>
                  </div>

                  <div className="score-badge">
                    <strong>--</strong>
                    <span>위험도</span>
                  </div>
                </div>
              )}

              {showResult && result && (
                <>
                  <style>{accountShortcutStyles}</style>
                  <div className="result-top result-top-complete">
                    <div>
                      <h3>유출 안내문 분석 결과</h3>
                      <p>
                        입력문과 관련 자료를 기반으로 유출 항목, 위험 유형,
                        대응 우선순위를 분석했습니다.
                      </p>
                    </div>

                    <div className="score-badge result-score-badge">
                      <RiskGauge
                        riskLevel={result.riskLevel}
                        riskScore={result.riskScore}
                      />
                    </div>
                  </div>

                  <div className="card-grid">
                    {result.riskScore !== undefined && (
                      <article className="info-card full">
                        <h4>
                          <span className="icon-dot"></span> LeakCare 상대적
                          위험지수
                        </h4>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-end",
                            flexWrap: "wrap",
                            gap: "12px",
                            marginTop: "14px",
                          }}
                        >
                          <strong
                            style={{
                              fontSize: "38px",
                              lineHeight: 1,
                              letterSpacing: "-1px",
                            }}
                          >
                            {result.riskScore}
                          </strong>
                          <span style={{ fontSize: "15px", opacity: 0.68 }}>
                            / 100
                          </span>
                          <strong
                            className="result-risk-level"
                            data-risk-level={result.riskLevel}
                            style={{
                              marginLeft: "4px",
                              fontSize: "15px",
                            }}
                          >
                            {result.riskLevel}
                          </strong>
                        </div>

                        <p
                          style={{
                            marginTop: "12px",
                            fontSize: "13px",
                            lineHeight: 1.65,
                            color: "#5f6673",
                          }}
                        >
                          산정 내역: 항목 {result.baseScore ?? 0}점 + 조합 {
                            result.combinationScore ?? 0
                          }점 + 중요정보 보정 {result.adjustmentScore ?? 0}점
                          {result.matchedCombinationRules?.length
                            ? ` · 적용 조합: ${result.matchedCombinationRules.join(
                                ", "
                              )}`
                            : ""}
                        </p>

                        <p
                          style={{
                            marginTop: "6px",
                            fontSize: "12px",
                            lineHeight: 1.6,
                            color: "#7a808c",
                          }}
                        >
                          공식기관 자료를 참고해 LeakCare가 자체 설계한 상대적
                          위험지수이며, 피해 발생 확률이나 공식기관의 위험등급은
                          아닙니다.
                        </p>
                      </article>
                    )}

                    <article className="info-card">
                      <h4>
                        <span className="icon-dot"></span> 유출 항목
                      </h4>
                      <div className="chips">
                        {result.leakedItems.map((item) => (
                          <span className="chip warning" key={item}>
                            {item}
                          </span>
                        ))}
                      </div>
                    </article>

                    <article className="info-card">
                      <h4>
                        <span className="icon-dot"></span> 위험 유형
                      </h4>
                      <div className="chips">
                        {result.riskTypes.map((item) => (
                          <span className="chip warning" key={item}>
                            {item}
                          </span>
                        ))}
                      </div>
                    </article>

                    <article className="info-card full">
                      <h4>
                        <span className="icon-dot"></span> 우선 대응 체크리스트
                      </h4>

                      <ul className="check-list">
                        {result.checklist.map((item, index) => (
                          <li key={`${item.id}-${index}`}>
                            <span className="num">{index + 1}</span>
                            <span>
                              <strong>{item.title}</strong>
                              <br />
                              {item.description}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </article>

                    {(accountSecurityGroup || shortcutLinks.length > 0) && (
                      <article className="info-card full">
                        <h4>
                          <span className="icon-dot"></span> 맞춤 바로가기
                        </h4>

                        <div style={shortcutPanelStyle}>
                          {accountSecurityGroup && (
                            <div className="account-shortcut-group">
                              {accountSecurityGroup.links.map((link) => (
                                <a
                                  key={link.id}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="account-shortcut-link"
                                >
                                  <strong>{link.label}</strong>
                                  <span>{link.description}</span>
                                </a>
                              ))}
                            </div>
                          )}

                          {renderShortcutRows(shortcutLinks)}
                        </div>
                      </article>
                    )}

                    <article className="info-card full">
                      <h4>
                        <span className="icon-dot"></span> 신고·상담 기관
                      </h4>

                      <div style={shortcutPanelStyle}>
                        {renderShortcutRows(supportShortcutLinks)}
                      </div>
                    </article>

                    <article className="info-card full">
                      <h4>
                        <span className="icon-dot"></span> 공식 참고 자료
                      </h4>

                      {result.sources?.length ? (
                        <div
                          style={{
                            marginTop: "14px",
                            padding: "4px 18px",
                            border: "1px solid #e3e6eb",
                            borderRadius: "14px",
                            background: "#f5f6f8",
                          }}
                        >
                          {result.sources.map((source, index) => (
                            <div
                              key={source.sourceId}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "18px",
                                padding: "15px 0",
                                borderBottom:
                                  index === result.sources!.length - 1
                                    ? "none"
                                    : "1px solid #dde1e7",
                              }}
                            >
                              <div style={{ minWidth: 0 }}>
                                <strong
                                  style={{
                                    display: "block",
                                    marginBottom: "4px",
                                    fontSize: "14px",
                                  }}
                                >
                                  {source.organization}
                                </strong>
                                <span
                                  style={{
                                    fontSize: "13px",
                                    lineHeight: 1.55,
                                    color: "#626977",
                                  }}
                                >
                                  {source.title}
                                </span>
                              </div>

                              {source.url && (
                                <a
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    flexShrink: 0,
                                    color: "inherit",
                                    fontSize: "13px",
                                    fontWeight: 700,
                                    textDecoration: "underline",
                                    textUnderlineOffset: "3px",
                                  }}
                                >
                                  원문 보기
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>연결된 공식 참고 자료가 없습니다.</p>
                      )}
                    </article>

                    <article className="info-card full">
                      <h4>
                        <span className="icon-dot"></span> 가족 공유용 안내문
                      </h4>

                      <div className="message-card">{result.familyMessage}</div>

                      <div
                      className="action-buttons"
                      style={{
                        marginTop: "14px",
                      }}
                      >
                        <button
                        type="button"
                        className="small-btn"
                        onClick={copyFamilyMessage}
                        >
                          안내문 복사
                        </button>

                        <button
                        type="button"
                        className="small-btn"
                        onClick={shareLeakCare}
                        >
                          공유하기
                        </button>
                        <button
                          type="button"
                          className="small-btn"
                          onClick={saveAsPdf}
                        >
                          PDF 저장
                        </button>
                      </div>
                    </article>
                    <ReportSummaryPanel analysisResult={result} />
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
