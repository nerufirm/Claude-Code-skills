import { NextRequest } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createServiceRoleClient } from "@/lib/supabase/server";

function getWebhookSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET!;
}

export async function POST(request: NextRequest) {
  let event: Stripe.Event;

  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return Response.json(
        { error: "Stripe署名が見つかりません。" },
        { status: 400 }
      );
    }

    event = getStripe().webhooks.constructEvent(body, signature, getWebhookSecret());
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return Response.json(
      { error: "Webhook署名の検証に失敗しました。" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata;

        if (!metadata?.consultationId || !metadata?.patientId) {
          console.error("Missing metadata in checkout session:", session.id);
          break;
        }

        const supabase = await createServiceRoleClient();

        // Update or insert the prescription record
        const { error } = await supabase.from("prescriptions").upsert(
          {
            consultation_id: metadata.consultationId,
            patient_id: metadata.patientId,
            doctor_id: "d1", // In production, extract from session or consultation
            medication_type: metadata.medicationType,
            medication_name: metadata.medicationName ?? "",
            dosage: metadata.dosage ?? "",
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            stripe_checkout_url: session.url,
            prescription_status: "active",
          },
          { onConflict: "consultation_id" }
        );

        if (error) {
          console.error("Failed to update prescription:", error);
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const supabase = await createServiceRoleClient();

        const { error } = await supabase
          .from("prescriptions")
          .update({ prescription_status: "cancelled" })
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          console.error("Failed to cancel prescription:", error);
        }

        break;
      }

      default:
        // Unhandled event type - log for debugging
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }
  } catch (error) {
    console.error("Error processing webhook event:", error);
    return Response.json(
      { error: "Webhookイベントの処理に失敗しました。" },
      { status: 500 }
    );
  }

  return Response.json({ received: true });
}
