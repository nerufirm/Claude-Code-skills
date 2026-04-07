import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Medvi Japan | オンライン診療プラットフォーム",
  description:
    "AGA・ED・メディカルダイエットのオンライン診療。AIによる事前問診で、スムーズに医師の診察を受けられます。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-full items-center justify-between px-4 max-w-5xl mx-auto">
            <Link href="/" className="text-lg font-bold tracking-tight">
              Medvi
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ホーム
              </Link>
              <Link
                href="/consultation/chat"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                診察を始める
              </Link>
              <Link
                href="/mypage"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                マイページ
              </Link>
              <Link
                href="/login"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ログイン
              </Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
