import { useQuery } from '@tanstack/react-query'
import { supabase, isSupabaseEnabled } from '@/lib/supabase'
import type { Invite } from '@/types'

export function useInvites() {
  return useQuery({
    queryKey: ['invites'],
    queryFn: async (): Promise<Invite[]> => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('invites')
        .select('*, used_by_profile:profiles!invites_used_by_fkey(*)')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Invite[]
    },
    enabled: isSupabaseEnabled,
  })
}
