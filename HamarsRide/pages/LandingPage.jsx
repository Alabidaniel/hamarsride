import React from "react";
import { motion } from "framer-motion";

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import SearchRestaurant from "../components/SearchRestaurant";
import How from "../components/How";
import OrderServices from "../components/OrderServices"; // NEW
import Footer from "../components/Footer";

export default function LandingPage() {

  const slideUp = {
    hidden: { opacity: 0, y: 80 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <div style={{ fontFamily: "Playfair Display" }}>

      <motion.div
        variants={slideUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        <Navbar />
      </motion.div>

      <motion.div
        variants={slideUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        <Hero />
      </motion.div>

      <motion.div
        variants={slideUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        <SearchRestaurant />
      </motion.div>

      <motion.div
        variants={slideUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        <How />
      </motion.div>

      {/* NEW SECTION */}
      <motion.div
        variants={slideUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        <OrderServices />
      </motion.div>

      <motion.div
        variants={slideUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        <Footer />
      </motion.div>

    </div>
  );
}