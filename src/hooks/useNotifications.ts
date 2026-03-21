import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Notification } from '@/types'

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchNotifications() {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setNotifications(data ?? [])
      setUnreadCount((data ?? []).filter(n => !n.read_at).length)
    }

    setLoading(false)
    return { data, error }
  }

  async function markAsRead(id: string) {
    setError(null)

    const { data, error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      setError(error.message)
    } else {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: data.read_at } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    }

    return { data, error }
  }

  async function markAllAsRead() {
    setError(null)

    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .is('read_at', null)

    if (error) {
      setError(error.message)
    } else {
      const now = new Date().toISOString()
      setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at ?? now })))
      setUnreadCount(0)
    }

    return { error }
  }

  async function deleteNotification(id: string) {
    setError(null)

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)

    if (error) {
      setError(error.message)
    } else {
      const removed = notifications.find(n => n.id === id)
      setNotifications(prev => prev.filter(n => n.id !== id))
      if (removed && !removed.read_at) setUnreadCount(prev => Math.max(0, prev - 1))
    }

    return { error }
  }

  return {
    notifications, unreadCount, loading, error,
    fetchNotifications, markAsRead, markAllAsRead, deleteNotification,
  }
}
