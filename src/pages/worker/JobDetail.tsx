import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  MapPinIcon,
  ClockIcon,
  BanknoteIcon,
  BriefcaseIcon,
  ArrowLeftIcon,
  BookmarkIcon,
  BookmarkCheckIcon,
  CalendarIcon,
  CheckCircle2Icon,
  BuildingIcon,
  SendIcon,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useJobPosts } from '@/hooks/useJobPosts'
import { useApplications } from '@/hooks/useApplications'
import { useSavedJobs } from '@/hooks/useSavedJobs'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { JobPost, JobType, PayType } from '@/types/jobs'
import type { Application } from '@/types/applications'

type FullJob = JobPost & {
  trade: { name: string } | null
  employer: { company_name: string | null; profile: { full_name: string | null } | null } | null
  skills: { skill: { id: number; name: string } }[]
  perks: { perk: string }[]
}

const JOB_TYPE_LABELS: Record<JobType, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  contract: 'Contract',
  casual: 'Casual',
}

const JOB_TYPE_COLORS: Record<JobType, string> = {
  full_time: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  part_time: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  contract: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  casual: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
}

const PAY_TYPE_LABELS: Record<PayType, string> = {
  Hourly:    '/hr',
  Weekly:    '/wk',
  Daily:     '/day',
  Monthly:   '/mo',
  'One Time': ' (fixed)',
}

const STATUS_STYLES: Record<string, string> = {
  pending:     'bg-amber-50 text-amber-700 border-amber-200',
  reviewed:    'bg-blue-50 text-blue-700 border-blue-200',
  shortlisted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected:    'bg-red-50 text-red-700 border-red-200',
  offered:     'bg-violet-50 text-violet-700 border-violet-200',
  accepted:    'bg-emerald-50 text-emerald-800 border-emerald-300',
  withdrawn:   'bg-gray-50 text-gray-600 border-gray-200',
}

export default function JobDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const { fetchJobById } = useJobPosts()
  const { applyToJob } = useApplications()
  const { saveJob, unsaveJob, fetchSavedJobs, isSaved } = useSavedJobs()

  const [job, setJob] = useState<FullJob | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [existingApplication, setExistingApplication] = useState<Application | null>(null)
  const [showApplyForm, setShowApplyForm] = useState(false)
  const [coverNote, setCoverNote] = useState('')
  const [applying, setApplying] = useState(false)
  const [applyError, setApplyError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const isWorker = profile?.role === 'worker'
  const jobSaved = id ? isSaved(id) : false

  useEffect(() => {
    if (!id) return
    async function load() {
      setLoading(true)
      const { data, error } = await fetchJobById(id!)
      if (error) setError(error.message)
      else setJob(data as FullJob)
      setLoading(false)
    }
    load()
  }, [id])

  useEffect(() => {
    if (!user || !id || !isWorker) return
    fetchSavedJobs()
    async function checkApplication() {
      const { supabase } = await import('@/lib/supabase')
      const { data } = await supabase
        .from('applications')
        .select('*')
        .eq('job_post_id', id!)
        .eq('worker_id', user!.id)
        .maybeSingle()
      if (data) setExistingApplication(data)
    }
    checkApplication()
  }, [user, id, isWorker])

  async function handleApply() {
    if (!user || !id) return
    setApplying(true)
    setApplyError(null)
    const { error } = await applyToJob({
      job_post_id: id,
      worker_id: user.id,
      cover_note: coverNote.trim() || null,
    })
    if (error) {
      setApplyError(error.message)
    } else {
      setExistingApplication({
        id: '', job_post_id: id, worker_id: user.id,
        cover_note: coverNote || null, status: 'pending',
        applied_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      })
      setShowApplyForm(false)
      setCoverNote('')
    }
    setApplying(false)
  }

  async function handleToggleSave() {
    if (!user || !id) return
    setSaving(true)
    if (jobSaved) await unsaveJob(id, user.id)
    else await saveJob(id, user.id)
    setSaving(false)
  }

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-0 animate-pulse">
        <div className="h-64 rounded-2xl bg-muted" />
        <div className="mx-auto max-w-5xl px-4 mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <div className="h-4 rounded bg-muted w-3/4" />
            <div className="h-4 rounded bg-muted w-full" />
            <div className="h-4 rounded bg-muted w-5/6" />
          </div>
          <div className="h-48 rounded-xl bg-muted" />
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="py-16 text-center space-y-3">
        <p className="text-destructive font-medium">{error ?? 'Job not found.'}</p>
        <Button variant="outline" onClick={() => navigate(-1)}>Go back</Button>
      </div>
    )
  }

  const payLabel = job.pay_rate && job.pay_type
    ? `RWF ${job.pay_rate.toLocaleString()}${PAY_TYPE_LABELS[job.pay_type]}`
    : null

  const companyName =
    job.employer?.company_name ?? job.employer?.profile?.full_name ?? 'Unknown employer'

  return (
    <div className="space-y-6">

      {/* ── Hero Banner ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[oklch(0.18_0.05_239)] via-[oklch(0.22_0.07_245)] to-[oklch(0.26_0.09_255)] px-6 pt-8 pb-10 md:px-10 shadow-lg">
        {/* Orbs */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 left-1/3 h-48 w-96 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative z-10 space-y-5">
          {/* Back */}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="size-4" />
            Back to jobs
          </Link>

          {/* Trade + Job type badges */}
          <div className="flex flex-wrap items-center gap-2">
            {job.trade && (
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-0.5 text-xs font-medium text-white/90 backdrop-blur-sm">
                {job.trade.name}
              </span>
            )}
            {job.job_type && (
              <span className={`rounded-full border px-3 py-0.5 text-xs font-semibold backdrop-blur-sm ${JOB_TYPE_COLORS[job.job_type]}`}>
                {JOB_TYPE_LABELS[job.job_type]}
              </span>
            )}
          </div>

          {/* Title + company */}
          <div>
            <h1 className="text-3xl font-bold text-white leading-tight md:text-4xl">
              {job.title}
            </h1>
            <div className="mt-2 flex items-center gap-2 text-white/70">
              <BuildingIcon className="size-4 shrink-0" />
              <span className="text-base font-medium">{companyName}</span>
            </div>
          </div>

          {/* Quick-meta chips */}
          <div className="flex flex-wrap gap-2.5">
            {job.location && (
              <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-sm text-white/80 backdrop-blur-sm">
                <MapPinIcon className="size-3.5 text-primary/80" />
                {job.location}
              </div>
            )}
            {payLabel && (
              <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-sm text-white font-semibold backdrop-blur-sm">
                <BanknoteIcon className="size-3.5 text-primary/80" />
                {payLabel}
              </div>
            )}
            {job.starts_at && (
              <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-sm text-white/80 backdrop-blur-sm">
                <CalendarIcon className="size-3.5 text-primary/80" />
                Starts {new Date(job.starts_at).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

          {/* ── Left: Main content ─────────────────────────────────────── */}
          <div className="md:col-span-2 space-y-5">

            {/* Description */}
            {job.description && (
              <Card className="shadow-sm">
                <CardContent className="space-y-3">
                  <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    <BriefcaseIcon className="size-4" />
                    About the role
                  </h2>
                  <p className="text-sm leading-7 whitespace-pre-line text-foreground/80">
                    {job.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Skills */}
            {job.skills?.length > 0 && (
              <Card className="shadow-sm">
                <CardContent className="space-y-3">
                  <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    <CheckCircle2Icon className="size-4" />
                    Required skills
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map(({ skill }) => (
                      <span
                        key={skill.id}
                        className="rounded-full border border-primary/25 bg-primary/8 text-primary px-3 py-1 text-sm font-medium"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Perks */}
            {job.perks?.length > 0 && (
              <Card className="shadow-sm">
                <CardContent className="space-y-3">
                  <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    <CheckCircle2Icon className="size-4" />
                    Perks & benefits
                  </h2>
                  <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {job.perks.map(({ perk }, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-sm">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <span className="size-1.5 rounded-full bg-primary" />
                        </span>
                        {perk}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Posted date footer */}
            <p className="pb-8 text-xs text-muted-foreground px-1">
              Posted {new Date(job.created_at).toLocaleDateString()}
              {job.expires_at && ` · Expires ${new Date(job.expires_at).toLocaleDateString()}`}
            </p>
          </div>

          {/* ── Right: Sticky sidebar ──────────────────────────────────── */}
          <div className="space-y-4">
            <div className="md:sticky md:top-20 space-y-4">

              {/* Apply card */}
              {isWorker && (
                <Card className="shadow-md overflow-hidden">
                  <div className="h-1.5 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
                  <CardContent className="space-y-4 pt-5">
                    {existingApplication ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2Icon className="size-5 text-emerald-500 shrink-0" />
                          <span className="font-semibold text-sm">Application submitted</span>
                        </div>
                        <div className={`rounded-lg border px-4 py-3 text-sm font-medium capitalize ${STATUS_STYLES[existingApplication.status] ?? 'bg-muted text-foreground border-border'}`}>
                          Status: {existingApplication.status}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {!showApplyForm ? (
                          <>
                            <p className="text-sm text-muted-foreground">
                              Ready to apply? Submit your application with an optional cover note.
                            </p>
                            <Button
                              className="w-full gap-2"
                              onClick={() => setShowApplyForm(true)}
                            >
                              <SendIcon className="size-4" />
                              Apply now
                            </Button>
                          </>
                        ) : (
                          <div className="space-y-3">
                            <label className="block text-sm font-medium">
                              Cover note
                              <span className="text-muted-foreground font-normal ml-1">(optional)</span>
                            </label>
                            <textarea
                              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[120px] resize-y"
                              placeholder="Briefly introduce yourself and why you're a great fit…"
                              value={coverNote}
                              onChange={e => setCoverNote(e.target.value)}
                            />
                            {applyError && (
                              <p className="text-xs text-destructive">{applyError}</p>
                            )}
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setShowApplyForm(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                className="flex-1 gap-2"
                                onClick={handleApply}
                                disabled={applying}
                              >
                                {applying ? 'Sending…' : 'Submit'}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="border-t pt-3">
                      <button
                        onClick={handleToggleSave}
                        disabled={saving}
                        className={`w-full flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                          jobSaved
                            ? 'border-primary/30 bg-primary/8 text-primary'
                            : 'border-border bg-background text-muted-foreground hover:text-foreground hover:bg-accent'
                        }`}
                      >
                        {jobSaved
                          ? <><BookmarkCheckIcon className="size-4" /> Saved</>
                          : <><BookmarkIcon className="size-4" /> Save job</>
                        }
                      </button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Job overview card */}
              <Card className="shadow-sm">
                <CardContent className="space-y-1">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Job overview
                  </h3>
                  {[
                    job.trade && { icon: BriefcaseIcon, label: 'Trade', value: job.trade.name },
                    job.location && { icon: MapPinIcon, label: 'Location', value: job.location },
                    payLabel && { icon: BanknoteIcon, label: 'Pay', value: payLabel },
                    job.job_type && { icon: ClockIcon, label: 'Type', value: JOB_TYPE_LABELS[job.job_type] },
                    job.starts_at && { icon: CalendarIcon, label: 'Start date', value: new Date(job.starts_at).toLocaleDateString() },
                  ].filter(Boolean).map((item: any) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/8">
                        <item.icon className="size-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className="text-sm font-medium truncate">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

            </div>{/* end sticky */}
          </div>{/* end right col */}

      </div>{/* end grid */}
    </div>
  )
}
