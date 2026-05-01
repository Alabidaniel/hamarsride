const steps = [
  {
    number: "01",
    title: "Browse nearby vendors",
    description: "Explore restaurants and shops already listed on HamarsRide and choose what you want.",
  },
  {
    number: "02",
    title: "Add items to cart",
    description: "Select meal sizes, shop items, and delivery-ready options with clear pricing.",
  },
  {
    number: "03",
    title: "Place your order",
    description: "Confirm your address, checkout details, and let our dispatch flow take over.",
  },
  {
    number: "04",
    title: "Track and receive",
    description: "Your order gets prepared, picked up, and brought to you with care and speed.",
  },
];

export default function How() {
  return (
    <section className="bg-white px-4 py-18 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-orange-600">
              How It Works
            </p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">
              A simple delivery experience from first tap to doorstep
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-gray-600">
              We kept the process straightforward so customers can order quickly and vendors can fulfill without confusion.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
            {steps.map((step) => (
              <article
                key={step.number}
                className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-orange-200"
              >
                <div className="flex items-start gap-4">
                  <div className="min-w-14 rounded-2xl bg-orange-600 px-3 py-2 text-center text-sm font-bold text-white">
                    {step.number}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-600">{step.description}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
