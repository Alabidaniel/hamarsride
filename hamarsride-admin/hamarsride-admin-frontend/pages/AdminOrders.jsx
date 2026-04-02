import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../src/services/apiClient";
import ReceiptModal from "../components/ReceiptModal";

const statusOptions = ["pending", "accepted", "processing", "picked_up", "delivered", "rejected", "cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generatingReceiptId, setGeneratingReceiptId] = useState("");
  const [viewingReceiptId, setViewingReceiptId] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [rejectingOrder, setRejectingOrder] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const path = statusFilter ? `/admin/orders?status=${statusFilter}` : "/admin/orders";
      const payload = await apiFetch(path);
      setOrders(payload.orders || []);
    } catch (err) {
      setError(err.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const statusBadge = useMemo(
    () => ({
      pending: "bg-gray-100 text-gray-700",
      accepted: "bg-blue-100 text-blue-700",
      processing: "bg-orange-100 text-orange-700",
      picked_up: "bg-amber-100 text-amber-700",
      delivered: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
      cancelled: "bg-red-100 text-red-700",
    }),
    []
  );

  const updateOrderStatus = async (orderId, status) => {
    if (status === "rejected") {
      setRejectingOrder(orders.find((item) => item.id === orderId) || { id: orderId });
      setRejectionReason("");
      return;
    }

    const ok = window.confirm(`Change order ${orderId} to ${status.replace("_", " ")}?`);
    if (!ok) return;

    try {
      await apiFetch(`/admin/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      loadOrders();
    } catch (err) {
      setError(err.message || "Failed to update order.");
    }
  };

  const submitRejection = async () => {
    if (!rejectingOrder?.id) return;

    const reason = rejectionReason.trim();
    if (!reason) {
      setError("Please provide a rejection reason.");
      return;
    }

    try {
      await apiFetch(`/admin/orders/${rejectingOrder.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "rejected", rejectionReason: reason }),
      });
      setRejectingOrder(null);
      setRejectionReason("");
      loadOrders();
    } catch (err) {
      setError(err.message || "Failed to reject order.");
    }
  };

  const generateReceipt = async (orderId) => {
    const ok = window.confirm(`Generate receipt for order ${orderId}?`);
    if (!ok) return;

    try {
      setGeneratingReceiptId(orderId);
      const payload = await apiFetch("/receipts", {
        method: "POST",
        body: JSON.stringify({ orderId }),
      });
      setSelectedReceipt(payload.receipt || null);
      loadOrders();
    } catch (err) {
      setError(err.message || "Failed to generate receipt.");
    } finally {
      setGeneratingReceiptId("");
    }
  };

  const viewReceipt = async (order) => {
    if (order.receipt) {
      setSelectedReceipt(order.receipt);
      return;
    }

    try {
      setViewingReceiptId(order.id);
      const payload = await apiFetch(`/receipts/order/${order.id}`);
      setSelectedReceipt(payload.receipt || null);
    } catch (err) {
      setError(err.message || "Failed to load receipt.");
    } finally {
      setViewingReceiptId("");
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Orders</h2>
        <select
          className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-red-700">{error}</div> : null}

      <div className="space-y-3">
        {loading ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center text-gray-500 shadow-sm">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center text-gray-500 shadow-sm">
            No orders found.
          </div>
        ) : (
          orders.map((order) => {
            const displayStatus = order.rejectionReason ? "rejected" : order.status || "pending";

            return (
            <article key={order.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">{order.id}</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {order.user?.name || "Unknown"} - {order.user?.email || "No email"}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs ${statusBadge[displayStatus] || statusBadge.pending}`}>
                  {displayStatus}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-700 sm:grid-cols-2">
                <p>
                  <span className="font-medium">Address:</span> {order.address}
                </p>
                <p>
                  <span className="font-medium">Total:</span> N{Number(order.total || 0).toLocaleString()}
                </p>
                <p className="sm:col-span-2">
                  <span className="font-medium">Instruction:</span> {order.instruction || "-"}
                </p>
                {order.rejectionReason ? (
                  <p className="sm:col-span-2 text-red-600">
                    <span className="font-medium">Reason:</span> {order.rejectionReason}
                  </p>
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => updateOrderStatus(order.id, status)}
                    className={`rounded-xl px-3 py-2 text-xs transition ${
                      status === "rejected"
                        ? "bg-red-100 text-red-700 hover:bg-red-200"
                        : "bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-700"
                    }`}
                  >
                    {status}
                  </button>
                ))}

                {displayStatus === "delivered" ? (
                  order.receipt ? (
                    <button
                      type="button"
                      onClick={() => viewReceipt(order)}
                      disabled={viewingReceiptId === order.id}
                      className="rounded-xl bg-blue-100 px-3 py-2 text-xs text-blue-700 transition hover:bg-blue-200 hover:text-blue-800 disabled:opacity-60"
                    >
                      {viewingReceiptId === order.id ? "Opening..." : "View Receipt"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => generateReceipt(order.id)}
                      disabled={generatingReceiptId === order.id}
                      className="rounded-xl bg-green-100 px-3 py-2 text-xs text-green-700 transition hover:bg-green-200 hover:text-green-800 disabled:opacity-60"
                    >
                      {generatingReceiptId === order.id ? "Generating..." : "Generate Receipt"}
                    </button>
                  )
                ) : null}
              </div>
            </article>
            );
          })
        )}
      </div>

      {selectedReceipt ? <ReceiptModal receipt={selectedReceipt} onClose={() => setSelectedReceipt(null)} /> : null}

      {rejectingOrder ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Reject order</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Tell the customer why order {rejectingOrder.id} was rejected.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRejectingOrder(null);
                  setRejectionReason("");
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>

            <label className="mt-4 block">
              <span className="text-sm font-medium text-gray-700">Reason</span>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
                placeholder="For example: customer address could not be confirmed."
              />
            </label>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setRejectingOrder(null);
                  setRejectionReason("");
                }}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitRejection}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
              >
                Reject order
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
