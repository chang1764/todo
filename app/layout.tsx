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
  title: "모바일DX - 실시간 협업 칸반 보드",
  description: "실시간 협업 칸반 보드 - 모바일 최적화",
  openGraph: {
    title: "모바일DX",
    description: "실시간 협업 칸반 보드 - 모바일 최적화",
    type: "website",
    url: "https://todo-eight-smoky-64.vercel.app",
    images: [
      {
        url: "https://todo-eight-smoky-64.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "모바일DX - 실시간 협업 칸반 보드",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "모바일DX",
    description: "실시간 협업 칸반 보드 - 모바일 최적화",
  },
  keywords: ["칸반", "협업", "보드", "실시간", "모바일"],
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
