import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../src/services/apiClient";

const statusOptions = ["pending", "accepted", "processing", "picked_up", "delivered", "cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = async () => {
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
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const statusBadge = useMemo(
    () => ({
      pending: "bg-gray-100 text-gray-700",
      accepted: "bg-blue-100 text-blue-700",
      processing: "bg-orange-100 text-orange-700",
      picked_up: "bg-amber-100 text-amber-700",
      delivered: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
    }),
    []
  );

  const updateOrderStatus = async (orderId, status) => {
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

  return (
    <section className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Orders</h2>
        <select
          className="border border-gray-300 rounded-xl px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      {error ? <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-red-700">{error}</div> : null}

      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center text-gray-500">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center text-gray-500">No orders found.</div>
        ) : (
          orders.map((order) => (
            <article key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-semibold text-gray-900">{order.id}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{order.user?.name || "Unknown"} - {order.user?.email || "No email"}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full ${statusBadge[order.status] || statusBadge.pending}`}>
                  {order.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700 mt-3">
                <p><span className="font-medium">Address:</span> {order.address}</p>
                <p><span className="font-medium">Total:</span> N{Number(order.total || 0).toLocaleString()}</p>
                <p className="sm:col-span-2"><span className="font-medium">Instruction:</span> {order.instruction || "-"}</p>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => updateOrderStatus(order.id, status)}
                    className="px-3 py-2 rounded-xl text-xs bg-gray-100 hover:bg-orange-100 text-gray-700 hover:text-orange-700 transition"
                  >
                    {status}
                  </button>
                ))}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
