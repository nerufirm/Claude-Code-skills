import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const redirectTo = searchParams.get("redirectTo") || "/";

  const supabase = await createServerSupabaseClient();

  if (code) {
    // OAuth or email confirmation code exchange
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Failed to exchange code for session:", error);
      return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
    }

    return NextResponse.redirect(`${origin}${redirectTo}`);
  }

  if (tokenHash && type) {
    // Magic link / OTP verification
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as "magiclink" | "email",
    });

    if (error) {
      console.error("Failed to verify OTP:", error);
      return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
    }

    return NextResponse.redirect(`${origin}${redirectTo}`);
  }

  // No code or token_hash provided
  return NextResponse.redirect(`${origin}/login`);
}
