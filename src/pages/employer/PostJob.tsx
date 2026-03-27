import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BriefcaseIcon, SaveIcon, SendIcon, PlusIcon, XIcon } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useJobPosts } from '@/hooks/useJobPosts'
import { useTrades } from '@/hooks/useTrades'
import { useSkills } from '@/hooks/useSkills'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import type { PayType } from '@/types/jobs'

const JOB_TYPES = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract',  label: 'Contract' },
  { value: 'casual',    label: 'Casual' },
]

const PAY_TYPES: { value: PayType; label: string }[] = [
  { value: 'Hourly',   label: 'Per hour' },
  { value: 'Daily',    label: 'Per day' },
  { value: 'Weekly',   label: 'Per week' },
  { value: 'Monthly',  label: 'Per month' },
  { value: 'One Time', label: 'One-time / Fixed' },
]

export default function PostJob() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { createJob } = useJobPosts()
  const { trades, fetchTrades } = useTrades()
  const { skills, fetchSkills } = useSkills()

  const [form, setForm] = useState({
    title: '', description: '', location: '',
    trade_id: '', job_type: '', pay_rate: '', pay_type: '' as PayType | '',
    starts_at: '', expires_at: '',
  })
  const [selectedSkills, setSelectedSkills] = useState<number[]>([])
  const [perks, setPerks] = useState<string[]>([])
  const [perkInput, setPerkInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { fetchTrades() }, [])
  useEffect(() => {
    const tradeId = form.trade_id ? Number(form.trade_id) : undefined
    fetchSkills(tradeId)
    setSelectedSkills([]) // reset on trade change
  }, [form.trade_id])

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function toggleSkill(id: number) {
    setSelectedSkills(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }

  function addPerk() {
    const trimmed = perkInput.trim()
    if (!trimmed || perks.includes(trimmed)) return
    setPerks(p => [...p, trimmed])
    setPerkInput('')
  }

  function removePerk(perk: string) {
    setPerks(p => p.filter(x => x !== perk))
  }

  async function handleSubmit(status: 'draft' | 'open') {
    if (!user) return
    if (!form.title.trim()) { setError('Job title is required.'); return }
    setError(null)
    setSubmitting(true)

    const { data, error: jobError } = await createJob({
      employer_id: user.id,
      title: form.title.trim(),
      description: form.description.trim() || null,
      location: form.location.trim() || null,
      trade_id: form.trade_id ? Number(form.trade_id) : null,
      job_type: form.job_type || null,
      pay_rate: form.pay_rate ? Number(form.pay_rate) : null,
      pay_type: (form.pay_type as PayType) || null,
      starts_at: form.starts_at || null,
      expires_at: form.expires_at || null,
      status,
    })

    if (jobError) { setError(jobError.message); setSubmitting(false); return }

    const jobId = data.id

    // Save skills and perks in parallel
    await Promise.all([
      selectedSkills.length > 0
        ? supabase.from('job_post_skills').insert(selectedSkills.map(skill_id => ({ job_post_id: jobId, skill_id })))
        : Promise.resolve(),
      perks.length > 0
        ? supabase.from('job_perks').insert(perks.map(perk => ({ job_post_id: jobId, perk })))
        : Promise.resolve(),
    ])

    setSubmitting(false)
    navigate('/dashboard')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[oklch(0.18_0.05_239)] via-[oklch(0.22_0.07_245)] to-[oklch(0.26_0.09_255)] px-6 py-8 md:px-10 shadow-lg">
        <div className="pointer-events-none absolute -top-12 -right-12 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2 text-primary/80 text-sm font-medium">
            <BriefcaseIcon className="size-4" />
            New posting
          </div>
          <h1 className="text-2xl font-bold text-white">Post a job</h1>
          <p className="text-white/60 text-sm">Fill in the details below — you can save as draft or publish immediately.</p>
        </div>
      </div>

      {/* Form */}
      <Card className="shadow-sm">
        <CardContent className="space-y-5">
          {error && <p className="text-sm text-destructive rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">{error}</p>}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Job title <span className="text-destructive">*</span></label>
            <input
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="e.g. Senior Electrician"
              value={form.title}
              onChange={e => set('title', e.target.value)}
            />
          </div>

          {/* Trade + Job type */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Trade</label>
              <select
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={form.trade_id}
                onChange={e => set('trade_id', e.target.value)}
              >
                <option value="">Any / not specified</option>
                {trades.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Job type</label>
              <select
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={form.job_type}
                onChange={e => set('job_type', e.target.value)}
              >
                <option value="">Not specified</option>
                {JOB_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Location</label>
            <input
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="e.g. Kigali, Gasabo"
              value={form.location}
              onChange={e => set('location', e.target.value)}
            />
          </div>

          {/* Pay */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Pay</label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                min={0}
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Amount in RWF"
                value={form.pay_rate}
                onChange={e => set('pay_rate', e.target.value)}
              />
              <select
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={form.pay_type}
                onChange={e => set('pay_type', e.target.value)}
              >
                <option value="">Select frequency</option>
                {PAY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Start date</label>
              <input
                type="date"
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={form.starts_at}
                onChange={e => set('starts_at', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Listing expires</label>
              <input
                type="date"
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={form.expires_at}
                onChange={e => set('expires_at', e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Job description</label>
            <textarea
              rows={6}
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
              placeholder="Describe the role, responsibilities, requirements…"
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Required skills</label>
              <p className="text-xs text-muted-foreground">
                {form.trade_id ? 'Skills for the selected trade.' : 'Select a trade above to filter skills.'}
              </p>
              <div className="flex flex-wrap gap-2">
                {skills.map(skill => {
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
            </div>
          )}

          {/* Perks */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Perks & benefits</label>
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-lg border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g. Meals provided, Transport allowance…"
                value={perkInput}
                onChange={e => setPerkInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addPerk() } }}
              />
              <Button type="button" variant="outline" size="icon" onClick={addPerk}>
                <PlusIcon className="size-4" />
              </Button>
            </div>
            {perks.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {perks.map(perk => (
                  <span key={perk} className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm">
                    {perk}
                    <button type="button" onClick={() => removePerk(perk)} className="text-muted-foreground hover:text-foreground">
                      <XIcon className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1 border-t">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              disabled={submitting}
              onClick={() => handleSubmit('draft')}
            >
              <SaveIcon className="size-4" />
              Save as draft
            </Button>
            <Button
              className="flex-1 gap-2"
              disabled={submitting}
              onClick={() => handleSubmit('open')}
            >
              <SendIcon className="size-4" />
              {submitting ? 'Publishing…' : 'Publish now'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
