import { NextRequest } from "next/server";
import { getStripe, MEDICATION_PRICES, PLAN_INTERVALS } from "@/lib/stripe";
import type { MedicationType } from "@/types/database";

interface CheckoutRequestBody {
  consultationId: string;
  patientId: string;
  medicationType: MedicationType;
  medicationName: string;
  dosage: string;
  planMonths: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequestBody = await request.json();
    const {
      consultationId,
      patientId,
      medicationType,
      medicationName,
      dosage,
      planMonths,
    } = body;

    // Validate required fields
    if (
      !consultationId ||
      !patientId ||
      !medicationType ||
      !medicationName ||
      !dosage ||
      !planMonths
    ) {
      return Response.json(
        { error: "必須項目が不足しています。" },
        { status: 400 }
      );
    }

    // Look up pricing
    const medicationInfo = MEDICATION_PRICES[medicationType];
    if (!medicationInfo) {
      return Response.json(
        { error: "無効な薬剤タイプです。" },
        { status: 400 }
      );
    }

    const planInfo = PLAN_INTERVALS[planMonths];
    if (!planInfo) {
      return Response.json(
        { error: "無効なプラン期間です。" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

    // Create Stripe Checkout Session
    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "jpy",
            product_data: {
              name: `${medicationName} (${dosage})`,
              description: `${planInfo.label}定期配送プラン`,
            },
            unit_amount: medicationInfo.priceJpy,
            recurring: {
              interval: "month",
              interval_count: planInfo.intervalCount,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        consultationId,
        patientId,
        medicationType,
        medicationName,
        dosage,
        planMonths: String(planMonths),
      },
      success_url: `${baseUrl}/dashboard?checkout=success&consultation=${consultationId}`,
      cancel_url: `${baseUrl}/dashboard/consultation/${consultationId}?checkout=cancelled`,
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return Response.json(
      { error: "決済セッションの作成に失敗しました。" },
      { status: 500 }
    );
  }
}
