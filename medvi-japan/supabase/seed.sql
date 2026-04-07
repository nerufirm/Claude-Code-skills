-- Medvi Japan - Development Seed Data
--
-- IMPORTANT: The UUIDs below must match auth.users rows created via the
-- Supabase dashboard or auth API before running this seed script.
-- Create auth.users entries first, then run this file.

-- ============================================================================
-- DOCTOR USERS
-- ============================================================================

insert into users (id, email, full_name, full_name_kana, gender, role, phone) values
  ('d0000000-0000-0000-0000-000000000001', 'tanaka.ichiro@medvi.jp', '田中 一郎', 'タナカ イチロウ', 'male', 'doctor', '03-1234-0001'),
  ('d0000000-0000-0000-0000-000000000002', 'suzuki.hanako@medvi.jp', '鈴木 花子', 'スズキ ハナコ', 'female', 'doctor', '03-1234-0002'),
  ('d0000000-0000-0000-0000-000000000003', 'yamamoto.kenji@medvi.jp', '山本 健二', 'ヤマモト ケンジ', 'male', 'doctor', '03-1234-0003');

-- ============================================================================
-- PATIENT USERS
-- ============================================================================

insert into users (id, email, full_name, full_name_kana, date_of_birth, gender, role, phone, line_id) values
  ('p0000000-0000-0000-0000-000000000001', 'sato.taro@example.com', '佐藤 太郎', 'サトウ タロウ', '1985-03-15', 'male', 'patient', '090-1111-0001', 'U_line_sato'),
  ('p0000000-0000-0000-0000-000000000002', 'takahashi.yuki@example.com', '高橋 由紀', 'タカハシ ユキ', '1992-07-22', 'female', 'patient', '090-1111-0002', 'U_line_takahashi'),
  ('p0000000-0000-0000-0000-000000000003', 'watanabe.ken@example.com', '渡辺 健', 'ワタナベ ケン', '1978-11-03', 'male', 'patient', '090-1111-0003', NULL),
  ('p0000000-0000-0000-0000-000000000004', 'ito.sakura@example.com', '伊藤 さくら', 'イトウ サクラ', '1990-04-10', 'female', 'patient', '090-1111-0004', 'U_line_ito'),
  ('p0000000-0000-0000-0000-000000000005', 'kobayashi.ren@example.com', '小林 蓮', 'コバヤシ レン', '2000-01-28', 'other', 'patient', '090-1111-0005', 'U_line_kobayashi');

-- ============================================================================
-- CONSULTATIONS
-- ============================================================================

insert into consultations (id, patient_id, doctor_id, scheduled_at, status, ai_summary, is_high_risk, risk_flags) values
  -- AGA consultations
  ('c0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001',
   '2026-04-10 10:00:00+09', 'pre_consultation_completed',
   '{"chief_complaint": "薄毛が気になる", "category": "aga", "height_cm": 175, "weight_kg": 70, "bmi": 22.9, "medical_history": [], "current_medications": [], "allergies": [], "contraindications": [], "desired_medication": "フィナステリド", "lifestyle_notes": null, "additional_notes": null}'::jsonb,
   false, '{}'),

  ('c0000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001',
   '2026-04-08 14:00:00+09', 'consultation_completed',
   '{"chief_complaint": "頭頂部の薄毛", "category": "aga", "height_cm": 168, "weight_kg": 65, "bmi": 23.0, "medical_history": ["高血圧"], "current_medications": ["アムロジピン5mg"], "allergies": [], "contraindications": [], "desired_medication": "デュタステリド", "lifestyle_notes": "飲酒週3回", "additional_notes": null}'::jsonb,
   false, '{}'),

  -- ED consultations
  ('c0000000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002',
   '2026-04-09 11:00:00+09', 'consultation_completed',
   '{"chief_complaint": "ED治療希望", "category": "ed", "height_cm": 175, "weight_kg": 70, "bmi": 22.9, "medical_history": [], "current_medications": [], "allergies": [], "contraindications": [], "desired_medication": "タダラフィル", "lifestyle_notes": null, "additional_notes": null}'::jsonb,
   false, '{}'),

  ('c0000000-0000-0000-0000-000000000004', 'p0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000002',
   '2026-04-07 09:00:00+09', 'consultation_completed',
   '{"chief_complaint": "ED相談", "category": "ed", "height_cm": 168, "weight_kg": 65, "bmi": 23.0, "medical_history": ["高血圧"], "current_medications": ["アムロジピン5mg"], "allergies": [], "contraindications": ["硝酸薬との併用禁忌確認済"], "desired_medication": "シルデナフィル", "lifestyle_notes": null, "additional_notes": "血圧コントロール良好"}'::jsonb,
   true, '{"高血圧治療中", "硝酸薬併用リスク確認要"}'),

  -- Diet consultations
  ('c0000000-0000-0000-0000-000000000005', 'p0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000003',
   '2026-04-11 15:00:00+09', 'pre_consultation_completed',
   '{"chief_complaint": "ダイエット希望", "category": "diet", "height_cm": 158, "weight_kg": 72, "bmi": 28.8, "medical_history": [], "current_medications": [], "allergies": [], "contraindications": [], "desired_medication": "GLP-1", "lifestyle_notes": "運動習慣なし", "additional_notes": null}'::jsonb,
   false, '{}'),

  ('c0000000-0000-0000-0000-000000000006', 'p0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000003',
   '2026-04-06 13:00:00+09', 'consultation_completed',
   '{"chief_complaint": "メディカルダイエット相談", "category": "diet", "height_cm": 162, "weight_kg": 80, "bmi": 30.5, "medical_history": ["2型糖尿病"], "current_medications": ["メトホルミン500mg"], "allergies": [], "contraindications": [], "desired_medication": "GLP-1", "lifestyle_notes": "デスクワーク中心", "additional_notes": "HbA1c 6.8%"}'::jsonb,
   true, '{"糖尿病治療中", "BMI30超"}'),

  -- Cancelled consultation
  ('c0000000-0000-0000-0000-000000000007', 'p0000000-0000-0000-0000-000000000005', NULL,
   NULL, 'cancelled',
   NULL,
   false, '{}'),

  -- Another pre-consultation
  ('c0000000-0000-0000-0000-000000000008', 'p0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000001',
   '2026-04-12 16:00:00+09', 'pre_consultation_completed',
   '{"chief_complaint": "AGA治療について相談したい", "category": "aga", "height_cm": 170, "weight_kg": 60, "bmi": 20.8, "medical_history": [], "current_medications": [], "allergies": ["ペニシリン"], "contraindications": [], "desired_medication": null, "lifestyle_notes": null, "additional_notes": null}'::jsonb,
   false, '{}');

-- ============================================================================
-- PRESCRIPTIONS
-- ============================================================================

insert into prescriptions (id, consultation_id, patient_id, doctor_id, medication_type, medication_name, dosage, prescription_status, shipping_status, next_delivery_date) values
  ('rx000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001',
   'aga_dutasteride', 'デュタステリド', '0.5mg 1日1回', 'active', 'delivered', '2026-05-08'),

  ('rx000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002',
   'ed_tadalafil', 'タダラフィル', '10mg 必要時', 'active', 'shipped', '2026-05-09'),

  ('rx000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000004', 'p0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000002',
   'ed_sildenafil', 'シルデナフィル', '50mg 必要時', 'pending', NULL, NULL),

  ('rx000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000006', 'p0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000003',
   'diet_glp1', 'GLP-1受容体作動薬', '0.25mg 週1回皮下注射', 'active', 'preparing', '2026-04-20');
