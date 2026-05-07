/*
 * VELVET — DEMO SEED DATA
 * 
 * This file seeds minimal demo data for the app demo video.
 * 
 * HOW TO RUN:
 * 1. Open Supabase dashboard → SQL Editor
 * 2. Paste this entire file
 * 3. Click Run
 * 4. Verify data appears in the app
 *
 * BEFORE RUNNING:
 * Replace YOUR_USER_ID on line 32 with your real profile UUID.
 * Replace ADMIN_USER_ID on line 33 with your real admin profile UUID.
 * Find these in: Supabase → Table Editor → profiles → your row → id column
 *
 * TO RESET:
 * Run supabase/seed_reset.sql to remove all seed data cleanly.
 *
 * MEMBERS SEEDED: 6
 * EVENTS SEEDED: 3
 * CONVERSATIONS SEEDED: 2
 * MESSAGES SEEDED: 10
 * INVITES SEEDED: 2
 */

DO $$
DECLARE
  member_1_id UUID := 'a1b2c3d4-e5f6-7890-abcd-ef1234567801';
  member_2_id UUID := 'a1b2c3d4-e5f6-7890-abcd-ef1234567802';
  member_3_id UUID := 'a1b2c3d4-e5f6-7890-abcd-ef1234567803';
  member_4_id UUID := 'a1b2c3d4-e5f6-7890-abcd-ef1234567804';
  member_5_id UUID := 'a1b2c3d4-e5f6-7890-abcd-ef1234567805';
  member_6_id UUID := 'a1b2c3d4-e5f6-7890-abcd-ef1234567806';
  event_1_id  UUID := 'b2c3d4e5-f6a7-8901-bcde-f12345678901';
  event_2_id  UUID := 'b2c3d4e5-f6a7-8901-bcde-f12345678902';
  event_3_id  UUID := 'b2c3d4e5-f6a7-8901-bcde-f12345678903';
  conv_1_id   UUID := 'c3d4e5f6-a7b8-9012-cdef-123456789001';
  conv_2_id   UUID := 'c3d4e5f6-a7b8-9012-cdef-123456789002';
  conv_3_id   UUID := 'c3d4e5f6-a7b8-9012-cdef-123456789003';
  conv_4_id   UUID := 'c3d4e5f6-a7b8-9012-cdef-123456789004';
  
  -- Replace these with your actual UUIDs before running
  YOUR_USER_ID UUID := '52ae6ed1-467f-4c24-9de6-3bb97504c953';
  ADMIN_USER_ID UUID := '59cbc503-402d-4dfb-99ea-aa447e5f880a';
BEGIN

  -- 0. Insert Auth Users (required for profile foreign keys)
  INSERT INTO auth.users (id, instance_id, aud, role, email, email_confirmed_at, created_at, updated_at)
  VALUES 
    (member_1_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'priya@velvet.mock', now(), now(), now()),
    (member_2_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'james@velvet.mock', now(), now(), now()),
    (member_3_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sofia@velvet.mock', now(), now(), now()),
    (member_4_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'arjun@velvet.mock', now(), now(), now()),
    (member_5_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'chloe@velvet.mock', now(), now(), now()),
    (member_6_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'marcus@velvet.mock', now(), now(), now())
  ON CONFLICT (id) DO NOTHING;
  -- Temporarily disable protection trigger to allow role updates during seed
  ALTER TABLE public.profiles DISABLE TRIGGER trg_protect_profile_fields;

  -- 1. Upsert Members (Using UPDATE for existing rows created by trigger, or INSERT if triggers are disabled)
  INSERT INTO profiles (id, display_name, avatar_url, city, profession, company, linkedin_url, instagram_handle, bio, role, is_online, invite_count, onboarding_completed, created_at, updated_at)
  VALUES 
    (member_1_id, 'Priya Sharma', null, 'Mumbai', 'Venture Capitalist', 'Elevation Capital', null, 'priyasharma', 'Early-stage investor focused on consumer and fintech. 
       Previously built two companies from zero to exit.', 'member', true, 3, true, now() - interval '14 days', now()),
    (member_2_id, 'James Okafor', null, 'Lagos', 'Creative Director', 'Studio Okafor', null, null, 'Running a design studio working with global brands. 
        Obsessed with African contemporary art and typography.', 'member', false, 0, true, now() - interval '10 days', now()),
    (member_3_id, 'Sofia Reyes', null, 'Mexico City', 'Founder', 'Noma Health', null, null, 'Building the future of preventative healthcare in Latin America. 
        YC S23. Dog person.', 'member', true, 0, true, now() - interval '7 days', now()),
    (member_4_id, 'Arjun Mehta', null, 'Bangalore', 'Engineer', 'Vercel', null, null, 'Infrastructure engineer by day, electronic music producer 
        by night. Currently building in public.', 'member', false, 0, true, now() - interval '5 days', now()),
    (member_5_id, 'Chloe Dubois', null, 'Paris', 'Author', null, null, null, 'Writing a book about the intersection of technology and 
        solitude. Former journalist at Le Monde.', 'member', true, 0, true, now() - interval '3 days', now()),
    (member_6_id, 'Marcus Webb', null, 'New York', 'Angel Investor', null, null, null, 'Backed 40+ startups across climate tech and developer tools. 
        Partner at Webb Ventures. Avid jazz collector.', 'member', false, 0, true, now() - interval '1 day', now())
  ON CONFLICT (id) DO UPDATE SET 
    display_name = EXCLUDED.display_name,
    city = EXCLUDED.city,
    profession = EXCLUDED.profession,
    company = EXCLUDED.company,
    bio = EXCLUDED.bio,
    role = EXCLUDED.role,
    is_online = EXCLUDED.is_online,
    invite_count = EXCLUDED.invite_count,
    onboarding_completed = EXCLUDED.onboarding_completed;

  -- Re-enable protection trigger
  ALTER TABLE public.profiles ENABLE TRIGGER trg_protect_profile_fields;

  -- 2. Insert Events
  INSERT INTO events (id, title, description, event_type, location, address, virtual_link, cover_image_url, starts_at, ends_at, capacity, rsvp_count, is_published, created_by, created_at, updated_at)
  VALUES
    (event_1_id, 'The Velvet Dinner — Mumbai Edition', 'An intimate dinner for 20 members at a private residence in Bandra. Good food, better conversations. No agenda, no pitches.', 'in_person', 'Private Residence, Bandra West', 'Bandra West, Mumbai, Maharashtra', null, null, now() - interval '5 days', now() - interval '5 days' + interval '3 hours', 20, 12, true, ADMIN_USER_ID, now() - interval '10 days', now()),
    (event_2_id, 'Founders & Investors: Fireside Chat', 'An off-the-record conversation between founders and investors in the Velvet community. Chatham House rules. Bring your honest questions.', 'virtual', 'Zoom', null, 'https://zoom.us/j/velvet-demo', null, now() + interval '4 days', now() + interval '4 days' + interval '2 hours', 50, 23, true, ADMIN_USER_ID, now() - interval '2 days', now()),
    (event_3_id, 'Velvet Rooftop — New York', 'Summer rooftop gathering for Velvet members in NYC and anyone visiting. Casual drinks, no dress code, just interesting people.', 'in_person', 'The Standard Hotel, Rooftop', '848 Washington St, New York, NY 10014', null, null, now() + interval '21 days', now() + interval '21 days' + interval '4 hours', 40, 8, true, ADMIN_USER_ID, now() - interval '1 day', now())
  ON CONFLICT (id) DO NOTHING;

  -- 3. Insert RSVPs
  INSERT INTO event_rsvps (event_id, user_id, status, created_at)
  VALUES
    (event_2_id, member_1_id, 'going', now() - interval '1 day'),
    (event_2_id, member_3_id, 'going', now() - interval '1 day'),
    (event_2_id, member_6_id, 'going', now() - interval '12 hours'),
    (event_2_id, member_4_id, 'maybe', now() - interval '6 hours'),
    (event_3_id, member_6_id, 'going', now() - interval '5 hours'),
    (event_3_id, member_2_id, 'going', now() - interval '2 hours')
  ON CONFLICT (event_id, user_id) DO NOTHING;

  -- 4. Insert Conversations
  INSERT INTO conversations (id, member_1_id, member_2_id, last_message, last_message_at, created_at)
  VALUES
    (conv_1_id, YOUR_USER_ID, member_1_id, 'Would love to connect when you are next in the city.', now() - interval '2 hours', now() - interval '3 days'),
    (conv_2_id, member_2_id, member_5_id, 'Send me the piece when it is ready. I would love to read it.', now() - interval '6 hours', now() - interval '1 day'),
    (conv_3_id, YOUR_USER_ID, member_3_id, 'Perfect, see you at the gallery at 7!', now() - interval '1 hour', now() - interval '1 day'),
    (conv_4_id, YOUR_USER_ID, member_6_id, 'I''ll send over the pitch deck tomorrow morning.', now() - interval '10 hours', now() - interval '2 days')
  ON CONFLICT (id) DO NOTHING;

  -- 5. Insert Messages
  INSERT INTO messages (id, conversation_id, sender_id, content, is_read, created_at)
  VALUES
    (gen_random_uuid(), conv_1_id, member_1_id, 'Hey! Just saw your profile on Velvet. Love what you are building — are you based in Mumbai?', true, now() - interval '3 days'),
    (gen_random_uuid(), conv_1_id, YOUR_USER_ID, 'Hi Priya! Not based there but visiting next month for a few meetings. Would love to grab coffee if you are around.', true, now() - interval '3 days' + interval '20 minutes'),
    (gen_random_uuid(), conv_1_id, member_1_id, 'Absolutely. I am pretty free that week. What brings you to Mumbai?', true, now() - interval '2 days'),
    (gen_random_uuid(), conv_1_id, YOUR_USER_ID, 'Some investor meetings and a conference on fintech. The ecosystem here has grown a lot in the last two years.', true, now() - interval '2 days' + interval '15 minutes'),
    (gen_random_uuid(), conv_1_id, member_1_id, 'It really has. We have made 8 fintech bets in the last 18 months alone. Let me know your dates and we can find a time.', true, now() - interval '2 hours' - interval '30 minutes'),
    (gen_random_uuid(), conv_1_id, YOUR_USER_ID, 'Would love to connect when you are next in the city.', true, now() - interval '2 hours'),
    
    (gen_random_uuid(), conv_2_id, member_5_id, 'James — I have been following your studio work for a while. The Adidas campaign was stunning.', true, now() - interval '1 day'),
    (gen_random_uuid(), conv_2_id, member_2_id, 'Thank you Chloe. That one took almost four months. I loved your piece on loneliness in the attention economy by the way — very well argued.', true, now() - interval '1 day' + interval '40 minutes'),
    (gen_random_uuid(), conv_2_id, member_5_id, 'That means a lot. I am working on a follow-up about solitude versus loneliness. The distinction matters more than people think.', true, now() - interval '7 hours'),
    (gen_random_uuid(), conv_2_id, member_2_id, 'Send me the piece when it is ready. I would love to read it.', true, now() - interval '6 hours'),

    (gen_random_uuid(), conv_3_id, member_3_id, 'Are you still planning to go to the contemporary art opening tonight?', true, now() - interval '3 hours'),
    (gen_random_uuid(), conv_3_id, YOUR_USER_ID, 'Yes! I was just about to ask you. Want to meet outside?', true, now() - interval '2 hours'),
    (gen_random_uuid(), conv_3_id, member_3_id, 'Perfect, see you at the gallery at 7!', true, now() - interval '1 hour'),

    (gen_random_uuid(), conv_4_id, YOUR_USER_ID, 'Hi Marcus, loved your insights on AI agents at the summit last week.', true, now() - interval '1 day'),
    (gen_random_uuid(), conv_4_id, member_6_id, 'Thanks! Always happy to talk about where this is heading. What are you building right now?', true, now() - interval '20 hours'),
    (gen_random_uuid(), conv_4_id, YOUR_USER_ID, 'Working on an autonomous coding platform. I''ll send over the pitch deck tomorrow morning.', true, now() - interval '10 hours')
  ON CONFLICT (id) DO NOTHING;

  -- 6. Insert Invites
  INSERT INTO invites (code, created_by, used_by, used_at, expires_at, created_at)
  VALUES
    ('PRIYA001', member_1_id, member_4_id, now() - interval '5 days', null, now() - interval '10 days'),
    ('MARCUS08', member_6_id, null, null, now() + interval '30 days', now() - interval '1 day')
  ON CONFLICT (code) DO NOTHING;

END $$;
