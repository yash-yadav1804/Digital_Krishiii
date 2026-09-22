import { useEffect, useMemo, useState } from 'react'
import { equipmentRequestService } from '../services/equipmentRequestService'
import { equipmentService } from '../services/equipmentService'
import LoadingState from '../components/ui/LoadingState'
import ErrorState from '../components/ui/ErrorState'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import { CheckCircle2, Clock3, Package, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function EquipmentRequestsPage() {
  const [equipment, setEquipment] = useState([])
  const [selectedEquipment, setSelectedEquipment] = useState('')
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingRequests, setLoadingRequests] = useState(false)
  const [error, setError] = useState('')

  const loadEquipment = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await equipmentService.getMine()
      const rows = res.data || []
      setEquipment(rows)
      if (rows.length) setSelectedEquipment(prev => prev || rows[0].id)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load your equipment.')
    } finally {
      setLoading(false)
    }
  }

  const loadRequests = async (equipmentId) => {
    if (!equipmentId) {
      setRequests([])
      return
    }
    setLoadingRequests(true)
    try {
      const res = await equipmentRequestService.getForEquipment(equipmentId)
      setRequests(res.data || [])
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load equipment requests')
    } finally {
      setLoadingRequests(false)
    }
  }

  useEffect(() => { loadEquipment() }, [])
  useEffect(() => { loadRequests(selectedEquipment) }, [selectedEquipment])

  const selected = useMemo(() => equipment.find(e => e.id === selectedEquipment), [equipment, selectedEquipment])

  const decide = async (id, status) => {
    try {
      await equipmentRequestService.update(id, status)
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))
      toast.success(`Request ${status.toLowerCase()}`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update request')
    }
  }

  if (loading) return <div className="page-container"><LoadingState title="Loading equipment requests" message="Fetching your inventory and rental requests..." /></div>
  if (error) return <div className="page-container"><ErrorState title="Unable to load equipment" message={error} onRetry={loadEquipment} /></div>

  return (
    <div className="page-container space-y-6">
      <PageHeader
        eyebrow="Provider operations"
        title="Equipment Requests"
        subtitle="Review farmer rental requests and accept or reject pending requests from one workspace."
        stats={[
          { label: 'Equipment', value: equipment.length },
          { label: 'Requests', value: requests.length },
          { label: 'Pending', value: requests.filter(r => r.status === 'PENDING').length },
        ]}
      />

      {equipment.length === 0 ? (
        <EmptyState title="No equipment inventory" description="Add equipment first. Farmer rental requests will appear here." />
      ) : (
        <>
          <div className="card">
            <label className="label">Select equipment</label>
            <select className="input max-w-2xl" value={selectedEquipment} onChange={e => setSelectedEquipment(e.target.value)}>
              {equipment.map(item => <option key={item.id} value={item.id}>{item.name} — ₹{item.rental_price_per_day}/day</option>)}
            </select>
            {selected && <p className="text-sm text-slate-500 mt-2">{selected.location || 'Location not specified'} · {selected.is_available ? 'Available' : 'Unavailable'}</p>}
          </div>

          {loadingRequests ? (
            <LoadingState title="Loading requests" message="Fetching requests for the selected equipment..." />
          ) : requests.length === 0 ? (
            <EmptyState title="No requests yet" description="New farmer rental requests for this equipment will appear here." />
          ) : (
            <div className="space-y-4">
              {requests.map(request => (
                <article key={request.id} className="card">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-2 items-center">
                        <Package className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold text-slate-900 break-all">Request {request.id}</span>
                        <StatusBadge status={request.status} />
                      </div>
                      <p className="text-sm text-slate-500 mt-2">{request.start_date} → {request.end_date} · ₹{request.agreed_rate_per_day}/day</p>
                    </div>
                    {request.status === 'PENDING' && (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button className="btn btn-primary btn-sm" onClick={() => decide(request.id, 'ACCEPTED')}><CheckCircle2 className="w-4 h-4" /> Accept</button>
                        <button className="btn btn-danger btn-sm" onClick={() => decide(request.id, 'REJECTED')}><XCircle className="w-4 h-4" /> Reject</button>
                      </div>
                    )}
                  </div>
                  {request.message && <p className="text-sm text-slate-700 mt-4 rounded-xl bg-slate-50 p-4 whitespace-pre-wrap break-words">{request.message}</p>}
                  <div className="text-xs text-slate-400 mt-4 flex items-center gap-1"><Clock3 className="w-3.5 h-3.5" /> Submitted {request.created_at ? new Date(request.created_at).toLocaleString() : '—'}</div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
