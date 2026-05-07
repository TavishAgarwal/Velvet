import React, { useState } from 'react'
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from '@/components/ui/Text'
import { GoldButton, GhostButton } from '@/components/ui/Button'
import { TextInputField } from '@/components/ui/TextInputField'
import { StepProgress } from '@/components/application/StepProgress'
import { useApplication } from '@/contexts/ApplicationContext'
import { BG_BASE } from '@/lib/theme'
import { MIN_ESSAY_LENGTH, MAX_ESSAY_LENGTH } from '@/lib/constants'

export default function ApplyStep3() {
  const insets = useSafeAreaInsets()
  const { data, dispatch } = useApplication()
  const [essay, setEssay] = useState(data.why_join)
  const [whatYouBring, setWhatYouBring] = useState(data.what_you_bring)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (essay.trim().length < MIN_ESSAY_LENGTH) {
      e.essay = `Minimum ${MIN_ESSAY_LENGTH} characters`
    } else if (essay.trim().length > MAX_ESSAY_LENGTH) {
      e.essay = `Maximum ${MAX_ESSAY_LENGTH} characters`
    }
    
    if (whatYouBring.trim().length < MIN_ESSAY_LENGTH) {
      e.whatYouBring = `Minimum ${MIN_ESSAY_LENGTH} characters`
    } else if (whatYouBring.trim().length > MAX_ESSAY_LENGTH) {
      e.whatYouBring = `Maximum ${MAX_ESSAY_LENGTH} characters`
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
    if (!validate()) return
    dispatch({ type: 'SET_STEP_3', payload: { why_join: essay.trim(), what_you_bring: whatYouBring.trim() } })
    router.push('/apply/step4')
  }

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <StepProgress currentStep={3} totalSteps={4} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
          <Text variant="h1" color="primary">Why Velvet?</Text>
          <Text variant="body" color="secondary" style={{ marginTop: 4, marginBottom: 24 }}>
            Tell us what draws you to this community and what you hope to contribute.
          </Text>

          <TextInputField
            label="WHY DO YOU WANT TO JOIN?"
            placeholder="Write something genuine. We value depth over polish."
            value={essay}
            onChangeText={setEssay}
            error={errors.essay}
            multiline
            charCount={{ current: essay.length, max: MAX_ESSAY_LENGTH }}
          />

          <TextInputField
            label="WHAT DO YOU BRING TO THE COMMUNITY?"
            placeholder="Your unique perspective, experiences, or interests."
            value={whatYouBring}
            onChangeText={setWhatYouBring}
            error={errors.whatYouBring}
            multiline
            charCount={{ current: whatYouBring.length, max: MAX_ESSAY_LENGTH }}
            style={{ marginTop: 24 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[s.footer, { paddingBottom: insets.bottom + 16 }]}>
        <GoldButton title="Continue" onPress={handleNext} fullWidth />
        <GhostButton title="Back" onPress={() => router.canGoBack() ? router.back() : router.replace('/')} fullWidth />
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG_BASE },
  content: { padding: 24, paddingTop: 28 },
  footer: { paddingHorizontal: 24, gap: 10 },
})
