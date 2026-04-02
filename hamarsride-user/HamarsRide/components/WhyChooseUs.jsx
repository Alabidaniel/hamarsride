const reasons = [
  "One platform for restaurants, grocery-style shops, and dispatch convenience.",
  "Clean ordering flow that works well on both mobile and desktop screens.",
  "Vendor listings with clear delivery fees, timing, and real menu structure.",
  "Customer-first presentation that makes ordering fast and low-stress.",
];

export default function WhyChooseUs() {
  return (
    <section className="bg-[#8a684d] px-4 py-18 text-[#fffaf4] sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#f2dfcb]">
            Why HamarsRide
          </p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Built for speed, trust, and repeat orders
          </h2>
          <p className="mt-4 text-base leading-7 text-[#f3e7d8]">
            Customers want convenience, but they also want confidence. HamarsRide is designed to feel reliable from the first screen to final delivery.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
          {reasons.map((reason) => (
            <div
              key={reason}
              className="rounded-3xl border border-white/15 bg-white/10 px-5 py-5 backdrop-blur-sm"
            >
              <p className="text-sm leading-6 text-[#fff8f1]">{reason}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
