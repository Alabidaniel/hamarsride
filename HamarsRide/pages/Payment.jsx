import React, { useState } from "react";
import { Copy, CheckCircle2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import NavbarMain from "../components/NavbarMain";
import Footer from "../components/Footer";

const ADMIN_ORDERS_KEY = "hamarsrideAdminOrders";
const ADMIN_NOTIFICATIONS_KEY = "hamarsrideAdminNotifications";

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const [copied, setCopied] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);
  const [error, setError] = useState("");
  const orderInstruction =
    location.state?.orderInstruction || localStorage.getItem("pendingOrderInstruction") || "";
  const subtotal = location.state?.subtotal ?? 8000;
  const deliveryFee = location.state?.deliveryFee ?? 1000;
  const total = location.state?.total ?? subtotal + deliveryFee;
  const address = location.state?.address || "Not specified";
  const orderId = location.state?.orderId || "pending";

  const paymentDetails = {
    bankName: "GTBank",
    accountName: "HAMARS RIDE LOGISTICS",
    accountNumber: "0123456789",
  };

  const copyText = async (value, key) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(""), 1200);
    } catch (_error) {
      setCopied("");
    }
  };

  const handleConfirmPayment = () => {
    if (!receiptFile) {
      setError("Please upload your payment receipt before continuing.");
      return;
    }

    const orderId = `HMR${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();
    const newOrder = {
      id: orderId,
      customerName: "Aisha",
      amount: total,
      subtotal,
      deliveryFee,
      address,
      instruction: orderInstruction || "",
      receiptName: receiptFile.name,
      status: "payment_submitted",
      createdAt: now,
    };

    let existingOrders = [];
    let existingNotifications = [];
    try {
      existingOrders = JSON.parse(localStorage.getItem(ADMIN_ORDERS_KEY) || "[]");
    } catch (_error) {
      existingOrders = [];
    }
    try {
      existingNotifications = JSON.parse(localStorage.getItem(ADMIN_NOTIFICATIONS_KEY) || "[]");
    } catch (_error) {
      existingNotifications = [];
    }

    const newNotification = {
      id: `${Date.now()}`,
      title: "New Payment Submitted",
      message: `Order ${orderId} payment submitted by Aisha.`,
      read: false,
      createdAt: now,
      orderId,
    };

    localStorage.setItem(ADMIN_ORDERS_KEY, JSON.stringify([newOrder, ...existingOrders]));
    localStorage.setItem(
      ADMIN_NOTIFICATIONS_KEY,
      JSON.stringify([newNotification, ...existingNotifications])
    );

    setError("");
    localStorage.removeItem("pendingOrderInstruction");
    navigate("/order-history");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <NavbarMain />

      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex-1">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Bank Transfer Payment</h1>
          <p className="text-gray-600 mt-2">
            Transfer your payment to the admin account below, then confirm your payment.
          </p>

          <div className="mt-6 space-y-4">
            <PaymentRow
              label="Bank Name"
              value={paymentDetails.bankName}
              onCopy={() => copyText(paymentDetails.bankName, "bank")}
              copied={copied === "bank"}
            />
            <PaymentRow
              label="Account Name"
              value={paymentDetails.accountName}
              onCopy={() => copyText(paymentDetails.accountName, "name")}
              copied={copied === "name"}
            />
            <PaymentRow
              label="Account Number"
              value={paymentDetails.accountNumber}
              onCopy={() => copyText(paymentDetails.accountNumber, "number")}
              copied={copied === "number"}
            />
          </div>

          <div className="mt-6 bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-800">
            Use your Order ID ({orderId}) as transfer narration for faster confirmation.
          </div>

          <div className="mt-6 border border-gray-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-gray-900">Payment Summary</p>
            <div className="mt-2 text-sm text-gray-600 space-y-1">
              <p>Subtotal: N{subtotal.toLocaleString()}</p>
              <p>Delivery Fee: N{deliveryFee.toLocaleString()}</p>
              <p className="font-semibold text-gray-900">Total: N{total.toLocaleString()}</p>
              <p>Address: {address}</p>
            </div>
          </div>

          <div className="mt-6 border border-gray-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-gray-900">Customer Instructions</p>
            <p className="text-sm text-gray-600 mt-2">
              {orderInstruction || "No special instructions added for this order."}
            </p>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Payment Receipt
            </label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(event) => setReceiptFile(event.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-700 border border-gray-300 rounded-xl p-3 bg-white"
            />
            {receiptFile ? (
              <p className="text-xs text-green-700 mt-2">
                Selected: {receiptFile.name}
              </p>
            ) : null}
            {error ? (
              <p className="text-xs text-red-600 mt-2">{error}</p>
            ) : null}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleConfirmPayment}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-semibold transition"
            >
              I Have Made Payment
            </button>
            <button
              onClick={() => navigate("/Checkout")}
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition"
            >
              Back to Checkout
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function PaymentRow({ label, value, onCopy, copied }) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-3">
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-lg font-semibold text-gray-900 mt-1">{value}</p>
      </div>
      <button
        onClick={onCopy}
        className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-gray-200 hover:border-orange-300 hover:text-orange-700 transition"
      >
        {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
