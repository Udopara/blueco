import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { EmployerProfile } from '@/types'

type EmployerProfileUpdate = Partial<Omit<EmployerProfile, 'id' | 'verified' | 'created_at' | 'updated_at'>>

export function useEmployerProfile() {
  const [employerProfile, setEmployerProfile] = useState<EmployerProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchEmployerProfile(userId: string) {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('employer_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) setError(error.message)
    else setEmployerProfile(data)

    setLoading(false)
    return { data, error }
  }

  async function updateEmployerProfile(userId: string, payload: EmployerProfileUpdate) {
    setError(null)

    const { data, error } = await supabase
      .from('employer_profiles')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()

    if (error) setError(error.message)
    else setEmployerProfile(data)

    return { data, error }
  }

  return {
    employerProfile, loading, error,
    fetchEmployerProfile, updateEmployerProfile,
  }
}
