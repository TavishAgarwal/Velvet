import { useQuery } from '@tanstack/react-query'
import { supabase, isSupabaseEnabled } from '@/lib/supabase'

interface AdminStats {
  pendingApplications: number
  totalMembers: number
  eventsThisMonth: number
  messagesToday: number
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async (): Promise<AdminStats> => {
      const [apps, members, events, messages] = await Promise.all([
        supabase
          .from('applications')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending'),
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'member'),
        supabase
          .from('events')
          .select('id', { count: 'exact', head: true })
          .gte('starts_at', new Date().toISOString())
          .lte('starts_at', new Date(Date.now() + 30 * 86400000).toISOString()),
        supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', new Date(Date.now() - 86400000).toISOString()),
      ])

      return {
        pendingApplications: apps.count ?? 0,
        totalMembers: members.count ?? 0,
        eventsThisMonth: events.count ?? 0,
        messagesToday: messages.count ?? 0,
      }
    },
    enabled: isSupabaseEnabled,
  })
}
