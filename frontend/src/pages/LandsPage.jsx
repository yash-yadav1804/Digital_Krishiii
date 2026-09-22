import { useState, useEffect } from "react";
import { landService } from "../services/landService";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import Modal from "../components/ui/Modal";
import PageHeader from "../components/ui/PageHeader";
import LandCard from "../components/ui/LandCard";
import EmptyState from "../components/EmptyState";
import ErrorMessage from "../components/ErrorMessage";
import { TreePine, Plus } from "lucide-react";
import { DEMO_LANDS, fillPreviewData } from "../data/demoData";
import DemoBanner from "../components/ui/DemoBanner";
import ImageUpload from "../components/ui/ImageUpload";
import { uploadService } from "../services/uploadService";
import toast from "react-hot-toast";

function LandFormModal({ land, onClose, onSaved }) {
  const isEdit = !!land;
  const [form, setForm] = useState(
    land || {
      land_name: "",
      village: "",
      district: "",
      state: "",
      area_acres: "",
      soil_type: "",
      irrigation_type: "",
    },
  );
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

      if (isEdit) {
        await landService.update(land.id, payload);
        toast.success("Land updated successfully");
      } else {
        await landService.create(payload);
        toast.success("Land added successfully");
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to save land");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={isEdit ? "Edit Land" : "Add New Land"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label label-required">Land Name</label>
          <input
            className="input"
            value={form.land_name}
            onChange={(e) => setForm({ ...form, land_name: e.target.value })}
            placeholder="e.g., North Field"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Village</label>
            <input
              className="input"
              value={form.village || ""}
              onChange={(e) => setForm({ ...form, village: e.target.value })}
              placeholder="Village name"
            />
          </div>

          <div>
            <label className="label">District</label>
            <input
              className="input"
              value={form.district || ""}
              onChange={(e) => setForm({ ...form, district: e.target.value })}
              placeholder="District name"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">State</label>
            <input
              className="input"
              value={form.state || ""}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              placeholder="State"
            />
          </div>

          <div>
            <label className="label label-required">Area (acres)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              className="input"
              value={form.area_acres || ""}
              onChange={(e) => setForm({ ...form, area_acres: e.target.value })}
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
          label="Land photo"
          hint="Add a clear field, irrigation or property photo"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Soil Type</label>
            <input
              className="input"
              value={form.soil_type || ""}
              onChange={(e) => setForm({ ...form, soil_type: e.target.value })}
              placeholder="e.g., Loamy, Clay"
            />
          </div>

          <div>
            <label className="label">Irrigation Type</label>
            <input
              className="input"
              value={form.irrigation_type || ""}
              onChange={(e) =>
                setForm({ ...form, irrigation_type: e.target.value })
              }
              placeholder="e.g., Drip, Flood"
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
            {loading ? "Saving..." : isEdit ? "Update Land" : "Add Land"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function LandsPage() {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLand, setEditingLand] = useState(null);
  const [demoMode, setDemoMode] = useState(false);

  const fetchLands = async () => {
    try {
      setLoading(true);
      const { data } = await landService.getAll();
      const preview = fillPreviewData(data, DEMO_LANDS, 6);
      setLands(preview.rows);
      setDemoMode(preview.hasDemo);
      setError("");
    } catch (err) {
      setLands(DEMO_LANDS.map(row => ({ ...row, __demo: true })));
      setDemoMode(true);
      setError("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLands();
  }, []);

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Delete this land? All related crops and contracts will also be deleted.",
      )
    ) {
      return;
    }

    try {
      await landService.delete(id);
      setLands(lands.filter((l) => l.id !== id));
      toast.success("Land deleted successfully");
    } catch {
      toast.error("Failed to delete land");
    }
  };

  const handleOpenModal = (land = null) => {
    setEditingLand(land);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingLand(null);
  };

  if (loading) {
    return (
      <div className="page-container">
        <LoadingState
          title="Loading your lands"
          message="Fetching your agricultural properties..."
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      {demoMode && <DemoBanner message="Sample farms are included alongside live records when your workspace has fewer than six properties. Sample rows are read-only." />}

      <PageHeader
        eyebrow="Land Management"
        title="My Lands"
        subtitle="Manage and track all your agricultural properties. Add lands, track soil conditions, and monitor irrigation types."
        action={
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4" />
            Add Land
          </button>
        }
        stats={
          lands.length > 0
            ? [
                { label: "Total Lands", value: lands.length },
                {
                  label: "Total Area",
                  value: `${lands
                    .reduce(
                      (sum, l) => sum + (parseFloat(l.area_acres) || 0),
                      0,
                    )
                    .toFixed(1)} acres`,
                },
              ]
            : []
        }
      />

      {error && (
        <ErrorState
          title="Unable to load lands"
          message={error}
          onRetry={fetchLands}
        />
      )}

      {!error && lands.length === 0 ? (
        <EmptyState
          icon={TreePine}
          title="No lands registered yet"
          description="Add your first agricultural land to start managing your farm and creating contracts with buyers."
          action={
            <button
              className="btn btn-primary mt-4"
              onClick={() => handleOpenModal()}
            >
              <Plus className="w-4 h-4" />
              Add Your First Land
            </button>
          }
        />
      ) : (
        <div>
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Showing {lands.length} land{lands.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lands.map((land) => (
              <div key={land.id} className="relative group">
                <LandCard land={land} />

                {!land.__demo && <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleOpenModal(land);
                    }}
                    className="btn btn-sm bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm"
                    title="Edit land"
                  >
                    Edit
                  </button>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(land.id);
                    }}
                    className="btn btn-sm bg-white hover:bg-red-50 text-red-600 border border-red-200 shadow-sm"
                    title="Delete land"
                  >
                    Delete
                  </button>
                </div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {modalOpen && (
        <LandFormModal
          land={editingLand}
          onClose={handleCloseModal}
          onSaved={fetchLands}
        />
      )}
    </div>
  );
}
