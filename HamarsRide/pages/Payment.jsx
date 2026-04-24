import React, { useEffect, useState } from "react";
import { CheckCircle2, Copy, Upload } from "lucide-react";
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
        } catch (_err) {
          // Non-JSON response
        }

        throw new Error(errorMessage);
      }

      const payload = await response.json().catch(() => ({}));
      const savedPayment = payload.payment || null;
      const savedOrder = payload.order || null;
      const resolvedOrderId = orderId || savedOrder?.id || "";

      const trackingPayload = {
        paymentId: savedPayment?.id || "",
        orderId: resolvedOrderId,
        total,
        subtotal,
        deliveryFee,
        address,
        orderItems,
        orderInstruction,
        submittedAt: new Date().toISOString(),
      };

      localStorage.setItem("pendingPaymentTracking", JSON.stringify(trackingPayload));
      localStorage.removeItem("pendingOrderInstruction");
      localStorage.removeItem("pendingOrderDraft");

      navigate("/payment-success", { state: trackingPayload });
    } catch (err) {
      setError(
        err.message || (orderId ? "Failed to submit payment." : "Failed to create order and submit payment.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f0e7] text-[#2f241b] flex flex-col">
      <NavbarMain />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-1">
        <section className="rounded-[1.5rem] border border-[#ddccb8] bg-[#fffdf9] px-5 py-6 shadow-sm sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#8e6b4c]">Final Step</p>
          <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">Complete payment</h1>
          <p className="mt-2 text-sm text-[#6f5a48]">
            Transfer to the account below, upload your receipt, and we will confirm quickly.
          </p>
        </section>

        {error ? (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <section className="rounded-2xl border border-[#e2d3c1] bg-[#fffdf9] p-5 sm:p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Bank transfer details</h2>

            {isLoading ? (
              <div className="mt-4 text-sm text-[#7d6a59]">Loading payment instructions...</div>
            ) : (
              <div className="mt-4 space-y-3">
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
            )}

            <div className="mt-5 rounded-xl border border-[#d7c4b0] bg-[#f1e7db] p-4 text-sm text-[#6a4f39]">
              {orderId ? (
                <>Use your Order ID ({orderId}) as transfer narration for faster confirmation.</>
              ) : (
                <>Use your email address as transfer narration so we can match your payment quickly.</>
              )}
            </div>

            <div className="mt-5 rounded-xl border border-[#e2d3c1] bg-[#faf5ee] p-4">
              <label className="text-sm font-medium">Upload payment receipt</label>
              <div className="mt-3 rounded-xl border border-dashed border-[#d5c2ad] bg-[#fffdf9] p-4">
                <div className="flex items-center gap-2 text-sm text-[#6f5a48]">
                  <Upload size={16} />
                  <span>Accepted: JPG, PNG, PDF</span>
                </div>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(event) => setReceiptFile(event.target.files?.[0] || null)}
                  className="mt-3 block w-full text-sm text-gray-700 border border-gray-300 rounded-xl p-3 bg-white"
                />
                {receiptFile ? (
                  <p className="text-xs text-green-700 mt-2">Selected: {receiptFile.name}</p>
                ) : (
                  <p className="text-xs text-[#7d6a59] mt-2">Upload a receipt to continue.</p>
                )}
              </div>
            </div>
          </section>

          <aside className="rounded-2xl border border-[#e2d3c1] bg-[#fffdf9] p-5 sm:p-6 shadow-sm h-fit">
            <h2 className="text-xl font-semibold">Order summary</h2>
            <div className="mt-3 space-y-1 text-sm text-[#5e4b3b]">
              <p>Items: {orderItems.length}</p>
              <p>Subtotal: N{subtotal.toLocaleString()}</p>
              <p>Delivery Fee: N{deliveryFee.toLocaleString()}</p>
              <p className="font-semibold text-[#2f241b]">Total: N{total.toLocaleString()}</p>
              <p className="break-words pt-2">Address: {address}</p>
            </div>

            <div className="mt-4 rounded-xl border border-[#e5d7c5] bg-[#faf5ee] p-3 text-sm text-[#6f5a48]">
              <p className="font-semibold text-[#4f3d2f]">Instruction</p>
              <p className="mt-1">
                {orderInstruction || "No special instructions added for this order."}
              </p>
            </div>

            <button
              onClick={handleConfirmPayment}
              disabled={!receiptFile || isSubmitting || (!orderId && !hasOrderDraft)}
              className={`mt-5 w-full rounded-xl px-6 py-3 font-semibold transition ${
                receiptFile && !isSubmitting && (orderId || hasOrderDraft)
                  ? "bg-[#8a684d] text-[#fffaf4] hover:bg-[#76563f]"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? "Submitting..." : orderId ? "Submit Payment" : "Create Order & Submit Payment"}
            </button>

            <button
              onClick={() => navigate("/Checkout")}
              className="mt-2 w-full border border-[#ddccb8] bg-[#faf5ee] text-[#6f5a48] px-6 py-3 rounded-xl font-semibold transition hover:border-[#c1ab95]"
            >
              Back to Checkout
            </button>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function PaymentRow({ label, value, onCopy, copied }) {
  return (
    <div className="border border-[#e2d3c1] rounded-xl p-4 flex flex-col items-start justify-between gap-3 bg-[#faf5ee] sm:flex-row sm:items-center">
      <div className="min-w-0">
        <p className="text-xs text-[#7d6a59] uppercase tracking-wide">{label}</p>
        <p className="mt-1 break-words text-lg font-semibold text-[#2f241b]">{value}</p>
      </div>
      <button
        onClick={onCopy}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#ddccb8] px-3 py-2 text-sm transition hover:border-[#c1ab95] sm:w-auto"
      >
        {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
