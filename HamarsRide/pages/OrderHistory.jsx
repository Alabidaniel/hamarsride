import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavbarMain from "../components/NavbarMain";
import Footer from "../components/Footer";
import { apiFetch } from "../src/services/apiClient";

export default function OrderHistory() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const payload = await apiFetch("/orders");
        setHistory(payload.orders || []);
      } catch (err) {
        setError(err.message || "Failed to load orders.");
      }
    };

    loadOrders();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <NavbarMain />

      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex-1">
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Order History</h1>
              <p className="text-gray-500 mt-1">View your previous delivery requests.</p>
            </div>
            <button
              onClick={() => navigate("/new-delivery")}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl font-semibold transition"
            >
              New Delivery
            </button>
          </div>

          <div className="mt-6 overflow-x-auto">
            {error ? (
              <div className="text-sm text-red-600 mb-4">{error}</div>
            ) : null}
            <table className="w-full min-w-[640px] text-sm">
              <thead className="text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3">Order ID</th>
                  <th className="text-left py-3">Pickup</th>
                  <th className="text-left py-3">Drop-off</th>
                  <th className="text-left py-3">Date</th>
                  <th className="text-left py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-500">
                      No orders yet.
                    </td>
                  </tr>
                ) : null}
                {history.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-4 font-medium">{item.id}</td>
                    <td className="py-4">{item.pickup || "-"}</td>
                    <td className="py-4">{item.dropoff || "-"}</td>
                    <td className="py-4">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-"}
                    </td>
                    <td className="py-4">
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-medium ${
                          item.status === "delivered"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
