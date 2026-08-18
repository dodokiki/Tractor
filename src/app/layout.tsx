import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

const notoThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "TractorHub — ศูนย์กลางบริการซ่อมบำรุงรถแทรกเตอร์ครบวงจร",
  description:
    "มาร์เก็ตเพลสอะไหล่รถแทรกเตอร์ เรียกช่างถึงที่ พร้อมประวัติรถครบในแพลตฟอร์มเดียว",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body className={`${notoThai.className} antialiased`}>{children}</body>
    </html>
  );
}
