import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { GhostButton } from '@/components/ui/Button'
import { ERROR, BG_BASE } from '@/lib/theme'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

/**
 * Reusable error state — shows an error icon, message, and optional retry button.
 * Use this on every list/detail screen that fetches data from Supabase.
 */
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View style={s.root}>
      <Ionicons name="alert-circle-outline" size={44} color={ERROR} />
      <Text variant="body" color="secondary" align="center" style={{ marginTop: 14 }}>
        Something went wrong
      </Text>
      <Text variant="bodySm" color="tertiary" align="center" style={{ marginTop: 4, maxWidth: 260 }}>
        {message ?? 'Please try again later.'}
      </Text>
      {onRetry && (
        <GhostButton title="Retry" onPress={onRetry} style={{ marginTop: 16 }} />
      )}
    </View>
  )
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    paddingTop: 80,
  },
})
