
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const WelcomeScreen = () => {
  return (
    <div className="min-h-screen overflow-hidden bg-[#0b1020] text-white selection:bg-lime-300 selection:text-black">

      {/* NAVBAR */}
      <nav className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-300 text-xl font-black text-[#0b1020]">
            Q
          </div>
          <span className="text-xl font-bold tracking-tight">
            Quick<span className="text-lime-300">&</span>Pick
          </span>
        </motion.div>

        <div className="hidden items-center gap-9 text-sm text-gray-300 md:flex">
            <h1>Travel with benefit</h1>

        </div>




        <Link

          to={"https://www.google.com"}
          className="rounded-full bg-lime-300 px-5 py-3 text-sm font-bold text-[#0b1020] transition hover:bg-lime-200"
        >
          Sign In →
        </Link>
      </nav>

      {/* HERO */}
      <main className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 pb-24 pt-12 lg:grid-cols-2 lg:px-10 lg:pt-20">

        {/* Background glow */}
        <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-lime-300/10 blur-[120px]" />
        <div className="pointer-events-none absolute right-0 top-40 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px]" />

        {/* LEFT CONTENT */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="relative z-10"
        >
          <motion.div

            className="mb-7 inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/10 px-4 py-2 text-xs font-semibold text-lime-300"
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-lime-300" />
            THE SMARTER WAY TO SEND PARCELS
          </motion.div>

          <motion.h1

            className="max-w-2xl text-5xl font-black leading-[1.12] tracking-tight sm:text-6xl lg:text-7xl"
          >
            Your journey.
            <br />
            Their delivery.
            <br />
            <span className="text-lime-300">Everyone wins.</span>
          </motion.h1>

          <motion.p
            
            className="mt-7 max-w-lg text-base leading-8 text-gray-400 sm:text-lg"
          >
            Going somewhere? Carry a little extra.
            Need to send something? Find someone already
            heading there.

            <span className="font-semibold text-white">
              {" "}Travel together. Deliver smarter.
            </span>
          </motion.p>

          {/* CTA */}
          <motion.div  className="mt-9 flex flex-wrap gap-4">
            <motion.a
              href="#get-started"
              whileHover={{ scale: 1.06, y: -3 }}
              whileTap={{ scale: 0.96 }}
              className="rounded-xl bg-lime-300 px-7 py-4 font-bold text-[#0b1020] shadow-lg shadow-lime-300/10"
            >
              Find a Traveler →
            </motion.a>

            <motion.a
              href="#how-it-works"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="rounded-xl border border-white/15 bg-white/5 px-7 py-4 font-semibold transition hover:bg-white/10"
            >
              Become a Traveler
            </motion.a>
          </motion.div>

          {/* TRUST INDICATORS */}
          <motion.div

            className="mt-12 flex flex-wrap gap-8 border-t border-white/10 pt-8"
          >
            <div>
              <p className="text-2xl font-bold">01</p>
              <p className="mt-1 text-xs text-gray-500">Connect routes</p>
            </div>
            <div>
              <p className="text-2xl font-bold">02</p>
              <p className="mt-1 text-xs text-gray-500">Share capacity</p>
            </div>
            <div>
              <p className="text-2xl font-bold">03</p>
              <p className="mt-1 text-xs text-gray-500">Deliver together</p>
            </div>
          </motion.div>
        </motion.div>

        {/* RIGHT ANIMATION */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, x: 40 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="relative mx-auto w-full max-w-xl"
        >
          <div className="relative rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.09] to-white/[0.02] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">

            {/* CARD HEADER */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
                  Route connection
                </p>
                <h2 className="mt-2 text-xl font-bold">Travel meets delivery</h2>
              </div>
              <div className="rounded-full bg-lime-300/10 px-3 py-2 text-xs font-semibold text-lime-300">
                LIVE CONCEPT
              </div>
            </div>

            {/* ROUTE */}
            <div className="relative rounded-2xl border border-white/10 bg-[#111a2c] p-5">

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">FROM</p>
                  <h3 className="mt-1 text-xl font-bold">Delhi</h3>
                </div>

                <div className="flex flex-1 items-center justify-center px-3">
                  <div className="relative h-[2px] w-full border-t border-dashed border-lime-300/50">
                    <motion.div
                      animate={{ left: ["0%", "100%", "0%"] }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute -top-[7px] text-lg"
                    >
                      🚗
                    </motion.div>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500">TO</p>
                  <h3 className="mt-1 text-xl font-bold">Jaipur</h3>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                <span className="text-sm text-gray-400">Traveler's route</span>
                <span className="rounded-lg bg-lime-300/10 px-3 py-1.5 text-xs font-semibold text-lime-300">
                  Same destination
                </span>
              </div>
            </div>

            {/* FLOATING TRAVELER CARD */}
            <motion.div
              animate={{ y: [0, -9, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="mt-5 flex items-center gap-4 rounded-2xl border border-white/10 bg-[#151f32] p-4"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-400/15 text-2xl">
                🧑‍✈️
              </div>

              <div className="flex-1">
                <h4 className="font-semibold">The Traveler</h4>
                <p className="mt-1 text-xs text-gray-400">
                  Already traveling to Jaipur
                </p>
              </div>

              <span className="text-xs font-semibold text-lime-300">
                Sharing
              </span>
            </motion.div>

            {/* PARCEL CARD */}
            <motion.div
              animate={{ y: [0, 9, 0] }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3,
              }}
              className="mt-4 flex items-center gap-4 rounded-2xl border border-lime-300/20 bg-lime-300/[0.07] p-4"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-lime-300/15 text-2xl">
                📦
              </div>

              <div className="flex-1">
                <h4 className="font-semibold">Your Parcel</h4>
                <p className="mt-1 text-xs text-gray-400">
                  Looking for a traveler
                </p>
              </div>

              <span className="rounded-lg bg-lime-300 px-3 py-2 text-xs font-bold text-[#0b1020]">
                Matched!
              </span>
            </motion.div>

            {/* BOTTOM MESSAGE */}
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400">
              <span className="text-lime-300">✦</span>
              One journey. Two happy people.
              <span className="text-lime-300">✦</span>
            </div>
          </div>

          {/* DECORATIVE FLOATING BADGE */}
          <motion.div
            animate={{ rotate: [0, 5, -5, 0], y: [0, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute -right-3 -top-5 hidden rounded-2xl border border-white/10 bg-[#1b2940] p-4 shadow-xl sm:block"
          >
            <span className="text-2xl">🌍</span>
            <p className="mt-1 text-xs font-semibold">Go places.</p>
            <p className="text-xs text-lime-300">Share more.</p>
          </motion.div>
        </motion.div>
      </main>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="border-t border-white/10 bg-[#0e1628] px-6 py-24 lg:px-10"
      >
        <div className="mx-auto max-w-7xl">

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="mx-auto mb-14 max-w-2xl text-center"
          >
            <motion.p

              className="text-sm font-bold uppercase tracking-[0.2em] text-lime-300"
            >
              Simple process
            </motion.p>
            <motion.h2

              className="mt-4 text-3xl font-black sm:text-5xl"
            >
              Two people. One smart connection.
            </motion.h2>
            <motion.p

              className="mt-5 leading-7 text-gray-400"
            >
              Whether you are sending a parcel or traveling with extra space,
              Quick & Pick brings both sides together.
            </motion.p>
          </motion.div>

          <div className="grid gap-5 md:grid-cols-2">

            <motion.div

              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -7 }}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-8"
            >
              <div className="text-4xl">📦</div>
              <h3 className="mt-6 text-2xl font-bold">I want to send</h3>
              <p className="mt-3 leading-7 text-gray-400">
                Find travelers heading to your destination. Connect with
                someone whose journey matches your delivery route.
              </p>
              <a
                href="#get-started"
                className="mt-7 inline-block font-bold text-lime-300"
              >
                Find a traveler →
              </a>
            </motion.div>

            <motion.div

              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -7 }}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-8"
            >
              <div className="text-4xl">🚗</div>
              <h3 className="mt-6 text-2xl font-bold">I am traveling</h3>
              <p className="mt-3 leading-7 text-gray-400">
                Already going somewhere? Share your available carrying
                capacity and earn by delivering compatible parcels.
              </p>
              <a
                href="#get-started"
                className="mt-7 inline-block font-bold text-lime-300"
              >
                Share my journey →
              </a>
            </motion.div>

          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section id="get-started" className="px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl"
        >
          <h2 className="text-4xl font-black sm:text-5xl">
            Every journey can do <span className="text-lime-300">more.</span>
          </h2>
          <p className="mt-5 text-gray-400">
            Make your next journey more meaningful with Quick & Pick.
          </p>
          <motion.a
            href="#"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            className="mt-8 inline-block rounded-xl bg-lime-300 px-8 py-4 font-bold text-[#0b1020]"
          >
            Let's Get Started →
          </motion.a>
        </motion.div>
      </section>

      <footer className="border-t border-white/10 px-6 py-7 text-center text-sm text-gray-500">
        © 2026 Quick & Pick. Moving things, connecting people.
      </footer>

    </div>
  );
};

export default WelcomeScreen;
