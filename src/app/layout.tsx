import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { createClient } from "@supabase/supabase-js";
import NoteInitializer from "@/components/providers/NoteInitializer";
import AuthInitializer from "@/components/providers/AuthInitializer";
import { Note } from "@/store/useNoteStore";
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
  title: "ZoomBoard | High Performance Interactive Infinite Canvas",
  description: "Next.js기반의 고성능 인터랙티브 무한 캔버스 보드. 기술적 SEO와 사용자 경험(UX)이 최적화된 협업 도구.",
  keywords: ["Next.js", "React Compiler", "SEO Optimization", "Infinite Canvas", "Collaboration Tool"],
  authors: [{ name: "ZoomBoard Team" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "ZoomBoard | Interactive Canvas",
    description: "Experience the next level of performance with our optimized infinite canvas.",
    type: "website",
    locale: "ko_KR",
    siteName: "ZoomBoard",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZoomBoard | Interactive Canvas",
    description: "High performance interactive infinite canvas",
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      initialNotes = data.map((n: any) => ({
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
    console.error("Failed to fetch initial notes on server", e);
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
