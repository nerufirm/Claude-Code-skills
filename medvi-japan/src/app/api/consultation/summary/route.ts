import OpenAI from "openai";
import { ChatMessage, AISummary } from "@/types/database";
import { createServiceRoleClient } from "@/lib/supabase/server";

function getOpenAIClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const SUMMARY_PROMPT = `あなたは医療予診の要約を作成するAIです。
以下のチャット履歴から、構造化された予診サマリーをJSON形式で抽出してください。

出力するJSONスキーマ：
{
  "chief_complaint": "主訴（患者が述べた相談内容を簡潔に）",
  "category": "aga" | "ed" | "diet",
  "height_cm": number | null,
  "weight_kg": number | null,
  "bmi": number | null（height_cmとweight_kgから計算）,
  "medical_history": ["既往歴の配列"],
  "current_medications": ["現在服用中の薬の配列"],
  "allergies": ["アレルギーの配列"],
  "contraindications": ["禁忌事項の配列"],
  "desired_medication": "希望する薬" | null,
  "lifestyle_notes": "生活習慣に関するメモ" | null,
  "additional_notes": "その他の特記事項" | null
}

禁忌事項（contraindications）の判定ルール：
- ED薬の場合：心臓病、硝酸薬の服用、重度の肝障害、低血圧がある場合は禁忌に追加
- AGA薬の場合：妊娠中・授乳中の女性への処方は禁忌
- GLP-1の場合：甲状腺髄様がんの家族歴、膵炎の既往がある場合は禁忌に追加

BMIの計算：weight_kg / (height_cm / 100) ^ 2（小数点第1位まで）

必ず有効なJSONのみを返してください。説明文は不要です。`;

interface SummaryResponse {
  summary: AISummary;
  isHighRisk: boolean;
  riskFlags: string[];
}

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

    const chatHistory = messages
      .map(
        (msg) =>
          `${msg.role === "user" ? "患者" : "AI"}: ${msg.content}`
      )
      .join("\n");

    const completion = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SUMMARY_PROMPT },
        { role: "user", content: chatHistory },
      ],
      temperature: 0.2,
      max_tokens: 2048,
      response_format: { type: "json_object" },
    });

    const rawContent = completion.choices[0]?.message?.content ?? "{}";
    const summary: AISummary = JSON.parse(rawContent);

    // Calculate BMI if not provided but height and weight are available
    if (
      summary.bmi === null &&
      summary.height_cm !== null &&
      summary.weight_kg !== null
    ) {
      const heightM = summary.height_cm / 100;
      summary.bmi = Math.round((summary.weight_kg / (heightM * heightM)) * 10) / 10;
    }

    // Triage: determine high risk and risk flags
    const riskFlags: string[] = [];

    if (summary.contraindications.length > 0) {
      riskFlags.push(
        ...summary.contraindications.map(
          (c) => `禁忌事項: ${c}`
        )
      );
    }

    // Additional triage rules
    if (summary.category === "ed") {
      const heartConditions = ["心臓病", "心疾患", "狭心症", "心筋梗塞", "不整脈"];
      const hasHeartCondition = summary.medical_history.some((h) =>
        heartConditions.some((c) => h.includes(c))
      );
      const nitrateKeywords = ["硝酸", "ニトロ", "nitroglycerin"];
      const takesNitrates = summary.current_medications.some((m) =>
        nitrateKeywords.some((k) => m.toLowerCase().includes(k))
      );

      if (hasHeartCondition) {
        riskFlags.push("ED薬と心臓疾患の既往歴の組み合わせ - 医師の慎重な判断が必要");
      }
      if (takesNitrates) {
        riskFlags.push("硝酸薬との併用禁忌 - ED薬の処方不可の可能性");
      }
    }

    if (summary.category === "diet" && summary.bmi !== null && summary.bmi < 18.5) {
      riskFlags.push("BMIが低体重の範囲 - GLP-1の適応を慎重に検討");
    }

    const isHighRisk = riskFlags.length > 0;

    // Save to Supabase
    const supabase = await createServiceRoleClient();
    const { error: updateError } = await supabase
      .from("consultations")
      .update({
        ai_summary: summary,
        is_high_risk: isHighRisk,
        risk_flags: riskFlags,
        status: "pre_consultation_completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", consultationId);

    if (updateError) {
      console.error("Supabase update error:", updateError);
      // Still return the summary even if DB save fails
    }

    const response: SummaryResponse = {
      summary,
      isHighRisk,
      riskFlags,
    };

    return Response.json(response);
  } catch (error) {
    console.error("Summary API error:", error);
    return Response.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
