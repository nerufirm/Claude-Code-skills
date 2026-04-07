import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      typescript: true,
    });
  }
  return _stripe;
}

export type MedicationCategory = "aga" | "ed" | "diet";

export const MEDICATION_PRICES: Record<
  string,
  { name: string; category: MedicationCategory; priceJpy: number }
> = {
  aga_finasteride: {
    name: "フィナステリド",
    category: "aga",
    priceJpy: 5000,
  },
  aga_dutasteride: {
    name: "デュタステリド",
    category: "aga",
    priceJpy: 7000,
  },
  aga_minoxidil: {
    name: "ミノキシジル",
    category: "aga",
    priceJpy: 5000,
  },
  ed_sildenafil: {
    name: "シルデナフィル",
    category: "ed",
    priceJpy: 3000,
  },
  ed_tadalafil: {
    name: "タダラフィル",
    category: "ed",
    priceJpy: 3000,
  },
  diet_glp1: {
    name: "GLP-1",
    category: "diet",
    priceJpy: 15000,
  },
};

export const PLAN_INTERVALS: Record<number, { label: string; intervalCount: number }> = {
  1: { label: "1ヶ月", intervalCount: 1 },
  3: { label: "3ヶ月", intervalCount: 3 },
  6: { label: "6ヶ月", intervalCount: 6 },
};
