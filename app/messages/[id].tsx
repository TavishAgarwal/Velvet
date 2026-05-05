import React, { useState, useRef, useEffect } from 'react'
import { View, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Pressable } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Avatar } from '@/components/ui/Avatar'
import { TextInputField } from '@/components/ui/TextInputField'
import { ACCENT, ACCENT_DIM, BG_BASE, BG_SURFACE, BORDER_DEFAULT, TEXT_PRIMARY } from '@/lib/theme'
import { formatRelativeTime } from '@/lib/utils'
import { Fonts } from '@/lib/typography'
import { useMessages, sendMessage } from '@/hooks/useMessages'
import { useMember } from '@/hooks/useMembers'
import { useAuth } from '@/contexts/AuthContext'
import type { Message } from '@/types'

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const insets = useSafeAreaInsets()
  const [text, setText] = useState('')
  const flatListRef = useRef<FlatList>(null)

  const { profile } = useAuth()
  const currentUserId = profile?.id ?? ''
  const { data: messages = [] } = useMessages(id)
  const { data: otherMember } = useMember(id)

  const handleSend = async () => {
    if (!text.trim() || !profile) return
    try {
      await sendMessage(id, profile.id, text.trim())
      setText('')
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100)
    } catch (err) {
      console.warn('Failed to send message:', err)
    }
  }

  const renderMessage = ({ item }: { item: Message }) => {
    const isMine = item.sender_id === currentUserId
    return (
      <View style={[s.msgRow, isMine && s.msgRowMine]}>
        <View style={[s.bubble, isMine ? s.bubbleMine : s.bubbleTheirs]}>
          <Text variant="body" color={isMine ? 'inverse' : 'primary'}>{item.content}</Text>
          <Text variant="caption" color={isMine ? 'inverse' : 'tertiary'} style={{ marginTop: 4, opacity: 0.7, alignSelf: 'flex-end' }}>
            {formatRelativeTime(item.created_at)}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Pressable onPress={() => otherMember && router.push(`/member/${otherMember.id}`)} style={s.headerProfile}>
          <Avatar url={otherMember?.avatar_url} name={otherMember?.display_name} size="sm" showOnline isOnline={otherMember?.is_online} />
          <View>
            <Text variant="body" color="primary" style={{ fontWeight: '600' }}>{otherMember?.display_name ?? 'Loading…'}</Text>
            <Text variant="caption" color="tertiary">{otherMember?.is_online ? 'Online' : 'Offline'}</Text>
          </View>
        </Pressable>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={s.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={[s.inputBar, { paddingBottom: insets.bottom + 8 }]}>
          <View style={s.inputWrap}>
            <TextInputField
              placeholder="Type a message…"
              value={text}
              onChangeText={setText}
              style={{ flex: 1 }}
            />
          </View>
          <Pressable
            onPress={handleSend}
            style={[s.sendBtn, !text.trim() && { opacity: 0.4 }]}
            disabled={!text.trim()}
          >
            <Ionicons name="send" size={18} color={BG_BASE} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG_BASE },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: BORDER_DEFAULT,
    backgroundColor: BG_SURFACE,
  },
  headerProfile: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  messagesList: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  msgRow: { flexDirection: 'row', marginBottom: 4 },
  msgRowMine: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '78%', padding: 12, borderRadius: 18 },
  bubbleMine: {
    backgroundColor: ACCENT,
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: BG_SURFACE,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: BORDER_DEFAULT,
  },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    paddingHorizontal: 12, paddingTop: 8,
    borderTopWidth: 1, borderTopColor: BORDER_DEFAULT,
    backgroundColor: BG_SURFACE,
  },
  inputWrap: { flex: 1 },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: ACCENT,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 6,
  },
})
