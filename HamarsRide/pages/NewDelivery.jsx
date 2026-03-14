import React from "react";
import { useNavigate } from "react-router-dom";
import { Bike, MapPin, Package } from "lucide-react";
import NavbarMain from "../components/NavbarMain";
import Footer from "../components/Footer";

export default function NewDelivery() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <NavbarMain />

      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex-1">
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">New Delivery</h1>
          <p className="text-gray-500 mt-1">
            Create a new order and dispatch it quickly.
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <Bike className="text-orange-500" size={20} />
              <p className="font-semibold mt-3">Select Restaurant</p>
              <p className="text-sm text-gray-600 mt-1">Pick meals from nearby spots.</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <MapPin className="text-orange-500" size={20} />
              <p className="font-semibold mt-3">Set Delivery Address</p>
              <p className="text-sm text-gray-600 mt-1">Choose where to deliver the order.</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <Package className="text-orange-500" size={20} />
              <p className="font-semibold mt-3">Confirm & Pay</p>
              <p className="text-sm text-gray-600 mt-1">Review items and complete checkout.</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/restaurants")}
              className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-3 rounded-xl font-semibold transition"
            >
              Start New Delivery
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="border border-gray-300 text-gray-700 px-5 py-3 rounded-xl font-semibold hover:bg-gray-100 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
