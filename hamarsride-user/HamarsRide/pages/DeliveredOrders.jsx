import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavbarMain from "../components/NavbarMain";
import Footer from "../components/Footer";
import { apiFetch } from "../src/services/apiClient";

export default function DeliveredOrders() {
  const navigate = useNavigate();
  const [delivered, setDelivered] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const payload = await apiFetch("/orders?status=delivered");
        setDelivered(payload.orders || []);
      } catch (err) {
        setError(err.message || "Failed to load delivered orders.");
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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Delivered Orders</h1>
              <p className="text-gray-500 mt-1">Track all successfully completed deliveries.</p>
            </div>
            <button
              onClick={() => navigate("/order-history")}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-xl font-semibold hover:bg-gray-100 transition"
            >
              View Full History
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {error ? (
              <div className="text-sm text-red-600">{error}</div>
            ) : null}
            {delivered.length === 0 ? (
              <div className="text-sm text-gray-500">No delivered orders yet.</div>
            ) : null}
            {delivered.map((item) => (
              <div
                key={item.id}
                className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex items-start justify-between gap-4 flex-wrap"
              >
                <div>
                  <p className="font-semibold text-gray-900">{item.summary || "Order"}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {(item.pickup || "-") + " -> " + (item.dropoff || "-")}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : "-"}
                  </p>
                </div>
                <div className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                  Delivered
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
