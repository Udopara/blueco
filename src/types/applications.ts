export type ApplicationStatus =
  | 'pending'
  | 'reviewed'
  | 'shortlisted'
  | 'rejected'
  | 'offered'
  | 'accepted'
  | 'withdrawn'

export interface Application {
  id: string
  job_post_id: string
  worker_id: string
  cover_note: string | null
  status: ApplicationStatus
  applied_at: string
  updated_at: string
}

export interface SavedJob {
  worker_id: string
  job_post_id: string
  saved_at: string
}
