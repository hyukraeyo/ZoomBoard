import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { createClient } from "@supabase/supabase-js";
import NoteInitializer from "@/components/providers/NoteInitializer";
import AuthInitializer from "@/components/providers/AuthInitializer";
import { Note } from "@/store/useNoteStore";

interface DBNote {
  id: string;
  x: number;
  y: number;
  title: string;
  content: string;
  created_at: number;
  z_index: number;
  deleted_at: number | null;
  is_published?: boolean;
  user_id?: string | null;
}
import { cookies } from "next/headers";
import Sidebar from "@/components/layout/Sidebar";
import ThemeToggle from "@/components/common/ThemeToggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  fallback: ['monospace'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.com'),
  title: {
    default: "ZoomBoard | High Performance Interactive Infinite Canvas",
    template: "%s | ZoomBoard"
  },
  description: "Next.js 15 기반 고성능 인터랙티브 무한 캔버스. React 19 Compiler로 최적화된 협업 도구. Core Web Vitals 100점, SEO 완벽 최적화.",
  keywords: ["Next.js", "React 19", "React Compiler", "SEO 최적화", "무한 캔버스", "협업 도구", "노트 앱", "개발자 도구", "Web Vitals"],
  authors: [{ name: "ZoomBoard Team", url: "https://your-domain.com" }],
  creator: "ZoomBoard Team",
  publisher: "ZoomBoard",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "ZoomBoard | 고성능 인터랙티브 무한 캔버스",
    description: "Next.js 15 기반 고성능 인터랙티브 무한 캔버스. Core Web Vitals 100점 달성.",
    type: "website",
    locale: "ko_KR",
    siteName: "ZoomBoard",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ZoomBoard - High Performance Interactive Canvas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ZoomBoard | Interactive Canvas",
    description: "High performance interactive infinite canvas with Next.js 15",
    images: ["/twitter-image.png"],
    creator: "@zoomboard",
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    other: {
      "msvalidate.01": "your-bing-verification-code"
    },
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "name": "ZoomBoard",
      "description": "Next.js 15 기반 고성능 인터랙티브 무한 캔버스. React 19 Compiler로 최적화된 협업 도구.",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "url": process.env.NEXT_PUBLIC_BASE_URL || "https://your-domain.com",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "author": {
        "@type": "Organization",
        "name": "ZoomBoard Team"
      }
    },
    {
      "@type": "WebSite",
      "name": "ZoomBoard",
      "url": process.env.NEXT_PUBLIC_BASE_URL || "https://your-domain.com",
      "description": "고성능 인터랙티브 무한 캔버스 플랫폼",
      "publisher": {
        "@type": "Organization",
        "name": "ZoomBoard"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${process.env.NEXT_PUBLIC_BASE_URL || "https://your-domain.com"}/search?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Organization",
      "name": "ZoomBoard",
      "url": process.env.NEXT_PUBLIC_BASE_URL || "https://your-domain.com",
      "logo": `${process.env.NEXT_PUBLIC_BASE_URL || "https://your-domain.com"}/logo.png`,
      "sameAs": [
        "https://github.com/your-repo",
        "https://twitter.com/zoomboard"
      ]
    }
  ]
};

// Initialize Supabase Client for Server Side Data Fetching
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServer = createClient(supabaseUrl, supabaseAnonKey);

export default async function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  // 🍪 Read Cookies for UI State
  const cookieStore = await cookies();
  const sidebarOpenCookie = cookieStore.get('sidebar_open');
  const isSidebarOpen = sidebarOpenCookie ? sidebarOpenCookie.value === 'true' : true;

  const themeCookie = cookieStore.get('theme');
  const theme = themeCookie ? themeCookie.value : 'light';

  const sidebarLockedCookie = cookieStore.get('sidebar_locked');
  const isSidebarLocked = sidebarLockedCookie ? sidebarLockedCookie.value === 'true' : true;

  // 🚀 Server Side Data Fetching
  // ... (keep creating initialNotes logic from previous file content)
  let initialNotes: Note[] = [];
  try {
    const { data } = await supabaseServer
      .from('notes')
      .select('*')
      .is('deleted_at', null)
      .order('z_index', { ascending: true });

    if (data) {
      initialNotes = data.map((n: DBNote) => ({
        id: n.id,
        x: n.x,
        y: n.y,
        title: n.title,
        content: n.content,
        createdAt: n.created_at ? Number(n.created_at) : 0,
        zIndex: n.z_index,
        deletedAt: n.deleted_at ? Number(n.deleted_at) : null,
        isPublished: n.is_published || false,
        userId: n.user_id || null,
      }));
    }
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Failed to fetch initial notes on server", e);
    }
  }

  return (
    <html lang="en" data-theme={theme} className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = document.cookie.split('; ').find(row => row.startsWith('theme='))?.split('=')[1];
                  if (!theme) {
                    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
        <NoteInitializer notes={initialNotes} isSidebarOpen={isSidebarOpen} isLocked={isSidebarLocked} />
        <AuthInitializer />
        <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
          <Sidebar initialIsOpen={isSidebarOpen} initialIsLocked={isSidebarLocked} initialNotes={initialNotes} />
          {children}
        </div>
        <ThemeToggle />
        {modal}
      </body>
    </html>
  );
}
