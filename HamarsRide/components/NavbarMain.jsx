import React, { useEffect, useState } from 'react'
import { Bell, Search, ShoppingCart, House, Store } from "lucide-react";
import Logo from '../src/assets/logo.png'
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, apiFetch } from "../src/services/apiClient";

export default function NavbarMain() {

  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const resolvePhotoUrl = (value) => {
    if (!value) return "";
    if (value.startsWith("http")) return value;
    return `${API_BASE_URL}${value}`;
  };

  useEffect(() => {
    const localProfile = localStorage.getItem("userProfile");
    if (localProfile) {
      try {
        setProfile(JSON.parse(localProfile));
      } catch (_err) {
        setProfile(null);
      }
    }

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
  }, []);

  return (
    <div className="bg-white rounded-2xl px-4 sm:px-6 py-3 sm:py-4 
                    flex items-center justify-between shadow-sm">

      {/* Logo */}
      <div className="flex items-center gap-2 sm:gap-3 font-bold text-lg">
        <img
          src={Logo}
          alt="Hamars Ride Logo"
          className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain"
        />
      </div>

      {/* Search Bar */}
      <div className="hidden sm:flex items-center bg-gray-100 
                      px-3 sm:px-4 py-2 rounded-full 
                      w-full max-w-xs md:max-w-md lg:max-w-lg 
                      mx-3">

        <Search size={18} className="text-gray-500" />

        <input
          placeholder="Search restaurants or meals..."
          className="bg-transparent outline-none ml-2 
                     w-full text-sm"
          onFocus={() => navigate("/restaurants")}
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-gray-600 hover:text-orange-600 transition"
          aria-label="Go to dashboard"
        >
          <House className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <button
          onClick={() => navigate("/restaurants")}
          className="text-gray-600 hover:text-orange-600 transition"
          aria-label="Browse restaurants"
        >
          <Store className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <button
          onClick={() => navigate("/cart")}
          className="text-gray-600 hover:text-orange-600 transition"
          aria-label="Open cart"
        >
          <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <button
          onClick={() => navigate("/notifications")}
          className="relative text-gray-600 hover:text-orange-600 transition"
          aria-label="Open notifications"
        >
          <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
          {unreadCount > 0 ? (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-500 rounded-full"></span>
          ) : null}
        </button>

        {/* Hide text on small screens */}
        <p className="hidden md:block text-sm">
          {profile?.name
            ? `Welcome, ${profile.name.trim().split(/\s+/)[0]}!`
            : "Welcome!"}
        </p>

        <div
          onClick={() => navigate("/profile")}
          className="w-8 h-8 bg-orange-500 text-white 
                        flex items-center justify-center 
                        rounded-full text-sm overflow-hidden"
        >
          {profile?.photoUrl ? (
            <img
              src={resolvePhotoUrl(profile.photoUrl)}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            profile?.name ? profile.name[0].toUpperCase() : "A"
          )}
        </div>

      </div>
    </div>
  )
}
