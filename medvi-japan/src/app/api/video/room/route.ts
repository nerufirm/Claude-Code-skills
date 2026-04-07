import { NextRequest } from "next/server";
import { createDailyRoom, createMeetingToken } from "@/lib/daily";
import { createServiceRoleClient } from "@/lib/supabase/server";

interface RoomRequestBody {
  consultationId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RoomRequestBody = await request.json();
    const { consultationId } = body;

    if (!consultationId) {
      return Response.json(
        { error: "consultationId は必須です。" },
        { status: 400 }
      );
    }

    // Create a Daily.co room
    const room = await createDailyRoom(consultationId);

    // Update the consultation record with the video room URL
    const supabase = await createServiceRoleClient();
    const { error: updateError } = await supabase
      .from("consultations")
      .update({ video_room_url: room.url })
      .eq("id", consultationId);

    if (updateError) {
      console.error("Failed to update consultation:", updateError);
    }

    // Create a meeting token for the doctor (owner)
    const token = await createMeetingToken(room.name, true);

    return Response.json({ roomUrl: room.url, token });
  } catch (error) {
    console.error("Video room creation error:", error);
    return Response.json(
      { error: "ビデオルームの作成に失敗しました。" },
      { status: 500 }
    );
  }
}
