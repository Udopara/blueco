import { JobList } from "@/components/jobs/JobList";
import { JobSearch } from "@/components/jobs/JobSearch";
import { ZapIcon, MapPinIcon, UsersIcon } from "lucide-react";

const TRADE_PILLS = ["Electrician", "Plumber", "Welder", "Carpenter", "Mason", "HVAC"];

export default function JobFeed() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[oklch(0.22_0.06_239)] to-[oklch(0.30_0.10_250)] px-8 py-10 text-white shadow-lg">
        {/* Background orbs */}
        <div className="pointer-events-none absolute -top-12 -right-12 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />

        <div className="relative z-10 space-y-4 max-w-xl">
          <div className="flex items-center gap-2 text-primary/90 text-sm font-medium">
            <ZapIcon className="size-4" />
            Updated daily
          </div>
          <h1 className="text-3xl font-bold leading-tight">
            Find skilled work<br />
            <span className="text-primary">across Rwanda</span>
          </h1>
          <p className="text-white/70 text-sm leading-relaxed">
            Connect with top employers looking for tradespeople — from Kigali to Butare.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-5 pt-2 text-sm">
            <span className="flex items-center gap-1.5 text-white/80">
              <UsersIcon className="size-4 text-primary/80" />
              200+ employers
            </span>
            <span className="flex items-center gap-1.5 text-white/80">
              <MapPinIcon className="size-4 text-primary/80" />
              All regions
            </span>
          </div>

          {/* Trade pills */}
          <div className="flex flex-wrap gap-2 pt-1">
            {TRADE_PILLS.map(t => (
              <span
                key={t}
                className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Search + List */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-7">
        <div className="md:col-span-2">
          <div className="md:sticky md:top-20">
            <JobSearch />
          </div>
        </div>
        <div className="md:col-span-5">
          <JobList />
        </div>
      </div>
    </div>
  );
}
