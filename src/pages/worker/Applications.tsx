import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BriefcaseIcon,
  MapPinIcon,
  BanknoteIcon,
  ClockIcon,
  FileTextIcon,
  XCircleIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from 'lucide-react'
import { useApplications } from '@/hooks/useApplications'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { ApplicationStatus, Application } from '@/types/applications'
import type { JobType, PayType } from '@/types/jobs'

type RichApplication = Application & {
  job: {
    id: string
    title: string
    location: string | null
    job_type: JobType | null
    pay_rate: number | null
    pay_type: PayType | null
    employer: { company_name: string | null } | null
  } | null
}

const STATUS_META: Record<ApplicationStatus, { label: string; classes: string; dot: string }> = {
  pending:     { label: 'Pending',     classes: 'bg-amber-50 text-amber-700 border-amber-200',    dot: 'bg-amber-400' },
  reviewed:    { label: 'Reviewed',    classes: 'bg-blue-50 text-blue-700 border-blue-200',       dot: 'bg-blue-400' },
  shortlisted: { label: 'Shortlisted', classes: 'bg-violet-50 text-violet-700 border-violet-200', dot: 'bg-violet-500' },
  offered:     { label: 'Offered',     classes: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  accepted:    { label: 'Accepted',    classes: 'bg-emerald-50 text-emerald-800 border-emerald-300', dot: 'bg-emerald-600' },
  rejected:    { label: 'Rejected',    classes: 'bg-red-50 text-red-600 border-red-200',          dot: 'bg-red-400' },
  withdrawn:   { label: 'Withdrawn',   classes: 'bg-gray-100 text-gray-500 border-gray-200',      dot: 'bg-gray-400' },
}

const JOB_TYPE_LABELS: Record<JobType, string> = {
  full_time: 'Full-time', part_time: 'Part-time', contract: 'Contract', casual: 'Casual',
}

const PAY_TYPE_LABELS: Record<PayType, string> = {
  Hourly: '/hr', Weekly: '/wk', Daily: '/day', Monthly: '/mo', 'One Time': ' (fixed)',
}

const TABS = [
  { key: 'all',      label: 'All' },
  { key: 'active',   label: 'Active' },
  { key: 'closed',   label: 'Closed' },
] as const

type TabKey = typeof TABS[number]['key']

const ACTIVE_STATUSES: ApplicationStatus[] = ['pending', 'reviewed', 'shortlisted', 'offered', 'accepted']
const CLOSED_STATUSES: ApplicationStatus[] = ['rejected', 'withdrawn']
const WITHDRAWABLE: ApplicationStatus[] = ['pending', 'reviewed', 'shortlisted']

export default function Applications() {
  const { user } = useAuth()
  const { applications, loading, error, fetchMyApplications, withdrawApplication, updateApplicationStatus, deleteApplication } = useApplications()
  const [tab, setTab] = useState<TabKey>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [withdrawing, setWithdrawing] = useState<string | null>(null)
  const [responding, setResponding] = useState<string | null>(null)

  useEffect(() => { fetchMyApplications() }, [])

  async function handleWithdraw(id: string) {
    setWithdrawing(id)
    await withdrawApplication(id)
    setWithdrawing(null)
  }

  async function handleDelete(id: string) {
    await deleteApplication(id)
  }

  async function handleAccept(id: string) {
    setResponding(id)
    await updateApplicationStatus(id, 'accepted')
    setResponding(null)
  }

  async function handleDecline(id: string) {
    setResponding(id)
    await updateApplicationStatus(id, 'rejected')
    setResponding(null)
  }

  const rich = applications as RichApplication[]

  const filtered = rich.filter(a => {
    if (tab === 'active') return ACTIVE_STATUSES.includes(a.status)
    if (tab === 'closed') return CLOSED_STATUSES.includes(a.status)
    return true
  })

  const counts = {
    all: rich.length,
    active: rich.filter(a => ACTIVE_STATUSES.includes(a.status)).length,
    closed: rich.filter(a => CLOSED_STATUSES.includes(a.status)).length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[oklch(0.18_0.05_239)] via-[oklch(0.22_0.07_245)] to-[oklch(0.26_0.09_255)] px-6 py-8 md:px-10 shadow-lg">
        <div className="pointer-events-none absolute -top-12 -right-12 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2 text-primary/80 text-sm font-medium">
            <FileTextIcon className="size-4" />
            My Applications
          </div>
          <h1 className="text-2xl font-bold text-white">Track your job applications</h1>
          <p className="text-white/60 text-sm">
            {counts.all === 0 ? 'No applications yet' : `${counts.all} application${counts.all !== 1 ? 's' : ''} · ${counts.active} active`}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-muted/60 p-1 w-fit">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
            <span className={`ml-1.5 text-xs ${tab === t.key ? 'text-muted-foreground' : 'text-muted-foreground/60'}`}>
              {counts[t.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl border bg-card animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-xl border bg-card px-6 py-16 text-center space-y-3">
          <FileTextIcon className="size-10 mx-auto text-muted-foreground/40" />
          <p className="font-medium">
            {tab === 'all' ? 'No applications yet' : `No ${tab} applications`}
          </p>
          <p className="text-sm text-muted-foreground">
            {tab === 'all'
              ? 'Browse open jobs and hit Apply now to get started.'
              : 'Switch to the All tab to see everything.'}
          </p>
          {tab === 'all' && (
            <Link to="/">
              <Button className="mt-2">Browse jobs</Button>
            </Link>
          )}
        </div>
      )}

      {/* Application cards */}
      {!loading && (
        <div className="space-y-3">
          {filtered.map(app => {
            const job = app.job
            const meta = STATUS_META[app.status]
            const payLabel = job?.pay_rate && job?.pay_type
              ? `RWF ${job.pay_rate.toLocaleString()}${PAY_TYPE_LABELS[job.pay_type]}`
              : null
            const isExpanded = expandedId === app.id
            const isWithdrawable = WITHDRAWABLE.includes(app.status)
            const isOffered = app.status === 'offered'
            const isClosed = CLOSED_STATUSES.includes(app.status)

            return (
              <Card key={app.id} className={`overflow-hidden shadow-sm transition-all ${isClosed ? 'opacity-70' : ''}`}>
                <div className={`h-0.5 ${meta.dot}`} />
                <CardContent className="space-y-0 p-0">
                  {/* Main row */}
                  <div className="flex items-start gap-4 p-4">
                    {/* Status dot */}
                    <div className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                      <span className={`size-3 rounded-full ${meta.dot}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link
                            to={job ? `/jobs/${job.id}` : '#'}
                            className="font-semibold text-base hover:text-primary transition-colors leading-snug"
                          >
                            {job?.title ?? 'Unknown job'}
                          </Link>
                          {job?.employer?.company_name && (
                            <p className="text-sm text-muted-foreground">{job.employer.company_name}</p>
                          )}
                        </div>
                        <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.classes}`}>
                          {meta.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {job?.location && (
                          <span className="flex items-center gap-1">
                            <MapPinIcon className="size-3" />
                            {job.location}
                          </span>
                        )}
                        {payLabel && (
                          <span className="flex items-center gap-1 font-medium text-foreground">
                            <BanknoteIcon className="size-3" />
                            {payLabel}
                          </span>
                        )}
                        {job?.job_type && (
                          <span className="flex items-center gap-1">
                            <BriefcaseIcon className="size-3" />
                            {JOB_TYPE_LABELS[job.job_type]}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <ClockIcon className="size-3" />
                          Applied {new Date(app.applied_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Expand toggle */}
                    {app.cover_note && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : app.id)}
                        className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-muted transition-colors"
                        aria-label="Toggle cover note"
                      >
                        {isExpanded ? <ChevronUpIcon className="size-4" /> : <ChevronDownIcon className="size-4" />}
                      </button>
                    )}
                  </div>

                  {/* Cover note expand */}
                  {isExpanded && app.cover_note && (
                    <div className="border-t bg-muted/30 px-4 py-3 mx-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Your cover note</p>
                      <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{app.cover_note}</p>
                    </div>
                  )}

                  {/* Actions */}
                  {(isWithdrawable || isOffered || isClosed) && (
                    <div className="border-t px-4 py-2.5 flex items-center gap-2 bg-muted/20">
                      {isOffered && (
                        <>
                          <Button
                            size="sm"
                            className="text-xs h-7 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                            disabled={responding === app.id}
                            onClick={() => handleAccept(app.id)}
                          >
                            <CheckCircleIcon className="size-3.5" />
                            {responding === app.id ? 'Accepting…' : 'Accept offer'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-xs h-7 gap-1.5"
                            disabled={responding === app.id}
                            onClick={() => handleDecline(app.id)}
                          >
                            <XCircleIcon className="size-3.5" />
                            Decline
                          </Button>
                        </>
                      )}
                      {isWithdrawable && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-xs h-7 gap-1.5"
                          disabled={withdrawing === app.id}
                          onClick={() => handleWithdraw(app.id)}
                        >
                          <XCircleIcon className="size-3.5" />
                          {withdrawing === app.id ? 'Withdrawing…' : 'Withdraw'}
                        </Button>
                      )}
                      {isClosed && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-xs h-7 gap-1.5"
                          onClick={() => handleDelete(app.id)}
                        >
                          <XCircleIcon className="size-3.5" />
                          Remove
                        </Button>
                      )}
                      {isWithdrawable && (
                        <Link to={job ? `/jobs/${job.id}` : '#'}>
                          <Button size="sm" variant="ghost" className="text-xs h-7">
                            View job
                          </Button>
                        </Link>
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
