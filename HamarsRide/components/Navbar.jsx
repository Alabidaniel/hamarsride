import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 w-full bg-black/30 backdrop-blur-md px-4 sm:px-6 py-4 flex justify-between items-center z-50">
      
      {/* LOGO */}
      <img
        src="/src/assets/logo.png"
        alt="logo"
        className="w-24 sm:w-28 object-contain"
      />

      {/* DESKTOP BUTTONS */}
      <div className="hidden md:flex gap-3">
        <button onClick={() => navigate("/Login")} className="bg-orange-400 hover:bg-orange-500 text-white px-5 py-2 rounded-full font-semibold transition">
          LOGIN
        </button>
        <button onClick={() => navigate("/Signup")} className="bg-orange-400 hover:bg-orange-500 text-white px-5 py-2 rounded-full font-semibold transition">
          SIGNUP
        </button>
      </div>

      {/* HAMBURGER */}
      <div className="md:hidden">
        <button onClick={() => setOpen(!open)}>
          {open ? (
            <X className="text-white" size={28} />
          ) : (
            <Menu className="text-white" size={28} />
          )}
        </button>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="absolute top-full left-0 w-full bg-black/90 backdrop-blur-md flex flex-col items-center gap-4 py-6 md:hidden">
          <button onClick={() => navigate("/Login")} className="bg-orange-400 w-4/5 text-white px-5 py-2 rounded-full font-semibold">
            LOGIN
          </button>
          <button onClick={() => navigate("/Signup")} className="bg-orange-400 w-4/5 text-white px-5 py-2 rounded-full font-semibold">
            SIGNUP
          </button>
        </div>
      )}
    </nav>
  );
}