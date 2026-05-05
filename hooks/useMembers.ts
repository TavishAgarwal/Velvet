import { useQuery } from '@tanstack/react-query'
import { supabase, isSupabaseEnabled } from '@/lib/supabase'
import type { Profile } from '@/types'

export function useMembers(search?: string) {
  return useQuery({
    queryKey: ['members', search],
    queryFn: async (): Promise<Profile[]> => {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'member')
        .eq('onboarding_completed', true)
        .order('created_at', { ascending: false })

      if (search) {
        // Sanitize: strip PostgREST operator chars to prevent filter injection
        const sanitized = search.replace(/[,().]/g, '').substring(0, 100)
        query = query.or(`display_name.ilike.%${sanitized}%,profession.ilike.%${sanitized}%,city.ilike.%${sanitized}%`)
      }

      const { data, error } = await query
      if (error) throw error
      return data as Profile[]
    },
    enabled: isSupabaseEnabled,
  })
}

export function useMember(id: string) {
  return useQuery({
    queryKey: ['member', id],
    queryFn: async (): Promise<Profile> => {
      const { data, error } = await supabase
        .from('profiles').select('*').eq('id', id).single()
      if (error) throw error
      return data as Profile
    },
    enabled: isSupabaseEnabled && !!id,
  })
}
