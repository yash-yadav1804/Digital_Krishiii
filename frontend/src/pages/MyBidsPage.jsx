import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { bidService } from '../services/bidService'
import LoadingState from '../components/ui/LoadingState'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import { Gavel, Package, DollarSign, FileText, ArrowRight, CheckCircle2, Clock3, XCircle } from 'lucide-react'
import { DEMO_BIDS, fillPreviewData } from '../data/demoData'
import DemoBanner from '../components/ui/DemoBanner'

export default function MyBidsPage() {
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)
  const [demoMode, setDemoMode] = useState(false)

  const fetchBids = async () => {
    try {
      setLoading(true)
      const { data } = await bidService.getMine()
      const preview = fillPreviewData(data, DEMO_BIDS, 6); setBids(preview.rows); setDemoMode(preview.hasDemo)
    } catch {
      setBids(DEMO_BIDS.map(row => ({ ...row, __demo: true })))
      setDemoMode(true)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchBids() }, [])
  if (loading) return <div className="page-container"><LoadingState title="Loading your bids" message="Fetching bid information..." /></div>

  const pending = bids.filter(b => b.status === 'PENDING').length
  const accepted = bids.filter(b => b.status === 'ACCEPTED').length
  const rejected = bids.filter(b => b.status === 'REJECTED').length

  return <div className="page-container">
    {demoMode && <DemoBanner message="Sample bid submissions are included when your live bid history is small. Sample rows are read-only." />}
    <PageHeader eyebrow="Bid management" title="My Bids" subtitle="Track submitted offers, negotiation status and total contract value at a glance." stats={[
      { label: 'Total bids', value: bids.length }, { label: 'Pending', value: pending }, { label: 'Accepted', value: accepted }, { label: 'Rejected', value: rejected },
    ]} />

    <div className="grid md:grid-cols-3 gap-4 mb-6">
      {[['Pending review', pending, Clock3, 'bg-amber-50 text-amber-600'], ['Accepted deals', accepted, CheckCircle2, 'bg-emerald-50 text-emerald-600'], ['Rejected', rejected, XCircle, 'bg-rose-50 text-rose-600']].map(([label,value,Icon,style]) => <div className="card flex items-center gap-3" key={label}><div className={`w-11 h-11 rounded-xl grid place-items-center ${style}`}><Icon className="w-5 h-5"/></div><div><p className="text-sm text-slate-500">{label}</p><p className="text-xl font-black text-slate-900">{value}</p></div></div>)}
    </div>

    {bids.length === 0 ? <EmptyState icon={Gavel} title="No bids submitted yet" description="Browse the marketplace to find contracts and submit your first bid." action={<Link to="/marketplace" className="btn btn-primary mt-4"><FileText className="w-4 h-4"/> Browse Marketplace</Link>} /> :
      <div className="space-y-4">{bids.map(bid => {
        const total = (parseFloat(bid.offered_quantity)||0) * (parseFloat(bid.offered_price_per_unit)||0)
        return <div className="card hover:border-emerald-200 transition-colors" key={bid.id}>
          <div className="flex flex-col lg:flex-row lg:items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 grid place-items-center shrink-0"><Gavel className="w-6 h-6"/></div>
            <div className="flex-1 min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-black text-slate-900">{bid.contract_title || 'Contract bid'}</h3><StatusBadge status={bid.status}/></div><p className="text-xs font-mono text-slate-400 mt-1">Bid #{bid.id.slice(0,8)}</p>{bid.message && <p className="text-sm text-slate-500 mt-3 line-clamp-2">“{bid.message}”</p>}</div>
            <div className="grid grid-cols-3 gap-5 w-full lg:w-auto"><div><p className="text-[11px] uppercase tracking-wide text-slate-400">Quantity</p><p className="font-bold text-slate-900 mt-1 flex items-center gap-1"><Package className="w-3.5 h-3.5"/>{bid.offered_quantity} q</p></div><div><p className="text-[11px] uppercase tracking-wide text-slate-400">Offer</p><p className="font-bold text-emerald-700 mt-1 flex items-center gap-1"><DollarSign className="w-3.5 h-3.5"/>₹{bid.offered_price_per_unit}</p></div><div><p className="text-[11px] uppercase tracking-wide text-slate-400">Total</p><p className="font-black text-slate-900 mt-1">₹{total.toLocaleString('en-IN')}</p></div></div>
            <Link to={`/contracts/${bid.contract_id}`} className="btn btn-secondary shrink-0">Details <ArrowRight className="w-4 h-4"/></Link>
          </div>
        </div>
      })}</div>}
  </div>
}
