import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { contractService } from '../services/contractService'
import LoadingState from '../components/ui/LoadingState'
import ErrorState from '../components/ui/ErrorState'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import { ArrowRight, Calendar, FileText, IndianRupee, PackageCheck } from 'lucide-react'

export default function BuyerContractsPage() {
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await contractService.getAssigned()
      setContracts(res.data || [])
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load your assigned contracts.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) {
    return <div className="page-container"><LoadingState title="Loading your contracts" message="Fetching contracts assigned to your buyer account..." /></div>
  }

  if (error) {
    return <div className="page-container"><ErrorState title="Unable to load contracts" message={error} onRetry={load} /></div>
  }

  return (
    <div className="page-container space-y-6">
      <PageHeader
        eyebrow="Buyer workspace"
        title="My Contracts"
        subtitle="Track contracts where your bid has been accepted and manage the next execution steps."
        stats={[
          { label: 'Assigned', value: contracts.length },
          { label: 'Active', value: contracts.filter(c => ['ACCEPTED', 'NEGOTIATING', 'ACTIVE'].includes(c.status)).length },
          { label: 'Completed', value: contracts.filter(c => c.status === 'COMPLETED').length },
        ]}
      />

      {contracts.length === 0 ? (
        <EmptyState
          title="No assigned contracts yet"
          description="When a farmer accepts one of your bids, the contract will appear here."
          action={<Link to="/marketplace" className="btn btn-primary">Browse Marketplace</Link>}
        />
      ) : (
        <div className="grid lg:grid-cols-2 gap-5">
          {contracts.map(contract => (
            <Link key={contract.id} to={`/contracts/${contract.id}`} className="card card-interactive block">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Assigned contract</p>
                  <h2 className="text-lg font-black text-slate-900 mt-1 break-words">{contract.title}</h2>
                </div>
                <StatusBadge status={contract.status} />
              </div>

              {contract.description && (
                <p className="text-sm text-slate-500 mt-3 line-clamp-3">{contract.description}</p>
              )}

              <div className="grid sm:grid-cols-2 gap-3 mt-5">
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500"><PackageCheck className="w-4 h-4" /> Quantity</div>
                  <p className="font-bold text-slate-900 mt-1">{contract.quantity} q</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500"><IndianRupee className="w-4 h-4" /> Price / unit</div>
                  <p className="font-bold text-slate-900 mt-1">₹{contract.price_per_unit}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 sm:col-span-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500"><Calendar className="w-4 h-4" /> Contract period</div>
                  <p className="font-semibold text-slate-900 mt-1">{contract.start_date} → {contract.end_date}</p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3 text-sm font-bold text-emerald-700">
                <span className="inline-flex items-center gap-2"><FileText className="w-4 h-4" /> Open contract workspace</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
