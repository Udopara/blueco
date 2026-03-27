import { useEffect, useState } from 'react'
import { UserIcon, SaveIcon, CheckCircleIcon } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useWorkerProfile } from '@/hooks/useWorkerProfile'
import { useTrades } from '@/hooks/useTrades'
import { useSkills } from '@/hooks/useSkills'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

const AVAILABILITY_OPTIONS = [
  { value: 'available',      label: 'Available — actively looking' },
  { value: 'open_to_offers', label: 'Open to offers' },
  { value: 'busy',           label: 'Busy — not looking right now' },
]

export default function WorkerProfile() {
  const { user, profile } = useAuth()
  const { workerProfile, tradeIds, skillIds, fetchWorkerProfile, fetchWorkerTrades, fetchWorkerSkills, updateWorkerProfile, setWorkerTrades, setWorkerSkills } = useWorkerProfile()
  const { trades, fetchTrades } = useTrades()
  const { skills, fetchSkills } = useSkills()

  const [contact, setContact] = useState({ full_name: '', phone: '', location: '', bio: '' })
  const [work, setWork] = useState({ years_experience: '', hourly_rate: '', availability: '', resume_url: '' })
  const [selectedTrades, setSelectedTrades] = useState<number[]>([])
  const [selectedSkills, setSelectedSkills] = useState<number[]>([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    async function load() {
      await Promise.all([
        fetchWorkerProfile(user!.id),
        fetchWorkerTrades(user!.id),
        fetchWorkerSkills(user!.id),
        fetchTrades(),
        fetchSkills(),
      ])
      setLoading(false)
    }
    load()
  }, [user])

  useEffect(() => {
    if (profile) {
      setContact({
        full_name: profile.full_name ?? '',
        phone:     profile.phone ?? '',
        location:  profile.location ?? '',
        bio:       profile.bio ?? '',
      })
    }
  }, [profile])

  useEffect(() => {
    if (workerProfile) {
      setWork({
        years_experience: workerProfile.years_experience?.toString() ?? '',
        hourly_rate:      workerProfile.hourly_rate?.toString() ?? '',
        availability:     workerProfile.availability ?? '',
        resume_url:       workerProfile.resume_url ?? '',
      })
    }
  }, [workerProfile])

  useEffect(() => { setSelectedTrades(tradeIds) }, [tradeIds])
  useEffect(() => { setSelectedSkills(skillIds) }, [skillIds])

  function setC(field: string, value: string) { setContact(f => ({ ...f, [field]: value })) }
  function setW(field: string, value: string) { setWork(f => ({ ...f, [field]: value })) }

  function toggleTrade(id: number) {
    setSelectedTrades(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  function toggleSkill(id: number) {
    setSelectedSkills(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  async function handleSave() {
    if (!user) return
    setError(null)
    setSaving(true)

    const [profileRes, workerRes, tradesRes, skillsRes] = await Promise.all([
      supabase.from('profiles').update({
        full_name:  contact.full_name.trim() || null,
        phone:      contact.phone.trim() || null,
        location:   contact.location.trim() || null,
        bio:        contact.bio.trim() || null,
        updated_at: new Date().toISOString(),
      }).eq('id', user.id),

      updateWorkerProfile(user.id, {
        years_experience: work.years_experience ? Number(work.years_experience) : null,
        hourly_rate:      work.hourly_rate ? Number(work.hourly_rate) : null,
        availability:     (work.availability as any) || null,
        resume_url:       work.resume_url.trim() || null,
      }),

      setWorkerTrades(user.id, selectedTrades),
      setWorkerSkills(user.id, selectedSkills),
    ])

    setSaving(false)

    const err = profileRes.error?.message ?? workerRes.error?.message ?? (tradesRes as any)?.error?.message ?? (skillsRes as any)?.error?.message
    if (err) { setError(err); return }

    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  // Skills filtered to only those belonging to selected trades (or all if no trades selected)
  const visibleSkills = selectedTrades.length > 0
    ? skills.filter(s => s.trade_id !== null && selectedTrades.includes(s.trade_id))
    : skills

  if (loading) return (
    <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
      <div className="h-36 rounded-2xl bg-muted" />
      <div className="h-80 rounded-xl bg-muted" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[oklch(0.18_0.05_239)] via-[oklch(0.22_0.07_245)] to-[oklch(0.26_0.09_255)] px-6 py-8 md:px-10 shadow-lg">
        <div className="pointer-events-none absolute -top-12 -right-12 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2 text-primary/80 text-sm font-medium">
            <UserIcon className="size-4" /> My profile
          </div>
          <h1 className="text-2xl font-bold text-white">
            {contact.full_name || 'Your profile'}
          </h1>
          <p className="text-white/60 text-sm">A complete profile helps employers find and trust you.</p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">{error}</p>
      )}
      {saved && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircleIcon className="size-4 shrink-0" /> Profile saved successfully.
        </div>
      )}

      {/* Personal info */}
      <Card className="shadow-sm">
        <CardContent className="space-y-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Personal info</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Full name</label>
              <input
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Jane Doe"
                value={contact.full_name}
                onChange={e => setC('full_name', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Phone</label>
              <input
                type="tel"
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="+250 7XX XXX XXX"
                value={contact.phone}
                onChange={e => setC('phone', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Location</label>
            <input
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Kigali, Rwanda"
              value={contact.location}
              onChange={e => setC('location', e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Bio</label>
            <textarea
              rows={3}
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
              placeholder="Briefly describe your experience and what you're looking for…"
              value={contact.bio}
              onChange={e => setC('bio', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Work details */}
      <Card className="shadow-sm">
        <CardContent className="space-y-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Work details</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Years of experience</label>
              <input
                type="number"
                min={0}
                max={50}
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g. 5"
                value={work.years_experience}
                onChange={e => setW('years_experience', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Expected hourly rate (RWF)</label>
              <input
                type="number"
                min={0}
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g. 5000"
                value={work.hourly_rate}
                onChange={e => setW('hourly_rate', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Availability</label>
            <select
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={work.availability}
              onChange={e => setW('availability', e.target.value)}
            >
              <option value="">Select status</option>
              {AVAILABILITY_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Resume / CV link</label>
            <input
              type="url"
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="https://drive.google.com/…"
              value={work.resume_url}
              onChange={e => setW('resume_url', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Link to your CV on Google Drive, Dropbox, or similar.</p>
          </div>
        </CardContent>
      </Card>

      {/* Trades */}
      {trades.length > 0 && (
        <Card className="shadow-sm">
          <CardContent className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Your trades</h2>
              <p className="text-xs text-muted-foreground mt-1">Select all trades you're qualified in.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {trades.map(trade => {
                const active = selectedTrades.includes(trade.id)
                return (
                  <button
                    key={trade.id}
                    type="button"
                    onClick={() => toggleTrade(trade.id)}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                      active
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground'
                    }`}
                  >
                    {trade.name}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skills */}
      {visibleSkills.length > 0 && (
        <Card className="shadow-sm">
          <CardContent className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Your skills</h2>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedTrades.length > 0
                  ? 'Skills for your selected trades.'
                  : 'Select trades above to filter skills, or pick from all.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {visibleSkills.map(skill => {
                const active = selectedSkills.includes(skill.id)
                return (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => toggleSkill(skill.id)}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                      active
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground'
                    }`}
                  >
                    {skill.name}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Button className="w-full gap-2" disabled={saving} onClick={handleSave}>
        <SaveIcon className="size-4" />
        {saving ? 'Saving…' : 'Save profile'}
      </Button>
    </div>
  )
}
