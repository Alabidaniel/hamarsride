import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bell,
  LayoutDashboard,
  LogOut,
  Settings,
  Store,
  Users,
  CreditCard,
  ListChecks,
  UtensilsCrossed,
  Image as ImageIcon,
  ChartLine,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "../src/services/apiClient";
import { useAdminAuth } from "../src/context/AdminAuthContext";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/restaurants", label: "Restaurants", icon: Store },
  { to: "/menu", label: "Menu", icon: UtensilsCrossed },
  { to: "/banners", label: "Banners", icon: ImageIcon },
  { to: "/analytics", label: "Analytics", icon: ChartLine },
  { to: "/orders", label: "Orders", icon: ListChecks },
  { to: "/users", label: "Users", icon: Users },
  { to: "/payments", label: "Payments", icon: CreditCard },
  { to: "/settings", label: "Settings", icon: Settings },
];

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

const getNotificationTarget = (item) => {
  const haystack = `${item.type || ""} ${item.title || ""} ${item.message || ""}`.toLowerCase();
  if (haystack.includes("payment") || haystack.includes("receipt")) return "/payments";
  if (haystack.includes("order")) return "/orders";
  if (haystack.includes("user") || haystack.includes("account")) return "/users";
  if (haystack.includes("restaurant") || haystack.includes("shop")) return "/restaurants";
  return "";
};

export default function AdminNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, logout } = useAdminAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [openNotice, setOpenNotice] = useState(false);

  const isLinkActive = useCallback(
    (to) => (to === "/" ? location.pathname === "/" : location.pathname.startsWith(to)),
    [location.pathname]
  );

  const loadNotifications = useCallback(async () => {
    try {
      const payload = await apiFetch("/notifications");
      setNotifications(payload.notifications || []);
      setUnreadCount(payload.unreadCount || 0);
    } catch (_error) {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    const bootTimer = setTimeout(() => {
      loadNotifications();
    }, 0);
    const timer = setInterval(loadNotifications, 30000);
    return () => {
      clearTimeout(bootTimer);
      clearInterval(timer);
    };
  }, [loadNotifications]);

  useEffect(() => {
    document.body.classList.add("admin-mobile-tabbar-enabled");
    return () => {
      document.body.classList.remove("admin-mobile-tabbar-enabled");
    };
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

  const openNotification = async (item) => {
    if (!item.isRead) {
      await markOneRead(item.id);
    } else {
      loadNotifications();
    }

    const target = getNotificationTarget(item);
    if (target) {
      setOpenNotice(false);
      navigate(target);
    }
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
                  <p className="text-sm text-gray-500 text-center py-5">
                    No notifications yet. Admin alerts will show up here.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {notifications.slice(0, 12).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => openNotification(item)}
                        className={`w-full text-left p-2.5 rounded-xl border transition ${
                          item.isRead
                            ? "bg-gray-50 border-gray-200"
                            : "bg-orange-50 border-orange-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-gray-900">{item.title}</p>
                          {!item.isRead ? (
                            <span className="text-[10px] rounded-full bg-orange-100 text-orange-700 px-2 py-0.5">
                              New
                            </span>
                          ) : null}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{item.message}</p>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-gray-500">
                            {formatRelativeTime(item.createdAt)}
                          </span>
                          <span className="text-[11px] font-medium text-orange-600">
                            View
                          </span>
                        </div>
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
      <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[430px] px-3 pb-[calc(0.55rem+env(safe-area-inset-bottom))] md:hidden">
        <div className="flex items-center gap-1 overflow-x-auto rounded-2xl border border-gray-200 bg-white/96 p-1.5 shadow-[0_-6px_30px_rgba(17,24,39,0.18)] backdrop-blur">
          {links.map((link) => {
            const active = isLinkActive(link.to);
            const Icon = link.icon;
            return (
              <Link
                key={`mobile-${link.to}`}
                to={link.to}
                className={`relative inline-flex min-w-[64px] flex-col items-center justify-center rounded-xl px-2 py-2 text-[10px] transition ${
                  active
                    ? "bg-orange-500 text-white"
                    : "text-gray-700 hover:bg-orange-100 hover:text-orange-700"
                }`}
              >
                <Icon size={14} />
                <span className="mt-1 whitespace-nowrap">{link.label}</span>
                {link.to === "/orders" && unreadCount > 0 ? (
                  <span className="absolute right-1 top-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-orange-600 px-1 text-[9px] font-semibold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
