import { Outlet } from "react-router-dom";
import AdminNavbar from "../../components/AdminNavbar";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout() {
  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto flex">
        <AdminSidebar />
        <div className="flex-1 min-w-0 p-3 sm:p-6 space-y-4 sm:space-y-6">
          <AdminNavbar />
          <main>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

