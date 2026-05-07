import React, { useState } from 'react'
import { View, FlatList, StyleSheet, Pressable } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Avatar } from '@/components/ui/Avatar'
import { TextInputField } from '@/components/ui/TextInputField'
import { SkeletonCard } from '@/components/ui/SkeletonLoader'
import { ErrorState } from '@/components/ui/ErrorState'
import { useMembers } from '@/hooks/useMembers'
import { ensureConversation } from '@/hooks/useConversation'
import { ACCENT, BG_BASE, BORDER_DEFAULT, BG_SURFACE } from '@/lib/theme'
import type { Profile } from '@/types'

export default function NewMessageScreen() {
  const insets = useSafeAreaInsets()
  const [search, setSearch] = useState('')
  const { data: members, isLoading, isError, error, refetch } = useMembers(search || undefined)

  const handleSelectMember = async (member: Profile) => {
    try {
      const conversationId = await ensureConversation(member.id)
      router.replace(`/messages/${conversationId}`)
    } catch (err) {
      console.warn('Failed to open conversation:', err)
    }
  }

  const renderMember = ({ item }: { item: Profile }) => (
    <Pressable
      onPress={() => handleSelectMember(item)}
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
    <View style={[s.root, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text variant="body" color="primary" style={{ fontWeight: '600' }}>New Message</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={s.searchWrap}>
        <TextInputField
          placeholder="Search member to message…"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {isLoading ? (
        <View style={{ paddingHorizontal: 16, gap: 10, paddingTop: 16 }}>
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
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: BORDER_DEFAULT,
    backgroundColor: BG_SURFACE,
  },
  searchWrap: { paddingHorizontal: 16, paddingVertical: 12 },
  memberRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 14, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: BORDER_DEFAULT,
  },
  memberInfo: { flex: 1, gap: 2 },
  empty: { padding: 40, alignItems: 'center' },
})
