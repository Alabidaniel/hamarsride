import React from "react";
import { motion as Motion } from "framer-motion";
import HeroImg from "../src/assets/Hero.png";
import { useNavigate } from "react-router-dom";

export default function Hero() {

  const navigate = useNavigate();

  return (
    <section
      className="
        w-full min-h-screen 
        flex items-center 
        justify-center md:justify-start
        px-4 sm:px-6 md:px-16 lg:px-24
        pt-24 md:pt-28
        bg-no-repeat bg-cover bg-center
      "
      style={{
        backgroundImage: `linear-gradient(90deg, rgba(234,88,12,0.78) 0%, rgba(249,115,22,0.48) 45%, rgba(255,255,255,0.08) 100%), url(${HeroImg})`,
      }}
    >
      <Motion.div
        className="
          text-white
          max-w-xl 
          text-center md:text-left
          bg-white/10 md:bg-white/8
          backdrop-blur-md
          p-6 sm:p-8
          rounded-[1.75rem]
          border border-white/15
          shadow-xl
        "
        initial={{ opacity: 0, x: -36 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
      >
        <Motion.div
          className="mb-4 inline-flex rounded-full border border-orange-200/40 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-orange-50 backdrop-blur-sm"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.35 }}
        >
          Fast Food + Smart Dispatch
        </Motion.div>

        <Motion.h1
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.45 }}
        >
          Food And Essentials Delivered Fast
        </Motion.h1>

        <Motion.p
          className="text-base sm:text-lg md:text-xl mb-6"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.55 }}
        >
          Order from nearby restaurants and shops in one place.
        </Motion.p>

        <Motion.button
          onClick={() => navigate("/Login")}
          className="
            bg-orange-600 hover:bg-orange-700
            px-6 sm:px-8 py-3
            text-sm sm:text-base md:text-lg
            rounded-full font-semibold
            transition duration-300
            w-full sm:w-auto
          "
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.65 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          Start Ordering
        </Motion.button>
      </Motion.div>
    </section>
  );
}
