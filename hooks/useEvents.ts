import { useQuery } from '@tanstack/react-query'
import { supabase, isSupabaseEnabled } from '@/lib/supabase'
import { MOCK_EVENTS } from '@/lib/mockData'
import type { Event } from '@/types'

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: async (): Promise<Event[]> => {
      if (!isSupabaseEnabled) return MOCK_EVENTS

      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('is_published', true)
          .gte('starts_at', new Date().toISOString())
          .order('starts_at', { ascending: true })
        if (error) throw error
        return (data || []) as Event[]
      } catch {
        return MOCK_EVENTS
      }
    },
  })
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ['event', id],
    queryFn: async (): Promise<Event> => {
      if (!isSupabaseEnabled) {
        const mock = MOCK_EVENTS.find(e => e.id === id)
        if (mock) return mock
        throw new Error('Event not found')
      }

      try {
        const { data, error } = await supabase
          .from('events').select('*').eq('id', id).single()
        if (error) throw error
        return data as Event
      } catch {
        const mock = MOCK_EVENTS.find(e => e.id === id)
        if (mock) return mock
        throw new Error('Event not found')
      }
    },
    enabled: !!id,
  })
}
