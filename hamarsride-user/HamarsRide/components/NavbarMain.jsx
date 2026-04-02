import React, { useEffect, useState } from "react";
import { Bell, Search, ShoppingCart, House, Store } from "lucide-react";
import Logo from "../src/assets/logo.png";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../src/services/apiClient";
import { resolvePhotoUrl } from "../src/utils/photoUrl";

export default function NavbarMain() {
  const navigate = useNavigate();
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
    const loadUnreadCount = async () => {
      try {
        const payload = await apiFetch("/notifications");
        setUnreadCount(payload.unreadCount || 0);
      } catch (_err) {
        setUnreadCount(0);
      }
    };

    loadUnreadCount();

    const timer = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="border-b border-[#dccbb7] bg-[#f8f1e7] px-4 py-3 shadow-sm sm:px-6 sm:py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-[1.75rem] border border-[#e2d3c1] bg-[#fffdf9] px-4 py-3 shadow-[0_12px_30px_rgba(73,53,34,0.05)] sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3 font-bold text-lg">
          <img
            src={Logo}
            alt="Hamars Ride Logo"
            className="h-12 w-12 object-contain sm:h-16 sm:w-16 md:h-18 md:w-18"
          />
        </div>

        <div className="hidden w-full max-w-xs items-center rounded-full border border-[#e7dbce] bg-[#faf5ee] px-3 py-2 text-[#5d4939] sm:flex md:max-w-md lg:max-w-lg">
          <Search size={18} className="text-[#8b735d]" />
          <input
            placeholder="Search restaurants, shops, or meals..."
            className="ml-2 w-full bg-transparent text-sm outline-none placeholder:text-[#9b8673]"
            onFocus={() => navigate("/restaurants")}
          />
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-[#6d5847] transition hover:text-[#8b6748]"
            aria-label="Go to dashboard"
          >
            <House className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          <button
            onClick={() => navigate("/restaurants")}
            className="text-[#6d5847] transition hover:text-[#8b6748]"
            aria-label="Browse restaurants and shops"
          >
            <Store className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          <button
            onClick={() => navigate("/cart")}
            className="text-[#6d5847] transition hover:text-[#8b6748]"
            aria-label="Open cart"
          >
            <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          <button
            onClick={() => navigate("/notifications")}
            className="relative text-[#6d5847] transition hover:text-[#8b6748]"
            aria-label="Open notifications"
          >
            <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
            {unreadCount > 0 ? (
              <span className="absolute -right-2 -top-2 min-w-[18px] h-[18px] rounded-full bg-[#b98b61] text-white text-[10px] px-1 grid place-items-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            ) : null}
          </button>

          <p className="hidden text-sm text-[#5d4939] md:block">
            {profile?.name ? `Welcome, ${profile.name.trim().split(/\s+/)[0]}!` : "Welcome!"}
          </p>

          <div
            onClick={() => navigate("/profile")}
            className="flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#8a684d] text-sm text-[#fffaf4] sm:h-9 sm:w-9"
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
  );
}
