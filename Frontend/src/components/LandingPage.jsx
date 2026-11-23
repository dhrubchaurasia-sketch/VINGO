import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  FaArrowRight,
  FaStar,
  FaMotorcycle,
  FaClock,
  FaShieldAlt,
  FaUtensils,
  FaInstagram,
  FaFacebook,
  FaTwitter,
  FaBars,
  FaTimes,
  FaCheck,
  FaPlus,
  FaQuoteLeft,
  FaMapMarkerAlt,
} from "react-icons/fa";

/* ------------------------------------------------------------------ */
/* DATA                                                                */
/* ------------------------------------------------------------------ */

const categories = [
  { name: "All", emoji: "🍽️" },
  { name: "Pizza", emoji: "🍕" },
  { name: "Burger", emoji: "🍔" },
  { name: "Biryani", emoji: "🍛" },
  { name: "Pasta", emoji: "🍝" },
  { name: "Desserts", emoji: "🍰" },
  { name: "Drinks", emoji: "🥤" },
];

const dishes = [
  {
    name: "Margherita Pizza",
    category: "Pizza",
    price: 249,
    rating: 4.8,
    time: "25 min",
    tag: "Bestseller",
    image: "https://images.unsplash.com/photo-1579751626657-72bc17010498?w=700",
  },
  {
    name: "Loaded Pepperoni",
    category: "Pizza",
    price: 329,
    rating: 4.7,
    time: "28 min",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=700",
  },
  {
    name: "Classic Burger",
    category: "Burger",
    price: 179,
    rating: 4.9,
    time: "20 min",
    tag: "Most loved",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=700",
  },
  {
    name: "Chicken Biryani",
    category: "Biryani",
    price: 299,
    rating: 4.9,
    time: "30 min",
    tag: "Bestseller",
    image: "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=700",
  },
  {
    name: "Creamy Alfredo Pasta",
    category: "Pasta",
    price: 219,
    rating: 4.6,
    time: "22 min",
    image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=700",
  },
  {
    name: "Choco Lava Cake",
    category: "Desserts",
    price: 129,
    rating: 4.8,
    time: "15 min",
    tag: "Sweet pick",
    image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=700",
  },
  {
    name: "Iced Cold Coffee",
    category: "Drinks",
    price: 99,
    rating: 4.5,
    time: "10 min",
    image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=700",
  },
];

const features = [
  {
    icon: <FaUtensils />,
    title: "Fresh, quality food",
    description:
      "Every restaurant is checked for hygiene and ingredient quality before it goes live.",
  },
  {
    icon: <FaShieldAlt />,
    title: "Safe payments",
    description:
      "Pay with UPI, cards or wallets through a secure checkout. No card details stored on our side.",
  },
  {
    icon: <FaMotorcycle />,
    title: "Fast delivery",
    description:
      "Riders pick up the moment your food is ready, so it reaches you hot.",
  },
];

const steps = [
  {
    title: "Pick your food",
    desc: "Browse nearby restaurants and add your favourite dishes to the cart.",
  },
  {
    title: "Pay securely",
    desc: "Check out with UPI, card or wallet in a few taps.",
  },
  {
    title: "Track and eat",
    desc: "Follow your rider live on the map until the food reaches your door.",
  },
];

const reviews = [
  {
    name: "Aarav Patel",
    text: "Biryani arrived hot and in under 30 minutes. The live tracking is actually accurate.",
  },
  {
    name: "Neha Sharma",
    text: "Clean app, no confusing menus. Ordered for the whole hostel floor without a single issue.",
  },
  {
    name: "Rohan Mehta",
    text: "Payment was smooth and the refund for a missing item came back the same day.",
  },
];

const trackerStates = [
  { label: "Order confirmed", eta: "28 min", progress: 20 },
  { label: "Chef is preparing", eta: "20 min", progress: 45 },
  { label: "Rider picked it up", eta: "12 min", progress: 75 },
  { label: "Arriving at your door", eta: "2 min", progress: 100 },
];

const navLinks = [
  { href: "#how", label: "How it works" },
  { href: "#why", label: "Why VINGO" },
  { href: "#reviews", label: "Reviews" },
];

/* ------------------------------------------------------------------ */
/* SMALL PIECES                                                        */
/* ------------------------------------------------------------------ */

function OrderTracker() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % trackerStates.length),
      2600,
    );

    return () => clearInterval(id);
  }, []);

  const state = trackerStates[index];

  return (
    <div className="bg-white rounded-3xl p-5 shadow-2xl shadow-orange-900/10 w-64 sm:w-72">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">Order #2041</p>
        <span className="text-xs font-bold text-[#1f8a4c] bg-green-50 px-2.5 py-1 rounded-full">
          Live
        </span>
      </div>

      <p className="font-display text-lg font-bold mt-3 leading-tight">
        {state.label}
      </p>

      <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
        <FaClock className="text-xs" /> Arrives in {state.eta}
      </p>

      <div className="h-2 bg-orange-100 rounded-full mt-4 overflow-hidden">
        <div
          className="h-full bg-[#ff4d2d] rounded-full transition-all duration-700 ease-out"
          style={{ width: `${state.progress}%` }}
        />
      </div>

      <div className="flex justify-between mt-3">
        {trackerStates.map((s, i) => (
          <span
            key={s.label}
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] transition-colors duration-500 ${
              i <= index
                ? "bg-[#ff4d2d] text-white"
                : "bg-orange-100 text-transparent"
            }`}
          >
            <FaCheck />
          </span>
        ))}
      </div>
    </div>
  );
}

function DishCard({ dish }) {
  return (
    <article className="group bg-white rounded-3xl overflow-hidden border border-orange-100 hover:border-[#ff4d2d]/40 transition-colors flex flex-col">
      <div className="relative h-56 bg-orange-100 overflow-hidden">
        <img
          src={dish.image}
          alt={dish.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {dish.tag && (
          <span className="absolute top-4 left-4 bg-[#1b1210] text-white text-xs font-semibold px-3 py-1.5 rounded-full">
            {dish.tag}
          </span>
        )}

        <span className="absolute top-4 right-4 bg-white text-sm font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow">
          <FaStar className="text-yellow-400 text-xs" />
          {dish.rating}
        </span>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <p className="text-sm text-gray-500">{dish.category}</p>
        <h3 className="font-display text-xl font-bold mt-1">{dish.name}</h3>

        <p className="flex items-center gap-2 text-sm text-gray-500 mt-3">
          <FaClock className="text-xs" /> {dish.time}
        </p>

        <div className="flex items-center justify-between mt-auto pt-6">
          <p className="font-display text-2xl font-bold">₹{dish.price}</p>

          <Link
            to="/signin"
            aria-label={`Order ${dish.name}`}
            className="flex items-center gap-2 bg-[#ff4d2d] text-white pl-4 pr-3.5 py-2.5 rounded-full text-sm font-bold hover:bg-[#e03a1b] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff4d2d]"
          >
            Add <FaPlus className="text-xs" />
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* PAGE                                                                */
/* ------------------------------------------------------------------ */

function LandingPage() {
  const currentCity = useSelector((state) => state.user.currentCity);
  const [activeFeature, setActiveFeature] = useState(0);

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);

    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const visibleDishes =
    activeCategory === "All"
      ? dishes
      : dishes.filter((d) => d.category === activeCategory);

  return (
    <div className="vingo min-h-screen w-full bg-[#fff8f3] text-[#1b1210] overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=DM+Sans:wght@400;500;600;700&display=swap');

        .vingo { font-family: 'DM Sans', system-ui, sans-serif; }
        .vingo .font-display { font-family: 'Bricolage Grotesque', 'DM Sans', system-ui, sans-serif; letter-spacing: -0.02em; }
        .vingo html { scroll-behavior: smooth; }

        @keyframes vingo-rise {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes vingo-pop {
          from { opacity: 0; transform: scale(.9) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        @keyframes vingo-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        @keyframes vingo-bob {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }

        .vingo .rise { opacity: 0; animation: vingo-rise .7s cubic-bezier(.2,.7,.2,1) forwards; }
        .vingo .pop { opacity: 0; animation: vingo-pop .6s cubic-bezier(.2,.7,.2,1) forwards; }
        .vingo .marquee-track { animation: vingo-marquee 28s linear infinite; }
        .vingo .bob { animation: vingo-bob 5s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .vingo .rise, .vingo .pop { animation: none; opacity: 1; }
          .vingo .marquee-track, .vingo .bob { animation: none; }
        }
      `}</style>

      {/* NAVBAR */}

      <header
        className={`sticky top-0 z-50 transition-all ${
          scrolled
            ? "bg-white/90 backdrop-blur-md border-b border-orange-100"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-5 md:px-10 h-18 flex items-center justify-between">
          <Link to="/" className="font-display text-3xl text-[#ff4d2d] font-extrabold">
            VINGO
          </Link>

          <div className="hidden md:flex items-center gap-9 text-sm font-semibold text-gray-600">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="hover:text-[#ff4d2d] transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/signin"
              className="hidden sm:block text-sm font-bold px-4 py-2 hover:text-[#ff4d2d] transition-colors"
            >
              Log in
            </Link>

            <Link
              to="/signup"
              className="bg-[#1b1210] text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-[#ff4d2d] transition-colors"
            >
              Sign up
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="md:hidden w-10 h-10 rounded-full bg-white border border-orange-100 flex items-center justify-center"
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </nav>

        {menuOpen && (
          <div className="md:hidden bg-white border-t border-orange-100 px-5 py-4 flex flex-col">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="py-3 font-semibold text-gray-700 border-b border-orange-50 last:border-0"
              >
                {l.label}
              </a>
            ))}

            <Link
              to="/signin"
              className="py-3 font-semibold text-[#ff4d2d]"
              onClick={() => setMenuOpen(false)}
            >
              Log in
            </Link>
          </div>
        )}
      </header>

      {/* HERO */}

      <section className="max-w-7xl mx-auto px-5 md:px-10 pt-10 pb-20 md:pt-16 md:pb-28 grid lg:grid-cols-[1.05fr_1fr] items-center gap-14">
        <div>
          <p
            className="rise inline-flex items-center gap-2 bg-white border border-orange-100 rounded-full pl-2 pr-4 py-1.5 text-sm font-semibold"
            style={{ animationDelay: "0ms" }}
          >
            <span className="w-7 h-7 rounded-full bg-[#ff4d2d] text-white flex items-center justify-center text-xs">
              <FaMapMarkerAlt />
            </span>

            {currentCity
              ? `Delivering in ${currentCity}`
              : "Detecting your location..."}
          </p>

          <h1
            className="rise font-display text-5xl sm:text-6xl xl:text-7xl font-extrabold leading-[1.02] mt-6"
            style={{ animationDelay: "100ms" }}
          >
            Hot food at your door in 30 minutes.
          </h1>

          <p
            className="rise text-gray-600 text-lg leading-8 max-w-lg mt-6"
            style={{ animationDelay: "220ms" }}
          >
            Order from 100+ local restaurants, track your rider live, and pay
            securely. Pizza, biryani, burgers and more, a few taps away.
          </p>

          <div
            className="rise flex flex-wrap items-center gap-4 mt-9"
            style={{ animationDelay: "340ms" }}
          >
            <Link
              to="/signin"
              className="flex items-center gap-3 bg-[#ff4d2d] text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-orange-300/50 hover:bg-[#e03a1b] hover:-translate-y-0.5 transition-all"
            >
              Order now <FaArrowRight />
            </Link>
          </div>

          <div
            className="rise flex flex-wrap gap-x-10 gap-y-5 mt-12"
            style={{ animationDelay: "460ms" }}
          >
            {[
              ["500+", "dishes to choose from"],
              ["100+", "partner restaurants"],
              ["4.9", "average customer rating"],
            ].map(([num, label]) => (
              <div key={label}>
                <p className="font-display text-3xl font-extrabold">{num}</p>
                <p className="text-sm text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* HERO VISUAL */}

        <div className="relative flex justify-center lg:justify-end w-full">
          <div
            className="pop relative w-full max-w-220 aspect-4/3  -translate-y-6 rounded-[48px] rounded-br-[150px] overflow-hidden bg-orange-100 shadow-2xl shadow-orange-900/15"
            style={{ animationDelay: "250ms" }}
          >
            <img
              src="/vingo-logo_1.webp"
              alt="Delicious restaurant food spread"
              className="w-full h-full object-cover"
            />
          </div>

          
        </div>
      </section>

      {/* HOW IT WORKS */}

      <section id="how" className="py-20 md:py-28 px-5 md:px-10 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[0.8fr_1.2fr] gap-14 items-start">
          <div className="lg:sticky lg:top-28">
            <h2 className="font-display text-4xl md:text-5xl font-extrabold leading-tight">
              From craving to doorstep in three steps.
            </h2>

            <p className="text-gray-600 mt-4 text-lg max-w-md">
              No phone calls, no waiting on hold. Just pick, pay and track.
            </p>

            <Link
              to="/signup"
              className="inline-flex items-center gap-3 mt-8 bg-[#ff4d2d] text-white px-7 py-4 rounded-full font-bold hover:bg-[#e03a1b] transition-colors"
            >
              Create free account <FaArrowRight />
            </Link>
          </div>

          <ol className="space-y-5">
            {steps.map((step, i) => (
              <li
                key={step.title}
                className="flex gap-6 items-start bg-[#fff8f3] border border-orange-100 rounded-3xl p-7"
              >
                <span className="font-display text-5xl font-extrabold text-[#ff4d2d] leading-none">
                  {i + 1}
                </span>

                <div>
                  <h3 className="font-display text-2xl font-bold">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 mt-2 leading-7">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============================ WHY ============================== */}

      <section id="why" className="py-20 md:py-28 px-5 md:px-10">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl font-extrabold leading-tight max-w-2xl">
            More than just food delivery.
          </h2>

          <div className="grid md:grid-cols-3 gap-7 mt-12">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white border border-orange-100 rounded-3xl p-8
          transition-all duration-300 ease-in-out
          hover:-translate-y-3 hover:scale-[1.03] hover:shadow-2xl hover:border-[#ff4d2d]/40"
              >
                <div className="w-14 h-14 rounded-2xl bg-orange-100 text-[#ff4d2d] flex items-center justify-center text-2xl">
                  {f.icon}
                </div>

                <h3 className="font-display text-2xl font-bold mt-7">
                  {f.title}
                </h3>

                <p className="mt-3 leading-7 text-gray-600">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}

      <section id="reviews" className="py-20 md:py-28 px-5 md:px-10 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl font-extrabold leading-tight">
            Loved by hungry people.
          </h2>

          <div className="grid md:grid-cols-3 gap-7 mt-12">
            {reviews.map((r) => (
              <figure
                key={r.name}
                className="bg-[#fff8f3] border border-orange-100 rounded-3xl p-8 flex flex-col"
              >
                <FaQuoteLeft className="text-[#ff4d2d] text-2xl" />

                <blockquote className="mt-5 text-lg leading-8 flex-1">
                  {r.text}
                </blockquote>

                <figcaption className="flex items-center gap-3 mt-7">
                  <span className="w-11 h-11 rounded-full bg-[#ffc93c] flex items-center justify-center font-display font-bold">
                    {r.name.charAt(0)}
                  </span>

                  <span className="font-bold leading-tight">{r.name}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}

      <section className="px-5 md:px-10 py-20 md:py-28">
        <div className="max-w-7xl mx-auto bg-[#ff4d2d] rounded-[40px] p-10 md:p-16 relative overflow-hidden">
          <div className="absolute -right-24 -top-28 w-96 h-96 bg-white/10 rounded-full" />
          <div className="absolute right-44 -bottom-48 w-96 h-96 bg-[#ffc93c]/30 rounded-full" />

          <div className="relative z-10 max-w-2xl">
            <h2 className="font-display text-4xl md:text-6xl text-white font-extrabold leading-[1.05]">
              Hungry? Your first order is a few taps away.
            </h2>

            <p className="text-white/85 mt-6 text-lg leading-8 max-w-lg">
              Create an account, pick a dish and we will handle the rest.
            </p>

            <div className="flex flex-wrap gap-4 mt-9">
              <Link
                to="/signup"
                className="inline-flex items-center gap-3 bg-white text-[#ff4d2d] px-8 py-4 rounded-full font-extrabold hover:-translate-y-0.5 hover:shadow-xl transition-all"
              >
                Start ordering <FaArrowRight />
              </Link>

              <Link
                to="/signin"
                className="px-8 py-4 rounded-full font-bold text-white border-2 border-white/40 hover:bg-white/10 transition-colors"
              >
                I already have an account
              </Link>
            </div>
          </div>

          <div
            className="hidden md:block absolute right-10 bottom-0 text-[240px] opacity-25 -rotate-12 select-none"
            aria-hidden="true"
          >
            🍔
          </div>
        </div>
      </section>

      {/* FOOTER */}

      <footer className="bg-[#1b1210] text-white px-5 md:px-10 pt-16 pb-7">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 pb-14">
            <div>
              <h2 className="font-display text-3xl font-extrabold text-[#FFF9F6]">
                VINGO
              </h2>

              <p className="text-white/60 text-sm leading-7 mt-5 max-w-xs">
                Making food ordering simple, fast and delicious. Bringing your
                favourite food closer to you.
              </p>

              <div className="flex gap-3 mt-6">
                {[
                  [FaInstagram, "Instagram"],
                  [FaFacebook, "Facebook"],
                  [FaTwitter, "Twitter"],
                ].map(([Icon, label]) => (
                  <a
                    key={label}
                    href="#top"
                    aria-label={label}
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#ff4d2d] transition-colors"
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-display font-bold text-lg mb-6">
                Quick links
              </h3>

              <div className="flex flex-col gap-4 text-white/60 text-sm">
                {navLinks.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    className="hover:text-[#ff4d2d] transition-colors"
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-display font-bold text-lg mb-6">Account</h3>

              <div className="flex flex-col gap-4 text-white/60 text-sm">
                <Link
                  to="/signin"
                  className="hover:text-[#ff4d2d] transition-colors"
                >
                  Log in
                </Link>

                <Link
                  to="/signup"
                  className="hover:text-[#ff4d2d] transition-colors"
                >
                  Create account
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-display font-bold text-lg mb-6">
                Contact us
              </h3>

              <div className="flex flex-col gap-4 text-white/60 text-sm">
                <p>India</p>
                <p>support@vingo.com</p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-7 flex flex-col sm:flex-row justify-between items-center gap-4 text-white/40 text-sm">
            <p>© 2026 VINGO. All rights reserved.</p>
            <p>Made with ❤️ for food lovers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
