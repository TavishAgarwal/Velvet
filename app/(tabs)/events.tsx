import React from 'react'
import { View, FlatList, StyleSheet, Pressable } from 'react-native'
import { router, Redirect } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { SkeletonCard } from '@/components/ui/SkeletonLoader'
import { useEvents } from '@/hooks/useEvents'
import { ErrorState } from '@/components/ui/ErrorState'
import { ACCENT, ACCENT_DIM, BG_BASE } from '@/lib/theme'
import { formatEventDate, formatDateBadge } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import type { Event } from '@/types'

export default function EventsScreen() {
  const insets = useSafeAreaInsets()
  const { isSigningOut } = useAuth()
  const { data: events, isLoading, isError, error, refetch } = useEvents()

  if (isSigningOut) {
    return <Redirect href="/" />
  }

  const renderEvent = ({ item }: { item: Event }) => {
    const badge = formatDateBadge(item.starts_at)
    return (
      <Pressable onPress={() => router.push(`/event/${item.id}`)} style={{ paddingHorizontal: 16, marginBottom: 12 }}>
        <Card>
          <View style={s.eventRow}>
            <View style={s.dateBadge}>
              <Text variant="caption" color="accent" style={{ fontWeight: '700', fontSize: 10 }}>{badge.month}</Text>
              <Text variant="h2" color="primary">{badge.day}</Text>
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text variant="body" color="primary" style={{ fontWeight: '600' }}>{item.title}</Text>
              <Text variant="bodySm" color="secondary">{formatEventDate(item.starts_at)}</Text>
              <View style={s.metaRow}>
                <StatusBadge variant={item.event_type} />
                <Text variant="caption" color="tertiary">{item.rsvp_count} going</Text>
                {item.capacity && (
                  <Text variant="caption" color="tertiary">· {item.capacity - item.rsvp_count} spots left</Text>
                )}
              </View>
            </View>
          </View>
        </Card>
      </Pressable>
    )
  }

  return (
    <View style={[s.root, { paddingTop: insets.top + 12 }]}>
      <View style={s.header}>
        <Text variant="label" uppercase color="accent">Calendar</Text>
        <Text variant="h1" color="primary">Events</Text>
      </View>
      {isLoading ? (
        <View style={{ paddingHorizontal: 16, gap: 10 }}>
          {[1,2,3].map(i => <SkeletonCard key={i} />)}
        </View>
      ) : isError ? (
        <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />
      ) : (
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={renderEvent}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text variant="body" color="secondary" align="center">No upcoming events</Text>
          </View>
        }
      />
      )}
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG_BASE },
  header: { paddingHorizontal: 24, marginBottom: 16, gap: 2 },
  eventRow: { flexDirection: 'row', gap: 14 },
  dateBadge: {
    width: 48, height: 56, borderRadius: 12,
    backgroundColor: ACCENT_DIM,
    alignItems: 'center', justifyContent: 'center',
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  empty: { padding: 40, alignItems: 'center' },
})
