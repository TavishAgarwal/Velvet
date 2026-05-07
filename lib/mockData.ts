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
    id: 'p1', email: 'sophia@example.com', display_name: 'Sophia Chen',
    avatar_url: null, city: 'San Francisco', profession: 'Venture Partner',
    company: 'Sequoia Capital', linkedin_url: null, instagram_handle: '@sophiachen',
    bio: 'Investing in the future of human creativity. Previously Google X.',
    interests: ['Technology', 'Art & Design', 'Travel'],
    role: 'member', invite_code: null, invited_by: null, invite_count: 3,
    is_online: true, last_seen_at: new Date().toISOString(),
    onboarding_completed: true, created_at: daysAgo(90), updated_at: daysAgo(2),
  },
  {
    id: 'p2', email: 'marcus@example.com', display_name: 'Marcus Rivera',
    avatar_url: null, city: 'New York', profession: 'Creative Director',
    company: 'IDEO', linkedin_url: null, instagram_handle: '@marcusrivera',
    bio: 'Design is how we treat each other. Formerly Nike, Apple.',
    interests: ['Art & Design', 'Architecture', 'Fashion'],
    role: 'member', invite_code: null, invited_by: null, invite_count: 2,
    is_online: false, last_seen_at: daysAgo(0),
    onboarding_completed: true, created_at: daysAgo(75), updated_at: daysAgo(1),
  },
  {
    id: 'p3', email: 'amara@example.com', display_name: 'Amara Okafor',
    avatar_url: null, city: 'London', profession: 'Documentary Filmmaker',
    company: null, linkedin_url: null, instagram_handle: '@amarafilms',
    bio: 'Telling stories that need to be told. Sundance 2024 alum.',
    interests: ['Film', 'Travel', 'Literature'],
    role: 'member', invite_code: null, invited_by: null, invite_count: 1,
    is_online: true, last_seen_at: new Date().toISOString(),
    onboarding_completed: true, created_at: daysAgo(60), updated_at: daysAgo(3),
  },
  {
    id: 'p4', email: 'julian@example.com', display_name: 'Julian Park',
    avatar_url: null, city: 'Los Angeles', profession: 'Architect',
    company: 'Foster + Partners', linkedin_url: null, instagram_handle: null,
    bio: 'Building spaces that breathe. Sustainability first, always.',
    interests: ['Architecture', 'Art & Design', 'Wellness'],
    role: 'member', invite_code: null, invited_by: null, invite_count: 0,
    is_online: false, last_seen_at: daysAgo(1),
    onboarding_completed: true, created_at: daysAgo(45), updated_at: daysAgo(5),
  },
  {
    id: 'p5', email: 'nina@example.com', display_name: 'Nina Alexeeva',
    avatar_url: null, city: 'Berlin', profession: 'Music Producer',
    company: null, linkedin_url: null, instagram_handle: '@ninasound',
    bio: 'Sound is sculpture. Grammy-nominated engineer turned producer.',
    interests: ['Music', 'Technology', 'Film'],
    role: 'member', invite_code: null, invited_by: null, invite_count: 4,
    is_online: true, last_seen_at: new Date().toISOString(),
    onboarding_completed: true, created_at: daysAgo(30), updated_at: daysAgo(0),
  },
  {
    id: 'p6', email: 'david@example.com', display_name: 'David Moreau',
    avatar_url: null, city: 'Paris', profession: 'Chef & Restaurateur',
    company: 'Maison Moreau', linkedin_url: null, instagram_handle: '@chefmoreau',
    bio: 'Two Michelin stars. Cooking is conversation without words.',
    interests: ['Food & Wine', 'Travel', 'Art & Design'],
    role: 'member', invite_code: null, invited_by: null, invite_count: 2,
    is_online: false, last_seen_at: daysAgo(2),
    onboarding_completed: true, created_at: daysAgo(55), updated_at: daysAgo(4),
  },
  {
    id: 'p7', email: 'elena@example.com', display_name: 'Elena Vasquez',
    avatar_url: null, city: 'Miami', profession: 'Gallerist',
    company: 'Vasquez Contemporary', linkedin_url: null, instagram_handle: '@elenavasquez',
    bio: 'Bridging Latin American art and the world. Art Basel committee.',
    interests: ['Art & Design', 'Fashion', 'Travel'],
    role: 'member', invite_code: null, invited_by: null, invite_count: 5,
    is_online: true, last_seen_at: new Date().toISOString(),
    onboarding_completed: true, created_at: daysAgo(80), updated_at: daysAgo(1),
  },
  {
    id: 'p8', email: 'kai@example.com', display_name: 'Kai Nakamura',
    avatar_url: null, city: 'Tokyo', profession: 'AI Researcher',
    company: 'DeepMind', linkedin_url: null, instagram_handle: null,
    bio: 'Working on alignment. The future is careful optimism.',
    interests: ['Technology', 'Science', 'Literature'],
    role: 'member', invite_code: null, invited_by: null, invite_count: 1,
    is_online: false, last_seen_at: daysAgo(0),
    onboarding_completed: true, created_at: daysAgo(20), updated_at: daysAgo(0),
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
    id: 'e1', title: 'Rooftop Supper Club',
    description: 'An intimate 12-seat dinner on a private Manhattan rooftop. Guest chef from Eleven Madison Park. Dress code: elegant casual.',
    event_type: 'in_person', location: 'The Ned NoMad, NYC', address: '1170 Broadway, New York, NY',
    virtual_link: null, cover_image_url: null,
    starts_at: daysFromNow(5), ends_at: hoursFromNow(5 * 24 + 3),
    capacity: 12, rsvp_count: 9, is_published: true,
    created_by: 'p1', created_at: daysAgo(7), updated_at: daysAgo(2),
  },
  {
    id: 'e2', title: 'Founders\' Fireside',
    description: 'Candid conversation with three founders who\'ve scaled past $100M. No slides, no pitches — just real talk over whiskey.',
    event_type: 'in_person', location: 'Soho House, London', address: '76 Dean Street, London W1',
    virtual_link: null, cover_image_url: null,
    starts_at: daysFromNow(12), ends_at: hoursFromNow(12 * 24 + 2),
    capacity: 30, rsvp_count: 22, is_published: true,
    created_by: 'p2', created_at: daysAgo(5), updated_at: daysAgo(1),
  },
  {
    id: 'e3', title: 'Gallery Walk — Emerging Artists',
    description: 'Private viewing of five emerging artists before their public debut. Champagne reception, curator-led tour.',
    event_type: 'in_person', location: 'Vasquez Contemporary, Miami',
    address: '318 NW 23rd St, Miami, FL', virtual_link: null, cover_image_url: null,
    starts_at: daysFromNow(18), ends_at: hoursFromNow(18 * 24 + 2),
    capacity: 40, rsvp_count: 31, is_published: true,
    created_by: 'p7', created_at: daysAgo(10), updated_at: daysAgo(3),
  },
  {
    id: 'e4', title: 'AI × Creativity — Virtual Panel',
    description: 'How is AI reshaping creative work? A cross-disciplinary conversation with artists, engineers, and writers.',
    event_type: 'virtual', location: null, address: null,
    virtual_link: 'https://meet.velvet.club/ai-creativity',
    cover_image_url: null,
    starts_at: daysFromNow(8), ends_at: hoursFromNow(8 * 24 + 1.5),
    capacity: 100, rsvp_count: 67, is_published: true,
    created_by: 'p8', created_at: daysAgo(3), updated_at: daysAgo(0),
  },
]

// ─── Conversations ─────────────────────────────────────────────────────────────

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1', member_1_id: DEMO_USER_ID, member_2_id: 'p1',
    last_message: 'Would love to meet at the supper club next week!',
    last_message_at: hoursFromNow(-2), created_at: daysAgo(10),
    other_member: MOCK_PROFILES[0], unread_count: 1,
  },
  {
    id: 'c2', member_1_id: DEMO_USER_ID, member_2_id: 'p3',
    last_message: 'Your documentary was incredible. Let\'s grab coffee.',
    last_message_at: hoursFromNow(-8), created_at: daysAgo(6),
    other_member: MOCK_PROFILES[2], unread_count: 0,
  },
  {
    id: 'c3', member_1_id: 'p5', member_2_id: DEMO_USER_ID,
    last_message: 'Sent you the playlist ✨',
    last_message_at: daysAgo(1), created_at: daysAgo(4),
    other_member: MOCK_PROFILES[4], unread_count: 2,
  },
  {
    id: 'c4', member_1_id: DEMO_USER_ID, member_2_id: 'p7',
    last_message: 'See you at the gallery opening!',
    last_message_at: daysAgo(2), created_at: daysAgo(8),
    other_member: MOCK_PROFILES[6], unread_count: 0,
  },
]

// ─── Messages (for a specific conversation) ────────────────────────────────────

export function getMockMessages(conversationId: string): Message[] {
  if (conversationId === 'c1') {
    return [
      { id: 'm1', conversation_id: 'c1', sender_id: DEMO_USER_ID, content: 'Hey Sophia! Loved your talk at the last event.', is_read: true, created_at: daysAgo(3) },
      { id: 'm2', conversation_id: 'c1', sender_id: 'p1', content: 'Thank you! It was such an engaged crowd.', is_read: true, created_at: daysAgo(3) },
      { id: 'm3', conversation_id: 'c1', sender_id: 'p1', content: 'Are you going to the rooftop supper club?', is_read: true, created_at: daysAgo(2) },
      { id: 'm4', conversation_id: 'c1', sender_id: DEMO_USER_ID, content: 'Absolutely — already RSVP\'d!', is_read: true, created_at: daysAgo(2) },
      { id: 'm5', conversation_id: 'c1', sender_id: 'p1', content: 'Would love to meet at the supper club next week!', is_read: false, created_at: hoursFromNow(-2) },
    ]
  }
  if (conversationId === 'c2') {
    return [
      { id: 'm6', conversation_id: 'c2', sender_id: DEMO_USER_ID, content: 'Amara — just watched your Sundance piece. Phenomenal work.', is_read: true, created_at: daysAgo(5) },
      { id: 'm7', conversation_id: 'c2', sender_id: 'p3', content: 'That means so much, thank you 🙏', is_read: true, created_at: daysAgo(5) },
      { id: 'm8', conversation_id: 'c2', sender_id: DEMO_USER_ID, content: 'Your documentary was incredible. Let\'s grab coffee.', is_read: true, created_at: hoursFromNow(-8) },
    ]
  }
  return [
    { id: `m-${conversationId}-1`, conversation_id: conversationId, sender_id: DEMO_USER_ID, content: 'Hey! Great to connect.', is_read: true, created_at: daysAgo(3) },
    { id: `m-${conversationId}-2`, conversation_id: conversationId, sender_id: 'p5', content: 'Likewise! Looking forward to the next event.', is_read: true, created_at: daysAgo(2) },
  ]
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
    id: 'i1', code: 'VELVET-A7K2', created_by: DEMO_USER_ID,
    used_by: 'p5', used_at: daysAgo(3), expires_at: daysFromNow(30),
    created_at: daysAgo(10), used_by_profile: MOCK_PROFILES[4],
  },
  {
    id: 'i2', code: 'VELVET-M9P4', created_by: DEMO_USER_ID,
    used_by: null, used_at: null, expires_at: daysFromNow(20),
    created_at: daysAgo(5),
  },
  {
    id: 'i3', code: 'VELVET-X3L8', created_by: DEMO_USER_ID,
    used_by: null, used_at: null, expires_at: daysFromNow(25),
    created_at: daysAgo(2),
  },
]

// ─── Admin stats ───────────────────────────────────────────────────────────────

export const MOCK_ADMIN_STATS = {
  pendingApplications: 7,
  totalMembers: 142,
  eventsThisMonth: 4,
  messagesToday: 38,
}
