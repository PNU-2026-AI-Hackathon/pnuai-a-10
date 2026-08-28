"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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
    title: "가족 공유용 안내문 & 신고문 생성",
    description: "쉬운 안내문으로 요약해 공유, 유출내용을 기반으로 신고문 PDF 생성 기능 제공",
  },
] as const;

const guideSteps = [
  {
    step: "STEP 1",
    title: "통지문 입력",
    description:
      "사용자가 통지받은 개인정보 유출 안내 문자 및 이메일 자료를 입력합니다.",
    image: "/images/banner/guide-step-1.png",
  },
  {
    step: "STEP 2",
    title: "유출 항목 추출",
    description:
      "유출 항목을 분석하고 기준에 따라 점수를 부과하고 추출합니다.",
    image: "/images/banner/guide-step-2.png",
  },
  {
    step: "STEP 3",
    title: "2차 피해 분석",
    description:
      "유출된 항목의 조합을 바탕으로 스미싱, 피싱 등 실제로 주의해야 할 2차 피해 위험 유형을 분석하고 전체적인 위험도를 제공합니다.",
    image: "/images/banner/guide-step-3.png",
  },
  {
    step: "STEP 4",
    title: "대응 체크리스트 생성",
    description:
      "위험도를 모두 분석해 사용자가 취해야 할 조치를 우선순위에 따라 대응 체크리스트로 제공합니다.",
    image: "/images/banner/guide-step-4.png",
  },
  {
    step: "STEP 5",
    title: "가족 공유용 안내문 & 신고문 생성",
    description:
      "복잡한 유출 내용을 쉬운 안내문으로 요약해 공유하며, 유출내용을 기반으로 신고문 PDF 생성 기능을 제공합니다.",
    image: "/images/banner/family-guide.png",
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
          <div className="hero-copy">
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
              <Link className="primary-btn" href="/leak">
                유출 안내문 분석하기
              </Link>

              <Link className="secondary-btn" href="/sms">
                의심 문자 분석하기
              </Link>
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
            <h2 id="feature-showcase-title">
              유출 이후의 대응을 <span className="mobile-title-break">한 눈에</span>
            </h2>
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
                <div className="guide-image-placeholder">
                  <img src={guide.image} alt={`${guide.title} 화면 예시`} />
                </div>
              </article>
            ))}
          </div>

          <section className="terms-section guide-reveal" aria-labelledby="terms-title">
            <div className="terms-inner">
              <h2 id="terms-title">이용 약관</h2>

              <div className="terms-content">
                <p>
                  <strong>
                    LeakCare 위험지수는 개인정보보호위원회, 개인정보 포털,
                    한국인터넷진흥원 등의 개인정보 분류·보호조치·유출 대응자료를
                    참고하여 LeakCare가 자체 설계한 상대적 위험도 지표입니다.
                  </strong>
                </p>
                <p>
                  최종 점수는 유출 항목별 기본점수, 여러 개인정보가 결합됐을
                  때의 조합 위험, 금융·인증·고유식별정보의 직접 피해 가능성을
                  종합하여 최대 100점으로 계산합니다.
                </p>
                <p>
                  본 점수는 실제 피해 발생 확률이나 공식기관이 부여한 점수를
                  의미하지 않으며, 사용자가 대응의 우선순위를 판단하도록 돕기
                  위한 참고 지표입니다.
                </p>
                <p>
                  개인정보보호위원회의 민감도 기준에 따라 정보는 생체정보와
                  건강정보 등의 민감정보와 주민등록번호, 여권번호 등의
                  고유식별정보로 구분되며, 민감도 악용 가능성, 변경 가능성, 피해
                  규모를 종합적으로 고려한 위험도 평가 요소와 개인정보 유출 등
                  사고 대응 매뉴얼, 개인정보의 안전성 확보조치 기준 등
                  한국인터넷진흥원 공식 자료에 기반하여 상대적 위험도를
                  산정합니다.
                </p>
                <p>
                  개인정보 유출 사고 발생 시에는 스마트폰 내 ‘스팸으로 신고’
                  기능을 활용하거나, 전기통신금융사기 통합신고대응센터의
                  ‘간편제보하기’ 및 보호나라 카카오톡 채널의 ‘스미싱·피싱
                  확인서비스’를 통해 스미싱 문자 신고와 악성 여부 판별을 진행할
                  수 있으며, 관련 상담은 국번 없이 1394(전기통신금융사기
                  통합신고대응센터)나 118(한국인터넷진흥원 인터넷침해대응센터)을
                  통해 문의할 수 있습니다.
                </p>
                <p>
                  본 서비스는 경찰청 사이버수사대 지침에 따라 유출 사실을
                  통지받은 문자·이메일, 회사의 안내문, 유출 항목 및 일시, 회사명,
                  유출 원인, 화면 캡처, 이후의 스미싱 내역, 관련 URL 및 발신번호,
                  금전 피해·계정 탈취 관련 자료 등을 바탕으로 신고문 작성 요령과
                  절차를 안내합니다.
                </p>
              </div>
            </div>

            <div
              className="institution-marquee"
              aria-label="개인정보 유출 관련 기관"
            >
              <div className="institution-marquee-track">
                <div className="institution-logo-set">
                  <div className="institution-logo-row">
                    <img
                      className="institution-marquee-image"
                      src="/images/banner/institution-marquee.png"
                      alt="사이버캅 NETAN, 개인정보보호 포털, 개인정보보호위원회, 한국인터넷진흥원 KISA"
                    />
                  </div>
                </div>
                <div className="institution-logo-set" aria-hidden="true">
                  <div className="institution-logo-row">
                    <img
                      className="institution-marquee-image"
                      src="/images/banner/institution-marquee.png"
                      alt=""
                    />
                  </div>
                </div>
              </div>
            </div>

            <footer className="banner-footer">
              <div className="banner-footer-brand">
                <strong>Leakcare</strong>
                <p>
                  창의융합 AI해커톤&nbsp; | &nbsp;코드타설단&nbsp; | &nbsp;팀장
                  이수빈&nbsp; | &nbsp;Email: subin0515@pusan.ac.kr
                </p>
                <div className="banner-footer-social" aria-label="소셜 미디어">
                  <span aria-label="Instagram">◎</span>
                  <span aria-label="LinkedIn">in</span>
                  <span aria-label="X">𝕏</span>
                </div>
              </div>

              <nav className="banner-footer-links" aria-label="하단 메뉴">
                <div>
                  <strong>분석하기</strong>
                  <a href="/leak">유출문자 분석하기</a>
                  <a href="/sms">의심문자 분석하기</a>
                </div>
                <div>
                  <strong>정책</strong>
                  <a href="#guide">이용안내</a>
                  <a href="#terms-title">이용약관</a>
                </div>
                <div>
                  <strong>로그인</strong>
                  <a href="/mypage">마이페이지</a>
                  <a href="/login">개인정보</a>
                  <a href="/mypage">분석 이력 조회</a>
                </div>
              </nav>
            </footer>
          </section>

        </section>
      </main>
    </div>
  );
}
