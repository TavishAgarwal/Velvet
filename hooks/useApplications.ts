import { useQuery } from '@tanstack/react-query'
import { supabase, isSupabaseEnabled } from '@/lib/supabase'
import type { Application } from '@/types'

// Mock applications for demo mode
const MOCK_APPLICATIONS: Application[] = [
  {
    id: 'app1', user_id: 'u-app1', email: 'james.whitfield@gmail.com',
    full_name: 'James Whitfield', city: 'Chicago', profession: 'Photographer',
    company: null, linkedin_url: null, instagram_handle: '@jamesw',
    why_join: 'Looking to connect with creatives and expand my network in the art world.',
    referral_code: 'VELVET-M9P4', status: 'pending',
    admin_notes: null, reviewed_by: null, reviewed_at: null,
    country: null, what_you_bring: null, how_heard: null,
    created_at: new Date(Date.now() - 2 * 86_400_000).toISOString(),
  },
  {
    id: 'app2', user_id: 'u-app2', email: 'priya.sharma@outlook.com',
    full_name: 'Priya Sharma', city: 'Mumbai', profession: 'Product Designer',
    company: 'Figma', linkedin_url: null, instagram_handle: null,
    why_join: 'Heard amazing things from Nina — would love to join the design community.',
    referral_code: null, status: 'pending',
    admin_notes: null, reviewed_by: null, reviewed_at: null,
    country: null, what_you_bring: null, how_heard: null,
    created_at: new Date(Date.now() - 1 * 86_400_000).toISOString(),
  },
  {
    id: 'app3', user_id: 'u-app3', email: 'lucas.berg@hey.com',
    full_name: 'Lucas Berg', city: 'Stockholm', profession: 'Startup Founder',
    company: 'Klarna', linkedin_url: null, instagram_handle: '@lucasberg',
    why_join: 'Building in fintech. Looking for cross-industry perspectives.',
    referral_code: null, status: 'pending',
    admin_notes: null, reviewed_by: null, reviewed_at: null,
    country: null, what_you_bring: null, how_heard: null,
    created_at: new Date(Date.now() - 4 * 3_600_000).toISOString(),
  },
]

export function useApplications(status?: Application['status']) {
  return useQuery({
    queryKey: ['applications', status],
    queryFn: async (): Promise<Application[]> => {
      if (!isSupabaseEnabled) {
        const apps = status ? MOCK_APPLICATIONS.filter(a => a.status === status) : MOCK_APPLICATIONS
        return apps
      }

      try {
        let query = supabase.from('applications').select('*').order('created_at', { ascending: false })
        if (status) query = query.eq('status', status)
        const { data, error } = await query
        if (error) throw error
        return (data || []) as Application[]
      } catch (err) {
        console.warn('Failed to load applications:', err)
        return []
      }
    },
  })
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: ['application', id],
    queryFn: async (): Promise<Application> => {
      if (!isSupabaseEnabled) {
        const mock = MOCK_APPLICATIONS.find(a => a.id === id)
        if (mock) return mock
        throw new Error('Application not found')
      }

      try {
        const { data, error } = await supabase
          .from('applications')
          .select('*')
          .eq('id', id)
          .single()
        if (error) throw error
        return data as Application
      } catch {
        const mock = MOCK_APPLICATIONS.find(a => a.id === id)
        if (mock) return mock
        throw new Error('Application not found')
      }
    },
    enabled: !!id,
  })
}
