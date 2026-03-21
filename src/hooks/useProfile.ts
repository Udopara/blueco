import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types'

type ProfileUpdate = Partial<Omit<Profile, 'id' | 'role' | 'created_at' | 'updated_at'>>

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchProfile(userId: string) {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) setError(error.message)
    else setProfile(data)

    setLoading(false)
    return { data, error }
  }

  async function updateProfile(userId: string, payload: ProfileUpdate) {
    setError(null)

    const { data, error } = await supabase
      .from('profiles')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()

    if (error) setError(error.message)
    else setProfile(data)

    return { data, error }
  }

  async function uploadAvatar(userId: string, file: File) {
    setError(null)

    const ext = file.name.split('.').pop()
    const path = `avatars/${userId}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setError(uploadError.message)
      return { data: null, error: uploadError }
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)

    return updateProfile(userId, { avatar_url: publicUrl })
  }

  return {
    profile, loading, error,
    fetchProfile, updateProfile, uploadAvatar,
  }
}
