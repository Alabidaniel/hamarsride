import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, RefreshCcw, Pencil, Trash2, ToggleLeft, ToggleRight, UtensilsCrossed } from "lucide-react";
import { apiFetch } from "../src/services/apiClient";
import Modal from "../src/components/Modal";

const formatCurrency = (amountKobo) => `N${Number((amountKobo || 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const toKoboInt = (nairaValue) => {
  const parsed = Number(String(nairaValue ?? "").replace(/,/g, ""));
  if (Number.isNaN(parsed) || !Number.isFinite(parsed)) return null;
  return Math.max(0, Math.round(parsed * 100));
};

const toNairaString = (amountKobo) => {
  const n = Number(amountKobo || 0) / 100;
  return Number.isFinite(n) ? String(n.toFixed(2)) : "0.00";
};

export default function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [hardDelete, setHardDelete] = useState(false);

  const [form, setForm] = useState({
    name: "",
    type: "restaurant",
    descriptionShort: "",
    description: "",
    image: "",
    rating: "",
    time: "",
    fee: "",
    open: true,
    isActive: true,
    isFeatured: false,
    baseDeliveryFeeNaira: "1000.00",
  });

  const canSubmit = useMemo(() => form.name.trim().length > 0, [form.name]);

  const resetForm = (restaurant) => {
    if (!restaurant) {
      setForm({
        name: "",
        type: "restaurant",
        descriptionShort: "",
        description: "",
        image: "",
        rating: "",
        time: "",
        fee: "",
        open: true,
        isActive: true,
        isFeatured: false,
        baseDeliveryFeeNaira: "1000.00",
      });
      return;
    }

    setForm({
      name: restaurant.name || "",
      type: restaurant.type || "restaurant",
      descriptionShort: restaurant.descriptionShort || "",
      description: restaurant.description || "",
      image: restaurant.image || "",
      rating: restaurant.rating ?? "",
      time: restaurant.time || "",
      fee: restaurant.fee || "",
      open: Boolean(restaurant.open),
      isActive: restaurant.isActive !== false,
      isFeatured: Boolean(restaurant.isFeatured),
      baseDeliveryFeeNaira: toNairaString(restaurant.baseDeliveryFee),
    });
  };

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      setError("");
      const qs = new URLSearchParams({ pageSize: "100", ...(query.trim() ? { q: query.trim() } : {}) });
      const payload = await apiFetch(`/admin/restaurants?${qs.toString()}`);
      setRestaurants(payload.restaurants || []);
    } catch (err) {
      setError(err.message || "Failed to load restaurants.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    resetForm(null);
    setCreating(true);
  };

  const openEdit = (restaurant) => {
    setEditing(restaurant);
    resetForm(restaurant);
  };

  const submitRestaurant = async () => {
    if (!canSubmit) return;

    const payload = {
      name: form.name.trim(),
      type: form.type,
      descriptionShort: form.descriptionShort?.trim() || undefined,
      description: form.description?.trim() || undefined,
      image: form.image?.trim() || "",
      rating: form.rating === "" ? undefined : Number(form.rating),
      time: form.time?.trim() || undefined,
      fee: form.fee?.trim() || undefined,
      open: Boolean(form.open),
      isActive: Boolean(form.isActive),
      isFeatured: Boolean(form.isFeatured),
      baseDeliveryFee: toKoboInt(form.baseDeliveryFeeNaira) ?? undefined,
    };

    try {
      setError("");
      if (editing) {
        await apiFetch(`/admin/restaurants/${editing.id}`, { method: "PATCH", body: JSON.stringify(payload) });
        setEditing(null);
      } else {
        await apiFetch("/admin/restaurants", { method: "POST", body: JSON.stringify(payload) });
        setCreating(false);
      }
      await loadRestaurants();
    } catch (err) {
      setError(err.message || "Failed to save restaurant.");
    }
  };

  const toggleActive = async (restaurant) => {
    try {
      setError("");
      await apiFetch(`/admin/restaurants/${restaurant.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !restaurant.isActive }),
      });
      await loadRestaurants();
    } catch (err) {
      setError(err.message || "Failed to update restaurant.");
    }
  };

  const toggleOpen = async (restaurant) => {
    try {
      setError("");
      await apiFetch(`/admin/restaurants/${restaurant.id}`, {
        method: "PATCH",
        body: JSON.stringify({ open: !restaurant.open }),
      });
      await loadRestaurants();
    } catch (err) {
      setError(err.message || "Failed to update restaurant.");
    }
  };

  const confirmDelete = (restaurant) => {
    setHardDelete(false);
    setDeleting(restaurant);
  };

  const performDelete = async () => {
    if (!deleting) return;
    try {
      setError("");
      const suffix = hardDelete ? "?hard=true" : "";
      await apiFetch(`/admin/restaurants/${deleting.id}${suffix}`, { method: "DELETE" });
      setDeleting(null);
      await loadRestaurants();
    } catch (err) {
      setError(err.message || "Failed to delete restaurant.");
    }
  };

  return (
    <section className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Restaurant Management</h2>
          <p className="text-sm text-gray-500 mt-1">Edit details, toggle active/inactive, delete, and jump into menus.</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={loadRestaurants}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm hover:bg-black transition"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-white text-sm hover:bg-orange-600 transition"
          >
            <Plus size={16} />
            New Restaurant
          </button>
        </div>
      </div>

      {error ? <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-red-700">{error}</div> : null}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 flex items-center gap-3 flex-wrap">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search restaurants..."
          className="flex-1 min-w-[220px] rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
        />
        <button
          type="button"
          onClick={loadRestaurants}
          className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-orange-100 text-gray-700 hover:text-orange-700 transition text-sm"
        >
          Search
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left font-semibold px-4 py-3">Restaurant</th>
                <th className="text-left font-semibold px-4 py-3">Type</th>
                <th className="text-left font-semibold px-4 py-3">Active</th>
                <th className="text-left font-semibold px-4 py-3">Open</th>
                <th className="text-left font-semibold px-4 py-3">Menu</th>
                <th className="text-left font-semibold px-4 py-3">Delivery Fee</th>
                <th className="text-left font-semibold px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-4 text-gray-500" colSpan={7}>
                    Loading restaurants...
                  </td>
                </tr>
              ) : restaurants.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-gray-500" colSpan={7}>
                    No restaurants found.
                  </td>
                </tr>
              ) : (
                restaurants.map((r) => (
                  <tr key={r.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">{r.name}</div>
                      <div className="text-xs text-gray-500">
                        Featured: {r.isFeatured ? "Yes" : "No"} • Rating: {r.rating ?? "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{r.type === "shop" ? "Shop" : "Restaurant"}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleActive(r)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
                          r.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {r.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                        {r.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleOpen(r)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
                          r.open ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {r.open ? "Open" : "Closed"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{r._count?.menuItems ?? 0}</td>
                    <td className="px-4 py-3 text-gray-700">{formatCurrency(r.baseDeliveryFee)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          to={`/menu?restaurantId=${encodeURIComponent(r.id)}`}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-gray-100 px-3 py-2 text-xs text-gray-700 hover:bg-orange-100 hover:text-orange-700 transition"
                        >
                          <UtensilsCrossed size={14} />
                          View Menu
                        </Link>
                        <button
                          type="button"
                          onClick={() => openEdit(r)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-gray-100 px-3 py-2 text-xs text-gray-700 hover:bg-orange-100 hover:text-orange-700 transition"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => confirmDelete(r)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700 hover:bg-red-100 transition"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={creating || Boolean(editing)}
        title={editing ? "Edit Restaurant" : "Create Restaurant"}
        description="Update restaurant details and marketplace visibility."
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setCreating(false);
                setEditing(null);
              }}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={submitRestaurant}
              className="rounded-xl bg-orange-600 px-4 py-2 text-sm text-white hover:bg-orange-700 disabled:opacity-60"
            >
              Save
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Name</span>
            <input
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
              placeholder="Restaurant name"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Type</span>
            <select
              value={form.type}
              onChange={(e) => setForm((s) => ({ ...s, type: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
            >
              <option value="restaurant">Restaurant</option>
              <option value="shop">Shop</option>
            </select>
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-gray-700">Short description</span>
            <input
              value={form.descriptionShort}
              onChange={(e) => setForm((s) => ({ ...s, descriptionShort: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
              placeholder="One-liner summary"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-gray-700">Description</span>
            <textarea
              value={form.description}
              onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
              rows={4}
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
              placeholder="Full description"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-gray-700">Image URL</span>
            <input
              value={form.image}
              onChange={(e) => setForm((s) => ({ ...s, image: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
              placeholder="https://..."
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Rating (0-5)</span>
            <input
              value={form.rating}
              onChange={(e) => setForm((s) => ({ ...s, rating: e.target.value }))}
              type="number"
              step="0.1"
              min="0"
              max="5"
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Delivery fee (NGN)</span>
            <input
              value={form.baseDeliveryFeeNaira}
              onChange={(e) => setForm((s) => ({ ...s, baseDeliveryFeeNaira: e.target.value }))}
              inputMode="decimal"
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
              placeholder="1000.00"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">ETA</span>
            <input
              value={form.time}
              onChange={(e) => setForm((s) => ({ ...s, time: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
              placeholder="30-45 min"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Fee label</span>
            <input
              value={form.fee}
              onChange={(e) => setForm((s) => ({ ...s, fee: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
              placeholder="Delivery fee text"
            />
          </label>

          <div className="md:col-span-2 flex items-center gap-4 flex-wrap">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.open}
                onChange={(e) => setForm((s) => ({ ...s, open: e.target.checked }))}
              />
              Open
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((s) => ({ ...s, isActive: e.target.checked }))}
              />
              Active
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm((s) => ({ ...s, isFeatured: e.target.checked }))}
              />
              Featured
            </label>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(deleting)}
        title="Delete Restaurant"
        description="Soft delete will mark the restaurant inactive. Hard delete permanently removes it (only if there are no orders)."
        onClose={() => setDeleting(null)}
        footer={
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={hardDelete} onChange={(e) => setHardDelete(e.target.checked)} />
              Hard delete
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDeleting(null)}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={performDelete}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        }
      >
        <p className="text-sm text-gray-700">
          Confirm deleting <span className="font-semibold">{deleting?.name}</span>.
        </p>
      </Modal>
    </section>
  );
}

