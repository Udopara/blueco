import { MapPinIcon, ClockIcon, DollarSignIcon } from "lucide-react"
import { Link } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import type { JobPost, JobType, PayType } from "@/types/jobs"

const JOB_TYPE_LABELS: Record<JobType, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  casual: "Casual",
}

const PAY_TYPE_LABELS: Record<PayType, string> = {
  hourly: "/hr",
  daily: "/day",
  fixed: " fixed",
}

interface JobCardProps {
  job: JobPost
}

export function JobCard({ job }: JobCardProps) {
  const payLabel =
    job.pay_rate && job.pay_type
      ? `$${job.pay_rate}${PAY_TYPE_LABELS[job.pay_type]}`
      : null

  return (
    <Link to={`/jobs/${job.id}`} className="group block">
      <Card className="transition-shadow group-hover:shadow-md">
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-base leading-snug group-hover:text-primary transition-colors">
              {job.title}
            </h3>
            {job.job_type && (
              <span className="shrink-0 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                {JOB_TYPE_LABELS[job.job_type]}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPinIcon className="size-3.5" />
                {job.location}
              </span>
            )}
            {payLabel && (
              <span className="flex items-center gap-1">
                <DollarSignIcon className="size-3.5" />
                {payLabel}
              </span>
            )}
            {job.starts_at && (
              <span className="flex items-center gap-1">
                <ClockIcon className="size-3.5" />
                Starts {new Date(job.starts_at).toLocaleDateString()}
              </span>
            )}
          </div>

          {job.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
          )}

          <p className="text-xs text-muted-foreground">
            Posted {new Date(job.created_at).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
