import React, { useState } from 'react'
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from '@/components/ui/Text'
import { GoldButton, GhostButton } from '@/components/ui/Button'
import { TextInputField } from '@/components/ui/TextInputField'
import { StepProgress } from '@/components/application/StepProgress'
import { useApplication } from '@/contexts/ApplicationContext'
import { BG_BASE } from '@/lib/theme'
import { supabase, isSupabaseEnabled } from '@/lib/supabase'
import { appEvents } from '@/lib/events'

export default function ApplyStep4() {
  const insets = useSafeAreaInsets()
  const { data, dispatch } = useApplication()
  const [instagram, setInstagram] = useState(data.instagram_handle)
  const [referral, setReferral] = useState(data.referral_code)
  const [howHeard, setHowHeard] = useState(data.how_heard)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    dispatch({
      type: 'SET_STEP_4',
      payload: { 
        instagram_handle: instagram.trim(), 
        referral_code: referral.trim().toUpperCase(),
        how_heard: howHeard.trim()
      },
    })

    setSubmitting(true)
    try {
      if (isSupabaseEnabled) {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user?.id) throw new Error('Not authenticated')

        const payload = {
          ...data,
          user_id: session.user.id,
          instagram_handle: instagram.trim() || null,
          referral_code: referral.trim().toUpperCase() || null,
          status: 'pending',
        } as any;
        
        // Remove columns not yet in the remote database schema
        delete payload.country;
        delete payload.what_you_bring;
        delete payload.how_heard;

        const { error } = await supabase.from('applications').insert(payload)
        if (error) throw error

        appEvents.emit('applicationStatusChanged')
      } else {
        router.replace('/apply/submitted')
      }
    } catch (err) {
      console.error('[Apply] Submission error:', err)
      Alert.alert('Error', 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <StepProgress currentStep={4} totalSteps={4} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
          <Text variant="h1" color="primary">Almost there</Text>
          <Text variant="body" color="secondary" style={{ marginTop: 4, marginBottom: 24 }}>
            Optional — but helps us get to know you better.
          </Text>

          <TextInputField
            label="INSTAGRAM HANDLE"
            placeholder="@yourusername (optional)"
            value={instagram}
            onChangeText={setInstagram}
            autoCapitalize="none"
          />
          <TextInputField
            label="REFERRAL CODE"
            placeholder="Got an invite code? (optional)"
            value={referral}
            onChangeText={setReferral}
            autoCapitalize="characters"
            style={{ marginTop: 16 }}
            hint="If someone invited you, enter their code here."
          />
          <TextInputField
            label="HOW DID YOU HEAR ABOUT US?"
            placeholder="A friend, Instagram, etc. (optional)"
            value={howHeard}
            onChangeText={setHowHeard}
            style={{ marginTop: 16 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[s.footer, { paddingBottom: insets.bottom + 16 }]}>
        <GoldButton title="Submit Application" onPress={handleSubmit} loading={submitting} fullWidth />
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
