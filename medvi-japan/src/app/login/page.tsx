"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { initLiff, getLiffProfile, getLiffAccessToken } from "@/lib/liff";
import liff from "@line/liff";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex flex-1 items-center justify-center">読み込み中...</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lineLoading, setLineLoading] = useState(false);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError("メールアドレスまたはパスワードが正しくありません。");
        return;
      }

      router.push(redirectTo);
    } catch {
      setError("ログイン中にエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  }

  async function handleLineLogin() {
    setError("");
    setLineLoading(true);

    try {
      await initLiff();

      if (!liff.isLoggedIn()) {
        liff.login({ redirectUri: window.location.href });
        return;
      }

      const accessToken = getLiffAccessToken();
      const profile = await getLiffProfile();

      if (!accessToken || !profile) {
        setError("LINEログインに失敗しました。");
        return;
      }

      const res = await fetch("/api/auth/line", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, profile }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "LINEログインに失敗しました。");
        return;
      }

      router.push(data.redirectTo || redirectTo);
    } catch {
      setError("LINEログイン中にエラーが発生しました。");
    } finally {
      setLineLoading(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Medvi Japan</CardTitle>
          <CardDescription>
            オンライン診療プラットフォーム
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button
            className="h-11 w-full bg-[#06C755] text-white hover:bg-[#05b34c] text-base font-bold"
            onClick={handleLineLogin}
            disabled={lineLoading}
          >
            {lineLoading ? "接続中..." : "LINEでログイン"}
          </Button>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">または</span>
            <Separator className="flex-1" />
          </div>

          <form onSubmit={handleEmailLogin} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@medvi.jp"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                placeholder="パスワードを入力"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="h-10 w-full"
              disabled={loading}
            >
              {loading ? "ログイン中..." : "ログイン"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            アカウントをお持ちでない方は
            <Link
              href="/register"
              className="text-primary underline underline-offset-4 hover:text-primary/80"
            >
              こちら
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
