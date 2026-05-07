import React, { useEffect } from 'react'
import { View, ScrollView, StyleSheet, Pressable } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { StatCard } from '@/components/admin/StatCard'
import { Card } from '@/components/ui/Card'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { ACCENT, BG_BASE, ACCENT_DIM } from '@/lib/theme'
import { useAdminStats } from '@/hooks/useAdminStats'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

export default function AdminDashboard() {
  const insets = useSafeAreaInsets()
  const { profile } = useAuth()
  const { data: stats } = useAdminStats()

  // Guard: redirect non-admins away
  useEffect(() => {
    if (profile && profile.role !== 'admin') {
      router.replace('/(tabs)/home')
    }
  }, [profile])

  const menuItems = [
    { label: 'Application Queue', icon: 'documents-outline' as const, route: '/admin/applications' as const, count: stats?.pendingApplications },
    { label: 'Member Directory', icon: 'people-outline' as const, route: '/admin/members' as const },
    { label: 'Create Event', icon: 'calendar-outline' as const, route: '/admin/events/create' as const },
  ]

  return (
    <ScrollView style={s.root} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 }}>
      <View style={s.header}>
        <Text variant="label" uppercase color="accent">Admin</Text>
        <Text variant="h1" color="primary">Dashboard</Text>
      </View>

      <View style={s.statsGrid}>
        <View style={s.statsRow}>
          <StatCard label="Pending" value={stats?.pendingApplications ?? 0} highlight />
          <StatCard label="Members" value={stats?.totalMembers ?? 0} />
        </View>
        <View style={s.statsRow}>
          <StatCard label="Events" value={stats?.eventsThisMonth ?? 0} />
          <StatCard label="Messages" value={stats?.messagesToday ?? 0} />
        </View>
      </View>

      <GoldDivider />

      <View style={s.menuSection}>
        <Text variant="label" uppercase color="secondary" style={{ marginBottom: 12, marginLeft: 4 }}>
          Quick Actions
        </Text>
        {menuItems.map((item) => (
          <Pressable
            key={item.label}
            onPress={() => router.push(item.route)}
            style={({ pressed }) => [s.menuRow, pressed && { opacity: 0.7 }]}
          >
            <View style={s.menuIcon}>
              <Ionicons name={item.icon} size={20} color={ACCENT} />
            </View>
            <Text variant="body" color="primary" style={{ flex: 1, fontWeight: '500' }}>{item.label}</Text>
            {item.count !== undefined && (
              <View style={s.badge}>
                <Text variant="caption" color="inverse" style={{ fontWeight: '700', fontSize: 11 }}>{item.count}</Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
          </Pressable>
        ))}

        <GoldDivider style={{ marginVertical: 12 }} />

        <Pressable
          onPress={() => router.replace('/(tabs)/home')}
          style={({ pressed }) => [s.menuRow, pressed && { opacity: 0.7 }]}
        >
          <View style={s.menuIcon}>
            <Ionicons name="layers-outline" size={20} color={ACCENT} />
          </View>
          <Text variant="body" color="primary" style={{ flex: 1, fontWeight: '500' }}>Switch to Member View</Text>
          <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
        </Pressable>

        <Pressable
          onPress={async () => { await supabase.auth.signOut() }}
          style={({ pressed }) => [s.menuRow, pressed && { opacity: 0.7 }, { borderColor: '#401111', backgroundColor: '#200A0A' }]}
        >
          <View style={[s.menuIcon, { backgroundColor: '#401111' }]}>
            <Ionicons name="log-out-outline" size={20} color="#ff4444" />
          </View>
          <Text variant="body" style={{ flex: 1, fontWeight: '500', color: '#ff4444' }}>Log Out</Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG_BASE },
  header: { paddingHorizontal: 24, marginBottom: 20, gap: 4 },
  statsGrid: { paddingHorizontal: 16, gap: 10 },
  statsRow: { flexDirection: 'row', gap: 10 },
  menuSection: { paddingHorizontal: 16 },
  menuRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 16, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 8,
  },
  menuIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: ACCENT_DIM,
    alignItems: 'center', justifyContent: 'center',
  },
  badge: {
    backgroundColor: ACCENT,
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 10, marginRight: 4,
  },
})
