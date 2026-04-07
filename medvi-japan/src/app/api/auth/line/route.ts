import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
}

interface LineVerifyResponse {
  scope: string;
  client_id: string;
  expires_in: number;
  error?: string;
  error_description?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken, profile } = body as {
      accessToken: string;
      profile: LineProfile;
    };

    if (!accessToken || !profile?.userId) {
      return NextResponse.json(
        { error: "アクセストークンとプロフィール情報が必要です。" },
        { status: 400 }
      );
    }

    // Verify the LINE access token
    const verifyRes = await fetch(
      `https://api.line.me/oauth2/v2.1/verify?access_token=${accessToken}`
    );
    const verifyData: LineVerifyResponse = await verifyRes.json();

    if (!verifyRes.ok || verifyData.error) {
      return NextResponse.json(
        { error: "LINEアクセストークンの検証に失敗しました。" },
        { status: 401 }
      );
    }

    const supabase = await createServiceRoleClient();

    // Check if a user with this line_id already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id, email")
      .eq("line_id", profile.userId)
      .single();

    if (existingUser) {
      // User exists - generate a magic link to sign them in
      // We use the admin API to create a session for the existing user
      const { data: sessionData, error: sessionError } =
        await supabase.auth.admin.generateLink({
          type: "magiclink",
          email: existingUser.email || `${profile.userId}@line.medvi.jp`,
        });

      if (sessionError) {
        console.error("Failed to generate session:", sessionError);
        return NextResponse.json(
          { error: "セッションの作成に失敗しました。" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        redirectTo: sessionData.properties?.hashed_token
          ? `/auth/callback?token_hash=${sessionData.properties.hashed_token}&type=magiclink`
          : "/",
      });
    }

    // New user - create Supabase auth user and profile
    const lineEmail = `${profile.userId}@line.medvi.jp`;

    const { data: newAuthUser, error: createError } =
      await supabase.auth.admin.createUser({
        email: lineEmail,
        email_confirm: true,
        user_metadata: {
          line_id: profile.userId,
          display_name: profile.displayName,
          picture_url: profile.pictureUrl,
        },
      });

    if (createError) {
      console.error("Failed to create auth user:", createError);
      return NextResponse.json(
        { error: "ユーザーの作成に失敗しました。" },
        { status: 500 }
      );
    }

    // Insert into users table
    const { error: insertError } = await supabase.from("users").insert({
      id: newAuthUser.user.id,
      line_id: profile.userId,
      email: lineEmail,
      full_name: profile.displayName,
      role: "patient",
    });

    if (insertError) {
      console.error("Failed to insert user profile:", insertError);
      // Clean up the auth user if profile insert fails
      await supabase.auth.admin.deleteUser(newAuthUser.user.id);
      return NextResponse.json(
        { error: "ユーザープロフィールの作成に失敗しました。" },
        { status: 500 }
      );
    }

    // Generate a sign-in link for the new user
    const { data: sessionData, error: sessionError } =
      await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: lineEmail,
      });

    if (sessionError) {
      console.error("Failed to generate session:", sessionError);
      return NextResponse.json(
        { error: "セッションの作成に失敗しました。" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      redirectTo: sessionData.properties?.hashed_token
        ? `/auth/callback?token_hash=${sessionData.properties.hashed_token}&type=magiclink`
        : "/",
    });
  } catch (error) {
    console.error("LINE auth error:", error);
    return NextResponse.json(
      { error: "認証処理中にエラーが発生しました。" },
      { status: 500 }
    );
  }
}
