import React from "react";
import HeroImg from '../src/assets/Hero.png'
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
      style={{ backgroundImage: `url(${HeroImg})` }}
    >
      <div
        className="
          text-white 
          max-w-xl 
          text-center md:text-left
          bg-black/40 md:bg-transparent
          backdrop-blur-sm md:backdrop-blur-0
          p-6 sm:p-8 md:p-0
          rounded-2xl
        "
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
          Fast Food Delivery
        </h1>

        <p className="text-base sm:text-lg md:text-xl mb-6">
          Order from your favorite restaurants near you.
        </p>

        <button onClick={() => navigate("/Login")}
          className="
            bg-orange-400 hover:bg-orange-500
            px-6 sm:px-8 py-3
            text-sm sm:text-base md:text-lg
            rounded-full font-semibold
            transition duration-300
            w-full sm:w-auto
          "
        >
          Start Ordering
        </button>
      </div>
    </section>
  );
}