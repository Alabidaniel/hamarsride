import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "../src/assets/logo.png";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-orange-200 bg-white/90 px-4 py-4 backdrop-blur-md sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-[1.75rem] border border-orange-200 bg-white/95 px-4 py-3 shadow-sm">
      
        <img
          src={logo}
          alt="logo"
          className="w-24 sm:w-28 object-contain"
        />

        <div className="hidden gap-3 md:flex">
          <button
            onClick={() => navigate("/Login")}
            className="rounded-full border border-orange-200 bg-white px-5 py-2 font-semibold text-orange-700 transition hover:border-orange-300 hover:bg-orange-50"
          >
            LOGIN
          </button>
          <button
            onClick={() => navigate("/Signup")}
            className="rounded-full bg-orange-600 px-5 py-2 font-semibold text-white transition hover:bg-orange-700"
          >
            SIGNUP
          </button>
        </div>

        <div className="md:hidden">
          <button onClick={() => setOpen(!open)}>
            {open ? (
              <X className="text-orange-700" size={28} />
            ) : (
              <Menu className="text-orange-700" size={28} />
            )}
          </button>
        </div>

        {open && (
          <div className="absolute left-0 top-full w-full px-4 pt-3 md:hidden sm:px-6">
            <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 rounded-[1.5rem] border border-orange-200 bg-white py-6 shadow-md">
              <button
                onClick={() => navigate("/Login")}
                className="w-4/5 rounded-full border border-orange-200 bg-white px-5 py-2 font-semibold text-orange-700"
              >
                LOGIN
              </button>
              <button
                onClick={() => navigate("/Signup")}
                className="w-4/5 rounded-full bg-orange-600 px-5 py-2 font-semibold text-white"
              >
                SIGNUP
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
