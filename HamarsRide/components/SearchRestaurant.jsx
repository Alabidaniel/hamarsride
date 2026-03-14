import React from "react";
import { FiSearch } from "react-icons/fi"; // import search icon from react-icons

export default function SearchRestaurant() {
  return (
    <section className="w-full bg-white grid grid-cols-1 md:grid-cols-2 min-h-120 md:min-h-60 px-6 md:px-20 items-center gap-8">
      
      {/* Left content */}
      <div className="flex flex-col justify-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
          Search For Restaurants
        </h1>

        <p className="text-lg md:text-xl mb-6">
          Discover top-rated meals from the best restaurants.
        </p>

        {/* Search input */}
        <div className="relative w-full max-w-md">
          {/* Icon */}
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
            <FiSearch size={20} />
          </span>

          {/* Input */}
          <input
            type="text"
            placeholder="Search for restaurants"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
      </div>

      {/* Right content */}
      <div className="flex justify-center md:justify-end items-center">
        <img src="../src/assets/Search.png" alt="Search Illustration" className="max-w-full h-auto" />
      </div>

    </section>
  );
}
