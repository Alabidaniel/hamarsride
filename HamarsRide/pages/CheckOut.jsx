import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavbarMain from "../components/NavbarMain";
import Footer from "../components/Footer";
import { apiFetch } from "../src/services/apiClient";

const deliveryFee = 1000;

const Checkout = () => {
  const navigate = useNavigate();
  const [selectedAddress, setSelectedAddress] = useState("");
  const [orderInstruction, setOrderInstruction] = useState(
    localStorage.getItem("pendingOrderInstruction") || ""
  );
  const [addresses, setAddresses] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadCheckout = async () => {
    try {
      setIsLoading(true);
      setError("");
      const [addressesPayload, cartPayload] = await Promise.all([
        apiFetch("/addresses"),
        apiFetch("/cart"),
      ]);

      const fetchedAddresses = addressesPayload.addresses || [];
      setAddresses(fetchedAddresses);
      const defaultAddress = fetchedAddresses.find((address) => address.isDefault);
      setSelectedAddress(defaultAddress?.id || fetchedAddresses[0]?.id || "");

      const items = (cartPayload.items || []).map((item) => ({
        name: item.name,
        qty: item.quantity,
        price: item.price,
      }));
      setOrderItems(items);
    } catch (err) {
      setError(err.message || "Failed to load checkout data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCheckout();
  }, []);

  const subtotal = useMemo(
    () => orderItems.reduce((acc, item) => acc + item.price * item.qty, 0),
    [orderItems]
  );

  const total = subtotal + (orderItems.length ? deliveryFee : 0);

  const continueToPayment = async () => {
    const selectedAddressData = addresses.find((address) => address.id === selectedAddress);
    localStorage.setItem("pendingOrderInstruction", orderInstruction);
    setSuccessMessage("");
    setError("");

    if (!selectedAddressData) {
      setError("Please select a delivery address.");
      return;
    }

    if (orderItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    const paymentDraft = {
      orderInstruction,
      total,
      deliveryFee,
      subtotal,
      address: selectedAddressData?.details || "",
      orderItems: orderItems.map((item) => ({
        name: item.name,
        qty: item.qty,
        price: item.price,
      })),
    };

    localStorage.setItem("pendingOrderDraft", JSON.stringify(paymentDraft));

    navigate("/payment", {
      state: paymentDraft,
    });
  };

  return (
    <div className="min-h-screen bg-[#f6f0e7] text-[#2f241b] flex flex-col">
      <NavbarMain />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-1">
        <section className="rounded-[1.5rem] border border-[#ddccb8] bg-[#fffdf9] px-5 py-6 shadow-sm sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#8e6b4c]">Step 3 of 3</p>
          <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">Checkout details</h1>
          <p className="mt-2 text-sm text-[#6f5a48]">
            Pick where to deliver, add optional notes, then continue to payment.
          </p>

          <div className="mt-5 grid gap-2 text-sm sm:grid-cols-3">
            <div className="rounded-xl border border-[#e5d6c3] bg-[#f6efe6] px-3 py-2">1. Pick items</div>
            <div className="rounded-xl border border-[#e5d6c3] bg-[#f6efe6] px-3 py-2">2. Review cart</div>
            <div className="rounded-xl border border-[#8a684d] bg-[#f1e7db] px-3 py-2 font-medium text-[#7d5b43]">
              3. Checkout & pay
            </div>
          </div>
        </section>

        {error ? (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {successMessage ? (
          <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        ) : null}

        {isLoading ? (
          <div className="mt-5 bg-[#fffdf9] rounded-xl p-6 shadow-sm text-[#7d6a59]">Loading checkout...</div>
        ) : (
          <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <section className="bg-[#fffdf9] rounded-xl p-5 sm:p-6 shadow-sm border border-[#e2d3c1]">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold">Delivery address</h2>
                  <button
                    type="button"
                    onClick={() => navigate("/add-address")}
                    className="rounded-full border border-[#ddccb8] bg-[#faf5ee] px-3 py-1.5 text-xs font-medium text-[#745e4b]"
                  >
                    Add new
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="mt-4 rounded-xl border border-dashed border-[#d5c2ad] bg-[#faf5ee] p-4 text-sm text-[#6f5a48]">
                    No saved address found. Add an address to continue.
                  </div>
                ) : (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {addresses.map((address) => (
                      <label
                        key={address.id}
                        className={`border rounded-lg p-4 cursor-pointer transition flex items-start gap-3 ${
                          selectedAddress === address.id
                            ? "border-[#8a684d] bg-[#f1e7db]"
                            : "border-[#e2d3c1] bg-white"
                        }`}
                      >
                        <input
                          type="radio"
                          className="mt-1 accent-orange-600"
                          checked={selectedAddress === address.id}
                          onChange={() => setSelectedAddress(address.id)}
                        />
                        <div className="min-w-0">
                          <p className="break-words font-semibold">{address.label}</p>
                          <p className="break-words text-[#6f5a48] text-sm">{address.details}</p>
                          {address.isDefault ? (
                            <span className="mt-2 inline-flex rounded-full bg-[#e8dacc] px-2 py-1 text-[11px] font-medium text-[#73553f]">
                              Default
                            </span>
                          ) : null}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </section>

              <section className="bg-[#fffdf9] rounded-xl p-5 sm:p-6 shadow-sm border border-[#e2d3c1]">
                <h2 className="text-xl font-semibold">Delivery instructions (optional)</h2>
                <p className="text-sm text-[#6f5a48] mt-2">
                  Add notes like gate number, landmark, or food preference.
                </p>
                <textarea
                  value={orderInstruction}
                  onChange={(event) => setOrderInstruction(event.target.value)}
                  maxLength={300}
                  placeholder="Example: Call me at the gate. No onions please."
                  className="mt-3 w-full min-h-[120px] border border-[#dbcab6] bg-[#faf5ee] rounded-lg p-3 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <p className="text-xs text-[#7d6a59] mt-2">{orderInstruction.length}/300 characters</p>
              </section>
            </div>

            <aside className="space-y-6">
              <section className="bg-[#fffdf9] rounded-xl p-5 sm:p-6 shadow-sm border border-[#e2d3c1]">
                <h2 className="text-xl font-semibold">Order summary</h2>
                <div className="mt-4 space-y-2 text-sm">
                  {orderItems.length === 0 ? (
                    <p className="text-[#6f5a48]">Your cart is empty.</p>
                  ) : (
                    orderItems.map((item, idx) => (
                      <div key={`${item.name}-${idx}`} className="flex items-start justify-between gap-3">
                        <span className="min-w-0 break-words text-[#4c3b2f]">
                          {item.name} x{item.qty}
                        </span>
                        <span className="whitespace-nowrap">N{(item.price * item.qty).toLocaleString()}</span>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-[#e5d7c5] mt-4 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-[#6f5a48]">
                    <span>Subtotal</span>
                    <span>N{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#6f5a48]">
                    <span>Delivery fee</span>
                    <span>N{(orderItems.length ? deliveryFee : 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg mt-2">
                    <span>Total</span>
                    <span>N{total.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={continueToPayment}
                  className="w-full mt-6 bg-[#8a684d] text-[#fffaf4] py-3 rounded-lg font-semibold hover:bg-[#76563f] transition disabled:opacity-60"
                  disabled={orderItems.length === 0 || addresses.length === 0}
                >
                  Continue to Payment
                </button>

                <button
                  onClick={() => navigate("/cart")}
                  className="w-full mt-2 border border-[#ddccb8] bg-[#faf5ee] text-[#6f5a48] py-3 rounded-lg transition hover:border-[#c1ab95]"
                >
                  Back to Cart
                </button>
              </section>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
