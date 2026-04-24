import { API_BASE_URL } from "../config";

console.log("API_BASE_URL:", API_BASE_URL);
import { auth } from "../firebase";

const buildUrl = (path) => {
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

const getIdToken = async (forceRefresh = false) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Not authenticated");
  }
  return user.getIdToken(forceRefresh);
};

const apiFetch = async (path, options = {}) => {
  const buildHeaders = async (forceRefresh = false) => {
    const token = await getIdToken(forceRefresh);
    return {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    };
  };

  let response = await fetch(buildUrl(path), {
    ...options,
    headers: await buildHeaders(false),
  });

  if (response.status === 401) {
    response = await fetch(buildUrl(path), {
      ...options,
      headers: await buildHeaders(true),
    });
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    console.error("API error:", response.status, response.statusText, payload);
    const message = payload.error || payload.message || "Request failed";
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  if (response.status === 204) return null;
  return response.json();
};

export { API_BASE_URL, apiFetch, getIdToken };
