import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { motion as Motion } from "framer-motion";
import { auth } from "../src/firebase";
import { API_BASE_URL } from "../src/config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getAuthErrorMessage } from "../src/utils/authMessages";

const alertStyles = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-red-200 bg-red-50 text-red-800",
};

const AuthAlert = ({ type = "error", message }) => {
  if (!message) {
    return null;
  }

  const Icon = type === "success" ? FaCheckCircle : FaExclamationCircle;

  return (
    <Motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-3 rounded-xl border px-3 py-3 text-sm shadow-sm ${alertStyles[type]}`}
    >
      <Icon className="mt-0.5 text-base" />
      <p className="leading-5">{message}</p>
    </Motion.div>
  );
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const leftSideVariants = {
    hidden: { x: -200, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setIsLoading(true);
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await credential.user.getIdToken();

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        const responseText = await response.text().catch(() => "");
        let backendMessage = "";

        try {
          const payload = JSON.parse(responseText);
          backendMessage = payload.error || payload.message || "";
        } catch (_parseError) {
          backendMessage = responseText.trim();
        }

        const statusLabel = `${response.status} ${response.statusText}`.trim();
        throw new Error(
          backendMessage
            ? `Backend login failed (${statusLabel}): ${backendMessage}`
            : `Backend login failed (${statusLabel}).`
        );
      }

      const payload = await response.json();
      localStorage.setItem("authToken", idToken);
      localStorage.setItem("userProfile", JSON.stringify(payload.user));
      setSuccess("Login successful. Welcome back!");
      setTimeout(() => {
        navigate("/Dashboard");
      }, 600);
    } catch (err) {
      console.error("Login error:", err);
      const friendlyMessage = getAuthErrorMessage(err, "login");
      setError(friendlyMessage || err.message || "Login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="premium-auth-shell w-full min-h-screen flex items-center justify-center px-4 py-10">
      <Motion.div
        className="premium-auth-card w-full max-w-md rounded-3xl shadow-xl p-6 sm:p-8"
        variants={leftSideVariants}
        initial="hidden"
        animate="visible"
      >
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-center mb-1">
          HamarsRide
        </h1>
        <p className="auth-muted text-center text-sm sm:text-base mb-6">
          Login to your account
        </p>

        <div className="space-y-3 mb-4">
          <AuthAlert type="error" message={error} />
          <AuthAlert type="success" message={success} />
        </div>

        <form onSubmit={handleLogin} className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-white">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-white/60 px-4 py-2.5 text-white placeholder-white/70 outline-none bg-transparent focus:ring-2 focus:ring-white/60 focus:border-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-white">Password</label>
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-white/60 px-4 py-2.5 pr-11 text-white placeholder-white/70 outline-none bg-transparent focus:ring-2 focus:ring-white/60 focus:border-white"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-white/80 text-lg flex items-center"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-white text-orange-600 font-semibold py-2.5 hover:bg-orange-50 transition disabled:opacity-60"
          >
            {isLoading ? "LOGGING IN..." : "Log In"}
          </button>
        </form>

        <div className="mt-4 text-sm text-center">
          <Link to={"/ForgotPassword"} className="text-white font-medium hover:underline">
            Forgot password?
          </Link>
        </div>

        <div className="border-t border-white/30 my-5" />

        <div className="auth-muted text-center text-sm">
          Don't have an account?{" "}
          <Link to={"/Signup"} className="text-white font-semibold hover:underline">
            Sign up
          </Link>
        </div>
      </Motion.div>
    </div>
  );
}

