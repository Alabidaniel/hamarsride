import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavbarMain from "../components/NavbarMain";
import Footer from "../components/Footer";
import { apiFetch } from "../src/services/apiClient";

export default function SavedAddresses() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const payload = await apiFetch("/addresses");
        setAddresses(payload.addresses || []);
      } catch (err) {
        setError(err.message || "Failed to load addresses.");
      }
    };

    loadAddresses();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <NavbarMain />

      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex-1">
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Saved Addresses</h1>
              <p className="text-gray-500 mt-1">Manage your delivery locations.</p>
            </div>
            <button
              onClick={() => navigate("/add-address")}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl font-semibold transition"
            >
              Add New Address
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {error ? (
              <div className="col-span-full text-sm text-red-600">{error}</div>
            ) : null}
            {addresses.length === 0 ? (
              <div className="col-span-full text-sm text-gray-500">No saved addresses yet.</div>
            ) : null}
            {addresses.map((item) => (
              <div
                key={item.id}
                className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:border-orange-300 transition"
              >
                <p className="font-semibold text-gray-900">{item.label}</p>
                <p className="text-sm text-gray-600 mt-1">{item.details}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
