import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavbarMain from "../components/NavbarMain";
import Footer from "../components/Footer";
import { apiFetch } from "../src/services/apiClient";

export default function SavedAddresses() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const loadAddresses = async () => {
    try {
      setIsLoading(true);
      setError("");
      const payload = await apiFetch("/addresses");
      setAddresses(payload.addresses || []);
    } catch (err) {
      setError(err.message || "Failed to load addresses.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const setDefaultAddress = async (id) => {
    try {
      setUpdatingId(id);
      await apiFetch(`/addresses/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isDefault: true }),
      });
      await loadAddresses();
    } catch (err) {
      setError(err.message || "Failed to update address.");
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteAddress = async (id) => {
    try {
      setUpdatingId(id);
      await apiFetch(`/addresses/${id}`, { method: "DELETE" });
      setAddresses((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message || "Failed to delete address.");
    } finally {
      setUpdatingId(null);
    }
  };

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
            {isLoading ? (
              <div className="col-span-full text-sm text-gray-500">Loading addresses...</div>
            ) : addresses.length === 0 ? (
              <div className="col-span-full text-sm text-gray-500">No saved addresses yet.</div>
            ) : null}
            {addresses.map((item) => (
              <div
                key={item.id}
                className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:border-orange-300 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900 flex items-center gap-2">
                      {item.label}
                      {item.isDefault ? (
                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      ) : null}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{item.details}</p>
                    {item.notes ? (
                      <p className="text-xs text-gray-500 mt-1">{item.notes}</p>
                    ) : null}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {!item.isDefault ? (
                    <button
                      onClick={() => setDefaultAddress(item.id)}
                      className="px-3 py-2 text-xs rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition disabled:opacity-60"
                      disabled={updatingId === item.id}
                    >
                      Set Default
                    </button>
                  ) : null}
                  <button
                    onClick={() => deleteAddress(item.id)}
                    className="px-3 py-2 text-xs rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition disabled:opacity-60"
                    disabled={updatingId === item.id}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
