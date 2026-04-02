import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL, apiFetch } from "../src/services/apiClient";

const statusOptions = ["submitted", "verified", "rejected"];

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const path = statusFilter ? `/admin/payments?status=${statusFilter}` : "/admin/payments";
      const payload = await apiFetch(path);
      setPayments(payload.payments || []);
    } catch (err) {
      setError(err.message || "Failed to load payments.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const updateStatus = async (payment, status) => {
    const ok = window.confirm(`Mark payment ${payment.id} as ${status}?`);
    if (!ok) return;

    try {
      await apiFetch(`/admin/payments/${payment.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      loadPayments();
    } catch (err) {
      setError(err.message || "Failed to update payment.");
    }
  };

  const receiptUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${API_BASE_URL}${path}`;
  };

  return (
    <section className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Payments</h2>
        <select className="border border-gray-300 rounded-xl px-3 py-2 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      {error ? <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-red-700">{error}</div> : null}

      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-gray-500">Loading payments...</div>
        ) : payments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-gray-500">No payments found.</div>
        ) : (
          payments.map((payment) => (
            <article key={payment.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="font-semibold text-gray-900">Payment {payment.id}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Order: {payment.orderId} - User: {payment.user?.email || "-"}</p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700">{payment.status}</span>
              </div>

              <div className="text-sm text-gray-700 mt-3">
                Amount: <span className="font-semibold">N{Number(payment.amount || 0).toLocaleString()}</span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={receiptUrl(payment.receiptUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-xl bg-gray-100 text-xs text-gray-700 hover:bg-gray-200 transition"
                >
                  View Receipt
                </a>
                <button onClick={() => updateStatus(payment, "verified")} type="button" className="px-3 py-2 rounded-xl bg-green-600 text-white text-xs hover:bg-green-700 transition">
                  Verify
                </button>
                <button onClick={() => updateStatus(payment, "rejected")} type="button" className="px-3 py-2 rounded-xl bg-red-600 text-white text-xs hover:bg-red-700 transition">
                  Reject
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}


