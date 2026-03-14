import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../src/services/apiClient";

const Checkout = () => {
  const navigate = useNavigate();
  const [selectedAddress, setSelectedAddress] = useState(1);
  const [orderInstruction, setOrderInstruction] = useState(
    localStorage.getItem("pendingOrderInstruction") || ""
  );

  const addresses = [
    { id: 1, label: "Home", details: "123 Main Street, Lagos" },
    { id: 2, label: "Office", details: "456 Business Ave, Lagos" },
  ];

  const orderItems = [
    { name: "Burger Meal", qty: 1, price: 5000 },
    { name: "Fries", qty: 2, price: 1500 },
  ];

  const subtotal = orderItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const deliveryFee = 1000;
  const total = subtotal + deliveryFee;

  const continueToPayment = async () => {
    const selectedAddressData = addresses.find((address) => address.id === selectedAddress);
    localStorage.setItem("pendingOrderInstruction", orderInstruction);
    try {
      const payload = await apiFetch("/orders", {
        method: "POST",
        body: JSON.stringify({
          address: selectedAddressData?.details || "",
          instruction: orderInstruction,
          deliveryFee,
          items: orderItems.map((item) => ({
            name: item.name,
            qty: item.qty,
            price: item.price,
          })),
        }),
      });
      navigate("/payment", {
        state: {
          orderInstruction,
          total,
          deliveryFee,
          subtotal,
          address: selectedAddressData?.details || "",
          orderId: payload.order.id,
        },
      });
    } catch (_err) {
      navigate("/payment", {
        state: {
          orderInstruction,
          total,
          deliveryFee,
          subtotal,
          address: selectedAddressData?.details || "",
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-sans text-gray-800">
      {/* Navbar / Progress */}
      <nav className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div className="text-xl sm:text-2xl font-bold text-orange-600">HAMARS RIDE</div>
        <div className="flex items-center gap-2 sm:gap-4 text-gray-600 overflow-x-auto">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center">1</div>
            <span className="ml-2 hidden md:inline">Cart</span>
          </div>
          <div className="w-8 sm:w-12 h-1 bg-gray-300"></div>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center">2</div>
            <span className="ml-2 hidden md:inline">Checkout</span>
          </div>
          <div className="w-8 sm:w-12 h-1 bg-gray-300"></div>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center">3</div>
            <span className="ml-2 hidden md:inline">Confirmation</span>
          </div>
        </div>
      </nav>

      {/* Page Title */}
      <h1 className="text-3xl font-semibold mb-6">Checkout</h1>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Delivery Address Section */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  onClick={() => setSelectedAddress(address.id)}
                  className={`border rounded-lg p-4 cursor-pointer transition ${
                    selectedAddress === address.id
                      ? "border-orange-600 bg-orange-50"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  <p className="font-semibold">{address.label}</p>
                  <p className="text-gray-600 text-sm">{address.details}</p>
                </div>
              ))}
              <div
                onClick={() => navigate("/add-address")}
                className="border border-dashed border-gray-400 rounded-lg p-4 flex items-center justify-center cursor-pointer hover:border-orange-600 transition"
              >
                + Add New Address
              </div>
            </div>
          </section>

          {/* Payment Method Section */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
            <button
              onClick={continueToPayment}
              className="w-full text-left border border-orange-300 bg-orange-50 rounded-lg p-4 hover:border-orange-500 hover:bg-orange-100 transition"
            >
              <p className="font-semibold text-orange-700">Bank Transfer</p>
              <p className="text-sm text-gray-600 mt-1">
                Pay directly to the admin account and continue from the payment page.
              </p>
            </button>
          </section>

          <section className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Order Instructions</h2>
            <p className="text-sm text-gray-500 mb-3">
              Add any special request for the rider or restaurant.
            </p>
            <textarea
              value={orderInstruction}
              onChange={(event) => setOrderInstruction(event.target.value)}
              maxLength={300}
              placeholder="Example: No onions, call me at gate, deliver to reception."
              className="w-full min-h-[120px] border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <p className="text-xs text-gray-500 mt-2">
              {orderInstruction.length}/300 characters
            </p>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3">
              {orderItems.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{item.name} x{item.qty}</span>
                  <span>₦{item.price * item.qty}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₦{subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span>₦{deliveryFee}</span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-2">
                <span>Total</span>
                <span>₦{total}</span>
              </div>
            </div>
            <button
              onClick={continueToPayment}
              className="w-full mt-6 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition"
            >
              Continue to Payment
            </button>
            <p className="text-gray-500 text-sm mt-2 text-center">
              Your payment and data are securely handled.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
