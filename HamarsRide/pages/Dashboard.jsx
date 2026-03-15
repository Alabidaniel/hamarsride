import { Bell, Search, Phone, Package, FileText, Clock, MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import box from "../src/assets/box.png";
import Footer from "../components/Footer";
import NavbarMain from "../components/NavbarMain";
import { apiFetch } from "../src/services/apiClient";
import { auth } from "../src/firebase";

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeOrder, setActiveOrder] = useState(null);
  const [isLoadingActive, setIsLoadingActive] = useState(true);
  const [activeError, setActiveError] = useState("");
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const categories = [
    "Amala",
    "Pizza",
    "Fried Rice",
    "Chicken Rquie",
    "Chicken Republic",
  ];

  const actions = [
    { icon: Package, label: "New Delivery", subtitle: "Start a fresh order", path: "/new-delivery" },
    { icon: FileText, label: "Order History", subtitle: "View past requests", path: "/order-history" },
    { icon: Clock, label: "Saved Addresses", subtitle: "Manage locations", path: "/saved-addresses" },
    { icon: MapPin, label: "Delivered", subtitle: "Track completed orders", path: "/delivered-orders" },
  ];

  useEffect(() => {
    let isMounted = true;

    const loadActiveOrder = async () => {
      try {
        setIsLoadingActive(true);
        setActiveError("");
        const payload = await apiFetch("/orders/active");
        if (isMounted) {
          setActiveOrder(payload.order || null);
        }
      } catch (err) {
        console.error("Active order error:", err);
        if (isMounted) {
          setActiveError("");
          setActiveOrder(null);
        }
      } finally {
        if (isMounted) {
          setIsLoadingActive(false);
        }
      }
    };

    const loadRecentOrders = async () => {
      try {
        setIsLoadingOrders(true);
        const payload = await apiFetch("/orders");
        if (isMounted) {
          setRecentOrders(payload.orders || []);
        }
      } catch (err) {
        console.error("Recent orders error:", err);
        if (isMounted) {
          setRecentOrders([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingOrders(false);
        }
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!isMounted) return;
      if (!user) {
        setActiveOrder(null);
        setIsLoadingActive(false);
        return;
      }
      loadActiveOrder();
      loadRecentOrders();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const tracker = useMemo(() => {
    if (!activeOrder) {
      return {
        label: "No active order",
        badgeClass: "bg-gray-100 text-gray-600",
        progress: 0,
        steps: ["Pending", "Accepted", "Picked up", "Delivered"],
        currentIndex: -1,
      };
    }

    const status = activeOrder.status || "pending";
    const statusMap = {
      pending: { label: "Pending", index: 0 },
      accepted: { label: "Accepted", index: 1 },
      processing: { label: "Processing", index: 1 },
      picked_up: { label: "Picked up", index: 2 },
      delivered: { label: "Delivered", index: 3 },
      cancelled: { label: "Cancelled", index: -1 },
    };

    const current = statusMap[status] || statusMap.pending;
    const totalSteps = 4;
    const progress = current.index < 0 ? 0 : ((current.index + 1) / totalSteps) * 100;

    let badgeClass = "bg-orange-100 text-orange-700";
    if (status === "delivered") badgeClass = "bg-green-100 text-green-700";
    if (status === "cancelled") badgeClass = "bg-red-100 text-red-700";

    return {
      label: current.label,
      badgeClass,
      progress,
      steps: ["Pending", "Accepted", "Picked up", "Delivered"],
      currentIndex: current.index,
    };
  }, [activeOrder]);

  const statusBadge = (status) => {
    const value = (status || "pending").toLowerCase();
    if (value === "delivered") return "bg-green-100 text-green-600";
    if (value === "cancelled") return "bg-red-100 text-red-600";
    if (value === "processing" || value === "accepted" || value === "picked_up") {
      return "bg-orange-100 text-orange-600";
    }
    return "bg-gray-100 text-gray-600";
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* NAVBAR */}
        <NavbarMain />

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-6">
            {/* HERO */}
            <div className="bg-white rounded-2xl p-6 lg:p-8 flex flex-col lg:flex-row justify-between items-center gap-6">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold leading-snug">
                  Order food & <br />
                  Get it Delivered to your location<br />
                  fast and stress-free
                </h1>

                <button
                  onClick={() => navigate("/new-delivery")}
                  className="mt-4 sm:mt-6 bg-orange-500 text-white px-6 py-3 rounded-full font-semibold shadow"
                >
                  Create New Delivery
                </button>

                <div className="mt-4 sm:mt-6 bg-gray-100 px-4 py-2 rounded-full w-full sm:w-[420px] flex items-center">
                  <Search size={16} />
                  <input
                    placeholder="Search restaurants, meals, or cuisines"
                    className="bg-transparent outline-none ml-2 w-full text-sm"
                  />
                </div>
              </div>

              <img
                src={box}
                className="w-40 h-40 sm:w-60 sm:h-60 object-contain"
                alt="delivery box"
              />
            </div>

            {/* CATEGORIES */}
            <div className="flex gap-3 flex-wrap">
              {categories.map((item) => (
                <button
                  key={item}
                  className="px-4 py-2 border border-orange-500 text-orange-500 rounded-full text-sm"
                >
                  {item}
                </button>
              ))}
            </div>

            {/* FEATURED */}
            <div className="bg-white rounded-2xl p-4 sm:p-6">
              <h2 className="font-semibold mb-4 text-lg">Featured Restaurants</h2>

              <div className="flex gap-4 overflow-x-auto pb-2">
                <FoodCard title="Chicken Republic Chicken" fee="₦500 fee" img="/food.jpg" />
                <FoodCard title="Burger Rice Pot" fee="₦200 fee" img="/food.jpg" />
                <FoodCard title="Mama Rice Special" fee="Free" img="/food.jpg" />
              </div>
            </div>

            {/* RECENT ORDERS */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 overflow-x-auto">
              <h2 className="font-semibold mb-4 text-lg">Recent Orders</h2>
              {isLoadingOrders ? (
                <div className="text-sm text-gray-500">Loading orders...</div>
              ) : recentOrders.length === 0 ? (
                <div className="text-sm text-gray-500">No orders yet.</div>
              ) : (
                <table className="w-full text-sm min-w-[500px] sm:min-w-full">
                  <thead className="text-gray-500">
                    <tr>
                      <th className="px-2 py-1">Order ID</th>
                      <th className="px-2 py-1">Pickup Location</th>
                      <th className="px-2 py-1">Drop-off Location</th>
                      <th className="px-2 py-1">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="text-center">
                        <td>{order.id}</td>
                        <td>{order.pickup || "�"}</td>
                        <td>{order.dropoff || "�"}</td>
                        <td>
                          <span className={`px-3 py-1 rounded-full ${statusBadge(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-6">
            {/* TRACKER */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-gray-900">Active Order Tracking</h3>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${tracker.badgeClass}`}>
                  {isLoadingActive ? "Loading" : tracker.label}
                </span>
              </div>

              {activeError ? (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-4">
                  {activeError}
                </div>
              ) : null}

              <div className="h-2 bg-gray-100 rounded-full relative mb-6">
                <div
                  className="absolute left-0 top-0 h-2 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all"
                  style={{ width: `${tracker.progress}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-4 gap-2 text-[11px] sm:text-xs text-gray-500 mb-6">
                {tracker.steps.map((label, index) => (
                  <span
                    key={label}
                    className={tracker.currentIndex >= index ? "font-medium text-orange-600" : ""}
                  >
                    {label}
                  </span>
                ))}
              </div>

              {isLoadingActive ? (
                <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 text-sm text-gray-500">
                  Loading active order...
                </div>
              ) : !activeOrder ? (
                <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 text-sm text-gray-500">
                  No active order right now. Place a new delivery to start tracking.
                </div>
              ) : (
                <div className="rounded-xl bg-orange-50 border border-orange-100 px-4 py-3">
                  <p className="text-sm font-semibold text-gray-900">Order #{activeOrder.id}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {activeOrder.status === "delivered"
                      ? "Delivered"
                      : activeOrder.status === "cancelled"
                      ? "Cancelled"
                      : "On the way"}
                  </p>
                  <p className="text-xs text-gray-600 mt-2">
                    Drop-off: {activeOrder.address}
                  </p>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between text-sm">
                <p className="flex items-center gap-2 text-gray-700">
                  <Phone size={14} className="text-orange-500" /> Rider: Assigned soon
                </p>
                <button
                  className="text-orange-600 font-medium hover:text-orange-700 disabled:opacity-60"
                  disabled={!activeOrder}
                >
                  Contact
                </button>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {actions.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => navigate(item.path)}
                    className="text-left bg-gray-50 hover:bg-orange-50 border border-gray-100 hover:border-orange-200 rounded-xl p-4 transition"
                  >
                    <item.icon className="text-orange-500 mb-2" size={18} />
                    <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.subtitle}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}

function FoodCard({ title, fee, img }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate("/restaurants")}
      className="w-56 sm:w-60 flex-shrink-0 bg-gray-50 rounded-xl p-3 shadow-sm cursor-pointer hover:shadow-md transition"
    >
      <img src={img} alt="" className="rounded-lg mb-2 w-full h-36 object-cover" />

      <h3 className="font-semibold text-sm">{title}</h3>

      <p className="text-xs text-gray-500">⭐ 4.5 • 25 min</p>

      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-gray-500">{fee}</span>
        <span className="text-green-600 text-xs">Open</span>
      </div>
    </div>
  );
}
