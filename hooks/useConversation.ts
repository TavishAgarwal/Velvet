import { useQuery } from '@tanstack/react-query'
import { supabase, isSupabaseEnabled } from '@/lib/supabase'
import { MOCK_CONVERSATIONS } from '@/lib/mockData'
import type { Conversation } from '@/types'

/**
 * Fetch a single conversation by its ID, including the other member's profile.
 */
export function useConversation(conversationId: string) {
  return useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async (): Promise<Conversation | null> => {
      if (!isSupabaseEnabled) {
        return MOCK_CONVERSATIONS.find(c => c.id === conversationId) ?? null
      }

      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          return MOCK_CONVERSATIONS.find(c => c.id === conversationId) ?? null
        }

        const { data, error } = await supabase
          .from('conversations')
          .select('*, member_1:profiles!conversations_member_1_id_fkey(*), member_2:profiles!conversations_member_2_id_fkey(*)')
          .eq('id', conversationId)
          .single()
        if (error) throw error

        return {
          ...data,
          other_member: data.member_1_id === user.id ? data.member_2 : data.member_1,
          member_1: undefined,
          member_2: undefined,
        } as Conversation
      } catch {
        return MOCK_CONVERSATIONS.find(c => c.id === conversationId) ?? null
      }
    },
    enabled: !!conversationId,
  })
}

/**
 * Find or create a conversation between the current user and another member.
 * Returns the conversation ID.
 */
export async function ensureConversation(otherMemberId: string): Promise<string> {
  if (!isSupabaseEnabled) {
    // In demo mode, return first matching mock conversation or generate an ID
    const mock = MOCK_CONVERSATIONS.find(c =>
      c.member_2_id === otherMemberId || c.other_member?.id === otherMemberId
    )
    return mock?.id ?? `demo-conv-${otherMemberId}`
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Check for existing conversation (current user could be member_1 or member_2)
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .or(
      `and(member_1_id.eq.${user.id},member_2_id.eq.${otherMemberId}),and(member_1_id.eq.${otherMemberId},member_2_id.eq.${user.id})`
    )
    .maybeSingle()

  if (existing) return existing.id

  // Create a new conversation
  const { data: created, error } = await supabase
    .from('conversations')
    .insert({
      member_1_id: user.id,
      member_2_id: otherMemberId,
    })
    .select('id')
    .single()

  if (error) throw error
  return created.id
}
