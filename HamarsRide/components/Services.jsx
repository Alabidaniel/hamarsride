import { Bike, PackageCheck, ShoppingBag, UtensilsCrossed } from "lucide-react";

const services = [
  {
    title: "Restaurant Delivery",
    description: "Order hot meals from trusted food vendors around you without switching apps.",
    icon: UtensilsCrossed,
  },
  {
    title: "Shop Essentials",
    description: "Get groceries, snacks, and household basics delivered to your doorstep quickly.",
    icon: ShoppingBag,
  },
  {
    title: "Fast Dispatch",
    description: "Reliable riders move orders across town with clear progress and dependable timing.",
    icon: Bike,
  },
  {
    title: "Careful Handling",
    description: "From parfait cups to food baskets, items are packed and delivered with extra care.",
    icon: PackageCheck,
  },
];

export default function Services() {
  return (
    <section className="bg-white px-4 py-18 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-orange-600">
            Services
          </p>
          <h2 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">
            Everything you need delivered in one smooth flow
          </h2>
          <p className="mt-4 text-base leading-7 text-gray-600">
            HamarsRide brings food ordering, essentials shopping, and rider dispatch into one dependable customer experience.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {services.map(({ title, description, icon: Icon }) => (
            <article
              key={title}
              className="rounded-3xl border border-orange-200 bg-orange-50/40 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-600 text-white">
                <Icon size={24} />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-gray-900">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-gray-600">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
