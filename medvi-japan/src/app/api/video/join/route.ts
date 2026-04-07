import { NextRequest } from "next/server";
import { createMeetingToken } from "@/lib/daily";
import { createServiceRoleClient } from "@/lib/supabase/server";

interface JoinRequestBody {
  consultationId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: JoinRequestBody = await request.json();
    const { consultationId } = body;

    if (!consultationId) {
      return Response.json(
        { error: "consultationId は必須です。" },
        { status: 400 }
      );
    }

    // Look up the consultation to get the video room URL
    const supabase = await createServiceRoleClient();
    const { data: consultation, error: fetchError } = await supabase
      .from("consultations")
      .select("video_room_url")
      .eq("id", consultationId)
      .single();

    if (fetchError || !consultation) {
      return Response.json(
        { error: "診察データが見つかりません。" },
        { status: 404 }
      );
    }

    if (!consultation.video_room_url) {
      return Response.json(
        { error: "ビデオルームがまだ作成されていません。" },
        { status: 400 }
      );
    }

    // Extract room name from the URL (e.g., https://domain.daily.co/medvi-xxx)
    const roomUrl: string = consultation.video_room_url;
    const roomName = roomUrl.split("/").pop();

    if (!roomName) {
      return Response.json(
        { error: "ルーム名の取得に失敗しました。" },
        { status: 500 }
      );
    }

    // Create a meeting token for the patient (not owner)
    const token = await createMeetingToken(roomName, false);

    return Response.json({ roomUrl, token });
  } catch (error) {
    console.error("Video join error:", error);
    return Response.json(
      { error: "ビデオ通話への参加に失敗しました。" },
      { status: 500 }
    );
  }
}
