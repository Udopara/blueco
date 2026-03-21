import { MapPinIcon, ClockIcon, BanknoteIcon, BriefcaseIcon } from "lucide-react"
import { Link } from "react-router-dom"
import type { JobPost, JobType, PayType } from "@/types/jobs"

const JOB_TYPE_LABELS: Record<JobType, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  casual: "Casual",
}

const PAY_TYPE_LABELS: Record<PayType, string> = {
  Hourly:    "/hr",
  Weekly:    "/wk",
  Daily:     "/day",
  Monthly:   "/mo",
  "One Time": " (fixed)",
}

const JOB_TYPE_COLORS: Record<JobType, string> = {
  full_time: "bg-emerald-100 text-emerald-700",
  part_time: "bg-sky-100 text-sky-700",
  contract: "bg-violet-100 text-violet-700",
  casual: "bg-amber-100 text-amber-700",
}

type JobCardJob = JobPost & { trade?: { name: string } | null }

interface JobCardProps {
  job: JobCardJob
}

export function JobCard({ job }: JobCardProps) {
  const payLabel =
    job.pay_rate && job.pay_type
      ? `RWF ${job.pay_rate.toLocaleString()}${PAY_TYPE_LABELS[job.pay_type]}`
      : null

  return (
    <Link to={`/jobs/${job.id}`} className="group block">
      <div className="relative flex gap-0 overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
        {/* Accent left bar */}
        <div className="w-1 shrink-0 bg-primary/60 group-hover:bg-primary transition-colors duration-200" />

        <div className="flex flex-1 flex-col gap-3 p-4">
          {/* Title row */}
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold text-base leading-snug group-hover:text-primary transition-colors">
              {job.title}
            </h3>
            {job.job_type && (
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${JOB_TYPE_COLORS[job.job_type]}`}>
                {JOB_TYPE_LABELS[job.job_type]}
              </span>
            )}
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPinIcon className="size-3.5 text-primary/60" />
                {job.location}
              </span>
            )}
            {payLabel && (
              <span className="flex items-center gap-1 font-medium text-foreground">
                <BanknoteIcon className="size-3.5 text-primary/60" />
                {payLabel}
              </span>
            )}
            {job.trade?.name && (
              <span className="flex items-center gap-1">
                <BriefcaseIcon className="size-3.5 text-primary/60" />
                {job.trade.name}
              </span>
            )}
            {job.starts_at && (
              <span className="flex items-center gap-1">
                <ClockIcon className="size-3.5 text-primary/60" />
                Starts {new Date(job.starts_at).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Description preview */}
          {job.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {job.description}
            </p>
          )}

          <div className="flex items-center justify-between pt-0.5">
            <p className="text-xs text-muted-foreground/70">
              Posted {new Date(job.created_at).toLocaleDateString()}
            </p>
            <span className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              View details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
