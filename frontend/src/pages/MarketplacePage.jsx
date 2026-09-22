import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { contractService } from "../services/contractService";
import { bidService } from "../services/bidService";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import ErrorMessage from "../components/ErrorMessage";
import { StatusBadge } from "../components/StatusBadge";
import { Sprout, Gavel, Search, MapPin, CalendarDays, ArrowUpRight } from "lucide-react";
import { DEMO_CONTRACTS, fillPreviewData } from "../data/demoData";
import DemoBanner from "../components/ui/DemoBanner";
import ImageUpload from "../components/ui/ImageUpload";
import { uploadService } from "../services/uploadService";

function BidModal({ contract, onClose, onSaved }) {
  const [form, setForm] = useState({
    offered_quantity: "",
    offered_price_per_unit: "",
    message: "",
    image_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let payload = { ...form };
      if (imageFile) {
        const upload = await uploadService.image(imageFile);
        payload.image_url = upload.data.url;
      }
      await bidService.create({
        contract_id: contract.id,
        ...payload,
      });

      onSaved();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to submit bid");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold min-w-0 break-words">
            Place Bid — {contract.title}
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl flex-shrink-0"
            aria-label="Close bid modal"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Farmer's Asking Price */}
          <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600 min-w-0">
            <div className="break-words">
              Farmer asks: <strong>{contract.quantity} q</strong> @{" "}
              <strong>₹{contract.price_per_unit}/unit</strong>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="label">Your Quantity (q) *</label>

            <input
              type="number"
              step="0.01"
              className="input w-full max-w-full"
              value={form.offered_quantity}
              onChange={(e) =>
                setForm({
                  ...form,
                  offered_quantity: e.target.value,
                })
              }
              required
            />
          </div>

          {/* Price */}
          <div>
            <label className="label">Your Price/unit (₹) *</label>

            <input
              type="number"
              step="0.01"
              className="input w-full max-w-full"
              value={form.offered_price_per_unit}
              onChange={(e) =>
                setForm({
                  ...form,
                  offered_price_per_unit: e.target.value,
                })
              }
              required
            />
          </div>

          <ImageUpload
            value={form.image_url}
            onChange={(file) => {
              setImageFile(file);
              if (!file) setForm({ ...form, image_url: "" });
            }}
            label="Supporting photo (optional)"
            hint="Add a crop, quality or delivery photo"
          />

          {/* Message */}
          <div>
            <label className="label">Message to farmer</label>

            <textarea
              className="input w-full max-w-full"
              rows={2}
              value={form.message}
              onChange={(e) =>
                setForm({
                  ...form,
                  message: e.target.value,
                })
              }
              placeholder="Optional message..."
            />
          </div>

          <ErrorMessage message={error} />

          {/* Modal Footer */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              className="btn-secondary flex-1 w-full"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn-primary flex-1 w-full"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Bid"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  const { hasRole } = useAuth();
  const canBid = hasRole("buyer");
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [bidModal, setBidModal] = useState(null);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    contractService.getOpen().then((r) => {
      const preview = fillPreviewData(r.data, DEMO_CONTRACTS, 6)
      setContracts(preview.rows)
      setDemoMode(preview.hasDemo)
    }).catch(() => {
      setContracts(DEMO_CONTRACTS.map(row => ({ ...row, __demo: true })))
      setDemoMode(true);
      setError("");
    }).finally(() => setLoading(false));
  }, []);

  const filtered = contracts.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="page-container"><Spinner /></div>;

  return (
    <div className="page-container">
      {demoMode && <DemoBanner message="Sample marketplace opportunities are included when fewer than six live contracts are available. Sample opportunities are preview-only." />}
      <div className="page-header">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div>
            <p className="text-xs uppercase tracking-widest font-bold text-emerald-600">Buyer marketplace</p>
            <h1 className="page-title mt-1">Contract Marketplace</h1>
            <p className="page-subtitle">Compare open agricultural contracts, pricing and delivery windows before placing a bid.</p>
          </div>
          <div className="w-full lg:w-80 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input className="input pl-10" placeholder="Search crops, contracts..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}
      <div className="flex items-center justify-between gap-3 mb-4"><p className="text-sm text-slate-500">{filtered.length} opportunities</p><span className="badge badge-success">Live-ready marketplace</span></div>

      {filtered.length === 0 ? <EmptyState icon={Sprout} title="No matching contracts" description="Try a different crop or contract name." /> : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((c) => (
            <article key={c.id} className="card overflow-hidden p-0 group hover:-translate-y-1 transition-all">
              {c.image_url && <img src={c.image_url} alt={c.title} className="w-full h-44 object-cover" />}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3"><div className="min-w-0"><span className="badge badge-info">{c.status}</span><h3 className="font-black text-lg text-slate-900 mt-3 line-clamp-2">{c.title}</h3></div><ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-600 shrink-0" /></div>
                <p className="text-sm text-slate-500 mt-2 line-clamp-2">{c.description}</p>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="rounded-xl bg-slate-50 p-3"><p className="text-[11px] uppercase tracking-wide text-slate-400">Quantity</p><p className="font-bold text-slate-900 mt-1">{c.quantity} q</p></div>
                  <div className="rounded-xl bg-emerald-50 p-3"><p className="text-[11px] uppercase tracking-wide text-emerald-600">Price / unit</p><p className="font-bold text-emerald-800 mt-1">₹{c.price_per_unit}</p></div>
                </div>
                <div className="flex flex-wrap gap-3 mt-4 text-xs text-slate-500"><span className="inline-flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5"/>{c.start_date} → {c.end_date}</span><span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/>{c.land_name || 'Verified farm'}</span></div>
                {canBid ? (
                  <button className="btn btn-primary w-full mt-5" disabled={c.__demo} onClick={() => setBidModal(c)}><Gavel className="w-4 h-4"/> {c.__demo ? "Preview only" : "Place Bid"}</button>
                ) : (
                  <Link to={`/contracts/${c.id}`} className="btn btn-secondary w-full mt-5"><ArrowUpRight className="w-4 h-4"/> View contract</Link>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {bidModal && <BidModal contract={bidModal} onClose={() => setBidModal(null)} onSaved={() => { setBidModal(null); alert("Bid submitted successfully!"); }} />}
    </div>
  );
}
