import { useState } from 'react'
import {
  View, Pressable, StyleSheet, Dimensions,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  TextInput as RNTextInput, ScrollView,
} from 'react-native'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'
import { router } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import { makeRedirectUri } from 'expo-auth-session'
import * as Linking from 'expo-linking'
import { Text } from '@/components/ui/Text'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '@/lib/supabase'
import { track } from '@/lib/analytics'
import { ACCENT, ACCENT_DIM, ACCENT_BORDER, BG, SURFACE, BORDER, ERROR, ERROR_DIM, TEXT_SECONDARY } from '@/lib/theme'
import { APP_NAME } from '@/lib/constants'
import { adjustBrightness } from '@/lib/utils'
import { Fonts } from '@/lib/typography'

const APP_SCHEME = 'velvet'

WebBrowser.maybeCompleteAuthSession()

export default function LoginScreen() {
  const insets = useSafeAreaInsets()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    setError(null)
    track('login_started')
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    })
    setLoading(false)
    if (err) {
      setError(err.message)
      return
    }
    track('login_success')
  }

  async function handleGoogleLogin() {
    setLoading(true)
    setError(null)
    try {
      let redirectTo = Linking.createURL('auth/callback')
      if (redirectTo.startsWith('http')) {
        // Force the scheme to match Expo Go if it resolved as HTTP
        redirectTo = redirectTo.replace(/^https?:\/\//, 'exp://')
      }
      console.log('>>> REDIRECT TO URL GENERATED IS:', redirectTo)
      const { data, error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, skipBrowserRedirect: true },
      })
      if (err) throw err
      if (!data.url) throw new Error('No OAuth URL returned.')

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo)
      if (result.type === 'success') {
        const extractParam = (url: string, param: string) => {
          const match = url.match(new RegExp(`(?:\\?|#|&)${param}=([^&]*)`))
          return match ? decodeURIComponent(match[1]) : null
        }

        const code = extractParam(result.url, 'code')
        const access_token = extractParam(result.url, 'access_token')
        const refresh_token = extractParam(result.url, 'refresh_token')

        if (code) {
          const { error: sessionErr } = await supabase.auth.exchangeCodeForSession(code)
          if (sessionErr) throw sessionErr
        } else if (access_token && refresh_token) {
          const { error: sessionErr } = await supabase.auth.setSession({ access_token, refresh_token })
          if (sessionErr) throw sessionErr
        } else {
          throw new Error('No valid authentication tokens found in the redirect URL.')
        }
      } else if (result.type === 'cancel' || result.type === 'dismiss') {
        throw new Error('Sign in was cancelled.')
      } else {
        throw new Error(`Unexpected result from browser: ${result.type}`)
      }
    } catch (e: any) {
      setError(e?.message ?? 'Google sign-in failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={s.root}>
      <Pressable 
        onPress={() => router.canGoBack() ? router.back() : router.replace('/')} 
        style={[s.backBtn, { top: insets.top + 14 }]} 
        hitSlop={14}
      >
        <Ionicons name="chevron-back" size={24} color="rgba(255,255,255,0.6)" />
      </Pressable>

      <KeyboardAvoidingView
        style={s.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[s.form, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 32 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.delay(80).duration(400)} style={s.content}>
            <View style={s.appBadge}>
              <View style={s.appBadgeDot} />
              <Text style={s.appBadgeText}>{APP_NAME}</Text>
            </View>

            <View style={s.titleBlock}>
              <Text style={s.titleBold}>Welcome back</Text>
              <Text style={s.sub}>Enter your email and password to sign in.</Text>
            </View>

            <View style={s.stepWrap}>
              <View style={s.fieldGroup}>
                <Text style={s.label}>EMAIL ADDRESS</Text>
                <RNTextInput
                  value={email}
                  onChangeText={(v) => { setEmail(v); setError(null) }}
                  placeholder="you@example.com"
                  placeholderTextColor="rgba(255,255,255,0.18)"
                  style={[s.input, error ? s.inputErr : null]}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>
              
              <View style={s.fieldGroup}>
                <Text style={s.label}>PASSWORD</Text>
                <RNTextInput
                  value={password}
                  onChangeText={(v) => { setPassword(v); setError(null) }}
                  placeholder="Enter your password"
                  placeholderTextColor="rgba(255,255,255,0.18)"
                  style={[s.input, error ? s.inputErr : null]}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleEmailLogin}
                />
              </View>

              {error ? <ErrorBanner msg={error} /> : null}

              <Pressable
                onPress={handleEmailLogin}
                disabled={loading || !email.trim() || !password.trim()}
                style={({ pressed }) => ({
                  opacity: (loading || !email.trim() || !password.trim()) ? 0.4 : pressed ? 0.85 : 1,
                  borderRadius: 14, overflow: 'hidden',
                  marginTop: 8
                })}
              >
                <LinearGradient
                  colors={[ACCENT, adjustBrightness(ACCENT, -25)]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={s.btn}
                >
                  {loading
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text style={s.btnText}>Sign in</Text>
                  }
                </LinearGradient>
              </Pressable>

              <View style={s.dividerRow}>
                <View style={s.dividerLine} />
                <Text style={s.dividerText}>or continue with</Text>
                <View style={s.dividerLine} />
              </View>

              <Pressable
                onPress={handleGoogleLogin}
                style={({ pressed }) => [s.socialBtn, pressed && { opacity: 0.75 }]}
              >
                <View style={s.socialIcon}>
                  <Text style={{ fontSize: 15, fontWeight: '700' }}>G</Text>
                </View>
                <Text style={s.socialBtnText}>Continue with Google</Text>
              </Pressable>
            </View>

            <Pressable 
              onPress={() => router.replace('/(auth)/signup')}
              style={{ alignItems: 'center', marginTop: 16 }}
              hitSlop={8}
            >
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                Don't have an account? <Text style={{ color: ACCENT, fontWeight: '600' }}>Sign up</Text>
              </Text>
            </Pressable>

            <View style={s.legalRow}>
              <Pressable onPress={() => router.push('/privacy')} hitSlop={8}>
                <Text style={s.legalLink}>Privacy Policy</Text>
              </Pressable>
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)' }}>·</Text>
              <Pressable onPress={() => router.push('/terms')} hitSlop={8}>
                <Text style={s.legalLink}>Terms of Service</Text>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

function ErrorBanner({ msg }: { msg: string }) {
  return (
    <Animated.View entering={FadeIn.duration(180)} style={[s.errorBox, { backgroundColor: ERROR_DIM, borderColor: `${ERROR}33` }]}>
      <Text style={{ color: ERROR, fontSize: 12.5 }}>{msg}</Text>
    </Animated.View>
  )
}

const { width: SW } = Dimensions.get('window')

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  backBtn: { position: 'absolute', left: 16, zIndex: 20 },
  kav: { flex: 1 },
  form: { flexGrow: 1, paddingHorizontal: 24 },
  content: { flex: 1, gap: 0 },

  appBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 11,
    paddingVertical: 5,
    marginBottom: 28,
  },
  appBadgeDot: {
    width: 6, height: 6, borderRadius: 999, backgroundColor: ACCENT,
  },
  appBadgeText: {
    fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.5)', letterSpacing: 0.2,
  },

  titleBlock: { gap: 10, marginBottom: 28 },
  titleBold: { fontSize: 30, fontWeight: '800', color: '#fff', letterSpacing: -0.8, lineHeight: 36 },
  sub: { fontSize: 14, color: 'rgba(255,255,255,0.40)', lineHeight: 20 },

  stepWrap: { gap: 16 },

  fieldGroup: { gap: 8 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: 'rgba(255,255,255,0.30)' },
  input: {
    height: 52, backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: BORDER, borderRadius: 14,
    paddingHorizontal: 16, color: '#fff', fontSize: 16,
    fontFamily: Fonts.regular,
  },
  inputErr: { borderColor: `${ERROR}66` },

  btn: { height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: BORDER },
  dividerText: { color: 'rgba(255,255,255,0.25)', fontSize: 12 },
  socialBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    height: 50, backgroundColor: SURFACE, borderRadius: 14,
    borderWidth: 1, borderColor: BORDER,
  },
  socialIcon: {
    width: 22, height: 22, borderRadius: 5, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  socialBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  errorBox: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },

  legalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 'auto', paddingTop: 24 },
  legalLink: { fontSize: 11, color: 'rgba(255,255,255,0.3)', textDecorationLine: 'underline' },
})
