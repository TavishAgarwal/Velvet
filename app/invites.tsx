import React, { useState } from 'react'
import { View, ScrollView, StyleSheet, Pressable, Alert, Share } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Clipboard from 'expo-clipboard'
import { Text } from '@/components/ui/Text'
import { Card } from '@/components/ui/Card'
import { GoldButton } from '@/components/ui/Button'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { SkeletonCard } from '@/components/ui/SkeletonLoader'
import { ACCENT, ACCENT_DIM, BG_BASE, BORDER_DEFAULT, TEXT_TERTIARY } from '@/lib/theme'
import { useInvites } from '@/hooks/useInvites'
import { ErrorState } from '@/components/ui/ErrorState'
import type { Invite } from '@/types'

export default function InvitesScreen() {
  const insets = useSafeAreaInsets()
  const { data: invites = [], isLoading, isError, error, refetch } = useInvites()
  const unusedInvites = invites.filter(i => !i.used_by)
  const usedInvites = invites.filter(i => !!i.used_by)

  const handleCopy = async (code: string) => {
    await Clipboard.setStringAsync(code)
    Alert.alert('Copied!', `Invite code ${code} copied to clipboard`)
  }

  const handleShare = async (code: string) => {
    try {
      await Share.share({
        message: `You've been invited to Velvet! Use code: ${code}\n\nhttps://velvet.app/apply?code=${code}`,
      })
    } catch {}
  }

  return (
    <ScrollView style={s.root} contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 40 }}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text variant="h1" color="primary" style={{ marginTop: 8 }}>My Invites</Text>
        <Text variant="bodySm" color="secondary" style={{ marginTop: 4 }}>
          {unusedInvites.length} invite{unusedInvites.length !== 1 ? 's' : ''} remaining
        </Text>
      </View>

      {isLoading ? (
        <View style={[s.section, { gap: 10 }]}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : isError ? (
        <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />
      ) : (
        <>
          {/* Unused invites */}
          {unusedInvites.length > 0 && (
            <View style={s.section}>
              <Text variant="label" uppercase color="accent" style={{ marginBottom: 10 }}>Available</Text>
              {unusedInvites.map(invite => (
                <Card key={invite.id} style={{ marginBottom: 10 }}>
                  <View style={s.codeRow}>
                    <View style={s.codeBadge}>
                      <Text variant="body" color="accent" style={{ fontWeight: '700', letterSpacing: 2 }}>
                        {invite.code}
                      </Text>
                    </View>
                    <Pressable onPress={() => handleCopy(invite.code)} hitSlop={8}>
                      <Ionicons name="copy-outline" size={20} color={TEXT_TERTIARY} />
                    </Pressable>
                    <Pressable onPress={() => handleShare(invite.code)} hitSlop={8}>
                      <Ionicons name="share-outline" size={20} color={TEXT_TERTIARY} />
                    </Pressable>
                  </View>
                </Card>
              ))}
            </View>
          )}

          <GoldDivider />

          {/* Used invites */}
          {usedInvites.length > 0 && (
            <View style={s.section}>
              <Text variant="label" uppercase color="secondary" style={{ marginBottom: 10 }}>Used</Text>
              {usedInvites.map(invite => (
                <View key={invite.id} style={s.usedRow}>
                  <Text variant="bodySm" color="tertiary" style={{ letterSpacing: 1 }}>{invite.code}</Text>
                  <Text variant="caption" color="tertiary">Used</Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG_BASE },
  header: { paddingHorizontal: 24, marginBottom: 20 },
  section: { paddingHorizontal: 24 },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  codeBadge: {
    flex: 1, paddingVertical: 10, paddingHorizontal: 14,
    backgroundColor: ACCENT_DIM, borderRadius: 10,
    borderWidth: 1, borderColor: `${ACCENT}30`,
  },
  usedRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: BORDER_DEFAULT,
  },
})
