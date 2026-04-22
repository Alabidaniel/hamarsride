import React, { useEffect, useState } from "react";
import { Copy, CheckCircle2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import NavbarMain from "../components/NavbarMain";
import Footer from "../components/Footer";
import { API_BASE_URL, apiFetch, getIdToken } from "../src/services/apiClient";

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const [copied, setCopied] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    bankName: "GTBank",
    accountName: "HAMARS RIDE LOGISTICS",
    accountNumber: "0123456789",
  });
  const [isLoading, setIsLoading] = useState(true);

  const pendingDraft = (() => {
    if (location.state) {
      return location.state;
    }

    try {
      const storedDraft = localStorage.getItem("pendingOrderDraft");
      return storedDraft ? JSON.parse(storedDraft) : null;
    } catch (_error) {
      return null;
    }
  })();

  const orderInstruction =
    pendingDraft?.orderInstruction || localStorage.getItem("pendingOrderInstruction") || "";
  const subtotal = pendingDraft?.subtotal ?? 0;
  const deliveryFee = pendingDraft?.deliveryFee ?? 0;
  const total = pendingDraft?.total ?? subtotal + deliveryFee;
  const address = pendingDraft?.address || "Not specified";
  const orderItems = pendingDraft?.orderItems || [];
  const orderId = pendingDraft?.orderId || "";
  const hasOrderDraft = orderItems.length > 0 && address !== "Not specified";

  useEffect(() => {
    const loadInstructions = async () => {
      try {
        setIsLoading(true);
        const payload = await apiFetch("/payments/instructions");
        setPaymentDetails({
          bankName: payload.bankName,
          accountName: payload.accountName,
          accountNumber: payload.accountNumber,
        });
      } catch (err) {
        setError(err.message || "Failed to load payment instructions.");
      } finally {
        setIsLoading(false);
      }
    };

    loadInstructions();
  }, []);

  const copyText = async (value, key) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(""), 1200);
    } catch (_error) {
      setCopied("");
    }
  };

  const handleConfirmPayment = async () => {
    setError("");
    setSuccess("");

    if (!receiptFile) {
      setError("Please upload your payment receipt before continuing.");
      return;
    }

    if (!orderId && !hasOrderDraft) {
      setError("No order details were found. Please return to checkout.");
      return;
    }

    if (!orderId && orderItems.length === 0) {
      setError("No order items found. Please return to checkout.");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = await getIdToken(false);
      const formData = new FormData();
      formData.append("receipt", receiptFile);

      if (orderId) {
        formData.append("orderId", orderId);
      } else {
        formData.append(
          "orderData",
          JSON.stringify({
            address,
            instruction: orderInstruction,
            items: orderItems,
            deliveryFee,
          })
        );
      }

      const response = await fetch(`${API_BASE_URL}/payments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const responseText = await response.text().catch(() => "");
        let errorMessage = orderId
          ? "Failed to submit payment."
          : "Failed to create order and submit payment.";
        try {
          const payload = JSON.parse(responseText);
          errorMessage = payload.error || errorMessage;
        } catch (e) {
          console.error("Non-JSON response:", responseText);
        }
        throw new Error(errorMessage);
      }

      setSuccess(
        orderId
          ? "Payment submitted successfully. We will verify shortly."
          : "Order created and payment submitted successfully. We will verify shortly."
      );
      localStorage.removeItem("pendingOrderInstruction");
      localStorage.removeItem("pendingOrderDraft");
      setTimeout(() => {
        navigate("/order-history");
      }, 800);
    } catch (err) {
      setError(err.message || (orderId ? "Failed to submit payment." : "Failed to create order and submit payment."));
    } finally {
      setIsSubmitting(false);
    }
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

          {error ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          ) : null}

          <div className="mt-6 space-y-4">
            {isLoading ? (
              <div className="text-sm text-gray-500">Loading payment instructions...</div>
            ) : (
              <>
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
              </>
            )}
          </div>

          <div className="mt-6 bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-800">
            {orderId ? (
              <>Use your Order ID ({orderId}) as transfer narration for faster confirmation.</>
            ) : (
              <>Your order will be created after payment is confirmed. Use your email as transfer narration.</>
            )}
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
            ) : (
              <p className="text-xs text-gray-500 mt-2">
                Upload a receipt to enable payment confirmation.
              </p>
            )}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleConfirmPayment}
              disabled={!receiptFile || isSubmitting || (!orderId && !hasOrderDraft)}
              className={`px-6 py-3 rounded-xl font-semibold transition ${
                receiptFile && !isSubmitting && (orderId || hasOrderDraft)
                  ? "bg-orange-600 hover:bg-orange-700 text-white"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isSubmitting
                ? "Submitting..."
                : orderId
                  ? "Submit Payment"
                  : "Create Order & Submit Payment"}
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
