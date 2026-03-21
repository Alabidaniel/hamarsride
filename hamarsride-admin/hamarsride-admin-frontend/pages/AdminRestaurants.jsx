import { useEffect, useState } from "react";
import { apiFetch } from "../src/services/apiClient";

export default function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      setError("");
      const payload = await apiFetch("/admin/restaurants");
      setRestaurants(payload.restaurants || []);
    } catch (err) {
      setError(err.message || "Failed to load restaurants.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurants();
  }, []);

  const toggleOpen = async (restaurant) => {
    const ok = window.confirm(`${restaurant.open ? "Close" : "Open"} ${restaurant.name}?`);
    if (!ok) return;

    try {
      await apiFetch(`/admin/restaurants/${restaurant.id}`, {
        method: "PATCH",
        body: JSON.stringify({ open: !restaurant.open }),
      });
      loadRestaurants();
    } catch (err) {
      setError(err.message || "Failed to update restaurant.");
    }
  };

  return (
    <section className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Restaurants</h2>
        <button onClick={loadRestaurants} type="button" className="px-4 py-2 rounded-xl bg-orange-500 text-white text-sm hover:bg-orange-600 transition">
          Refresh
        </button>
      </div>

      {error ? <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-red-700">{error}</div> : null}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-gray-500">Loading restaurants...</div>
        ) : restaurants.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-gray-500">No restaurants found.</div>
        ) : (
          restaurants.map((restaurant) => (
            <article key={restaurant.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 text-lg">{restaurant.name}</h3>
              <p className="text-sm text-gray-500 mt-2">Menu items: {restaurant._count?.menuItems ?? 0}</p>
              <p className="text-sm text-gray-500">Rating: {restaurant.rating ?? "-"}</p>
              <p className="text-sm text-gray-500">ETA: {restaurant.time ?? "-"}</p>
              <p className="text-sm text-gray-500">Fee: {restaurant.fee ?? "-"}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className={`text-xs px-3 py-1 rounded-full ${restaurant.open ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                  {restaurant.open ? "Open" : "Closed"}
                </span>
                <button
                  type="button"
                  onClick={() => toggleOpen(restaurant)}
                  className="px-3 py-2 text-xs rounded-xl bg-gray-100 hover:bg-orange-100 text-gray-700 hover:text-orange-700 transition"
                >
                  Toggle
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
