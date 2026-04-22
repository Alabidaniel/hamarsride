import React, { useEffect, useState } from "react";
import Footer from "../components/Footer";
import NavbarMain from "../components/NavbarMain";
import { useNavigate } from "react-router-dom";
import { auth } from "../src/firebase";
import { signOut } from "firebase/auth";
import { apiFetch } from "../src/services/apiClient";
import { resolvePhotoUrl } from "../src/utils/photoUrl";

export default function Profile() {

  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        setIsLoadingAddresses(true);
        const payload = await apiFetch("/addresses");
        setAddresses(payload.addresses || []);
      } catch (err) {
        setError(err.message || "Failed to load addresses.");
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    loadAddresses();
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const payload = await apiFetch("/me");
        setProfile(payload.user);
      } catch (err) {
        setError(err.message || "Failed to load profile.");
      } finally {
        setIsLoadingProfile(false);
      }
    };
    loadProfile();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("authToken");
    localStorage.removeItem("userProfile");
    navigate("/Login");
  };

  const handleDeleteAccount = async () => {
    try {
      await apiFetch("/me", { method: "DELETE" });
      await signOut(auth);
      localStorage.removeItem("authToken");
      localStorage.removeItem("userProfile");
      navigate("/Signup", { replace: true });
      setTimeout(() => {
        if (window.location.pathname !== "/Signup") {
          window.location.assign("/Signup");
        }
      }, 50);
    } catch (err) {
      console.error("Delete account error:", err);
      setError(err.message || "Failed to delete account.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">

      {/* ================= NAVBAR ================= */}
     <NavbarMain />
      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 px-4 sm:px-6 lg:px-16 py-8 sm:py-10">

        {/* Page Title */}
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-8">
          My Profile
        </h1>

        {error ? (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {/* ================= PROFILE CARD ================= */}
        <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 mb-10 flex flex-col lg:flex-row justify-between lg:items-center gap-6">

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            {/* Profile Picture */}
            <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-gray-500 text-lg">
              {profile?.photoUrl ? (
                <img
                  src={resolvePhotoUrl(profile.photoUrl)}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : isLoadingProfile ? (
                "Loading"
              ) : (
                "Photo"
              )}
            </div>

            {/* User Info */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {isLoadingProfile ? "Loading..." : profile?.name || "User"}
              </h2>
              <p className="text-gray-600">{profile?.email || "email@domain.com"}</p>
              <p className="text-gray-600">{profile?.phone || "+234 800 000 0000"}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-600 text-sm rounded-full">
                Active Account
              </span>
            </div>
          </div>

          {/* Edit Button */}
          <button
            onClick={() => navigate('/EditProfile')}
            className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-xl shadow-sm transition"
          >
            Edit Profile
          </button>
        </div>

        {/* ================= ADDRESSES SECTION ================= */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Saved Addresses
            </h2>

            <button
              onClick={() => navigate("/add-address")}
              className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-xl shadow-sm transition"
            >
              + Add New Address
            </button>
          </div>

          {/* Address Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoadingAddresses ? (
            <div className="col-span-full text-sm text-gray-500">Loading addresses...</div>
          ) : null}
          {addresses.length === 0 && !isLoadingAddresses ? (
            <div className="col-span-full text-sm text-gray-500">No saved addresses yet.</div>
          ) : null}

          {addresses.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition">
              <h3 className="font-semibold text-gray-800">{item.label}</h3>
              <p className="text-gray-600 mt-2">{item.details}</p>
            </div>
          ))}

          </div>
        </div>

        {/* ================= ACCOUNT SETTINGS ================= */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Account Settings
          </h2>

          <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={() => navigate("/change-password")}
                className="text-gray-700 hover:text-orange-600 transition"
              >
                Change Password
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="text-red-600 hover:text-red-700 transition"
              >
                Delete Account
              </button>
              <button
                onClick={handleLogout}
                className="text-red-500 hover:text-red-600 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

      </main>

      {/* ================= FOOTER ================= */}
      <Footer />

      {showDeleteModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Delete account?</h3>
            <p className="text-sm text-gray-600 mt-2">
              This will permanently delete your account, saved addresses, and order history.
              This action cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowDeleteModal(false);
                  await handleDeleteAccount();
                }}
                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition"
              >
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
