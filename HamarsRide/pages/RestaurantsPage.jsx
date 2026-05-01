import React, { useEffect, useMemo, useState } from "react";
import { Clock3, Search, Star } from "lucide-react";
import Footer from "../components/Footer";
import NavbarMain from "../components/NavbarMain";
import { useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "../src/services/apiClient";

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

const quickSearches = ["Chicken", "Rice", "Pizza", "Burger", "Shawarma"];

const getComparableEta = (value = "") => {
  const match = String(value).match(/(\d+)/);
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
};

export default function RestaurantsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isShopsPage = location.pathname.startsWith("/shops");
  const businessType = isShopsPage ? "shop" : "restaurant";
  const businessLabel = isShopsPage ? "Shops" : "Restaurants";
  const singularLabel = isShopsPage ? "shop" : "restaurant";
  const apiPath = isShopsPage ? "/shops" : "/restaurants";
  const detailsBasePath = isShopsPage ? "/shops" : "/restaurants";

  const [list, setList] = useState([]);
  const [error, setError] = useState("");
  const [query, setQuery] = useState(() => new URLSearchParams(location.search).get("q") || "");
  const [openOnly, setOpenOnly] = useState(false);
  const [sortBy, setSortBy] = useState("recommended");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const nextQuery = new URLSearchParams(location.search).get("q") || "";
    setQuery(nextQuery);
  }, [location.search]);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError("");
        const params = new URLSearchParams();
        if (query.trim()) params.set("q", query.trim());
        if (openOnly) params.set("open", "true");
        const path = params.toString() ? `${apiPath}?${params.toString()}` : apiPath;
        const payload = await apiFetch(path);
        setList(payload.businesses || payload.restaurants || payload.shops || []);
      } catch (err) {
        setError(err.message || `Failed to load ${businessType}s.`);
      } finally {
        setIsLoading(false);
      }
    };

    const handler = setTimeout(load, 250);
    return () => clearTimeout(handler);
  }, [apiPath, businessType, openOnly, query]);

  const sortedList = useMemo(() => {
    const copy = [...list];
    if (sortBy === "rating") {
      copy.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    } else if (sortBy === "eta") {
      copy.sort((a, b) => getComparableEta(a.time) - getComparableEta(b.time));
    } else if (sortBy === "name") {
      copy.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
    }
    return copy;
  }, [list, sortBy]);

  const resultCount = sortedList.length;
  const hasActiveFilters = query.trim() || openOnly || sortBy !== "recommended";

  const clearFilters = () => {
    setQuery("");
    setOpenOnly(false);
    setSortBy("recommended");
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <NavbarMain />

      <div className="w-full max-w-[96rem] mx-auto px-4 sm:px-6 lg:px-8 flex-1 pb-16">
        <section className="mt-6 sm:mt-8 rounded-[2rem] border border-orange-200 bg-gradient-to-br from-orange-700 via-orange-600 to-orange-300 px-6 py-8 text-white shadow-sm sm:px-8 sm:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-50/90">
            Simpler Ordering
          </p>
          <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl">
            Find a {singularLabel} and order in 3 easy steps
          </h1>
          <div className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">1. Choose a {singularLabel}</div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">2. Add items to your cart</div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">3. Checkout and pay</div>
          </div>
        </section>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate("/restaurants")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              !isShopsPage
                ? "bg-orange-600 text-white"
                : "bg-white text-gray-700 border border-orange-200 hover:bg-orange-50"
            }`}
          >
            Restaurants
          </button>
          <button
            onClick={() => navigate("/shops")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              isShopsPage
                ? "bg-orange-600 text-white"
                : "bg-white text-gray-700 border border-orange-200 hover:bg-orange-50"
            }`}
          >
            Shops
          </button>
        </div>

        <section className="mt-5 rounded-[1.5rem] border border-orange-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
            <div className="flex items-center gap-3 rounded-xl border border-orange-200 bg-white px-4 py-3">
              <Search size={18} className="text-orange-600" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`Search ${businessLabel.toLowerCase()} or meals...`}
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>

            <label className="flex items-center gap-2 rounded-xl border border-orange-200 px-4 py-3 text-sm text-gray-700 bg-white">
              <input
                type="checkbox"
                className="accent-orange-600"
                checked={openOnly}
                onChange={(event) => setOpenOnly(event.target.checked)}
              />
              Open now
            </label>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none"
            >
              <option value="recommended">Sort: Recommended</option>
              <option value="rating">Sort: Highest rated</option>
              <option value="eta">Sort: Fastest delivery</option>
              <option value="name">Sort: Name (A-Z)</option>
            </select>
          </div>

          {!isShopsPage ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {quickSearches.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setQuery(value)}
                  className="rounded-full border border-orange-200 bg-white px-3 py-1.5 text-xs text-orange-700 transition hover:bg-orange-50"
                >
                  {value}
                </button>
              ))}
            </div>
          ) : null}
        </section>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600">
          <p>
            {resultCount} {resultCount === 1 ? singularLabel : businessLabel.toLowerCase()} found
          </p>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-full border border-orange-200 bg-white px-3 py-1.5 text-xs font-medium transition hover:bg-orange-50"
            >
              Clear filters
            </button>
          ) : null}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 pb-16 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {error ? <div className="col-span-full text-sm text-red-600">{error}</div> : null}
          {isLoading ? (
            <div className="col-span-full text-sm text-gray-500">Loading {businessType}s...</div>
          ) : sortedList.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-orange-200 bg-white p-6 text-sm text-gray-600">
              No {businessType}s found. Try changing your filters.
            </div>
          ) : null}

          {sortedList.map((restaurant) => (
            <button
              key={restaurant.id}
              type="button"
              onClick={() => navigate(`${detailsBasePath}/${restaurant.id}`)}
              className="group flex h-full flex-col rounded-[1.6rem] border border-orange-200 bg-white p-5 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-700 via-orange-600 to-orange-300 text-sm font-semibold tracking-[0.25em] text-white shadow-sm">
                    {getInitials(restaurant.name)}
                  </div>
                  <div className="min-w-0">
                    <h2 className="line-clamp-2 text-base font-semibold leading-snug text-gray-900">
                      {restaurant.name}
                    </h2>
                    <p className="mt-1 text-xs text-gray-500">
                      {isShopsPage ? "Shop" : "Restaurant"}
                    </p>
                  </div>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${
                    restaurant.open ? "bg-orange-50 text-orange-700 border border-orange-200" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {restaurant.open ? "Open" : "Closed"}
                </span>
              </div>

              <div className="mt-5 rounded-[1.2rem] border border-orange-200 bg-orange-50/40 p-3.5">
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-orange-500" />
                    <span className="font-medium text-gray-900">{restaurant.rating || "New"}</span>
                  </div>
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-200" />
                  <span className="flex items-center gap-1">
                    <Clock3 size={14} />
                    {restaurant.time || "Fast delivery"}
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-200" />
                  <span>Delivery {restaurant.fee || "N/A"}</span>
                </div>
              </div>

              <div className="mt-auto pt-4">
                <span className="inline-flex items-center rounded-full bg-orange-600 px-4 py-2 text-xs font-semibold tracking-[0.08em] text-white transition group-hover:bg-orange-700">
                  {isShopsPage ? "Open catalog" : "Open menu"}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
