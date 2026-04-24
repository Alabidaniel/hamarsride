import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, Download, Printer, RefreshCw, XCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import NavbarMain from "../components/NavbarMain";
import { apiFetch } from "../src/services/apiClient";
import {
  downloadReceiptHtml,
  formatCurrency,
  formatDate,
  printReceiptHtml,
} from "../src/utils/receiptExport";

const parseStoredTracking = () => {
  try {
    const raw = localStorage.getItem("pendingPaymentTracking");
    return raw ? JSON.parse(raw) : null;
  } catch (_err) {
    return null;
  }
};

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialTracking = useMemo(
    () => location.state || parseStoredTracking() || null,
    [location.state]
  );

  const [tracking, setTracking] = useState(initialTracking);
  const [payment, setPayment] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastCheckedAt, setLastCheckedAt] = useState(null);

  useEffect(() => {
    if (!tracking) return;
    localStorage.setItem("pendingPaymentTracking", JSON.stringify(tracking));
  }, [tracking]);

  const resolveTrackingFromPayment = (payload) => {
    if (!payload?.payment) return;
    setTracking((prev) => ({
      ...(prev || {}),
      paymentId: prev?.paymentId || payload.payment.id,
      orderId: prev?.orderId || payload.payment.orderId,
      total: prev?.total ?? payload.payment.amount,
    }));
  };

  const inferStatusFromNotifications = async (orderId) => {
    if (!orderId) return null;

    try {
      const payload = await apiFetch("/notifications");
      const items = payload.notifications || [];
      const match = items.find((item) => {
        const message = String(item.message || "").toLowerCase();
        return (
          item.type === "payment" &&
          message.includes(orderId.toLowerCase())
        );
      });

      if (!match) return null;

      const message = String(match.message || "").toLowerCase();
      if (message.includes("rejected")) return "rejected";
      if (message.includes("verified")) return "verified";
      return null;
    } catch (_err) {
      return null;
    }
  };

  const fallbackStatusByOrder = async () => {
    const orderId = tracking?.orderId;
    if (!orderId) {
      throw new Error("No payment tracking details found. Please submit payment first.");
    }

    try {
      const receiptPayload = await apiFetch(`/receipts/order/${orderId}`);
      const resolvedReceipt = receiptPayload.receipt || null;
      setReceipt(resolvedReceipt);
      setPayment({
        id: tracking?.paymentId || "",
        orderId,
        status: "verified",
        amount: tracking?.total ?? 0,
      });
      return;
    } catch (receiptErr) {
      if (receiptErr?.status !== 404) {
        throw receiptErr;
      }
    }

    const inferredStatus = await inferStatusFromNotifications(orderId);
    setPayment({
      id: tracking?.paymentId || "",
      orderId,
      status: inferredStatus || "submitted",
      amount: tracking?.total ?? 0,
    });
    setReceipt(null);
  };

  const fetchStatus = async ({ silent = false } = {}) => {
    if (!tracking?.paymentId && !tracking?.orderId) {
      setIsLoading(false);
      setError("No payment tracking details found. Please submit payment first.");
      return;
    }

    try {
      if (!silent) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError("");

      try {
        const payload = tracking.paymentId
          ? await apiFetch(`/payments/${tracking.paymentId}`)
          : await apiFetch(`/payments/order/${tracking.orderId}/latest`);

        setPayment(payload.payment || null);
        resolveTrackingFromPayment(payload);

        if (payload.receipt) {
          setReceipt(payload.receipt);
        } else if (payload.payment?.status === "verified" && payload.payment?.orderId) {
          try {
            const receiptPayload = await apiFetch(`/receipts/order/${payload.payment.orderId}`);
            setReceipt(receiptPayload.receipt || null);
          } catch (_receiptErr) {
            setReceipt(null);
          }
        } else {
          setReceipt(null);
        }
      } catch (paymentErr) {
        if (paymentErr?.status === 404) {
          await fallbackStatusByOrder();
        } else {
          throw paymentErr;
        }
      }

      setLastCheckedAt(new Date());
    } catch (err) {
      setError(err.message || "Failed to check payment status.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracking?.paymentId, tracking?.orderId]);

  useEffect(() => {
    const isVerifiedWithoutReceipt = payment?.status === "verified" && !receipt;
    if (!payment || payment.status === "rejected" || (payment.status === "verified" && !isVerifiedWithoutReceipt)) {
      return undefined;
    }

    const timer = setInterval(() => {
      fetchStatus({ silent: true });
    }, 12000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payment?.status, receipt, tracking?.paymentId, tracking?.orderId]);

  useEffect(() => {
    if (payment?.status === "verified" && receipt) {
      localStorage.removeItem("pendingPaymentTracking");
    }
  }, [payment?.status, receipt]);

  const showPending = payment?.status === "submitted" || !payment;
  const showRejected = payment?.status === "rejected";
  const showVerified = payment?.status === "verified";

  const goBackToPayment = () => {
    navigate("/payment", { state: tracking || undefined });
  };

  return (
    <div className="min-h-screen bg-[#f6f0e7] text-[#2f241b] flex flex-col">
      <NavbarMain />

      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-1">
        <section className="rounded-[1.5rem] border border-[#ddccb8] bg-[#fffdf9] px-5 py-6 shadow-sm sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#8e6b4c]">Payment Status</p>
          <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">
            {showVerified ? "Payment successful" : "Payment verification in progress"}
          </h1>
          <p className="mt-2 text-sm text-[#6f5a48]">
            {showVerified
              ? "Your payment has been confirmed by admin."
              : "We are waiting for admin confirmation. This page updates automatically."}
          </p>
        </section>

        {error ? (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <section className="mt-5 rounded-2xl border border-[#e2d3c1] bg-[#fffdf9] p-5 sm:p-6 shadow-sm">
          {isLoading ? (
            <div className="text-sm text-[#7d6a59]">Checking payment status...</div>
          ) : showPending ? (
            <div className="rounded-xl border border-[#e2d3c1] bg-[#faf5ee] p-4">
              <div className="flex items-center gap-2 text-[#7d5b43]">
                <Clock3 size={18} />
                <p className="font-semibold">Awaiting admin confirmation</p>
              </div>
              <p className="mt-2 text-sm text-[#6f5a48]">
                Your payment has been submitted successfully. Once admin verifies it, this page will switch to payment successful and show your downloadable receipt.
              </p>
            </div>
          ) : null}

          {!isLoading && showRejected ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-2 text-red-700">
                <XCircle size={18} />
                <p className="font-semibold">Payment rejected</p>
              </div>
              <p className="mt-2 text-sm text-red-700">
                Admin rejected this payment. Please upload a new receipt to continue.
              </p>
              <button
                type="button"
                onClick={goBackToPayment}
                className="mt-4 rounded-xl bg-[#8a684d] px-4 py-2 text-sm font-semibold text-[#fffaf4] transition hover:bg-[#76563f]"
              >
                Upload New Receipt
              </button>
            </div>
          ) : null}

          {!isLoading && showVerified ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 size={18} />
                <p className="font-semibold">Payment confirmed</p>
              </div>
              <p className="mt-2 text-sm text-emerald-700">
                {receipt
                  ? "Payment confirmed by admin. Your receipt is ready for download."
                  : "Payment confirmed by admin. We are preparing your receipt now."}
              </p>
            </div>
          ) : null}

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[#e2d3c1] bg-[#faf5ee] p-4 text-sm">
              <p className="text-[#7d6a59]">Order ID</p>
              <p className="mt-1 font-semibold break-words">
                {payment?.orderId || tracking?.orderId || "-"}
              </p>
            </div>
            <div className="rounded-xl border border-[#e2d3c1] bg-[#faf5ee] p-4 text-sm">
              <p className="text-[#7d6a59]">Payment Status</p>
              <p className="mt-1 font-semibold capitalize">{payment?.status || "submitted"}</p>
            </div>
            <div className="rounded-xl border border-[#e2d3c1] bg-[#faf5ee] p-4 text-sm">
              <p className="text-[#7d6a59]">Total Amount</p>
              <p className="mt-1 font-semibold">
                {formatCurrency(payment?.amount ?? tracking?.total ?? 0)}
              </p>
            </div>
            <div className="rounded-xl border border-[#e2d3c1] bg-[#faf5ee] p-4 text-sm">
              <p className="text-[#7d6a59]">Last Checked</p>
              <p className="mt-1 font-semibold">{lastCheckedAt ? formatDate(lastCheckedAt) : "-"}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => fetchStatus({ silent: true })}
              disabled={isRefreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#ddccb8] bg-[#faf5ee] px-4 py-2 text-sm font-semibold text-[#6f5a48] transition hover:border-[#c1ab95] disabled:opacity-60"
            >
              <RefreshCw size={15} className={isRefreshing ? "animate-spin" : ""} />
              Refresh Status
            </button>

            {showVerified ? (
              <>
                <button
                  type="button"
                  onClick={() => receipt && downloadReceiptHtml(receipt)}
                  disabled={!receipt}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    receipt
                      ? "bg-[#8a684d] text-[#fffaf4] hover:bg-[#76563f]"
                      : "cursor-not-allowed bg-gray-200 text-gray-500"
                  }`}
                >
                  <Download size={15} />
                  Download Receipt
                </button>
                <button
                  type="button"
                  onClick={() => receipt && printReceiptHtml(receipt)}
                  disabled={!receipt}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                    receipt
                      ? "border-[#ddccb8] bg-[#faf5ee] text-[#6f5a48] hover:border-[#c1ab95]"
                      : "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-500"
                  }`}
                >
                  <Printer size={15} />
                  Print Receipt
                </button>
              </>
            ) : null}

            <button
              type="button"
              onClick={() => navigate("/order-history")}
              className="inline-flex items-center justify-center rounded-xl border border-[#ddccb8] bg-[#faf5ee] px-4 py-2 text-sm font-semibold text-[#6f5a48] transition hover:border-[#c1ab95]"
            >
              Go to Order History
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
