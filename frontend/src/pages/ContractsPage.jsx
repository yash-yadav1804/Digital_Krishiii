import { useState, useEffect } from 'react'
import { contractService } from '../services/contractService'
import { bidService } from '../services/bidService'
import { landService } from '../services/landService'
import { cropService } from '../services/cropService'
import LoadingState from '../components/ui/LoadingState'
import ErrorState from '../components/ui/ErrorState'
import EmptyState from '../components/EmptyState'
import ErrorMessage from '../components/ErrorMessage'
import Modal from '../components/ui/Modal'
import PageHeader from '../components/ui/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import { FileText, Plus, Pencil, Trash2, Gavel, Calendar, Package, DollarSign, MapPin, Wheat } from 'lucide-react'
import toast from 'react-hot-toast'
import { DEMO_CONTRACTS, DEMO_LANDS, DEMO_CROPS, fillPreviewData } from '../data/demoData'
import DemoBanner from '../components/ui/DemoBanner'
import ImageUpload from '../components/ui/ImageUpload'
import { uploadService } from '../services/uploadService'

function ContractModal({ contract, lands, crops, onClose, onSaved }) {
  const isEdit = !!contract
  const [form, setForm] = useState(contract || {
    title: '', description: '', land_id: lands[0]?.id || '', crop_id: crops[0]?.id || '',
    quantity: '', price_per_unit: '', start_date: '', end_date: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imageFile, setImageFile] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      let payload = { ...form }
      if (imageFile) {
        const upload = await uploadService.image(imageFile)
        payload.image_url = upload.data.url
      }

      if (isEdit) {
        await contractService.update(contract.id, payload)
        toast.success('Contract updated successfully')
      } else {
        await contractService.create(payload)
        toast.success('Contract created successfully')
      }
      onSaved()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save contract')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={isEdit ? 'Edit Contract' : 'Create Contract'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label label-required">Contract Title</label>
          <input
            className="input"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="e.g., Wheat Supply Contract - Winter 2026"
            required
            minLength={3}
          />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            className="input"
            rows={3}
            value={form.description || ''}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Add details about quality requirements, delivery terms, etc."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label label-required">Land</label>
            <select
              className="input"
              value={form.land_id}
              onChange={e => setForm({ ...form, land_id: e.target.value })}
              required
            >
              {lands.map(l => (
                <option key={l.id} value={l.id}>{l.land_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label label-required">Crop</label>
            <select
              className="input"
              value={form.crop_id}
              onChange={e => setForm({ ...form, crop_id: e.target.value })}
              required
            >
              {crops.map(c => (
                <option key={c.id} value={c.id}>{c.crop_name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label label-required">Quantity (quintals)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              className="input"
              value={form.quantity}
              onChange={e => setForm({ ...form, quantity: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <label className="label label-required">Price per unit (₹)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              className="input"
              value={form.price_per_unit}
              onChange={e => setForm({ ...form, price_per_unit: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <ImageUpload
          value={form.image_url}
          onChange={(file) => {
            setImageFile(file)
            if (!file) setForm({ ...form, image_url: '' })
          }}
          label="Contract photo"
          hint="Add a crop, produce batch or farm-gate photo buyers can verify"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label label-required">Start Date</label>
            <input
              type="date"
              className="input"
              value={form.start_date}
              onChange={e => setForm({ ...form, start_date: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label label-required">End Date</label>
            <input
              type="date"
              className="input"
              value={form.end_date}
              onChange={e => setForm({ ...form, end_date: e.target.value })}
              required
            />
          </div>
        </div>

        {error && <ErrorMessage message={error} />}

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            className="btn btn-secondary flex-1"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary flex-1"
            disabled={loading}
          >
            {loading ? 'Saving...' : isEdit ? 'Update Contract' : 'Create Contract'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function BidsModal({ contract, onClose, onBidUpdated }) {
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchBids = async () => {
    try {
      setLoading(true)
      const { data } = await bidService.getForContract(contract.id)
      setBids(data)
      setError('')
    } catch (err) {
      setError('Failed to load bids')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBids()
  }, [contract.id])

  const handleBidAction = async (bidId, status) => {
    try {
      await bidService.updateStatus(bidId, status)
      setBids(bids.map(b => b.id === bidId ? { ...b, status } : b))
      toast.success(`Bid ${status.toLowerCase()}`)
      if (onBidUpdated) onBidUpdated()
    } catch (err) {
      toast.error('Failed to update bid')
    }
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={`Bids for "${contract.title}"`}
      size="md"
    >
      {loading ? (
        <div className="py-8">
          <LoadingState title="Loading bids" message="Fetching bid information..." />
        </div>
      ) : error ? (
        <ErrorState title="Unable to load bids" message={error} onRetry={fetchBids} />
      ) : bids.length === 0 ? (
        <div className="py-8 text-center">
          <Gavel className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No bids received yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Buyers will see your contract in the marketplace
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {bids.map(bid => (
            <div
              key={bid.id}
              className="border border-gray-200 rounded-xl p-4 hover:border-primary-300 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <StatusBadge status={bid.status} />
                <span className="text-xs text-gray-400 font-mono">
                  ID: {bid.id.slice(0, 8)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Offered Quantity</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {bid.offered_quantity} q
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Offered Price/unit</div>
                  <div className="text-lg font-semibold text-gray-900">
                    ₹{bid.offered_price_per_unit}
                  </div>
                </div>
              </div>

              {bid.message && (
                <div className="p-3 bg-gray-50 rounded-lg mb-3">
                  <div className="text-xs text-gray-500 mb-1">Message</div>
                  <p className="text-sm text-gray-700 italic">"{bid.message}"</p>
                </div>
              )}

              {bid.status === 'PENDING' && (
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleBidAction(bid.id, 'ACCEPTED')}
                    className="btn btn-primary btn-sm flex-1"
                  >
                    Accept Bid
                  </button>
                  <button
                    onClick={() => handleBidAction(bid.id, 'REJECTED')}
                    className="btn btn-danger btn-sm flex-1"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState([])
  const [lands, setLands] = useState([])
  const [crops, setCrops] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null)
  const [bidsModal, setBidsModal] = useState(null)
  const [demoMode, setDemoMode] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [cRes, lRes, crRes] = await Promise.all([
        contractService.getMine(),
        landService.getAll(),
        cropService.getAll(),
      ])
      const contractPreview = fillPreviewData(cRes.data, DEMO_CONTRACTS, 6)
      const landPreview = fillPreviewData(lRes.data, DEMO_LANDS, 6)
      const cropPreview = fillPreviewData(crRes.data, DEMO_CROPS, 6)
      setContracts(contractPreview.rows)
      setLands(landPreview.rows)
      setCrops(cropPreview.rows)
      setDemoMode(contractPreview.hasDemo || landPreview.hasDemo || cropPreview.hasDemo)
      setError('')
    } catch (err) {
      setContracts(DEMO_CONTRACTS.map(row => ({ ...row, __demo: true })))
      setLands(DEMO_LANDS.map(row => ({ ...row, __demo: true })))
      setCrops(DEMO_CROPS.map(row => ({ ...row, __demo: true })))
      setDemoMode(true)
      setError('')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this contract? This action cannot be undone.')) return
    try {
      await contractService.delete(id)
      setContracts(contracts.filter(c => c.id !== id))
      toast.success('Contract deleted successfully')
    } catch (err) {
      toast.error('Failed to delete contract')
    }
  }

  const canCreateContract = lands.length > 0 && crops.length > 0

  if (loading) {
    return (
      <div className="page-container">
        <LoadingState
          title="Loading contracts"
          message="Fetching your contract information..."
        />
      </div>
    )
  }

  return (
    <div className="page-container">
      {demoMode && <DemoBanner message="Curated sample contracts are included when your workspace has fewer than six live records. Sample rows are read-only." />}

      <PageHeader
        eyebrow="Contract Management"
        title="My Contracts"
        subtitle="Create and manage farming contracts. Invite buyers to bid on your produce and negotiate terms."
        action={
          <button
            className="btn btn-primary"
            onClick={() => setModal('create')}
            disabled={!canCreateContract}
            title={!canCreateContract ? 'Add lands and crops first' : ''}
          >
            <Plus className="w-4 h-4" />
            Create Contract
          </button>
        }
        stats={
          contracts.length > 0
            ? [
                { label: 'Total Contracts', value: contracts.length },
                {
                  label: 'Active',
                  value: contracts.filter(c => c.status === 'OPEN').length
                },
                {
                  label: 'Completed',
                  value: contracts.filter(c => c.status === 'COMPLETED').length
                },
              ]
            : []
        }
      />

      {!canCreateContract && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="font-medium text-yellow-900">Setup Required</p>
              <p className="text-sm text-yellow-700 mt-1">
                You need at least one land and one crop before creating contracts.
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <ErrorState
          title="Unable to load contracts"
          message={error}
          onRetry={fetchData}
        />
      )}

      {!error && contracts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No contracts yet"
          description="Create your first contract to invite buyers to bid on your produce. Set terms, pricing, and delivery schedules."
          action={
            canCreateContract && (
              <button
                className="btn btn-primary mt-4"
                onClick={() => setModal('create')}
              >
                <Plus className="w-4 h-4" />
                Create Your First Contract
              </button>
            )
          }
        />
      ) : (
        <div className="space-y-4">
          {contracts.map(contract => {
            const totalValue = (parseFloat(contract.quantity) || 0) * (parseFloat(contract.price_per_unit) || 0)

            return (
              <div
                key={contract.id}
                className="card hover:shadow-md transition-all group overflow-hidden"
              >
                {contract.image_url && <img src={contract.image_url} alt={contract.title} className="w-full h-40 object-cover rounded-xl mb-4" />}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg text-gray-900 truncate">
                        {contract.title}
                      </h3>
                      <StatusBadge status={contract.status} />
                    </div>

                    {contract.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {contract.description}
                      </p>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-start gap-2">
                        <Package className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs text-gray-500">Quantity</div>
                          <div className="font-semibold text-gray-900">
                            {contract.quantity} q
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs text-gray-500">Price/unit</div>
                          <div className="font-semibold text-gray-900">
                            ₹{contract.price_per_unit}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs text-gray-500">Contract Period</div>
                          <div className="text-sm text-gray-900">
                            {contract.start_date} → {contract.end_date}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs text-gray-500">Total Value</div>
                          <div className="font-semibold text-primary-600">
                            ₹{totalValue.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setBidsModal(contract)}
                      className="btn btn-secondary btn-sm whitespace-nowrap"
                      title="View and manage bids"
                    >
                      <Gavel className="w-4 h-4" />
                      View Bids
                    </button>
                    {!contract.__demo && <div className="flex gap-2">
                      <button
                        onClick={() => setModal(contract)}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Edit contract"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(contract.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete contract"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modal && (
        <ContractModal
          contract={modal === 'create' ? null : modal}
          lands={lands}
          crops={crops}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null)
            fetchData()
          }}
        />
      )}

      {bidsModal && (
        <BidsModal
          contract={bidsModal}
          onClose={() => setBidsModal(null)}
          onBidUpdated={fetchData}
        />
      )}
    </div>
  )
}
