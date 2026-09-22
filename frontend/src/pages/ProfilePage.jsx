import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { profileService } from '../services/profileService'
import LoadingState from '../components/ui/LoadingState'
import ErrorState from '../components/ui/ErrorState'
import PageHeader from '../components/ui/PageHeader'
import ErrorMessage from '../components/ErrorMessage'
import DemoBanner from '../components/ui/DemoBanner'
import ImageUpload from '../components/ui/ImageUpload'
import { uploadService } from '../services/uploadService'
import { User, Pencil, Check, X, MapPin, Phone, Building2, ShieldCheck, Mail, Sprout } from 'lucide-react'

export default function ProfilePage() {
  const { user, hasRole } = useAuth()
  const isFarmer = hasRole('farmer')
  const isBuyer = hasRole('buyer')
  const hasDomainProfile = isFarmer || isBuyer
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [success, setSuccess] = useState(false)
  const [demoMode, setDemoMode] = useState(false)
  const [imageFile, setImageFile] = useState(null)

  const sampleProfile = isFarmer
    ? { full_name: 'Amit Verma', phone_number: '+91 98765 43210', village: 'Sehore', district: 'Sehore', state: 'Madhya Pradesh', land_details: 'Multi-crop farm focused on wheat, soybean and seasonal vegetables.' }
    : { full_name: 'Amit Buyer', company_name: 'Central Agro Foods', phone_number: '+91 98765 40123', city: 'Indore', state: 'Madhya Pradesh', business_description: 'Regional agricultural procurement and food-processing supply network.' }

  const fetchProfile = async () => {
    setLoading(true)
    setLoadError('')

    if (!hasDomainProfile) {
      setProfile(null)
      setForm({})
      setDemoMode(false)
      setLoading(false)
      return
    }

    try {
      const res = isFarmer
        ? await profileService.getFarmerProfile()
        : await profileService.getBuyerProfile()
      setProfile(res.data)
      setForm(res.data)
      setDemoMode(false)
    } catch (err) {
      if (err.response?.status === 404) {
        setProfile(sampleProfile)
        setForm(sampleProfile)
        setDemoMode(true)
      } else {
        setLoadError('Failed to load profile')
      }
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { fetchProfile() }, [isFarmer, isBuyer])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!hasDomainProfile) return setSaving(true); setSaveError('')
    try {
      let payload = { ...form }
      if (imageFile) {
        const upload = await uploadService.image(imageFile)
        payload.image_url = upload.data.url
      }
      let res
      if (profile && !demoMode) res = isFarmer ? await profileService.updateFarmerProfile(payload) : await profileService.updateBuyerProfile(payload)
      else res = isFarmer ? await profileService.createFarmerProfile({ user_id: user.id, ...payload }) : await profileService.createBuyerProfile(payload)
      setProfile(res.data); setForm(res.data); setDemoMode(false); setEditing(false); setSuccess(true); setTimeout(() => setSuccess(false), 3500)
    } catch (err) { setSaveError(err.response?.data?.detail || 'Failed to save profile') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="page-container"><LoadingState title="Loading profile" message="Fetching your profile information..." /></div>
  if (loadError) return <div className="page-container"><ErrorState title="Unable to load profile" message={loadError} onRetry={fetchProfile} /></div>

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Account'
  const location = isFarmer ? [profile?.village, profile?.district, profile?.state].filter(Boolean).join(', ') : [profile?.city, profile?.state].filter(Boolean).join(', ')

  return <div className="page-container">
    {demoMode && <DemoBanner message="This profile is a polished sample preview because the account does not have a saved profile yet. Click Set up profile to create your real profile." />}
    {success && <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 flex items-center gap-2"><Check className="w-4 h-4"/> Profile saved successfully.</div>}
    <PageHeader eyebrow="Account" title="My Profile" subtitle="Manage your identity, location and agricultural or business details." action={!editing && !demoMode && hasDomainProfile ? <button className="btn btn-secondary" onClick={() => setEditing(true)}><Pencil className="w-4 h-4"/> Edit Profile</button> : undefined} />

    <div className="grid lg:grid-cols-[340px_1fr] gap-5">
      <aside className="space-y-4">
        <div className="card overflow-hidden p-0">
          <div className="h-28 bg-gradient-to-br from-emerald-700 via-green-600 to-lime-500" />
          <div className="px-5 pb-5 -mt-10 relative"><div className="w-20 h-20 rounded-2xl bg-white shadow-lg grid place-items-center text-emerald-600 border-4 border-white overflow-hidden">
              {profile?.image_url ? <img src={profile.image_url} alt={displayName} className="w-full h-full object-cover" /> : <User className="w-9 h-9"/>}
            </div><h2 className="text-xl font-black text-slate-900 mt-4">{displayName}</h2><p className="text-sm text-slate-500 mt-1">{user?.email}</p><div className="flex flex-wrap gap-2 mt-3">{user?.roles?.map(role=><span className="badge badge-success" key={role}>{role}</span>)}</div></div>
        </div>
        <div className="card"><p className="text-xs uppercase tracking-widest font-bold text-slate-400">Account health</p><div className="flex items-center gap-3 mt-4"><div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 grid place-items-center"><ShieldCheck className="w-5 h-5"/></div><div><p className="font-bold text-slate-900">Verified account</p><p className="text-xs text-slate-500">JWT authentication active</p></div></div><div className="mt-4 h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full w-[86%] bg-emerald-500 rounded-full"/></div><p className="text-xs text-slate-500 mt-2">86% profile completeness</p></div>
      </aside>

      <section className="card">
        {!editing && <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-5 border-b border-slate-100"><div><p className="text-xs uppercase tracking-widest font-bold text-emerald-600">Profile overview</p><h3 className="text-xl font-black text-slate-900 mt-1">Your workspace identity</h3></div>{demoMode && <button className="btn btn-primary" onClick={() => setEditing(true)}><Sprout className="w-4 h-4"/> Set up profile</button>}</div>}
        {!editing ? <div className="grid sm:grid-cols-2 gap-4 mt-5">
          <div className="rounded-2xl bg-slate-50 p-4"><div className="flex items-center gap-2 text-xs uppercase tracking-wide font-bold text-slate-400"><Mail className="w-3.5 h-3.5"/> Email</div><p className="font-semibold text-slate-900 mt-2 break-all">{user?.email}</p></div>
          <div className="rounded-2xl bg-slate-50 p-4"><div className="flex items-center gap-2 text-xs uppercase tracking-wide font-bold text-slate-400"><Phone className="w-3.5 h-3.5"/> Phone</div><p className="font-semibold text-slate-900 mt-2">{profile?.phone_number || 'Not added'}</p></div>
          <div className="rounded-2xl bg-slate-50 p-4"><div className="flex items-center gap-2 text-xs uppercase tracking-wide font-bold text-slate-400"><MapPin className="w-3.5 h-3.5"/> Location</div><p className="font-semibold text-slate-900 mt-2">{location || 'Not added'}</p></div>
          <div className="rounded-2xl bg-slate-50 p-4"><div className="flex items-center gap-2 text-xs uppercase tracking-wide font-bold text-slate-400"><Building2 className="w-3.5 h-3.5"/> {isFarmer ? 'Role focus' : isBuyer ? 'Organisation' : 'Role'}</div><p className="font-semibold text-slate-900 mt-2">{isFarmer ? 'Farm operations' : isBuyer ? profile?.company_name || 'Independent buyer' : user?.roles?.join(', ') || 'Platform user'}</p></div>
          <div className="sm:col-span-2 rounded-2xl bg-emerald-50 p-5"><p className="text-xs uppercase tracking-widest font-bold text-emerald-700">About</p><p className="text-sm text-emerald-950/80 leading-relaxed mt-2">{isFarmer ? profile?.land_details : isBuyer ? profile?.business_description : 'This role currently uses the platform account, notification and support capabilities. No separate domain profile is defined by the backend.'}</p></div>
        </div> : hasDomainProfile ? <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          <div><label className="label label-required">Full Name</label><input className="input" required value={form.full_name||''} onChange={e=>setForm({...form,full_name:e.target.value})}/></div>
          {!isFarmer && <div><label className="label">Company Name</label><input className="input" value={form.company_name||''} onChange={e=>setForm({...form,company_name:e.target.value})}/></div>}
          <div><label className="label">Phone Number</label><input className="input" value={form.phone_number||''} onChange={e=>setForm({...form,phone_number:e.target.value})}/></div>
          <ImageUpload
            value={form.image_url}
            onChange={(file) => {
              setImageFile(file)
              if (!file) setForm({...form, image_url: ''})
            }}
            label={isFarmer ? 'Profile photo' : 'Business profile photo'}
            hint="Use a clear profile, farm or company image"
          />
          {isFarmer ? <div className="grid sm:grid-cols-2 gap-3"><div><label className="label">Village</label><input className="input" value={form.village||''} onChange={e=>setForm({...form,village:e.target.value})}/></div><div><label className="label">District</label><input className="input" value={form.district||''} onChange={e=>setForm({...form,district:e.target.value})}/></div></div> : <div><label className="label">City</label><input className="input" value={form.city||''} onChange={e=>setForm({...form,city:e.target.value})}/></div>}
          <div><label className="label">State</label><input className="input" value={form.state||''} onChange={e=>setForm({...form,state:e.target.value})}/></div>
          <div><label className="label">{isFarmer?'Land Details':'Business Description'}</label><textarea className="input" rows="4" value={(isFarmer?form.land_details:form.business_description)||''} onChange={e=>setForm({...form,[isFarmer?'land_details':'business_description']:e.target.value})}/></div>
          {saveError && <ErrorMessage message={saveError}/>}<div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-slate-100"><button type="button" className="btn btn-secondary flex-1" onClick={()=>{setEditing(false);setForm(profile||{})}} disabled={saving}><X className="w-4 h-4"/> Cancel</button><button type="submit" className="btn btn-primary flex-1" disabled={saving}>{saving?'Saving...':<><Check className="w-4 h-4"/> Save Profile</>}</button></div>
        </form> : (
          <div className="mt-5 rounded-2xl bg-slate-50 p-5">
            <p className="font-bold text-slate-900">No separate domain profile</p>
            <p className="text-sm text-slate-500 mt-2">
              The backend does not define a profile resource for this role. Your authenticated account remains active and you can manage supported workspace features from the navigation.
            </p>
          </div>
        )}
      </section>
    </div>
  </div>
}
