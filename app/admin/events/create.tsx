import React, { useState } from 'react'
import { View, ScrollView, StyleSheet, Alert } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { GoldButton, GhostButton } from '@/components/ui/Button'
import { TextInputField } from '@/components/ui/TextInputField'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { ACCENT, ACCENT_DIM, BG_BASE, BORDER_DEFAULT, TEXT_TERTIARY } from '@/lib/theme'
import { DEFAULT_EVENT_CAPACITY } from '@/lib/constants'
import { supabase, isSupabaseEnabled } from '@/lib/supabase'
import { queryClient } from '@/lib/queryClient'

export default function CreateEventScreen() {
  const insets = useSafeAreaInsets()
  const [saving, setSaving] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [virtualLink, setVirtualLink] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [capacity, setCapacity] = useState(String(DEFAULT_EVENT_CAPACITY))

  const isValid = title.trim().length > 0 && startsAt.trim().length > 0

  const handleCreate = async () => {
    if (!isValid || !isSupabaseEnabled) return
    setSaving(true)
    try {
      const { error } = await supabase.from('events').insert({
        title: title.trim(),
        description: description.trim() || null,
        location: location.trim() || null,
        virtual_link: virtualLink.trim() || null,
        starts_at: new Date(startsAt).toISOString(),
        capacity: parseInt(capacity, 10) || DEFAULT_EVENT_CAPACITY,
        is_published: true,
      })
      if (error) throw error
      queryClient.invalidateQueries({ queryKey: ['events'] })
      Alert.alert('Event Created', 'The event has been published.', [
        { text: 'OK', onPress: () => router.back() },
      ])
    } catch (err) {
      Alert.alert('Error', (err as Error).message ?? 'Failed to create event.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={s.header}>
        <GhostButton title="← Back" onPress={() => router.back()} />
        <Text variant="h1" color="primary" style={{ marginTop: 8 }}>Create Event</Text>
      </View>

      <GoldDivider />

      <View style={s.form}>
        <TextInputField
          label="Event Title *"
          placeholder="e.g. Summer Soirée"
          value={title}
          onChangeText={setTitle}
        />
        <TextInputField
          label="Description"
          placeholder="What's this event about?"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />
        <TextInputField
          label="Location"
          placeholder="e.g. The Standard, NYC"
          value={location}
          onChangeText={setLocation}
        />
        <TextInputField
          label="Virtual Link"
          placeholder="https://zoom.us/..."
          value={virtualLink}
          onChangeText={setVirtualLink}
          autoCapitalize="none"
          keyboardType="url"
        />
        <TextInputField
          label="Start Date & Time *"
          placeholder="YYYY-MM-DD HH:MM"
          value={startsAt}
          onChangeText={setStartsAt}
        />
        <TextInputField
          label="Capacity"
          placeholder={String(DEFAULT_EVENT_CAPACITY)}
          value={capacity}
          onChangeText={setCapacity}
          keyboardType="number-pad"
        />
      </View>

      <View style={s.actions}>
        <GoldButton
          title={saving ? 'Publishing…' : 'Publish Event'}
          onPress={handleCreate}
          disabled={!isValid || saving}
          fullWidth
        />
      </View>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG_BASE },
  header: { paddingHorizontal: 24, marginBottom: 8 },
  form: { paddingHorizontal: 24, gap: 16 },
  actions: { paddingHorizontal: 24, marginTop: 24 },
})
