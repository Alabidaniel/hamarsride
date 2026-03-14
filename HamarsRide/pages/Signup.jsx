import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { motion } from "framer-motion";
import { auth } from "../src/firebase";
import { API_BASE_URL } from "../src/config";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
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
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-3 rounded-xl border px-3 py-3 text-sm shadow-sm ${alertStyles[type]}`}
    >
      <Icon className="mt-0.5 text-base" />
      <p className="leading-5">{message}</p>
    </motion.div>
  );
};

export default function SignupPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    altPhone: "",
    dateOfBirth: "",
    gender: "",
    addressLabel: "",
    addressDetails: "",
    addressNotes: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const leftSideVariants = {
    hidden: { x: -200, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const rightSideVariants = {
    hidden: { x: 200, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const handleChange = (event) => {
    const { id, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSignup = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name || !formData.phone || !formData.email || !formData.password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!formData.addressLabel || !formData.addressDetails) {
      setError("Please add your address label and details.");
      return;
    }

    if (!formData.acceptTerms) {
      setError("Please accept the terms to continue.");
      return;
    }

    try {
      setIsLoading(true);

      const credential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      await updateProfile(credential.user, { displayName: formData.name });

      const idToken = await credential.user.getIdToken();

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken,
          name: formData.name,
          phone: formData.phone,
          altPhone: formData.altPhone,
          dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth : undefined,
          gender: formData.gender,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Backend registration failed.");
      }

      const payload = await response.json();
      localStorage.setItem("authToken", idToken);
      localStorage.setItem("userProfile", JSON.stringify(payload.user));

      const addressResponse = await fetch(`${API_BASE_URL}/addresses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          label: formData.addressLabel,
          details: formData.addressDetails,
          notes: formData.addressNotes || undefined,
          isDefault: true,
        }),
      });

      if (!addressResponse.ok) {
        const addressPayload = await addressResponse.json().catch(() => ({}));
        throw new Error(addressPayload.error || "Failed to save address.");
      }

      setSuccess("Account created successfully.");

      setTimeout(() => {
        navigate("/Dashboard");
      }, 800);
    } catch (err) {
      console.error("Signup error:", err);
      const friendlyMessage = getAuthErrorMessage(err, "signup");
      setError(friendlyMessage || err.message || "Sign up failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white w-full min-h-screen flex items-center justify-center px-4 py-10" style={{ fontFamily: "Playfair Display" }}>
      <motion.div
        className="w-full max-w-lg bg-orange-600 rounded-3xl shadow-xl p-6 sm:p-8"
        variants={leftSideVariants}
        initial="hidden"
        animate="visible"
      >
        <h1 className="text-white text-3xl sm:text-4xl font-bold text-center mb-1">
          HamarsRide
        </h1>
        <p className="text-orange-100 text-center text-sm sm:text-base mb-6">
          Create your account
        </p>

        <div className="space-y-3 mb-4">
          <AuthAlert type="error" message={error} />
          <AuthAlert type="success" message={success} />
        </div>

        <form onSubmit={handleSignup} className="space-y-3">
          <div className="space-y-1">
            <label htmlFor="name" className="text-sm font-medium text-white">Name</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/60 px-4 py-2.5 text-white outline-none bg-transparent focus:ring-2 focus:ring-white/60 focus:border-white"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="phone" className="text-sm font-medium text-white">Phone Number</label>
            <input
              id="phone"
              type="text"
              value={formData.phone}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/60 px-4 py-2.5 text-white outline-none bg-transparent focus:ring-2 focus:ring-white/60 focus:border-white"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="altPhone" className="text-sm font-medium text-white">Alternate Phone (Optional)</label>
            <input
              id="altPhone"
              type="text"
              value={formData.altPhone}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/60 px-4 py-2.5 text-white outline-none bg-transparent focus:ring-2 focus:ring-white/60 focus:border-white"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="dateOfBirth" className="text-sm font-medium text-white">Date of Birth</label>
              <input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/60 px-4 py-2.5 text-white outline-none bg-transparent focus:ring-2 focus:ring-white/60 focus:border-white"
              />
            </div>

              <div className="space-y-1">
                <label htmlFor="gender" className="text-sm font-medium text-white">Gender</label>
                <select
                  id="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/60 px-4 py-2.5 text-white outline-none bg-transparent focus:ring-2 focus:ring-white/60 focus:border-white"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="addressLabel" className="text-sm font-medium text-white">Address Label</label>
              <input
                id="addressLabel"
                type="text"
                value={formData.addressLabel}
                onChange={handleChange}
                placeholder="Home, Work"
                className="w-full rounded-xl border border-white/60 px-4 py-2.5 text-white placeholder-white/70 outline-none bg-transparent focus:ring-2 focus:ring-white/60 focus:border-white"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="addressDetails" className="text-sm font-medium text-white">Address Details</label>
              <input
                id="addressDetails"
                type="text"
                value={formData.addressDetails}
                onChange={handleChange}
                placeholder="Street, Area, City"
                className="w-full rounded-xl border border-white/60 px-4 py-2.5 text-white placeholder-white/70 outline-none bg-transparent focus:ring-2 focus:ring-white/60 focus:border-white"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="addressNotes" className="text-sm font-medium text-white">Delivery Notes (Optional)</label>
              <input
                id="addressNotes"
                type="text"
                value={formData.addressNotes}
                onChange={handleChange}
                placeholder="Gate code, landmark"
                className="w-full rounded-xl border border-white/60 px-4 py-2.5 text-white placeholder-white/70 outline-none bg-transparent focus:ring-2 focus:ring-white/60 focus:border-white"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium text-white">Email</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/60 px-4 py-2.5 text-white outline-none bg-transparent focus:ring-2 focus:ring-white/60 focus:border-white"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium text-white">Password</label>
            <div className="relative w-full">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/60 px-4 py-2.5 pr-11 text-white outline-none bg-transparent focus:ring-2 focus:ring-white/60 focus:border-white"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-white/80 text-lg flex items-center"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-white">Confirm Password</label>
            <div className="relative w-full">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/60 px-4 py-2.5 pr-11 text-white outline-none bg-transparent focus:ring-2 focus:ring-white/60 focus:border-white"
              />
              <span
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-white/80 text-lg flex items-center"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2 text-sm text-orange-100">
            <input
              id="acceptTerms"
              type="checkbox"
              className="mt-1"
              checked={formData.acceptTerms}
              onChange={handleChange}
            />
            <label htmlFor="acceptTerms" className="leading-5">
              By creating an account you agree to the{" "}
              <span className="font-semibold text-white cursor-pointer">Terms of Use</span> and our{" "}
              <span className="font-semibold text-white cursor-pointer">Privacy Policy</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-white text-orange-600 font-semibold py-2.5 hover:bg-orange-50 transition disabled:opacity-60"
          >
            {isLoading ? "SIGNING UP..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-orange-100">
          Already have an account?{" "}
          <Link to={"/Login"} className="text-white font-semibold hover:underline">
            Log in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
