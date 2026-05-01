import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavbarMain from "../components/NavbarMain";
import Footer from "../components/Footer";
import { apiFetch } from "../src/services/apiClient";
import ReceiptModal from "../components/ReceiptModal";

export default function OrderHistory() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [loadingReceiptId, setLoadingReceiptId] = useState("");

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

    const timer = setInterval(loadOrders, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleViewReceipt = async (orderId) => {
    setLoadingReceiptId(orderId);
    try {
      const response = await apiFetch(`/receipts/order/${orderId}`);
      setSelectedReceipt(response.receipt);
    } catch (err) {
      alert(err.message || "Failed to load receipt.");
    } finally {
      setLoadingReceiptId("");
    }
  };

  const getStatusClass = (status) => {
    const value = String(status || "").toLowerCase();
    if (value === "delivered") return "bg-green-100 text-green-700";
    if (value === "rejected" || value === "cancelled") return "bg-red-100 text-red-700";
    if (value === "accepted" || value === "processing" || value === "picked_up") {
      return "bg-orange-100 text-orange-700";
    }
    return "bg-gray-100 text-gray-700";
  };

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
              onClick={() => navigate("/restaurants")}
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
                  <th className="text-left py-3">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-500">
                      No orders yet.
                    </td>
                  </tr>
                ) : null}
                {history.map((item) => {
                  const displayStatus = item.rejectionReason ? "rejected" : item.status || "pending";
                  const canViewReceipt =
                    Boolean(item.hasReceipt) || item.latestPaymentStatus === "verified" || displayStatus === "delivered";

                  return (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="py-4 font-medium">{item.id}</td>
                      <td className="py-4">{item.pickup || "-"}</td>
                      <td className="py-4">{item.dropoff || "-"}</td>
                      <td className="py-4">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-"}
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusClass(displayStatus)}`}
                          >
                            {displayStatus}
                          </span>
                          {item.rejectionReason ? (
                            <span className="text-[11px] text-red-600 max-w-[220px]">
                              {item.rejectionReason}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="py-4">
                        {canViewReceipt ? (
                          <button
                            onClick={() => handleViewReceipt(item.id)}
                            disabled={loadingReceiptId === item.id}
                            className="text-xs px-3 py-1 rounded-full font-medium bg-orange-100 text-orange-700 hover:bg-orange-200 disabled:opacity-50"
                          >
                            {loadingReceiptId === item.id ? "Loading..." : "View Receipt"}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />

      {selectedReceipt && (
        <ReceiptModal
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
}
