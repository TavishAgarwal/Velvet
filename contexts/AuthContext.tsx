import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, type ReactNode } from 'react'
import { router } from 'expo-router'
import { supabase, isSupabaseEnabled } from '@/lib/supabase'
import { queryClient } from '@/lib/queryClient'
import { appEvents } from '@/lib/events'
import { MOCK_CURRENT_USER } from '@/lib/mockData'
import type { Profile } from '@/types'
import type { Session } from '@supabase/supabase-js'

interface AuthState {
  session: Session | null
  profile: Profile | null
  loading: boolean
  isSigningOut: boolean
  signOut: () => Promise<void> | void
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthState>({
  session: null,
  profile: null,
  loading: true,
  isSigningOut: false,
  signOut: async () => {},
  refreshProfile: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const fetchProfile = useCallback(async (userId: string) => {
    if (!isSupabaseEnabled) {
      setProfile(MOCK_CURRENT_USER)
      return
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (error || !data) {
        // Fall back to mock profile for demo
        setProfile(MOCK_CURRENT_USER)
        return
      }
      setProfile(data as Profile)
    } catch (err) {
      console.warn('[AuthContext] Error fetching profile — using demo profile:', err)
      setProfile(MOCK_CURRENT_USER)
    }
  }, [])

  useEffect(() => {
    if (!isSupabaseEnabled) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      if (s?.user) {
        fetchProfile(s.user.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    }).catch(() => {
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, s) => {
        setSession(s)
        if (s?.user) {
          setIsSigningOut(false)
          await fetchProfile(s.user.id)
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  const signOut = useCallback(() => {
    // 1. Alert the layout immediately so it ignores incoming SIGNED_IN events
    setIsSigningOut(true)
    appEvents.emit('forceSignOut')

    // 2. Force navigation to landing page immediately
    try {
      if (router.canDismiss()) router.dismissAll()
      router.replace('/')
    } catch (e) {
      console.warn('[AuthContext] Replace failed, trying navigate:', e)
      try {
        router.navigate('/')
      } catch (e2) {}
    }

    // 3. Clear state and session after a brief tick to allow navigation to start
    setTimeout(async () => {
      if (isSupabaseEnabled) {
        try {
          await supabase.auth.signOut()
        } catch (err) {
          console.warn('[AuthContext] Supabase signout error:', err)
        }
      }

      queryClient.clear() // Prevent stale data leakage between user sessions
      setSession(null)
      setProfile(null)
    }, 100)
  }, [])

  const refreshProfile = useCallback(async () => {
    if (session?.user) {
      await fetchProfile(session.user.id)
    }
  }, [session, fetchProfile])

  const value = useMemo(() => ({
    session,
    profile,
    loading,
    isSigningOut,
    signOut,
    refreshProfile,
  }), [session, profile, loading, isSigningOut, signOut, refreshProfile])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
