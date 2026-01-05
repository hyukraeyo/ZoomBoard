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
  title: "ZoomBoard | High Performance Interactive Infinite Canvas",
  description: "Next.js기반의 고성능 인터랙티브 무한 캔버스 보드. 기술적 SEO와 사용자 경험(UX)이 최적화된 협업 도구.",
  keywords: ["Next.js", "React Compiler", "SEO Optimization", "Infinite Canvas", "Collaboration Tool"],
  openGraph: {
    title: "ZoomBoard | Interactive Canvas",
    description: "Experience the next level of performance with our optimized infinite canvas.",
    type: "website",
    locale: "ko_KR",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "ZoomBoard",
  "description": "High performance interactive infinite canvas for developers and creators.",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
