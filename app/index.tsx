import { useEffect } from 'react'
import { View, Pressable, StyleSheet, Dimensions } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, {
    useSharedValue, useAnimatedStyle, withSpring, withTiming,
    withDelay, withRepeat, withSequence, Easing,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { ACCENT, ACCENT_DIM, BG_BASE, BORDER_DEFAULT, TEXT_TERTIARY } from '@/lib/theme'
import { APP_NAME, APP_TAGLINE, APP_DESCRIPTION } from '@/lib/constants'
import { adjustBrightness } from '@/lib/utils'

const { width: SW, height: SH } = Dimensions.get('window')

// ─── Feature items for the Velvet landing page ────────────────────────────────
const FEATURES = [
    { icon: 'people-outline' as const, title: 'Curated Community', desc: 'Vetted members, real connections' },
    { icon: 'calendar-outline' as const, title: 'Exclusive Events', desc: 'Members-only dinners & gatherings' },
    { icon: 'sparkles-outline' as const, title: 'By Invitation Only', desc: 'Quality over quantity, always' },
]

export default function LandingScreen() {
    const insets = useSafeAreaInsets()

    // ── Animations ──
    const headerY = useSharedValue(-20)
    const headerOpacity = useSharedValue(0)
    const heroScale = useSharedValue(0.88)
    const heroOpacity = useSharedValue(0)
    const featuresY = useSharedValue(30)
    const featuresOpacity = useSharedValue(0)
    const footerOpacity = useSharedValue(0)
    const orbOneY = useSharedValue(0)
    const orbTwoY = useSharedValue(0)

    useEffect(() => {
        headerY.value = withSpring(0, { damping: 16, stiffness: 120 })
        headerOpacity.value = withTiming(1, { duration: 500 })
        heroScale.value = withDelay(180, withSpring(1, { damping: 14, stiffness: 100 }))
        heroOpacity.value = withDelay(180, withTiming(1, { duration: 550 }))
        featuresY.value = withDelay(380, withSpring(0, { damping: 16, stiffness: 110 }))
        featuresOpacity.value = withDelay(380, withTiming(1, { duration: 480 }))
        footerOpacity.value = withDelay(550, withTiming(1, { duration: 500 }))
        orbOneY.value = withRepeat(
            withSequence(
                withTiming(-16, { duration: 3400, easing: Easing.inOut(Easing.sin) }),
                withTiming(0, { duration: 3400, easing: Easing.inOut(Easing.sin) })
            ), -1, true
        )
        orbTwoY.value = withRepeat(
            withSequence(
                withTiming(14, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
                withTiming(0, { duration: 2800, easing: Easing.inOut(Easing.sin) })
            ), -1, true
        )
    }, [])

    const headerStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: headerY.value }], opacity: headerOpacity.value,
    }))
    const heroStyle = useAnimatedStyle(() => ({
        transform: [{ scale: heroScale.value }], opacity: heroOpacity.value,
    }))
    const featuresStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: featuresY.value }], opacity: featuresOpacity.value,
    }))
    const footerStyle = useAnimatedStyle(() => ({ opacity: footerOpacity.value }))
    const orbOneStyle = useAnimatedStyle(() => ({ transform: [{ translateY: orbOneY.value }] }))
    const orbTwoStyle = useAnimatedStyle(() => ({ transform: [{ translateY: orbTwoY.value }] }))

    return (
        <View style={s.root}>
            {/* Background gradient */}
            <LinearGradient
                pointerEvents="none"
                colors={[BG_BASE, '#0d0d08', '#0a0a06', BG_BASE]}
                locations={[0, 0.3, 0.6, 1]}
                style={StyleSheet.absoluteFillObject}
            />

            {/* Floating decorative orbs — gold tint */}
            <Animated.View pointerEvents="none" style={[s.orbOne, orbOneStyle]} />
            <Animated.View pointerEvents="none" style={[s.orbTwo, orbTwoStyle]} />

            {/* ── Rounded header bar ── */}
            <Animated.View style={[s.headerOuter, { marginTop: insets.top + 10 }, headerStyle]}>
                <View style={s.headerBar}>
                    <View style={s.headerLeft}>
                        <LinearGradient
                            colors={[adjustBrightness(ACCENT, 20), ACCENT]}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                            style={s.headerLogo}
                        >
                            <Text variant="body" color="inverse" style={s.headerLogoText}>V</Text>
                        </LinearGradient>
                        <Text variant="h3" color="primary" style={s.headerAppName}>{APP_NAME}</Text>
                    </View>
                    <Pressable
                        onPress={() => router.push('/(auth)/signup')}
                        style={({ pressed }) => [s.headerCta, pressed && { opacity: 0.82, transform: [{ scale: 0.97 }] }]}
                    >
                        <LinearGradient
                            colors={[ACCENT, adjustBrightness(ACCENT, -18)]}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={s.headerCtaGrad}
                        >
                            <Text variant="bodySm" color="inverse" style={{ fontWeight: '700' }}>Get Started</Text>
                        </LinearGradient>
                    </Pressable>
                </View>
            </Animated.View>

            {/* ── Hero section ── */}
            <Animated.View style={[s.heroWrap, heroStyle]}>
                <Text variant="display" color="primary">{APP_NAME}</Text>
                <Text variant="body" color="accent" style={{ fontWeight: '600' }}>{APP_TAGLINE}</Text>
                <Text variant="body" color="secondary" style={{ marginTop: 2, maxWidth: 320 }}>
                    {APP_DESCRIPTION}
                </Text>
            </Animated.View>

            {/* ── Feature highlights ── */}
            <Animated.View style={[s.featuresWrap, featuresStyle]}>
                {FEATURES.map((feat, i) => (
                    <View key={i} style={s.featureRow}>
                        <View style={s.featureIconWrap}>
                            <Ionicons name={feat.icon} size={18} color={ACCENT} />
                        </View>
                        <View style={s.featureTextWrap}>
                            <Text variant="bodySm" color="primary" style={{ fontWeight: '700' }}>{feat.title}</Text>
                            <Text variant="caption" color="tertiary">{feat.desc}</Text>
                        </View>
                    </View>
                ))}
            </Animated.View>

            {/* ── Footer ── */}
            <Animated.View style={[s.footer, footerStyle, { paddingBottom: insets.bottom + 20 }]}>
                <Pressable
                    onPress={() => router.push('/(auth)/login')}
                    hitSlop={8}
                    style={({ pressed }) => [pressed && { opacity: 0.7 }]}
                >
                    <Text variant="bodySm" color="tertiary">
                        Already have an account?{' '}
                        <Text variant="bodySm" color="accent" style={{ fontWeight: '600' }}>Sign in</Text>
                    </Text>
                </Pressable>
                <Text variant="caption" color="tertiary" align="center" style={{ paddingHorizontal: 8 }}>
                    By continuing you agree to our{' '}
                    <Text variant="caption" onPress={() => router.push('/terms')} style={{ color: TEXT_TERTIARY, textDecorationLine: 'underline' }}>Terms</Text>
                    {' '}and{' '}
                    <Text variant="caption" onPress={() => router.push('/privacy')} style={{ color: TEXT_TERTIARY, textDecorationLine: 'underline' }}>Privacy Policy</Text>
                </Text>
            </Animated.View>
        </View>
    )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: BG_BASE },
    orbOne: {
        position: 'absolute', right: -SW * 0.25, top: SH * 0.06,
        width: SW * 0.72, height: SW * 0.72, borderRadius: 999,
        backgroundColor: `${ACCENT}14`,
    },
    orbTwo: {
        position: 'absolute', left: -SW * 0.32, bottom: SH * 0.18,
        width: SW * 0.66, height: SW * 0.66, borderRadius: 999,
        backgroundColor: `${ACCENT}0C`,
    },
    headerOuter: { alignItems: 'center', paddingHorizontal: 20 },
    headerBar: {
        width: '95%', height: 58, borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1, borderColor: BORDER_DEFAULT,
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', paddingLeft: 6, paddingRight: 6,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    headerLogo: {
        width: 36, height: 36, borderRadius: 999,
        alignItems: 'center', justifyContent: 'center',
    },
    headerLogoText: { fontSize: 16, fontWeight: '800' },
    headerAppName: { letterSpacing: 0.5 },
    headerCta: { borderRadius: 999, overflow: 'hidden' },
    headerCtaGrad: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 999 },
    heroWrap: { paddingHorizontal: 24, paddingTop: 36, gap: 10 },
    featuresWrap: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, gap: 14 },
    featureRow: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderWidth: 1, borderColor: BORDER_DEFAULT,
        borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16,
    },
    featureIconWrap: {
        width: 38, height: 38, borderRadius: 11,
        backgroundColor: ACCENT_DIM,
        alignItems: 'center', justifyContent: 'center',
    },
    featureTextWrap: { flex: 1, gap: 2 },
    footer: { paddingHorizontal: 20, gap: 10, alignItems: 'center' },
})
