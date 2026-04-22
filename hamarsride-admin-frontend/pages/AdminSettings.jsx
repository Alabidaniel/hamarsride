import { useEffect, useState } from "react";
import { apiFetch } from "../src/services/apiClient";
import { useAdminAuth } from "../src/context/AdminAuthContext";

export default function AdminSettings() {
  const { profile, setProfile } = useAdminAuth();
  const [form, setForm] = useState({ name: "", phone: "", altPhone: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setForm({
      name: profile?.name || "",
      phone: profile?.phone || "",
      altPhone: profile?.altPhone || "",
    });
  }, [profile]);

  const onSave = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      setMessage("");
      const payload = await apiFetch("/me", {
        method: "PATCH",
        body: JSON.stringify({
          name: form.name,
          phone: form.phone || null,
          altPhone: form.altPhone || null,
        }),
      });
      setProfile(payload.user);
      setMessage("Settings updated.");
    } catch (err) {
      setError(err.message || "Failed to update settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-4 max-w-3xl">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500 mt-1">Update your admin profile details.</p>
      </div>

      <form onSubmit={onSave} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Phone</label>
            <input
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Alt phone</label>
            <input
              value={form.altPhone}
              onChange={(e) => setForm((prev) => ({ ...prev, altPhone: e.target.value }))}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5"
            />
          </div>
        </div>

        {message ? <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-700 text-sm">{message}</div> : null}
        {error ? <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">{error}</div> : null}

        <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60 transition">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </section>
  );
}
