import { useEffect, useState } from "react";
import { equipmentService } from "../services/equipmentService";
import { equipmentRequestService } from "../services/equipmentRequestService";
import { useAuth } from "../context/AuthContext";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/EmptyState";
import ErrorMessage from "../components/ErrorMessage";
import Modal from "../components/ui/Modal";
import PageHeader from "../components/ui/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import {
  Wrench,
  Plus,
  Send,
  Trash2,
  MapPin,
  Calendar,
  DollarSign,
  Package,
} from "lucide-react";
import toast from "react-hot-toast";
import { DEMO_EQUIPMENT, fillPreviewData } from "../data/demoData";
import DemoBanner from "../components/ui/DemoBanner";
import ImageUpload from "../components/ui/ImageUpload";
import { uploadService } from "../services/uploadService";

function AddEquipmentModal({ equipment, onClose, onSaved }) {
  const editing = Boolean(equipment)
  const [form, setForm] = useState({
    name: equipment?.name || "",
    category: equipment?.category || "Tractor",
    description: equipment?.description || "",
    condition: equipment?.condition || "Good",
    location: equipment?.location || "",
    rental_price_per_day: equipment?.rental_price_per_day || "",
    is_available: equipment?.is_available ?? true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [imageFile, setImageFile] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const payload = { ...form }
      if (imageFile) {
        const upload = await uploadService.image(imageFile)
        payload.image_url = upload.data.url
      }

      if (editing) {
        await equipmentService.update(equipment.id, payload)
        toast.success("Equipment updated successfully")
      } else {
        await equipmentService.create(payload)
        toast.success("Equipment added successfully")
      }

      onSaved()
    } catch (err) {
      setError(err.response?.data?.detail || `Failed to ${editing ? "update" : "add"} equipment`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={editing ? "Edit Equipment" : "Add Equipment to Inventory"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label label-required">Equipment Name</label>
          <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>

        <div>
          <label className="label label-required">Category</label>
          <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option value="Tractor">Tractor</option>
            <option value="Harvester">Harvester</option>
            <option value="Plow / Cultivator">Plow / Cultivator</option>
            <option value="Irrigation Pump">Irrigation Pump</option>
            <option value="Seeder">Seeder</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="label label-required">Rental Price (₹ / day)</label>
          <input className="input" type="number" required min="1" step="0.01" value={form.rental_price_per_day} onChange={(e) => setForm({ ...form, rental_price_per_day: e.target.value })} />
        </div>

        <div>
          <label className="label">Condition</label>
          <select className="input" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
          </select>
        </div>

        <div>
          <label className="label">Location</label>
          <input className="input" placeholder="e.g., Pune, Maharashtra" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        </div>

        <ImageUpload
          value={form.image_url}
          onChange={(file) => {
            setImageFile(file)
            if (!file) setForm({ ...form, image_url: "" })
          }}
          label="Equipment photo"
          hint="Upload a clear photo of the actual machine"
        />

        <div>
          <label className="label">Availability</label>
          <select className="input" value={String(form.is_available)} onChange={(e) => setForm({ ...form, is_available: e.target.value === "true" })}>
            <option value="true">Available for rental</option>
            <option value="false">Unavailable</option>
          </select>
        </div>

        <div>
          <label className="label">Description</label>
          <textarea className="input w-full max-w-full" rows="3" placeholder="Add details about maintenance history, features, etc." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>

        {error && <ErrorMessage message={error} />}

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
          <button type="button" className="btn btn-secondary flex-1" onClick={onClose} disabled={loading}>Cancel</button>
          <button type="submit" className="btn btn-primary flex-1" disabled={loading}>{loading ? "Saving..." : editing ? "Save Changes" : "Add Equipment"}</button>
        </div>
      </form>
    </Modal>
  )
}
function RentRequestModal({ equipment, onClose, onSaved }) {
  const [form, setForm] = useState({
    start_date: "",
    end_date: "",
    agreed_rate_per_day: equipment.rental_price_per_day,
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await equipmentRequestService.create({
        equipment_id: equipment.id,
        ...form,
      });

      toast.success("Rental request submitted");
      onSaved();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={`Request ${equipment.name}`}
      size="md"
    >
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 break-words">
          Standard rate:{" "}
          <span className="font-semibold text-gray-900">
            ₹{equipment.rental_price_per_day}/day
          </span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label label-required">Start Date</label>
            <input
              className="input"
              type="date"
              required
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
            />
          </div>

          <div>
            <label className="label label-required">End Date</label>
            <input
              className="input"
              type="date"
              required
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="label label-required">
            Agreed Rate per Day (₹)
          </label>
          <input
            className="input"
            type="number"
            required
            min="1"
            step="0.01"
            value={form.agreed_rate_per_day}
            onChange={(e) =>
              setForm({ ...form, agreed_rate_per_day: e.target.value })
            }
          />
        </div>

        <div>
          <label className="label">Message to Provider</label>
          <textarea
            className="input w-full max-w-full"
            rows="3"
            placeholder="Tell the provider your location or project requirements"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
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
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function EquipmentPage() {
  const { hasRole } = useAuth();
  const isProvider = hasRole("equipment_provider");
  const isFarmer = hasRole("farmer");

  const [availableEquipment, setAvailableEquipment] = useState([]);
  const [myEquipment, setMyEquipment] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [requestTarget, setRequestTarget] = useState(null);
  const [demoMode, setDemoMode] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      if (isProvider) {
        const res = await equipmentService.getMine();
        const preview = fillPreviewData(res.data, DEMO_EQUIPMENT, 6); setMyEquipment(preview.rows); setDemoMode(preview.hasDemo);
      } else {
        const [availRes, reqRes] = await Promise.all([
          equipmentService.getAvailable(),
          isFarmer
            ? equipmentRequestService.getMine()
            : Promise.resolve({ data: [] }),
        ]);

        const preview = fillPreviewData(availRes.data, DEMO_EQUIPMENT, 6); setAvailableEquipment(preview.rows); setDemoMode(preview.hasDemo);
        setMyRequests(reqRes.data);
      }
    } catch (err) {
      setMyEquipment(DEMO_EQUIPMENT.map(row => ({ ...row, __demo: true })));
      setAvailableEquipment(DEMO_EQUIPMENT.map(row => ({ ...row, __demo: true })));
      setDemoMode(true);
      setError("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteEquipment = async (id) => {
    if (!window.confirm("Remove this equipment from your inventory?")) return;

    try {
      await equipmentService.delete(id);
      toast.success("Equipment removed");
      loadData();
    } catch (err) {
      toast.error("Failed to delete equipment");
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <LoadingState
          title="Loading equipment"
          message="Fetching equipment information..."
        />
      </div>
    );
  }

  // Provider View
  if (isProvider) {
    const availableCount = myEquipment.filter((e) => e.is_available).length;
    const rentedCount = myEquipment.length - availableCount;

    return (
      <div className="page-container">
        {demoMode && <DemoBanner message="Sample machinery is included when inventory is sparse so the marketplace remains easy to review." />}

        <PageHeader
          eyebrow="Equipment Provider"
          title="My Equipment Inventory"
          subtitle="Manage equipment available for farmers to rent. Track availability and rental status."
          action={
            <button
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="w-4 h-4" />
              Add Equipment
            </button>
          }
          stats={
            myEquipment.length > 0
              ? [
                  { label: "Total Equipment", value: myEquipment.length },
                  { label: "Available", value: availableCount },
                  { label: "Rented", value: rentedCount },
                ]
              : []
          }
        />

        {error && (
          <ErrorState
            title="Unable to load equipment"
            message={error}
            onRetry={loadData}
          />
        )}

        {!error && myEquipment.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="No equipment listed"
            description="Start earning by renting out your tractors, harvesters, and agricultural machinery to local farmers."
            action={
              <button
                className="btn btn-primary mt-4"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="w-4 h-4" />
                Add Your First Equipment
              </button>
            }
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myEquipment.map((eq) => (
              <div key={eq.id} className="card overflow-hidden p-0">
                {eq.image_url && <img src={eq.image_url} alt={eq.name} className="w-full h-36 object-cover" />}
                <div className="p-5">
                <div className="flex justify-between items-start mb-3 gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {eq.name}
                    </h3>
                    <p className="text-xs text-primary-600 font-medium mt-1">
                      {eq.category}
                    </p>
                  </div>

                  <span
                    className={`badge flex-shrink-0 ${
                      eq.is_available
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {eq.is_available ? "Available" : "Rented"}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2 break-words">
                  {eq.description || "No description provided"}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2 text-sm text-gray-600 min-w-0">
                    <Package className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="min-w-0 break-words">
                      Condition: {eq.condition || "Good"}
                    </span>
                  </div>

                  {eq.location && (
                    <div className="flex items-start gap-2 text-sm text-gray-600 min-w-0">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="min-w-0 break-words">{eq.location}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-between items-center gap-3">
                  <div className="min-w-0">
                    <div className="text-xs text-gray-500">Rental Price</div>
                    <div className="text-lg font-bold text-gray-900">
                      ₹{eq.rental_price_per_day}
                      <span className="text-xs font-normal text-gray-500">
                        /day
                      </span>
                    </div>
                  </div>

                  {!eq.__demo && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingEquipment(eq)}
                        className="btn btn-secondary btn-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteEquipment(eq.id)}
                    className="p-2 flex-shrink-0 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove equipment"
                  >
                    <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {(showAddModal || editingEquipment) && (
          <AddEquipmentModal
            equipment={editingEquipment}
            onClose={() => {
              setShowAddModal(false)
              setEditingEquipment(null)
            }}
            onSaved={() => {
              setShowAddModal(false)
              setEditingEquipment(null)
              loadData()
            }}
          />
        )}
      </div>
    );
  }

  // Farmer/Buyer View
  return (
    <div className="page-container">
      <PageHeader
        eyebrow="Equipment Rental"
        title="Equipment Marketplace"
        subtitle="Find tractors, harvesters, and tools for your agricultural needs. Request rentals directly from equipment providers."
        stats={
          availableEquipment.length > 0
            ? [
                {
                  label: "Available Equipment",
                  value: availableEquipment.length,
                },
                ...(isFarmer && myRequests.length > 0
                  ? [
                      { label: "My Requests", value: myRequests.length },
                      {
                        label: "Pending",
                        value: myRequests.filter((r) => r.status === "PENDING")
                          .length,
                      },
                    ]
                  : []),
              ]
            : []
        }
      />

      {error && (
        <ErrorState
          title="Unable to load equipment"
          message={error}
          onRetry={loadData}
        />
      )}

      {/* Available Equipment */}
      <div className="mb-8">
        <h2 className="section-title">Available Machinery & Tools</h2>

        {availableEquipment.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="No equipment available"
            description="Check back soon for available tractors, harvesters, and agricultural machinery."
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableEquipment.map((eq) => (
              <div key={eq.id} className="card hover:shadow-md transition-all overflow-hidden p-0">
                {eq.image_url && <img src={eq.image_url} alt={eq.name} className="w-full h-36 object-cover" />}
                <div className="p-5">
                <div className="flex justify-between items-start mb-3 gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {eq.name}
                    </h3>

                    <span className="inline-block mt-1 badge bg-blue-100 text-blue-700">
                      {eq.category}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2 break-words">
                  {eq.description || "No description provided."}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2 text-sm text-gray-600 min-w-0">
                    <Package className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="min-w-0 break-words">
                      Condition: {eq.condition || "Good"}
                    </span>
                  </div>

                  {eq.location && (
                    <div className="flex items-start gap-2 text-sm text-gray-600 min-w-0">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="min-w-0 break-words">{eq.location}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-between items-center gap-3">
                  <div className="min-w-0">
                    <div className="text-xs text-gray-500">Rental Price</div>
                    <div className="text-xl font-bold text-primary-600">
                      ₹{eq.rental_price_per_day}
                      <span className="text-xs font-normal text-gray-500">
                        /day
                      </span>
                    </div>
                  </div>

                  {isFarmer && (
                    eq.__demo ? <span className="badge badge-neutral">Preview</span> :
                    <button className="btn btn-primary btn-sm flex-shrink-0" onClick={() => setRequestTarget(eq)}>
                      <Send className="w-3.5 h-3.5" /> Rent
                    </button>
                  )}
                </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Rental Requests */}
      {isFarmer && myRequests.length > 0 && (
        <div>
          <h2 className="section-title">My Rental Requests</h2>

          <div className="space-y-3">
            {myRequests.map((req) => (
              <div key={req.id} className="card">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 min-w-0">
                      <span className="text-xs font-mono text-gray-400 flex-shrink-0">
                        #{req.id.slice(0, 8)}
                      </span>
                      <StatusBadge status={req.status} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-sm">
                      <div className="flex items-start gap-2 min-w-0">
                        <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600 min-w-0 break-words">
                          {req.start_date} to {req.end_date}
                        </span>
                      </div>

                      <div className="flex items-start gap-2 min-w-0">
                        <DollarSign className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600 min-w-0 break-words">
                          ₹{req.agreed_rate_per_day}/day
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {requestTarget && (
        <RentRequestModal
          equipment={requestTarget}
          onClose={() => setRequestTarget(null)}
          onSaved={() => {
            setRequestTarget(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}
