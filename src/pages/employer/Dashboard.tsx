import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BriefcaseIcon, UsersIcon, PlusIcon, PencilIcon,
  ChevronRightIcon, TrendingUpIcon, ClockIcon, CheckCircleIcon,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useJobPosts } from '@/hooks/useJobPosts'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { JobPost, JobType } from '@/types/jobs'

type JobWithCount = JobPost & {
  trade: { name: string } | null
  _applications_count: { count: number }[]
}

const JOB_TYPE_LABELS: Record<JobType, string> = {
  full_time: 'Full-time', part_time: 'Part-time', contract: 'Contract', casual: 'Casual',
}

const STATUS_STYLES: Record<string, string> = {
  open:   'bg-emerald-100 text-emerald-700',
  draft:  'bg-gray-100 text-gray-600',
  closed: 'bg-red-100 text-red-600',
  filled: 'bg-blue-100 text-blue-700',
}

export default function Dashboard() {
  const { user, profile } = useAuth()
  const { fetchMyJobs } = useJobPosts()
  const [jobs, setJobs] = useState<JobWithCount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await fetchMyJobs()
      if (data) setJobs(data as JobWithCount[])
      setLoading(false)
    }
    load()
  }, [])

  const openJobs   = jobs.filter(j => j.status === 'open')
  const totalApps  = jobs.reduce((sum, j) => sum + (j._applications_count?.[0]?.count ?? 0), 0)
  const draftJobs  = jobs.filter(j => j.status === 'draft')

  const stats = [
    { label: 'Total postings', value: jobs.length,     icon: BriefcaseIcon,   color: 'text-primary bg-primary/10' },
    { label: 'Open now',       value: openJobs.length,  icon: TrendingUpIcon,  color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Drafts',         value: draftJobs.length, icon: ClockIcon,       color: 'text-amber-600 bg-amber-50' },
    { label: 'Applications',   value: totalApps,        icon: UsersIcon,       color: 'text-violet-600 bg-violet-50' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[oklch(0.18_0.05_239)] via-[oklch(0.22_0.07_245)] to-[oklch(0.26_0.09_255)] px-6 py-8 md:px-10 shadow-lg">
        <div className="pointer-events-none absolute -top-12 -right-12 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-primary/80 text-sm font-medium">Employer Dashboard</p>
            <h1 className="text-2xl font-bold text-white">
              Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
            </h1>
            <p className="text-white/60 text-sm">Manage your job postings and applicants</p>
          </div>
          <Link to="/jobs/new">
            <Button className="shrink-0 gap-2 bg-white text-foreground hover:bg-white/90">
              <PlusIcon className="size-4" />
              Post a job
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="shadow-sm">
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${color}`}>
                <Icon className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{loading ? '—' : value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Job listings */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-semibold">Your job postings</h2>
          <Link to="/jobs/new">
            <Button variant="ghost" size="sm" className="gap-1.5 text-sm">
              <PlusIcon className="size-4" /> New posting
            </Button>
          </Link>
        </div>

        {loading && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-xl border bg-card animate-pulse" />)}
          </div>
        )}

        {!loading && jobs.length === 0 && (
          <Card>
            <CardContent className="py-14 text-center space-y-3">
              <BriefcaseIcon className="size-10 mx-auto text-muted-foreground/40" />
              <p className="font-medium">No job postings yet</p>
              <p className="text-sm text-muted-foreground">Create your first posting to start receiving applications.</p>
              <Link to="/jobs/new"><Button className="mt-1">Post your first job</Button></Link>
            </CardContent>
          </Card>
        )}

        {!loading && jobs.map(job => {
          const appCount = job._applications_count?.[0]?.count ?? 0
          return (
            <Card key={job.id} className="overflow-hidden shadow-sm hover:shadow-md transition-all group">
              <div className={`h-0.5 ${job.status === 'open' ? 'bg-emerald-400' : 'bg-muted-foreground/30'}`} />
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-base leading-snug">{job.title}</h3>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[job.status] ?? 'bg-muted text-muted-foreground'}`}>
                      {job.status}
                    </span>
                    {job.job_type && (
                      <span className="rounded-full bg-secondary text-secondary-foreground px-2.5 py-0.5 text-xs font-medium">
                        {JOB_TYPE_LABELS[job.job_type as JobType]}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {job.location && <span>{job.location}</span>}
                    {job.trade?.name && <span>{job.trade.name}</span>}
                    <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* App count */}
                <Link to={`/jobs/${job.id}/applications`} className="shrink-0 flex flex-col items-center gap-0.5 text-center rounded-lg px-3 py-2 hover:bg-muted transition-colors">
                  <span className="text-xl font-bold">{appCount}</span>
                  <span className="text-xs text-muted-foreground">{appCount === 1 ? 'applicant' : 'applicants'}</span>
                </Link>

                {/* Actions */}
                <div className="shrink-0 flex items-center gap-2">
                  <Link to={`/jobs/${job.id}/edit`}>
                    <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs">
                      <PencilIcon className="size-3" /> Edit
                    </Button>
                  </Link>
                  <Link to={`/jobs/${job.id}/applications`}>
                    <Button size="sm" variant="ghost" className="gap-1 h-8 text-xs text-primary">
                      Applicants <ChevronRightIcon className="size-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
