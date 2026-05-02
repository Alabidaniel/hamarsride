import { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCcw, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { API_BASE_URL, apiFetch } from "../src/services/apiClient";
import Modal from "../src/components/Modal";

const toPublicAssetUrl = (assetPath = "") => {
  if (!assetPath) return "";
  if (assetPath.startsWith("http")) return assetPath;
  const base = API_BASE_URL.replace(/\/api\/?$/i, "");
  return `${base}${assetPath.startsWith("/") ? "" : "/"}${assetPath}`;
};

const toDateInput = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    targetType: "promo",
    restaurantId: "",
    linkUrl: "",
    isActive: true,
    priority: "0",
    startDate: "",
    endDate: "",
  });

  const canSubmit = useMemo(() => {
    if (!form.title.trim()) return false;
    if (form.targetType === "restaurant" && !form.restaurantId) return false;
    if (form.targetType === "promo" && !form.linkUrl.trim()) return false;
    if (!editing && !file) return false;
    return true;
  }, [editing, file, form.linkUrl, form.restaurantId, form.targetType, form.title]);

  const resetForm = (banner) => {
    setFile(null);
    setPreview(banner?.imageUrl ? toPublicAssetUrl(banner.imageUrl) : "");
    setForm({
      title: banner?.title || "",
      subtitle: banner?.subtitle || "",
      targetType: banner?.restaurantId ? "restaurant" : "promo",
      restaurantId: banner?.restaurantId || "",
      linkUrl: banner?.linkUrl || "",
      isActive: banner?.isActive !== false,
      priority: String(banner?.priority ?? 0),
      startDate: toDateInput(banner?.startDate),
      endDate: toDateInput(banner?.endDate),
    });
  };

  const loadAll = async () => {
    try {
      setLoading(true);
      setError("");
      const [bannersPayload, restaurantsPayload] = await Promise.all([
        apiFetch("/admin/banners"),
        apiFetch("/admin/restaurants?pageSize=100"),
      ]);
      setBanners(bannersPayload.banners || []);
      setRestaurants(restaurantsPayload.restaurants || []);
    } catch (err) {
      setError(err.message || "Failed to load banners.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const openCreate = () => {
    setCreating(true);
    setEditing(null);
    resetForm(null);
  };

  const openEdit = (banner) => {
    setEditing(banner);
    setCreating(false);
    resetForm(banner);
  };

  const onPickFile = (picked) => {
    setFile(picked || null);
    if (!picked) {
      setPreview(editing?.imageUrl ? toPublicAssetUrl(editing.imageUrl) : "");
      return;
    }
    const url = URL.createObjectURL(picked);
    setPreview(url);
  };

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const submit = async () => {
    if (!canSubmit) return;
    try {
      setError("");

      const body = new FormData();
      if (file) body.append("image", file);
      body.append("title", form.title.trim());
      if (form.subtitle.trim()) body.append("subtitle", form.subtitle.trim());
      body.append("targetType", form.targetType);
      body.append("isActive", String(Boolean(form.isActive)));
      body.append("priority", String(Number(form.priority || 0)));
      if (form.startDate) body.append("startDate", form.startDate);
      if (form.endDate) body.append("endDate", form.endDate);

      if (form.targetType === "restaurant") {
        body.append("restaurantId", form.restaurantId);
      } else {
        body.append("linkUrl", form.linkUrl.trim());
      }

      if (editing) {
        await apiFetch(`/admin/banners/${editing.id}`, { method: "PATCH", body });
        setEditing(null);
      } else {
        await apiFetch("/admin/banners", { method: "POST", body });
        setCreating(false);
      }

      await loadAll();
    } catch (err) {
      setError(err.message || "Failed to save banner.");
    }
  };

  const toggle = async (banner) => {
    try {
      setError("");
      await apiFetch(`/admin/banners/${banner.id}/toggle`, { method: "POST" });
      await loadAll();
    } catch (err) {
      setError(err.message || "Failed to toggle banner.");
    }
  };

  const del = async () => {
    if (!deleting) return;
    try {
      setError("");
      await apiFetch(`/admin/banners/${deleting.id}`, { method: "DELETE" });
      setDeleting(null);
      await loadAll();
    } catch (err) {
      setError(err.message || "Failed to delete banner.");
    }
  };

  return (
    <section className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Banner Management</h2>
          <p className="text-sm text-gray-500 mt-1">Upload images, set targets, and control active banners.</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={loadAll}
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
            New Banner
          </button>
        </div>
      </div>

      {error ? <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-red-700">{error}</div> : null}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-auto">
          <table className="min-w-[1000px] w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left font-semibold px-4 py-3">Banner</th>
                <th className="text-left font-semibold px-4 py-3">Target</th>
                <th className="text-left font-semibold px-4 py-3">Active</th>
                <th className="text-left font-semibold px-4 py-3">Priority</th>
                <th className="text-left font-semibold px-4 py-3">Schedule</th>
                <th className="text-left font-semibold px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-4 text-gray-500" colSpan={6}>
                    Loading banners...
                  </td>
                </tr>
              ) : banners.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-gray-500" colSpan={6}>
                    No banners found.
                  </td>
                </tr>
              ) : (
                banners.map((b) => (
                  <tr key={b.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-20 overflow-hidden rounded-xl bg-gray-100 border border-gray-200">
                          {b.imageUrl ? (
                            <img
                              src={toPublicAssetUrl(b.imageUrl)}
                              alt={b.title}
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{b.title}</div>
                          {b.subtitle ? <div className="text-xs text-gray-500">{b.subtitle}</div> : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {b.restaurant ? (
                        <span className="text-xs rounded-full bg-orange-50 text-orange-700 px-3 py-1 border border-orange-200">
                          Restaurant: {b.restaurant.name}
                        </span>
                      ) : b.linkUrl ? (
                        <span className="text-xs rounded-full bg-gray-50 text-gray-700 px-3 py-1 border border-gray-200">
                          Promo link
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggle(b)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
                          b.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {b.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                        {b.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{b.priority ?? 0}</td>
                    <td className="px-4 py-3 text-gray-700">
                      <div className="text-xs">
                        <div>Start: {b.startDate ? new Date(b.startDate).toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 }) : "-"}</div>
                        <div>End: {b.endDate ? new Date(b.endDate).toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 }) : "-"}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => openEdit(b)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-gray-100 px-3 py-2 text-xs text-gray-700 hover:bg-orange-100 hover:text-orange-700 transition"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleting(b)}
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
        title={editing ? "Edit Banner" : "Create Banner"}
        description="Upload a banner image and set where it redirects."
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
            <span className="text-sm font-medium text-gray-700">Title</span>
            <input
              value={form.title}
              onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
              placeholder="Banner title"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-gray-700">Subtitle</span>
            <input
              value={form.subtitle}
              onChange={(e) => setForm((s) => ({ ...s, subtitle: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
              placeholder="Optional subtitle"
            />
          </label>

          <div className="md:col-span-2">
            <span className="text-sm font-medium text-gray-700">Image</span>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onPickFile(e.target.files?.[0] || null)}
                  className="w-full text-sm"
                />
                <p className="mt-2 text-xs text-gray-500">
                  {editing ? "Leave empty to keep current image." : "Required for new banners."}
                </p>
              </label>
              <div className="h-32 w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                {preview ? (
                  <img src={preview} alt="Banner preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full grid place-items-center text-xs text-gray-500">No preview</div>
                )}
              </div>
            </div>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Target</span>
            <select
              value={form.targetType}
              onChange={(e) => setForm((s) => ({ ...s, targetType: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
            >
              <option value="restaurant">Restaurant</option>
              <option value="promo">Promo link</option>
            </select>
          </label>

          {form.targetType === "restaurant" ? (
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Restaurant</span>
              <select
                value={form.restaurantId}
                onChange={(e) => setForm((s) => ({ ...s, restaurantId: e.target.value }))}
                className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
              >
                <option value="">Select a restaurant...</option>
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Promo URL</span>
              <input
                value={form.linkUrl}
                onChange={(e) => setForm((s) => ({ ...s, linkUrl: e.target.value }))}
                className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
                placeholder="https://..."
              />
            </label>
          )}

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Priority</span>
            <input
              value={form.priority}
              onChange={(e) => setForm((s) => ({ ...s, priority: e.target.value }))}
              type="number"
              min="0"
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Active</span>
            <div className="mt-3">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((s) => ({ ...s, isActive: e.target.checked }))}
                />
                Banner is active
              </label>
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Start date</span>
            <input
              value={form.startDate}
              onChange={(e) => setForm((s) => ({ ...s, startDate: e.target.value }))}
              type="datetime-local"
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">End date</span>
            <input
              value={form.endDate}
              onChange={(e) => setForm((s) => ({ ...s, endDate: e.target.value }))}
              type="datetime-local"
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
            />
          </label>
        </div>
      </Modal>

      <Modal
        open={Boolean(deleting)}
        title="Delete Banner"
        description="This removes the banner from the marketplace."
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
              onClick={del}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        }
      >
        <p className="text-sm text-gray-700">
          Confirm deleting <span className="font-semibold">{deleting?.title}</span>.
        </p>
      </Modal>
    </section>
  );
}
