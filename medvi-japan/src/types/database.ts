export type ConsultationStatus =
  | "pre_consultation_completed"
  | "consultation_completed"
  | "cancelled";

export type PrescriptionStatus =
  | "pending"
  | "active"
  | "paused"
  | "cancelled";

export type ShippingStatus =
  | "preparing"
  | "shipped"
  | "delivered";

export type MedicationType =
  | "aga_finasteride"
  | "aga_dutasteride"
  | "aga_minoxidil"
  | "ed_sildenafil"
  | "ed_tadalafil"
  | "diet_glp1";

export type UserRole = "patient" | "doctor" | "admin";

export interface User {
  id: string;
  line_id: string | null;
  email: string | null;
  full_name: string;
  full_name_kana: string | null;
  date_of_birth: string | null;
  gender: string | null;
  phone: string | null;
  role: UserRole;
  identity_document_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Consultation {
  id: string;
  patient_id: string;
  doctor_id: string | null;
  scheduled_at: string | null;
  ai_summary: AISummary | null;
  is_high_risk: boolean;
  risk_flags: string[];
  status: ConsultationStatus;
  video_room_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  patient?: User;
  doctor?: User;
}

export interface AISummary {
  chief_complaint: string;
  category: "aga" | "ed" | "diet";
  height_cm: number | null;
  weight_kg: number | null;
  bmi: number | null;
  medical_history: string[];
  current_medications: string[];
  allergies: string[];
  contraindications: string[];
  desired_medication: string | null;
  lifestyle_notes: string | null;
  additional_notes: string | null;
}

export interface Prescription {
  id: string;
  consultation_id: string;
  patient_id: string;
  doctor_id: string;
  medication_type: MedicationType;
  medication_name: string;
  dosage: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_checkout_url: string | null;
  prescription_status: PrescriptionStatus;
  shipping_status: ShippingStatus | null;
  next_delivery_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}
