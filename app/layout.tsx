import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "슈퍼SOL - 실시간 협업 칸반 보드",
  description: "실시간 협업 칸반 보드 - 모바일 최적화",
  keywords: ["칸반", "협업", "보드", "실시간", "모바일"],
  applicationName: "슈퍼SOL",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "슈퍼SOL",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://todo-eight-smoky-64.vercel.app",
    siteName: "슈퍼SOL",
    title: "슈퍼SOL - 실시간 협업 칸반 보드",
    description: "실시간 협업 칸반 보드 - 모바일 최적화",
    images: [
      {
        url: "https://todo-eight-smoky-64.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "슈퍼SOL",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "슈퍼SOL",
    description: "실시간 협업 칸반 보드 - 모바일 최적화",
  },
  other: {
    "og:type": "website",
    "og:site_name": "슈퍼SOL",
    "og:locale": "ko_KR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
