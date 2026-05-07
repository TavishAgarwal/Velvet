import { useQuery } from '@tanstack/react-query'
import { supabase, isSupabaseEnabled } from '@/lib/supabase'
import { MOCK_INVITES } from '@/lib/mockData'
import type { Invite } from '@/types'

export function useInvites() {
  return useQuery({
    queryKey: ['invites'],
    queryFn: async (): Promise<Invite[]> => {
      if (!isSupabaseEnabled) return MOCK_INVITES

      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return MOCK_INVITES

        const { data, error } = await supabase
          .from('invites')
          .select('*, used_by_profile:profiles!invites_used_by_fkey(*)')
          .eq('created_by', user.id)
          .order('created_at', { ascending: false })
        if (error) throw error
        if (!data || data.length === 0) return MOCK_INVITES
        return data as Invite[]
      } catch {
        return MOCK_INVITES
      }
    },
  })
}
