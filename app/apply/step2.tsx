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

export default function ApplyStep2() {
  const insets = useSafeAreaInsets()
  const { data, dispatch } = useApplication()
  const [profession, setProfession] = useState(data.profession)
  const [company, setCompany] = useState(data.company)
  const [linkedin, setLinkedin] = useState(data.linkedin_url)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!profession.trim()) e.profession = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
    if (!validate()) return
    dispatch({
      type: 'SET_STEP_2',
      payload: { profession: profession.trim(), company: company.trim(), linkedin_url: linkedin.trim() },
    })
    router.push('/apply/step3')
  }

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <StepProgress currentStep={2} totalSteps={4} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
          <Text variant="h1" color="primary">What do you do?</Text>
          <Text variant="body" color="secondary" style={{ marginTop: 4, marginBottom: 24 }}>
            Help us understand your background.
          </Text>

          <TextInputField
            label="PROFESSION"
            placeholder="e.g. Software Engineer, Investor, Designer"
            value={profession}
            onChangeText={setProfession}
            error={errors.profession}
          />
          <TextInputField
            label="COMPANY"
            placeholder="Where do you work? (optional)"
            value={company}
            onChangeText={setCompany}
            style={{ marginTop: 16 }}
          />
          <TextInputField
            label="LINKEDIN URL"
            placeholder="https://linkedin.com/in/you (optional)"
            value={linkedin}
            onChangeText={setLinkedin}
            autoCapitalize="none"
            keyboardType="url"
            style={{ marginTop: 16 }}
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
