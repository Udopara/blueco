import { supabase } from '@/lib/supabase'

export async function createNotification(payload: {
  user_id: string
  type: string
  title: string
  body?: string | null
  resource_type?: string | null
  resource_id?: string | null
}) {
  return supabase.rpc('create_notification', {
    p_user_id:       payload.user_id,
    p_type:          payload.type,
    p_title:         payload.title,
    p_body:          payload.body ?? null,
    p_resource_type: payload.resource_type ?? null,
    p_resource_id:   payload.resource_id ?? null,
  })
}
