import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Application, ApplicationStatus } from '@/types'
import { createNotification } from '@/lib/notifications'

type ApplicationInsert = Pick<Application, 'job_post_id' | 'worker_id' | 'cover_note'>

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchMyApplications() {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('applications')
      .select(`*, job:job_posts(id, title, location, job_type, pay_rate, pay_type, employer:employer_profiles(company_name))`)
      .order('applied_at', { ascending: false })

    if (error) setError(error.message)
    else setApplications(data ?? [])

    setLoading(false)
    return { data, error }
  }

  async function fetchJobApplications(jobPostId: string) {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('applications')
      .select(`*, worker:worker_profiles(id, hourly_rate, availability, profile:profiles(full_name, avatar_url, location))`)
      .eq('job_post_id', jobPostId)
      .order('applied_at', { ascending: false })

    if (error) setError(error.message)
    else setApplications(data ?? [])

    setLoading(false)
    return { data, error }
  }

  async function applyToJob(payload: ApplicationInsert) {
    setError(null)

    const { data, error } = await supabase
      .from('applications')
      .insert(payload)
      .select()
      .single()

    if (error) { setError(error.message); return { data, error } }

    // Notify employer of new application
    const { data: job } = await supabase
      .from('job_posts')
      .select('employer_id, title')
      .eq('id', payload.job_post_id)
      .single()

    if (job) {
      await createNotification({
        user_id:       job.employer_id,
        type:          'new_application',
        title:         'New application received',
        body:          `Someone applied to: ${job.title}`,
        resource_type: 'application',
        resource_id:   data.id,
      })
    }

    return { data, error }
  }

  async function updateApplicationStatus(id: string, status: ApplicationStatus) {
    setError(null)

    const { data, error } = await supabase
      .from('applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) setError(error.message)
    else setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a))

    // Notify the relevant party of status change
    if (!error && data) {
      // Worker-initiated statuses — notify the employer
      if (status === 'accepted') {
        const { data: job } = await supabase
          .from('job_posts')
          .select('employer_id')
          .eq('id', data.job_post_id)
          .single()
        if (job) {
          await createNotification({
            user_id:       job.employer_id,
            type:          'offer_accepted',
            title:         'A worker accepted your offer!',
            resource_type: 'application',
            resource_id:   id,
          })
        }
      } else {
        // Employer-initiated statuses — notify the worker
        const workerLabels: Record<string, string> = {
          reviewed:    'Your application is being reviewed',
          shortlisted: 'You have been shortlisted!',
          offered:     'You have received a job offer!',
          rejected:    'Your application was not selected',
        }
        const title = workerLabels[status]
        if (title) {
          await createNotification({
            user_id:       data.worker_id,
            type:          'application_status',
            title,
            resource_type: 'application',
            resource_id:   id,
          })
        }
      }
    }

    return { data, error }
  }

  async function withdrawApplication(id: string) {
    return updateApplicationStatus(id, 'withdrawn')
  }

  async function deleteApplication(id: string) {
    setError(null)

    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id)

    if (error) setError(error.message)
    else setApplications(prev => prev.filter(a => a.id !== id))

    return { error }
  }

  return {
    applications, loading, error,
    fetchMyApplications, fetchJobApplications,
    applyToJob, updateApplicationStatus, withdrawApplication, deleteApplication,
  }
}
