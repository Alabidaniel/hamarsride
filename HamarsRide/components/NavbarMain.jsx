import React, { useEffect, useMemo, useState } from "react";
import { Bell, Search, ShoppingCart, House, Store } from "lucide-react";
import Logo from "../src/assets/logo.png";
import { useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "../src/services/apiClient";
import { resolvePhotoUrl } from "../src/utils/photoUrl";

export default function NavbarMain() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(() => {
    const localProfile = localStorage.getItem("userProfile");
    if (!localProfile) {
      return null;
    }
    try {
      return JSON.parse(localProfile);
    } catch (_err) {
      return null;
    }
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  const navItems = useMemo(
    () => [
      {
        key: "home",
        label: "Home",
        path: "/dashboard",
        icon: House,
        active:
          location.pathname === "/dashboard" ||
          location.pathname === "/",
      },
      {
        key: "restaurants",
        label: "Order Food",
        path: "/restaurants",
        icon: Store,
        active:
          location.pathname.startsWith("/restaurants") ||
          location.pathname.startsWith("/shops"),
      },
      {
        key: "cart",
        label: "Cart",
        path: "/cart",
        icon: ShoppingCart,
        active:
          location.pathname.startsWith("/cart") ||
          location.pathname.startsWith("/Checkout") ||
          location.pathname.startsWith("/checkout") ||
          location.pathname.startsWith("/payment"),
      },
    ],
    [location.pathname]
  );

  const mobileTabs = useMemo(
    () => [
      {
        key: "home",
        label: "Home",
        icon: House,
        path: "/dashboard",
        active: location.pathname === "/dashboard" || location.pathname === "/",
        badge: null,
      },
      {
        key: "order",
        label: "Order",
        icon: Store,
        path: "/restaurants",
        active:
          location.pathname.startsWith("/restaurants") ||
          location.pathname.startsWith("/shops"),
        badge: null,
      },
      {
        key: "cart",
        label: "Cart",
        icon: ShoppingCart,
        path: "/cart",
        active:
          location.pathname.startsWith("/cart") ||
          location.pathname.startsWith("/Checkout") ||
          location.pathname.startsWith("/checkout") ||
          location.pathname.startsWith("/payment"),
        badge: cartCount > 0 ? (cartCount > 99 ? "99+" : String(cartCount)) : null,
      },
      {
        key: "alerts",
        label: "Alerts",
        icon: Bell,
        path: "/notifications",
        active: location.pathname.startsWith("/notifications"),
        badge: unreadCount > 0 ? (unreadCount > 99 ? "99+" : String(unreadCount)) : null,
      },
    ],
    [cartCount, location.pathname, unreadCount]
  );

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const payload = await apiFetch("/me");
        setProfile(payload.user);
        localStorage.setItem("userProfile", JSON.stringify(payload.user));
      } catch (_err) {
        // ignore: show cached profile if available
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    document.body.classList.add("hr-mobile-tabbar-enabled");
    return () => {
      document.body.classList.remove("hr-mobile-tabbar-enabled");
    };
  }, []);

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const [notificationsPayload, cartPayload] = await Promise.all([
          apiFetch("/notifications"),
          apiFetch("/cart"),
        ]);

        setUnreadCount(notificationsPayload.unreadCount || 0);
        const nextCartCount = (cartPayload.items || []).reduce(
          (acc, item) => acc + (item.quantity || 0),
          0
        );
        setCartCount(nextCartCount);
      } catch (_err) {
        setUnreadCount(0);
        setCartCount(0);
      }
    };

    loadCounts();

    const timer = setInterval(loadCounts, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
    <div className="sticky top-0 z-30 border-b border-orange-200 bg-white px-3 py-2 shadow-sm sm:px-6 sm:py-4 md:static md:z-auto">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 rounded-[1.4rem] border border-orange-200 bg-white px-3 py-2 shadow-sm sm:gap-3 sm:rounded-[1.75rem] sm:px-6 sm:py-3">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 font-bold text-lg"
          aria-label="Go to dashboard"
        >
          <img
            src={Logo}
            alt="Hamars Ride Logo"
            className="h-10 w-10 object-contain sm:h-16 sm:w-16 md:h-18 md:w-18"
          />
        </button>

        <div className="hidden w-full max-w-xs items-center rounded-full border border-orange-200 bg-orange-50 px-3 py-2 text-gray-700 sm:flex md:max-w-md lg:max-w-lg">
          <Search size={18} className="text-orange-600" />
          <input
            placeholder="Search restaurants, shops, or meals..."
            className="ml-2 w-full bg-transparent text-sm outline-none placeholder:text-orange-300"
            onFocus={() => navigate("/restaurants")}
          />
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => navigate(item.path)}
              className={`relative hidden items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition md:inline-flex ${
                item.active
                  ? "border-orange-300 bg-orange-50 text-orange-700"
                  : "border-orange-200 bg-white text-gray-700 hover:bg-orange-50"
              }`}
              aria-label={item.label}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
              {item.key === "cart" && cartCount > 0 ? (
                <span className="grid h-5 min-w-[20px] place-items-center rounded-full bg-orange-600 px-1 text-[10px] font-semibold text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              ) : null}
            </button>
          ))}

          <button
            onClick={() => navigate("/notifications")}
            className="relative rounded-full p-2 text-gray-700 transition hover:bg-orange-50 hover:text-orange-700"
            aria-label="Open notifications"
          >
            <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
            {unreadCount > 0 ? (
              <span className="absolute -right-2 -top-2 min-w-[18px] h-[18px] rounded-full bg-orange-600 text-white text-[10px] px-1 grid place-items-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            ) : null}
          </button>

          <p className="hidden text-sm text-gray-700 xl:block">
            {profile?.name ? `Welcome, ${profile.name.trim().split(/\s+/)[0]}!` : "Welcome!"}
          </p>

          <div
            onClick={() => navigate("/profile")}
            className="flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-orange-600 text-sm text-white sm:h-9 sm:w-9"
          >
            {profile?.photoUrl ? (
              <img
                src={resolvePhotoUrl(profile.photoUrl)}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : profile?.name ? (
              profile.name[0].toUpperCase()
            ) : (
              "A"
            )}
          </div>
        </div>
      </div>
    </div>
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[430px] px-3 pb-[calc(0.55rem+env(safe-area-inset-bottom))] md:hidden">
      <div className="grid grid-cols-4 gap-1 rounded-2xl border border-orange-200 bg-white/96 p-1.5 shadow-[0_-6px_30px_rgba(17,24,39,0.14)] backdrop-blur">
        {mobileTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => navigate(tab.path)}
            className={`relative flex flex-col items-center justify-center rounded-xl px-2 py-2 text-[11px] font-medium transition ${
              tab.active
                ? "bg-orange-600 text-white"
                : "text-gray-700 hover:bg-orange-50"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span className="mt-1">{tab.label}</span>
            {tab.badge ? (
              <span className="absolute right-1.5 top-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-orange-600 px-1 text-[9px] font-semibold text-white">
                {tab.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </nav>
    </>
  );
}
