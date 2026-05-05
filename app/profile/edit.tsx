import React, { useState } from 'react'
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Pressable } from 'react-native'
import { Text } from '@/components/ui/Text'
import { Avatar } from '@/components/ui/Avatar'
import { TextInputField } from '@/components/ui/TextInputField'
import { GoldButton, GhostButton } from '@/components/ui/Button'
import { SkeletonCard } from '@/components/ui/SkeletonLoader'
import { BG_BASE } from '@/lib/theme'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets()
  const { profile: user, refreshProfile } = useAuth()
  const [name, setName] = useState(user?.display_name ?? '')
  const [bio, setBio] = useState(user?.bio ?? '')
  const [profession, setProfession] = useState(user?.profession ?? '')
  const [company, setCompany] = useState(user?.company ?? '')
  const [city, setCity] = useState(user?.city ?? '')
  const [saving, setSaving] = useState(false)

  if (!user) {
    return (
      <View style={[s.root, { paddingTop: insets.top + 12, paddingHorizontal: 24 }]}>
        <SkeletonCard />
        <SkeletonCard />
      </View>
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: name.trim() || null,
          bio: bio.trim() || null,
          profession: profession.trim() || null,
          company: company.trim() || null,
          city: city.trim() || null,
        })
        .eq('id', user.id)
      if (error) throw error
      await refreshProfile()
      router.back()
    } catch (err) {
      Alert.alert('Error', 'Could not save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <View style={[s.root, { paddingTop: insets.top + 12 }]}>
      <View style={s.headerRow}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text variant="h2" color="primary">Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Avatar url={user.avatar_url} name={user.display_name} size="xl" />
            <Pressable style={s.changePhoto}>
              <Text variant="bodySm" color="accent" style={{ fontWeight: '600' }}>Change Photo</Text>
            </Pressable>
          </View>

          <TextInputField label="DISPLAY NAME" value={name} onChangeText={setName} />
          <TextInputField label="BIO" value={bio} onChangeText={setBio} multiline charCount={{ current: bio.length, max: 300 }} style={{ marginTop: 16 }} />
          <TextInputField label="PROFESSION" value={profession} onChangeText={setProfession} style={{ marginTop: 16 }} />
          <TextInputField label="COMPANY" value={company} onChangeText={setCompany} style={{ marginTop: 16 }} />
          <TextInputField label="CITY" value={city} onChangeText={setCity} style={{ marginTop: 16 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[s.footer, { paddingBottom: insets.bottom + 16 }]}>
        <GoldButton title="Save Changes" onPress={handleSave} loading={saving} fullWidth />
        <GhostButton title="Cancel" onPress={() => router.back()} fullWidth />
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG_BASE },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, marginBottom: 16 },
  content: { padding: 24, paddingTop: 8 },
  changePhoto: { marginTop: 10 },
  footer: { paddingHorizontal: 24, gap: 10 },
})

