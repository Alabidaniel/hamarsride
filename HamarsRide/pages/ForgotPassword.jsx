import { useState } from "react";
import { auth } from "../src/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import Logo from "../src/assets/logo.png";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setStatus("error");
      return;
    }

    try {
      setIsLoading(true);
      await sendPasswordResetEmail(auth, email);
      setStatus("success");
    } catch (err) {
      console.error("Forgot password error:", err);
      setStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="w-full px-6 py-4 flex justify-between items-center bg-white shadow-sm">
        <a href="/" className="flex items-center">
          <img
            src={Logo}
            alt="HAMARS RIDE Logo"
            className="h-10 w-auto object-contain"
          />
        </a>

        <a
          href="/login"
          className="text-sm font-medium text-gray-700 hover:text-orange-600 transition"
        >
          Back to Login
        </a>
      </nav>

      <div className="flex-grow flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 md:p-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Reset Your Password
          </h1>

          <p className="text-gray-600 mb-8 text-sm leading-relaxed">
            Enter your email address and we'll send you a secure link to reset
            your password.
          </p>

          {status === "success" && (
            <div className="mb-6 p-4 rounded-2xl bg-green-50 border border-green-200 text-green-700 text-sm">
              If this email is registered, a reset link has been sent.
            </div>
          )}

          {status === "error" && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm">
              Please enter a valid email address.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>

              <input
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-2xl bg-orange-600 text-white font-semibold text-sm hover:bg-orange-700 active:scale-[0.98] transition-all shadow-md disabled:opacity-60"
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <p className="text-xs text-gray-500 mt-5 text-center">
            Check your spam folder if you don't see the email.
          </p>

          <div className="my-6 border-t border-gray-200" />

          <div className="text-center">
            <a
              href="/login"
              className="text-sm font-medium text-orange-600 hover:underline"
            >
              Back to Login
            </a>
          </div>
        </div>
      </div>

      <footer className="bg-white border-t border-gray-200 py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 space-y-3 md:space-y-0">
          <div className="flex space-x-6">
            <a href="#" className="hover:text-orange-600 transition">
              Contact
            </a>
            <a href="#" className="hover:text-orange-600 transition">
              Terms
            </a>
            <a href="#" className="hover:text-orange-600 transition">
              Instagram
            </a>
            <a href="#" className="hover:text-orange-600 transition">
              WhatsApp
            </a>
          </div>

          <div className="text-xs text-gray-400">
            © {new Date().getFullYear()} HAMARS RIDE. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
