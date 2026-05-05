import React from 'react'
import { View, ScrollView, StyleSheet, Pressable, Alert } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { GoldButton, GhostButton } from '@/components/ui/Button'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { useEvent } from '@/hooks/useEvents'
import { useEventRsvp, useRsvpActions } from '@/hooks/useEventRsvp'
import { ACCENT, ACCENT_DIM, BG_BASE, TEXT_TERTIARY, ERROR } from '@/lib/theme'
import { formatEventDate } from '@/lib/utils'

export default function EventDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const insets = useSafeAreaInsets()
  const { data: event } = useEvent(id)
  const { data: rsvpData } = useEventRsvp(id)
  const { rsvp, cancelRsvp } = useRsvpActions(id)
  const rsvpd = rsvpData?.status === 'going'

  if (!event) return <View style={[s.root, { paddingTop: insets.top }]} />

  const spotsLeft = event.capacity ? event.capacity - event.rsvp_count : null

  const handleRsvp = async () => {
    try {
      await rsvp('going')
      Alert.alert('RSVP Confirmed', `You're going to ${event.title}!`)
    } catch (err) {
      Alert.alert('Error', 'Could not RSVP. Please try again.')
    }
  }

  return (
    <ScrollView style={s.root} contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 40 }}>
      <Pressable onPress={() => router.back()} style={s.backBtn} hitSlop={12}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </Pressable>

      <View style={s.heroSection}>
        <View style={s.heroBadge}>
          <Ionicons
            name={event.event_type === 'virtual' ? 'videocam' : 'location'}
            size={28}
            color={ACCENT}
          />
        </View>
        <StatusBadge variant={event.event_type} style={{ marginTop: 12 }} />
        <Text variant="h1" color="primary" align="center" style={{ marginTop: 8 }}>{event.title}</Text>
        <Text variant="body" color="secondary" align="center" style={{ marginTop: 4 }}>
          {formatEventDate(event.starts_at)}
        </Text>
      </View>

      <GoldDivider />

      <View style={s.section}>
        <Text variant="label" uppercase color="accent" style={{ marginBottom: 10 }}>Details</Text>
        <Card>
          <InfoRow icon="location-outline" value={event.location ?? 'TBA'} />
          {event.event_type === 'virtual' && event.virtual_link && (
            <InfoRow icon="link-outline" value="Join Link Available" />
          )}
          <InfoRow icon="people-outline" value={`${event.rsvp_count} attending${spotsLeft !== null ? ` · ${spotsLeft} spots left` : ''}`} />
          {event.max_guests && (
            <InfoRow icon="person-add-outline" value={`Up to ${event.max_guests} guests`} />
          )}
        </Card>
      </View>

      <View style={s.section}>
        <Text variant="label" uppercase color="accent" style={{ marginBottom: 10 }}>About This Event</Text>
        <Text variant="body" color="secondary" style={{ lineHeight: 24 }}>{event.description}</Text>
      </View>

      <View style={[s.footer, { paddingBottom: insets.bottom + 16 }]}>
        {rsvpd ? (
          <GhostButton title="✓ You're Going" onPress={() => {}} fullWidth disabled />
        ) : spotsLeft !== null && spotsLeft <= 0 ? (
          <GhostButton title="Event Full" onPress={() => {}} fullWidth disabled />
        ) : (
          <GoldButton title="RSVP — I'm Going" onPress={handleRsvp} fullWidth />
        )}
      </View>
    </ScrollView>
  )
}

function InfoRow({ icon, value }: { icon: string; value: string }) {
  return (
    <View style={s.infoRow}>
      <Ionicons name={icon as any} size={16} color={TEXT_TERTIARY} />
      <Text variant="bodySm" color="primary">{value}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG_BASE },
  backBtn: { paddingHorizontal: 24, paddingVertical: 8 },
  heroSection: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 12 },
  heroBadge: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: ACCENT_DIM,
    alignItems: 'center', justifyContent: 'center',
  },
  section: { paddingHorizontal: 24, marginTop: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  footer: { paddingHorizontal: 24, marginTop: 24 },
})
