import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "../src/assets/logo.png";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-[#d8c8b5] bg-[#f8f1e7]/90 px-4 py-4 backdrop-blur-md sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-[1.75rem] border border-[#e2d3c1] bg-[#fffdf9]/95 px-4 py-3 shadow-[0_12px_30px_rgba(73,53,34,0.05)]">
      
        <img
          src={logo}
          alt="logo"
          className="w-24 sm:w-28 object-contain"
        />

        <div className="hidden gap-3 md:flex">
          <button
            onClick={() => navigate("/Login")}
            className="rounded-full border border-[#ddccba] bg-[#faf5ee] px-5 py-2 font-semibold text-[#6b5341] transition hover:border-[#b89574] hover:text-[#8b6748]"
          >
            LOGIN
          </button>
          <button
            onClick={() => navigate("/Signup")}
            className="rounded-full bg-[#8a684d] px-5 py-2 font-semibold text-[#fffaf4] transition hover:bg-[#76563f]"
          >
            SIGNUP
          </button>
        </div>

        <div className="md:hidden">
          <button onClick={() => setOpen(!open)}>
            {open ? (
              <X className="text-[#6b5341]" size={28} />
            ) : (
              <Menu className="text-[#6b5341]" size={28} />
            )}
          </button>
        </div>

        {open && (
          <div className="absolute left-0 top-full w-full px-4 pt-3 md:hidden sm:px-6">
            <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 rounded-[1.5rem] border border-[#e2d3c1] bg-[#fffdf9] py-6 shadow-[0_16px_40px_rgba(73,53,34,0.08)]">
              <button
                onClick={() => navigate("/Login")}
                className="w-4/5 rounded-full border border-[#ddccba] bg-[#faf5ee] px-5 py-2 font-semibold text-[#6b5341]"
              >
                LOGIN
              </button>
              <button
                onClick={() => navigate("/Signup")}
                className="w-4/5 rounded-full bg-[#8a684d] px-5 py-2 font-semibold text-[#fffaf4]"
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
