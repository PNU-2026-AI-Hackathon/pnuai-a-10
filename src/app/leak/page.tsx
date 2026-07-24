"use client";

import { useState } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { extractTextFromImage } from "../../lib/ocr";
import type { LeakAnalysisResult } from "../../types/analysis";

const sampleText = `개인정보 유출 안내

고객님의 이름, 휴대전화번호, 이메일, 주소, 주문내역 일부가 외부로 유출된 사실을 확인했습니다.
결제 비밀번호 및 카드번호는 유출 대상에 포함되지 않았습니다.
유출 사실을 악용한 택배 사칭 문자, 환불 안내 문자, 본인인증 요구에 주의해주시기 바랍니다.`;

export default function LeakPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<LeakAnalysisResult | null>(null);

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

      const fontResponse = await fetch(
        "/fonts/NanumGothic-Regular.ttf"
      );

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

      const company =
        result.company?.trim() || "확인되지 않음";

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
      addText(`위험도: ${result.riskLevel}`, 11, 18);

      addText(
        "3. 예상되는 위험",
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
        "4. 우선 대응 방법",
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
        "5. 현재 상황 요약",
        14,
        6,
        rgb(0.25, 0.16, 0.4)
      );

      addText(situationSummary, 11, 18);

      const pdfBytes = await pdfDocument.save();

      const pdfBlob = new Blob(
        [new Uint8Array(pdfBytes)],
        {
          type: "application/pdf",
        }
      );

      const downloadUrl = URL.createObjectURL(pdfBlob);
      const downloadLink = document.createElement("a");

      downloadLink.href = downloadUrl;
      downloadLink.download =
        "LeakCare_개인정보_유출_분석_보고서.pdf";

      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();

      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("PDF 저장 실패:", error);
      alert("PDF를 저장하지 못했습니다.");
    }
  };

  const showComingSoon = () => {
    alert("추후 추가할 예정입니다.");
  };

  const handleImageUpload = async (file: File | undefined) => {
    if (!file) return;

    setOcrLoading(true);

    try {
      const extractedText = await extractTextFromImage(file);
      console.log("이미지에서 추출된 텍스트:", extractedText);
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
      <header className="analysis-header">
        <a href="/" className="brand">
          <span className="brand-badge">L</span>
          <span>LeakCare</span>
        </a>

        <button className="ghost-btn" onClick={reset}>
          초기화
        </button>
      </header>

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
                onChange={(e) => setText(e.target.value)}
                placeholder="개인정보 유출 안내 문자, 이메일, 공지문 내용을 입력해주세요."
              />

              <label className="upload-box">
                <span>
                  {ocrLoading
                    ? "이미지에서 텍스트를 추출하는 중입니다."
                    : "이미지 업로드 시 ocr 기능을 통해 텍스트를 추출합니다."}
                </span>

                <span className="upload-pill">
                  {ocrLoading ? "처리 중" : "이미지 업로드"}
                </span>

                <input
                  type="file"
                  accept="image/*"
                  hidden
                  disabled={ocrLoading}
                  onChange={(e) =>
                    handleImageUpload(e.target.files?.[0])
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

                <button className="primary-btn" onClick={analyze}>
                  AI 분석하기
                </button>
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
                    <strong>···</strong>
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
                  <div className="result-top">
                    <div>
                      <h3>유출 안내문 분석 결과</h3>
                      <p>
                        입력문과 관련 자료를 기반으로 유출 항목, 위험 유형,
                        대응 우선순위를 분석했습니다.
                      </p>
                    </div>

                    <div className="score-badge">
                      <strong>{result.riskLevel}</strong>
                      <span>위험도</span>
                    </div>
                  </div>

                  <div className="card-grid">
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

                            {item.link && (
                              <a
                                className="small-btn"
                                href={item.link.url}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  whiteSpace: "nowrap",
                                  width: "fit-content",
                                  minWidth: "88px",
                                  textAlign: "center",
                                }}
                              >
                                바로가기
                              </a>
                            )}
                          </li>
                        ))}
                      </ul>
                    </article>

                    <article className="info-card full">
                      <h4>
                        <span className="icon-dot"></span> 가족 공유용 안내문
                      </h4>

                      <div className="message-card">
                        {result.familyMessage}
                      </div>
                    </article>

                    <article className="info-card full">
                      <h4>
                        <span className="icon-dot"></span> 다음 작업
                      </h4>

                      <div className="action-buttons">
                        <button
                          className="small-btn"
                          onClick={copyFamilyMessage}
                        >
                          안내문 복사
                        </button>

                        <button
                          className="small-btn"
                          onClick={saveAsPdf}
                        >
                          PDF 저장
                        </button>

                        <button
                          className="small-btn"
                          onClick={showComingSoon}
                        >
                          신고용 요약문 생성
                        </button>
                      </div>
                    </article>
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