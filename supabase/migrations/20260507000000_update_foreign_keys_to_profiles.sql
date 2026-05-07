-- ─────────────────────────────────────────────────────────────────────────────
-- Update foreign keys to reference public.profiles instead of auth.users
-- This allows PostgREST to automatically join profile data when querying
-- conversations, messages, and events.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. CONVERSATIONS
alter table public.conversations drop constraint if exists conversations_member_1_id_fkey;
alter table public.conversations drop constraint if exists conversations_member_2_id_fkey;

alter table public.conversations 
  add constraint conversations_member_1_id_fkey foreign key (member_1_id) references public.profiles(id) on delete cascade,
  add constraint conversations_member_2_id_fkey foreign key (member_2_id) references public.profiles(id) on delete cascade;

-- 2. MESSAGES
alter table public.messages drop constraint if exists messages_sender_id_fkey;

alter table public.messages 
  add constraint messages_sender_id_fkey foreign key (sender_id) references public.profiles(id) on delete cascade;

-- 3. EVENT RSVPS
alter table public.event_rsvps drop constraint if exists event_rsvps_user_id_fkey;

alter table public.event_rsvps 
  add constraint event_rsvps_user_id_fkey foreign key (user_id) references public.profiles(id) on delete cascade;
