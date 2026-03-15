import React, { useEffect, useMemo, useState } from "react";
import { Star, Clock, Plus, Minus } from "lucide-react";
import Footer from "../components/Footer";
import NavbarMain from "../components/NavbarMain";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../src/services/apiClient";

export default function RestaurantDetails() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [error, setError] = useState("");
  const [cart, setCart] = useState({});
  const [isAddingId, setIsAddingId] = useState(null);
  const navigate = useNavigate();
  const restaurantId = id;

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch(`/restaurants/${restaurantId}`);
        setRestaurant(data.restaurant);
        const menu = await apiFetch(`/restaurants/${restaurantId}/menu`);
        setMenuItems(menu.items || []);
      } catch (err) {
        setError(err.message || "Failed to load restaurant.");
      }
    };
    load();
  }, [restaurantId]);

  useEffect(() => {
    const loadCart = async () => {
      try {
        const payload = await apiFetch("/cart");
        const items = payload.items || [];
        const next = items.reduce((acc, item) => {
          acc[item.id] = item.quantity;
          return acc;
        }, {});
        setCart(next);
      } catch (_err) {
        // ignore cart load issues here
      }
    };
    loadCart();
  }, []);

  const cartByMenuItem = useMemo(() => {
    const map = {};
    menuItems.forEach((item) => {
      map[item.id] = cart[item.id] || 0;
    });
    return map;
  }, [cart, menuItems]);

  const addToCart = async (item) => {
    try {
      setIsAddingId(item.id);
      const payload = await apiFetch("/cart/items", {
        method: "POST",
        body: JSON.stringify({ menuItemId: item.id, quantity: 1 }),
      });

      if (payload?.item) {
        setCart((prev) => ({
          ...prev,
          [item.id]: payload.item.quantity,
        }));
      } else {
        setCart((prev) => ({
          ...prev,
          [item.id]: (prev[item.id] || 0) + 1,
        }));
      }
    } catch (err) {
      setError(err.message || "Failed to add item to cart.");
    } finally {
      setIsAddingId(null);
    }
  };

  const removeFromCart = async (item) => {
    try {
      if (!cart[item.id]) return;
      setIsAddingId(item.id);

      const nextQty = Math.max((cart[item.id] || 0) - 1, 0);

      const payload = await apiFetch(`/cart/items/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity: nextQty }),
      });

      if (!payload) {
        setCart((prev) => ({ ...prev, [item.id]: 0 }));
        return;
      }

      setCart((prev) => ({
        ...prev,
        [item.id]: payload.item.quantity,
      }));
    } catch (err) {
      setError(err.message || "Failed to update cart.");
    } finally {
      setIsAddingId(null);
    }
  };

  if (error) {
    return (
      <div className="p-20 text-center text-red-600">
        {error}
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="p-20 text-center text-gray-500">
        Restaurant not found
      </div>
    );
  }

  const totalItems = Object.values(cartByMenuItem).reduce((a, b) => a + b, 0);
  const totalPrice = menuItems.reduce(
    (total, item) => total + (cartByMenuItem[item.id] || 0) * item.price,
    0
  );

  return (
    <div className="flex flex-col min-h-screen text-gray-800 bg-gray-50">
      {/* Navbar */}
      <NavbarMain />

      {/* PAGE CONTENT */}
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* RESTAURANT HEADER */}
        <div className="mt-6 sm:mt-8 bg-white rounded-2xl shadow-sm overflow-hidden">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-52 sm:h-64 lg:h-72 object-cover"
          />

          <div className="p-5 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold">
              {restaurant.name}
            </h2>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4 text-sm text-gray-600">
              <div className="flex items-center gap-1 text-yellow-500">
                <Star size={14} />
                {restaurant.rating} (320)
              </div>

              <div className="flex items-center gap-1">
                <Clock size={14} />
                {restaurant.time}
              </div>

              <span>Delivery: {restaurant.fee}</span>

              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  restaurant.open
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {restaurant.open ? "Open Now" : "Closed"}
              </span>
            </div>
          </div>
        </div>

        {/* MENU SECTION */}
        <div className="mt-8 sm:mt-10">
          {/* CATEGORY TABS */}
          <div className="flex overflow-x-auto gap-6 border-b pb-3 text-sm font-medium scrollbar-hide">
            <button className="text-orange-600 border-b-2 border-orange-600 pb-2 whitespace-nowrap">
              Popular
            </button>
            <button className="whitespace-nowrap">Rice Dishes</button>
            <button className="whitespace-nowrap">Swallow</button>
            <button className="whitespace-nowrap">Drinks</button>
          </div>

          {/* MENU GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mt-6 sm:mt-8 pb-24">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition"
              >
                {/* TEXT SECTION */}
                <div className="flex-1">
                  <h3 className="font-semibold text-base sm:text-lg">
                    {item.name}
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    {item.description}
                  </p>

                  <p className="mt-3 font-bold text-orange-600">
                    ₦{item.price.toLocaleString()}
                  </p>

                  {cartByMenuItem[item.id] ? (
                    <div className="flex items-center gap-3 mt-4">
                      <button
                        onClick={() => removeFromCart(item)}
                        className="bg-gray-200 p-2 rounded-full disabled:opacity-60"
                        disabled={isAddingId === item.id}
                      >
                        <Minus size={14} />
                      </button>

                      <span>{cartByMenuItem[item.id]}</span>

                      <button
                        onClick={() => addToCart(item)}
                        className="bg-orange-500 text-white p-2 rounded-full disabled:opacity-60"
                        disabled={isAddingId === item.id}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(item)}
                      className="mt-4 bg-orange-500 text-white px-5 py-2 rounded-full text-sm hover:bg-orange-600 transition disabled:opacity-60"
                      disabled={isAddingId === item.id}
                    >
                      {isAddingId === item.id ? "Adding..." : "Add to Cart"}
                    </button>
                  )}
                </div>

                {/* IMAGE */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full sm:w-28 h-40 sm:h-28 object-cover rounded-xl"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CART BAR ABOVE FOOTER */}
      {totalItems > 0 && (
        <div className="bg-orange-600 text-white py-4 px-4 sm:px-10 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-lg">
          <span className="font-medium text-sm sm:text-base">
            View Cart ({totalItems} items) – ₦{totalPrice.toLocaleString()}
          </span>

          <button onClick={() => navigate('/cart')} className="bg-white text-orange-600 px-6 py-2 rounded-full font-semibold w-full sm:w-auto">
            Open Cart
          </button>
        </div>
      )}

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
