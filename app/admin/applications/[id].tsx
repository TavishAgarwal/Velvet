import React, { useState } from 'react'
import { View, ScrollView, StyleSheet, Alert } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { GoldButton, GhostButton, Button } from '@/components/ui/Button'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { TextInputField } from '@/components/ui/TextInputField'
import { useApplication } from '@/hooks/useApplications'
import { SkeletonCard } from '@/components/ui/SkeletonLoader'
import { ErrorState } from '@/components/ui/ErrorState'
import { ACCENT, BG_BASE, ACCENT_DIM } from '@/lib/theme'
import { formatRelativeTime } from '@/lib/utils'
import { supabase, isSupabaseEnabled } from '@/lib/supabase'
import { queryClient } from '@/lib/queryClient'

export default function ApplicationDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const insets = useSafeAreaInsets()
  const { data: app, isLoading, isError, error, refetch } = useApplication(id)
  const [notes, setNotes] = useState('')
  const [acting, setActing] = useState(false)

  const handleAction = async (status: 'approved' | 'rejected') => {
    setActing(true)
    try {
      if (isSupabaseEnabled) {
        // Use server-side RPC — validates admin role, updates application + profile atomically
        const { error } = await supabase.rpc('review_application', {
          app_id: id,
          new_status: status,
          notes: notes || null,
        })
        if (error) throw error
      }
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['members'] })
      Alert.alert('Done', `Application ${status}`)
      router.back()
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Something went wrong')
    } finally {
      setActing(false)
    }
  }

  if (isLoading || !app) {
    return (
      <ScrollView style={s.root} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 }}>
        <View style={s.header}>
          <Ionicons name="arrow-back" size={24} color="#fff" onPress={() => router.back()} />
        </View>
        {isError ? (
          <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />
        ) : (
          <View style={{ paddingHorizontal: 24, gap: 12 }}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </View>
        )}
      </ScrollView>
    )
  }

  return (
    <ScrollView style={s.root} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 }}>
      <View style={s.header}>
        <Ionicons name="arrow-back" size={24} color="#fff" onPress={() => router.back()} />
        <StatusBadge variant={app.status} />
      </View>

      <View style={s.profileSection}>
        <Avatar name={app.full_name} size="lg" />
        <Text variant="h1" color="primary" style={{ marginTop: 12 }}>{app.full_name}</Text>
        <Text variant="body" color="secondary">
          {app.profession}{app.company ? ` at ${app.company}` : ''}
        </Text>
        <Text variant="bodySm" color="tertiary">{app.city} · Applied {formatRelativeTime(app.created_at)}</Text>
      </View>

      <GoldDivider />

      <View style={s.section}>
        <Text variant="label" uppercase color="accent" style={{ marginBottom: 8 }}>Why Velvet</Text>
        <Card>
          <Text variant="quote" color="primary" style={{ fontStyle: 'italic' }}>
            "{app.why_join}"
          </Text>
        </Card>
      </View>

      <View style={s.section}>
        <Text variant="label" uppercase color="accent" style={{ marginBottom: 8 }}>Details</Text>
        <Card>
          <DetailRow label="Email" value={app.email} />
          {app.linkedin_url && <DetailRow label="LinkedIn" value={app.linkedin_url} />}
          {app.instagram_handle && <DetailRow label="Instagram" value={`@${app.instagram_handle}`} />}
          {app.referral_code && <DetailRow label="Referral Code" value={app.referral_code} />}
        </Card>
      </View>

      {app.status === 'pending' && (
        <View style={s.section}>
          <Text variant="label" uppercase color="accent" style={{ marginBottom: 8 }}>Admin Notes</Text>
          <TextInputField
            placeholder="Internal notes (optional)"
            value={notes}
            onChangeText={setNotes}
            multiline
          />
          <View style={s.actions}>
            <GoldButton title="Approve" onPress={() => handleAction('approved')} loading={acting} fullWidth />
            <Button variant="destructive" title="Reject" onPress={() => handleAction('rejected')} loading={acting} fullWidth />
          </View>
        </View>
      )}
    </ScrollView>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.detailRow}>
      <Text variant="bodySm" color="tertiary" style={{ width: 100 }}>{label}</Text>
      <Text variant="bodySm" color="primary" style={{ flex: 1 }}>{value}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG_BASE },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, marginBottom: 16,
  },
  profileSection: { alignItems: 'center', paddingHorizontal: 24, gap: 4 },
  section: { paddingHorizontal: 24, marginTop: 8 },
  detailRow: { flexDirection: 'row', paddingVertical: 8, gap: 8 },
  actions: { marginTop: 20, gap: 10 },
})
