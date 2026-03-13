export interface Review {
  id: string
  job_post_id: string | null
  reviewer_id: string
  reviewee_id: string
  rating: 1 | 2 | 3 | 4 | 5
  comment: string | null
  created_at: string
}
