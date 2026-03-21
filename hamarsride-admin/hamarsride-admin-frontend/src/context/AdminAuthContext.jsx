import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { API_BASE_URL } from "../config";

const AdminAuthContext = createContext(null);

const buildUrl = (path) => {
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

async function fetchAdminProfile(user, forceRefresh = false) {
  const idToken = await user.getIdToken(forceRefresh);
  const response = await fetch(buildUrl("/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || payload.message || "Unable to login.");
  }

  if (!payload.user || payload.user.role !== "admin") {
    throw new Error("Admin access required.");
  }

  return payload.user;
}

export function AdminAuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const adminProfile = await fetchAdminProfile(user);
        setProfile(adminProfile);
      } catch (_error) {
        setProfile(null);
        await signOut(auth).catch(() => {});
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async ({ email, password }) => {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const adminProfile = await fetchAdminProfile(credential.user, true);
      setFirebaseUser(credential.user);
      setProfile(adminProfile);
      return adminProfile;
    } catch (error) {
      await signOut(auth).catch(() => {});
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setFirebaseUser(null);
    setProfile(null);
  };

  const value = useMemo(
    () => ({ loading, firebaseUser, profile, login, logout, setProfile }),
    [loading, firebaseUser, profile]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  }
  return ctx;
}
