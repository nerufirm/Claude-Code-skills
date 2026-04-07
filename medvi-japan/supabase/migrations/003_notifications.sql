-- Medvi Japan - Notifications for LINE bot and multi-channel messaging
-- Migration 003

-- ============================================================================
-- TABLES
-- ============================================================================

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  type text not null
    check (type in ('appointment_confirmed', 'prescription_ready', 'shipping_update', 'general')),
  title text not null,
  body text not null,
  channel text not null default 'line'
    check (channel in ('line', 'email', 'push')),
  is_read boolean not null default false,
  sent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

create index idx_notifications_user_id on notifications(user_id);
create index idx_notifications_sent_at on notifications(sent_at);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table notifications enable row level security;

-- Users can read their own notifications
create policy "notifications_select_own" on notifications
  for select using (user_id = auth.uid());

-- Users can update (mark as read) their own notifications
create policy "notifications_update_own" on notifications
  for update using (user_id = auth.uid());

-- Admins can do everything on notifications
create policy "notifications_admin_all" on notifications
  for all using (get_user_role() = 'admin');
