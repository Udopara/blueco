import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BellIcon, CheckCheckIcon, XIcon, BriefcaseIcon, FileTextIcon, InfoIcon } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Notification } from '@/types/notifications'

function notificationIcon(type: string) {
  if (type.includes('application') || type.includes('job')) return BriefcaseIcon
  if (type.includes('status') || type.includes('review')) return FileTextIcon
  return InfoIcon
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function Notifications() {
  const navigate = useNavigate()
  const { notifications, loading, error, unreadCount, fetchNotifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications()

  useEffect(() => { fetchNotifications() }, [])

  function handleClick(n: Notification) {
    if (!n.read_at) markAsRead(n.id)
    if (n.resource_type === 'job_post' && n.resource_id) navigate(`/jobs/${n.resource_id}`)
    if (n.resource_type === 'application' && n.resource_id) navigate(`/applications`)
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[oklch(0.18_0.05_239)] via-[oklch(0.22_0.07_245)] to-[oklch(0.26_0.09_255)] px-6 py-8 md:px-10 shadow-lg">
        <div className="pointer-events-none absolute -top-12 -right-12 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative z-10 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary/80 text-sm font-medium">
              <BellIcon className="size-4" />
              Notifications
            </div>
            <h1 className="text-2xl font-bold text-white">Your activity</h1>
            <p className="text-white/60 text-sm">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="ghost"
              className="text-white/70 hover:text-white hover:bg-white/10 gap-1.5 mt-1"
              onClick={markAllAsRead}
            >
              <CheckCheckIcon className="size-4" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl border bg-card animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Empty */}
      {!loading && !error && notifications.length === 0 && (
        <div className="rounded-xl border bg-card px-6 py-16 text-center space-y-3">
          <BellIcon className="size-10 mx-auto text-muted-foreground/40" />
          <p className="font-medium">No notifications yet</p>
          <p className="text-sm text-muted-foreground">
            We'll let you know when something needs your attention.
          </p>
        </div>
      )}

      {/* List */}
      {!loading && notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map(n => {
            const Icon = notificationIcon(n.type)
            const isUnread = !n.read_at

            return (
              <Card
                key={n.id}
                className={`group overflow-hidden shadow-sm transition-all cursor-pointer hover:shadow-md hover:-translate-y-0.5 ${isUnread ? 'border-primary/30 bg-primary/[0.02]' : ''}`}
                onClick={() => handleClick(n)}
              >
                <CardContent className="flex items-start gap-4 p-4">
                  {/* Icon */}
                  <div className={`flex size-9 shrink-0 items-center justify-center rounded-full ${isUnread ? 'bg-primary/15' : 'bg-muted'}`}>
                    <Icon className={`size-4 ${isUnread ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm leading-snug ${isUnread ? 'font-semibold' : 'font-medium'}`}>
                        {n.title}
                      </p>
                      <div className="flex items-center gap-2 shrink-0">
                        {isUnread && (
                          <span className="size-2 rounded-full bg-primary shrink-0" />
                        )}
                        <span className="text-xs text-muted-foreground">{timeAgo(n.created_at)}</span>
                      </div>
                    </div>
                    {n.body && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{n.body}</p>
                    )}
                  </div>

                  {/* Delete */}
                  <button
                    onClick={e => { e.stopPropagation(); deleteNotification(n.id) }}
                    className="shrink-0 rounded-md p-1 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                    aria-label="Dismiss"
                  >
                    <XIcon className="size-3.5" />
                  </button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
