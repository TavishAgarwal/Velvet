import React from 'react'
import { View, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated'
import { Text } from '@/components/ui/Text'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { ACCENT, ACCENT_DIM, BG_BASE } from '@/lib/theme'
import { APP_NAME } from '@/lib/constants'
import { GhostButton } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'

export default function DeclinedScreen() {
  const insets = useSafeAreaInsets()

  return (
    <View style={[s.root, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }]}>
      <Animated.View entering={FadeInUp.delay(100).springify()} style={s.iconWrap}>
        <Ionicons name="close-circle" size={64} color={ACCENT} />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(250).springify()}>
        <Text variant="h1" color="primary" align="center">Application Update</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).springify()}>
        <Text variant="body" color="secondary" align="center" style={{ marginTop: 12, paddingHorizontal: 32 }}>
          Thank you for applying to {APP_NAME}. At this time, we are unable to offer you a membership.
        </Text>
      </Animated.View>

      <GoldDivider style={{ marginVertical: 32 }} />

      <Animated.View entering={FadeInDown.delay(550).springify()} style={{ width: '100%', paddingHorizontal: 32 }}>
        <GhostButton 
          title="Sign Out" 
          onPress={async () => {
            await supabase.auth.signOut()
            router.replace('/')
          }} 
          fullWidth 
        />
      </Animated.View>
    </View>
  )
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG_BASE,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: ACCENT_DIM,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
})
