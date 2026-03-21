import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { WorkerProfile } from '@/types'

type WorkerProfileUpdate = Partial<Omit<WorkerProfile, 'id' | 'created_at' | 'updated_at'>>

export function useWorkerProfile() {
  const [workerProfile, setWorkerProfile] = useState<WorkerProfile | null>(null)
  const [tradeIds, setTradeIds] = useState<number[]>([])
  const [skillIds, setSkillIds] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchWorkerProfile(userId: string) {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('worker_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) setError(error.message)
    else setWorkerProfile(data)

    setLoading(false)
    return { data, error }
  }

  async function updateWorkerProfile(userId: string, payload: WorkerProfileUpdate) {
    setError(null)

    const { data, error } = await supabase
      .from('worker_profiles')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()

    if (error) setError(error.message)
    else setWorkerProfile(data)

    return { data, error }
  }

  async function fetchWorkerTrades(userId: string) {
    const { data, error } = await supabase
      .from('worker_trades')
      .select('trade_id')
      .eq('worker_id', userId)

    if (!error) setTradeIds((data ?? []).map(r => r.trade_id))

    return { data, error }
  }

  async function setWorkerTrades(userId: string, newTradeIds: number[]) {
    setError(null)

    const { error: deleteError } = await supabase
      .from('worker_trades')
      .delete()
      .eq('worker_id', userId)

    if (deleteError) { setError(deleteError.message); return { error: deleteError } }

    if (newTradeIds.length === 0) { setTradeIds([]); return { error: null } }

    const rows = newTradeIds.map(trade_id => ({ worker_id: userId, trade_id }))
    const { error } = await supabase.from('worker_trades').insert(rows)

    if (error) setError(error.message)
    else setTradeIds(newTradeIds)

    return { error }
  }

  async function fetchWorkerSkills(userId: string) {
    const { data, error } = await supabase
      .from('worker_skills')
      .select('skill_id')
      .eq('worker_id', userId)

    if (!error) setSkillIds((data ?? []).map(r => r.skill_id))

    return { data, error }
  }

  async function setWorkerSkills(userId: string, newSkillIds: number[]) {
    setError(null)

    const { error: deleteError } = await supabase
      .from('worker_skills')
      .delete()
      .eq('worker_id', userId)

    if (deleteError) { setError(deleteError.message); return { error: deleteError } }

    if (newSkillIds.length === 0) { setSkillIds([]); return { error: null } }

    const rows = newSkillIds.map(skill_id => ({ worker_id: userId, skill_id }))
    const { error } = await supabase.from('worker_skills').insert(rows)

    if (error) setError(error.message)
    else setSkillIds(newSkillIds)

    return { error }
  }

  return {
    workerProfile, tradeIds, skillIds, loading, error,
    fetchWorkerProfile, updateWorkerProfile,
    fetchWorkerTrades, setWorkerTrades,
    fetchWorkerSkills, setWorkerSkills,
  }
}
