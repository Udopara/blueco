import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookmarkIcon,
  MapPinIcon,
  BanknoteIcon,
  BriefcaseIcon,
  BuildingIcon,
  XIcon,
  ArrowRightIcon,
} from 'lucide-react'
import { useSavedJobs } from '@/hooks/useSavedJobs'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { SavedJob } from '@/types/applications'
import type { JobType, PayType, JobStatus } from '@/types/jobs'

type RichSavedJob = SavedJob & {
  job: {
    id: string
    title: string
    location: string | null
    job_type: JobType | null
    pay_rate: number | null
    pay_type: PayType | null
    status: JobStatus
    trade: { name: string } | null
    employer: { company_name: string | null } | null
  } | null
}

const JOB_TYPE_LABELS: Record<JobType, string> = {
  full_time: 'Full-time', part_time: 'Part-time', contract: 'Contract', casual: 'Casual',
}

const JOB_TYPE_COLORS: Record<JobType, string> = {
  full_time: 'bg-emerald-100 text-emerald-700',
  part_time: 'bg-sky-100 text-sky-700',
  contract:  'bg-violet-100 text-violet-700',
  casual:    'bg-amber-100 text-amber-700',
}

const PAY_TYPE_LABELS: Record<PayType, string> = {
  Hourly: '/hr', Weekly: '/wk', Daily: '/day', Monthly: '/mo', 'One Time': ' (fixed)',
}

export default function SavedJobs() {
  const { user } = useAuth()
  const { savedJobs, loading, error, fetchSavedJobs, unsaveJob } = useSavedJobs()
  const [removing, setRemoving] = useState<string | null>(null)

  useEffect(() => { fetchSavedJobs() }, [])

  async function handleUnsave(jobPostId: string) {
    if (!user) return
    setRemoving(jobPostId)
    await unsaveJob(jobPostId, user.id)
    setRemoving(null)
  }

  const rich = savedJobs as RichSavedJob[]
  const openJobs = rich.filter(s => s.job?.status === 'open')
  const closedJobs = rich.filter(s => s.job && s.job.status !== 'open')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[oklch(0.18_0.05_239)] via-[oklch(0.22_0.07_245)] to-[oklch(0.26_0.09_255)] px-6 py-8 md:px-10 shadow-lg">
        <div className="pointer-events-none absolute -top-12 -right-12 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2 text-primary/80 text-sm font-medium">
            <BookmarkIcon className="size-4" />
            Saved Jobs
          </div>
          <h1 className="text-2xl font-bold text-white">Your saved positions</h1>
          <p className="text-white/60 text-sm">
            {rich.length === 0
              ? 'No saved jobs yet'
              : `${rich.length} saved · ${openJobs.length} still open`}
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 rounded-xl border bg-card animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Empty state */}
      {!loading && !error && rich.length === 0 && (
        <div className="rounded-xl border bg-card px-6 py-16 text-center space-y-3">
          <BookmarkIcon className="size-10 mx-auto text-muted-foreground/40" />
          <p className="font-medium">Nothing saved yet</p>
          <p className="text-sm text-muted-foreground">
            Bookmark jobs you're interested in — they'll appear here.
          </p>
          <Link to="/">
            <Button className="mt-2">Browse jobs</Button>
          </Link>
        </div>
      )}

      {/* Open jobs */}
      {!loading && openJobs.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
            Open · {openJobs.length}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {openJobs.map(saved => (
              <SavedJobCard
                key={saved.job_post_id}
                saved={saved}
                onUnsave={handleUnsave}
                removing={removing}
              />
            ))}
          </div>
        </section>
      )}

      {/* Closed/filled jobs */}
      {!loading && closedJobs.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
            Closed / Filled · {closedJobs.length}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 opacity-60">
            {closedJobs.map(saved => (
              <SavedJobCard
                key={saved.job_post_id}
                saved={saved}
                onUnsave={handleUnsave}
                removing={removing}
                closed
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function SavedJobCard({
  saved,
  onUnsave,
  removing,
  closed = false,
}: {
  saved: RichSavedJob
  onUnsave: (id: string) => void
  removing: string | null
  closed?: boolean
}) {
  const job = saved.job
  if (!job) return null

  const payLabel = job.pay_rate && job.pay_type
    ? `RWF ${job.pay_rate.toLocaleString()}${PAY_TYPE_LABELS[job.pay_type]}`
    : null

  return (
    <Card className="group relative overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex flex-col">
      {/* Accent bar */}
      <div className={`h-1 w-full ${closed ? 'bg-muted-foreground/30' : 'bg-primary/60 group-hover:bg-primary transition-colors duration-200'}`} />

      <CardContent className="flex flex-col flex-1 gap-3 p-4">
        {/* Remove button */}
        <button
          onClick={() => onUnsave(saved.job_post_id)}
          disabled={removing === saved.job_post_id}
          className="absolute top-3 right-3 rounded-md p-1 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
          aria-label="Remove from saved"
        >
          <XIcon className="size-3.5" />
        </button>

        {/* Title + badges */}
        <div className="pr-6 space-y-1">
          <div className="flex items-start gap-2 flex-wrap">
            {job.job_type && (
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${JOB_TYPE_COLORS[job.job_type]}`}>
                {JOB_TYPE_LABELS[job.job_type]}
              </span>
            )}
            {closed && (
              <span className="rounded-full px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-500 capitalize">
                {job.status}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-base leading-snug group-hover:text-primary transition-colors">
            {job.title}
          </h3>
        </div>

        {/* Meta */}
        <div className="flex flex-col gap-1.5 text-sm text-muted-foreground flex-1">
          {job.employer?.company_name && (
            <span className="flex items-center gap-1.5 text-foreground/70 font-medium text-xs">
              <BuildingIcon className="size-3.5 text-primary/50 shrink-0" />
              {job.employer.company_name}
            </span>
          )}
          {job.trade?.name && (
            <span className="flex items-center gap-1.5 text-xs">
              <BriefcaseIcon className="size-3.5 text-primary/50 shrink-0" />
              {job.trade.name}
            </span>
          )}
          {job.location && (
            <span className="flex items-center gap-1.5 text-xs">
              <MapPinIcon className="size-3.5 text-primary/50 shrink-0" />
              {job.location}
            </span>
          )}
          {payLabel && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-foreground">
              <BanknoteIcon className="size-3.5 text-primary/50 shrink-0" />
              {payLabel}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Saved {new Date(saved.saved_at).toLocaleDateString()}
          </p>
          {!closed && (
            <Link to={`/jobs/${job.id}`}>
              <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-primary hover:text-primary">
                Apply
                <ArrowRightIcon className="size-3" />
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
