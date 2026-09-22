import { useEffect, useState } from 'react'
import { profileService } from '../services/profileService'
import LoadingState from '../components/ui/LoadingState'
import ErrorState from '../components/ui/ErrorState'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import { Building2, MapPin, Phone, Sprout, UserRound } from 'lucide-react'

export default function AdminProfilesPage() {
  const [farmers, setFarmers] = useState([])
  const [buyers, setBuyers] = useState([])
  const [tab, setTab] = useState('farmers')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [farmerRes, buyerRes] = await Promise.all([
        profileService.getAllFarmerProfiles(),
        profileService.getAllBuyerProfiles(),
      ])
      setFarmers(farmerRes.data || [])
      setBuyers(buyerRes.data || [])
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load profile directory.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return <div className="page-container"><LoadingState title="Loading profile directory" message="Fetching farmer and buyer profiles..." /></div>
  if (error) return <div className="page-container"><ErrorState title="Unable to load profiles" message={error} onRetry={load} /></div>

  const rows = tab === 'farmers' ? farmers : buyers

  return (
    <div className="page-container space-y-6">
      <PageHeader
        eyebrow="Administration"
        title="Profile Directory"
        subtitle="Review the domain profiles stored for farmers and buyers."
        stats={[
          { label: 'Farmers', value: farmers.length },
          { label: 'Buyers', value: buyers.length },
        ]}
      />

      <div className="flex flex-wrap gap-2">
        <button className={`btn ${tab === 'farmers' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('farmers')}><Sprout className="w-4 h-4" /> Farmers</button>
        <button className={`btn ${tab === 'buyers' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('buyers')}><Building2 className="w-4 h-4" /> Buyers</button>
      </div>

      {rows.length === 0 ? (
        <EmptyState title={`No ${tab} profiles`} description="Profiles will appear here after users complete their domain profile setup." />
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {rows.map(profile => (
            <article key={profile.id} className="card">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 grid place-items-center shrink-0 overflow-hidden">
                  {profile.image_url ? <img src={profile.image_url} alt={profile.full_name} className="w-full h-full object-cover" /> : <UserRound className="w-6 h-6" />}
                </div>
                <div className="min-w-0">
                  <h2 className="font-black text-slate-900 break-words">{profile.full_name}</h2>
                  <p className="text-xs text-slate-500 mt-1 break-all">User ID: {profile.user_id}</p>
                </div>
              </div>

              <div className="space-y-2 mt-5 text-sm">
                {profile.phone_number && <p className="flex gap-2 text-slate-600"><Phone className="w-4 h-4 shrink-0" />{profile.phone_number}</p>}
                {tab === 'farmers' ? (
                  <p className="flex gap-2 text-slate-600"><MapPin className="w-4 h-4 shrink-0" />{[profile.village, profile.district, profile.state].filter(Boolean).join(', ') || 'Location not provided'}</p>
                ) : (
                  <p className="flex gap-2 text-slate-600"><Building2 className="w-4 h-4 shrink-0" />{profile.company_name || 'Independent buyer'}{profile.city || profile.state ? ` · ${[profile.city, profile.state].filter(Boolean).join(', ')}` : ''}</p>
                )}
              </div>

              <p className="text-sm text-slate-500 mt-4 line-clamp-4">
                {tab === 'farmers' ? profile.land_details || 'No land details provided.' : profile.business_description || 'No business description provided.'}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
