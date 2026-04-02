import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  ClipboardList,
  CreditCard,
  Clock3,
  Truck,
  CheckCircle2,
} from "lucide-react";
import NavbarMain from "../components/NavbarMain";
import Footer from "../components/Footer";
import { apiFetch } from "../src/services/apiClient";

const statusLabel = {
  pending: "Pending",
  accepted: "Accepted",
  processing: "Processing",
  picked_up: "Picked Up",
  delivered: "Delivered",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

const statusClass = {
  pending: "bg-gray-100 text-gray-700",
  accepted: "bg-blue-100 text-blue-700",
  processing: "bg-orange-100 text-orange-700",
  picked_up: "bg-amber-100 text-amber-700",
  delivered: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-red-100 text-red-700",
};

const formatRelativeTime = (dateString) => {
  if (!dateString) return "";
  const created = new Date(dateString);
  if (Number.isNaN(created.getTime())) return "";

  const diffMs = Date.now() - created.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? "" : "s"} ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const unreadCount = notifications.filter((item) => !item.read).length;
  const stats = useMemo(
    () => ({
      totalOrders: orders.length,
      awaitingPaymentReview: orders.filter((item) => item.status === "pending").length,
      rejectedOrders: orders.filter((item) => item.status === "rejected").length,
      inProgress: orders.filter((item) => item.status === "processing").length,
      delivered: orders.filter((item) => item.status === "delivered").length,
    }),
    [orders]
  );

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setIsLoading(true);
        setError("");
        const payload = await apiFetch("/admin/orders");
        setOrders(payload.orders || []);
      } catch (err) {
        setError(err.message || "Failed to load admin orders.");
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, []);

  const updateOrderStatus = async (orderId, nextStatus) => {
    try {
      setUpdatingId(orderId);
      let body = { status: nextStatus };

      if (nextStatus === "rejected") {
        const reason = window.prompt("Please enter a rejection reason for the customer:");
        if (!reason || !reason.trim()) {
          setError("A rejection reason is required.");
          setUpdatingId(null);
          return;
        }
        body = { status: nextStatus, rejectionReason: reason.trim() };
      }

      const payload = await apiFetch(`/admin/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });

      const updated = payload.order;
      setOrders((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );

      const notice = {
        id: `${Date.now()}`,
        title: "Order Status Updated",
        message:
          nextStatus === "rejected"
            ? `Order ${orderId} was rejected.`
            : `Order ${orderId} moved to ${statusLabel[nextStatus]}.`,
        read: false,
        createdAt: new Date().toISOString(),
        status: nextStatus,
      };
      setNotifications((prev) => [notice, ...prev]);
    } catch (err) {
      setError(err.message || "Failed to update order status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <NavbarMain />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex-1">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Monitor orders and manage status updates.
            </p>
          </div>
          <div className="text-xs px-3 py-1 rounded-full bg-orange-100 text-orange-700 font-medium">
            {unreadCount} unread notifications
          </div>
        </div>

        {error ? (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={ClipboardList} label="Total Orders" value={stats.totalOrders} />
          <StatCard icon={CreditCard} label="Pending" value={stats.awaitingPaymentReview} />
          <StatCard icon={CheckCircle2} label="Rejected" value={stats.rejectedOrders} />
          <StatCard icon={Clock3} label="Processing" value={stats.inProgress} />
          <StatCard icon={Truck} label="Delivered" value={stats.delivered} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Incoming Orders</h2>

            {isLoading ? (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-gray-500 text-sm">
                Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-gray-500 text-sm">
                No orders yet.
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <article key={order.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <p className="font-semibold text-gray-900">{order.id}</p>
                        <p className="text-xs text-gray-500">
                          {order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}
                        </p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusClass[order.status] || "bg-gray-100 text-gray-700"}`}>
                        {statusLabel[order.status] || order.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-sm text-gray-700">
                      <p>
                        <span className="font-medium">Customer:</span> {order.user?.name || "-"}
                      </p>
                      <p>
                        <span className="font-medium">Email:</span> {order.user?.email || "-"}
                      </p>
                      <p>
                        <span className="font-medium">Total:</span> N{Number(order.total || 0).toLocaleString()}
                      </p>
                      <p>
                        <span className="font-medium">Status:</span> {statusLabel[order.status] || order.status}
                      </p>
                      <p className="sm:col-span-2">
                        <span className="font-medium">Address:</span> {order.address}
                      </p>
                      <p className="sm:col-span-2">
                        <span className="font-medium">Instruction:</span> {order.instruction || "No instruction"}
                      </p>
                      {order.rejectionReason ? (
                        <p className="sm:col-span-2 text-red-600">
                          <span className="font-medium">Reason:</span> {order.rejectionReason}
                        </p>
                      ) : null}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => updateOrderStatus(order.id, "accepted")}
                        className="px-3 py-2 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60"
                        disabled={updatingId === order.id}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, "processing")}
                        className="px-3 py-2 text-xs rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition disabled:opacity-60"
                        disabled={updatingId === order.id}
                      >
                        Processing
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, "picked_up")}
                        className="px-3 py-2 text-xs rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition disabled:opacity-60"
                        disabled={updatingId === order.id}
                      >
                        Picked Up
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, "delivered")}
                        className="px-3 py-2 text-xs rounded-lg bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-60"
                        disabled={updatingId === order.id}
                      >
                        Delivered
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, "rejected")}
                        className="px-3 py-2 text-xs rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-60"
                        disabled={updatingId === order.id}
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, "cancelled")}
                        className="px-3 py-2 text-xs rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-60"
                        disabled={updatingId === order.id}
                      >
                        Cancel
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              <button
                onClick={markAllRead}
                disabled={notifications.length === 0 || unreadCount === 0}
                className="text-xs font-medium text-orange-600 hover:text-orange-700 disabled:opacity-50"
              >
                Mark all read
              </button>
            </div>

            {notifications.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center text-gray-500 text-sm">
                No notifications yet.
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-xl border p-3 ${
                      item.read ? "bg-gray-50 border-gray-200" : "bg-orange-50 border-orange-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <Bell size={14} className="text-orange-500" />
                        {item.title}
                      </p>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          item.read ? "bg-gray-200 text-gray-700" : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {item.read ? "Read" : "New"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{item.message}</p>
                    <p className="text-[11px] text-gray-500 mt-2">
                      {formatRelativeTime(item.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <Icon className="text-orange-500" size={18} />
      <p className="text-xs text-gray-500 mt-2">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}
