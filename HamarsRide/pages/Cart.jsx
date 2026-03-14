import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NavbarMain from "../components/NavbarMain";
import Footer from "../components/Footer";

const Cart = () => {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Grilled Chicken Burger",
      price: 4500,
      quantity: 1,
      image:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200",
    },
    {
      id: 2,
      name: "Jollof Rice & Chicken",
      price: 3800,
      quantity: 2,
      image:
        "https://images.unsplash.com/photo-1604908554027-5c6a8c3b8a4e?w=200",
    },
  ]);

  const deliveryFee = 1500;

  const increaseQty = (id) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQty = (id) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const total = subtotal + deliveryFee;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      <NavbarMain />

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-12 flex-1">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-8">Your Cart</h2>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-16 text-center">
            <img
              src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png"
              alt="Empty cart"
              className="w-40 mx-auto mb-6 opacity-70"
            />
            <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-6">
              Looks like you haven&apos;t added anything yet.
            </p>
            <button
              onClick={() => navigate("/restaurants")}
              className="bg-orange-600 text-white px-6 py-3 rounded-xl hover:bg-orange-700 transition"
            >
              Browse Restaurants
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-6 gap-4"
                  >
                    <div className="flex items-center gap-4 sm:gap-6">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-xl"
                      />
                      <div>
                        <h4 className="font-semibold">{item.name}</h4>
                        <p className="text-gray-500 text-sm">
                          N{item.price.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6 self-end sm:self-auto">
                      <div className="flex items-center border rounded-xl overflow-hidden">
                        <button
                          onClick={() => decreaseQty(item.id)}
                          className="px-4 py-2 hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="px-4">{item.quantity}</span>
                        <button
                          onClick={() => increaseQty(item.id)}
                          className="px-4 py-2 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 h-fit">
              <h3 className="text-lg font-semibold mb-6">Order Summary</h3>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>N{subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>N{deliveryFee.toLocaleString()}</span>
                </div>

                <hr />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-green-600">N{total.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => navigate("/Checkout")}
                className="w-full mt-8 bg-orange-600 text-white py-3 rounded-xl hover:bg-orange-700 transition font-medium"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Cart;
