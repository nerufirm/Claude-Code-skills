import OpenAI from "openai";
import { ChatMessage } from "@/types/database";

function getOpenAIClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const SYSTEM_PROMPT = `あなたは「Medvi Japan」のAI予診アシスタントです。患者さんとの予診（事前問診）を担当しています。

以下の情報を丁寧に聞き取ってください：

1. **主訴（相談内容）**: AGA（薄毛治療）、ED（勃起不全）、メディカルダイエット（GLP-1）のどれについて相談したいか
2. **身長**（cm）
3. **体重**（kg）
4. **既往歴**: 過去の病気や手術歴（心臓病、肝臓病、腎臓病、糖尿病など）
5. **現在服用中の薬**: 薬の名前と用量
6. **アレルギー**: 薬や食品のアレルギー
7. **希望する薬**: 具体的な薬の希望があれば（例：フィナステリド、デュタステリド、シルデナフィル、タダラフィル、GLP-1など）

ガイドライン：
- 一度に多くの質問をせず、会話の流れに沿って1〜2個ずつ質問してください
- 患者さんの回答が曖昧な場合は、具体的に確認してください
- 情報が不足している場合は、フォローアップの質問をしてください
- 医療の専門用語は避け、分かりやすい言葉で話してください
- 共感的で安心感のある対応を心がけてください
- すべての必要情報が集まったら、「必要な情報は以上です。予診を完了してください。」と伝えてください`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { consultationId, messages } = body as {
      consultationId: string;
      messages: ChatMessage[];
    };

    if (!messages || !Array.isArray(messages)) {
      return Response.json(
        { error: "messages is required and must be an array" },
        { status: 400 }
      );
    }

    const openaiMessages: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
    ];

    const completion = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o",
      messages: openaiMessages,
      temperature: 0.7,
      max_tokens: 1024,
    });

    const aiMessage = completion.choices[0]?.message?.content ?? "";

    return Response.json({
      consultationId,
      message: {
        role: "assistant",
        content: aiMessage,
        timestamp: new Date().toISOString(),
      } satisfies ChatMessage,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}
