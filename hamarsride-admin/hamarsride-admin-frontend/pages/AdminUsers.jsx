import { useEffect, useState } from "react";
import { apiFetch } from "../src/services/apiClient";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (role) params.set("role", role);
      const payload = await apiFetch(`/admin/users${params.toString() ? `?${params.toString()}` : ""}`);
      setUsers(payload.users || []);
    } catch (err) {
      setError(err.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [role]);

  return (
    <section className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Users</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name/email/phone"
              className="border border-gray-300 rounded-xl px-3 py-2 text-sm"
            />
            <select className="border border-gray-300 rounded-xl px-3 py-2 text-sm" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="">All roles</option>
              <option value="customer">customer</option>
              <option value="rider">rider</option>
              <option value="admin">admin</option>
            </select>
            <button onClick={loadUsers} type="button" className="px-4 py-2 rounded-xl bg-orange-500 text-white text-sm hover:bg-orange-600 transition">Apply</button>
          </div>
        </div>
      </div>

      {error ? <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-red-700">{error}</div> : null}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="min-w-[760px] w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Role</th>
              <th className="text-left p-3">Orders</th>
              <th className="text-left p-3">Addresses</th>
              <th className="text-left p-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-4 text-gray-500" colSpan={6}>Loading users...</td></tr>
            ) : users.length === 0 ? (
              <tr><td className="p-4 text-gray-500" colSpan={6}>No users found.</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-t border-gray-100">
                  <td className="p-3 font-medium text-gray-900">{user.name}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3"><span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">{user.role}</span></td>
                  <td className="p-3">{user._count?.orders ?? 0}</td>
                  <td className="p-3">{user._count?.addresses ?? 0}</td>
                  <td className="p-3">{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
