"use client";

import { useEffect, useRef, useState } from "react";
import Navigation from "../../components/Navigation";

const featureSlides = [
  {
    id: "process",
    title: "유출 분석 프로세스",
    description: "통지문 입력부터 맞춤형 대응 체크리스트 생성까지",
  },
  {
    id: "damage",
    title: "2차 피해 위험 유형",
    description: "스미싱·피싱·택배 사칭·계정 탈취 위험을 한눈에 확인",
  },
  {
    id: "family",
    title: "가족 공유용 안내문",
    description: "어려운 유출 내용을 쉬운 말로 요약해 바로 공유",
  },
] as const;

const guideSteps = [
  {
    step: "STEP 1",
    title: "통지문 입력",
    description:
      "사용자가 통지받은 개인정보 유출 안내 문자 및 이메일 자료를 입력합니다.",
  },
  {
    step: "STEP 2",
    title: "유출 항목 추출",
    description:
      "유출 항목을 분석하고 기준에 따라 점수를 부과하고 추출합니다.",
  },
  {
    step: "STEP 3",
    title: "2차 피해 분석",
    description:
      "유출된 항목의 조합을 바탕으로 스미싱, 피싱 등 실제로 주의해야 할 2차 피해 위험 유형을 분석하고 전체적인 위험도를 제공합니다.",
  },
  {
    step: "STEP 4",
    title: "대응 체크리스트 생성",
    description:
      "위험도를 모두 분석해 사용자가 취해야 할 조치를 우선순위에 따라 대응 체크리스트로 제공합니다.",
  },
] as const;

export default function BannerPage() {
  const [isFeatureVisible, setIsFeatureVisible] = useState(false);
  const featureSectionRef = useRef<HTMLElement | null>(null);
  const guideSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const section = featureSectionRef.current;

    if (!section) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsFeatureVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18 }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const section = guideSectionRef.current;

    if (!section) {
      return;
    }

    const revealItems = section.querySelectorAll<HTMLElement>(".guide-reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 }
    );

    revealItems.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="page">
      <Navigation guideButton />

      <main>
        <section className="hero">
          <div>
            <span className="eyebrow">
              개인정보 유출 후, 무엇부터 해야 할지 알려주는 AI 가이드
            </span>

            <h1>
              유출 통지문을
              <br />
              대응 체크리스트로.
            </h1>

            <p>
              LeakCare는 사용자가 받은 개인정보 유출 안내문과 의심 문자를
              분석하여 유출 항목, 2차 피해 가능성, 우선순위별 대응 방법을 한
              화면에 정리해주는 웹서비스입니다.
            </p>

            <div className="hero-actions">
              <a
                className="primary-btn"
                href="/leak"
                target="_blank"
                rel="noopener noreferrer"
              >
                유출 안내문 분석하기
              </a>

              <a
                className="secondary-btn"
                href="/sms"
                target="_blank"
                rel="noopener noreferrer"
              >
                의심 문자 분석하기
              </a>
            </div>
          </div>

          <div className="hero-card" aria-label="서비스 미리보기">
            <div className="phone-preview">
              <div className="phone-top">
                <span>LeakCare AI</span>
                <span>위험도 분석 중</span>
              </div>

              <div className="mini-input">
                [안내] 고객님의 이름, 휴대전화번호, 주소, 주문내역 일부가
                외부로 유출된 사실을 확인했습니다. 추가 피해 예방을 위해 주의
                바랍니다.
              </div>

              <div className="mini-result">
                <div className="mini-risk">
                  <strong>2차 피해 위험 높음</strong>
                  <div className="risk-meter">
                    <span className="risk-pin"></span>
                  </div>
                </div>

                <div className="mini-list">
                  <span>주소 + 주문내역 → 택배 사칭 주의</span>
                  <span>전화번호 → 스미싱·보이스피싱 주의</span>
                  <span>우선 조치: 비밀번호 변경, 링크 클릭 금지</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          ref={featureSectionRef}
          className={`feature-showcase${isFeatureVisible ? " is-visible" : ""}`}
          aria-labelledby="feature-showcase-title"
        >
          <div className="feature-showcase-heading">
            <h2 id="feature-showcase-title">유출 이후의 대응을 한 눈에</h2>
            <p>분석부터 2차 피해 예방, 가족 공유까지 LeakCare가 함께 정리합니다.</p>
          </div>

          <div className="feature-tabs" aria-label="LeakCare 주요 기능">
            {featureSlides.map((feature) => (
              <div
                key={feature.id}
                className="feature-tab"
              >
                <strong>{feature.title}</strong>
                <span>{feature.description}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="flow" id="guide" ref={guideSectionRef}>
          <div className="section-heading guide-reveal">
            <div>
              <h2>이용 안내</h2>
              <p>
                단순 보안 수칙 안내가 아니라, 사용자가 받은 실제 문서를 행동
                가능한 결과로 바꿉니다.
              </p>
            </div>
          </div>

          <div className="guide-steps">
            {guideSteps.map((guide, index) => (
              <article
                className={`guide-step guide-reveal${index % 2 === 1 ? " is-reversed" : ""}`}
                key={guide.step}
              >
                <div className="guide-step-copy">
                  <span className="guide-step-label">{guide.step}</span>
                  <h3>{guide.title}</h3>
                  <p>{guide.description}</p>
                </div>
                <div
                  className="guide-image-placeholder"
                  role="img"
                  aria-label={`${guide.title} 이미지가 들어갈 자리`}
                />
              </article>
            ))}
          </div>

        </section>
      </main>
    </div>
  );
}
