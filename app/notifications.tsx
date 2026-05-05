import React from 'react'
import { View, FlatList, StyleSheet, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Card } from '@/components/ui/Card'
import { SkeletonCard } from '@/components/ui/SkeletonLoader'
import { ACCENT, ACCENT_DIM, BG_BASE, BORDER_DEFAULT, TEXT_TERTIARY } from '@/lib/theme'
import { formatRelativeTime } from '@/lib/utils'
import { useNotifications, useMarkNotificationRead } from '@/hooks/useNotifications'
import type { Notification } from '@/types'

const ICON_MAP: Record<string, string> = {
  new_member: 'person-add',
  event_reminder: 'calendar',
  invite_accepted: 'checkmark-circle',
  new_message: 'chatbubble',
  application_approved: 'ribbon',
  application_rejected: 'close-circle',
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets()
  const { data: notifications, isLoading } = useNotifications()
  const markAsRead = useMarkNotificationRead()

  const handlePress = (item: Notification) => {
    if (!item.is_read) markAsRead(item.id)
  }
  const renderItem = ({ item }: { item: Notification }) => (
    <Card style={[s.notifCard, !item.is_read && s.unread].filter(Boolean) as any}>
      <View style={s.row}>
        <View style={[s.iconCircle, !item.is_read && s.iconCircleActive]}>
          <Ionicons
            name={(ICON_MAP[item.type] ?? 'notifications') as any}
            size={18}
            color={!item.is_read ? ACCENT : TEXT_TERTIARY}
          />
        </View>
        <View style={s.textCol}>
          <Text variant="body" color="primary" style={{ fontWeight: item.is_read ? '400' : '600' }}>
            {item.title}
          </Text>
          {item.body && (
            <Text variant="bodySm" color="secondary" numberOfLines={2} style={{ marginTop: 2 }}>
              {item.body}
            </Text>
          )}
          <Text variant="caption" color="tertiary" style={{ marginTop: 4 }}>
            {formatRelativeTime(item.created_at)}
          </Text>
        </View>
      </View>
    </Card>
  )

  return (
    <View style={[s.root, { paddingTop: insets.top + 12 }]}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text variant="h1" color="primary" style={{ marginTop: 8 }}>Notifications</Text>
      </View>

      {isLoading ? (
        <View style={s.list}>
          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
        </View>
      ) : (
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Pressable onPress={() => handlePress(item)}>
            {renderItem({ item })}
          </Pressable>
        )}
        contentContainerStyle={s.list}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="notifications-off-outline" size={48} color={TEXT_TERTIARY} />
            <Text variant="body" color="tertiary" style={{ marginTop: 12 }}>No notifications yet</Text>
          </View>
        }
      />
      )}
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG_BASE },
  header: { paddingHorizontal: 24, marginBottom: 16 },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  notifCard: { padding: 14 },
  unread: { borderLeftWidth: 3, borderLeftColor: ACCENT },
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  iconCircle: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: `${TEXT_TERTIARY}15`,
    alignItems: 'center', justifyContent: 'center',
  },
  iconCircleActive: { backgroundColor: ACCENT_DIM },
  textCol: { flex: 1 },
  empty: { alignItems: 'center', paddingTop: 80 },
})
