import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const TRADES = [
  "Electrician",
  "Plumber",
  "Carpenter",
  "Welder",
  "Mason",
  "Painter",
  "HVAC Technician",
  "Heavy Equipment Operator",
  "Roofer",
  "General Labour",
]

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Casual", "Apprenticeship"]

export function JobSearch() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get("q") ?? "")
  const [location, setLocation] = useState(searchParams.get("location") ?? "")
  const [trade, setTrade] = useState(searchParams.get("trade") ?? "")
  const [jobType, setJobType] = useState(searchParams.get("type") ?? "")
  const [minPay, setMinPay] = useState(searchParams.get("minPay") ?? "")
  const [maxPay, setMaxPay] = useState(searchParams.get("maxPay") ?? "")

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "")
    setLocation(searchParams.get("location") ?? "")
    setTrade(searchParams.get("trade") ?? "")
    setJobType(searchParams.get("type") ?? "")
    setMinPay(searchParams.get("minPay") ?? "")
    setMaxPay(searchParams.get("maxPay") ?? "")
  }, [searchParams])

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const params: Record<string, string> = {}
    if (query.trim()) params.q = query.trim()
    if (location.trim()) params.location = location.trim()
    if (trade) params.trade = trade
    if (jobType) params.type = jobType
    if (minPay) params.minPay = minPay
    if (maxPay) params.maxPay = maxPay
    setSearchParams(params, { replace: true })
  }

  function handleClear() {
    setQuery("")
    setLocation("")
    setTrade("")
    setJobType("")
    setMinPay("")
    setMaxPay("")
    setSearchParams({}, { replace: true })
  }

  const hasFilters = ["q", "location", "trade", "type", "minPay", "maxPay"].some(k =>
    searchParams.has(k)
  )

  return (
    <Card className="shadow-sm">
      <CardContent>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Filter Jobs</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="job-q" className="text-sm font-medium">Keyword</label>
            <Input
              id="job-q"
              type="search"
              placeholder="Job title, keyword…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="job-location" className="text-sm font-medium">Location</label>
            <Input
              id="job-location"
              type="search"
              placeholder="City, region…"
              value={location}
              onChange={e => setLocation(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="job-trade" className="text-sm font-medium">Trade</label>
            <Select value={trade || undefined} onValueChange={v => setTrade((v ?? "") === "All trades" ? "" : (v ?? ""))}>
              <SelectTrigger id="job-trade" className="w-full">
                <SelectValue placeholder="All trades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All trades">All trades</SelectItem>
                {TRADES.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="job-type" className="text-sm font-medium">Job type</label>
            <Select value={jobType || undefined} onValueChange={v => setJobType((v ?? "") === "All job types" ? "" : (v ?? ""))}>
              <SelectTrigger id="job-type" className="w-full">
                <SelectValue placeholder="All job types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All job types">All job types</SelectItem>
                {JOB_TYPES.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Pay rate (RWF)</span>
            <div className="flex items-center gap-2">
              <label htmlFor="job-min-pay" className="sr-only">Min pay</label>
              <Input
                id="job-min-pay"
                type="number"
                min={0}
                max={999}
                placeholder="Min"
                value={minPay}
                onChange={e => setMinPay(e.target.value)}
              />
              <span className="text-muted-foreground text-sm shrink-0">–</span>
              <label htmlFor="job-max-pay" className="sr-only">Max pay</label>
              <Input
                id="job-max-pay"
                type="number"
                min={0}
                max={999}
                placeholder="Max"
                value={maxPay}
                onChange={e => setMaxPay(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-end gap-2">
            <Button type="submit" className="flex-1">Search</Button>
            {hasFilters && (
              <Button type="button" variant="ghost" onClick={handleClear}>
                Clear
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
