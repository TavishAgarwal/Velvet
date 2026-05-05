-- ─────────────────────────────────────────────────────────────────────────────
-- Velvet domain schema — events, messaging, applications, invites, notifications
-- Run with: supabase db reset  (local)
--           supabase db push   (remote)
-- ─────────────────────────────────────────────────────────────────────────────

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. EXTEND PROFILES TABLE
-- ══════════════════════════════════════════════════════════════════════════════

alter table public.profiles
  add column if not exists city               text,
  add column if not exists profession         text,
  add column if not exists company            text,
  add column if not exists linkedin_url       text,
  add column if not exists instagram_handle   text,
  add column if not exists bio                text,
  add column if not exists interests          text[] default '{}',
  add column if not exists role               text not null default 'applicant',
  add column if not exists invite_code        text unique,
  add column if not exists invited_by         uuid references auth.users(id) on delete set null,
  add column if not exists invite_count       integer not null default 0,
  add column if not exists is_online          boolean not null default false,
  add column if not exists last_seen_at       timestamptz,
  add column if not exists onboarding_completed boolean not null default false;

-- Add a profile DELETE policy for GDPR compliance
create policy "Users can delete own profile"
  on public.profiles for delete
  using (auth.uid() = id);

-- Update the auto-create trigger to set role = 'applicant'
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'applicant')
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Helper: check if the current user is an admin
create or replace function public.is_admin()
returns boolean
language sql
stable security definer
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Helper: check if the current user is a member or admin
create or replace function public.is_member_or_admin()
returns boolean
language sql
stable security definer
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('member', 'admin')
  );
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 2. EVENTS
-- ══════════════════════════════════════════════════════════════════════════════

create table public.events (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  description     text,
  event_type      text not null default 'in_person' check (event_type in ('in_person', 'virtual')),
  location        text,
  address         text,
  virtual_link    text,
  cover_image_url text,
  starts_at       timestamptz not null,
  ends_at         timestamptz,
  capacity        integer check (capacity > 0),
  max_guests      integer,
  rsvp_count      integer not null default 0,
  is_published    boolean not null default false,
  created_by      uuid references auth.users(id) on delete set null not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.events enable row level security;

-- Members and admins can see published events
create policy "Members can read published events"
  on public.events for select
  using (is_published = true and is_member_or_admin());

-- Admins can read all events (including unpublished)
create policy "Admins can read all events"
  on public.events for select
  using (is_admin());

-- Admins can create events
create policy "Admins can create events"
  on public.events for insert
  with check (is_admin());

-- Admins can update events
create policy "Admins can update events"
  on public.events for update
  using (is_admin());

-- Admins can delete events
create policy "Admins can delete events"
  on public.events for delete
  using (is_admin());

create trigger events_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

-- ══════════════════════════════════════════════════════════════════════════════
-- 3. EVENT RSVPs
-- ══════════════════════════════════════════════════════════════════════════════

create table public.event_rsvps (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid references public.events(id) on delete cascade not null,
  user_id    uuid references auth.users(id) on delete cascade not null,
  status     text not null default 'going' check (status in ('going', 'maybe', 'not_going')),
  created_at timestamptz not null default now(),
  unique(event_id, user_id)
);

alter table public.event_rsvps enable row level security;

-- Members can read all RSVPs
create policy "Members can read RSVPs"
  on public.event_rsvps for select
  using (is_member_or_admin());

-- Users can manage their own RSVPs
create policy "Users can insert own RSVP"
  on public.event_rsvps for insert
  with check (auth.uid() = user_id);

create policy "Users can update own RSVP"
  on public.event_rsvps for update
  using (auth.uid() = user_id);

create policy "Users can delete own RSVP"
  on public.event_rsvps for delete
  using (auth.uid() = user_id);

-- Trigger: auto-update rsvp_count on events
create or replace function public.update_rsvp_count()
returns trigger
language plpgsql
security definer
as $$
begin
  if TG_OP = 'INSERT' then
    update public.events set rsvp_count = rsvp_count + 1 where id = NEW.event_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update public.events set rsvp_count = greatest(rsvp_count - 1, 0) where id = OLD.event_id;
    return OLD;
  end if;
  return null;
end;
$$;

create trigger event_rsvps_count_insert
  after insert on public.event_rsvps
  for each row execute function public.update_rsvp_count();

create trigger event_rsvps_count_delete
  after delete on public.event_rsvps
  for each row execute function public.update_rsvp_count();

-- ══════════════════════════════════════════════════════════════════════════════
-- 4. CONVERSATIONS
-- ══════════════════════════════════════════════════════════════════════════════

create table public.conversations (
  id              uuid primary key default gen_random_uuid(),
  member_1_id     uuid references auth.users(id) on delete cascade not null,
  member_2_id     uuid references auth.users(id) on delete cascade not null,
  last_message    text,
  last_message_at timestamptz,
  created_at      timestamptz not null default now(),
  unique(member_1_id, member_2_id)
);

alter table public.conversations enable row level security;

-- Users can only see conversations they are part of
create policy "Users can read own conversations"
  on public.conversations for select
  using (auth.uid() = member_1_id or auth.uid() = member_2_id);

-- Users can create conversations where they are a member
create policy "Users can create conversations"
  on public.conversations for insert
  with check (auth.uid() = member_1_id or auth.uid() = member_2_id);

-- ══════════════════════════════════════════════════════════════════════════════
-- 5. MESSAGES
-- ══════════════════════════════════════════════════════════════════════════════

create table public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id       uuid references auth.users(id) on delete cascade not null,
  content         text not null,
  is_read         boolean not null default false,
  created_at      timestamptz not null default now()
);

alter table public.messages enable row level security;

-- Users can only read messages from their conversations
create policy "Users can read own messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.member_1_id = auth.uid() or c.member_2_id = auth.uid())
    )
  );

-- Users can insert messages into conversations they belong to
create policy "Users can send messages"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.member_1_id = auth.uid() or c.member_2_id = auth.uid())
    )
  );

-- Users can mark messages as read
create policy "Users can mark messages read"
  on public.messages for update
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.member_1_id = auth.uid() or c.member_2_id = auth.uid())
    )
  );

-- Performance index for chat queries
create index idx_messages_conversation_created
  on public.messages(conversation_id, created_at);

-- Trigger: update conversation's last_message on new message
create or replace function public.update_conversation_last_message()
returns trigger
language plpgsql
security definer
as $$
begin
  update public.conversations
  set last_message = NEW.content,
      last_message_at = NEW.created_at
  where id = NEW.conversation_id;
  return NEW;
end;
$$;

create trigger messages_update_conversation
  after insert on public.messages
  for each row execute function public.update_conversation_last_message();

-- Enable Realtime for messages table
alter publication supabase_realtime add table public.messages;

-- ══════════════════════════════════════════════════════════════════════════════
-- 6. APPLICATIONS
-- ══════════════════════════════════════════════════════════════════════════════

create table public.applications (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users(id) on delete cascade not null,
  email            text not null,
  full_name        text not null,
  city             text not null,
  profession       text not null,
  company          text,
  linkedin_url     text,
  instagram_handle text,
  why_join         text not null,
  referral_code    text,
  status           text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'waitlisted')),
  admin_notes      text,
  reviewed_by      uuid references auth.users(id) on delete set null,
  reviewed_at      timestamptz,
  created_at       timestamptz not null default now()
);

alter table public.applications enable row level security;

-- Users can read their own application
create policy "Users can read own application"
  on public.applications for select
  using (auth.uid() = user_id);

-- Users can submit an application
create policy "Users can insert own application"
  on public.applications for insert
  with check (auth.uid() = user_id);

-- Admins can read all applications
create policy "Admins can read all applications"
  on public.applications for select
  using (is_admin());

-- Admins can update application status
create policy "Admins can update applications"
  on public.applications for update
  using (is_admin());

-- ══════════════════════════════════════════════════════════════════════════════
-- 7. INVITES
-- ══════════════════════════════════════════════════════════════════════════════

create table public.invites (
  id         uuid primary key default gen_random_uuid(),
  code       text not null unique,
  created_by uuid references auth.users(id) on delete cascade not null,
  used_by    uuid references auth.users(id) on delete set null,
  used_at    timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.invites enable row level security;

-- Users can read their own invites
create policy "Users can read own invites"
  on public.invites for select
  using (auth.uid() = created_by);

-- Users can create invites
create policy "Users can create invites"
  on public.invites for insert
  with check (auth.uid() = created_by);

-- Anyone can look up an invite by code (for applying with a referral)
create policy "Anyone can validate invite codes"
  on public.invites for select
  using (true);

-- ══════════════════════════════════════════════════════════════════════════════
-- 8. NOTIFICATIONS (Velvet-specific, replaces template version)
-- ══════════════════════════════════════════════════════════════════════════════

-- Drop the old template notifications table first (it uses different schema)
drop table if exists public.notifications cascade;

create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  type       text not null check (type in (
    'application_approved', 'new_message', 'event_reminder',
    'new_member', 'invite_accepted', 'application_rejected'
  )),
  title      text not null,
  body       text,
  data       jsonb,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

-- Users can read their own notifications
create policy "Users can read own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

-- Users can mark their own notifications as read
create policy "Users can update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

-- System (service role) can insert notifications for any user
-- (INSERT is allowed by default for service_role, no anon INSERT needed)

-- Performance index for notification queries
create index idx_notifications_user_read
  on public.notifications(user_id, is_read, created_at desc);
