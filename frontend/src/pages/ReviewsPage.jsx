import { useEffect, useMemo, useState } from 'react'
import { contractService } from '../services/contractService'
import { reviewService } from '../services/reviewService'
import { useAuth } from '../context/AuthContext'
import LoadingState from '../components/ui/LoadingState'
import ErrorState from '../components/ui/ErrorState'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import { Star, MessageSquare, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

function StarRating({ value, onChange, readOnly = false }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${value} out of 5 stars`}>
      {[1,2,3,4,5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          className={`p-0.5 ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
          aria-label={`${star} star`}
        >
          <Star className={`w-5 h-5 ${star <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
        </button>
      ))}
    </div>
  )
}

export default function ReviewsPage() {
  const { user, hasRole } = useAuth()
  const [reviews, setReviews] = useState([])
  const [contracts, setContracts] = useState([])
  const [reviewedContractIds, setReviewedContractIds] = useState(new Set())
  const [selectedContract, setSelectedContract] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const contractRequests = []
      if (hasRole('farmer')) contractRequests.push(contractService.getMine())
      if (hasRole('buyer')) contractRequests.push(contractService.getAssigned())
      const [contractResponses, reviewRes] = await Promise.all([
        Promise.all(contractRequests),
        reviewService.getForUser(user.id),
      ])
      const mergedContracts = contractResponses.flatMap(response => response.data || [])
      const completed = mergedContracts
        .filter(c => c.status === 'COMPLETED')
        .filter((contract, index, rows) => rows.findIndex(item => item.id === contract.id) === index)
      setContracts(completed)
      setReviews(reviewRes.data || [])

      // The backend exposes reviews received by a user. It intentionally does
      // not expose a "my reviews" collection, so we do not guess from received
      // reviews which contracts the current user already reviewed.
      setReviewedContractIds(new Set())
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load reviews.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [user?.id, hasRole('farmer')])

  const average = useMemo(() => {
    if (!reviews.length) return '—'
    return (reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length).toFixed(1)
  }, [reviews])

  const submit = async (e) => {
    e.preventDefault()
    if (!selectedContract) return
    setSaving(true)
    try {
      const res = await reviewService.create({
        contract_id: selectedContract,
        rating,
        comment: comment.trim() || null,
      })
      toast.success('Review submitted successfully')
      setComment('')
      setSelectedContract('')
      // The response is the review created for the other participant, so it
      // should not be inserted into the "received by me" list.
      if (res.data?.reviewer_id === user.id) {
        // Keep the list untouched; reload confirms the backend state.
      }
      await load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit review')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="page-container"><LoadingState title="Loading reviews" message="Fetching completed contracts and received reviews..." /></div>
  if (error) return <div className="page-container"><ErrorState title="Unable to load reviews" message={error} onRetry={load} /></div>

  return (
    <div className="page-container space-y-6">
      <PageHeader
        eyebrow="Trust & reputation"
        title="Reviews"
        subtitle="Review completed contracts and see the feedback other participants have left for you."
        stats={[
          { label: 'Received', value: reviews.length },
          { label: 'Average', value: average },
          { label: 'Completed contracts', value: contracts.length },
        ]}
      />

      <section className="grid lg:grid-cols-[1.05fr_.95fr] gap-5">
        <div className="card">
          <div className="flex items-start gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 grid place-items-center"><Star className="w-5 h-5" /></div>
            <div><h2 className="font-black text-slate-900">Leave a review</h2><p className="text-sm text-slate-500 mt-1">Only completed contracts can be reviewed by their participants.</p></div>
          </div>

          {contracts.length === 0 ? (
            <EmptyState title="No completed contracts" description="Once a contract is completed, it will become eligible for a review." />
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="label label-required">Completed contract</label>
                <select className="input" required value={selectedContract} onChange={e => setSelectedContract(e.target.value)}>
                  <option value="">Select a contract</option>
                  {contracts.filter(c => !reviewedContractIds.has(c.id)).map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Rating</label>
                <StarRating value={rating} onChange={setRating} />
              </div>
              <div>
                <label className="label">Comment</label>
                <textarea className="input" rows="4" maxLength={5000} value={comment} onChange={e => setComment(e.target.value)} placeholder="Share a concise, useful experience..." />
              </div>
              <button className="btn btn-primary w-full sm:w-auto" disabled={saving || !selectedContract}>
                <CheckCircle2 className="w-4 h-4" /> {saving ? 'Submitting...' : 'Submit review'}
              </button>
            </form>
          )}
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-5"><MessageSquare className="w-5 h-5 text-emerald-600" /><h2 className="font-black text-slate-900">Feedback received</h2></div>
          {reviews.length === 0 ? (
            <EmptyState title="No reviews yet" description="Reviews from your completed contracts will appear here." />
          ) : (
            <div className="space-y-4">
              {reviews.map(review => (
                <article key={review.id} className="rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <StarRating value={Number(review.rating)} readOnly />
                    <span className="text-xs text-slate-400">{review.created_at ? new Date(review.created_at).toLocaleDateString() : '—'}</span>
                  </div>
                  {review.comment && <p className="text-sm text-slate-700 mt-3 whitespace-pre-wrap break-words">“{review.comment}”</p>}
                  <p className="text-xs text-slate-400 mt-3 break-all">Contract: {review.contract_id}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
