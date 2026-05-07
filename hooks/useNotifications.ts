import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, isSupabaseEnabled } from '@/lib/supabase'
import { MOCK_NOTIFICATIONS } from '@/lib/mockData'
import type { Notification } from '@/types'

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async (): Promise<Notification[]> => {
      if (!isSupabaseEnabled) return MOCK_NOTIFICATIONS

      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return MOCK_NOTIFICATIONS

        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50)
        if (error) throw error
        if (!data || data.length === 0) return MOCK_NOTIFICATIONS
        return data as Notification[]
      } catch {
        return MOCK_NOTIFICATIONS
      }
    },
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return async (notificationId: string) => {
    if (!isSupabaseEnabled) {
      // Optimistically update mock data in cache
      queryClient.setQueryData<Notification[]>(['notifications'], (old = []) =>
        old.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      )
      return
    }

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    queryClient.invalidateQueries({ queryKey: ['notifications'] })
  }
}
