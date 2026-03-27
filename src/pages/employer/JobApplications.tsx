import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeftIcon, UsersIcon, MapPinIcon, BanknoteIcon,
  CheckCircle2Icon, XCircleIcon, StarIcon, SendIcon, EyeIcon,
  ChevronDownIcon, ChevronUpIcon,
} from 'lucide-react'
import { useApplications } from '@/hooks/useApplications'
import { useJobPosts } from '@/hooks/useJobPosts'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Application, ApplicationStatus } from '@/types/applications'
import type { JobPost } from '@/types/jobs'

type RichApplication = Application & {
  worker: {
    id: string
    hourly_rate: number | null
    availability: string | null
    profile: {
      full_name: string | null
      avatar_url: string | null
      location: string | null
    } | null
  } | null
}

const STATUS_META: Record<ApplicationStatus, { label: string; classes: string }> = {
  pending:     { label: 'Pending',     classes: 'bg-amber-50 text-amber-700 border-amber-200' },
  reviewed:    { label: 'Reviewed',    classes: 'bg-blue-50 text-blue-700 border-blue-200' },
  shortlisted: { label: 'Shortlisted', classes: 'bg-violet-50 text-violet-700 border-violet-200' },
  offered:     { label: 'Offered',     classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  accepted:    { label: 'Accepted',    classes: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
  rejected:    { label: 'Rejected',    classes: 'bg-red-50 text-red-600 border-red-200' },
  withdrawn:   { label: 'Withdrawn',   classes: 'bg-gray-100 text-gray-500 border-gray-200' },
}

const TABS = [
  { key: 'all',         label: 'All' },
  { key: 'pending',     label: 'Pending' },
  { key: 'shortlisted', label: 'Shortlisted' },
  { key: 'offered',     label: 'Offered' },
  { key: 'rejected',    label: 'Rejected' },
] as const
type TabKey = typeof TABS[number]['key']

export default function JobApplications() {
  const { id } = useParams<{ id: string }>()
  const { applications, loading, error, fetchJobApplications, updateApplicationStatus } = useApplications()
  const { fetchJobById } = useJobPosts()
  const [job, setJob] = useState<JobPost | null>(null)
  const [tab, setTab] = useState<TabKey>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    fetchJobApplications(id)
    fetchJobById(id).then(({ data }) => { if (data) setJob(data as JobPost) })
  }, [id])

  async function handleStatus(appId: string, status: ApplicationStatus) {
    setUpdating(appId)
    await updateApplicationStatus(appId, status)
    setUpdating(null)
  }

  const rich = applications as RichApplication[]

  const filtered = rich.filter(a => {
    if (tab === 'all') return true
    if (tab === 'pending') return a.status === 'pending' || a.status === 'reviewed'
    return a.status === tab
  })

  const counts = {
    all:         rich.length,
    pending:     rich.filter(a => a.status === 'pending' || a.status === 'reviewed').length,
    shortlisted: rich.filter(a => a.status === 'shortlisted').length,
    offered:     rich.filter(a => a.status === 'offered').length,
    rejected:    rich.filter(a => a.status === 'rejected').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[oklch(0.18_0.05_239)] via-[oklch(0.22_0.07_245)] to-[oklch(0.26_0.09_255)] px-6 py-8 md:px-10 shadow-lg">
        <div className="pointer-events-none absolute -top-12 -right-12 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative z-10 space-y-3">
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors">
            <ArrowLeftIcon className="size-4" /> Back to dashboard
          </Link>
          <div>
            <div className="flex items-center gap-2 text-primary/80 text-sm font-medium">
              <UsersIcon className="size-4" /> Applicants
            </div>
            <h1 className="text-2xl font-bold text-white">{job?.title ?? 'Job applications'}</h1>
            <p className="text-white/60 text-sm mt-1">
              {rich.length} {rich.length === 1 ? 'application' : 'applications'} received
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-muted/60 p-1 w-fit flex-wrap">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
            <span className="ml-1.5 text-xs text-muted-foreground">{counts[t.key]}</span>
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 rounded-xl border bg-card animate-pulse" />)}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-xl border bg-card px-6 py-16 text-center space-y-3">
          <UsersIcon className="size-10 mx-auto text-muted-foreground/40" />
          <p className="font-medium">{tab === 'all' ? 'No applications yet' : `No ${tab} applications`}</p>
          <p className="text-sm text-muted-foreground">
            {tab === 'all' ? 'Applications will appear here once workers apply.' : 'Switch to All to see everything.'}
          </p>
        </div>
      )}

      {/* Application cards */}
      {!loading && (
        <div className="space-y-3">
          {filtered.map(app => {
            const w = app.worker
            const name = w?.profile?.full_name ?? 'Anonymous worker'
            const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
            const meta = STATUS_META[app.status]
            const isExpanded = expandedId === app.id
            const isUpdating = updating === app.id
            const isClosed = app.status === 'rejected' || app.status === 'withdrawn'

            return (
              <Card key={app.id} className={`overflow-hidden shadow-sm transition-all ${isClosed ? 'opacity-60' : ''}`}>
                <CardContent className="space-y-0 p-0">
                  {/* Main row */}
                  <div className="flex items-start gap-4 p-4">
                    {/* Avatar */}
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {initials}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-base leading-snug">{name}</p>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mt-0.5">
                            {w?.profile?.location && (
                              <span className="flex items-center gap-1"><MapPinIcon className="size-3" />{w.profile.location}</span>
                            )}
                            {w?.hourly_rate && (
                              <span className="flex items-center gap-1"><BanknoteIcon className="size-3" />RWF {w.hourly_rate.toLocaleString()}/hr</span>
                            )}
                            {w?.availability && (
                              <span className="capitalize">{w.availability.replace('_', ' ')}</span>
                            )}
                          </div>
                        </div>
                        <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.classes}`}>
                          {meta.label}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        Applied {new Date(app.applied_at).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Expand cover note */}
                    {app.cover_note && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : app.id)}
                        className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-muted transition-colors"
                      >
                        {isExpanded ? <ChevronUpIcon className="size-4" /> : <ChevronDownIcon className="size-4" />}
                      </button>
                    )}
                  </div>

                  {/* Cover note */}
                  {isExpanded && app.cover_note && (
                    <div className="border-t bg-muted/30 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Cover note</p>
                      <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-line">{app.cover_note}</p>
                    </div>
                  )}

                  {/* Action bar */}
                  {!isClosed && (
                    <div className="border-t px-4 py-2.5 flex items-center gap-2 bg-muted/20 flex-wrap">
                      {app.status === 'pending' && (
                        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1.5 text-blue-600 hover:bg-blue-50"
                          disabled={isUpdating} onClick={() => handleStatus(app.id, 'reviewed')}>
                          <EyeIcon className="size-3.5" /> Mark reviewed
                        </Button>
                      )}
                      {(app.status === 'pending' || app.status === 'reviewed') && (
                        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1.5 text-violet-600 hover:bg-violet-50"
                          disabled={isUpdating} onClick={() => handleStatus(app.id, 'shortlisted')}>
                          <StarIcon className="size-3.5" /> Shortlist
                        </Button>
                      )}
                      {(app.status === 'shortlisted' || app.status === 'reviewed') && (
                        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1.5 text-emerald-600 hover:bg-emerald-50"
                          disabled={isUpdating} onClick={() => handleStatus(app.id, 'offered')}>
                          <SendIcon className="size-3.5" /> Send offer
                        </Button>
                      )}
                      {app.status !== 'rejected' && (
                        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1.5 text-destructive hover:bg-destructive/10 ml-auto"
                          disabled={isUpdating} onClick={() => handleStatus(app.id, 'rejected')}>
                          <XCircleIcon className="size-3.5" /> Reject
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
