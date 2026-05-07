import React, { useState } from 'react'
import { View, ScrollView, StyleSheet, Pressable } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { GoldButton, GhostButton } from '@/components/ui/Button'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { useMember } from '@/hooks/useMembers'
import { SkeletonCard } from '@/components/ui/SkeletonLoader'
import { ErrorState } from '@/components/ui/ErrorState'
import { ACCENT, ACCENT_DIM, BG_BASE, BORDER_DEFAULT, TEXT_TERTIARY } from '@/lib/theme'
import { ensureConversation } from '@/hooks/useConversation'

export default function MemberDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const insets = useSafeAreaInsets()
  const { data: member, isLoading, isError, error, refetch } = useMember(id)

  if (isLoading || !member) {
    return (
      <View style={[s.root, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} style={s.backBtn} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        {isError ? (
          <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />
        ) : (
          <View style={{ paddingHorizontal: 24, gap: 12, marginTop: 16 }}>
            <SkeletonCard />
            <SkeletonCard />
          </View>
        )}
      </View>
    )
  }

  return (
    <ScrollView style={s.root} contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 40 }}>
      {/* Back button */}
      <Pressable onPress={() => router.back()} style={s.backBtn} hitSlop={12}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </Pressable>

      {/* Profile header */}
      <View style={s.profileSection}>
        <Avatar url={member.avatar_url} name={member.display_name} size="xl" showOnline isOnline={member.is_online} />
        <Text variant="h1" color="primary" style={{ marginTop: 14 }}>{member.display_name}</Text>
        <Text variant="body" color="secondary">
          {member.profession}{member.company ? ` at ${member.company}` : ''}
        </Text>
        <Text variant="bodySm" color="tertiary">{member.city}</Text>
      </View>

      {member.bio && (
        <View style={s.bioWrap}>
          <Text variant="quote" color="primary" align="center" style={{ fontStyle: 'italic', paddingHorizontal: 24 }}>
            "{member.bio}"
          </Text>
        </View>
      )}

      <GoldDivider />

      {/* Actions */}
      <View style={s.actions}>
        <GoldButton
          title="Send Message"
          onPress={async () => {
            try {
              const conversationId = await ensureConversation(member.id)
              router.push(`/messages/${conversationId}`)
            } catch (err) {
              console.warn('Failed to open conversation:', err)
            }
          }}
          fullWidth
        />
      </View>

      {/* Details */}
      <View style={s.section}>
        <Text variant="label" uppercase color="accent" style={{ marginBottom: 10 }}>About</Text>
        <Card>
          <DetailRow icon="briefcase-outline" label="Profession" value={member.profession || '—'} />
          {member.company && <DetailRow icon="business-outline" label="Company" value={member.company} />}
          <DetailRow icon="location-outline" label="City" value={member.city || '—'} />
          {member.linkedin_url && <DetailRow icon="logo-linkedin" label="LinkedIn" value="View Profile" />}
          {member.instagram_handle && <DetailRow icon="logo-instagram" label="Instagram" value={`@${member.instagram_handle}`} />}
        </Card>
      </View>

      {/* Interests */}
      {member.interests && member.interests.length > 0 && (
        <View style={s.section}>
          <Text variant="label" uppercase color="accent" style={{ marginBottom: 10 }}>Interests</Text>
          <View style={s.tagsRow}>
            {member.interests.map((interest, i) => (
              <View key={i} style={s.tag}>
                <Text variant="caption" color="accent">{interest}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  )
}

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={s.detailRow}>
      <Ionicons name={icon as any} size={16} color={TEXT_TERTIARY} />
      <Text variant="bodySm" color="tertiary" style={{ width: 80 }}>{label}</Text>
      <Text variant="bodySm" color="primary" style={{ flex: 1 }}>{value}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG_BASE },
  backBtn: { paddingHorizontal: 24, paddingVertical: 8 },
  profileSection: { alignItems: 'center', paddingHorizontal: 24, gap: 4, marginTop: 8 },
  bioWrap: { paddingVertical: 20 },
  actions: { paddingHorizontal: 24, marginBottom: 16 },
  section: { paddingHorizontal: 24, marginTop: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    backgroundColor: ACCENT_DIM, borderWidth: 1, borderColor: `${ACCENT}30`,
  },
})
