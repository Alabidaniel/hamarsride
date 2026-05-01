import React, { useEffect, useMemo, useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NavbarMain from "../components/NavbarMain";
import Footer from "../components/Footer";
import { apiFetch } from "../src/services/apiClient";

const deliveryFee = 1000;

const getInitials = (value = "") =>
  value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingItemId, setUpdatingItemId] = useState(null);

  const loadCart = async () => {
    try {
      setIsLoading(true);
      setError("");
      const payload = await apiFetch("/cart");
      setCartItems(payload.items || []);
    } catch (err) {
      setError(err.message || "Failed to load cart.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const updateQuantity = async (item, nextQty) => {
    try {
      setUpdatingItemId(item.id);
      const response = await apiFetch(`/cart/items/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity: nextQty }),
      });

      if (!response?.item) {
        setCartItems((items) => items.filter((entry) => entry.id !== item.id));
        return;
      }

      setCartItems((items) =>
        items.map((entry) => (entry.id === item.id ? response.item : entry))
      );
    } catch (err) {
      setError(err.message || "Failed to update cart item.");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const increaseQty = (item) => updateQuantity(item, item.quantity + 1);

  const decreaseQty = (item) => {
    const nextQty = item.quantity - 1;
    updateQuantity(item, nextQty);
  };

  const removeItem = async (item) => {
    try {
      setUpdatingItemId(item.id);
      await apiFetch(`/cart/items/${item.id}`, { method: "DELETE" });
      setCartItems((items) => items.filter((entry) => entry.id !== item.id));
    } catch (err) {
      setError(err.message || "Failed to remove item.");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const subtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cartItems]
  );

  const total = subtotal + (cartItems.length ? deliveryFee : 0);
  const totalCount = cartItems.reduce((acc, item) => acc + (item.quantity || 0), 0);

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <NavbarMain />

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10 flex-1">
        <section className="rounded-[1.5rem] border border-orange-200 bg-white px-5 py-6 shadow-sm sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-orange-600">Step 2 of 3</p>
          <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">Review your cart</h1>
          <p className="mt-2 text-sm text-gray-600">
            Confirm quantities, then continue to checkout and payment.
          </p>

          <div className="mt-5 grid gap-2 text-sm sm:grid-cols-3">
            <div className="rounded-xl border border-orange-200 bg-orange-50 px-3 py-2">1. Pick items</div>
            <div className="rounded-xl border border-orange-500 bg-orange-100 px-3 py-2 font-medium text-orange-800">
              2. Review cart
            </div>
            <div className="rounded-xl border border-orange-200 bg-orange-50 px-3 py-2">3. Checkout & pay</div>
          </div>
        </section>

        {error ? (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="mt-5 bg-white rounded-2xl border border-orange-200 p-8 sm:p-16 text-center text-sm text-gray-500">
            Loading cart...
          </div>
        ) : cartItems.length === 0 ? (
          <div className="mt-5 bg-white rounded-2xl border border-orange-200 p-8 sm:p-16 text-center">
            <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-6">Start with a restaurant and add your first item.</p>
            <button
              onClick={() => navigate("/restaurants")}
              className="bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600 transition"
            >
              Browse Restaurants
            </button>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <section className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-orange-200 p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Cart items ({totalCount})</h2>
                <button
                  type="button"
                  onClick={() => navigate("/restaurants")}
                  className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700 hover:bg-orange-100 transition"
                >
                  Add more items
                </button>
              </div>

              <div className="mt-5 space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 rounded-xl border border-orange-200 bg-orange-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-14 w-14 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-300 text-xs font-semibold tracking-[0.2em] text-white">
                          {getInitials(item.name)}
                        </div>
                      )}

                      <div className="min-w-0">
                        <h3 className="break-words font-semibold">{item.name}</h3>
                        <p className="text-sm text-gray-600">N{item.price.toLocaleString()} each</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 self-stretch sm:self-auto">
                      <div className="flex items-center rounded-xl border border-orange-200 overflow-hidden bg-white">
                        <button
                          onClick={() => decreaseQty(item)}
                          className="px-3 py-2.5 text-orange-700 hover:bg-orange-50 disabled:opacity-60 transition"
                          disabled={updatingItemId === item.id || item.quantity <= 0}
                          aria-label={`Decrease ${item.name}`}
                        >
                          <Minus size={15} />
                        </button>
                        <span className="px-3 text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => increaseQty(item)}
                          className="px-3 py-2.5 text-orange-700 hover:bg-orange-50 disabled:opacity-60 transition"
                          disabled={updatingItemId === item.id}
                          aria-label={`Increase ${item.name}`}
                        >
                          <Plus size={15} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item)}
                        className="rounded-lg border border-orange-200 bg-white p-2 text-orange-700 hover:bg-orange-50 transition disabled:opacity-60"
                        disabled={updatingItemId === item.id}
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <aside className="bg-white rounded-2xl shadow-sm border border-orange-200 p-5 sm:p-6 h-fit">
              <h3 className="text-lg font-semibold">Order summary</h3>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>N{subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span>Delivery fee</span>
                  <span>N{(cartItems.length ? deliveryFee : 0).toLocaleString()}</span>
                </div>

                <hr className="border-orange-200" />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-orange-700">N{total.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => navigate("/Checkout")}
                className="w-full mt-6 bg-orange-500 text-white py-3 rounded-xl hover:bg-orange-600 transition font-semibold"
              >
                Continue to Checkout
              </button>

              <button
                onClick={() => navigate("/restaurants")}
                className="w-full mt-2 border border-orange-200 bg-orange-50 text-orange-700 py-3 rounded-xl transition hover:bg-orange-100"
              >
                Back to Menu
              </button>
            </aside>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Cart;
