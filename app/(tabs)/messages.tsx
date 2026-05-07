import React from 'react'
import { View, FlatList, StyleSheet, Pressable } from 'react-native'
import { router, Redirect } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from '@/components/ui/Text'
import { Avatar } from '@/components/ui/Avatar'
import { SkeletonCard } from '@/components/ui/SkeletonLoader'
import { useConversations } from '@/hooks/useConversations'
import { ErrorState } from '@/components/ui/ErrorState'
import { BG_BASE, BORDER_DEFAULT, ACCENT } from '@/lib/theme'
import { formatRelativeTime, truncate } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import type { Conversation } from '@/types'

import { Ionicons } from '@expo/vector-icons'

export default function MessagesScreen() {
  const insets = useSafeAreaInsets()
  const { isSigningOut } = useAuth()
  const { data: conversations, isLoading, isError, error, refetch } = useConversations()

  if (isSigningOut) {
    return <Redirect href="/" />
  }

  const renderConversation = ({ item }: { item: Conversation }) => (
    <Pressable
      onPress={() => router.push(`/messages/${item.id}`)}
      style={({ pressed }) => [s.row, pressed && { opacity: 0.7 }]}
    >
      <Avatar
        url={item.other_member?.avatar_url}
        name={item.other_member?.display_name}
        size="md"
      />
      <View style={s.content}>
        <View style={s.topRow}>
          <Text variant="body" color="primary" style={{ fontWeight: '600', flex: 1 }} numberOfLines={1}>
            {item.other_member?.display_name ?? 'Unknown'}
          </Text>
          <Text variant="caption" color="tertiary">{formatRelativeTime(item.last_message_at)}</Text>
        </View>
        <Text
          variant="bodySm"
          color={item.unread_count ? 'primary' : 'secondary'}
          numberOfLines={1}
          style={item.unread_count ? { fontWeight: '500' } : undefined}
        >
          {truncate(item.last_message, 50)}
        </Text>
      </View>
      {!!item.unread_count && item.unread_count > 0 && (
        <View style={s.badge}>
          <Text variant="caption" color="inverse" style={{ fontWeight: '700', fontSize: 10 }}>
            {item.unread_count}
          </Text>
        </View>
      )}
    </Pressable>
  )

  return (
    <View style={[s.root, { paddingTop: insets.top + 12 }]}>
      <View style={s.header}>
        <Text variant="label" uppercase color="accent">Inbox</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text variant="h1" color="primary">Messages</Text>
          <Pressable onPress={() => router.push('/messages/new')} hitSlop={12} style={{ padding: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 20 }}>
            <Ionicons name="add" size={24} color="#fff" />
          </Pressable>
        </View>
      </View>
      {isLoading ? (
        <View style={{ paddingHorizontal: 16, gap: 10, paddingTop: 8 }}>
          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
        </View>
      ) : isError ? (
        <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />
      ) : (
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderConversation}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text variant="body" color="secondary" align="center">No conversations yet</Text>
            <Text variant="bodySm" color="tertiary" align="center" style={{ marginTop: 4 }}>
              Start a conversation from a member's profile
            </Text>
          </View>
        }
      />
      )}
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG_BASE },
  header: { paddingHorizontal: 24, marginBottom: 12, gap: 2 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: BORDER_DEFAULT,
  },
  content: { flex: 1, gap: 3 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    backgroundColor: ACCENT, width: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  empty: { padding: 40, alignItems: 'center' },
})
