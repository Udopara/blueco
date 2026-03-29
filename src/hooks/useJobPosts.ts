import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { JobPost, JobStatus } from '@/types'

type JobPostInsert = Omit<JobPost, 'id' | 'created_at' | 'updated_at'>
type JobPostUpdate = Partial<Omit<JobPost, 'id' | 'employer_id' | 'created_at' | 'updated_at'>>

interface JobFilters {
  tradeId?: number
  search?: string
  jobType?: string
  location?: string
}

export function useJobPosts() {
  const [jobs, setJobs] = useState<JobPost[]>([])
  const [job, setJob] = useState<JobPost | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchJobs(filters?: JobFilters) {
    setLoading(true)
    setError(null)

    let query = supabase
      .from('job_posts')
      .select(`*, trade:trades(name), employer:employer_profiles(company_name, profile:profiles(full_name))`)
      .eq('status', 'open')
      .order('created_at', { ascending: false })

    if (filters?.tradeId) query = query.eq('trade_id', filters.tradeId)
    if (filters?.jobType) query = query.eq('job_type', filters.jobType)
    if (filters?.location) query = query.ilike('location', `%${filters.location}%`)

    const { data, error } = await query

    if (error) setError(error.message)
    else setJobs(data ?? [])

    setLoading(false)
    return { data, error }
  }

  async function fetchJobById(id: string) {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('job_posts')
      .select(`*, trade:trades(name), employer:employer_profiles(company_name, profile:profiles(full_name)), skills:job_post_skills(skill:skills(id, name)), perks:job_perks(perk)`)
      .eq('id', id)
      .single()

    if (error) setError(error.message)
    else setJob(data)

    setLoading(false)
    return { data, error }
  }

  async function fetchMyJobs() {
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('Not authenticated')
      setLoading(false)
      return { data: null, error: new Error('Not authenticated') }
    }

    const { data, error } = await supabase
      .from('job_posts')
      .select(`*, trade:trades(name), _applications_count:applications(count)`)
      .eq('employer_id', user.id)
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setJobs(data ?? [])

    setLoading(false)
    return { data, error }
  }

  async function createJob(payload: JobPostInsert) {
    setError(null)

    const { data, error } = await supabase
      .from('job_posts')
      .insert(payload)
      .select()
      .single()

    if (error) setError(error.message)

    return { data, error }
  }

  async function updateJob(id: string, payload: JobPostUpdate) {
    setError(null)

    const { data, error } = await supabase
      .from('job_posts')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) setError(error.message)
    else setJob(data)

    return { data, error }
  }

  async function updateJobStatus(id: string, status: JobStatus) {
    return updateJob(id, { status })
  }

  async function deleteJob(id: string) {
    setError(null)

    const { error } = await supabase
      .from('job_posts')
      .delete()
      .eq('id', id)

    if (error) setError(error.message)
    else setJobs(prev => prev.filter(j => j.id !== id))

    return { error }
  }

  return {
    jobs, job, loading, error,
    fetchJobs, fetchJobById, fetchMyJobs,
    createJob, updateJob, updateJobStatus, deleteJob,
  }
}
