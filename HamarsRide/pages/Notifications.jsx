import React, { useEffect, useMemo, useState } from "react";
import { Bell, PackageCheck, Truck, CircleAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NavbarMain from "../components/NavbarMain";
import Footer from "../components/Footer";
import { apiFetch } from "../src/services/apiClient";

const statusBadge = (isRead) =>
  isRead
    ? { label: "Read", className: "bg-gray-200 text-gray-700" }
    : { label: "New", className: "bg-orange-100 text-orange-700" };

const pickIcon = (notification) => {
  const title = (notification.title || "").toLowerCase();

  if (title.includes("picked up")) return Truck;
  if (title.includes("delivered")) return PackageCheck;
  if (title.includes("accepted") || title.includes("pending")) return PackageCheck;
  if (title.includes("reject") || title.includes("cancel")) return CircleAlert;
  return Bell;
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

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const mappedNotifications = useMemo(() => {
    return notifications.map((item) => {
      const Icon = pickIcon(item);
      const badge = statusBadge(item.isRead);

      return {
        ...item,
        icon: Icon,
        status: badge.label,
        statusClass: badge.className,
        time: formatRelativeTime(item.createdAt),
        target:
          item.type === "receipt" || item.type === "payment" || item.type === "order"
            ? "/order-history"
            : "",
      };
    });
  }, [notifications]);
  const unreadNotifications = mappedNotifications.filter((item) => !item.isRead);
  const readNotifications = mappedNotifications.length - unreadNotifications.length;

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      setError("");
      const payload = await apiFetch("/notifications");
      setNotifications(payload.notifications || []);
      setUnreadCount(payload.unreadCount || 0);
    } catch (err) {
      setError(err.message || "Failed to load notifications.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();

    const timer = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  const markAllRead = async () => {
    try {
      setIsMarkingAll(true);
      await apiFetch("/notifications/mark-all-read", { method: "POST" });
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      setError(err.message || "Failed to mark all as read.");
    } finally {
      setIsMarkingAll(false);
    }
  };

  const markOneRead = async (notificationId) => {
    try {
      await apiFetch(`/notifications/${notificationId}/read`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notificationId ? { ...item, isRead: true } : item
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      setError(err.message || "Failed to mark as read.");
    }
  };

  const openNotification = async (item) => {
    if (!item.isRead) {
      await markOneRead(item.id);
    }

    if (item.target) {
      navigate(item.target);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <NavbarMain />

      <main className="w-full max-w-[96rem] mx-auto px-4 sm:px-6 py-8 sm:py-10 flex-1">
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-[2rem] border border-gray-100 bg-white p-5 sm:p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gray-500">
                    Inbox
                  </p>
                  <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-gray-900">
                    Notifications
                  </h1>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Stay updated on your orders and deliveries.
                  </p>
                </div>
                <div className="rounded-2xl bg-orange-50 px-4 py-3 text-right">
                  <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
                  <p className="text-xs uppercase tracking-[0.24em] text-gray-500">
                    unread
                  </p>
                </div>
              </div>

              <button
                onClick={markAllRead}
                disabled={isLoading || isMarkingAll || unreadCount === 0}
                className="mt-5 w-full text-sm font-medium px-4 py-3 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isMarkingAll ? "Marking..." : "Mark all as read"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[1.5rem] border border-gray-100 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Unread</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{unreadCount}</p>
              </div>
              <div className="rounded-[1.5rem] border border-gray-100 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Read</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{readNotifications}</p>
              </div>
            </div>

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}
          </aside>

          <section className="rounded-[2rem] border border-gray-100 bg-white p-5 sm:p-7 shadow-sm">
            <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-gray-500">
                  Recent activity
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  {isLoading
                    ? "Refreshing your inbox..."
                    : `${mappedNotifications.length} notifications total`}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                <div className="text-sm text-gray-500">Loading notifications...</div>
              ) : mappedNotifications.length === 0 ? (
                <div className="text-sm text-gray-500">No notifications yet.</div>
              ) : (
                mappedNotifications.map((item) => (
                  <article
                    key={item.id}
                    className={`bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-5 hover:border-orange-200 hover:bg-orange-50/40 transition ${
                      item.isRead ? "opacity-90" : ""
                    }`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                      <div className="w-11 h-11 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                        <item.icon size={20} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="min-w-0">
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                              {item.title}
                            </h2>
                            <p className="text-sm text-gray-600 mt-1 leading-6">
                              {item.message}
                            </p>
                          </div>
                          <span
                            className={`text-xs font-medium px-3 py-1 rounded-full ${item.statusClass}`}
                          >
                            {item.status}
                          </span>
                        </div>

                        <div className="mt-4 flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-xs text-gray-500 flex items-center gap-2">
                            <Bell size={13} />
                            {item.time}
                          </p>
                          <div className="flex items-center gap-3">
                            {item.target ? (
                              <button
                                onClick={() => openNotification(item)}
                                className="text-xs font-medium text-orange-600 hover:text-orange-700"
                              >
                                View
                              </button>
                            ) : null}

                            {!item.isRead ? (
                              <button
                                onClick={() => markOneRead(item.id)}
                                className="text-xs font-medium text-orange-600 hover:text-orange-700"
                              >
                                Mark as read
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
