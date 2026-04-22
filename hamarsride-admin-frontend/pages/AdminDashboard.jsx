import { useEffect, useState } from "react";
import { ClipboardList, CreditCard, Store, Users, Truck, Clock3, CheckCircle2 } from "lucide-react";
import { apiFetch } from "../src/services/apiClient";

const cards = [
  { key: "totalOrders", label: "Total Orders", icon: ClipboardList },
  { key: "pendingOrders", label: "Pending Orders", icon: Clock3 },
  { key: "rejectedOrders", label: "Rejected Orders", icon: CheckCircle2 },
  { key: "deliveredOrders", label: "Delivered Orders", icon: Truck },
  { key: "pendingPayments", label: "Pending Payments", icon: CreditCard },
  { key: "totalUsers", label: "Users", icon: Users },
  { key: "totalRestaurants", label: "Restaurants", icon: Store },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError("");
        const payload = await apiFetch("/admin/overview");
        setStats(payload.stats || null);
      } catch (err) {
        setError(err.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  if (loading) {
    return <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-500">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">Live overview of orders, users, restaurants and payments.</p>
        </div>
        <div className="px-4 py-2 rounded-full bg-green-100 text-green-700 font-semibold text-sm">
          Revenue: N{Number(stats?.totalRevenue || 0).toLocaleString()}
        </div>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.key} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 grid place-items-center">
                <Icon size={18} />
              </div>
              <p className="mt-4 text-sm text-gray-500">{card.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.[card.key] ?? 0}</p>
            </article>
          );
        })}
      </section>
    </div>
  );
}
