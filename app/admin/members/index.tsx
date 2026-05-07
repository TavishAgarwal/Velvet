import React, { useState } from 'react'
import { View, FlatList, StyleSheet, Pressable } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { TextInputField } from '@/components/ui/TextInputField'
import { SkeletonCard } from '@/components/ui/SkeletonLoader'
import { ErrorState } from '@/components/ui/ErrorState'
import { ACCENT, ACCENT_DIM, BG_BASE, TEXT_TERTIARY } from '@/lib/theme'
import { useMembers } from '@/hooks/useMembers'
import type { Profile } from '@/types'

export default function AdminMembersScreen() {
  const insets = useSafeAreaInsets()
  const [search, setSearch] = useState('')
  const { data: members, isLoading, isError, error, refetch } = useMembers(search)

  const renderItem = ({ item }: { item: Profile }) => (
    <Pressable
      onPress={() => router.push(`/member/${item.id}`)}
      style={({ pressed }) => [s.memberRow, pressed && { opacity: 0.7 }]}
    >
      <Avatar url={item.avatar_url} name={item.display_name} size="md" showOnline isOnline={item.is_online} />
      <View style={s.memberInfo}>
        <Text variant="body" color="primary" style={{ fontWeight: '600' }}>{item.display_name}</Text>
        <Text variant="bodySm" color="secondary">
          {item.profession}{item.company ? ` at ${item.company}` : ''}
        </Text>
        <Text variant="caption" color="tertiary">{item.city}</Text>
      </View>
      <StatusBadge variant={item.role === 'admin' ? 'admin' : 'member'} />
    </Pressable>
  )

  return (
    <View style={[s.root, { paddingTop: insets.top + 12 }]}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text variant="h1" color="primary" style={{ marginTop: 8 }}>Members</Text>
        <Text variant="bodySm" color="secondary" style={{ marginTop: 4 }}>
          {members?.length ?? 0} total members
        </Text>
      </View>

      <View style={s.searchWrap}>
        <TextInputField
          placeholder="Search by name, profession, or city…"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {isLoading ? (
        <View style={{ paddingHorizontal: 16, gap: 10 }}>
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </View>
      ) : isError ? (
        <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 20 }}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="people-outline" size={48} color={TEXT_TERTIARY} />
              <Text variant="body" color="tertiary" style={{ marginTop: 12 }}>
                {search ? 'No members match your search' : 'No members found'}
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
  header: { paddingHorizontal: 24, marginBottom: 12 },
  searchWrap: { paddingHorizontal: 16, marginBottom: 12 },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  memberInfo: { flex: 1, gap: 2 },
  empty: { alignItems: 'center', paddingTop: 80 },
})
