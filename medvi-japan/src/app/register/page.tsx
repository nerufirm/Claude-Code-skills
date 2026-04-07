"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [fullNameKana, setFullNameKana] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lineLoading, setLineLoading] = useState(false);

  function validate(): string | null {
    if (!fullName.trim()) return "氏名を入力してください。";
    if (!email.trim()) return "メールアドレスを入力してください。";
    if (password.length < 8) return "パスワードは8文字以上で入力してください。";
    if (password !== passwordConfirm) return "パスワードが一致しません。";
    return null;
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (authData.user) {
        const { error: insertError } = await supabase.from("users").insert({
          id: authData.user.id,
          email,
          full_name: fullName.trim(),
          full_name_kana: fullNameKana.trim() || null,
          date_of_birth: dateOfBirth || null,
          gender: gender || null,
          role: "patient",
        });

        if (insertError) {
          console.error("Failed to insert user profile:", insertError);
          setError("アカウントの作成中にエラーが発生しました。");
          return;
        }
      }

      router.push("/");
    } catch {
      setError("登録中にエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  }

  async function handleLineRegister() {
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
        setError("LINE連携に失敗しました。");
        return;
      }

      const res = await fetch("/api/auth/line", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, profile }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "LINE登録に失敗しました。");
        return;
      }

      router.push(data.redirectTo || "/");
    } catch {
      setError("LINE登録中にエラーが発生しました。");
    } finally {
      setLineLoading(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Medvi Japan</CardTitle>
          <CardDescription>新規アカウント登録</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button
            className="h-11 w-full bg-[#06C755] text-white hover:bg-[#05b34c] text-base font-bold"
            onClick={handleLineRegister}
            disabled={lineLoading}
          >
            {lineLoading ? "接続中..." : "LINEで登録"}
          </Button>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">または</span>
            <Separator className="flex-1" />
          </div>

          <form onSubmit={handleRegister} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fullName">
                氏名 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="山田 太郎"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fullNameKana">フリガナ</Label>
              <Input
                id="fullNameKana"
                type="text"
                placeholder="ヤマダ タロウ"
                value={fullNameKana}
                onChange={(e) => setFullNameKana(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">
                メールアドレス <span className="text-destructive">*</span>
              </Label>
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
              <Label htmlFor="password">
                パスワード <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="8文字以上"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="passwordConfirm">
                パスワード確認 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="passwordConfirm"
                type="password"
                placeholder="パスワードを再入力"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dateOfBirth">生年月日</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>性別</Label>
              <Select value={gender} onValueChange={(v) => setGender(v ?? "")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">男性</SelectItem>
                  <SelectItem value="female">女性</SelectItem>
                  <SelectItem value="other">その他</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="mt-1 h-10 w-full"
              disabled={loading}
            >
              {loading ? "登録中..." : "アカウントを作成"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            すでにアカウントをお持ちの方は
            <Link
              href="/login"
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
