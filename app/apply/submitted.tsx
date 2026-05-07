import React, { useEffect, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated'
import { Text } from '@/components/ui/Text'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { ACCENT, ACCENT_DIM, BG_BASE } from '@/lib/theme'
import { APP_NAME } from '@/lib/constants'
import { GhostButton } from '@/components/ui/Button'
import { supabase, isSupabaseEnabled } from '@/lib/supabase'
import { appEvents } from '@/lib/events'
import { useAuth } from '@/contexts/AuthContext'

export default function SubmittedScreen() {
  const insets = useSafeAreaInsets()
  const { signOut } = useAuth()
  const [checking, setChecking] = useState(false)

  // Polling mechanism
  useEffect(() => {
    if (!isSupabaseEnabled) return

    const interval = setInterval(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) return
        
        const { data: appData } = await supabase
          .from('applications')
          .select('status')
          .eq('user_id', session.user.id)
          .single()
        
        if (appData?.status && appData.status !== 'pending') {
          appEvents.emit('applicationStatusChanged')
        }
      } catch (err) {
        // Silent catch for background polling
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])


  return (
    <View style={[s.root, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }]}>
      <Animated.View entering={FadeInUp.delay(100).springify()} style={s.iconWrap}>
        <Ionicons name="checkmark-circle" size={64} color={ACCENT} />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(250).springify()}>
        <Text variant="h1" color="primary" align="center">Application Received</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).springify()}>
        <Text variant="body" color="secondary" align="center" style={{ marginTop: 12, paddingHorizontal: 32 }}>
          Thank you for applying to {APP_NAME}. Our admissions team will review your application and get back to you within 48 hours.
        </Text>
      </Animated.View>

      <GoldDivider style={{ marginVertical: 32 }} />

      <Animated.View entering={FadeInDown.delay(550).springify()} style={s.infoBlock}>
        <View style={s.infoRow}>
          <Ionicons name="time-outline" size={18} color={ACCENT} />
          <Text variant="bodySm" color="secondary">Review takes 24–48 hours</Text>
        </View>
        <View style={s.infoRow}>
          <Ionicons name="mail-outline" size={18} color={ACCENT} />
          <Text variant="bodySm" color="secondary">You'll receive an email notification</Text>
        </View>
        <View style={s.infoRow}>
          <Ionicons name="shield-checkmark-outline" size={18} color={ACCENT} />
          <Text variant="bodySm" color="secondary">Referral codes improve your chances</Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(700).springify()} style={{ width: '100%', marginTop: 'auto' }}>
        <GhostButton 
          title="Sign Out" 
          onPress={signOut} 
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
  infoBlock: {
    gap: 16,
    alignItems: 'flex-start',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
})
