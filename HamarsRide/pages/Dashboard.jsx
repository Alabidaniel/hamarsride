import { Search, Package, FileText, Clock, MapPin, Star, Store } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import box from "../src/assets/box.png";
import Footer from "../components/Footer";
import NavbarMain from "../components/NavbarMain";
import { apiFetch } from "../src/services/apiClient";
import { auth } from "../src/firebase";
import { API_BASE_URL } from "../src/config";

export default function Dashboard() {
  const navigate = useNavigate();
  const [heroSearch, setHeroSearch] = useState("");
  const [activeOrder, setActiveOrder] = useState(null);
  const [isLoadingActive, setIsLoadingActive] = useState(true);
  const [activeError, setActiveError] = useState("");
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [featuredRestaurants, setFeaturedRestaurants] = useState([]);
  const [featuredShops, setFeaturedShops] = useState([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);
  const [featuredError, setFeaturedError] = useState("");
  const categories = ["Rice", "Pizza", "Chicken", "Burger", "Shawarma"];
  const getInitials = (name = "") =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  const renderFeaturedCards = (items, basePath) =>
    items.slice(0, 6).map((business) => (
      <div
        key={business.id}
        onClick={() => navigate(`${basePath}/${business.id}`)}
        className="w-56 sm:w-60 flex-shrink-0 rounded-[1.6rem] border border-[#e5d7c7] bg-[#fffdf9] p-4 shadow-[0_14px_35px_rgba(72,52,33,0.08)] cursor-pointer hover:shadow-[0_18px_42px_rgba(72,52,33,0.12)] transition"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#876347] to-[#c7a17f] text-sm font-semibold tracking-[0.2em] text-[#fffaf4]">
          {getInitials(business.name)}
        </div>

        <h3 className="mt-4 font-semibold text-sm">{business.name}</h3>

        <p className="text-xs text-gray-500 flex items-center gap-1 mt-2">
          <Star size={12} className="text-[#b78858]" />
          {business.rating} - {business.time}
        </p>

        <div className="flex justify-between items-center mt-4">
          <span className="text-xs text-gray-500">{business.fee}</span>
          <span className={`text-xs ${business.open ? "text-green-600" : "text-gray-400"}`}>
            {business.open ? "Open" : "Closed"}
          </span>
        </div>
      </div>
    ));

  const actions = [
    { icon: Package, label: "Order Food", subtitle: "Start a fresh food order", path: "/restaurants" },
    { icon: Store, label: "Browse Shops", subtitle: "Get groceries and essentials", path: "/shops" },
    { icon: FileText, label: "Order History", subtitle: "View past requests", path: "/order-history" },
    { icon: Clock, label: "Saved Addresses", subtitle: "Manage delivery locations", path: "/saved-addresses" },
    { icon: MapPin, label: "Delivered", subtitle: "See completed deliveries", path: "/delivered-orders" },
  ];

  useEffect(() => {
    let isMounted = true;
    let refreshTimer = null;

    const buildPublicUrl = (path) => {
      if (path.startsWith("http")) return path;
      return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
    };

    const loadFeatured = async () => {
      try {
        setIsLoadingFeatured(true);
        setFeaturedError("");
        const [restaurantsResponse, shopsResponse] = await Promise.all([
          fetch(buildPublicUrl("/restaurants")),
          fetch(buildPublicUrl("/shops")),
        ]);

        const restaurantsPayload = await restaurantsResponse.json().catch(() => ({}));
        const shopsPayload = await shopsResponse.json().catch(() => ({}));

        if (!restaurantsResponse.ok) {
          throw new Error(restaurantsPayload.error || restaurantsPayload.message || "Failed to load restaurants.");
        }

        if (!shopsResponse.ok) {
          throw new Error(shopsPayload.error || shopsPayload.message || "Failed to load shops.");
        }

        if (isMounted) {
          setFeaturedRestaurants(restaurantsPayload.businesses || restaurantsPayload.restaurants || []);
          setFeaturedShops(shopsPayload.businesses || shopsPayload.shops || []);
        }
      } catch (err) {
        if (isMounted) {
          setFeaturedError(err.message || "Failed to load featured businesses.");
          setFeaturedRestaurants([]);
          setFeaturedShops([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingFeatured(false);
        }
      }
    };

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

    loadFeatured();
    refreshTimer = setInterval(() => {
      if (!isMounted) return;
      loadActiveOrder();
      loadRecentOrders();
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(refreshTimer);
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

    const status = activeOrder.rejectionReason ? "rejected" : activeOrder.status || "pending";
    const statusMap = {
      pending: { label: "Pending", index: 0 },
      accepted: { label: "Accepted", index: 1 },
      processing: { label: "Processing", index: 1 },
      picked_up: { label: "Picked up", index: 2 },
      delivered: { label: "Delivered", index: 3 },
      rejected: { label: "Rejected", index: -1 },
      cancelled: { label: "Cancelled", index: -1 },
    };

    const current = statusMap[status] || statusMap.pending;
    const totalSteps = 4;
    const progress = current.index < 0 ? 0 : ((current.index + 1) / totalSteps) * 100;

    let badgeClass = "bg-orange-100 text-orange-700";
    if (status === "delivered") badgeClass = "bg-green-100 text-green-700";
    if (status === "rejected") badgeClass = "bg-red-100 text-red-700";
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
    if (value === "rejected") return "bg-red-100 text-red-600";
    if (value === "cancelled") return "bg-red-100 text-red-600";
    if (value === "processing" || value === "accepted" || value === "picked_up") {
      return "bg-orange-100 text-orange-600";
    }
    return "bg-gray-100 text-gray-600";
  };

  return (
    <div className="min-h-screen bg-[#f6f0e7] p-4 text-[#2f241b] sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <NavbarMain />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-[2rem] border border-[#e5d7c7] bg-[#fffdf9] p-6 lg:p-8 flex flex-col lg:flex-row justify-between items-center gap-6 shadow-[0_20px_60px_rgba(72,52,33,0.08)]">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold leading-snug">
                  Ordering made easy <br />
                  Pick your meal, checkout, and track delivery
                </h1>

                <div className="mt-4 sm:mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate("/restaurants")}
                    className="bg-[#8a684d] text-[#fffaf4] px-6 py-3 rounded-full font-semibold shadow"
                  >
                    Browse Restaurants
                  </button>
                  <button
                    onClick={() => navigate("/shops")}
                    className="bg-[#faf5ee] text-[#8b6748] border border-[#d8c8b5] px-6 py-3 rounded-full font-semibold"
                  >
                    Browse Shops
                  </button>
                </div>

                <div className="mt-4 grid gap-2 text-sm sm:grid-cols-3 sm:max-w-[520px]">
                  <div className="rounded-xl border border-[#e2d3c1] bg-[#faf5ee] px-3 py-2">1. Browse restaurants</div>
                  <div className="rounded-xl border border-[#e2d3c1] bg-[#faf5ee] px-3 py-2">2. Add to cart</div>
                  <div className="rounded-xl border border-[#e2d3c1] bg-[#faf5ee] px-3 py-2">3. Checkout</div>
                </div>

                <div className="mt-4 sm:mt-5 bg-[#faf5ee] border border-[#e2d3c1] px-4 py-2 rounded-full w-full sm:w-[420px] flex items-center">
                  <Search size={16} />
                  <input
                    value={heroSearch}
                    onChange={(event) => setHeroSearch(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        const q = heroSearch.trim();
                        navigate(q ? `/restaurants?q=${encodeURIComponent(q)}` : "/restaurants");
                      }
                    }}
                    placeholder="Search restaurants, shops, meals, or groceries"
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

            <div className="flex gap-3 flex-wrap">
              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => navigate(`/restaurants?q=${encodeURIComponent(item)}`)}
                  className="px-4 py-2 border border-[#d8c8b5] text-[#8b6748] bg-[#faf5ee] rounded-full text-sm"
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="rounded-[2rem] border border-[#e5d7c7] bg-[#fffdf9] p-4 sm:p-6 shadow-[0_16px_45px_rgba(72,52,33,0.06)]">
              <h2 className="font-semibold mb-4 text-lg">Featured Restaurants</h2>

              <div className="flex gap-4 overflow-x-auto pb-2">
                {isLoadingFeatured ? (
                  <div className="text-sm text-gray-500">Loading restaurants...</div>
                ) : featuredError ? (
                  <div className="text-sm text-red-600">{featuredError}</div>
                ) : featuredRestaurants.length === 0 ? (
                  <div className="text-sm text-gray-500">No restaurants available.</div>
                ) : (
                  renderFeaturedCards(featuredRestaurants, "/restaurants")
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-[#e5d7c7] bg-[#fffdf9] p-4 sm:p-6 shadow-[0_16px_45px_rgba(72,52,33,0.06)]">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h2 className="font-semibold text-lg">Featured Shops</h2>
                <button
                  onClick={() => navigate("/shops")}
                  className="text-sm font-medium text-[#8b6748] hover:text-[#6f503c]"
                >
                  View all shops
                </button>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2">
                {isLoadingFeatured ? (
                  <div className="text-sm text-gray-500">Loading shops...</div>
                ) : featuredError ? (
                  <div className="text-sm text-red-600">{featuredError}</div>
                ) : featuredShops.length === 0 ? (
                  <div className="text-sm text-gray-500">No shops available.</div>
                ) : (
                  renderFeaturedCards(featuredShops, "/shops")
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-[#e5d7c7] bg-[#fffdf9] p-4 sm:p-6 overflow-x-auto shadow-[0_16px_45px_rgba(72,52,33,0.06)]">
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
                        <td>{order.pickup || "-"}</td>
                        <td>{order.dropoff || "-"}</td>
                        <td>
                          <div className="flex flex-col items-center gap-1">
                            <span className={`px-3 py-1 rounded-full ${statusBadge(order.rejectionReason ? "rejected" : order.status)}`}>
                              {order.rejectionReason ? "rejected" : order.status}
                            </span>
                            {order.rejectionReason ? (
                              <span className="text-[11px] text-red-600 max-w-[180px]">
                                {order.rejectionReason}
                              </span>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-[#e5d7c7] bg-[#fffdf9] p-5 sm:p-6 shadow-[0_16px_45px_rgba(72,52,33,0.06)]">
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
                  className="absolute left-0 top-0 h-2 bg-gradient-to-r from-[#8a684d] to-[#b89574] rounded-full transition-all"
                  style={{ width: `${tracker.progress}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-4 gap-2 text-[11px] sm:text-xs text-gray-500 mb-6">
                {tracker.steps.map((label, index) => (
                  <span
                    key={label}
                    className={tracker.currentIndex >= index ? "font-medium text-[#8b6748]" : ""}
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
                <div className="rounded-xl bg-[#f1e7db] border border-[#d8c8b5] px-4 py-3">
                  <p className="text-sm font-semibold text-gray-900">Order #{activeOrder.id}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {((activeOrder.rejectionReason ? "rejected" : activeOrder.status) || "pending") === "delivered"
                      ? "Delivered"
                      : ((activeOrder.rejectionReason ? "rejected" : activeOrder.status) || "pending") === "rejected"
                      ? "Rejected"
                      : ((activeOrder.rejectionReason ? "rejected" : activeOrder.status) || "pending") === "cancelled"
                      ? "Cancelled"
                      : "On the way"}
                  </p>
                  {activeOrder.rejectionReason ? (
                    <p className="text-xs text-red-600 mt-2">
                      Reason: {activeOrder.rejectionReason}
                    </p>
                  ) : null}
                  <p className="text-xs text-gray-600 mt-2">
                    Drop-off: {activeOrder.address}
                  </p>
                </div>
              )}

            </div>

            <div className="rounded-[2rem] border border-[#e5d7c7] bg-[#fffdf9] p-5 sm:p-6 shadow-[0_16px_45px_rgba(72,52,33,0.06)]">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {actions.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => navigate(item.path)}
                    className="text-left bg-[#faf5ee] hover:bg-[#f1e7db] border border-[#e2d3c1] rounded-xl p-4 transition"
                  >
                    <item.icon className="text-[#8b6748] mb-2" size={18} />
                    <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.subtitle}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
