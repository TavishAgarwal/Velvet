import { useQuery } from '@tanstack/react-query'
import { supabase, isSupabaseEnabled } from '@/lib/supabase'
import { MOCK_PROFILES } from '@/lib/mockData'
import { useAuth } from '@/contexts/AuthContext'
import type { Profile } from '@/types'

export function useMembers(search?: string) {
  const { profile } = useAuth()
  
  return useQuery({
    queryKey: ['members', search, profile?.id],
    queryFn: async (): Promise<Profile[]> => {
      if (!isSupabaseEnabled) {
        return filterBySearch(MOCK_PROFILES, search).filter(p => p.id !== profile?.id)
      }

      try {
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

        if (profile?.id) {
          query = query.neq('id', profile.id)
        }

        const { data, error } = await query
        if (error) throw error
        return (data || []) as Profile[]
      } catch {
        return filterBySearch(MOCK_PROFILES, search).filter(p => p.id !== profile?.id)
      }
    },
  })
}

export function useMember(id: string) {
  return useQuery({
    queryKey: ['member', id],
    queryFn: async (): Promise<Profile> => {
      if (!isSupabaseEnabled) {
        const mock = MOCK_PROFILES.find(p => p.id === id)
        if (mock) return mock
        throw new Error('Member not found')
      }

      try {
        const { data, error } = await supabase
          .from('profiles').select('*').eq('id', id).single()
        if (error) throw error
        return data as Profile
      } catch {
        const mock = MOCK_PROFILES.find(p => p.id === id)
        if (mock) return mock
        throw new Error('Member not found')
      }
    },
    enabled: !!id,
  })
}

function filterBySearch(profiles: Profile[], search?: string): Profile[] {
  if (!search) return profiles
  const q = search.toLowerCase()
  return profiles.filter(p =>
    p.display_name?.toLowerCase().includes(q) ||
    p.profession?.toLowerCase().includes(q) ||
    p.city?.toLowerCase().includes(q)
  )
}
