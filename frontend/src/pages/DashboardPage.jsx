import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  ArrowRight, Plus, TreePine, Wheat, FileText, Gavel, Building2,
  Wrench, TrendingUp, Sparkles, CalendarDays, Bell, ShieldCheck,
} from 'lucide-react'
import { landService } from '../services/landService'
import { cropService } from '../services/cropService'
import { contractService } from '../services/contractService'
import { bidService } from '../services/bidService'
import { equipmentService } from '../services/equipmentService'
import { leaseRequestService } from '../services/leaseRequestService'
import { notificationService } from '../services/notificationService'
import { adminService } from '../services/adminService'
import { supportService } from '../services/supportService'
import LoadingState from '../components/ui/LoadingState'
import ErrorState from '../components/ui/ErrorState'
import EmptyState from '../components/EmptyState'
import { StatusBadge } from '../components/StatusBadge'

const toNumber = (value) => Number.parseFloat(value || 0) || 0

export default function DashboardPage() {
  const { user, hasRole } = useAuth()
  const farmer = hasRole('farmer')
  const buyer = hasRole('buyer')
  const provider = hasRole('equipment_provider')
  const admin = hasRole('admin')

  const [data, setData] = useState({
    lands: [], crops: [], contracts: [], openContracts: [], bids: [],
    assignedContracts: [], equipment: [], leaseRequests: [], notifications: [],
    users: [], tickets: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const userName = user?.email?.split('@')[0] || 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const loadDashboard = async () => {
    setLoading(true)
    setError('')

    try {
      const requests = [
        notificationService.getAll(),
      ]

      if (farmer) {
        requests.push(
          landService.getAll(),
          cropService.getAll(),
          contractService.getMine(),
        )
      }

      if (buyer) {
        requests.push(
          contractService.getOpen(),
          contractService.getAssigned(),
          bidService.getMine(),
          leaseRequestService.getMine(),
          equipmentService.getAvailable(),
        )
      }

      if (provider) {
        requests.push(equipmentService.getMine())
      }

      if (admin) {
        requests.push(adminService.getUsers(), supportService.getAll(), contractService.getOpen())
      }

      const responses = await Promise.all(requests)
      let index = 0
      const next = { ...data, notifications: responses[index++].data || [] }

      if (farmer) {
        next.lands = responses[index++].data || []
        next.crops = responses[index++].data || []
        next.contracts = responses[index++].data || []
      }
      if (buyer) {
        next.openContracts = responses[index++].data || []
        next.assignedContracts = responses[index++].data || []
        next.bids = responses[index++].data || []
        next.leaseRequests = responses[index++].data || []
        next.equipment = responses[index++].data || []
      }
      if (provider) {
        next.equipment = responses[index++].data || []
      }
      if (admin) {
        next.users = responses[index++].data || []
        next.tickets = responses[index++].data || []
        next.openContracts = responses[index++].data || []
      }

      setData(next)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load your dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadDashboard() }, [user?.id])

  const unreadNotifications = data.notifications.filter(n => !n.is_read).length

  const farmerStats = useMemo(() => [
    ['Total land', `${data.lands.reduce((sum, l) => sum + toNumber(l.area_acres), 0).toFixed(1)} ac`, TreePine, `${data.lands.length} properties`],
    ['Active crops', data.crops.length, Wheat, `Across ${new Set(data.crops.map(c => c.land_id)).size} fields`],
    ['Contracts', data.contracts.length, FileText, `${data.contracts.filter(c => ['OPEN', 'ACCEPTED', 'NEGOTIATING', 'ACTIVE'].includes(c.status)).length} active`],
    ['Pending activity', data.contracts.filter(c => ['OPEN', 'NEGOTIATING'].includes(c.status)).length, TrendingUp, 'Contracts & negotiations'],
  ], [data])

  const buyerStats = useMemo(() => [
    ['Open opportunities', data.openContracts.length, FileText, 'Contracts available'],
    ['My bids', data.bids.length, Gavel, `${data.bids.filter(b => b.status === 'PENDING').length} pending`],
    ['Accepted deals', data.assignedContracts.length, TrendingUp, `${data.assignedContracts.filter(c => c.status === 'COMPLETED').length} completed`],
    ['Lease requests', data.leaseRequests.length, Building2, `${data.leaseRequests.filter(r => r.status === 'PENDING').length} pending`],
  ], [data])

  const providerStats = useMemo(() => [
    ['My equipment', data.equipment.length, Wrench, `${data.equipment.filter(e => e.is_available).length} available`],
    ['Unavailable', data.equipment.filter(e => !e.is_available).length, Wrench, 'Currently not rentable'],
    ['Notifications', unreadNotifications, Bell, 'Operational updates'],
    ['Profile status', 'Active', ShieldCheck, 'Provider account'],
  ], [data, unreadNotifications])

  const adminStats = useMemo(() => [
    ['Users', data.users.length, ShieldCheck, `${data.users.filter(u => u.is_active).length} active`],
    ['Open support', data.tickets.filter(t => ['OPEN', 'IN_PROGRESS'].includes(t.status)).length, Bell, 'Needs attention'],
    ['Unread notifications', unreadNotifications, Bell, 'Platform updates'],
    ['Marketplace contracts', data.openContracts.length, FileText, 'Open opportunities'],
  ], [data, unreadNotifications])

  const genericStats = useMemo(() => [
    ['Notifications', data.notifications.length, Bell, `${unreadNotifications} unread`],
    ['Open marketplace', data.openContracts.length, FileText, 'Contracts visible to authenticated users'],
    ['Support access', 'Available', ShieldCheck, 'Platform support is enabled'],
    ['Account status', user?.is_active ? 'Active' : 'Inactive', ShieldCheck, 'Authentication account'],
  ], [data, unreadNotifications, user?.is_active])

  if (loading) return <div className="page-container"><LoadingState title="Loading workspace" message="Fetching live data from the Digital Krishii API..." /></div>
  if (error) return <div className="page-container"><ErrorState title="Unable to load workspace" message={error} onRetry={loadDashboard} /></div>

  const stats = admin ? adminStats : provider ? providerStats : farmer ? farmerStats : buyer ? buyerStats : genericStats

  const quick = admin ? [
    ['/admin', ShieldCheck, 'Manage users', 'Control accounts and roles'],
    ['/support', Bell, 'Review support', 'Resolve platform tickets'],
    ['/marketplace', FileText, 'View marketplace', 'Inspect open opportunities'],
  ] : provider ? [
    ['/equipment', Wrench, 'Manage equipment', 'Maintain your inventory'],
    ['/equipment-requests', Gavel, 'Review requests', 'Accept or reject rentals'],
    ['/notifications', Bell, 'Open notifications', 'Review operational updates'],
  ] : farmer ? [
    ['/lands', Plus, 'Add land', 'Register a new property'],
    ['/crops', Wheat, 'Track crop', 'Add your next crop cycle'],
    ['/contracts', FileText, 'Create contract', 'Open a buyer opportunity'],
  ] : buyer ? [
    ['/marketplace', FileText, 'Find contracts', 'Explore fresh opportunities'],
    ['/lease-marketplace', Building2, 'Find farmland', 'Browse lease listings'],
    ['/equipment', Wrench, 'Rent equipment', 'Find machinery nearby'],
  ] : [
    ['/marketplace', FileText, 'Browse marketplace', 'Review available opportunities'],
    ['/support', Bell, 'Get support', 'Open a support ticket'],
    ['/notifications', Bell, 'Open notifications', 'Review account updates'],
  ]

  return (
    <div className="page-container space-y-6">
      <section className="dashboard-hero">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-emerald-50 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Live workspace
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">{greeting}, {userName} 👋</h1>
          <p className="mt-3 text-emerald-50/85 text-base sm:text-lg max-w-2xl">
            {admin
              ? 'Monitor users, support operations and marketplace activity from one workspace.'
              : provider
                ? 'Manage your agricultural equipment inventory and incoming rental requests.'
                : farmer
                  ? 'Keep your land, crops and contract pipeline moving from one clean workspace.'
                  : buyer
                    ? 'Discover contracts, farmland and equipment that can move your agricultural business forward.'
                    : 'Use your Digital Krishii account to access supported platform services.'}
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            {quick.slice(0, 2).map(([to, Icon, label]) => (
              <Link key={to} to={to} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-emerald-800 font-bold text-sm shadow-lg hover:-translate-y-0.5 transition-transform">
                <Icon className="w-4 h-4" />{label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        {stats.map(([label, value, Icon, caption]) => (
          <div className="stat-card" key={label}>
            <div className="relative z-10 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
                <p className="text-2xl font-black text-slate-900 mt-2">{value}</p>
                <p className="text-xs text-slate-500 mt-1">{caption}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 grid place-items-center"><Icon className="w-5 h-5" /></div>
            </div>
          </div>
        ))}
      </section>

      <section>
        <div className="flex items-end justify-between gap-4 mb-4">
          <div><p className="text-xs uppercase tracking-widest font-bold text-emerald-600">Shortcuts</p><h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">Work faster</h2></div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quick.map(([to, Icon, title, desc]) => (
            <Link key={to} to={to} className="quick-action-card group">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 grid place-items-center shrink-0"><Icon className="w-5 h-5" /></div>
              <div className="min-w-0 flex-1"><p className="font-bold text-slate-900">{title}</p><p className="text-sm text-slate-500 mt-0.5">{desc}</p></div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </section>

      {farmer && (
        <>
          <section>
            <div className="flex items-center justify-between mb-4">
              <div><p className="text-xs uppercase tracking-widest font-bold text-emerald-600">Farm overview</p><h2 className="text-xl font-black text-slate-900 mt-1">Recent crops</h2></div>
              <Link to="/crops" className="text-sm font-bold text-emerald-700 inline-flex items-center gap-1">View all <ArrowRight className="w-4 h-4" /></Link>
            </div>
            {data.crops.length === 0 ? (
              <EmptyState title="No crops yet" description="Add your first crop to start tracking the farm cycle." action={<Link to="/crops" className="btn btn-primary">Add crop</Link>} />
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
                {data.crops.slice(0, 4).map(c => (
                  <div className="card overflow-hidden p-0" key={c.id}>
                    {c.image_url ? <img src={c.image_url} alt={c.crop_name} className="w-full h-32 object-cover" /> : <div className="w-full h-32 bg-emerald-50 grid place-items-center"><Wheat className="w-10 h-10 text-emerald-500" /></div>}
                    <div className="p-4">
                      <div className="flex justify-between gap-2"><h3 className="font-bold text-slate-900">{c.crop_name}</h3>{c.season && <span className="badge badge-success">{c.season}</span>}</div>
                      <p className="text-sm text-slate-500 mt-2 flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" />Harvest {c.expected_harvest_date || 'Not set'}</p>
                      <p className="text-sm font-semibold text-slate-700 mt-3">Expected yield <span className="text-emerald-700">{c.expected_yield ?? '—'} q</span></p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <div><p className="text-xs uppercase tracking-widest font-bold text-emerald-600">Contract pipeline</p><h2 className="text-xl font-black text-slate-900 mt-1">Latest contracts</h2></div>
              <Link to="/contracts" className="text-sm font-bold text-emerald-700">Manage contracts →</Link>
            </div>
            {data.contracts.length === 0 ? (
              <EmptyState title="No contracts yet" description="Create a contract to open an opportunity for buyers." action={<Link to="/contracts" className="btn btn-primary">Create contract</Link>} />
            ) : (
              <div className="grid lg:grid-cols-2 gap-4">
                {data.contracts.slice(0, 4).map(c => (
                  <Link to={`/contracts/${c.id}`} key={c.id} className="card card-interactive flex gap-4">
                    {c.image_url ? <img src={c.image_url} alt="" className="w-24 h-24 rounded-xl object-cover shrink-0" /> : <div className="w-24 h-24 rounded-xl bg-emerald-50 grid place-items-center shrink-0"><FileText className="w-8 h-8 text-emerald-500" /></div>}
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-3"><h3 className="font-bold text-slate-900 line-clamp-2">{c.title}</h3><StatusBadge status={c.status} /></div>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">{c.description || 'No description provided.'}</p>
                      <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500"><span>{c.quantity} q</span><span>₹{c.price_per_unit}/unit</span></div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {buyer && (
        <>
          <section>
            <div className="flex items-center justify-between mb-4"><div><p className="text-xs uppercase tracking-widest font-bold text-emerald-600">Business pipeline</p><h2 className="text-xl font-black text-slate-900 mt-1">Assigned contracts</h2></div><Link to="/my-contracts" className="text-sm font-bold text-emerald-700">View all →</Link></div>
            {data.assignedContracts.length === 0 ? (
              <EmptyState title="No assigned contracts" description="Accepted bids will appear in My Contracts." action={<Link to="/marketplace" className="btn btn-primary">Browse contracts</Link>} />
            ) : (
              <div className="grid lg:grid-cols-2 gap-4">{data.assignedContracts.slice(0, 4).map(c => <Link key={c.id} to={`/contracts/${c.id}`} className="card card-interactive"><div className="flex items-center justify-between gap-3"><h3 className="font-bold text-slate-900 line-clamp-2">{c.title}</h3><StatusBadge status={c.status} /></div><p className="text-sm text-slate-500 mt-2">{c.quantity} q · ₹{c.price_per_unit}/unit</p></Link>)}</div>
            )}
          </section>
          <section>
            <div className="flex items-center justify-between mb-4"><div><p className="text-xs uppercase tracking-widest font-bold text-emerald-600">Notifications</p><h2 className="text-xl font-black text-slate-900 mt-1">Recent updates</h2></div><Link to="/notifications" className="text-sm font-bold text-emerald-700">View all →</Link></div>
            {data.notifications.length === 0 ? <EmptyState title="No notifications" description="Important bid, contract and marketplace updates will appear here." /> : <div className="space-y-3">{data.notifications.slice(0, 4).map(n => <Link to="/notifications" key={n.id} className="card card-interactive flex gap-3"><Bell className={`w-5 h-5 shrink-0 mt-0.5 ${n.is_read ? 'text-slate-400' : 'text-emerald-600'}`} /><div className="min-w-0"><p className="font-bold text-slate-900">{n.title}</p><p className="text-sm text-slate-500 mt-1 line-clamp-2">{n.message}</p></div></Link>)}</div>}
          </section>
        </>
      )}

      {provider && (
        <section>
          <div className="flex items-center justify-between mb-4"><div><p className="text-xs uppercase tracking-widest font-bold text-emerald-600">Equipment operations</p><h2 className="text-xl font-black text-slate-900 mt-1">Inventory</h2></div><Link to="/equipment" className="text-sm font-bold text-emerald-700">Manage equipment →</Link></div>
          {data.equipment.length === 0 ? <EmptyState title="No equipment yet" description="Add your first machine to make it available for rental." action={<Link to="/equipment" className="btn btn-primary">Add equipment</Link>} /> : <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{data.equipment.slice(0, 6).map(e => <Link key={e.id} to="/equipment" className="card card-interactive"><div className="flex items-center justify-between gap-3"><h3 className="font-bold text-slate-900">{e.name}</h3><StatusBadge status={e.is_available ? 'AVAILABLE' : 'UNAVAILABLE'} /></div><p className="text-sm text-slate-500 mt-2">{e.category} · ₹{e.rental_price_per_day}/day</p></Link>)}</div>}
        </section>
      )}

      {admin && (
        <section>
          <div className="flex items-center justify-between mb-4"><div><p className="text-xs uppercase tracking-widest font-bold text-emerald-600">Administration</p><h2 className="text-xl font-black text-slate-900 mt-1">Operational attention</h2></div><Link to="/admin" className="text-sm font-bold text-emerald-700">Open admin →</Link></div>
          <div className="grid lg:grid-cols-2 gap-4">
            {data.tickets.slice(0, 4).map(t => <Link key={t.id} to="/support" className="card card-interactive"><div className="flex items-center justify-between gap-3"><h3 className="font-bold text-slate-900 line-clamp-2">{t.subject}</h3><StatusBadge status={t.status} /></div><p className="text-sm text-slate-500 mt-2">{t.priority} · {t.category}</p></Link>)}
            {data.tickets.length === 0 && <EmptyState title="No support tickets" description="The support queue is currently empty." />}
          </div>
        </section>
      )}
    </div>
  )
}
