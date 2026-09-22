import { useState, useEffect } from "react";
import { cropService } from "../services/cropService";
import { landService } from "../services/landService";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/EmptyState";
import ErrorMessage from "../components/ErrorMessage";
import Modal from "../components/ui/Modal";
import PageHeader from "../components/ui/PageHeader";
import CropCard from "../components/ui/CropCard";
import { Wheat, Plus, Search, Calendar, MapPin, Sprout } from "lucide-react";
import toast from "react-hot-toast";
import { DEMO_CROPS, DEMO_LANDS, fillPreviewData } from "../data/demoData";
import DemoBanner from "../components/ui/DemoBanner";
import ImageUpload from "../components/ui/ImageUpload";
import { uploadService } from "../services/uploadService";

function CropModal({ crop, lands, onClose, onSaved }) {
  const isEdit = !!crop;
  const [form, setForm] = useState(
    crop || {
      land_id: lands[0]?.id || "",
      crop_name: "",
      season: "",
      sowing_date: "",
      expected_harvest_date: "",
      expected_yield: "",
    },
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const payload = { ...form };
    if (!payload.sowing_date) delete payload.sowing_date;
    if (!payload.expected_harvest_date) delete payload.expected_harvest_date;
    if (!payload.expected_yield) delete payload.expected_yield;

    try {
      if (imageFile) {
        const upload = await uploadService.image(imageFile);
        payload.image_url = upload.data.url;
      }

      if (isEdit) {
        await cropService.update(crop.id, payload);
        toast.success("Crop updated successfully");
      } else {
        await cropService.create(payload);
        toast.success("Crop added successfully");
      }

      onSaved();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to save crop");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={isEdit ? "Edit Crop" : "Add New Crop"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label label-required">Land</label>
          <select
            className="input"
            value={form.land_id}
            onChange={(e) => setForm({ ...form, land_id: e.target.value })}
            required
          >
            {lands.map((l) => (
              <option key={l.id} value={l.id}>
                {l.land_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label label-required">Crop Name</label>
          <input
            className="input"
            value={form.crop_name}
            onChange={(e) => setForm({ ...form, crop_name: e.target.value })}
            placeholder="e.g., Wheat, Rice, Cotton"
            required
          />
        </div>

        <div>
          <label className="label">Season</label>
          <select
            className="input"
            value={form.season || ""}
            onChange={(e) => setForm({ ...form, season: e.target.value })}
          >
            <option value="">Select season</option>
            <option value="Kharif">Kharif (Monsoon)</option>
            <option value="Rabi">Rabi (Winter)</option>
            <option value="Zaid">Zaid (Summer)</option>
            <option value="Perennial">Perennial</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Sowing Date</label>
            <input
              type="date"
              className="input"
              value={form.sowing_date || ""}
              onChange={(e) =>
                setForm({ ...form, sowing_date: e.target.value })
              }
            />
          </div>

          <div>
            <label className="label">Expected Harvest</label>
            <input
              type="date"
              className="input"
              value={form.expected_harvest_date || ""}
              onChange={(e) =>
                setForm({ ...form, expected_harvest_date: e.target.value })
              }
            />
          </div>
        </div>

        <ImageUpload
          value={form.image_url}
          onChange={(file) => {
            setImageFile(file)
            if (!file) setForm({ ...form, image_url: '' })
          }}
          label="Crop photo"
          hint="Use a clear photo of the crop or field"
        />

        <div>
          <label className="label">Expected Yield (quintals)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            className="input"
            value={form.expected_yield || ""}
            onChange={(e) =>
              setForm({ ...form, expected_yield: e.target.value })
            }
            placeholder="0.00"
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
            {loading ? "Saving..." : isEdit ? "Update Crop" : "Add Crop"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function CropsPage() {
  const [crops, setCrops] = useState([]);
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const [seasonFilter, setSeasonFilter] = useState("");
  const [demoMode, setDemoMode] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cropsRes, landsRes] = await Promise.all([
        cropService.getAll(),
        landService.getAll(),
      ]);

      const cropPreview = fillPreviewData(cropsRes.data, DEMO_CROPS, 6);
      const landPreview = fillPreviewData(landsRes.data, DEMO_LANDS, 6);
      setCrops(cropPreview.rows);
      setLands(landPreview.rows);
      setDemoMode(cropPreview.hasDemo || landPreview.hasDemo);
      setError("");
    } catch (err) {
      setCrops(DEMO_CROPS.map(row => ({ ...row, __demo: true })));
      setLands(DEMO_LANDS.map(row => ({ ...row, __demo: true })));
      setDemoMode(true);
      setError("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Delete this crop? Associated contracts will also be affected.",
      )
    ) {
      return;
    }

    try {
      await cropService.delete(id);
      setCrops(crops.filter((c) => c.id !== id));
      toast.success("Crop deleted successfully");
    } catch (err) {
      toast.error("Failed to delete crop");
    }
  };

  const filteredCrops = crops.filter((c) => {
    const matchesSearch = c.crop_name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesSeason = !seasonFilter || c.season === seasonFilter;
    return matchesSearch && matchesSeason;
  });

  if (loading) {
    return (
      <div className="page-container">
        <LoadingState
          title="Loading crops"
          message="Fetching your crop information..."
        />
      </div>
    );
  }

  const totalYield = crops.reduce(
    (sum, c) => sum + (parseFloat(c.expected_yield) || 0),
    0,
  );

  return (
    <div className="page-container">
      {demoMode && <DemoBanner message="Sample crop cycles are included when your workspace has fewer than six live records. Sample rows are read-only." />}

      <PageHeader
        eyebrow="Crop Management"
        title="My Crops"
        subtitle="Track all your crops, planting schedules, and expected yields across your lands."
        action={
          <button
            className="btn btn-primary"
            onClick={() => setModal("create")}
            disabled={!lands.length}
            title={!lands.length ? "Add a land first" : ""}
          >
            <Plus className="w-4 h-4" />
            Add Crop
          </button>
        }
        stats={
          crops.length > 0
            ? [
                { label: "Total Crops", value: crops.length },
                {
                  label: "Active Lands",
                  value: new Set(crops.map((c) => c.land_id)).size,
                },
                {
                  label: "Expected Yield",
                  value: `${totalYield.toFixed(1)} q`,
                },
              ]
            : []
        }
      />

      {!lands.length && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-yellow-600" />
            </div>

            <div>
              <p className="font-medium text-yellow-900">No Lands Available</p>
              <p className="text-sm text-yellow-700 mt-1">
                Add at least one land before tracking crops.
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <ErrorState
          title="Unable to load crops"
          message={error}
          onRetry={fetchData}
        />
      )}

      {!error && crops.length === 0 ? (
        <EmptyState
          icon={Wheat}
          title="No crops registered yet"
          description="Start tracking your agricultural production by adding your first crop. Monitor growth, yields, and harvests."
          action={
            lands.length > 0 && (
              <button
                className="btn btn-primary mt-4"
                onClick={() => setModal("create")}
              >
                <Plus className="w-4 h-4" />
                Add Your First Crop
              </button>
            )
          }
        />
      ) : (
        <>
          {/* Search and Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                className="input pl-10"
                placeholder="Search crops..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="input sm:w-48"
              value={seasonFilter}
              onChange={(e) => setSeasonFilter(e.target.value)}
            >
              <option value="">All Seasons</option>
              <option value="Kharif">Kharif</option>
              <option value="Rabi">Rabi</option>
              <option value="Zaid">Zaid</option>
              <option value="Perennial">Perennial</option>
            </select>
          </div>

          {filteredCrops.length === 0 ? (
            <div className="text-center py-12">
              <Sprout className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No crops match your filters</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Showing {filteredCrops.length} crop
                  {filteredCrops.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCrops.map((crop) => (
                  <div key={crop.id} className="relative group">
                    <CropCard crop={crop} />

                    {!crop.__demo && <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button
                        onClick={() => setModal(crop)}
                        className="btn btn-sm bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm"
                        title="Edit crop"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(crop.id)}
                        className="btn btn-sm bg-white hover:bg-red-50 text-red-600 border border-red-200 shadow-sm"
                        title="Delete crop"
                      >
                        Delete
                      </button>
                    </div>}
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {modal && (
        <CropModal
          crop={modal === "create" ? null : modal}
          lands={lands}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
