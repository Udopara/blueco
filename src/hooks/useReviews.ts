import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Review } from '@/types'

type ReviewInsert = Omit<Review, 'id' | 'created_at'>

export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchReviews(userId: string) {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('reviews')
      .select(`*, reviewer:profiles!reviews_reviewer_id_fkey(full_name, avatar_url)`)
      .eq('reviewee_id', userId)
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setReviews(data ?? [])

    setLoading(false)
    return { data, error }
  }

  async function createReview(payload: ReviewInsert) {
    setError(null)

    const { data, error } = await supabase
      .from('reviews')
      .insert(payload)
      .select()
      .single()

    if (error) setError(error.message)

    return { data, error }
  }

  async function deleteReview(id: string) {
    setError(null)

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id)

    if (error) setError(error.message)
    else setReviews(prev => prev.filter(r => r.id !== id))

    return { error }
  }

  return {
    reviews, loading, error,
    fetchReviews, createReview, deleteReview,
  }
}
