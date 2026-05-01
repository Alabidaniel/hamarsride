import React, { useEffect, useMemo, useState } from "react";
import { Clock3, Minus, Plus, Search, Star } from "lucide-react";
import Footer from "../components/Footer";
import NavbarMain from "../components/NavbarMain";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../src/services/apiClient";

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

export default function RestaurantDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isShopsPage = location.pathname.startsWith("/shops");
  const businessLabel = isShopsPage ? "Shop" : "Restaurant";
  const businessPath = isShopsPage ? "/shops" : "/restaurants";

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState({});
  const [structuredMenu, setStructuredMenu] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [menuSearch, setMenuSearch] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState({});
  const [isUpdatingItemId, setIsUpdatingItemId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError("");
        const data = await apiFetch(`${businessPath}/${id}`);
        setRestaurant(data.restaurant);
        const menu = await apiFetch(`${businessPath}/${id}/menu`);
        setMenuItems(menu.items || []);
        setCategories(menu.categories || {});
        setStructuredMenu(menu.structuredMenu || {});
      } catch (err) {
        setError(err.message || `Failed to load ${businessLabel.toLowerCase()}.`);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [businessLabel, businessPath, id]);

  useEffect(() => {
    const loadCart = async () => {
      try {
        const payload = await apiFetch("/cart");
        const items = payload.items || [];
        const next = items.reduce((acc, item) => {
          if (!item.menuItemId) return acc;
          acc[item.menuItemId] = { qty: item.quantity, cartItemId: item.id };
          return acc;
        }, {});
        setCart(next);
      } catch (_err) {
        // Ignore cart loading errors on this page.
      }
    };
    loadCart();
  }, []);

  const menuItemsById = useMemo(
    () =>
      menuItems.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {}),
    [menuItems]
  );

  const cartByMenuItem = useMemo(() => {
    const map = {};
    menuItems.forEach((item) => {
      map[item.id] = cart[item.id]?.qty || 0;
    });
    return map;
  }, [cart, menuItems]);

  const categoryEntries = useMemo(() => {
    if (Object.keys(structuredMenu || {}).length) {
      return Object.entries(structuredMenu).map(([category, itemGroups]) => [
        category,
        Object.entries(itemGroups).map(([itemName, variants]) => ({
          itemName,
          variants,
        })),
      ]);
    }

    if (Object.keys(categories || {}).length) {
      return Object.entries(categories).map(([category, items]) => [
        category,
        items.map((item) => ({
          itemName: item.name,
          variants: [
            {
              id: item.id,
              variant: null,
              description: item.description ?? null,
              price: item.price,
              isOrderable: item.price > 0,
            },
          ],
        })),
      ]);
    }

    return menuItems.length
      ? [
          [
            "Menu",
            menuItems.map((item) => ({
              itemName: item.name,
              variants: [
                {
                  id: item.id,
                  variant: null,
                  description: item.description ?? null,
                  price: item.price,
                  isOrderable: item.price > 0,
                },
              ],
            })),
          ],
        ]
      : [];
  }, [categories, menuItems, structuredMenu]);

  const categoryTabs = useMemo(
    () => ["All", ...categoryEntries.map(([category]) => category)],
    [categoryEntries]
  );

  useEffect(() => {
    if (!categoryTabs.includes(selectedCategory)) {
      setSelectedCategory("All");
    }
  }, [categoryTabs, selectedCategory]);

  const filteredCategoryEntries = useMemo(() => {
    const source =
      selectedCategory === "All"
        ? categoryEntries
        : categoryEntries.filter(([category]) => category === selectedCategory);

    const normalizedQuery = menuSearch.trim().toLowerCase();
    if (!normalizedQuery) return source;

    return source
      .map(([category, items]) => {
        const filteredItems = items.filter(({ itemName, variants }) => {
          const nameMatch = String(itemName).toLowerCase().includes(normalizedQuery);
          if (nameMatch) return true;
          return variants.some((variantEntry) => {
            const variantName = String(variantEntry.variant || "").toLowerCase();
            const description = String(variantEntry.description || "").toLowerCase();
            return (
              variantName.includes(normalizedQuery) ||
              description.includes(normalizedQuery)
            );
          });
        });

        return [category, filteredItems];
      })
      .filter(([, items]) => items.length > 0);
  }, [categoryEntries, menuSearch, selectedCategory]);

  const totalItems = Object.values(cartByMenuItem).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = menuItems.reduce(
    (sum, item) => sum + (cartByMenuItem[item.id] || 0) * (item.price || 0),
    0
  );

  const addToCart = async (item) => {
    try {
      setIsUpdatingItemId(item.id);
      const payload = await apiFetch("/cart/items", {
        method: "POST",
        body: JSON.stringify({ menuItemId: item.id, quantity: 1 }),
      });

      if (payload?.item) {
        setCart((prev) => ({
          ...prev,
          [item.id]: {
            qty: payload.item.quantity,
            cartItemId: payload.item.id,
          },
        }));
        return;
      }

      setCart((prev) => ({
        ...prev,
        [item.id]: {
          qty: (prev[item.id]?.qty || 0) + 1,
          cartItemId: prev[item.id]?.cartItemId,
        },
      }));
    } catch (err) {
      setError(err.message || "Failed to add item to cart.");
    } finally {
      setIsUpdatingItemId(null);
    }
  };

  const removeFromCart = async (item) => {
    try {
      const entry = cart[item.id];
      if (!entry) return;

      setIsUpdatingItemId(item.id);
      const nextQty = Math.max((entry.qty || 0) - 1, 0);

      if (nextQty <= 0) {
        await apiFetch(`/cart/items/${entry.cartItemId}`, { method: "DELETE" });
        setCart((prev) => {
          const next = { ...prev };
          delete next[item.id];
          return next;
        });
        return;
      }

      const payload = await apiFetch(`/cart/items/${entry.cartItemId}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity: nextQty }),
      });

      if (!payload?.item) {
        setCart((prev) => {
          const next = { ...prev };
          delete next[item.id];
          return next;
        });
        return;
      }

      setCart((prev) => ({
        ...prev,
        [item.id]: {
          qty: payload.item.quantity,
          cartItemId: payload.item.id,
        },
      }));
    } catch (err) {
      setError(err.message || "Failed to update cart.");
    } finally {
      setIsUpdatingItemId(null);
    }
  };

  if (error) {
    return <div className="p-20 text-center text-red-600">{error}</div>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white text-gray-900">
        <NavbarMain />
        <div className="mx-auto max-w-6xl px-4 py-12 text-sm text-gray-600">Loading menu...</div>
      </div>
    );
  }

  if (!restaurant) {
    return <div className="p-20 text-center text-gray-500">{businessLabel} not found</div>;
  }

  const emptyStateLabel = isShopsPage ? "Catalog coming soon." : "Menu coming soon.";

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <NavbarMain />

      <div className="mx-auto flex-1 w-full max-w-6xl px-4 sm:px-6 lg:px-8 pb-32">
        <section className="mt-6 rounded-[1.8rem] border border-orange-200 bg-gradient-to-br from-orange-700 via-orange-600 to-orange-300 px-5 py-7 text-white shadow-sm sm:px-8 sm:py-9">
          <button
            type="button"
            onClick={() => navigate(isShopsPage ? "/shops" : "/restaurants")}
            className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium transition hover:bg-white/20"
          >
            Back to {isShopsPage ? "shops" : "restaurants"}
          </button>

          <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-lg font-semibold tracking-[0.25em] text-white">
                {getInitials(restaurant.name)}
              </div>
              <h1 className="mt-4 break-words text-3xl font-semibold leading-tight sm:text-4xl">{restaurant.name}</h1>
              <p className="mt-3 text-sm text-orange-50/90">
                Add items quickly, then use the sticky cart bar at the bottom to checkout.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm">
                <div className="flex items-center gap-1 text-orange-50/90">
                  <Star size={14} className="text-orange-200" />
                  Rating
                </div>
                <p className="mt-1 text-base font-semibold">{restaurant.rating || "New"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm">
                <div className="flex items-center gap-1 text-orange-50/90">
                  <Clock3 size={14} className="text-orange-200" />
                  ETA
                </div>
                <p className="mt-1 text-base font-semibold">{restaurant.time || "Fast"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm">
                <p className="text-orange-50/90">Delivery Fee</p>
                <p className="mt-1 text-base font-semibold">{restaurant.fee || "N/A"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm">
                <p className="text-orange-50/90">Status</p>
                <p className="mt-1 text-base font-semibold">{restaurant.open ? "Open" : "Closed"}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[1.5rem] border border-orange-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
            <div className="flex items-center gap-3 rounded-xl border border-orange-200 bg-white px-4 py-3">
              <Search size={18} className="text-orange-600" />
              <input
                value={menuSearch}
                onChange={(event) => setMenuSearch(event.target.value)}
                placeholder="Search menu item..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setMenuSearch("");
                setSelectedCategory("All");
              }}
              className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700 transition hover:bg-orange-100"
            >
              Reset
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <div className="flex min-w-max items-center gap-2">
              {categoryTabs.map((category) => {
                const active = selectedCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                      active
                        ? "border-orange-500 bg-orange-500 text-white"
                        : "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <div className="mt-6">
          {categoryEntries.length === 0 ? (
            <div className="rounded-[1.5rem] border border-orange-200 bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
              {emptyStateLabel}
            </div>
          ) : filteredCategoryEntries.length === 0 ? (
            <div className="rounded-[1.5rem] border border-orange-200 bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
              No menu items matched your search.
            </div>
          ) : (
            filteredCategoryEntries.map(([category, items]) => (
              <section key={category} className="mb-7 last:mb-0">
                <h2 className="mb-3 text-xl font-semibold text-gray-900">{category}</h2>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {items.map(({ itemName, variants }) => {
                    const description =
                      variants.find((entry) => entry.description)?.description ||
                      (isShopsPage
                        ? "Carefully selected essentials ready for delivery."
                        : "Freshly prepared and packed for delivery.");
                    const showVariantLabel =
                      variants.length > 1 || variants.some((entry) => Boolean(entry.variant));

                    return (
                          <article
                            key={`${category}-${itemName}`}
                            className="rounded-[1.3rem] border border-orange-200 bg-white p-4 shadow-sm"
                          >
                        <h3 className="break-words text-base font-semibold text-gray-900">{itemName}</h3>
                        <p className="mt-2 text-sm text-gray-600">{description}</p>

                        <div className="mt-4 space-y-3">
                          {variants.map((variantEntry) => {
                            const menuItem = menuItemsById[variantEntry.id];
                            const isOrderable =
                              restaurant.open &&
                              variantEntry.isOrderable !== false &&
                              variantEntry.price > 0 &&
                              Boolean(menuItem);
                            const quantity = cartByMenuItem[variantEntry.id] || 0;

                            return (
                                <div
                                  key={variantEntry.id}
                                  className="flex flex-col gap-3 rounded-xl border border-orange-200 bg-orange-50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                                >
                                <div className="min-w-0">
                                  <p className="break-words text-sm font-medium text-gray-900">
                                    {showVariantLabel
                                      ? variantEntry.variant || itemName
                                      : "Standard option"}
                                  </p>
                                  <p className="text-sm text-orange-700">
                                    {variantEntry.price > 0
                                      ? `N${variantEntry.price.toLocaleString()}`
                                      : "Price on request"}
                                  </p>
                                </div>

                                {isOrderable ? (
                                  quantity > 0 ? (
                                    <div className="flex items-center gap-3">
                                        <button
                                          type="button"
                                          onClick={() => removeFromCart(menuItem)}
                                          disabled={isUpdatingItemId === variantEntry.id}
                                          className="rounded-full border border-orange-200 bg-white p-2.5 text-orange-700 shadow-sm disabled:opacity-60"
                                        >
                                          <Minus size={14} />
                                        </button>
                                        <span className="min-w-6 text-center font-medium">{quantity}</span>
                                        <button
                                          type="button"
                                          onClick={() => addToCart(menuItem)}
                                          disabled={isUpdatingItemId === variantEntry.id}
                                          className="rounded-full bg-orange-500 p-2.5 text-white shadow-sm hover:bg-orange-600 disabled:opacity-60 transition"
                                        >
                                          <Plus size={14} />
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => addToCart(menuItem)}
                                        disabled={isUpdatingItemId === variantEntry.id}
                                        className="rounded-full bg-orange-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
                                      >
                                        {isUpdatingItemId === variantEntry.id ? "Adding..." : "Add"}
                                      </button>
                                    )
                                  ) : (
                                  <span className="rounded-full border border-orange-200 bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-600">
                                    {restaurant.open ? "Info only" : "Closed"}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </div>
      </div>

      {totalItems > 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-orange-600 bg-orange-500 px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] text-white shadow-2xl">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
            <span className="text-center text-sm font-medium sm:text-left sm:text-base">
              {totalItems} {totalItems === 1 ? "item" : "items"} in cart - N{totalPrice.toLocaleString()}
            </span>

            <div className="flex w-full gap-2 sm:w-auto">
              <button
                type="button"
                onClick={() => navigate("/cart")}
                className="w-full rounded-full border border-white/70 bg-transparent px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition sm:w-auto"
              >
                View Cart
              </button>
              <button
                type="button"
                onClick={() => navigate("/Checkout")}
                className="w-full rounded-full bg-white px-4 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-50 transition sm:w-auto"
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <Footer />
    </div>
  );
}
