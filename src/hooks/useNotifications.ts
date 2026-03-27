import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Notification } from '@/types/notifications'

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchNotifications() {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setNotifications(data ?? [])

    setLoading(false)
    return { data, error }
  }

  async function markAsRead(id: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id)

    if (!error) {
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
      )
    }

    return { error }
  }

  async function markAllAsRead() {
    const unreadIds = notifications.filter(n => !n.read_at).map(n => n.id)
    if (unreadIds.length === 0) return

    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .in('id', unreadIds)

    if (!error) {
      setNotifications(prev =>
        prev.map(n => ({ ...n, read_at: n.read_at ?? new Date().toISOString() }))
      )
    }

    return { error }
  }

  async function deleteNotification(id: string) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)

    if (!error) setNotifications(prev => prev.filter(n => n.id !== id))

    return { error }
  }

  const unreadCount = notifications.filter(n => !n.read_at).length

  return {
    notifications, loading, error, unreadCount,
    fetchNotifications, markAsRead, markAllAsRead, deleteNotification,
  }
}
