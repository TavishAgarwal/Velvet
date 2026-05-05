import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, isSupabaseEnabled } from '@/lib/supabase'
import type { Message } from '@/types'

export function useMessages(conversationId: string) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async (): Promise<Message[]> => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data as Message[]
    },
    enabled: isSupabaseEnabled && !!conversationId,
  })

  // Subscribe to real-time inserts on this conversation
  useEffect(() => {
    if (!isSupabaseEnabled || !conversationId) return

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message
          queryClient.setQueryData<Message[]>(
            ['messages', conversationId],
            (old = []) => {
              // Avoid duplicates
              if (old.some(m => m.id === newMessage.id)) return old
              return [...old, newMessage]
            }
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, queryClient])

  return query
}

export async function sendMessage(conversationId: string, senderId: string, content: string) {
  if (!isSupabaseEnabled) return
  const { error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: senderId,
    content,
  })
  if (error) throw error
}
