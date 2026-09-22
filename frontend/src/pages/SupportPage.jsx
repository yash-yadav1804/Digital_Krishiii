import { useEffect, useState } from "react";
import { supportService } from "../services/supportService";
import { useAuth } from "../context/AuthContext";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import PageHeader from "../components/ui/PageHeader";
import Modal from "../components/ui/Modal";
import ErrorMessage from "../components/ErrorMessage";
import { StatusBadge } from "../components/StatusBadge";
import { HelpCircle, Plus, MessageSquare, Send } from "lucide-react";
import toast from "react-hot-toast";
import { DEMO_TICKETS, fillPreviewData } from "../data/demoData";
import DemoBanner from "../components/ui/DemoBanner";

const PRIORITY_COLORS = {
  LOW: "bg-gray-100 text-gray-600",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-amber-100 text-amber-700",
  URGENT: "bg-red-100 text-red-700",
};

export default function SupportPage() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin");

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [adminResponseText, setAdminResponseText] = useState("");
  const [adminStatus, setAdminStatus] = useState("RESOLVED");
  const [adminSaving, setAdminSaving] = useState(false);
  const [createSaving, setCreateSaving] = useState(false);
  const [createError, setCreateError] = useState("");
  const [demoMode, setDemoMode] = useState(false);

  const [form, setForm] = useState({
    subject: "",
    description: "",
    category: "GENERAL",
    priority: "MEDIUM",
  });

  const loadTickets = async () => {
    setLoading(true);
    setError("");

    try {
      const res = isAdmin
        ? await supportService.getAll()
        : await supportService.getMine();

      const preview = fillPreviewData(res.data, DEMO_TICKETS, 6)
      setTickets(preview.rows)
      setDemoMode(preview.hasDemo)
    } catch {
      setTickets(DEMO_TICKETS.map(row => ({ ...row, __demo: true })));
      setDemoMode(true);
      setError("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [isAdmin]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setCreateSaving(true);
    setCreateError("");

    try {
      await supportService.create(form);
      toast.success("Support request submitted");
      setShowCreateModal(false);
      setForm({
        subject: "",
        description: "",
        category: "GENERAL",
        priority: "MEDIUM",
      });
      loadTickets();
    } catch (err) {
      setCreateError(err.response?.data?.detail || "Failed to submit ticket");
    } finally {
      setCreateSaving(false);
    }
  };

  const handleAdminUpdate = async (e) => {
    e.preventDefault();
    setAdminSaving(true);

    try {
      await supportService.adminUpdate(selectedTicket.id, {
        status: adminStatus,
        admin_response: adminResponseText,
      });

      toast.success("Ticket updated");
      setSelectedTicket(null);
      loadTickets();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update ticket");
    } finally {
      setAdminSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <LoadingState
          title="Loading tickets"
          message="Fetching support tickets..."
        />
      </div>
    );
  }



  const openCount = tickets.filter((t) => t.status === "OPEN").length;
  const inProgressCount = tickets.filter(
    (t) => t.status === "IN_PROGRESS",
  ).length;

  return (
    <div className="page-container">
      {demoMode && <DemoBanner message="Sample support tickets are included when your live ticket history is small. Sample rows are read-only." />}

      <PageHeader
        eyebrow={isAdmin ? "Admin" : "Help"}
        title={isAdmin ? "Support Ticket Management" : "Help & Support"}
        subtitle={
          isAdmin
            ? "View and resolve platform inquiries and dispute issues."
            : "Have a question or problem? Submit a ticket and our team will get back to you."
        }
        action={
          !isAdmin ? (
            <button
              className="btn btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="w-4 h-4" />
              Open Ticket
            </button>
          ) : undefined
        }
        stats={
          tickets.length > 0
            ? [
                { label: "Total Tickets", value: tickets.length },
                { label: "Open", value: openCount },
                { label: "In Progress", value: inProgressCount },
              ]
            : []
        }
      />

      {tickets.length === 0 ? (
        <div className="card">
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <HelpCircle className="w-7 h-7 text-gray-400" />
            </div>

            <h3 className="text-lg font-semibold text-gray-900">
              No support tickets
            </h3>

            <p className="text-sm text-gray-500 mt-2 max-w-xs">
              {isAdmin
                ? "No tickets have been submitted yet."
                : "You have no open support requests. Need help? Open a ticket."}
            </p>

            {!isAdmin && (
              <button
                className="btn btn-primary mt-4"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="w-4 h-4" />
                Open a Ticket
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((t) => (
            <div key={t.id} className="card hover:shadow-md transition-all">
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 break-words">
                      {t.subject}
                    </h3>

                    <span
                      className={`badge text-xs ${
                        PRIORITY_COLORS[t.priority] ||
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {t.priority}
                    </span>

                    <span className="badge bg-gray-100 text-gray-600 text-xs">
                      {t.category}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 break-all">
                    #{t.id.slice(0, 8)} ·{" "}
                    {new Date(t.created_at).toLocaleDateString()}
                    {isAdmin && t.user_email && (
                      <>
                        {" · "}
                        <span className="text-gray-500">{t.user_email}</span>
                      </>
                    )}
                  </p>
                </div>

                <div className="flex-shrink-0">
                  <StatusBadge status={t.status} />
                </div>
              </div>

              <p className="text-sm text-gray-700 leading-relaxed break-words">
                {t.description}
              </p>

              {t.admin_response && (
                <div className="mt-4 p-3 bg-primary-50 rounded-lg border border-primary-100">
                  <p className="text-xs font-bold text-primary-800 mb-1 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Admin Response
                  </p>

                  <p className="text-sm text-primary-900 break-words">
                    {t.admin_response}
                  </p>
                </div>
              )}

              {isAdmin && (
                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setSelectedTicket(t);
                      setAdminResponseText(t.admin_response || "");
                      setAdminStatus(t.status || "RESOLVED");
                    }}
                  >
                    <Send className="w-3.5 h-3.5" />
                    Respond & Update
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Ticket Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setCreateError("");
        }}
        title="Open Support Ticket"
        size="sm"
      >
        <form onSubmit={handleCreateTicket} className="space-y-4">
          <div>
            <label className="label label-required">Subject</label>

            <input
              className="input w-full max-w-full"
              placeholder="Brief description of your issue"
              required
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Category</label>

              <select
                className="input w-full max-w-full"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="GENERAL">General Inquiry</option>
                <option value="CONTRACT">Contract Issue</option>
                <option value="PAYMENT">Payment / Bidding</option>
                <option value="EQUIPMENT">Equipment Rental</option>
                <option value="ACCOUNT">Account / Role</option>
              </select>
            </div>

            <div>
              <label className="label">Priority</label>

              <select
                className="input w-full max-w-full"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label label-required">Description</label>

            <textarea
              className="input w-full max-w-full"
              rows="4"
              placeholder="Explain the problem in detail (minimum 10 characters)"
              required
              minLength="10"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          {createError && <ErrorMessage message={createError} />}

          <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              className="btn btn-secondary flex-1"
              onClick={() => {
                setShowCreateModal(false);
                setCreateError("");
              }}
              disabled={createSaving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={createSaving}
            >
              {createSaving ? "Submitting..." : "Submit Ticket"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Admin Reply Modal */}
      <Modal
        open={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title={
          selectedTicket
            ? `Reply to Ticket #${selectedTicket.id.slice(0, 8)}`
            : ""
        }
        size="sm"
      >
        {selectedTicket && (
          <>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 font-medium mb-0.5">
                Subject
              </p>

              <p className="text-sm text-gray-900 font-semibold break-words">
                {selectedTicket.subject}
              </p>

              <p className="text-sm text-gray-600 mt-2 break-words">
                {selectedTicket.description}
              </p>
            </div>

            <form onSubmit={handleAdminUpdate} className="space-y-4">
              <div>
                <label className="label">Ticket Status</label>

                <select
                  className="input w-full max-w-full"
                  value={adminStatus}
                  onChange={(e) => setAdminStatus(e.target.value)}
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              <div>
                <label className="label label-required">
                  Official Response
                </label>

                <textarea
                  className="input w-full max-w-full"
                  rows="4"
                  required
                  placeholder="Write instructions or resolution for the user"
                  value={adminResponseText}
                  onChange={(e) => setAdminResponseText(e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  className="btn btn-secondary flex-1"
                  onClick={() => setSelectedTicket(null)}
                  disabled={adminSaving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                  disabled={adminSaving}
                >
                  {adminSaving ? "Sending..." : "Send Update"}
                </button>
              </div>
            </form>
          </>
        )}
      </Modal>
    </div>
  );
}
