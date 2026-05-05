import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, isSupabaseEnabled } from '@/lib/supabase'
import type { Notification } from '@/types'

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async (): Promise<Notification[]> => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      return data as Notification[]
    },
    enabled: isSupabaseEnabled,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return async (notificationId: string) => {
    if (!isSupabaseEnabled) return

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    queryClient.invalidateQueries({ queryKey: ['notifications'] })
  }
}
