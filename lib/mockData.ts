/**
 * Realistic seed data for demo mode.
 *
 * This data is used when Supabase returns empty results or errors,
 * so the app always looks populated for demo recordings.
 *
 * The profiles, events, conversations, and notifications feel authentic —
 * real cities, real job titles, natural bios, and tasteful event names.
 */

import type { Profile, Event, Conversation, Notification, Invite, Message } from '@/types'

// ─── Helper ────────────────────────────────────────────────────────────────────

function daysAgo(n: number) {
  return new Date(Date.now() - n * 86_400_000).toISOString()
}
function daysFromNow(n: number) {
  return new Date(Date.now() + n * 86_400_000).toISOString()
}
function hoursFromNow(n: number) {
  return new Date(Date.now() + n * 3_600_000).toISOString()
}

const DEMO_USER_ID = 'demo-user-00000000-0000-0000-0000-000000000000'

// ─── Profiles ──────────────────────────────────────────────────────────────────

export const MOCK_PROFILES: Profile[] = [
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567801', email: 'priya.sharma@demo.velvet', display_name: 'Priya Sharma',
    avatar_url: null, city: 'Mumbai', profession: 'Venture Capitalist',
    company: 'Elevation Capital', linkedin_url: null, instagram_handle: 'priyasharma',
    bio: 'Early-stage investor focused on consumer and fintech.\nPreviously built two companies from zero to exit.',
    interests: [], role: 'member', invite_code: null, invited_by: null, invite_count: 3,
    is_online: true, last_seen_at: new Date().toISOString(),
    onboarding_completed: true, created_at: daysAgo(14), updated_at: daysAgo(0),
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567802', email: 'james.okafor@demo.velvet', display_name: 'James Okafor',
    avatar_url: null, city: 'Lagos', profession: 'Creative Director',
    company: 'Studio Okafor', linkedin_url: null, instagram_handle: null,
    bio: 'Running a design studio working with global brands.\nObsessed with African contemporary art and typography.',
    interests: [], role: 'member', invite_code: null, invited_by: null, invite_count: 0,
    is_online: false, last_seen_at: daysAgo(0),
    onboarding_completed: true, created_at: daysAgo(10), updated_at: daysAgo(0),
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567803', email: 'sofia.reyes@demo.velvet', display_name: 'Sofia Reyes',
    avatar_url: null, city: 'Mexico City', profession: 'Founder',
    company: 'Noma Health', linkedin_url: null, instagram_handle: null,
    bio: 'Building the future of preventative healthcare in Latin America.\nYC S23. Dog person.',
    interests: [], role: 'member', invite_code: null, invited_by: null, invite_count: 0,
    is_online: true, last_seen_at: new Date().toISOString(),
    onboarding_completed: true, created_at: daysAgo(7), updated_at: daysAgo(0),
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567804', email: 'arjun.mehta@demo.velvet', display_name: 'Arjun Mehta',
    avatar_url: null, city: 'Bangalore', profession: 'Engineer',
    company: 'Vercel', linkedin_url: null, instagram_handle: null,
    bio: 'Infrastructure engineer by day, electronic music producer\nby night. Currently building in public.',
    interests: [], role: 'member', invite_code: null, invited_by: null, invite_count: 0,
    is_online: false, last_seen_at: daysAgo(0),
    onboarding_completed: true, created_at: daysAgo(5), updated_at: daysAgo(0),
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567805', email: 'chloe.dubois@demo.velvet', display_name: 'Chloe Dubois',
    avatar_url: null, city: 'Paris', profession: 'Author',
    company: null, linkedin_url: null, instagram_handle: null,
    bio: 'Writing a book about the intersection of technology and\nsolitude. Former journalist at Le Monde.',
    interests: [], role: 'member', invite_code: null, invited_by: null, invite_count: 0,
    is_online: true, last_seen_at: new Date().toISOString(),
    onboarding_completed: true, created_at: daysAgo(3), updated_at: daysAgo(0),
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567806', email: 'marcus.webb@demo.velvet', display_name: 'Marcus Webb',
    avatar_url: null, city: 'New York', profession: 'Angel Investor',
    company: null, linkedin_url: null, instagram_handle: null,
    bio: 'Backed 40+ startups across climate tech and developer tools.\nPartner at Webb Ventures. Avid jazz collector.',
    interests: [], role: 'member', invite_code: null, invited_by: null, invite_count: 0,
    is_online: false, last_seen_at: daysAgo(0),
    onboarding_completed: true, created_at: daysAgo(1), updated_at: daysAgo(0),
  },
]

// ─── Current user profile (for AuthContext mock) ───────────────────────────────

export const MOCK_CURRENT_USER: Profile = {
  id: DEMO_USER_ID, email: 'you@velvet.club', display_name: 'You',
  avatar_url: null, city: 'New York', profession: 'Founder',
  company: null, linkedin_url: null, instagram_handle: null,
  bio: 'Building something new.', interests: ['Technology', 'Startups'],
  role: 'member', invite_code: 'VELVET-YOU', invited_by: null, invite_count: 3,
  is_online: true, last_seen_at: new Date().toISOString(),
  onboarding_completed: true, created_at: daysAgo(14), updated_at: daysAgo(0),
}

// ─── Events ────────────────────────────────────────────────────────────────────

export const MOCK_EVENTS: Event[] = [
  {
    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901', title: 'The Velvet Dinner — Mumbai Edition',
    description: 'An intimate dinner for 20 members at a private residence in Bandra. Good food, better conversations. No agenda, no pitches.',
    event_type: 'in_person', location: 'Private Residence, Bandra West', address: 'Bandra West, Mumbai, Maharashtra',
    virtual_link: null, cover_image_url: null,
    starts_at: daysAgo(5), ends_at: new Date(Date.now() - 5 * 86_400_000 + 3 * 3_600_000).toISOString(),
    capacity: 20, rsvp_count: 12, is_published: true,
    created_by: DEMO_USER_ID, created_at: daysAgo(10), updated_at: daysAgo(0),
  },
  {
    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678902', title: 'Founders & Investors: Fireside Chat',
    description: 'An off-the-record conversation between founders and investors in the Velvet community. Chatham House rules. Bring your honest questions.',
    event_type: 'virtual', location: 'Zoom', address: null,
    virtual_link: 'https://zoom.us/j/velvet-demo', cover_image_url: null,
    starts_at: daysFromNow(4), ends_at: new Date(Date.now() + 4 * 86_400_000 + 2 * 3_600_000).toISOString(),
    capacity: 50, rsvp_count: 23, is_published: true,
    created_by: DEMO_USER_ID, created_at: daysAgo(2), updated_at: daysAgo(0),
  },
  {
    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678903', title: 'Velvet Rooftop — New York',
    description: 'Summer rooftop gathering for Velvet members in NYC and anyone visiting. Casual drinks, no dress code, just interesting people.',
    event_type: 'in_person', location: 'The Standard Hotel, Rooftop', address: '848 Washington St, New York, NY 10014',
    virtual_link: null, cover_image_url: null,
    starts_at: daysFromNow(21), ends_at: new Date(Date.now() + 21 * 86_400_000 + 4 * 3_600_000).toISOString(),
    capacity: 40, rsvp_count: 8, is_published: true,
    created_by: DEMO_USER_ID, created_at: daysAgo(1), updated_at: daysAgo(0),
  },
]

// ─── Conversations ─────────────────────────────────────────────────────────────

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'c3d4e5f6-a7b8-9012-cdef-123456789001', member_1_id: DEMO_USER_ID, member_2_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567801',
    last_message: 'Would love to connect when you are next in the city.',
    last_message_at: hoursFromNow(-2), created_at: daysAgo(3),
    other_member: MOCK_PROFILES[0], unread_count: 0,
  },
  {
    id: 'c3d4e5f6-a7b8-9012-cdef-123456789002', member_1_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567802', member_2_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567805',
    last_message: 'Send me the piece when it is ready. I would love to read it.',
    last_message_at: hoursFromNow(-6), created_at: daysAgo(1),
    other_member: MOCK_PROFILES[4], unread_count: 0,
  },
  {
    id: 'c3d4e5f6-a7b8-9012-cdef-123456789003', member_1_id: DEMO_USER_ID, member_2_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567803',
    last_message: 'Perfect, see you at the gallery at 7!',
    last_message_at: hoursFromNow(-1), created_at: daysAgo(1),
    other_member: MOCK_PROFILES[2], unread_count: 0,
  },
  {
    id: 'c3d4e5f6-a7b8-9012-cdef-123456789004', member_1_id: DEMO_USER_ID, member_2_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567806',
    last_message: 'I\'ll send over the pitch deck tomorrow morning.',
    last_message_at: hoursFromNow(-10), created_at: daysAgo(2),
    other_member: MOCK_PROFILES[5], unread_count: 0,
  },
]

// ─── Messages (for a specific conversation) ────────────────────────────────────

export function getMockMessages(conversationId: string): Message[] {
  if (conversationId === 'c3d4e5f6-a7b8-9012-cdef-123456789001') {
    return [
      { id: 'm1', conversation_id: conversationId, sender_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567801', content: 'Hey! Just saw your profile on Velvet. Love what you are building — are you based in Mumbai?', is_read: true, created_at: daysAgo(3) },
      { id: 'm2', conversation_id: conversationId, sender_id: DEMO_USER_ID, content: 'Hi Priya! Not based there but visiting next month for a few meetings. Would love to grab coffee if you are around.', is_read: true, created_at: new Date(Date.now() - 3 * 86_400_000 + 20 * 60_000).toISOString() },
      { id: 'm3', conversation_id: conversationId, sender_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567801', content: 'Absolutely. I am pretty free that week. What brings you to Mumbai?', is_read: true, created_at: daysAgo(2) },
      { id: 'm4', conversation_id: conversationId, sender_id: DEMO_USER_ID, content: 'Some investor meetings and a conference on fintech. The ecosystem here has grown a lot in the last two years.', is_read: true, created_at: new Date(Date.now() - 2 * 86_400_000 + 15 * 60_000).toISOString() },
      { id: 'm5', conversation_id: conversationId, sender_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567801', content: 'It really has. We have made 8 fintech bets in the last 18 months alone. Let me know your dates and we can find a time.', is_read: true, created_at: new Date(Date.now() - 2 * 3_600_000 - 30 * 60_000).toISOString() },
      { id: 'm6', conversation_id: conversationId, sender_id: DEMO_USER_ID, content: 'Would love to connect when you are next in the city.', is_read: true, created_at: hoursFromNow(-2) },
    ]
  }
  if (conversationId === 'c3d4e5f6-a7b8-9012-cdef-123456789002') {
    return [
      { id: 'm7', conversation_id: conversationId, sender_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567805', content: 'James — I have been following your studio work for a while. The Adidas campaign was stunning.', is_read: true, created_at: daysAgo(1) },
      { id: 'm8', conversation_id: conversationId, sender_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567802', content: 'Thank you Chloe. That one took almost four months. I loved your piece on loneliness in the attention economy by the way — very well argued.', is_read: true, created_at: new Date(Date.now() - 86_400_000 + 40 * 60_000).toISOString() },
      { id: 'm9', conversation_id: conversationId, sender_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567805', content: 'That means a lot. I am working on a follow-up about solitude versus loneliness. The distinction matters more than people think.', is_read: true, created_at: hoursFromNow(-7) },
      { id: 'm10', conversation_id: conversationId, sender_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567802', content: 'Send me the piece when it is ready. I would love to read it.', is_read: true, created_at: hoursFromNow(-6) },
    ]
  }
  if (conversationId === 'c3d4e5f6-a7b8-9012-cdef-123456789003') {
    return [
      { id: 'm11', conversation_id: conversationId, sender_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567803', content: 'Are you still planning to go to the contemporary art opening tonight?', is_read: true, created_at: hoursFromNow(-3) },
      { id: 'm12', conversation_id: conversationId, sender_id: DEMO_USER_ID, content: 'Yes! I was just about to ask you. Want to meet outside?', is_read: true, created_at: hoursFromNow(-2) },
      { id: 'm13', conversation_id: conversationId, sender_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567803', content: 'Perfect, see you at the gallery at 7!', is_read: true, created_at: hoursFromNow(-1) },
    ]
  }
  if (conversationId === 'c3d4e5f6-a7b8-9012-cdef-123456789004') {
    return [
      { id: 'm14', conversation_id: conversationId, sender_id: DEMO_USER_ID, content: 'Hi Marcus, loved your insights on AI agents at the summit last week.', is_read: true, created_at: daysAgo(1) },
      { id: 'm15', conversation_id: conversationId, sender_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567806', content: 'Thanks! Always happy to talk about where this is heading. What are you building right now?', is_read: true, created_at: hoursFromNow(-20) },
      { id: 'm16', conversation_id: conversationId, sender_id: DEMO_USER_ID, content: 'Working on an autonomous coding platform. I\'ll send over the pitch deck tomorrow morning.', is_read: true, created_at: hoursFromNow(-10) },
    ]
  }
  return []
}

// ─── Notifications ─────────────────────────────────────────────────────────────

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1', user_id: DEMO_USER_ID, type: 'event_reminder',
    title: 'Rooftop Supper Club is in 5 days',
    body: 'Don\'t forget to confirm your attendance.',
    data: { event_id: 'e1' }, is_read: false, created_at: hoursFromNow(-3),
  },
  {
    id: 'n2', user_id: DEMO_USER_ID, type: 'new_message',
    title: 'Sophia Chen sent you a message',
    body: 'Would love to meet at the supper club next week!',
    data: { conversation_id: 'c1' }, is_read: false, created_at: hoursFromNow(-2),
  },
  {
    id: 'n3', user_id: DEMO_USER_ID, type: 'new_member',
    title: 'Kai Nakamura just joined Velvet',
    body: 'AI Researcher from Tokyo.',
    data: { member_id: 'p8' }, is_read: true, created_at: daysAgo(1),
  },
  {
    id: 'n4', user_id: DEMO_USER_ID, type: 'invite_accepted',
    title: 'Your invite was accepted',
    body: 'Nina Alexeeva joined using your invite code.',
    data: { member_id: 'p5' }, is_read: true, created_at: daysAgo(3),
  },
]

// ─── Invites ───────────────────────────────────────────────────────────────────

export const MOCK_INVITES: Invite[] = [
  {
    id: 'i1', code: 'PRIYA001', created_by: 'a1b2c3d4-e5f6-7890-abcd-ef1234567801',
    used_by: 'a1b2c3d4-e5f6-7890-abcd-ef1234567804', used_at: daysAgo(5), expires_at: null,
    created_at: daysAgo(10), used_by_profile: MOCK_PROFILES[3],
  },
  {
    id: 'i2', code: 'MARCUS08', created_by: 'a1b2c3d4-e5f6-7890-abcd-ef1234567806',
    used_by: null, used_at: null, expires_at: daysFromNow(30),
    created_at: daysAgo(1),
  },
]

// ─── Admin stats ───────────────────────────────────────────────────────────────

export const MOCK_ADMIN_STATS = {
  pendingApplications: 7,
  totalMembers: 142,
  eventsThisMonth: 4,
  messagesToday: 38,
}
