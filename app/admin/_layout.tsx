import { useEffect } from 'react'
import { Stack, useRouter } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'
import { BG_BASE } from '@/lib/theme'

export default function AdminLayout() {
  const { profile } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (profile && profile.role !== 'admin') {
      router.replace('/(tabs)/home')
    }
  }, [profile])

  if (profile?.role !== 'admin') return null

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: BG_BASE } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="applications/index" />
      <Stack.Screen name="applications/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="members/index" />
      <Stack.Screen name="events/create" />
    </Stack>
  )
}
