import React, { createContext, useContext, useCallback, useReducer, type ReactNode } from 'react'

interface ApplicationData {
  // Step 1
  full_name: string
  email: string
  city: string
  country: string
  // Step 2
  profession: string
  company: string
  linkedin_url: string
  // Step 3
  why_join: string
  what_you_bring: string
  // Step 4
  instagram_handle: string
  referral_code: string
  how_heard: string
}

type Action =
  | { type: 'SET_STEP_1'; payload: Pick<ApplicationData, 'full_name' | 'email' | 'city' | 'country'> }
  | { type: 'SET_STEP_2'; payload: Pick<ApplicationData, 'profession' | 'company' | 'linkedin_url'> }
  | { type: 'SET_STEP_3'; payload: Pick<ApplicationData, 'why_join' | 'what_you_bring'> }
  | { type: 'SET_STEP_4'; payload: Pick<ApplicationData, 'instagram_handle' | 'referral_code' | 'how_heard'> }
  | { type: 'RESET' }

interface ApplicationContextType {
  data: ApplicationData
  dispatch: React.Dispatch<Action>
  isComplete: boolean
}

const initialData: ApplicationData = {
  full_name: '', email: '', city: '', country: '',
  profession: '', company: '', linkedin_url: '',
  why_join: '', what_you_bring: '',
  instagram_handle: '', referral_code: '', how_heard: '',
}

function reducer(state: ApplicationData, action: Action): ApplicationData {
  switch (action.type) {
    case 'SET_STEP_1': return { ...state, ...action.payload }
    case 'SET_STEP_2': return { ...state, ...action.payload }
    case 'SET_STEP_3': return { ...state, ...action.payload }
    case 'SET_STEP_4': return { ...state, ...action.payload }
    case 'RESET': return { ...initialData }
    default: return state
  }
}

const ApplicationContext = createContext<ApplicationContextType>({
  data: initialData,
  dispatch: () => {},
  isComplete: false,
})

export function useApplication() {
  return useContext(ApplicationContext)
}

export function ApplicationProvider({ children }: { children: ReactNode }) {
  const [data, dispatch] = useReducer(reducer, initialData)

  const isComplete = Boolean(
    data.full_name && data.email && data.city && data.country &&
    data.profession && data.why_join
  )

  return (
    <ApplicationContext.Provider value={{ data, dispatch, isComplete }}>
      {children}
    </ApplicationContext.Provider>
  )
}
