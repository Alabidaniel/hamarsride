import React from "react";
import {
  downloadReceiptHtml,
  formatCurrency,
  formatDate,
  printReceiptHtml,
} from "../src/utils/receiptExport";

export default function ReceiptModal({ receipt, onClose }) {
  if (!receipt) return null;

  const handleDownload = () => downloadReceiptHtml(receipt);
  const handlePrint = () => printReceiptHtml(receipt);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white">
        <div className="p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Receipt</h2>
              <p className="mt-1 text-sm text-gray-500">Receipt #{receipt.receiptNumber}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-orange-300 hover:text-orange-700"
              >
                Download
              </button>
              <button
                onClick={handlePrint}
                className="rounded-xl bg-orange-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-orange-700"
              >
                Print
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 transition hover:text-gray-600"
                aria-label="Close receipt"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="mb-6 rounded-xl bg-gray-50 p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Order ID</p>
                <p className="font-medium text-gray-900">{receipt.orderId}</p>
              </div>
              <div>
                <p className="text-gray-500">Date</p>
                <p className="font-medium text-gray-900">{formatDate(receipt.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-500">Delivery Address</p>
                <p className="font-medium text-gray-900 whitespace-pre-wrap">{receipt.address}</p>
              </div>
              <div>
                <p className="text-gray-500">Instructions</p>
                <p className="font-medium text-gray-900 whitespace-pre-wrap">
                  {receipt.instruction || "None"}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="mb-3 text-lg font-semibold text-gray-900">Items</h3>
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Item</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-500">Qty</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">Price</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(receipt.items || []).map((item, index) => (
                    <tr key={index} className="border-t border-gray-100">
                      <td className="px-4 py-3 text-gray-900">{item.name}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{item.qty}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(item.price)}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900">{formatCurrency(receipt.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Delivery Fee</span>
                <span className="text-gray-900">{formatCurrency(receipt.deliveryFee)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 text-lg font-bold">
                <span className="text-gray-900">Total</span>
                <span className="text-orange-600">{formatCurrency(receipt.total)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-4 text-center">
            <p className="text-xs text-gray-400">Thank you for choosing HamarsRide!</p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <button
              onClick={handleDownload}
              className="w-full rounded-xl border border-gray-300 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Download Receipt
            </button>
            <button
              onClick={handlePrint}
              className="w-full rounded-xl bg-orange-600 py-3 font-semibold text-white transition hover:bg-orange-700"
            >
              Print Receipt
            </button>
            <button
              onClick={onClose}
              className="w-full rounded-xl bg-gray-900 py-3 font-semibold text-white transition hover:bg-black"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
