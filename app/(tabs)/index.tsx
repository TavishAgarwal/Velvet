import React from 'react'
import { View, ScrollView, StyleSheet, Pressable } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { SkeletonLoader, SkeletonCard } from '@/components/ui/SkeletonLoader'
import { ACCENT, ACCENT_DIM, BG_BASE } from '@/lib/theme'
import { APP_NAME } from '@/lib/constants'
import { getGreeting, formatEventDate } from '@/lib/utils'
import { useMembers } from '@/hooks/useMembers'
import { useEvents } from '@/hooks/useEvents'

export default function HomeScreen() {
  const insets = useSafeAreaInsets()
  const greeting = getGreeting()
  const { data: members, isLoading: membersLoading } = useMembers()
  const { data: events, isLoading: eventsLoading } = useEvents()

  const newMembers = members?.slice(0, 5) ?? []
  const upcomingEvents = events?.slice(0, 2) ?? []

  // Dynamic stats
  const memberCount = members?.length ?? 0
  const cityCount = new Set(members?.map(m => m.city).filter(Boolean)).size
  const eventCount = events?.length ?? 0

  return (
    <ScrollView style={s.root} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 }}>
      <View style={s.header}>
        <Text variant="label" uppercase color="accent">{APP_NAME}</Text>
        <Text variant="h1" color="primary">{greeting}</Text>
      </View>

      {/* New Members */}
      <View style={s.section}>
        <Text variant="label" uppercase color="secondary" style={s.sectionLabel}>New Members</Text>
        {membersLoading ? (
          <View style={{ flexDirection: 'row', paddingLeft: 8, gap: 16 }}>
            {[1,2,3,4,5].map(i => (
              <View key={i} style={{ alignItems: 'center', width: 64, gap: 6 }}>
                <SkeletonLoader width={48} height={48} borderRadius={24} />
                <SkeletonLoader width={48} height={10} />
              </View>
            ))}
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.memberRow}>
            {newMembers.map(m => (
              <Pressable key={m.id} onPress={() => router.push(`/member/${m.id}`)} style={s.memberChip}>
                <Avatar url={m.avatar_url} name={m.display_name} size="md" showOnline isOnline={m.is_online} />
                <Text variant="caption" color="primary" style={{ marginTop: 4, fontWeight: '500' }} numberOfLines={1}>
                  {m.display_name?.split(' ')[0]}
                </Text>
                <Text variant="caption" color="tertiary" numberOfLines={1}>{m.city}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>

      <GoldDivider />

      {/* Upcoming Events */}
      <View style={s.section}>
        <Text variant="label" uppercase color="secondary" style={s.sectionLabel}>Upcoming Events</Text>
        {eventsLoading ? (
          <View style={{ gap: 10 }}>
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : (
          upcomingEvents.map(event => (
            <Pressable key={event.id} onPress={() => router.push(`/event/${event.id}`)} style={{ marginBottom: 10 }}>
              <Card>
                <View style={s.eventRow}>
                  <View style={s.eventIcon}>
                    <Ionicons name={event.event_type === 'virtual' ? 'videocam-outline' : 'location-outline'} size={18} color={ACCENT} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="body" color="primary" style={{ fontWeight: '600' }}>{event.title}</Text>
                    <Text variant="bodySm" color="secondary">{formatEventDate(event.starts_at)}</Text>
                    <Text variant="caption" color="tertiary">{event.rsvp_count} attending · {event.location}</Text>
                  </View>
                </View>
              </Card>
            </Pressable>
          ))
        )}
      </View>

      <GoldDivider />

      {/* Quick Stats */}
      <View style={s.section}>
        <Text variant="label" uppercase color="secondary" style={s.sectionLabel}>The Circle</Text>
        <View style={s.statsRow}>
          <View style={s.statItem}>
            <Text variant="h1" color="accent">{memberCount}</Text>
            <Text variant="caption" color="secondary">Members</Text>
          </View>
          <View style={s.statItem}>
            <Text variant="h1" color="accent">{cityCount}</Text>
            <Text variant="caption" color="secondary">Cities</Text>
          </View>
          <View style={s.statItem}>
            <Text variant="h1" color="accent">{eventCount}</Text>
            <Text variant="caption" color="secondary">Events</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG_BASE },
  header: { paddingHorizontal: 24, marginBottom: 24, gap: 4 },
  section: { paddingHorizontal: 16 },
  sectionLabel: { marginLeft: 8, marginBottom: 12 },
  memberRow: { paddingLeft: 8, paddingRight: 16, gap: 16 },
  memberChip: { alignItems: 'center', width: 64 },
  eventRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  eventIcon: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: ACCENT_DIM,
    alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 16 },
  statItem: { alignItems: 'center', gap: 4 },
})

