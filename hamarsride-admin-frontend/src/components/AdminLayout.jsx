import { Outlet } from "react-router-dom";
import AdminNavbar from "../../components/AdminNavbar";

export default function AdminLayout() {
  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminNavbar />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
