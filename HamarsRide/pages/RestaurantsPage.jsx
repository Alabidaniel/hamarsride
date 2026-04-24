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
    <div className="min-h-screen bg-[#f6f0e7] text-[#2f241b] flex flex-col">
      <NavbarMain />

      <div className="w-full max-w-[96rem] mx-auto px-4 sm:px-6 lg:px-8 flex-1 pb-16">
        <section className="mt-6 sm:mt-8 rounded-[2rem] border border-[#ded1bf] bg-gradient-to-br from-[#7c5a42] via-[#8e694d] to-[#b79272] px-6 py-8 text-[#fffaf4] shadow-[0_24px_80px_rgba(70,45,28,0.16)] sm:px-8 sm:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#f6e4cf]">
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
                ? "bg-[#7c5a42] text-[#fffaf4]"
                : "bg-[#fffdf9] text-[#5b4636] border border-[#e0d2c0]"
            }`}
          >
            Restaurants
          </button>
          <button
            onClick={() => navigate("/shops")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              isShopsPage
                ? "bg-[#7c5a42] text-[#fffaf4]"
                : "bg-[#fffdf9] text-[#5b4636] border border-[#e0d2c0]"
            }`}
          >
            Shops
          </button>
        </div>

        <section className="mt-5 rounded-[1.5rem] border border-[#e0d2c0] bg-[#fffdf9] p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
            <div className="flex items-center gap-3 rounded-xl border border-[#e0d2c0] bg-[#faf5ee] px-4 py-3">
              <Search size={18} className="text-[#8c735b]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`Search ${businessLabel.toLowerCase()} or meals...`}
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>

            <label className="flex items-center gap-2 rounded-xl border border-[#e0d2c0] px-4 py-3 text-sm text-[#5b4636]">
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
              className="rounded-xl border border-[#e0d2c0] bg-[#faf5ee] px-4 py-3 text-sm text-[#5b4636] outline-none"
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
                  className="rounded-full border border-[#ddccb8] bg-[#faf5ee] px-3 py-1.5 text-xs text-[#745e4b] transition hover:border-[#c2ab95]"
                >
                  {value}
                </button>
              ))}
            </div>
          ) : null}
        </section>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-[#6f5a48]">
          <p>
            {resultCount} {resultCount === 1 ? singularLabel : businessLabel.toLowerCase()} found
          </p>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-full border border-[#dccab5] bg-[#faf5ee] px-3 py-1.5 text-xs font-medium transition hover:border-[#c3ad97]"
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
            <div className="col-span-full rounded-2xl border border-[#e0d2c0] bg-[#fffdf9] p-6 text-sm text-[#7d6a59]">
              No {businessType}s found. Try changing your filters.
            </div>
          ) : null}

          {sortedList.map((restaurant) => (
            <button
              key={restaurant.id}
              type="button"
              onClick={() => navigate(`${detailsBasePath}/${restaurant.id}`)}
              className="group flex h-full flex-col rounded-[1.6rem] border border-[#e5d7c7] bg-[#fffdf9] p-5 text-left shadow-[0_16px_50px_rgba(72,52,33,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(72,52,33,0.13)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#876347] via-[#a07758] to-[#ccb090] text-sm font-semibold tracking-[0.25em] text-[#fffaf4] shadow-lg">
                    {getInitials(restaurant.name)}
                  </div>
                  <div className="min-w-0">
                    <h2 className="line-clamp-2 text-base font-semibold leading-snug text-[#2f241b]">
                      {restaurant.name}
                    </h2>
                    <p className="mt-1 text-xs text-[#7a6654]">
                      {isShopsPage ? "Shop" : "Restaurant"}
                    </p>
                  </div>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${
                    restaurant.open ? "bg-[#eef5ec] text-[#58704e]" : "bg-[#f1ece6] text-[#857466]"
                  }`}
                >
                  {restaurant.open ? "Open" : "Closed"}
                </span>
              </div>

              <div className="mt-5 rounded-[1.2rem] border border-[#eee3d5] bg-[#faf5ee] p-3.5">
                <div className="flex flex-wrap items-center gap-3 text-sm text-[#746150]">
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-[#b78858]" />
                    <span className="font-medium text-[#2f241b]">{restaurant.rating || "New"}</span>
                  </div>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#d3beaa]" />
                  <span className="flex items-center gap-1">
                    <Clock3 size={14} />
                    {restaurant.time || "Fast delivery"}
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#d3beaa]" />
                  <span>Delivery {restaurant.fee || "N/A"}</span>
                </div>
              </div>

              <div className="mt-auto pt-4">
                <span className="inline-flex items-center rounded-full bg-[#7d5b43] px-4 py-2 text-xs font-semibold tracking-[0.08em] text-[#fffaf4] transition group-hover:bg-[#6f503c]">
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
