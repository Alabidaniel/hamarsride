import { motion as Motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Services from "../components/Services";
import How from "../components/How";
import WhyChooseUs from "../components/WhyChooseUs";
import Faq from "../components/Faq";
import Footer from "../components/Footer";

export default function LandingPage() {
  const sectionVariants = {
    hidden: { opacity: 0, y: 32 },
    show: (delay = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut", delay },
    }),
  };

  return (
    <div style={{ fontFamily: "Playfair Display" }} className="bg-[#f6f0e7] text-[#2f241b]">
      <Motion.div initial="hidden" animate="show" custom={0} variants={sectionVariants}>
        <Navbar />
      </Motion.div>
      <Motion.div initial="hidden" animate="show" custom={0.08} variants={sectionVariants}>
        <Hero />
      </Motion.div>
      <Motion.div initial="hidden" animate="show" custom={0.16} variants={sectionVariants}>
        <Services />
      </Motion.div>
      <Motion.div initial="hidden" animate="show" custom={0.24} variants={sectionVariants}>
        <How />
      </Motion.div>
      <Motion.div initial="hidden" animate="show" custom={0.32} variants={sectionVariants}>
        <WhyChooseUs />
      </Motion.div>
      <Motion.div initial="hidden" animate="show" custom={0.4} variants={sectionVariants}>
        <Faq />
      </Motion.div>
      <Motion.div initial="hidden" animate="show" custom={0.48} variants={sectionVariants}>
        <Footer />
      </Motion.div>
    </div>
  );
}
