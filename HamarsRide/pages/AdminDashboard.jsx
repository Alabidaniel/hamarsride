import React, { useMemo, useState } from "react";
import {
  Bell,
  ClipboardList,
  CreditCard,
  Clock3,
  Truck,
} from "lucide-react";
import NavbarMain from "../components/NavbarMain";
import Footer from "../components/Footer";

const ADMIN_ORDERS_KEY = "hamarsrideAdminOrders";
const ADMIN_NOTIFICATIONS_KEY = "hamarsrideAdminNotifications";

const safeRead = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch (_error) {
    return [];
  }
};

const statusLabel = {
  payment_submitted: "Payment Submitted",
  payment_verified: "Payment Verified",
  processing: "Processing",
  delivered: "Delivered",
};

const statusClass = {
  payment_submitted: "bg-amber-100 text-amber-700",
  payment_verified: "bg-blue-100 text-blue-700",
  processing: "bg-orange-100 text-orange-700",
  delivered: "bg-green-100 text-green-700",
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState(() => safeRead(ADMIN_ORDERS_KEY));
  const [notifications, setNotifications] = useState(() => safeRead(ADMIN_NOTIFICATIONS_KEY));

  const unreadCount = notifications.filter((item) => !item.read).length;
  const stats = useMemo(
    () => ({
      totalOrders: orders.length,
      awaitingPaymentReview: orders.filter((item) => item.status === "payment_submitted").length,
      inProgress: orders.filter((item) => item.status === "processing").length,
      delivered: orders.filter((item) => item.status === "delivered").length,
    }),
    [orders]
  );

  const persistOrders = (nextOrders) => {
    setOrders(nextOrders);
    localStorage.setItem(ADMIN_ORDERS_KEY, JSON.stringify(nextOrders));
  };

  const persistNotifications = (nextNotifications) => {
    setNotifications(nextNotifications);
    localStorage.setItem(ADMIN_NOTIFICATIONS_KEY, JSON.stringify(nextNotifications));
  };

  const updateOrderStatus = (orderId, nextStatus) => {
    const nextOrders = orders.map((item) =>
      item.id === orderId ? { ...item, status: nextStatus } : item
    );
    persistOrders(nextOrders);

    const notice = {
      id: `${Date.now()}`,
      title: "Order Status Updated",
      message: `Order ${orderId} moved to ${statusLabel[nextStatus]}.`,
      read: false,
      createdAt: new Date().toISOString(),
      orderId,
    };
    persistNotifications([notice, ...notifications]);
  };

  const markAllRead = () => {
    const next = notifications.map((item) => ({ ...item, read: true }));
    persistNotifications(next);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <NavbarMain />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex-1">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Monitor payments, manage orders, and respond to incoming activity.
            </p>
          </div>
          <div className="text-xs px-3 py-1 rounded-full bg-orange-100 text-orange-700 font-medium">
            {unreadCount} unread notifications
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={ClipboardList} label="Total Orders" value={stats.totalOrders} />
          <StatCard icon={CreditCard} label="Awaiting Review" value={stats.awaitingPaymentReview} />
          <StatCard icon={Clock3} label="Processing" value={stats.inProgress} />
          <StatCard icon={Truck} label="Delivered" value={stats.delivered} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Incoming Orders</h2>

            {orders.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-gray-500 text-sm">
                No payment submissions yet.
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <article key={order.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <p className="font-semibold text-gray-900">{order.id}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusClass[order.status]}`}>
                        {statusLabel[order.status]}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-sm text-gray-700">
                      <p>
                        <span className="font-medium">Customer:</span> {order.customerName}
                      </p>
                      <p>
                        <span className="font-medium">Amount:</span> N{Number(order.amount || 0).toLocaleString()}
                      </p>
                      <p className="sm:col-span-2">
                        <span className="font-medium">Address:</span> {order.address}
                      </p>
                      <p className="sm:col-span-2">
                        <span className="font-medium">Instruction:</span>{" "}
                        {order.instruction || "No instruction"}
                      </p>
                      <p className="sm:col-span-2">
                        <span className="font-medium">Receipt:</span> {order.receiptName}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => updateOrderStatus(order.id, "payment_verified")}
                        className="px-3 py-2 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                      >
                        Verify Payment
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, "processing")}
                        className="px-3 py-2 text-xs rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition"
                      >
                        Mark Processing
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, "delivered")}
                        className="px-3 py-2 text-xs rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
                      >
                        Mark Delivered
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
                className="text-xs font-medium text-orange-600 hover:text-orange-700"
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
                    <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Bell size={14} className="text-orange-500" />
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{item.message}</p>
                    <p className="text-[11px] text-gray-500 mt-2">
                      {new Date(item.createdAt).toLocaleString()}
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
