import {
  LayoutDashboard,
  Store,
  UtensilsCrossed,
  Image as ImageIcon,
  ChartLine,
  ListChecks,
  Users,
  CreditCard,
  Settings,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const primaryLinks = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/restaurants", label: "Restaurants", icon: Store },
  { to: "/menu", label: "Menu Management", icon: UtensilsCrossed },
  { to: "/banners", label: "Banners", icon: ImageIcon },
  { to: "/analytics", label: "Analytics", icon: ChartLine },
];

const secondaryLinks = [
  { to: "/orders", label: "Orders", icon: ListChecks },
  { to: "/users", label: "Users", icon: Users },
  { to: "/payments", label: "Payments", icon: CreditCard },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar() {
  const location = useLocation();
  const isActive = (to) => (to === "/" ? location.pathname === "/" : location.pathname.startsWith(to));

  return (
    <aside className="hidden md:block w-64 shrink-0 p-6 pr-0">
      <div className="sticky top-6 space-y-4">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm">
          <p className="text-xs font-semibold tracking-wide uppercase text-orange-600">HamarsRide</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">Admin Console</p>
        </div>

        <nav className="rounded-2xl border border-gray-200 bg-white p-2 shadow-sm">
          {[...primaryLinks, ...secondaryLinks].map((link) => {
            const Icon = link.icon;
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition ${
                  active ? "bg-orange-500 text-white" : "text-gray-700 hover:bg-orange-50 hover:text-orange-700"
                }`}
              >
                <Icon size={16} />
                <span className="font-medium">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

