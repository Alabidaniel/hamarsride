import React, { useEffect, useState } from "react";
import { Star, ChevronDown, Search } from "lucide-react";
import Footer from "../components/Footer";
import NavbarMain from "../components/NavbarMain";
import { useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "../src/services/apiClient";

const getInitials = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

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
  const [query, setQuery] = useState("");
  const [openOnly, setOpenOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const resultCount = list.length;

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

    const handler = setTimeout(load, 300);
    return () => clearTimeout(handler);
  }, [apiPath, businessType, openOnly, query]);

  return (
    <div className="min-h-screen bg-[#f6f0e7] text-[#2f241b] flex flex-col">
      <NavbarMain />

      <div className="w-full max-w-[96rem] mx-auto px-4 sm:px-6 lg:px-8 flex-1 pb-16">
        <section className="mt-6 sm:mt-8 grid gap-6 rounded-[2rem] border border-[#ded1bf] bg-gradient-to-br from-[#7c5a42] via-[#8e694d] to-[#b79272] px-6 py-8 text-[#fffaf4] shadow-[0_24px_80px_rgba(70,45,28,0.16)] sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(260px,0.7fr)] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#f6e4cf]">
              Curated Selection
            </p>
            <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
              {businessLabel} with a cleaner, more refined ordering experience
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#f8eee3] sm:text-base">
              {isShopsPage
                ? "Browse dependable essentials and household picks in a polished catalog designed for quick decisions."
                : "Explore menus through a more editorial, premium layout that puts the food details first."}
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#f8eee3]">
              Results
            </p>
            <div className="mt-3 flex items-end justify-between gap-4">
              <div>
                <p className="text-4xl font-semibold leading-none text-[#fffaf4]">{resultCount}</p>
                <p className="mt-2 text-sm text-[#f8eee3]">
                  {resultCount === 1 ? `${singularLabel} available` : `${businessLabel} available`}
                </p>
              </div>
              <div className="text-right text-sm text-[#f8eee3]">
                <p>{openOnly ? "Open now filter active" : "All listings shown"}</p>
                <p className="mt-1">Search updates results live</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="flex items-center gap-3 rounded-2xl border border-[#e0d2c0] bg-[#fffdf9] px-4 py-3 shadow-sm">
            <Search size={18} className="text-[#8c735b]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${businessType}s...`}
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-3 lg:justify-end">
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
        </div>

        <div className="mt-6 flex flex-col gap-4 rounded-[1.5rem] border border-[#e0d2c0] bg-[#fffdf9] p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button className="flex items-center justify-between gap-2 rounded-xl border border-[#e0d2c0] bg-[#fffdf9] px-4 py-2 text-sm text-[#5b4636] shadow-sm transition hover:border-[#ccb99f] sm:justify-center">
              Cuisine
              <ChevronDown size={16} />
            </button>
            <button className="flex items-center justify-between gap-2 rounded-xl border border-[#e0d2c0] bg-[#fffdf9] px-4 py-2 text-sm text-[#5b4636] shadow-sm transition hover:border-[#ccb99f] sm:justify-center">
              Sort by
              <ChevronDown size={16} />
            </button>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-sm text-[#5b4636]">
            <input
              type="checkbox"
              className="accent-orange-600"
              checked={openOnly}
              onChange={(event) => setOpenOnly(event.target.checked)}
            />
            Open now
          </label>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 pb-16 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {error ? <div className="col-span-full text-sm text-red-600">{error}</div> : null}
          {isLoading ? (
            <div className="col-span-full text-sm text-gray-500">Loading {businessType}s...</div>
          ) : list.length === 0 ? (
            <div className="col-span-full text-sm text-gray-500">No {businessType}s available.</div>
          ) : null}

          {list.map((restaurant) => (
            <button
              key={restaurant.id}
              type="button"
              onClick={() => navigate(`${detailsBasePath}/${restaurant.id}`)}
              className="group flex h-full flex-col rounded-[2rem] border border-[#e5d7c7] bg-[#fffdf9] p-5 text-left shadow-[0_16px_50px_rgba(72,52,33,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(72,52,33,0.13)] sm:p-6"
            >
              <div className="flex items-start justify-between gap-3 sm:gap-4">
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#876347] via-[#a07758] to-[#ccb090] text-lg font-semibold tracking-[0.25em] text-[#fffaf4] shadow-lg sm:h-16 sm:w-16">
                    {getInitials(restaurant.name)}
                  </div>
                  <div className="min-w-0">
                    <span className="inline-flex rounded-full bg-[#f4ebdf] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8b6748]">
                      {singularLabel}
                    </span>
                    <h2 className="mt-3 line-clamp-2 text-lg font-semibold leading-snug text-[#2f241b]">
                      {restaurant.name}
                    </h2>
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

              <div className="mt-6 rounded-[1.5rem] border border-[#eee3d5] bg-[#faf5ee] p-4">
                <div className="flex flex-wrap items-center gap-3 text-sm text-[#746150]">
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-[#b78858]" />
                    <span className="font-medium text-[#2f241b]">{restaurant.rating}</span>
                  </div>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#d3beaa]" />
                  <span>{restaurant.time}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#d3beaa]" />
                  <span>Delivery {restaurant.fee}</span>
                </div>
              </div>

              <div className="mt-auto flex items-center justify-between pt-5">
                <span className="text-sm text-[#7d6a59]">
                  {isShopsPage ? "View catalog" : "View menu"}
                </span>
                <span className="text-sm font-semibold tracking-[0.2em] uppercase text-[#8b6748] transition group-hover:translate-x-1">
                  Enter
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
