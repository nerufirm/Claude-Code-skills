import { NextRequest } from "next/server";
import { verifyLineSignature, replyMessage } from "@/lib/line";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://medvi.jp";

interface LineEvent {
  type: string;
  replyToken?: string;
  source?: {
    userId?: string;
    type?: string;
  };
  message?: {
    type: string;
    text?: string;
  };
}

interface LineWebhookBody {
  events: LineEvent[];
}

async function handleFollowEvent(event: LineEvent): Promise<void> {
  if (!event.replyToken) return;

  await replyMessage(event.replyToken, [
    {
      type: "text",
      text: [
        "Medvi Japanへようこそ！🏥",
        "",
        "オンライン診察の予約から処方薬のお届けまで、すべてスマホで完結します。",
        "",
        "以下のキーワードでお気軽にお問い合わせください：",
        "・「予約」→ 診察の予約",
        "・「処方」→ 処方箋の確認",
        "・「ヘルプ」→ ご利用案内",
      ].join("\n"),
    },
  ]);
}

async function handleMessageEvent(event: LineEvent): Promise<void> {
  if (!event.replyToken || event.message?.type !== "text" || !event.message.text) {
    return;
  }

  const text = event.message.text;

  if (text.includes("予約") || text.includes("診察")) {
    await replyMessage(event.replyToken, [
      {
        type: "text",
        text: `オンライン診察のご予約はこちらからお手続きいただけます。\n\n${APP_URL}/dashboard/consultation`,
      },
    ]);
    return;
  }

  if (text.includes("処方") || text.includes("薬")) {
    await replyMessage(event.replyToken, [
      {
        type: "text",
        text: `処方箋やお薬の状況はマイページからご確認いただけます。\n\n${APP_URL}/dashboard/mypage`,
      },
    ]);
    return;
  }

  if (text.includes("ヘルプ") || text.toLowerCase().includes("help")) {
    await replyMessage(event.replyToken, [
      {
        type: "text",
        text: [
          "【ご利用案内】",
          "",
          "以下のキーワードをお送りください：",
          "",
          "📅「予約」「診察」→ オンライン診察の予約",
          "💊「処方」「薬」→ 処方箋・お薬の確認",
          "❓「ヘルプ」→ この案内を表示",
          "",
          "その他のお問い合わせは、マイページのチャットからお気軽にどうぞ。",
        ].join("\n"),
      },
    ]);
    return;
  }

  // Default response
  await replyMessage(event.replyToken, [
    {
      type: "text",
      text: "メッセージありがとうございます。ご予約やお薬についてのお問い合わせでしたら、「ヘルプ」と入力してご利用方法をご確認ください。",
    },
  ]);
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("x-line-signature");

  if (!signature) {
    return Response.json({ error: "Missing signature" }, { status: 400 });
  }

  try {
    const isValid = verifyLineSignature(body, signature);
    if (!isValid) {
      return Response.json({ error: "Invalid signature" }, { status: 401 });
    }
  } catch {
    return Response.json({ error: "Signature verification failed" }, { status: 401 });
  }

  const webhookBody: LineWebhookBody = JSON.parse(body);

  // Process events without blocking the response
  for (const event of webhookBody.events) {
    try {
      switch (event.type) {
        case "follow":
          await handleFollowEvent(event);
          break;
        case "message":
          await handleMessageEvent(event);
          break;
        case "unfollow":
          console.log("User unfollowed:", event.source?.userId);
          break;
        default:
          console.log("Unhandled LINE event type:", event.type);
      }
    } catch (error) {
      console.error("Error handling LINE event:", event.type, error);
    }
  }

  return Response.json({ ok: true });
}
