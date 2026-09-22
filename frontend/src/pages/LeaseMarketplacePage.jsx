import { useEffect, useState } from "react";
import { landListingService } from "../services/landListingService";
import { leaseRequestService } from "../services/leaseRequestService";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/EmptyState";
import ErrorMessage from "../components/ErrorMessage";
import PageHeader from "../components/ui/PageHeader";
import {
  Building2,
  Send,
  MapPin,
  DollarSign,
  Calendar,
  FileText,
  ArrowUpRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { DEMO_LISTINGS, fillPreviewData } from "../data/demoData";
import DemoBanner from "../components/ui/DemoBanner";

function RequestForm({ listing, onClose, onSaved }) {
  const [form, setForm] = useState({
    listing_id: listing.id,
    start_date: "",
    end_date: "",
    offered_rate_per_acre: listing.rate_per_acre,
    message: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await leaseRequestService.create(form);
      toast.success("Lease request submitted successfully");
      onSaved();
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to submit request");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border-t mt-4 pt-4 min-w-0">
      <h3 className="text-sm font-semibold text-gray-900 mb-3 break-words">
        Submit Lease Request
      </h3>

      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="min-w-0">
            <label className="label label-required">Start Date</label>
            <input
              className="input w-full max-w-full"
              type="date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              required
            />
          </div>

          <div className="min-w-0">
            <label className="label label-required">End Date</label>
            <input
              className="input w-full max-w-full"
              type="date"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <label className="label label-required">
            Your Offer (₹ per acre)
          </label>
          <input
            className="input w-full max-w-full"
            type="number"
            min="1"
            step="0.01"
            value={form.offered_rate_per_acre}
            onChange={(e) =>
              setForm({
                ...form,
                offered_rate_per_acre: e.target.value,
              })
            }
            required
          />
        </div>

        <div>
          <label className="label">Message to Landowner</label>
          <textarea
            className="input w-full max-w-full"
            rows="2"
            placeholder="Describe your intended use, experience, etc."
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
        </div>

        {error && <ErrorMessage message={error} />}

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            type="button"
            className="btn btn-secondary flex-1"
            onClick={onClose}
          >
            Cancel
          </button>

          <button className="btn btn-primary flex-1" disabled={saving}>
            {saving ? "Sending..." : "Send Request"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function LeaseMarketplacePage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [demoMode, setDemoMode] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await landListingService.getOpen();
      const preview = fillPreviewData(res.data, DEMO_LISTINGS, 6); setListings(preview.rows); setDemoMode(preview.hasDemo);
    } catch {
      setListings(DEMO_LISTINGS.map(row => ({ ...row, __demo: true }))); setDemoMode(true);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);
  if (loading) return <div className="page-container"><LoadingState title="Loading land listings" message="Fetching available agricultural land..." /></div>;
  const totalAcres = listings.reduce((sum,l) => sum + (parseFloat(l.area_acres)||0), 0);

  return <div className="page-container">
    {demoMode && <DemoBanner message="Sample farmland listings are included when the live catalogue is small. Sample listings are preview-only." />}
    <PageHeader eyebrow="Land leasing" title="Land Lease Marketplace" subtitle="Compare productive farmland by acreage, irrigation, location and commercial lease rate." stats={[{label:'Listings',value:listings.length},{label:'Total area',value:`${totalAcres.toFixed(1)} ac`}]} />
    <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {listings.map(listing => {
        const expanded = selected?.id === listing.id;
        return <article key={listing.id} className={`card overflow-hidden p-0 group ${expanded ? 'ring-2 ring-emerald-500' : ''}`}>
          {listing.image_url && <img src={listing.image_url} alt={listing.land_name || 'Farmland'} className="w-full h-40 object-cover"/>}
          <div className="p-5">
            <div className="flex items-center justify-between gap-2"><span className="badge badge-success">{listing.listing_type}</span><span className="text-xs text-slate-500">{listing.area_acres} ac</span></div>
            <div className="flex items-start justify-between gap-2 mt-3"><h3 className="font-black text-lg text-slate-900">{listing.land_name || `Farm plot ${listing.id.slice(0,4)}`}</h3><ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 shrink-0"/></div>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/>{listing.village ? `${listing.village}, ${listing.district}` : listing.location || 'Central India'}</p>
            <div className="rounded-xl bg-emerald-50 p-3 mt-4"><p className="text-xs text-emerald-700">Lease rate</p><p className="text-xl font-black text-emerald-900 mt-1">₹{listing.rate_per_acre.toLocaleString('en-IN')}<span className="text-xs font-medium text-emerald-700"> / acre</span></p></div>
            <div className="flex gap-4 mt-4 text-xs text-slate-500"><span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5"/>{listing.min_duration_months}-{listing.max_duration_months} months</span><span className="inline-flex items-center gap-1"><Building2 className="w-3.5 h-3.5"/>Verified-style listing</span></div>
            <p className="text-sm text-slate-500 mt-4 line-clamp-2">{listing.description}</p>
            <button className="btn btn-primary w-full mt-5" disabled={listing.__demo} onClick={() => setSelected(expanded ? null : listing)}><Send className="w-4 h-4"/>{listing.__demo ? 'Preview listing' : expanded ? 'Close request' : 'Request lease'}</button>
            {expanded && <RequestForm listing={listing} onClose={() => setSelected(null)} onSaved={() => { setSelected(null); loadData(); }}/>} 
          </div>
        </article>
      })}
    </div>
  </div>;
}
