import React, { useState } from 'react'
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from '@/components/ui/Text'
import { GoldButton, GhostButton } from '@/components/ui/Button'
import { TextInputField } from '@/components/ui/TextInputField'
import { StepProgress } from '@/components/application/StepProgress'
import { useApplication } from '@/contexts/ApplicationContext'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { BG_BASE } from '@/lib/theme'
import { isValidEmail } from '@/lib/utils'

export default function ApplyStep1() {
  const insets = useSafeAreaInsets()
  const { data, dispatch } = useApplication()
  const { signOut } = useAuth()
  const [name, setName] = useState(data.full_name)
  const [email, setEmail] = useState(data.email)
  const [city, setCity] = useState(data.city)
  const [country, setCountry] = useState(data.country)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Required'
    if (!email.trim()) e.email = 'Required'
    else if (!isValidEmail(email)) e.email = 'Invalid email'
    if (!city.trim()) e.city = 'Required'
    if (!country.trim()) e.country = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
    if (!validate()) return
    dispatch({ type: 'SET_STEP_1', payload: { full_name: name.trim(), email: email.trim(), city: city.trim(), country: country.trim() } })
    router.push('/apply/step2')
  }

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <StepProgress currentStep={1} totalSteps={4} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
          <Text variant="h1" color="primary">Tell us about yourself</Text>
          <Text variant="body" color="secondary" style={{ marginTop: 4, marginBottom: 24 }}>
            Basic details to get started.
          </Text>

          <TextInputField
            label="FULL NAME"
            placeholder="Your full name"
            value={name}
            onChangeText={setName}
            error={errors.name}
            autoCapitalize="words"
          />
          <TextInputField
            label="EMAIL"
            placeholder="you@email.com"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            style={{ marginTop: 16 }}
          />
          <TextInputField
            label="CITY"
            placeholder="Where are you based?"
            value={city}
            onChangeText={setCity}
            error={errors.city}
            style={{ marginTop: 16 }}
          />
          <TextInputField
            label="COUNTRY"
            placeholder="Which country do you live in?"
            value={country}
            onChangeText={setCountry}
            error={errors.country}
            style={{ marginTop: 16 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[s.footer, { paddingBottom: insets.bottom + 16 }]}>
        <GoldButton title="Continue" onPress={handleNext} fullWidth />
        <GhostButton title="Sign Out" onPress={signOut} fullWidth />
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG_BASE },
  content: { padding: 24, paddingTop: 28 },
  footer: { paddingHorizontal: 24, gap: 10 },
})
