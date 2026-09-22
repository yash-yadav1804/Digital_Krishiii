import { useState, useEffect } from 'react'
import { notificationService } from '../services/notificationService'
import LoadingState from '../components/ui/LoadingState'
import PageHeader from '../components/ui/PageHeader'
import DemoBanner from '../components/ui/DemoBanner'
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle2, XCircle, ArrowUpRight } from 'lucide-react'
import { DEMO_NOTIFICATIONS, fillPreviewData } from '../data/demoData'

function notificationIcon(type) {
  if (type === 'success') return <CheckCircle2 className="w-5 h-5 text-emerald-500" />
  if (type === 'warning') return <AlertTriangle className="w-5 h-5 text-amber-500" />
  if (type === 'error') return <XCircle className="w-5 h-5 text-rose-500" />
  return <Info className="w-5 h-5 text-blue-500" />
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [demoMode, setDemoMode] = useState(false)
  const [marking, setMarking] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const r = await notificationService.getAll()
      const preview = fillPreviewData(r.data, DEMO_NOTIFICATIONS, 6); setNotifications(preview.rows); setDemoMode(preview.hasDemo)
    } catch { setNotifications(DEMO_NOTIFICATIONS.map(row => ({ ...row, __demo: true }))); setDemoMode(true) }
    finally { setLoading(false) }
  }
  useEffect(() => { loadData() }, [])

  const markRead = async (id) => {
    if (demoMode) { setNotifications(prev => prev.map(n => n.id === id ? {...n,is_read:true}:n)); return }
    try { await notificationService.markRead(id); setNotifications(prev => prev.map(n => n.id === id ? {...n,is_read:true}:n)) } catch {}
  }
  const markAllRead = async () => {
    setMarking(true)
    if (demoMode) { setNotifications(prev => prev.map(n => ({...n,is_read:true}))); setMarking(false); return }
    try { await notificationService.markAllRead(); setNotifications(prev => prev.map(n => ({...n,is_read:true}))) } catch {} finally { setMarking(false) }
  }

  if (loading) return <div className="page-container"><LoadingState title="Loading notifications" message="Fetching your latest activity..." /></div>
  const unread = notifications.filter(n => !n.is_read).length

  return <div className="page-container">
    {demoMode && <DemoBanner message="Sample activity is included when your live notification feed is small. Sample rows are read-only." />}
    <PageHeader eyebrow="Activity center" title="Notifications" subtitle="Stay on top of bids, contracts, listings and account activity." action={<button className="btn btn-secondary" disabled={!unread || marking} onClick={markAllRead}><CheckCheck className="w-4 h-4"/>{marking ? 'Updating...' : 'Mark all read'}</button>} stats={[{label:'Total',value:notifications.length},{label:'Unread',value:unread}]} />
    <div className="grid lg:grid-cols-[1fr_300px] gap-5">
      <div className="space-y-3">{notifications.map(n => <button key={n.id} onClick={() => !n.is_read && markRead(n.id)} className={`w-full text-left card transition-all ${!n.is_read ? 'border-emerald-200 bg-emerald-50/40' : 'hover:border-slate-300'}`}><div className="flex gap-4"><div className={`w-11 h-11 rounded-xl grid place-items-center shrink-0 ${!n.is_read ? 'bg-white' : 'bg-slate-50'}`}>{notificationIcon(n.type)}</div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><p className="font-bold text-slate-900">{n.title}</p>{!n.is_read && <span className="inline-flex mt-1 text-[10px] uppercase tracking-wider font-bold text-emerald-700">New</span>}</div><ArrowUpRight className="w-4 h-4 text-slate-300 shrink-0"/></div>{n.message && <p className="text-sm text-slate-500 mt-1 leading-relaxed">{n.message}</p>}<p className="text-xs text-slate-400 mt-3">{new Date(n.created_at).toLocaleString()}</p></div></div></button>)}</div>
      <aside className="space-y-4"><div className="card bg-gradient-to-br from-emerald-600 to-green-700 text-white border-0"><Bell className="w-6 h-6 mb-4"/><h3 className="text-lg font-black">Stay informed</h3><p className="text-sm text-emerald-50/80 mt-2">Important changes to contracts, bids and requests appear here as your workspace becomes active.</p></div><div className="card"><p className="text-xs uppercase tracking-widest font-bold text-slate-400">Inbox summary</p><div className="mt-4 space-y-3"><div className="flex justify-between"><span className="text-sm text-slate-500">Unread</span><strong>{unread}</strong></div><div className="flex justify-between"><span className="text-sm text-slate-500">Read</span><strong>{notifications.length-unread}</strong></div></div></div></aside>
    </div>
  </div>
}
