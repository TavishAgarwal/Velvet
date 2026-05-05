import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, isSupabaseEnabled } from '@/lib/supabase'
import type { EventRsvp } from '@/types'

export function useEventRsvp(eventId: string) {
  return useQuery({
    queryKey: ['event-rsvp', eventId],
    queryFn: async (): Promise<EventRsvp | null> => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('event_rsvps')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .maybeSingle()
      if (error) throw error
      return data as EventRsvp | null
    },
    enabled: isSupabaseEnabled && !!eventId,
  })
}

export function useRsvpActions(eventId: string) {
  const queryClient = useQueryClient()

  const rsvp = async (status: 'going' | 'maybe' | 'not_going' = 'going') => {
    if (!isSupabaseEnabled) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('event_rsvps')
      .upsert(
        { event_id: eventId, user_id: user.id, status },
        { onConflict: 'event_id,user_id' }
      )
    if (error) throw error

    queryClient.invalidateQueries({ queryKey: ['event-rsvp', eventId] })
    queryClient.invalidateQueries({ queryKey: ['event', eventId] })
  }

  const cancelRsvp = async () => {
    if (!isSupabaseEnabled) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('event_rsvps')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', user.id)

    queryClient.invalidateQueries({ queryKey: ['event-rsvp', eventId] })
    queryClient.invalidateQueries({ queryKey: ['event', eventId] })
  }

  return { rsvp, cancelRsvp }
}
