import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { JobCard } from "@/components/jobs/JobCard"
import type { JobPost } from "@/types/jobs"

export function JobList() {
  const [searchParams] = useSearchParams()
  const [jobs, setJobs] = useState<JobPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true)
      setError(null)

      let query = supabase
        .from("job_posts")
        .select("*, trade:trades(name)")
        .eq("status", "open")
        .order("created_at", { ascending: false })

      const q = searchParams.get("q")
      const location = searchParams.get("location")
      const trade = searchParams.get("trade")
      const type = searchParams.get("type")
      const minPay = searchParams.get("minPay")
      const maxPay = searchParams.get("maxPay")

      if (q) query = query.ilike("title", `%${q}%`)
      if (location) query = query.ilike("location", `%${location}%`)
      if (type) query = query.eq("job_type", type)
      if (minPay) query = query.gte("pay_rate", Number(minPay))
      if (maxPay) query = query.lte("pay_rate", Number(maxPay))

      // trade filter via trade name requires a join — filter client-side for now
      const { data, error: fetchError } = await query

      if (fetchError) {
        setError(fetchError.message)
        setLoading(false)
        return
      }

      let results = data as (JobPost & { trade: { name: string } | null })[]
      if (trade) {
        results = results.filter(j => j.trade?.name === trade)
      }

      setJobs(results)
      setLoading(false)
    }

    fetchJobs()
  }, [searchParams])

  if (loading) return (
    <div className="flex flex-col gap-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-28 rounded-xl border bg-card animate-pulse" />
      ))}
    </div>
  )
  if (error) return <p className="text-sm text-destructive">{error}</p>
  if (jobs.length === 0) return (
    <div className="rounded-xl border bg-card px-6 py-12 text-center space-y-2">
      <p className="font-medium">No jobs found</p>
      <p className="text-sm text-muted-foreground">Try adjusting your filters.</p>
    </div>
  )

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground font-medium px-1">
        {jobs.length} {jobs.length === 1 ? "job" : "jobs"} found
      </p>
      {jobs.map(job => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  )
}
