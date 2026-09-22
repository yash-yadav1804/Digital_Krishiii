import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { leaseRequestService } from '../services/leaseRequestService'
import LoadingState from '../components/ui/LoadingState'
import ErrorState from '../components/ui/ErrorState'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import { ArrowRight, Calendar, IndianRupee, MessageSquare } from 'lucide-react'

export default function MyLeaseRequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await leaseRequestService.getMine()
      setRequests(res.data || [])
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load lease requests.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return <div className="page-container"><LoadingState title="Loading lease requests" message="Fetching your farmland requests..." /></div>
  if (error) return <div className="page-container"><ErrorState title="Unable to load requests" message={error} onRetry={load} /></div>

  return (
    <div className="page-container space-y-6">
      <PageHeader
        eyebrow="Buyer workspace"
        title="My Lease Requests"
        subtitle="Track every farmland lease request you have submitted and its current decision."
        stats={[
          { label: 'Total', value: requests.length },
          { label: 'Pending', value: requests.filter(r => r.status === 'PENDING').length },
          { label: 'Accepted', value: requests.filter(r => r.status === 'ACCEPTED').length },
        ]}
        action={<Link to="/lease-marketplace" className="btn btn-primary">Find farmland</Link>}
      />

      {requests.length === 0 ? (
        <EmptyState
          title="No lease requests"
          description="Submit a request from the lease marketplace and it will be tracked here."
          action={<Link to="/lease-marketplace" className="btn btn-primary">Browse lease lands</Link>}
        />
      ) : (
        <div className="space-y-4">
          {requests.map(request => (
            <article key={request.id} className="card">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Lease request</span>
                    <StatusBadge status={request.status} />
                  </div>
                  <h2 className="font-black text-slate-900 mt-2 break-all">{request.id}</h2>
                </div>
                <Link to="/lease-marketplace" className="text-sm font-bold text-emerald-700 inline-flex items-center gap-1">
                  View marketplace <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 mt-5">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Period</p>
                  <p className="font-semibold text-slate-900 mt-1 flex items-center gap-1"><Calendar className="w-4 h-4" />{request.start_date} → {request.end_date}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Offered rate / acre</p>
                  <p className="font-semibold text-slate-900 mt-1 flex items-center gap-1"><IndianRupee className="w-4 h-4" />{request.offered_rate_per_acre}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Submitted</p>
                  <p className="font-semibold text-slate-900 mt-1">{request.created_at ? new Date(request.created_at).toLocaleDateString() : '—'}</p>
                </div>
              </div>

              {request.message && (
                <div className="mt-4 rounded-xl border border-slate-100 bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400 flex items-center gap-2"><MessageSquare className="w-3.5 h-3.5" /> Message</p>
                  <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap break-words">{request.message}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
