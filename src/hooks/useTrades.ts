import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Trade } from '@/types'

export function useTrades() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchTrades() {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .order('name')

    if (error) setError(error.message)
    else setTrades(data ?? [])

    setLoading(false)
    return { data, error }
  }

  return { trades, loading, error, fetchTrades }
}
