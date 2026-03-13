import { User } from '@supabase/supabase-js'
import { Profile } from './profiles'

export type { User }

export interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
}
