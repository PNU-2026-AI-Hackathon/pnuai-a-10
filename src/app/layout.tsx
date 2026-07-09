import "./globals.css";
import ReminderBanner from "../components/ReminderBanner";

export const metadata = {
  title: "LeakCare",
  description: "개인정보 유출 2차 피해 대응 AI 웹서비스",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <ReminderBanner />
        {children}</body>
    </html>
  );
}