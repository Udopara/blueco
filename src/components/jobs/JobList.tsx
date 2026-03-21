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
        .select("*")
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
      if (type) query = query.eq("job_type", type.toLowerCase().replace("-", "_"))
      if (minPay) query = query.gte("pay_rate", Number(minPay))
      if (maxPay) query = query.lte("pay_rate", Number(maxPay))

      // trade filter via trade name requires a join — filter client-side for now
      const { data, error: fetchError } = await query

      if (fetchError) {
        setError(fetchError.message)
        setLoading(false)
        return
      }

      let results = data as JobPost[]
      if (trade) {
        results = results.filter(() => true) // placeholder until trade join is wired up
      }

      setJobs(results)
      setLoading(false)
    }

    fetchJobs()
  }, [searchParams])

  if (loading) return <p className="text-sm text-muted-foreground">Loading jobs…</p>
  if (error) return <p className="text-sm text-destructive">{error}</p>
  if (jobs.length === 0) return <p className="text-sm text-muted-foreground">No jobs found.</p>

  return (
    <div className="flex flex-col gap-3">
      {jobs.map(job => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  )
}
