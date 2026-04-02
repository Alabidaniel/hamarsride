const faqs = [
  {
    question: "Can I order from restaurants and shops?",
    answer: "Yes. HamarsRide supports both food vendors and shop-style businesses inside the same customer app.",
  },
  {
    question: "Do I need to call a rider separately?",
    answer: "No. The platform is designed to handle the full order flow from cart to dispatch-ready delivery.",
  },
  {
    question: "Can I see prices before checkout?",
    answer: "Yes. Delivery fees, item prices, and menu options are shown directly in the app before you place an order.",
  },
];

export default function Faq() {
  return (
    <section className="bg-[#f6f0e7] px-4 py-18 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#8b6748]">
            FAQ
          </p>
          <h2 className="mt-3 text-3xl font-bold text-[#2f241b] sm:text-4xl">
            Common questions, answered clearly
          </h2>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {faqs.map((item) => (
            <article key={item.question} className="rounded-3xl bg-[#fffdf9] p-6 shadow-sm ring-1 ring-[#e5d7c7]">
              <h3 className="text-lg font-semibold text-[#2f241b]">{item.question}</h3>
              <p className="mt-3 text-sm leading-6 text-[#72604f]">{item.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
