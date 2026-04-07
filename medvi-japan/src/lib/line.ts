import crypto from "crypto";

const LINE_API_BASE = "https://api.line.me/v2/bot/message";

function getChannelAccessToken(): string {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    throw new Error("LINE_CHANNEL_ACCESS_TOKEN is not set");
  }
  return token;
}

function getChannelSecret(): string {
  const secret = process.env.LINE_CHANNEL_SECRET;
  if (!secret) {
    throw new Error("LINE_CHANNEL_SECRET is not set");
  }
  return secret;
}

async function pushMessage(
  lineUserId: string,
  messages: object[]
): Promise<void> {
  const response = await fetch(`${LINE_API_BASE}/push`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getChannelAccessToken()}`,
    },
    body: JSON.stringify({
      to: lineUserId,
      messages,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("LINE push message failed:", response.status, errorBody);
    throw new Error(`LINE API error: ${response.status}`);
  }
}

export async function replyMessage(
  replyToken: string,
  messages: object[]
): Promise<void> {
  const response = await fetch(`${LINE_API_BASE}/reply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getChannelAccessToken()}`,
    },
    body: JSON.stringify({
      replyToken,
      messages,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("LINE reply message failed:", response.status, errorBody);
    throw new Error(`LINE API error: ${response.status}`);
  }
}

export async function sendLineMessage(
  lineUserId: string,
  message: string
): Promise<void> {
  await pushMessage(lineUserId, [{ type: "text", text: message }]);
}

export async function sendLineFlexMessage(
  lineUserId: string,
  flexContent: object
): Promise<void> {
  await pushMessage(lineUserId, [
    {
      type: "flex",
      altText: "Medvi Japanからのお知らせ",
      contents: flexContent,
    },
  ]);
}

export function verifyLineSignature(body: string, signature: string): boolean {
  const hash = crypto
    .createHmac("SHA256", getChannelSecret())
    .update(body)
    .digest("base64");
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
}

export async function sendAppointmentConfirmation(
  lineUserId: string,
  date: string,
  time: string
): Promise<void> {
  const flexContent = {
    type: "bubble",
    header: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: "📅 診察予約確認",
          weight: "bold",
          size: "lg",
          color: "#1a73e8",
        },
      ],
    },
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: "診察のご予約が確定しました。",
          wrap: true,
          margin: "md",
        },
        {
          type: "separator",
          margin: "lg",
        },
        {
          type: "box",
          layout: "vertical",
          margin: "lg",
          contents: [
            {
              type: "box",
              layout: "horizontal",
              contents: [
                { type: "text", text: "日付", color: "#888888", flex: 2 },
                { type: "text", text: date, flex: 5 },
              ],
            },
            {
              type: "box",
              layout: "horizontal",
              margin: "md",
              contents: [
                { type: "text", text: "時間", color: "#888888", flex: 2 },
                { type: "text", text: time, flex: 5 },
              ],
            },
          ],
        },
      ],
    },
    footer: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "button",
          action: {
            type: "uri",
            label: "マイページで確認",
            uri: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/mypage`,
          },
          style: "primary",
          color: "#1a73e8",
        },
      ],
    },
  };

  await sendLineFlexMessage(lineUserId, flexContent);
}

export async function sendPrescriptionNotification(
  lineUserId: string,
  medicationName: string,
  checkoutUrl: string
): Promise<void> {
  const flexContent = {
    type: "bubble",
    header: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: "💊 処方箋のお知らせ",
          weight: "bold",
          size: "lg",
          color: "#1a73e8",
        },
      ],
    },
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: `${medicationName}の処方が準備できました。`,
          wrap: true,
          margin: "md",
        },
        {
          type: "text",
          text: "以下のボタンからお支払い・詳細をご確認ください。",
          wrap: true,
          margin: "md",
          size: "sm",
          color: "#666666",
        },
      ],
    },
    footer: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "button",
          action: {
            type: "uri",
            label: "詳細を確認する",
            uri: checkoutUrl,
          },
          style: "primary",
          color: "#1a73e8",
        },
      ],
    },
  };

  await sendLineFlexMessage(lineUserId, flexContent);
}

export async function sendShippingNotification(
  lineUserId: string,
  medicationName: string,
  trackingInfo?: string
): Promise<void> {
  const bodyContents: object[] = [
    {
      type: "text",
      text: `${medicationName}の配送状況をお知らせします。`,
      wrap: true,
      margin: "md",
    },
  ];

  if (trackingInfo) {
    bodyContents.push(
      { type: "separator", margin: "lg" },
      {
        type: "box",
        layout: "horizontal",
        margin: "lg",
        contents: [
          { type: "text", text: "追跡番号", color: "#888888", flex: 3 },
          { type: "text", text: trackingInfo, flex: 5 },
        ],
      }
    );
  }

  const flexContent = {
    type: "bubble",
    header: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: "🚚 配送状況のお知らせ",
          weight: "bold",
          size: "lg",
          color: "#1a73e8",
        },
      ],
    },
    body: {
      type: "box",
      layout: "vertical",
      contents: bodyContents,
    },
    footer: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "button",
          action: {
            type: "uri",
            label: "マイページで確認",
            uri: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/mypage`,
          },
          style: "primary",
          color: "#1a73e8",
        },
      ],
    },
  };

  await sendLineFlexMessage(lineUserId, flexContent);
}
