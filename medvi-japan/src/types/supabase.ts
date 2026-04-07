import type { MedicationType, ConsultationStatus, PrescriptionStatus, ShippingStatus, UserRole } from "./database";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type NotificationType = "appointment_confirmed" | "prescription_ready" | "shipping_update" | "general";
type NotificationChannel = "line" | "email" | "push";

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
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
        };
        Insert: {
          id: string;
          line_id?: string | null;
          email?: string | null;
          full_name: string;
          full_name_kana?: string | null;
          date_of_birth?: string | null;
          gender?: string | null;
          phone?: string | null;
          role?: UserRole;
          identity_document_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          line_id?: string | null;
          email?: string | null;
          full_name?: string;
          full_name_kana?: string | null;
          date_of_birth?: string | null;
          gender?: string | null;
          phone?: string | null;
          role?: UserRole;
          identity_document_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      consultations: {
        Row: {
          id: string;
          patient_id: string;
          doctor_id: string | null;
          scheduled_at: string | null;
          ai_summary: Json | null;
          is_high_risk: boolean;
          risk_flags: string[];
          status: ConsultationStatus;
          video_room_url: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          doctor_id?: string | null;
          scheduled_at?: string | null;
          ai_summary?: Json | null;
          is_high_risk?: boolean;
          risk_flags?: string[];
          status?: ConsultationStatus;
          video_room_url?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          doctor_id?: string | null;
          scheduled_at?: string | null;
          ai_summary?: Json | null;
          is_high_risk?: boolean;
          risk_flags?: string[];
          status?: ConsultationStatus;
          video_room_url?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      prescriptions: {
        Row: {
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
        };
        Insert: {
          id?: string;
          consultation_id: string;
          patient_id: string;
          doctor_id: string;
          medication_type: MedicationType;
          medication_name: string;
          dosage: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          stripe_checkout_url?: string | null;
          prescription_status?: PrescriptionStatus;
          shipping_status?: ShippingStatus | null;
          next_delivery_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          consultation_id?: string;
          patient_id?: string;
          doctor_id?: string;
          medication_type?: MedicationType;
          medication_name?: string;
          dosage?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          stripe_checkout_url?: string | null;
          prescription_status?: PrescriptionStatus;
          shipping_status?: ShippingStatus | null;
          next_delivery_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_histories: {
        Row: {
          id: string;
          consultation_id: string | null;
          messages: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          consultation_id?: string | null;
          messages: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          consultation_id?: string | null;
          messages?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: NotificationType;
          title: string;
          body: string;
          channel: NotificationChannel;
          is_read: boolean;
          sent_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: NotificationType;
          title: string;
          body: string;
          channel?: NotificationChannel;
          is_read?: boolean;
          sent_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: NotificationType;
          title?: string;
          body?: string;
          channel?: NotificationChannel;
          is_read?: boolean;
          sent_at?: string;
          created_at?: string;
        };
      };
    };
  };
};
