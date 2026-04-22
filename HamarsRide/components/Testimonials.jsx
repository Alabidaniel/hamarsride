const testimonials = [
  {
    name: "Damilola",
    role: "Frequent customer",
    quote: "Ordering food and groceries from the same app saves me time, and the delivery flow feels much more organized.",
  },
  {
    name: "Aisha",
    role: "Busy professional",
    quote: "What stands out is how easy it is to browse, order, and track without getting lost in the interface.",
  },
  {
    name: "Tobi",
    role: "Weekend shopper",
    quote: "The shop section made it easy for me to add essentials quickly, and the overall experience felt smooth.",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-white px-4 py-18 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-orange-500">
              Testimonials
            </p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">
              Customers keep coming back because the flow feels easy
            </h2>
          </div>
          <p className="max-w-lg text-sm leading-6 text-gray-600">
            The best delivery experience is one people trust enough to use again and again.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item) => (
            <article
              key={item.name}
              className="rounded-3xl border border-gray-200 bg-gray-50 p-6 shadow-sm"
            >
              <p className="text-base leading-7 text-gray-700">"{item.quote}"</p>
              <div className="mt-6 border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.role}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
