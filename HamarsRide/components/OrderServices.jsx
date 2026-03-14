import React from "react";
import { Bike, Package, MapPinned } from "lucide-react";

export default function OrderServices() {
  const services = [
    {
      icon: Bike,
      title: "Pickup & Drop",
      text: "Fast bike dispatch for personal and business deliveries across the city.",
    },
    {
      icon: MapPinned,
      title: "Off-Market Errands",
      text: "We handle secure errand requests and doorstep drop-offs without stress.",
    },
    {
      icon: Package,
      title: "Logistics Services",
      text: "Reliable movement for parcels and bulk orders with real-time coordination.",
    },
  ];

  return (
    <div className="w-full min-h-[500px] bg-white flex items-center justify-center px-5 py-10">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">Order Services</h2>
          <p className="text-gray-600 mt-2">Fast, secure and stress-free delivery options</p>
        </div>

        <div className="w-full flex flex-wrap justify-center gap-6">
          {services.map((service) => (
            <div
              key={service.title}
              className="flex flex-col items-center justify-center flex-1 min-w-[280px] h-[350px] bg-gray-300 rounded-xl p-8 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center">
                <service.icon className="text-white" size={36} />
              </div>
              <h3 className="text-2xl font-bold mt-4">{service.title}</h3>
              <p className="text-gray-700 mt-2 max-w-xl">{service.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
