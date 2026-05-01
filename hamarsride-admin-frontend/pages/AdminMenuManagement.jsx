import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Plus, RefreshCcw, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { apiFetch } from "../src/services/apiClient";
import Modal from "../src/components/Modal";

const toKoboInt = (nairaValue) => {
  const parsed = Number(String(nairaValue ?? "").replace(/,/g, ""));
  if (Number.isNaN(parsed) || !Number.isFinite(parsed)) return null;
  return Math.max(0, Math.round(parsed * 100));
};

const formatCurrency = (amountKobo) =>
  `N${Number((amountKobo || 0) / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const useQuery = () => new URLSearchParams(useLocation().search);

export default function AdminMenuManagement() {
  const query = useQuery();
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(query.get("restaurantId") || "");

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [error, setError] = useState("");

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    image: "",
    priceNaira: "",
    discountPercentage: "0",
    isAvailable: true,
  });

  const selectedRestaurant = useMemo(
    () => restaurants.find((r) => r.id === selectedRestaurantId) || null,
    [restaurants, selectedRestaurantId]
  );

  const canSubmit = useMemo(() => {
    if (!selectedRestaurantId) return false;
    if (!form.name.trim()) return false;
    const price = toKoboInt(form.priceNaira);
    return price !== null;
  }, [form.name, form.priceNaira, selectedRestaurantId]);

  const loadRestaurants = async () => {
    const payload = await apiFetch("/admin/restaurants?pageSize=100");
    return payload.restaurants || [];
  };

  const loadMenu = async (restaurantId) => {
    if (!restaurantId) {
      setItems([]);
      return;
    }

    const payload = await apiFetch(`/admin/restaurants/${restaurantId}/menu?pageSize=200`);
    setItems(payload.menuItems || []);
  };

  const bootstrap = async () => {
    try {
      setLoading(true);
      setError("");
      const list = await loadRestaurants();
      setRestaurants(list);

      const initialId = selectedRestaurantId || list[0]?.id || "";
      if (initialId && initialId !== selectedRestaurantId) {
        setSelectedRestaurantId(initialId);
      }
      if (initialId) {
        await loadMenu(initialId);
      }
    } catch (err) {
      setError(err.message || "Failed to load menu management.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // keep URL in sync for deep-links from restaurant management page
    const qs = new URLSearchParams();
    if (selectedRestaurantId) qs.set("restaurantId", selectedRestaurantId);
    navigate({ pathname: "/menu", search: qs.toString() ? `?${qs.toString()}` : "" }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRestaurantId]);

  const refreshMenu = async () => {
    try {
      setLoadingItems(true);
      setError("");
      await loadMenu(selectedRestaurantId);
    } catch (err) {
      setError(err.message || "Failed to refresh menu.");
    } finally {
      setLoadingItems(false);
    }
  };

  const openCreate = () => {
    setForm({
      name: "",
      description: "",
      category: "",
      image: "",
      priceNaira: "",
      discountPercentage: "0",
      isAvailable: true,
    });
    setCreating(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name || "",
      description: item.description || "",
      category: item.category || "",
      image: item.image || "",
      priceNaira: String(((item.price || 0) / 100).toFixed(2)),
      discountPercentage: String(item.discountPercentage ?? 0),
      isAvailable: item.isAvailable !== false,
    });
  };

  const submit = async () => {
    if (!canSubmit) return;

    const payload = {
      name: form.name.trim(),
      description: form.description?.trim() || undefined,
      category: form.category?.trim() || undefined,
      image: form.image?.trim() || "",
      price: toKoboInt(form.priceNaira),
      discountPercentage: Number(form.discountPercentage || 0),
      isAvailable: Boolean(form.isAvailable),
    };

    try {
      setError("");
      if (editing) {
        await apiFetch(`/admin/menu/${editing.id}`, { method: "PATCH", body: JSON.stringify(payload) });
        setEditing(null);
      } else {
        await apiFetch(`/admin/restaurants/${selectedRestaurantId}/menu`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setCreating(false);
      }
      await refreshMenu();
    } catch (err) {
      setError(err.message || "Failed to save menu item.");
    }
  };

  const toggleAvailability = async (item) => {
    try {
      setError("");
      await apiFetch(`/admin/menu/${item.id}/toggle`, { method: "POST" });
      await refreshMenu();
    } catch (err) {
      setError(err.message || "Failed to toggle availability.");
    }
  };

  const deleteItem = async () => {
    if (!deleting) return;
    try {
      setError("");
      await apiFetch(`/admin/menu/${deleting.id}`, { method: "DELETE" });
      setDeleting(null);
      await refreshMenu();
    } catch (err) {
      setError(err.message || "Failed to delete menu item.");
    }
  };

  return (
    <section className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Menu Management</h2>
          <p className="text-sm text-gray-500 mt-1">Manage menu items per restaurant: price, discount, availability.</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={refreshMenu}
            disabled={!selectedRestaurantId}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm hover:bg-black transition disabled:opacity-60"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
          <button
            type="button"
            onClick={openCreate}
            disabled={!selectedRestaurantId}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-white text-sm hover:bg-orange-600 transition disabled:opacity-60"
          >
            <Plus size={16} />
            New Item
          </button>
        </div>
      </div>

      {error ? <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-red-700">{error}</div> : null}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 flex items-center gap-3 flex-wrap">
        <label className="text-sm font-medium text-gray-700">Restaurant</label>
        <select
          value={selectedRestaurantId}
          onChange={async (e) => {
            const id = e.target.value;
            setSelectedRestaurantId(id);
            try {
              setLoadingItems(true);
              await loadMenu(id);
            } catch (err) {
              setError(err.message || "Failed to load menu.");
            } finally {
              setLoadingItems(false);
            }
          }}
          className="min-w-[240px] flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
        >
          <option value="">Select a restaurant...</option>
          {restaurants.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        {selectedRestaurant ? (
          <span className="text-xs rounded-full bg-gray-100 px-3 py-1 text-gray-700">
            Items: {items.length}
          </span>
        ) : null}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-auto">
          <table className="min-w-[1000px] w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left font-semibold px-4 py-3">Item</th>
                <th className="text-left font-semibold px-4 py-3">Category</th>
                <th className="text-left font-semibold px-4 py-3">Price</th>
                <th className="text-left font-semibold px-4 py-3">Discount</th>
                <th className="text-left font-semibold px-4 py-3">Final</th>
                <th className="text-left font-semibold px-4 py-3">Available</th>
                <th className="text-left font-semibold px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading || loadingItems ? (
                <tr>
                  <td className="px-4 py-4 text-gray-500" colSpan={7}>
                    Loading menu items...
                  </td>
                </tr>
              ) : !selectedRestaurantId ? (
                <tr>
                  <td className="px-4 py-4 text-gray-500" colSpan={7}>
                    Select a restaurant to manage its menu.
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-gray-500" colSpan={7}>
                    No menu items found.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">{item.name}</div>
                      {item.description ? <div className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</div> : null}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{item.category || "-"}</td>
                    <td className="px-4 py-3 text-gray-700">{formatCurrency(item.price)}</td>
                    <td className="px-4 py-3 text-gray-700">{Number(item.discountPercentage || 0)}%</td>
                    <td className="px-4 py-3 text-gray-900 font-semibold">{formatCurrency(item.finalPrice ?? item.price)}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleAvailability(item)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
                          item.isAvailable ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {item.isAvailable ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                        {item.isAvailable ? "Yes" : "No"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-gray-100 px-3 py-2 text-xs text-gray-700 hover:bg-orange-100 hover:text-orange-700 transition"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleting(item)}
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
        title={editing ? "Edit Menu Item" : "Add Menu Item"}
        description={selectedRestaurant ? `Restaurant: ${selectedRestaurant.name}` : "Select a restaurant first."}
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
              onClick={submit}
              className="rounded-xl bg-orange-600 px-4 py-2 text-sm text-white hover:bg-orange-700 disabled:opacity-60"
            >
              Save
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-gray-700">Name</span>
            <input
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
              placeholder="Item name"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-gray-700">Description</span>
            <textarea
              value={form.description}
              onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
              rows={3}
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
              placeholder="Short description"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Category</span>
            <input
              value={form.category}
              onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
              placeholder="Burgers, Drinks, etc."
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Image URL</span>
            <input
              value={form.image}
              onChange={(e) => setForm((s) => ({ ...s, image: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
              placeholder="https://..."
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Price (NGN)</span>
            <input
              value={form.priceNaira}
              onChange={(e) => setForm((s) => ({ ...s, priceNaira: e.target.value }))}
              inputMode="decimal"
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
              placeholder="2500.00"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Discount (%)</span>
            <input
              value={form.discountPercentage}
              onChange={(e) => setForm((s) => ({ ...s, discountPercentage: e.target.value }))}
              type="number"
              min="0"
              max="100"
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
            />
          </label>

          <div className="md:col-span-2">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.isAvailable}
                onChange={(e) => setForm((s) => ({ ...s, isAvailable: e.target.checked }))}
              />
              Available
            </label>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(deleting)}
        title="Delete Menu Item"
        description="This will remove the item (or mark it unavailable depending on backend configuration)."
        onClose={() => setDeleting(null)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeleting(null)}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={deleteItem}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
            >
              Delete
            </button>
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

