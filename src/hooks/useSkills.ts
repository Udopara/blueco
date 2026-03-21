import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Skill } from '@/types'

export function useSkills() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchSkills(tradeId?: number) {
    setLoading(true)
    setError(null)

    let query = supabase.from('skills').select('*').order('name')
    if (tradeId) query = query.eq('trade_id', tradeId)

    const { data, error } = await query

    if (error) setError(error.message)
    else setSkills(data ?? [])

    setLoading(false)
    return { data, error }
  }

  return { skills, loading, error, fetchSkills }
}
