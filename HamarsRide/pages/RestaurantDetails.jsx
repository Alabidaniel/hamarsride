import React, { useEffect, useMemo, useState } from "react";
import { Star, Clock, Plus, Minus } from "lucide-react";
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
  const isShopsPage = location.pathname.startsWith("/shops");
  const businessLabel = isShopsPage ? "Shop" : "Restaurant";
  const businessPath = isShopsPage ? "/shops" : "/restaurants";
  const emptyStateLabel = isShopsPage ? "Catalog coming soon." : "Menu coming soon.";
  const itemFallbackDescription = isShopsPage
    ? "Carefully selected essentials ready for delivery."
    : "Freshly prepared and packed for you.";
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState({});
  const [structuredMenu, setStructuredMenu] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [error, setError] = useState("");
  const [cart, setCart] = useState({});
  const [isAddingId, setIsAddingId] = useState(null);
  const navigate = useNavigate();
  const restaurantId = id;

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch(`${businessPath}/${restaurantId}`);
        setRestaurant(data.restaurant);
        const menu = await apiFetch(`${businessPath}/${restaurantId}/menu`);
        setMenuItems(menu.items || []);
        setCategories(menu.categories || {});
        setStructuredMenu(menu.structuredMenu || {});
      } catch (err) {
        setError(err.message || `Failed to load ${businessLabel.toLowerCase()}.`);
      }
    };
    load();
  }, [businessLabel, businessPath, restaurantId]);

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
        // ignore cart load issues here
      }
    };
    loadCart();
  }, []);

  const cartByMenuItem = useMemo(() => {
    const map = {};
    menuItems.forEach((item) => {
      map[item.id] = cart[item.id]?.qty || 0;
    });
    return map;
  }, [cart, menuItems]);

  const menuItemsById = useMemo(
    () =>
      menuItems.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {}),
    [menuItems]
  );

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
          [item.id]: {
            qty: payload.item.quantity,
            cartItemId: payload.item.id,
          },
        }));
      } else {
        setCart((prev) => ({
          ...prev,
          [item.id]: {
            qty: (prev[item.id]?.qty || 0) + 1,
            cartItemId: prev[item.id]?.cartItemId,
          },
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
      const entry = cart[item.id];
      if (!entry) return;
      setIsAddingId(item.id);

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
      setIsAddingId(null);
    }
  };

  const totalItems = Object.values(cartByMenuItem).reduce((a, b) => a + b, 0);
  const totalPrice = menuItems.reduce(
    (total, item) => total + (cartByMenuItem[item.id] || 0) * item.price,
    0
  );

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
      ? [[
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
        ]]
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

  const visibleCategoryEntries =
    selectedCategory === "All"
      ? categoryEntries
      : categoryEntries.filter(([category]) => category === selectedCategory);

  if (error) {
    return <div className="p-20 text-center text-red-600">{error}</div>;
  }

  if (!restaurant) {
    return <div className="p-20 text-center text-gray-500">{businessLabel} not found</div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f6f0e7] text-[#2f241b]">
      <NavbarMain />

      <div className="mx-auto flex-1 w-full max-w-6xl px-4 sm:px-6 lg:px-8 pb-28">
        <section className="mt-6 sm:mt-8 rounded-[2rem] border border-[#ded1bf] bg-gradient-to-br from-[#7d5b43] via-[#916b4f] to-[#b89574] px-6 py-8 text-[#fffaf4] shadow-[0_30px_90px_rgba(70,45,28,0.16)] sm:px-8 sm:py-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-white/10 text-2xl font-semibold tracking-[0.35em] text-[#fffaf4] ring-1 ring-white/15 backdrop-blur-sm">
                {getInitials(restaurant.name)}
              </div>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.35em] text-[#f6e4cf]">
                {restaurant.type || businessLabel.toLowerCase()}
              </p>
              <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
                {restaurant.name}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#f8eee3] sm:text-base">
                A more refined, image-free menu experience built around clarity, pricing, and fast ordering.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[320px]">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-sm text-[#f6e4cf]">
                  <Star size={15} className="text-[#f0c590]" />
                  Rating
                </div>
                <p className="mt-2 text-2xl font-semibold">{restaurant.rating}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-sm text-[#f6e4cf]">
                  <Clock size={15} className="text-[#f0c590]" />
                  ETA
                </div>
                <p className="mt-2 text-2xl font-semibold">{restaurant.time}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-sm text-[#f6e4cf]">Delivery</p>
                <p className="mt-2 text-2xl font-semibold">{restaurant.fee}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-sm text-[#f6e4cf]">Status</p>
                <p className="mt-2 text-2xl font-semibold">{restaurant.open ? "Open" : "Closed"}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 sm:mt-10">
          {categoryEntries.length === 0 ? (
            <div className="rounded-[2rem] border border-[#e5d7c7] bg-[#fffdf9] p-8 text-center text-sm text-[#7d6a59] shadow-sm">
              {emptyStateLabel}
            </div>
          ) : (
            <>
              <div className="mb-6 overflow-x-auto rounded-[1.75rem] border border-[#e5d7c7] bg-[#fffdf9] p-3 shadow-sm sm:p-4">
                <div className="flex min-w-max items-center gap-2">
                  {categoryTabs.map((category) => {
                    const active = selectedCategory === category;
                    return (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                          active
                            ? "border-[#7d5b43] bg-[#7d5b43] text-[#fffaf4]"
                            : "border-[#e1d3c3] bg-[#faf5ee] text-[#5b4636] hover:border-[#b89574] hover:text-[#8b6748]"
                        }`}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>
              </div>

              {visibleCategoryEntries.map(([category, items]) => (
                <section key={category} className="mt-8 first:mt-0">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold text-[#2f241b] sm:text-2xl">{category}</h2>
                    <span className="rounded-full bg-[#f1e7db] px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#8b6748]">
                      Curated
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    {items.map(({ itemName, variants }) => {
                      const groupDescription =
                        variants.find((entry) => entry.description)?.description || itemFallbackDescription;
                      const showVariantLabel =
                        variants.length > 1 || variants.some((entry) => Boolean(entry.variant));

                      return (
                        <article
                          key={`${category}-${itemName}`}
                          className="rounded-[1.8rem] border border-[#e5d7c7] bg-[#fffdf9] p-5 shadow-[0_16px_50px_rgba(72,52,33,0.07)]"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#9a7454]">
                                Signature Selection
                              </p>
                              <h3 className="mt-3 text-lg font-semibold text-[#2f241b] sm:text-xl">
                                {itemName}
                              </h3>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#876347] to-[#c7a17f] text-sm font-semibold tracking-[0.2em] text-[#fffaf4]">
                              {getInitials(itemName)}
                            </div>
                          </div>

                          <p className="mt-4 text-sm leading-7 text-[#72604f]">{groupDescription}</p>

                          <div className="mt-5 space-y-3">
                            {variants.map((variantEntry) => {
                              const menuItem = menuItemsById[variantEntry.id];
                              const isOrderable =
                                variantEntry.isOrderable !== false && variantEntry.price > 0;
                              const quantity = cartByMenuItem[variantEntry.id] || 0;

                              return (
                                <div
                                  key={variantEntry.id}
                                  className="rounded-[1.4rem] border border-[#eee2d4] bg-[#faf5ee] px-4 py-4"
                                >
                                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                      {showVariantLabel ? (
                                        <p className="text-sm font-medium text-[#3d3025]">
                                          {variantEntry.variant || itemName}
                                        </p>
                                      ) : (
                                        <p className="text-sm font-medium text-[#84705e]">Standard option</p>
                                      )}
                                      <p className="mt-2 text-lg font-semibold text-[#8b6748]">
                                        {isOrderable
                                          ? `N${variantEntry.price.toLocaleString()}`
                                          : "Price on request"}
                                      </p>
                                    </div>

                                    {isOrderable && menuItem ? (
                                      quantity ? (
                                        <div className="flex items-center gap-3 self-start sm:self-center">
                                          <button
                                            onClick={() => removeFromCart(menuItem)}
                                            className="rounded-full bg-[#fffdf9] p-2 text-[#5b4636] shadow-sm disabled:opacity-60"
                                            disabled={isAddingId === variantEntry.id}
                                          >
                                            <Minus size={14} />
                                          </button>

                                          <span className="min-w-6 text-center font-medium">{quantity}</span>

                                          <button
                                            onClick={() => addToCart(menuItem)}
                                            className="rounded-full bg-[#7d5b43] p-2 text-[#fffaf4] shadow-sm disabled:opacity-60"
                                            disabled={isAddingId === variantEntry.id}
                                          >
                                            <Plus size={14} />
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => addToCart(menuItem)}
                                          className="self-start rounded-full bg-[#7d5b43] px-5 py-2 text-sm font-medium text-[#fffaf4] transition hover:bg-[#6f503c] disabled:opacity-60 sm:self-center"
                                          disabled={isAddingId === variantEntry.id}
                                        >
                                          {isAddingId === variantEntry.id ? "Adding..." : "Add to Cart"}
                                        </button>
                                      )
                                    ) : (
                                      <span className="self-start rounded-full border border-[#e3d4c3] bg-[#fffdf9] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#84705e] sm:self-center">
                                        Info only
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}
            </>
          )}
        </div>
      </div>

      {totalItems > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#d8c7b4] bg-[#7d5b43] px-4 py-4 text-[#fffaf4] shadow-2xl">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
            <span className="text-sm font-medium sm:text-base">
              View Cart ({totalItems} items) - N{totalPrice.toLocaleString()}
            </span>

            <button
              onClick={() => navigate("/cart")}
              className="w-full rounded-full bg-[#f4e9db] px-6 py-2 font-semibold text-[#5b4636] sm:w-auto"
            >
              Open Cart
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
