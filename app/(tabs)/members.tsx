import React, { useState } from 'react'
import { View, FlatList, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Pressable } from 'react-native'
import { Text } from '@/components/ui/Text'
import { Avatar } from '@/components/ui/Avatar'
import { TextInputField } from '@/components/ui/TextInputField'
import { SkeletonCard } from '@/components/ui/SkeletonLoader'
import { useMembers } from '@/hooks/useMembers'
import { ErrorState } from '@/components/ui/ErrorState'
import { ACCENT, BG_BASE, BORDER_DEFAULT } from '@/lib/theme'
import type { Profile } from '@/types'

export default function MembersScreen() {
  const insets = useSafeAreaInsets()
  const [search, setSearch] = useState('')
  const { data: members, isLoading, isError, error, refetch } = useMembers(search || undefined)

  const renderMember = ({ item }: { item: Profile }) => (
    <Pressable
      onPress={() => router.push(`/member/${item.id}`)}
      style={({ pressed }) => [s.memberRow, pressed && { opacity: 0.7 }]}
    >
      <Avatar url={item.avatar_url} name={item.display_name} size="md" />
      <View style={s.memberInfo}>
        <Text variant="body" color="primary" style={{ fontWeight: '600' }}>{item.display_name}</Text>
        <Text variant="bodySm" color="secondary">
          {item.profession}{item.company ? ` · ${item.company}` : ''}
        </Text>
        <Text variant="caption" color="tertiary">{item.city}</Text>
      </View>
    </Pressable>
  )

  return (
    <View style={[s.root, { paddingTop: insets.top + 12 }]}>
      <View style={s.header}>
        <Text variant="label" uppercase color="accent">Network</Text>
        <Text variant="h1" color="primary">Members</Text>
      </View>

      <View style={s.searchWrap}>
        <TextInputField
          placeholder="Search by name, role, or city…"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {isLoading ? (
        <View style={{ paddingHorizontal: 16, gap: 10 }}>
          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
        </View>
      ) : isError ? (
        <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item) => item.id}
          renderItem={renderMember}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text variant="body" color="secondary" align="center">No members found</Text>
            </View>
          }
        />
      )}
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG_BASE },
  header: { paddingHorizontal: 24, marginBottom: 12, gap: 2 },
  searchWrap: { paddingHorizontal: 16, marginBottom: 8 },
  memberRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 14, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: BORDER_DEFAULT,
  },
  memberInfo: { flex: 1, gap: 2 },
  empty: { padding: 40, alignItems: 'center' },
})
