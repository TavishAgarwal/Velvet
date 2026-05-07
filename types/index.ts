export interface Profile {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  city: string | null
  profession: string | null
  company: string | null
  linkedin_url: string | null
  instagram_handle: string | null
  bio: string | null
  interests?: string[]
  role: 'applicant' | 'pending' | 'member' | 'admin'
  invite_code: string | null
  invited_by: string | null
  invite_count: number
  is_online: boolean
  last_seen_at: string | null
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface Application {
  id: string
  user_id: string
  email: string
  full_name: string
  country: string | null
  city: string
  profession: string
  company: string | null
  linkedin_url: string | null
  instagram_handle: string | null
  what_you_bring: string | null
  why_join: string
  how_heard: string | null
  referral_code: string | null
  status: 'pending' | 'approved' | 'rejected' | 'waitlisted'
  admin_notes: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  profile?: Profile
}

export interface Event {
  id: string
  title: string
  description: string | null
  event_type: 'in_person' | 'virtual'
  location: string | null
  address: string | null
  virtual_link: string | null
  cover_image_url: string | null
  starts_at: string
  ends_at: string | null
  capacity: number | null
  max_guests?: number | null
  rsvp_count: number
  is_published: boolean
  created_by: string
  created_at: string
  updated_at?: string
}

export interface EventRsvp {
  id: string
  event_id: string
  user_id: string
  status: 'going' | 'maybe' | 'not_going'
  created_at: string
}

export interface Conversation {
  id: string
  member_1_id: string
  member_2_id: string
  last_message: string | null
  last_message_at: string | null
  created_at: string
  other_member?: Profile
  unread_count?: number
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
}

export interface Invite {
  id: string
  code: string
  created_by: string
  used_by: string | null
  used_at: string | null
  expires_at: string | null
  created_at: string
  used_by_profile?: Profile
}

export interface Notification {
  id: string
  user_id: string
  type: 'application_approved' | 'new_message' | 'event_reminder' | 'new_member' | 'invite_accepted' | 'application_rejected'
  title: string
  body: string | null
  data: Record<string, unknown> | null
  is_read: boolean
  created_at: string
}
