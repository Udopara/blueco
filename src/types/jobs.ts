export interface Trade {
  id: number
  name: string
  slug: string
  created_at: string
}

export interface Skill {
  id: number
  trade_id: number | null
  name: string
  slug: string
  created_at: string
}

export type JobType = 'full_time' | 'part_time' | 'contract' | 'casual'
export type PayType = 'hourly' | 'daily' | 'fixed'
export type JobStatus = 'draft' | 'open' | 'closed' | 'filled'

export interface JobPost {
  id: string
  employer_id: string
  trade_id: number | null
  title: string
  description: string | null
  location: string | null
  job_type: JobType | null
  pay_rate: number | null
  pay_type: PayType | null
  status: JobStatus
  starts_at: string | null
  expires_at: string | null
  created_at: string
  updated_at: string
}

export interface JobPerk {
  id: number
  job_post_id: string
  perk: string
}
