import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavbarMain from "../components/NavbarMain";
import Footer from "../components/Footer";
import { apiFetch } from "../src/services/apiClient";

export default function AddNewAddress() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    label: "",
    fullAddress: "",
    city: "",
    state: "",
    notes: "",
    isDefault: false,
  });
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.label || !form.fullAddress || !form.city || !form.state) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setIsSaving(true);
      await apiFetch("/addresses", {
        method: "POST",
        body: JSON.stringify({
          label: form.label.trim(),
          details: `${form.fullAddress.trim()}, ${form.city.trim()}, ${form.state.trim()}`,
          notes: form.notes.trim(),
          isDefault: form.isDefault,
        }),
      });
      navigate("/profile");
    } catch (err) {
      setError(err.message || "Failed to save address.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <NavbarMain />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            Add New Address
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Save a new delivery address for your orders.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Address Label
              </label>
              <input
                name="label"
                placeholder="Home, Office..."
                value={form.label}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Street Address
              </label>
              <input
                name="fullAddress"
                placeholder="12 Admiralty Way, Lekki Phase 1"
                value={form.fullAddress}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">City</label>
                <input
                  name="city"
                  placeholder="Lagos"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">State</label>
                <input
                  name="state"
                  placeholder="Lagos"
                  value={form.state}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Delivery Notes (Optional)
              </label>
              <textarea
                name="notes"
                rows={4}
                placeholder="Landmark, gate code, or special instructions"
                value={form.notes}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="isDefault"
                checked={form.isDefault}
                onChange={handleChange}
                className="accent-orange-600"
              />
              Set as default address
            </label>

            {error ? (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                {error}
              </p>
            ) : null}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                className="bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-700 transition disabled:opacity-60"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Address"}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
