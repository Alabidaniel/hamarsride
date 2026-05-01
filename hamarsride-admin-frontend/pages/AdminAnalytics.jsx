import { useEffect, useMemo, useState } from "react";
import { ClipboardList, CreditCard, CalendarDays, TrendingUp, Store, UtensilsCrossed } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { apiFetch } from "../src/services/apiClient";

const formatCurrency = (amountKobo) =>
  `N${Number((amountKobo || 0) / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const cards = [
  { key: "totalOrders", label: "Total Orders", icon: ClipboardList },
  { key: "totalRevenue", label: "Total Revenue", icon: CreditCard },
  { key: "ordersToday", label: "Orders Today", icon: CalendarDays },
  { key: "ordersThisWeek", label: "Orders This Week", icon: TrendingUp },
];

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError("");
        const payload = await apiFetch("/admin/analytics/overview?days=30");
        setData(payload);
      } catch (err) {
        setError(err.message || "Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const chartData = useMemo(() => {
    const series = data?.revenueChart || [];
    return series.map((d) => ({
      date: String(d.date || "").slice(5),
      revenue: Number((d.revenue || 0) / 100),
    }));
  }, [data]);

  if (loading) {
    return <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-500">Loading analytics...</div>;
  }

  if (error) {
    return <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700">{error}</div>;
  }

  const summary = data?.summary || {};

  return (
    <section className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics</h2>
        <p className="text-sm text-gray-500 mt-1">Marketplace performance (last 30 days revenue chart).</p>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const value = summary[card.key] ?? 0;
          const display = card.key.includes("Revenue") || card.key === "totalRevenue" ? formatCurrency(value) : value;
          return (
            <article key={card.key} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 grid place-items-center">
                <Icon size={18} />
              </div>
              <p className="mt-4 text-sm text-gray-500">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{display}</p>
            </article>
          );
        })}
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Revenue (last 30 days)</h3>
            <p className="text-sm text-gray-500">Based on verified payments.</p>
          </div>
          <div className="text-sm font-semibold text-gray-900">
            Total: <span className="text-orange-600">{formatCurrency(summary.totalRevenue || 0)}</span>
          </div>
        </div>

        <div className="mt-5 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `N${Number(v).toLocaleString()}`} />
              <Tooltip
                formatter={(value) => [`N${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`, "Revenue"]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line type="monotone" dataKey="revenue" stroke="#F97316" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store size={16} className="text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Top Restaurants</h3>
            </div>
            <span className="text-xs text-gray-500">Ranked by revenue</span>
          </div>
          <div className="overflow-auto">
            <table className="min-w-[560px] w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left font-semibold px-4 py-3">Restaurant</th>
                  <th className="text-left font-semibold px-4 py-3">Items Sold</th>
                  <th className="text-left font-semibold px-4 py-3">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {(data?.topRestaurants || []).length === 0 ? (
                  <tr>
                    <td className="px-4 py-4 text-gray-500" colSpan={3}>
                      No restaurant ranking data yet.
                    </td>
                  </tr>
                ) : (
                  (data?.topRestaurants || []).map((r) => (
                    <tr key={r.restaurantId} className="border-t border-gray-100">
                      <td className="px-4 py-3 font-semibold text-gray-900">{r.name}</td>
                      <td className="px-4 py-3 text-gray-700">{r.orders}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{formatCurrency(r.revenue)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UtensilsCrossed size={16} className="text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Top Selling Items</h3>
            </div>
            <span className="text-xs text-gray-500">Ranked by revenue</span>
          </div>
          <div className="overflow-auto">
            <table className="min-w-[560px] w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left font-semibold px-4 py-3">Item</th>
                  <th className="text-left font-semibold px-4 py-3">Qty</th>
                  <th className="text-left font-semibold px-4 py-3">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {(data?.topSellingItems || []).length === 0 ? (
                  <tr>
                    <td className="px-4 py-4 text-gray-500" colSpan={3}>
                      No item ranking data yet.
                    </td>
                  </tr>
                ) : (
                  (data?.topSellingItems || []).map((item) => (
                    <tr key={item.name} className="border-t border-gray-100">
                      <td className="px-4 py-3 font-semibold text-gray-900">{item.name}</td>
                      <td className="px-4 py-3 text-gray-700">{item.qty}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{formatCurrency(item.revenue)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  );
}

