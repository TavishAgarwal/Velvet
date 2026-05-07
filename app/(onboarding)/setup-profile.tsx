import React, { useState } from 'react'
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Pressable, Alert } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Avatar } from '@/components/ui/Avatar'
import { TextInputField } from '@/components/ui/TextInputField'
import { GoldButton } from '@/components/ui/Button'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { ACCENT, BG_BASE, ACCENT_DIM, BORDER_DEFAULT } from '@/lib/theme'
import { supabase } from '@/lib/supabase'
import { appEvents } from '@/lib/events'

const INTEREST_OPTIONS = [
  'Art & Design', 'Technology', 'Finance', 'Food & Wine',
  'Travel', 'Music', 'Startups', 'Architecture', 'Fashion',
  'Wellness', 'Literature', 'Film', 'Sports', 'Science',
]

export default function SetupProfileScreen() {
  const insets = useSafeAreaInsets()
  const [bio, setBio] = useState('')
  const [city, setCity] = useState('')
  const [profession, setProfession] = useState('')
  const [company, setCompany] = useState('')
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : prev.length < 5 ? [...prev, interest] : prev
    )
  }

  const handleFinish = async () => {
    if (!bio.trim() || !city.trim() || !profession.trim()) {
      Alert.alert('Required', 'Please fill in your bio, city, and profession.')
      return
    }
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('profiles')
        .update({
          bio: bio.trim(),
          city: city.trim(),
          profession: profession.trim(),
          company: company.trim() || null,
          interests: selectedInterests,
          onboarding_completed: true,
        })
        .eq('id', user.id)
      if (error) throw error

      // Signal the root layout that onboarding is done.
      // The layout guard will detect onboardingCompleted=true and navigate to /(tabs).
      // We do NOT navigate here — the layout guard owns all routing.
      appEvents.emit('onboardingCompleted')

      // Keep spinner visible — the layout will redirect away from this screen.
    } catch (err) {
      Alert.alert('Error', 'Could not save your profile. Please try again.')
      setSaving(false)
    }
  }

  return (
    <View style={[s.root, { paddingTop: insets.top + 12 }]}>
      <View style={s.header}>
        <Text variant="h2" color="primary">Your Profile</Text>
        <Text variant="bodySm" color="tertiary" style={{ marginTop: 4 }}>
          This is how other members will see you
        </Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          {/* Photo placeholder */}
          <View style={s.photoSection}>
            <Avatar name="You" size="xl" />
            <Pressable style={s.addPhoto}>
              <Ionicons name="camera-outline" size={16} color={ACCENT} />
              <Text variant="bodySm" color="accent" style={{ fontWeight: '600' }}>Add Photo</Text>
            </Pressable>
          </View>

          <GoldDivider style={{ marginVertical: 16 }} />

          <TextInputField label="BIO" placeholder="Tell us about yourself…" value={bio} onChangeText={setBio} multiline charCount={{ current: bio.length, max: 160 }} />
          <TextInputField label="CITY" placeholder="Where are you based?" value={city} onChangeText={setCity} style={{ marginTop: 16 }} />
          <TextInputField label="PROFESSION" placeholder="What do you do?" value={profession} onChangeText={setProfession} style={{ marginTop: 16 }} />
          <TextInputField label="COMPANY" placeholder="(Optional)" value={company} onChangeText={setCompany} style={{ marginTop: 16 }} />

          {/* Interests picker */}
          <View style={{ marginTop: 24 }}>
            <Text variant="label" uppercase color="accent" style={{ marginBottom: 10 }}>
              Interests (pick up to 5)
            </Text>
            <View style={s.tagsGrid}>
              {INTEREST_OPTIONS.map(interest => {
                const selected = selectedInterests.includes(interest)
                return (
                  <Pressable
                    key={interest}
                    onPress={() => toggleInterest(interest)}
                    style={[s.tag, selected && s.tagSelected]}
                  >
                    <Text variant="bodySm" color={selected ? 'accent' : 'secondary'}>
                      {interest}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[s.footer, { paddingBottom: insets.bottom + 16 }]}>
        <GoldButton title="Finish Setup" onPress={handleFinish} loading={saving} fullWidth />
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG_BASE },
  header: { paddingHorizontal: 24, marginBottom: 16 },
  scroll: { paddingHorizontal: 24, paddingBottom: 24 },
  photoSection: { alignItems: 'center', gap: 10 },
  addPhoto: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tagsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    borderWidth: 1, borderColor: BORDER_DEFAULT,
    backgroundColor: 'transparent',
  },
  tagSelected: {
    backgroundColor: ACCENT_DIM,
    borderColor: `${ACCENT}40`,
  },
  footer: { paddingHorizontal: 24 },
})
