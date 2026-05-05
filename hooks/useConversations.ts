import { useQuery } from '@tanstack/react-query'
import { supabase, isSupabaseEnabled } from '@/lib/supabase'
import type { Conversation } from '@/types'

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async (): Promise<Conversation[]> => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('conversations')
        .select('*, member_1:profiles!conversations_member_1_id_fkey(*), member_2:profiles!conversations_member_2_id_fkey(*)')
        .or(`member_1_id.eq.${user.id},member_2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false })
      if (error) throw error

      // Post-process: set other_member to whichever member is NOT the current user
      return (data ?? []).map((conv: any) => ({
        ...conv,
        other_member: conv.member_1_id === user.id ? conv.member_2 : conv.member_1,
        member_1: undefined,
        member_2: undefined,
      })) as Conversation[]
    },
    enabled: isSupabaseEnabled,
  })
}
