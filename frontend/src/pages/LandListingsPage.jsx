import { useEffect, useState } from "react";
import { landService } from "../services/landService";
import { landListingService } from "../services/landListingService";
import { leaseRequestService } from "../services/leaseRequestService";
import EmptyState from "../components/EmptyState";
import ErrorMessage from "../components/ErrorMessage";
import Spinner from "../components/Spinner";
import { StatusBadge } from "../components/StatusBadge";
import { Building2, Eye, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { DEMO_LISTINGS, DEMO_LANDS, fillPreviewData } from "../data/demoData";
import DemoBanner from "../components/ui/DemoBanner";
import ImageUpload from "../components/ui/ImageUpload";
import { uploadService } from "../services/uploadService";

function ListingForm({ lands, listing, onClose, onSaved }) {
  const editing = Boolean(listing)
  const [form, setForm] = useState({
    land_id: listing?.land_id || lands[0]?.id || "",
    listing_type: listing?.listing_type || "LEASE",
    rate_per_acre: listing?.rate_per_acre || "",
    min_duration_months: listing?.min_duration_months || 6,
    max_duration_months: listing?.max_duration_months || 12,
    description: listing?.description || "",
    status: listing?.status || "OPEN",
    image_url: listing?.image_url || "",
  })
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState(null)

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError("")

    try {
      const payload = { ...form }
      delete payload.land_id

      if (imageFile) {
        const upload = await uploadService.image(imageFile)
        payload.image_url = upload.data.url
      }

      if (editing) {
        await landListingService.update(listing.id, payload)
        toast.success("Land listing updated")
      } else {
        await landListingService.create({ ...form, image_url: payload.image_url })
        toast.success("Land listing created")
      }

      onSaved()
    } catch (err) {
      setError(err.response?.data?.detail || `Unable to ${editing ? "update" : "create"} listing`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="card mb-6 space-y-4">
      <div className="flex justify-between items-center gap-3">
        <h2 className="font-semibold min-w-0 break-words">{editing ? "Edit land listing" : "Create land listing"}</h2>
        <button type="button" onClick={onClose} className="text-gray-400 text-xl flex-shrink-0" aria-label="Close listing form">×</button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="label">Land</label>
          <select className="input w-full max-w-full" value={form.land_id} onChange={(e) => setForm({ ...form, land_id: e.target.value })} required disabled={editing}>
            {lands.filter(land => !land.__demo).map(land => <option key={land.id} value={land.id}>{land.land_name}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Listing type</label>
          <select className="input w-full max-w-full" value={form.listing_type} onChange={(e) => setForm({ ...form, listing_type: e.target.value })}>
            <option value="LEASE">Lease</option>
            <option value="RENTAL">Rental</option>
          </select>
        </div>

        <div>
          <label className="label">Rate per acre (₹)</label>
          <input className="input w-full max-w-full" type="number" min="1" step="0.01" value={form.rate_per_acre} onChange={(e) => setForm({ ...form, rate_per_acre: e.target.value })} required />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="label">Min. months</label>
            <input className="input w-full max-w-full" type="number" min="1" value={form.min_duration_months} onChange={(e) => setForm({ ...form, min_duration_months: e.target.value })} required />
          </div>
          <div>
            <label className="label">Max. months</label>
            <input className="input w-full max-w-full" type="number" min="1" value={form.max_duration_months} onChange={(e) => setForm({ ...form, max_duration_months: e.target.value })} required />
          </div>
        </div>

        {editing && (
          <div>
            <label className="label">Status</label>
            <select className="input w-full max-w-full" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="OPEN">Open</option>
              <option value="LEASED">Leased</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        )}
      </div>

      <ImageUpload
        value={form.image_url}
        onChange={(file) => {
          setImageFile(file)
          if (!file) setForm({ ...form, image_url: "" })
        }}
        label="Listing photo"
        hint="Show the actual field, access road, irrigation or farm infrastructure"
      />

      <div>
        <label className="label">Description</label>
        <textarea className="input w-full max-w-full" rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>

      <ErrorMessage message={error} />

      <div className="flex flex-col sm:flex-row gap-3">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button disabled={saving} className="btn-primary flex-1">{saving ? "Saving…" : editing ? "Save changes" : "Create listing"}</button>
      </div>
    </form>
  )
}
function ListingRequests({ listing, onClose }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () =>
    leaseRequestService
      .getForListing(listing.id)
      .then((res) => setRequests(res.data))
      .catch(() => toast.error("Unable to load requests"))
      .finally(() => setLoading(false));

  useEffect(load, [listing.id]);

  const decide = async (id, status) => {
    try {
      await leaseRequestService.update(id, status);
      toast.success(`Request ${status.toLowerCase()}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Unable to update request");
    }
  };

  return (
    <div className="card border-primary-200 mb-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold min-w-0 break-words">Lease requests</h3>

        <button
          onClick={onClose}
          className="text-gray-400 flex-shrink-0"
          aria-label="Close lease requests"
        >
          ×
        </button>
      </div>

      {loading ? (
        <Spinner size="sm" />
      ) : requests.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">No requests received yet.</p>
      ) : (
        <div className="space-y-3 mt-3">
          {requests.map((request) => (
            <div key={request.id} className="border rounded-lg p-3 min-w-0">
              <div className="flex items-start justify-between gap-2 min-w-0">
                <span className="text-xs font-mono text-gray-500 min-w-0 break-all">
                  Buyer {request.buyer_id.slice(0, 8)}…
                </span>

                <div className="flex-shrink-0">
                  <StatusBadge status={request.status} />
                </div>
              </div>

              <p className="text-sm mt-1 break-words">
                {request.start_date} to {request.end_date} · ₹
                {request.offered_rate_per_acre}/acre
              </p>

              {request.message && (
                <p className="text-sm text-gray-500 mt-1 break-words">
                  {request.message}
                </p>
              )}

              {request.status === "PENDING" && (
                <div className="flex flex-col sm:flex-row gap-2 mt-3">
                  <button
                    className="btn-primary text-xs py-1 flex-1"
                    onClick={() => decide(request.id, "ACCEPTED")}
                  >
                    Accept
                  </button>

                  <button
                    className="btn-danger text-xs py-1 flex-1"
                    onClick={() => decide(request.id, "REJECTED")}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LandListingsPage() {
  const [listings, setListings] = useState([]);
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [requestListing, setRequestListing] = useState(null);
  const [demoMode, setDemoMode] = useState(false);

  const load = async () => {
    try {
      const [listingRes, landRes] = await Promise.all([
        landListingService.getMine(),
        landService.getAll(),
      ]);

      const listingPreview = fillPreviewData(listingRes.data, DEMO_LISTINGS, 6)
      const landPreview = fillPreviewData(landRes.data, DEMO_LANDS, 6)
      setListings(listingPreview.rows)
      setDemoMode(listingPreview.hasDemo || landPreview.hasDemo)
      setLands(landPreview.rows)
    } catch {
      setListings(DEMO_LISTINGS.map(row => ({ ...row, __demo: true })))
      setLands(DEMO_LANDS.map(row => ({ ...row, __demo: true })))
      setDemoMode(true);
      setError("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!window.confirm("Delete this listing?")) return;

    try {
      await landListingService.delete(id);
      toast.success("Listing deleted");
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Unable to delete listing");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {demoMode && <DemoBanner message="Sample lease listings are included when your live catalogue is small. Sample listings are read-only." />}

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold break-words">Land listings</h1>

          <p className="text-gray-500 text-sm break-words">
            Offer your farmland for lease or rental.
          </p>
        </div>

        <button
          className="btn-primary w-full sm:w-auto flex-shrink-0"
          disabled={!lands.some((land) => !land.__demo)}
          onClick={() => { setEditingListing(null); setShowForm(true) }}
        >
          <Plus className="w-4 h-4" />
          Add listing
        </button>
      </div>

      {!lands.some((land) => !land.__demo) && (
        <p className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800 mb-4 break-words">
          Create a land record before publishing a listing.
        </p>
      )}

      {showForm && (
        <ListingForm
          lands={lands}
          listing={editingListing}
          onClose={() => {
            setShowForm(false)
            setEditingListing(null)
          }}
          onSaved={() => {
            setShowForm(false)
            setEditingListing(null)
            load()
          }}
        />
      )}

      <ErrorMessage message={error} />

      {requestListing && (
        <ListingRequests
          listing={requestListing}
          onClose={() => setRequestListing(null)}
        />
      )}

      {listings.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No land listings"
          description="Publish a listing to receive lease requests."
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((listing) => (
            <div className="card min-w-0 overflow-hidden" key={listing.id}>
              {listing.image_url && <img src={listing.image_url} alt={listing.land_name || "Farmland"} className="w-full h-36 object-cover rounded-xl mb-4" />}
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-semibold min-w-0 break-words">
                  {listing.listing_type} listing
                </h2>

                <div className="flex-shrink-0">
                  <StatusBadge status={listing.status} />
                </div>
              </div>

              <p className="text-xl font-bold mt-3 break-words">
                ₹{listing.rate_per_acre}
                <span className="text-sm font-normal text-gray-500 whitespace-nowrap">
                  {" "}
                  / acre
                </span>
              </p>

              <p className="text-sm text-gray-500 mt-1 break-words">
                {listing.min_duration_months}–{listing.max_duration_months}{" "}
                months
              </p>

              {listing.description && (
                <p className="text-sm text-gray-600 mt-3 break-words">
                  {listing.description}
                </p>
              )}

              <div className="flex items-center gap-2 mt-4">
                <button
                  className="btn-secondary text-sm flex-1 min-w-0"
                  onClick={() => setRequestListing(listing)}
                >
                  <Eye className="w-4 h-4 flex-shrink-0" />
                  Requests
                </button>

                {!listing.__demo && <button
                  className="btn-secondary text-sm px-3"
                  onClick={() => {
                    setEditingListing(listing)
                    setShowForm(true)
                  }}
                >
                  Edit
                </button>}

                {!listing.__demo && <button
                  aria-label="Delete listing"
                  onClick={() => remove(listing.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
