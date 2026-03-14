import React from "react";
import How1 from "../src/assets/How-1.png";
import How2 from "../src/assets/How-2.png";
import How3 from "../src/assets/How-3.png";

export default function How() {
  return (
    <div className="w-full min-h-[500px] bg-white flex items-center justify-center px-5 py-10">

      <div className="max-w-6xl w-full flex flex-wrap justify-center gap-6">

        {/* Card 1 */}
        <div className="flex flex-col items-center justify-center flex-1 min-w-[280px] h-[350px] bg-gray-300 rounded-xl p-10 text-center">
          <img src={How1} alt="Choose Restaurants" className="w-[200px] h-[200px] object-contain" />
          <h3 className="text-2xl font-bold">Choose Restaurants</h3>
        </div>

        {/* Card 2 */}
        <div className="flex flex-col items-center justify-center flex-1 min-w-[280px] h-[350px] bg-gray-300 rounded-xl p-10 text-center">
          <img src={How2} alt="Place Order" className="w-[200px] h-[200px] object-contain" />
          <h3 className="text-2xl font-bold">Place Order</h3>
        </div>

        {/* Card 3 */}
        <div className="flex flex-col items-center justify-center flex-1 min-w-[280px] h-[350px] bg-gray-300 rounded-xl p-10 text-center">
          <img src={How3} alt="Get Delivery" className="w-[200px] h-[200px] object-contain" />
          <h3 className="text-2xl font-bold">Get Delivery</h3>
        </div>

      </div>
    </div>
  );
}
