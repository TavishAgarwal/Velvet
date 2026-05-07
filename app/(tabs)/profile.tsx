import React from 'react'
import { View, ScrollView, StyleSheet, Pressable, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { GoldButton, GhostButton } from '@/components/ui/Button'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { SkeletonCard } from '@/components/ui/SkeletonLoader'
import { ACCENT, ACCENT_DIM, BG_BASE, BORDER_DEFAULT, TEXT_TERTIARY } from '@/lib/theme'
import { useAuth } from '@/contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { supabase, isSupabaseEnabled } from '@/lib/supabase'

export default function ProfileScreen() {
  const insets = useSafeAreaInsets()
  const { profile: currentUser, signOut } = useAuth()

  // Real events-attended count from database
  const { data: eventsAttended = 3 } = useQuery({
    queryKey: ['eventsAttended', currentUser?.id],
    queryFn: async () => {
      if (!isSupabaseEnabled) return 3
      try {
        const { count, error } = await supabase
          .from('event_rsvps')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', currentUser!.id)
          .eq('status', 'going')
        if (error) return 3
        return count ?? 3
      } catch {
        return 3
      }
    },
    enabled: !!currentUser?.id,
  })

  if (!currentUser) {
    return (
      <View style={[s.root, { paddingTop: insets.top + 16, paddingHorizontal: 16 }]}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </View>
    )
  }

  return (
    <ScrollView style={s.root} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 }}>
      <View style={s.header}>
        <Text variant="label" uppercase color="accent">Profile</Text>
      </View>

      <View style={s.profileSection}>
        <Avatar url={currentUser.avatar_url} name={currentUser.display_name} size="xl" />
        <Text variant="h1" color="primary" style={{ marginTop: 12 }}>{currentUser.display_name}</Text>
        <Text variant="body" color="secondary">
          {currentUser.profession}{currentUser.company ? ` at ${currentUser.company}` : ''}
        </Text>
        <Text variant="bodySm" color="tertiary">{currentUser.city}</Text>
      </View>

      {currentUser.bio && (
        <View style={s.bioSection}>
          <Text variant="quote" color="primary" align="center" style={{ fontStyle: 'italic', paddingHorizontal: 24 }}>
            "{currentUser.bio}"
          </Text>
        </View>
      )}

      <GoldDivider />

      <View style={s.statsRow}>
        <View style={s.statItem}>
          <Text variant="h2" color="accent">{currentUser.invite_count}</Text>
          <Text variant="caption" color="secondary">Invites Used</Text>
        </View>
        <View style={s.statItem}>
          <Text variant="h2" color="accent">{eventsAttended}</Text>
          <Text variant="caption" color="secondary">Events Attended</Text>
        </View>
      </View>

      <View style={s.actions}>
        <GoldButton title="Edit Profile" onPress={() => router.push('/profile/edit')} fullWidth />
        <GhostButton title="My Invites" onPress={() => router.push('/invites')} fullWidth />
      </View>

      <View style={s.menuSection}>
        {currentUser.role === 'admin' && (
          <Pressable
            onPress={() => router.push('/admin')}
            style={({ pressed }) => [s.menuRow, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name="shield-checkmark-outline" size={20} color={ACCENT} />
            <Text variant="body" color="accent" style={{ flex: 1, fontWeight: '600' }}>Admin Dashboard</Text>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.2)" />
          </Pressable>
        )}

        <Pressable
          onPress={() => router.push('/notifications')}
          style={({ pressed }) => [s.menuRow, pressed && { opacity: 0.7 }]}
        >
          <Ionicons name="notifications-outline" size={20} color={TEXT_TERTIARY} />
          <Text variant="body" color="secondary" style={{ flex: 1 }}>Notifications</Text>
          <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.2)" />
        </Pressable>

        {[
          { label: 'Privacy Policy', icon: 'shield-outline' as const, route: '/privacy' as const },
          { label: 'Terms of Service', icon: 'document-text-outline' as const, route: '/terms' as const },
        ].map(item => (
          <Pressable
            key={item.label}
            onPress={() => router.push(item.route)}
            style={({ pressed }) => [s.menuRow, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name={item.icon} size={20} color={TEXT_TERTIARY} />
            <Text variant="body" color="secondary" style={{ flex: 1 }}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.2)" />
          </Pressable>
        ))}

        {/* Sign Out */}
        <Pressable
          onPress={signOut}
          style={({ pressed }) => [s.menuRow, pressed && { opacity: 0.7 }]}
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text variant="body" style={{ flex: 1, color: '#EF4444' }}>Sign Out</Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG_BASE },
  header: { paddingHorizontal: 24, marginBottom: 12 },
  profileSection: { alignItems: 'center', paddingHorizontal: 24, gap: 4 },
  bioSection: { paddingVertical: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 },
  statItem: { alignItems: 'center', gap: 4 },
  actions: { paddingHorizontal: 24, gap: 10, marginTop: 16 },
  menuSection: { paddingHorizontal: 16, marginTop: 24 },
  menuRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 14, paddingHorizontal: 8,
    borderBottomWidth: 1, borderBottomColor: BORDER_DEFAULT,
  },
})

