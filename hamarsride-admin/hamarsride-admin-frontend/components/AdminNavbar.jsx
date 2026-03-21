import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  LayoutDashboard,
  LogOut,
  Settings,
  Store,
  Users,
  CreditCard,
  ListChecks,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { apiFetch } from "../src/services/apiClient";
import { useAdminAuth } from "../src/context/AdminAuthContext";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/orders", label: "Orders", icon: ListChecks },
  { to: "/users", label: "Users", icon: Users },
  { to: "/restaurants", label: "Restaurants", icon: Store },
  { to: "/payments", label: "Payments", icon: CreditCard },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function AdminNavbar() {
  const location = useLocation();
  const { profile, logout } = useAdminAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [openNotice, setOpenNotice] = useState(false);

  const loadNotifications = async () => {
    try {
      const payload = await apiFetch("/notifications");
      setNotifications(payload.notifications || []);
      setUnreadCount(payload.unreadCount || 0);
    } catch (_error) {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    loadNotifications();
    const timer = setInterval(loadNotifications, 30000);
    return () => clearInterval(timer);
  }, []);

  const initials = useMemo(() => {
    if (!profile?.name) return "A";
    return profile.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [profile]);

  const markAllRead = async () => {
    await apiFetch("/notifications/mark-all-read", { method: "POST" });
    loadNotifications();
  };

  const markOneRead = async (id) => {
    await apiFetch(`/notifications/${id}/read`, { method: "PATCH" });
    loadNotifications();
  };

  return (
    <header className="bg-white rounded-2xl px-4 sm:px-6 py-4 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs font-semibold tracking-wide uppercase text-orange-600">HamarsRide</p>
          <h1 className="text-lg font-bold text-gray-900">Admin Console</h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenNotice((value) => !value)}
              className="relative p-2.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-700 transition"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 ? (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-orange-600 text-white text-[10px] grid place-items-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              ) : null}
            </button>

            {openNotice ? (
              <div className="absolute right-0 top-12 w-[320px] max-h-[360px] overflow-y-auto bg-white border border-gray-200 rounded-2xl shadow-xl p-3 z-20">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-900">Notifications</p>
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Mark all read
                  </button>
                </div>

                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-5">No notifications yet.</p>
                ) : (
                  <div className="space-y-2">
                    {notifications.slice(0, 12).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => markOneRead(item.id)}
                        className={`w-full text-left p-2.5 rounded-xl border transition ${
                          item.isRead
                            ? "bg-gray-50 border-gray-200"
                            : "bg-orange-50 border-orange-200"
                        }`}
                      >
                        <p className="text-xs font-semibold text-gray-900">{item.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{item.message}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>

          <div className="w-9 h-9 rounded-full bg-orange-500 text-white grid place-items-center text-xs font-semibold">
            {initials}
          </div>

          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gray-900 text-white text-sm hover:bg-black transition"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </div>

      <nav className="mt-4 flex flex-wrap gap-2">
        {links.map((link) => {
          const active = location.pathname === link.to;
          const Icon = link.icon;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm transition ${
                active
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-700"
              }`}
            >
              <Icon size={14} />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
