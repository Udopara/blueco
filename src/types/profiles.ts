export interface Profile {
  id: string
  role: 'worker' | 'employer'
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  location: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

export interface WorkerProfile {
  id: string
  years_experience: number | null
  hourly_rate: number | null
  availability: 'available' | 'busy' | 'open_to_offers' | null
  resume_url: string | null
  created_at: string
  updated_at: string
}

export interface EmployerProfile {
  id: string
  company_name: string | null
  company_size: string | null
  industry: string | null
  website_url: string | null
  verified: boolean
  created_at: string
  updated_at: string
}
