import { useEffect, useState } from 'react'
import { BuildingIcon, SaveIcon, CheckCircleIcon } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useEmployerProfile } from '@/hooks/useEmployerProfile'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

const COMPANY_SIZES = [
  '1–5', '6–20', '21–50', '51–200', '201–500', '500+',
]

const INDUSTRIES = [
  'Construction', 'Electrical', 'Plumbing', 'HVAC', 'Civil Engineering',
  'Manufacturing', 'Mining', 'Agriculture', 'Logistics', 'Other',
]

export default function CompanyProfile() {
  const { user, profile } = useAuth()
  const { employerProfile, fetchEmployerProfile, updateEmployerProfile } = useEmployerProfile()

  const [company, setCompany] = useState({
    company_name: '', company_size: '', industry: '', website_url: '',
  })
  const [contact, setContact] = useState({
    full_name: '', phone: '', location: '', bio: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    async function load() {
      const { data } = await fetchEmployerProfile(user!.id)
      if (data) {
        setCompany({
          company_name: data.company_name ?? '',
          company_size: data.company_size ?? '',
          industry:     data.industry ?? '',
          website_url:  data.website_url ?? '',
        })
      }
      if (profile) {
        setContact({
          full_name: profile.full_name ?? '',
          phone:     profile.phone ?? '',
          location:  profile.location ?? '',
          bio:       profile.bio ?? '',
        })
      }
      setLoading(false)
    }
    load()
  }, [user])

  function setC(field: string, value: string) { setCompany(f => ({ ...f, [field]: value })) }
  function setP(field: string, value: string) { setContact(f => ({ ...f, [field]: value })) }

  async function handleSave() {
    if (!user) return
    setError(null)
    setSaving(true)

    const [companyRes, profileRes] = await Promise.all([
      updateEmployerProfile(user.id, {
        company_name: company.company_name.trim() || null,
        company_size: company.company_size || null,
        industry:     company.industry || null,
        website_url:  company.website_url.trim() || null,
      }),
      supabase.from('profiles').update({
        full_name: contact.full_name.trim() || null,
        phone:     contact.phone.trim() || null,
        location:  contact.location.trim() || null,
        bio:       contact.bio.trim() || null,
        updated_at: new Date().toISOString(),
      }).eq('id', user.id),
    ])

    setSaving(false)

    if (companyRes.error || profileRes.error) {
      setError(companyRes.error?.message ?? profileRes.error?.message ?? 'Save failed.')
      return
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

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
            <BuildingIcon className="size-4" /> Company profile
          </div>
          <h1 className="text-2xl font-bold text-white">
            {company.company_name || 'Your company'}
          </h1>
          <p className="text-white/60 text-sm">Keep your profile up-to-date to attract the best candidates.</p>
        </div>
      </div>

      {error && <p className="text-sm text-destructive rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">{error}</p>}

      {saved && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircleIcon className="size-4 shrink-0" /> Profile saved successfully.
        </div>
      )}

      {/* Company details */}
      <Card className="shadow-sm">
        <CardContent className="space-y-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Company details</h2>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Company name</label>
            <input
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Acme Construction Ltd."
              value={company.company_name}
              onChange={e => setC('company_name', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Industry</label>
              <select
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={company.industry}
                onChange={e => setC('industry', e.target.value)}
              >
                <option value="">Select industry</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Company size</label>
              <select
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={company.company_size}
                onChange={e => setC('company_size', e.target.value)}
              >
                <option value="">Select size</option>
                {COMPANY_SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Website</label>
            <input
              type="url"
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="https://yourcompany.rw"
              value={company.website_url}
              onChange={e => setC('website_url', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact details */}
      <Card className="shadow-sm">
        <CardContent className="space-y-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Contact details</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Full name</label>
              <input
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Jane Doe"
                value={contact.full_name}
                onChange={e => setP('full_name', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Phone</label>
              <input
                type="tel"
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="+250 7XX XXX XXX"
                value={contact.phone}
                onChange={e => setP('phone', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Location</label>
            <input
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Kigali, Rwanda"
              value={contact.location}
              onChange={e => setP('location', e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">About the company</label>
            <textarea
              rows={4}
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
              placeholder="Tell workers what your company does and why they should join…"
              value={contact.bio}
              onChange={e => setP('bio', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Button className="w-full gap-2" disabled={saving} onClick={handleSave}>
        <SaveIcon className="size-4" />
        {saving ? 'Saving…' : 'Save profile'}
      </Button>
    </div>
  )
}
