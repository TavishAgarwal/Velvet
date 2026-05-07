import React, { useEffect, useState } from 'react'
import { View, StyleSheet, Platform } from 'react-native'
import { Stack, useNavigationContainerRef, useRouter, useSegments, useRootNavigationState } from 'expo-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import * as Sentry from '@sentry/react-native'

const routingInstrumentation = Sentry.reactNavigationIntegration()

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? '',
  environment: __DEV__ ? 'development' : 'production',
  enabled: !__DEV__ && !!process.env.EXPO_PUBLIC_SENTRY_DSN,
  integrations: [routingInstrumentation],
  tracesSampleRate: 0,
})

import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { useFonts } from 'expo-font'
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_400Regular_Italic,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display'
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans'
import { ThemeProvider, DarkTheme } from '@react-navigation/native'
import { PostHogProvider } from 'posthog-react-native'
import { I18nextProvider } from 'react-i18next'

import { supabase, isSupabaseEnabled } from '@/lib/supabase'
import { posthog, isPostHogEnabled, identify, resetIdentity, track } from '@/lib/analytics'
import { AuthProvider } from '@/contexts/AuthContext'
import { ToastProvider } from '@/contexts/ToastContext'
import i18n, { initI18n } from '@/lib/i18n'
import OfflineBanner from '@/components/OfflineBanner'
import OfflineOverlay from '@/components/OfflineOverlay'
import { Text } from '@/components/ui/Text'
import { BG } from '@/lib/theme'
import { appEvents } from '@/lib/events'

// ─── Error boundary ───────────────────────────────────────────────────────────
// React requires a class component to catch render errors — hooks cannot do this.

function ErrorFallback() {
  return (
    <View style={eb.container}>
      <Text style={eb.title}>Something went wrong</Text>
      <Text style={eb.subtitle}>Please close and reopen the app.</Text>
    </View>
  )
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, info)
    Sentry.captureException(error, { extra: { componentStack: info.componentStack } })
  }

  render() {
    if (this.state.hasError) return <ErrorFallback />
    return this.props.children
  }
}

const eb = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: BG,
    alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  title: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 10, textAlign: 'center' },
  subtitle: { color: 'rgba(255,255,255,0.4)', fontSize: 14, textAlign: 'center', lineHeight: 22 },
})

// ─── Theme ────────────────────────────────────────────────────────────────────

const customDarkTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: BG },
}

// ─── Conditional PostHog provider ─────────────────────────────────────────────
// PostHogProvider requires a valid client instance. When the API key is missing
// we skip the provider entirely so no errors are thrown.

function MaybePostHogProvider({ children }: { children: React.ReactNode }) {
  if (isPostHogEnabled && posthog) {
    return <PostHogProvider client={posthog}>{children}</PostHogProvider>
  }
  return <>{children}</>
}

// ─── Screen tracking ─────────────────────────────────────────────────────────
// Rendered inside the navigator so useSegments has routing context.

function ScreenTracker() {
  const segments = useSegments()
  const screen = '/' + segments.join('/')
  useEffect(() => {
    track('screen_viewed', { screen })
  }, [screen])
  return null
}

// ─── Root layout ──────────────────────────────────────────────────────────────

function RootLayout() {
  const navigationRef = useNavigationContainerRef()
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_400Regular_Italic,
    PlayfairDisplay_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  })

  // null = still checking; true/false = auth state known
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null)
  // null = loading; false = not completed; true = completed
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null)
  const [i18nReady, setI18nReady] = useState(false)

  // Prevents onAuthStateChange SIGNED_IN from re-authenticating
  // after we intentionally signed out due to missing profile
  const forcedSignOutRef = React.useRef(false)

  useEffect(() => {
    initI18n().then(() => setI18nReady(true))
  }, [])

  useEffect(() => {
    if (navigationRef.current) {
      routingInstrumentation.registerNavigationContainer(navigationRef)
    }
  }, [navigationRef])

  useEffect(() => {
    if (!isSupabaseEnabled) {
      // No credentials — stay on landing page, no errors thrown
      setIsAuthed(false)
      return
    }

    async function ensureProfile(userId: string, email?: string) {
      // Try to fetch existing profile
      let { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed, role')
        .eq('id', userId)
        .single()

      if (!profile) {
        // No profile row — create one so the user isn't stuck
        console.warn('[Auth] No profile found — auto-creating.')
        await supabase
          .from('profiles')
          .upsert({
            id: userId,
            email: email ?? null,
            onboarding_completed: false,
            role: 'applicant',
          }, { onConflict: 'id' })
        
        profile = { onboarding_completed: false, role: 'applicant' }
      }

      let status = null
      if (profile.role === 'applicant') {
        const { data: appData } = await supabase
          .from('applications')
          .select('status')
          .eq('user_id', userId)
          .single()
        status = appData?.status || 'none'
      }

      return { completed: profile.onboarding_completed === true, role: profile.role, status }
    }

    async function checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          setIsAuthed(false)
          setOnboardingCompleted(null)
          setUserRole(null)
          setApplicationStatus(null)
          return
        }

        identify(
          session.user.id,
          session.user.email ? { email: session.user.email } : undefined
        )

        const { completed, role, status } = await ensureProfile(session.user.id, session.user.email)
        setIsAuthed(true)
        setOnboardingCompleted(completed)
        setUserRole(role)
        setApplicationStatus(status)
      } catch {
        console.warn('[Auth] Could not reach Supabase — defaulting to signed-out state.')
        setIsAuthed(false)
      }
    }
    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Skip SIGNED_IN events that arrive after we intentionally signed out
      if (forcedSignOutRef.current && event === 'SIGNED_IN') {
        console.warn('[Auth] Ignoring SIGNED_IN event after forced sign-out.')
        return
      }

      if (event === 'SIGNED_IN' && session?.user) {
        identify(
          session.user.id,
          session.user.email ? { email: session.user.email } : undefined
        )

        const { completed, role, status } = await ensureProfile(session.user.id, session.user.email)
        setIsAuthed(true)
        setOnboardingCompleted(completed)
        setUserRole(role)
        setApplicationStatus(status)
      }
      if (event === 'SIGNED_OUT') {
        setIsAuthed(false)
        setOnboardingCompleted(null)
        setUserRole(null)
        setApplicationStatus(null)
        resetIdentity()
        // Reset the flag so future sign-ins work normally
        forcedSignOutRef.current = false
      }
      if ((event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') && session?.user) {
        const { completed, role, status } = await ensureProfile(session.user.id, session.user.email)
        setOnboardingCompleted(completed)
        setUserRole(role)
        setApplicationStatus(status)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // ─── Listen for onboarding completion event ─────────────────────────────────
  // The onboarding screen emits this after successfully updating the DB.
  // We re-fetch the profile to confirm and let the route guard navigate.
  useEffect(() => {
    const unsub = appEvents.on('onboardingCompleted', async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', session.user.id)
            .single()

          if (profile?.onboarding_completed === true) {
            setOnboardingCompleted(true)
          } else {
            // DB write succeeded from the onboarding screen but re-read
            // doesn't reflect it yet (replication lag). Trust the write.
            console.warn('[Layout] Profile re-fetch did not show onboarding_completed=true — trusting the write.')
            setOnboardingCompleted(true)
          }
        }
      } catch (err) {
        // Even if the re-fetch fails, trust the onboarding screen's DB write.
        console.warn('[Layout] Failed to re-fetch profile after onboarding event — proceeding anyway:', err)
        setOnboardingCompleted(true)
      }
    })
    return unsub
  }, [])

  // ─── Listen for application status change ───────────────────────────────────
  // A polling component or webhook can emit this when an applicant is approved
  useEffect(() => {
    const unsub = appEvents.on('applicationStatusChanged', async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const { data: appData } = await supabase
            .from('applications')
            .select('status')
            .eq('user_id', session.user.id)
            .single()

          if (appData?.status) {
            setApplicationStatus(appData.status)
          }
        }
      } catch (err) {
        console.warn('[Layout] Failed to re-fetch application status:', err)
      }
    })
    return unsub
  }, [])

  // ─── Route Guard ────────────────────────────────────────────────────────────
  // When auth state changes, explicitly navigate so Expo Router doesn't get lost
  // when current route unmounts.
  const segments = useSegments()
  const router = useRouter()
  const navigationState = useRootNavigationState()

  useEffect(() => {
    // Wait until auth state is known AND router is fully mounted
    if (isAuthed === null || !navigationState?.key) return

    const isPublicRoute = segments[0] === '(auth)' || segments[0] === undefined || (segments as string[])[0] === ''
    const isAuthFlowRoute = isPublicRoute || segments[0] === 'apply' || segments[0] === '(onboarding)'

    if (!isAuthed) {
      // Unauthenticated users can only be on public routes
      if (!isPublicRoute) {
        setTimeout(() => router.replace('/'), 0)
      }
    } else if (isAuthed) {
      if (userRole === 'applicant') {
        if (applicationStatus === 'approved') {
          if (onboardingCompleted === false) {
             if (segments[0] !== '(onboarding)') setTimeout(() => router.replace('/(onboarding)'), 0)
          } else {
             if (isAuthFlowRoute) setTimeout(() => router.replace('/(tabs)'), 0)
          }
        } else if (applicationStatus === 'declined') {
          if (segments[0] !== 'apply' || segments[1] !== 'declined') setTimeout(() => router.replace('/apply/declined'), 0)
        } else if (applicationStatus === 'pending') {
          if (segments[0] !== 'apply' || segments[1] !== 'submitted') setTimeout(() => router.replace('/apply/submitted'), 0)
        } else {
          // status === 'none'
          if (segments[0] !== 'apply' || segments[1] === 'submitted' || segments[1] === 'declined') {
            setTimeout(() => router.replace('/apply'), 0)
          }
        }
      } else if (userRole === 'admin') {
        if (isAuthFlowRoute) {
          setTimeout(() => router.replace('/admin'), 0)
        }
      } else {
        // member
        if (onboardingCompleted === false) {
          if (segments[0] !== '(onboarding)') {
            setTimeout(() => router.replace('/(onboarding)'), 0)
          }
        } else {
          if (isAuthFlowRoute) {
            setTimeout(() => router.replace('/(tabs)'), 0)
          }
        }
      }
    }
  }, [isAuthed, onboardingCompleted, userRole, applicationStatus, segments, navigationState?.key])

  // Show blank dark screen while session + i18n checks complete.
  // This prevents a flash of wrong content on launch.
  if (!fontsLoaded || isAuthed === null || !i18nReady || (isAuthed === true && onboardingCompleted === null)) {
    return <View style={{ flex: 1, backgroundColor: BG }} />
  }

  return (
    <ErrorBoundary>
      <I18nextProvider i18n={i18n}>
        <MaybePostHogProvider>
          <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ToastProvider>
            <SafeAreaProvider>
              <GestureHandlerRootView style={{ flex: 1, backgroundColor: BG, minHeight: Platform.OS === 'web' ? '100vh' : undefined } as any}>
                <BottomSheetModalProvider>
                  <StatusBar
                    style="light"
                    translucent={Platform.OS === 'android'}
                    backgroundColor={Platform.OS === 'android' ? BG : undefined}
                  />
                  <ThemeProvider value={customDarkTheme}>
                    <View style={{ flex: 1, backgroundColor: BG, minHeight: Platform.OS === 'web' ? '100vh' : undefined } as any}>
                      <Stack ref={navigationRef} screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: BG } }}>
                        {/* ── Unauthenticated screens ── */}
                        <Stack.Screen name="index" />
                        <Stack.Screen name="(auth)" />
                        <Stack.Screen name="apply" />

                        {/* ── Onboarding screens ── */}
                        <Stack.Screen name="(onboarding)" />

                        {/* ── Authenticated screens ── */}
                        <Stack.Screen name="(tabs)" />
                        <Stack.Screen name="admin" />
                        <Stack.Screen name="member/[id]" options={{ animation: 'slide_from_right' }} />
                        <Stack.Screen name="event/[id]" options={{ animation: 'slide_from_right' }} />
                        <Stack.Screen name="messages/[id]" options={{ animation: 'slide_from_right' }} />
                        <Stack.Screen name="invites" />
                        <Stack.Screen name="notifications" />
                        <Stack.Screen name="profile/edit" options={{ animation: 'slide_from_right' }} />

                        {/* ── Always-public screens ── */}
                        <Stack.Screen name="privacy" />
                        <Stack.Screen name="terms" />
                      </Stack>
                      <ScreenTracker />
                      <OfflineBanner />
                      <OfflineOverlay />
                    </View>
                  </ThemeProvider>
                </BottomSheetModalProvider>
              </GestureHandlerRootView>
            </SafeAreaProvider>
            </ToastProvider>
          </AuthProvider>
          </QueryClientProvider>
        </MaybePostHogProvider>
      </I18nextProvider>
    </ErrorBoundary>
  )
}

export default Sentry.wrap(RootLayout)
