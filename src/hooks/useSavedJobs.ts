import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { SavedJob } from '@/types'

export function useSavedJobs() {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([])
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchSavedJobs() {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('saved_jobs')
      .select(`*, job:job_posts(id, title, location, job_type, pay_rate, pay_type, status, trade:trades(name), employer:employer_profiles(company_name))`)
      .order('saved_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setSavedJobs(data ?? [])
      setSavedIds(new Set((data ?? []).map(s => s.job_post_id)))
    }

    setLoading(false)
    return { data, error }
  }

  async function saveJob(jobPostId: string, workerId: string) {
    setError(null)

    const { data, error } = await supabase
      .from('saved_jobs')
      .insert({ job_post_id: jobPostId, worker_id: workerId })
      .select()
      .single()

    if (error) setError(error.message)
    else setSavedIds(prev => new Set(prev).add(jobPostId))

    return { data, error }
  }

  async function unsaveJob(jobPostId: string, workerId: string) {
    setError(null)

    const { error } = await supabase
      .from('saved_jobs')
      .delete()
      .eq('job_post_id', jobPostId)
      .eq('worker_id', workerId)

    if (error) {
      setError(error.message)
    } else {
      setSavedJobs(prev => prev.filter(s => s.job_post_id !== jobPostId))
      setSavedIds(prev => {
        const next = new Set(prev)
        next.delete(jobPostId)
        return next
      })
    }

    return { error }
  }

  function isSaved(jobPostId: string) {
    return savedIds.has(jobPostId)
  }

  return {
    savedJobs, savedIds, loading, error,
    fetchSavedJobs, saveJob, unsaveJob, isSaved,
  }
}
