import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  sendAppointmentConfirmation,
  sendPrescriptionNotification,
  sendShippingNotification,
} from "@/lib/line";

type NotificationType =
  | "appointment_confirmed"
  | "prescription_ready"
  | "shipping_update";

interface NotificationRequest {
  type: NotificationType;
  userId: string;
  data: {
    date?: string;
    time?: string;
    medicationName?: string;
    checkoutUrl?: string;
    trackingInfo?: string;
  };
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  // Verify the caller is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: NotificationRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { type, userId, data } = body;

  if (!type || !userId) {
    return Response.json(
      { error: "type and userId are required" },
      { status: 400 }
    );
  }

  // Look up the user's line_id
  const { data: targetUser, error: userError } = await supabase
    .from("users")
    .select("line_id")
    .eq("id", userId)
    .single();

  if (userError) {
    console.error("Failed to look up user:", userError);
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  const lineId = targetUser?.line_id;

  if (!lineId) {
    return Response.json({ success: true, channel: "none" });
  }

  try {
    switch (type) {
      case "appointment_confirmed":
        await sendAppointmentConfirmation(
          lineId,
          data.date ?? "",
          data.time ?? ""
        );
        break;
      case "prescription_ready":
        await sendPrescriptionNotification(
          lineId,
          data.medicationName ?? "",
          data.checkoutUrl ?? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/mypage`
        );
        break;
      case "shipping_update":
        await sendShippingNotification(
          lineId,
          data.medicationName ?? "",
          data.trackingInfo
        );
        break;
      default:
        return Response.json(
          { error: `Unknown notification type: ${type}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Failed to send LINE notification:", error);
    return Response.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }

  return Response.json({ success: true, channel: "line" });
}
