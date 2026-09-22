import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { contractService } from "../services/contractService";
import { negotiationService } from "../services/negotiationService";
import { useAuth } from "../context/AuthContext";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import PageHeader from "../components/ui/PageHeader";
import ErrorMessage from "../components/ErrorMessage";
import { StatusBadge } from "../components/StatusBadge";
import {
  ArrowLeft,
  MessageSquarePlus,
  Calendar,
  Package,
  DollarSign,
  FileText,
  Send,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import { DEMO_CONTRACTS } from "../data/demoData";
import DemoBanner from "../components/ui/DemoBanner";
import ImageUpload from "../components/ui/ImageUpload";
import { uploadService } from "../services/uploadService";

export default function ContractDetailPage() {
  const { contractId } = useParams();
  const { user } = useAuth();
  const [contract, setContract] = useState(null);
  const [negotiations, setNegotiations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    message: "",
    proposed_quantity: "",
    proposed_price_per_unit: "",
    proposed_start_date: "",
    proposed_end_date: "",
    proposed_terms: "",
    image_url: "",
  });
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [demoMode, setDemoMode] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);

      const contractRes = await contractService.getOne(contractId);
      const contractData = contractRes.data;
      let negotiationData = [];

      const isParticipant =
        user?.id &&
        (contractData.farmer_id === user.id || contractData.buyer_id === user.id);

      if (isParticipant) {
        const negotiationRes = await negotiationService.getAll(contractId);
        negotiationData = negotiationRes.data;
      }

      setContract(contractData);
      setNegotiations(negotiationData);
      setError("");
    } catch (err) {
      const sample = DEMO_CONTRACTS.find((item) => item.id === contractId) || DEMO_CONTRACTS[0];
      setContract(sample);
      setNegotiations([]);
      setDemoMode(true);
      setError("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [contractId, user?.id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      let payload = Object.fromEntries(
        Object.entries(form).filter(([key, value]) => key !== "image_url" && value !== ""),
      );

      if (imageFile) {
        const upload = await uploadService.image(imageFile);
        payload.image_url = upload.data.url;
      }

      await negotiationService.create(contractId, payload);

      setForm({
        message: "",
        proposed_quantity: "",
        proposed_price_per_unit: "",
        proposed_start_date: "",
        proposed_end_date: "",
        proposed_terms: "",
        image_url: "",
      });
      setImageFile(null);

      toast.success("Proposal sent successfully");
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Unable to send proposal");
    } finally {
      setSaving(false);
    }
  };

  const handleDecision = async (negotiationId, status) => {
    try {
      await negotiationService.decide(negotiationId, status);

      toast.success(`Proposal ${status.toLowerCase()}`);

      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Unable to update proposal");
    }
  };

  const handleComplete = async () => {
    if (demoMode || user?.id !== contract?.farmer_id) return
    if (!window.confirm("Mark this contract as completed? This enables both participants to leave a review.")) return

    try {
      await contractService.update(contract.id, { status: "COMPLETED" })
      toast.success("Contract marked as completed")
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.detail || "Unable to complete contract")
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <LoadingState
          title="Loading contract details"
          message="Fetching contract and negotiation information..."
        />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="page-container">
        <ErrorState
          title="Contract not found"
          message={error || "The requested contract could not be found"}
          onRetry={loadData}
        />
      </div>
    );
  }

  const totalValue =
    (parseFloat(contract.quantity) || 0) *
    (parseFloat(contract.price_per_unit) || 0);

  const isParticipant =
    user?.id &&
    (contract.farmer_id === user.id || contract.buyer_id === user.id);
  const canNegotiate =
    isParticipant &&
    Boolean(contract.buyer_id) &&
    ["ACCEPTED", "NEGOTIATING"].includes(contract.status);

  return (
    <div className="page-container">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 mb-6 font-medium"
      >
        <ArrowLeft className="w-4 h-4 flex-shrink-0" />
        Back to Dashboard
      </Link>

      {demoMode && <DemoBanner message="This contract is sample data used for UI review. Live contract details will appear automatically when the API returns a record." />}

      <PageHeader
        eyebrow="Contract Details"
        title={contract.title}
        subtitle={
          contract.description || "View contract terms and manage negotiations"
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            {user?.id === contract.farmer_id && ["ACCEPTED", "NEGOTIATING", "ACTIVE"].includes(contract.status) && !demoMode && (
              <button className="btn btn-primary btn-sm" onClick={handleComplete}>
                <CheckCircle className="w-4 h-4" /> Mark completed
              </button>
            )}
            <StatusBadge status={contract.status} />
          </div>
        }
      />

      {error && <ErrorMessage message={error} />}

      {/* Contract Details Card */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Contract Terms
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5 text-blue-600" />
            </div>

            <div className="min-w-0">
              <div className="text-xs text-gray-500 mb-1">Quantity</div>
              <div className="text-lg font-semibold text-gray-900 break-words">
                {contract.quantity} q
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>

            <div className="min-w-0">
              <div className="text-xs text-gray-500 mb-1">Price per unit</div>
              <div className="text-lg font-semibold text-gray-900 break-words">
                ₹{contract.price_per_unit}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>

            <div className="min-w-0">
              <div className="text-xs text-gray-500 mb-1">Contract Period</div>
              <div className="text-sm font-medium text-gray-900 break-words">
                {contract.start_date}
              </div>
              <div className="text-xs text-gray-500 break-words">
                to {contract.end_date}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-primary-600" />
            </div>

            <div className="min-w-0">
              <div className="text-xs text-gray-500 mb-1">Total Value</div>
              <div className="text-lg font-semibold text-primary-600 break-words">
                ₹{totalValue.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Negotiation History */}
      <div className="card mb-6">
        <div className="flex items-start gap-3 mb-4">
          <FileText className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />

          <h2 className="text-lg font-semibold text-gray-900 min-w-0 break-words">
            Negotiation History
          </h2>
        </div>

        {negotiations.length === 0 ? (
          <div className="py-8 text-center">
            <MessageSquarePlus className="w-12 h-12 mx-auto text-gray-300 mb-3" />

            <p className="text-gray-500">No proposals yet</p>

            <p className="text-sm text-gray-400 mt-1 break-words">
              Start the conversation by sending a counterproposal below
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {negotiations.map((item) => {
              const isOwnMessage = item.sender_id === user.id;

              const hasProposal =
                item.proposed_quantity ||
                item.proposed_price_per_unit ||
                item.proposed_start_date ||
                item.proposed_terms;

              return (
                <div
                  key={item.id}
                  className={`rounded-xl border p-4 min-w-0 ${
                    isOwnMessage
                      ? "bg-primary-50 border-primary-200"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 min-w-0">
                      <span className="font-semibold text-sm text-gray-900">
                        {isOwnMessage ? "You" : "Other Participant"}
                      </span>

                      <StatusBadge status={item.status} />
                    </div>

                    {item.status === "PENDING" && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                        <Clock className="w-3 h-3" />
                        <span>Pending</span>
                      </div>
                    )}

                    {item.status === "ACCEPTED" && (
                      <div className="flex items-center gap-1 text-xs text-green-600 flex-shrink-0">
                        <CheckCircle className="w-3 h-3" />
                        <span>Accepted</span>
                      </div>
                    )}

                    {item.status === "REJECTED" && (
                      <div className="flex items-center gap-1 text-xs text-red-600 flex-shrink-0">
                        <XCircle className="w-3 h-3" />
                        <span>Rejected</span>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-gray-700 mb-3 break-words whitespace-normal">
                    {item.message}
                  </p>

                  {hasProposal && (
                    <div className="p-3 bg-white rounded-lg border border-gray-200 min-w-0">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                        Proposed Changes
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        {item.proposed_quantity && (
                          <div className="min-w-0">
                            <span className="text-gray-500">Quantity:</span>{" "}
                            <span className="font-semibold text-gray-900 break-words">
                              {item.proposed_quantity} q
                            </span>
                          </div>
                        )}

                        {item.proposed_price_per_unit && (
                          <div className="min-w-0">
                            <span className="text-gray-500">Price:</span>{" "}
                            <span className="font-semibold text-gray-900 break-words">
                              ₹{item.proposed_price_per_unit}/unit
                            </span>
                          </div>
                        )}

                        {item.proposed_start_date && (
                          <div className="min-w-0">
                            <span className="text-gray-500">Start:</span>{" "}
                            <span className="font-semibold text-gray-900 break-words">
                              {item.proposed_start_date}
                            </span>
                          </div>
                        )}

                        {item.proposed_end_date && (
                          <div className="min-w-0">
                            <span className="text-gray-500">End:</span>{" "}
                            <span className="font-semibold text-gray-900 break-words">
                              {item.proposed_end_date}
                            </span>
                          </div>
                        )}

                        {item.image_url && (
                          <div className="col-span-1 sm:col-span-2 min-w-0">
                            <img
                              src={item.image_url}
                              alt="Negotiation attachment"
                              className="w-full max-h-56 object-cover rounded-xl border border-gray-200"
                            />
                          </div>
                        )}

                        {item.proposed_terms && (
                          <div className="col-span-1 sm:col-span-2 min-w-0">
                            <span className="text-gray-500">Terms:</span>{" "}
                            <span className="font-semibold text-gray-900 break-words whitespace-normal">
                              {item.proposed_terms}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {item.status === "PENDING" && !isOwnMessage && (
                    <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => handleDecision(item.id, "ACCEPTED")}
                        className="btn btn-primary btn-sm flex-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Accept Proposal
                      </button>

                      <button
                        onClick={() => handleDecision(item.id, "REJECTED")}
                        className="btn btn-danger btn-sm flex-1"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Send Counterproposal Form */}
      <div className="card">
        <div className="flex items-start gap-3 mb-4">
          <MessageSquarePlus className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />

          <h2 className="text-lg font-semibold text-gray-900 min-w-0 break-words">
            Send a Counterproposal
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {demoMode && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">This is a preview contract. Negotiations are disabled for sample records.</div>}
          {!demoMode && !canNegotiate && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Negotiation opens after a buyer bid is accepted and the contract is assigned to that buyer.
            </div>
          )}
          <fieldset disabled={demoMode || !canNegotiate} className="space-y-4 disabled:opacity-60">
          <div>
            <label className="label label-required">Message</label>

            <textarea
              className="input w-full max-w-full"
              rows={3}
              value={form.message}
              onChange={(e) =>
                setForm({
                  ...form,
                  message: e.target.value,
                })
              }
              placeholder="Describe your proposal or respond to previous messages..."
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="min-w-0">
              <label className="label">Proposed Quantity (optional)</label>

              <input
                className="input w-full max-w-full"
                type="number"
                step="0.01"
                min="0.01"
                value={form.proposed_quantity}
                onChange={(e) =>
                  setForm({
                    ...form,
                    proposed_quantity: e.target.value,
                  })
                }
                placeholder="e.g., 100"
              />
            </div>

            <div className="min-w-0">
              <label className="label">Proposed Price/unit (optional)</label>

              <input
                className="input w-full max-w-full"
                type="number"
                step="0.01"
                min="0.01"
                value={form.proposed_price_per_unit}
                onChange={(e) =>
                  setForm({
                    ...form,
                    proposed_price_per_unit: e.target.value,
                  })
                }
                placeholder="e.g., 2500"
              />
            </div>

            <div className="min-w-0">
              <label className="label">Proposed Start Date (optional)</label>

              <input
                className="input w-full max-w-full"
                type="date"
                value={form.proposed_start_date}
                onChange={(e) =>
                  setForm({
                    ...form,
                    proposed_start_date: e.target.value,
                  })
                }
              />
            </div>

            <div className="min-w-0">
              <label className="label">Proposed End Date (optional)</label>

              <input
                className="input w-full max-w-full"
                type="date"
                value={form.proposed_end_date}
                onChange={(e) =>
                  setForm({
                    ...form,
                    proposed_end_date: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <ImageUpload
            value={form.image_url}
            onChange={(file) => {
              setImageFile(file);
              if (!file) setForm({ ...form, image_url: "" });
            }}
            label="Supporting image (optional)"
            hint="Attach a crop, quality or delivery photo to your proposal"
          />

          <div>
            <label className="label">Proposed Terms (optional)</label>

            <textarea
              className="input w-full max-w-full"
              rows={2}
              value={form.proposed_terms}
              onChange={(e) =>
                setForm({
                  ...form,
                  proposed_terms: e.target.value,
                })
              }
              placeholder="Any additional terms or conditions..."
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full sm:w-auto"
            disabled={saving || demoMode || !canNegotiate}
          >
            <Send className="w-4 h-4" />
            {saving ? "Sending..." : demoMode ? "Preview only" : canNegotiate ? "Send Proposal" : "Negotiation unavailable"}
          </button>
          </fieldset>
        </form>
      </div>
    </div>
  );
}
