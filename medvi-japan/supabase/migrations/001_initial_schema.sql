-- Medvi Japan - Initial Database Schema
-- Telemedicine platform for AGA/ED/Diet treatments

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Auto-update updated_at timestamp
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================================
-- TABLES
-- ============================================================================

-- users: extends Supabase auth.users with profile data
create table users (
  id uuid primary key references auth.users on delete cascade,
  line_id text unique,
  email text,
  full_name text not null,
  full_name_kana text,
  date_of_birth date,
  gender text check (gender in ('male', 'female', 'other')),
  phone text,
  role text not null default 'patient' check (role in ('patient', 'doctor', 'admin')),
  identity_document_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- consultations: video consultation sessions between patient and doctor
create table consultations (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references users(id) on delete cascade,
  doctor_id uuid references users(id) on delete set null,
  scheduled_at timestamptz,
  ai_summary jsonb,
  is_high_risk boolean not null default false,
  risk_flags text[] not null default '{}',
  status text not null default 'pre_consultation_completed'
    check (status in ('pre_consultation_completed', 'consultation_completed', 'cancelled')),
  video_room_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- prescriptions: medication prescriptions linked to consultations
create table prescriptions (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null references consultations(id) on delete cascade,
  patient_id uuid not null references users(id) on delete cascade,
  doctor_id uuid not null references users(id) on delete cascade,
  medication_type text not null
    check (medication_type in (
      'aga_finasteride', 'aga_dutasteride', 'aga_minoxidil',
      'ed_sildenafil', 'ed_tadalafil', 'diet_glp1'
    )),
  medication_name text not null,
  dosage text not null,
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_checkout_url text,
  prescription_status text default 'pending'
    check (prescription_status in ('pending', 'active', 'paused', 'cancelled')),
  shipping_status text
    check (shipping_status in ('preparing', 'shipped', 'delivered')),
  next_delivery_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- chat_histories: AI pre-consultation chat logs
create table chat_histories (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid references consultations(id) on delete cascade,
  messages jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

create index idx_consultations_patient_id on consultations(patient_id);
create index idx_consultations_doctor_id on consultations(doctor_id);
create index idx_consultations_scheduled_at on consultations(scheduled_at);
create index idx_prescriptions_patient_id on prescriptions(patient_id);
create index idx_prescriptions_consultation_id on prescriptions(consultation_id);

-- ============================================================================
-- TRIGGERS: auto-update updated_at
-- ============================================================================

create trigger trg_users_updated_at
  before update on users
  for each row execute function update_updated_at();

create trigger trg_consultations_updated_at
  before update on consultations
  for each row execute function update_updated_at();

create trigger trg_prescriptions_updated_at
  before update on prescriptions
  for each row execute function update_updated_at();

create trigger trg_chat_histories_updated_at
  before update on chat_histories
  for each row execute function update_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table users enable row level security;
alter table consultations enable row level security;
alter table prescriptions enable row level security;
alter table chat_histories enable row level security;

-- Helper to get the current user's role
create or replace function get_user_role()
returns text as $$
  select role from users where id = auth.uid();
$$ language sql security definer stable;

-- ---------------------------------------------------------------------------
-- users policies
-- ---------------------------------------------------------------------------

-- Patients can read their own record
create policy "users_select_own" on users
  for select using (id = auth.uid());

-- Patients can update their own record
create policy "users_update_own" on users
  for update using (id = auth.uid());

-- Doctors can read patient profiles for their assigned consultations
create policy "users_select_doctor" on users
  for select using (
    get_user_role() = 'doctor'
    and (
      id = auth.uid()
      or id in (
        select patient_id from consultations where doctor_id = auth.uid()
      )
    )
  );

-- Admins can do everything on users
create policy "users_admin_all" on users
  for all using (get_user_role() = 'admin');

-- Allow insert for new user registration (user can only create their own row)
create policy "users_insert_own" on users
  for insert with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- consultations policies
-- ---------------------------------------------------------------------------

-- Patients can read their own consultations
create policy "consultations_select_patient" on consultations
  for select using (patient_id = auth.uid());

-- Doctors can read consultations assigned to them
create policy "consultations_select_doctor" on consultations
  for select using (
    get_user_role() = 'doctor' and doctor_id = auth.uid()
  );

-- Doctors can update consultations assigned to them (status, notes, etc.)
create policy "consultations_update_doctor" on consultations
  for update using (
    get_user_role() = 'doctor' and doctor_id = auth.uid()
  );

-- Patients can insert consultations (creating a new consultation request)
create policy "consultations_insert_patient" on consultations
  for insert with check (
    patient_id = auth.uid() and get_user_role() = 'patient'
  );

-- Admins can do everything on consultations
create policy "consultations_admin_all" on consultations
  for all using (get_user_role() = 'admin');

-- ---------------------------------------------------------------------------
-- prescriptions policies
-- ---------------------------------------------------------------------------

-- Patients can read their own prescriptions
create policy "prescriptions_select_patient" on prescriptions
  for select using (patient_id = auth.uid());

-- Doctors can read prescriptions they created
create policy "prescriptions_select_doctor" on prescriptions
  for select using (
    get_user_role() = 'doctor' and doctor_id = auth.uid()
  );

-- Doctors can create prescriptions
create policy "prescriptions_insert_doctor" on prescriptions
  for insert with check (
    get_user_role() = 'doctor' and doctor_id = auth.uid()
  );

-- Doctors can update prescriptions they created
create policy "prescriptions_update_doctor" on prescriptions
  for update using (
    get_user_role() = 'doctor' and doctor_id = auth.uid()
  );

-- Admins can do everything on prescriptions
create policy "prescriptions_admin_all" on prescriptions
  for all using (get_user_role() = 'admin');

-- ---------------------------------------------------------------------------
-- chat_histories policies
-- ---------------------------------------------------------------------------

-- Patients can read/insert their own chat histories (via consultation ownership)
create policy "chat_histories_select_patient" on chat_histories
  for select using (
    consultation_id in (
      select id from consultations where patient_id = auth.uid()
    )
  );

create policy "chat_histories_insert_patient" on chat_histories
  for insert with check (
    consultation_id in (
      select id from consultations where patient_id = auth.uid()
    )
  );

create policy "chat_histories_update_patient" on chat_histories
  for update using (
    consultation_id in (
      select id from consultations where patient_id = auth.uid()
    )
  );

-- Doctors can read chat histories for their consultations
create policy "chat_histories_select_doctor" on chat_histories
  for select using (
    get_user_role() = 'doctor'
    and consultation_id in (
      select id from consultations where doctor_id = auth.uid()
    )
  );

-- Admins can do everything on chat_histories
create policy "chat_histories_admin_all" on chat_histories
  for all using (get_user_role() = 'admin');
