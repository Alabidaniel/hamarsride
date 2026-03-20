import React, { useEffect, useState } from "react";
import { Star, ChevronDown, Search } from "lucide-react";
import Footer from "../components/Footer";
import NavbarMain from "../components/NavbarMain";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../src/services/apiClient";

export default function RestaurantsPage() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [openOnly, setOpenOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError("");
        const params = new URLSearchParams();
        if (query.trim()) params.set("q", query.trim());
        if (openOnly) params.set("open", "true");
        const path = params.toString() ? `/restaurants?${params.toString()}` : "/restaurants";
        const payload = await apiFetch(path);
        setList(payload.restaurants || []);
      } catch (err) {
        setError(err.message || "Failed to load restaurants.");
      } finally {
        setIsLoading(false);
      }
    };

    const handler = setTimeout(load, 300);
    return () => clearTimeout(handler);
  }, [query, openOnly]);

  return (
    <div className="min-h-screen bg-gray-50 font-[Inter] text-gray-800 flex flex-col">
      <NavbarMain />

      {/* PAGE CONTENT WRAPPER */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1">
        
        {/* HEADER */}
        <div className="mt-6 sm:mt-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900">
            Restaurants Near You
          </h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Discover your favorite meals
          </p>
        </div>

        {/* SEARCH */}
        <div className="mt-6 flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
          <Search size={18} className="text-gray-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search restaurants..."
            className="w-full outline-none text-sm"
          />
        </div>

        {/* FILTER BAR */}
        <div className="mt-6 flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:items-center">
          
          {/* Cuisine */}
          <button className="flex justify-between sm:justify-center items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-200 w-full sm:w-auto">
            Cuisine
            <ChevronDown size={16} />
          </button>

          {/* Sort */}
          <button className="flex justify-between sm:justify-center items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-200 w-full sm:w-auto">
            Sort by
            <ChevronDown size={16} />
          </button>

          {/* Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="checkbox"
              className="accent-orange-600"
              checked={openOnly}
              onChange={(event) => setOpenOnly(event.target.checked)}
            />
            Open now
          </label>
        </div>

        {/* RESTAURANT GRID */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pb-16">
          {error ? (
            <div className="col-span-full text-sm text-red-600">{error}</div>
          ) : null}
          {isLoading ? (
            <div className="col-span-full text-sm text-gray-500">Loading restaurants...</div>
          ) : list.length === 0 ? (
            <div className="col-span-full text-sm text-gray-500">No restaurants available.</div>
          ) : null}
          {list.map((restaurant) => (
            <div
              key={restaurant.id}
              onClick={() => navigate(`/restaurants/${restaurant.id}`)}
              className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
            >
              <img
                src={restaurant.image}
                alt={restaurant.name}
                className="w-full h-44 sm:h-48 object-cover"
              />

              <div className="p-4 sm:p-5">
                <div className="flex justify-between items-start gap-2">
                  <h2 className="text-base sm:text-lg font-semibold leading-snug">
                    {restaurant.name}
                  </h2>

                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap ${
                      restaurant.open
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {restaurant.open ? "Open" : "Closed"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-600">
                  
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-amber-500" />
                    {restaurant.rating}
                  </div>

                  <span>{restaurant.time}</span>

                  <span className="whitespace-nowrap">
                    Delivery: {restaurant.fee}
                  </span>

                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
