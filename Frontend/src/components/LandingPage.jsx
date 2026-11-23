import React from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaStar,
  FaMotorcycle,
  FaClock,
  FaShieldAlt,
  FaUtensils,
  FaChevronRight,
  FaInstagram,
  FaFacebook,
  FaTwitter,
} from "react-icons/fa";

const categories = [
  {
    name: "Pizza",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400",
    emoji: "🍕",
  },
  {
    name: "Burger",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
    emoji: "🍔",
  },
  {
    name: "Biryani",
    image:
      "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400",
    emoji: "🍛",
  },
  {
    name: "Desserts",
    image:
      "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400",
    emoji: "🍰",
  },
  {
    name: "Pasta",
    image:
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400",
    emoji: "🍝",
  },
  {
    name: "Drinks",
    image:
      "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400",
    emoji: "🥤",
  },
];

const popularFoods = [
  {
    name: "Margherita Pizza",
    category: "Italian Food",
    price: 249,
    rating: 4.8,
    time: "25 min",
    image:
      "https://images.unsplash.com/photo-1579751626657-72bc17010498?w=700",
  },
  {
    name: "Classic Burger",
    category: "Fast Food",
    price: 179,
    rating: 4.9,
    time: "20 min",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=700",
  },
  {
    name: "Chicken Biryani",
    category: "Indian Food",
    price: 299,
    rating: 4.9,
    time: "30 min",
    image:
      "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=700",
  },
];

const features = [
  {
    icon: <FaMotorcycle />,
    title: "Fast Delivery",
    description:
      "Get your favourite meals delivered quickly right to your doorstep.",
  },
  {
    icon: <FaUtensils />,
    title: "Quality Food",
    description:
      "Discover delicious food prepared with fresh and quality ingredients.",
  },
  {
    icon: <FaShieldAlt />,
    title: "Secure Payments",
    description:
      "Enjoy safe and convenient online payments with a seamless checkout.",
  },
];

function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-[#fff9f6] text-gray-900 overflow-hidden">

      {/* ================= NAVBAR ================= */}

      <nav className="w-full bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-5 md:px-10 py-4 flex items-center justify-between">

          <Link to="/" className="text-3xl font-extrabold tracking-tight">
            VINGO<span className="text-[#ff4d2d]">.</span>
          </Link>

          <div className="hidden md:flex items-center gap-9 text-sm font-semibold text-gray-600">
            <a href="#home" className="hover:text-[#ff4d2d] transition">
              Home
            </a>

            <a href="#categories" className="hover:text-[#ff4d2d] transition">
              Categories
            </a>

            <a href="#popular" className="hover:text-[#ff4d2d] transition">
              Popular Food
            </a>

            <a href="#about" className="hover:text-[#ff4d2d] transition">
              About Us
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/signin"
              className="hidden sm:block text-sm font-bold hover:text-[#ff4d2d] transition"
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="bg-[#ff4d2d] text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-[#e94325] hover:shadow-lg hover:shadow-orange-200 transition-all"
            >
              Get Started
            </Link>
          </div>

        </div>
      </nav>

      {/* ================= HERO SECTION ================= */}

      <section
        id="home"
        className="max-w-7xl mx-auto px-5 md:px-10 pt-16 pb-20 md:pt-24 md:pb-28 grid lg:grid-cols-2 items-center gap-12"
      >

        {/* LEFT CONTENT */}

        <div className="space-y-7">

          <div className="inline-flex items-center gap-2 bg-orange-100 text-[#ff4d2d] px-5 py-2.5 rounded-full text-sm font-bold">
            <span>🔥</span>
            Delicious food, delivered fresh
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.12] tracking-tight">
            Good Food.
            <br />
            Great Mood.
            <br />
            <span className="text-[#ff4d2d]">
              Delivered Fast.
            </span>
          </h1>

          <p className="text-gray-500 text-base md:text-lg leading-8 max-w-xl">
            Craving something delicious? Discover amazing restaurants,
            explore your favourite dishes and get fresh food delivered
            right to your doorstep with VINGO.
          </p>

          <div className="flex flex-wrap items-center gap-4">

            <Link
              to="/signin"
              className="flex items-center gap-3 bg-[#ff4d2d] text-white px-7 py-4 rounded-xl font-bold shadow-lg shadow-orange-200 hover:-translate-y-1 hover:bg-[#e94325] transition-all"
            >
              Order Now
              <FaArrowRight />
            </Link>

            <a
              href="#popular"
              className="flex items-center gap-3 border border-gray-200 bg-white px-7 py-4 rounded-xl font-bold hover:border-[#ff4d2d] hover:text-[#ff4d2d] transition-all"
            >
              Explore Food
              <FaChevronRight className="text-xs" />
            </a>

          </div>

          {/* STATS */}

          <div className="flex flex-wrap gap-10 pt-8">

            <div>
              <h2 className="text-3xl font-extrabold">500+</h2>
              <p className="text-sm text-gray-500 mt-1">Food Items</p>
            </div>

            <div>
              <h2 className="text-3xl font-extrabold">100+</h2>
              <p className="text-sm text-gray-500 mt-1">Restaurants</p>
            </div>

            <div>
              <h2 className="text-3xl font-extrabold">4.9★</h2>
              <p className="text-sm text-gray-500 mt-1">Customer Rating</p>
            </div>

          </div>

        </div>

        {/* RIGHT IMAGE */}

        <div className="relative flex justify-center items-center">

          <div className="absolute w-75 h-75 sm:w-107.5 sm:h-107.5 bg-orange-200 rounded-full blur-2xl opacity-60"></div>

          <div className="relative w-full max-w-132.5 aspect-square rounded-[40px] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1547592180-85f173990554?w=1000"
              alt="Delicious food"
              className="w-full h-full object-cover rounded-[40px]"
            />
          </div>

          {/* FLOATING CARD */}

          <div className="absolute top-10 -left-2 sm:left-0 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-2xl">
              🍔
            </div>

            <div>
              <h3 className="font-bold text-sm">Fresh & Tasty</h3>
              <p className="text-xs text-gray-400">Made with love</p>
            </div>
          </div>

          <div className="absolute bottom-10 -right-2 sm:right-0 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-xl text-green-600">
              <FaMotorcycle />
            </div>

            <div>
              <h3 className="font-bold text-sm">Fast Delivery</h3>
              <p className="text-xs text-gray-400">At your doorstep</p>
            </div>
          </div>

        </div>

      </section>

      {/* ================= CATEGORIES ================= */}

      <section
        id="categories"
        className="bg-white py-20 px-5 md:px-10"
      >

        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-14">
            <span className="text-[#ff4d2d] text-sm font-extrabold tracking-[3px]">
              EXPLORE CATEGORIES
            </span>

            <h2 className="text-3xl md:text-4xl font-extrabold mt-4">
              What are you craving today?
            </h2>

            <p className="text-gray-500 mt-4">
              Discover something delicious for every mood.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">

            {categories.map((category, index) => (
              <Link
                to="/signin"
                key={index}
                className="group bg-[#fff9f6] rounded-2xl p-5 text-center border border-orange-50 hover:border-[#ff4d2d] hover:shadow-xl hover:shadow-orange-100 hover:-translate-y-2 transition-all"
              >

                <div className="w-24 h-24 mx-auto rounded-full overflow-hidden mb-4 bg-orange-100">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                <h3 className="font-bold group-hover:text-[#ff4d2d] transition">
                  {category.name}
                </h3>

              </Link>
            ))}

          </div>

        </div>

      </section>

      {/* ================= POPULAR FOOD ================= */}

      <section
        id="popular"
        className="py-20 px-5 md:px-10 bg-[#fff9f6]"
      >

        <div className="max-w-7xl mx-auto">

          <div className="flex flex-wrap justify-between items-end gap-5 mb-12">

            <div>
              <span className="text-[#ff4d2d] text-sm font-extrabold tracking-[3px]">
                CUSTOMER FAVOURITES
              </span>

              <h2 className="text-3xl md:text-4xl font-extrabold mt-4">
                Popular Dishes
              </h2>

              <p className="text-gray-500 mt-3">
                Taste the dishes everyone is talking about.
              </p>
            </div>

            <Link
              to="/signin"
              className="flex items-center gap-2 text-[#ff4d2d] font-bold hover:gap-4 transition-all"
            >
              View All <FaArrowRight />
            </Link>

          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">

            {popularFoods.map((food, index) => (

              <div
                key={index}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
              >

                <div className="relative h-60 overflow-hidden">

                  <img
                    src={food.image}
                    alt={food.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />

                  <div className="absolute top-4 right-4 bg-white px-3 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md">
                    <FaStar className="text-yellow-400" />
                    {food.rating}
                  </div>

                </div>

                <div className="p-6">

                  <p className="text-[#ff4d2d] text-xs font-bold uppercase tracking-wider">
                    {food.category}
                  </p>

                  <h3 className="text-xl font-extrabold mt-2">
                    {food.name}
                  </h3>

                  <div className="flex items-center gap-2 text-gray-400 text-sm mt-3">
                    <FaClock />
                    {food.time}
                  </div>

                  <div className="flex justify-between items-center mt-6">

                    <h3 className="text-2xl font-extrabold">
                      ₹{food.price}
                    </h3>

                    <Link
                      to="/signin"
                      className="w-11 h-11 rounded-xl bg-[#ff4d2d] text-white flex items-center justify-center text-xl hover:bg-[#e94325] transition"
                    >
                      +
                    </Link>

                  </div>

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* ================= FEATURES ================= */}

      <section
        id="about"
        className="py-20 px-5 md:px-10 bg-white"
      >

        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-14">
            <span className="text-[#ff4d2d] text-sm font-extrabold tracking-[3px]">
              WHY CHOOSE VINGO
            </span>

            <h2 className="text-3xl md:text-4xl font-extrabold mt-4">
              More Than Just Food Delivery
            </h2>

            <p className="text-gray-500 mt-4">
              We make every food experience special.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">

            {features.map((feature, index) => (

              <div
                key={index}
                className="text-center p-9 rounded-3xl bg-[#fff9f6] border border-orange-50 hover:shadow-xl hover:shadow-orange-100 transition-all"
              >

                <div className="w-16 h-16 rounded-2xl bg-orange-100 text-[#ff4d2d] flex items-center justify-center text-2xl mx-auto mb-6">
                  {feature.icon}
                </div>

                <h3 className="text-xl font-extrabold mb-3">
                  {feature.title}
                </h3>

                <p className="text-gray-500 leading-7 text-sm">
                  {feature.description}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* ================= HOW IT WORKS ================= */}

      <section className="py-20 px-5 md:px-10 bg-[#fff9f6]">

        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-14">
            <span className="text-[#ff4d2d] text-sm font-extrabold tracking-[3px]">
              SIMPLE PROCESS
            </span>

            <h2 className="text-3xl md:text-4xl font-extrabold mt-4">
              How VINGO Works
            </h2>

            <p className="text-gray-500 mt-4">
              Your favourite food is just three steps away.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">

            {[
              {
                number: "01",
                emoji: "🍽️",
                title: "Choose Your Food",
                desc: "Explore nearby restaurants and discover your favourite dishes.",
              },
              {
                number: "02",
                emoji: "💳",
                title: "Place Your Order",
                desc: "Add items to your cart and make a secure payment.",
              },
              {
                number: "03",
                emoji: "🛵",
                title: "Enjoy Your Food",
                desc: "Track your order and enjoy fresh food at your doorstep.",
              },
            ].map((step, index) => (

              <div key={index} className="text-center relative">

                <div className="text-5xl font-extrabold text-orange-100">
                  {step.number}
                </div>

                <div className="text-5xl my-5">
                  {step.emoji}
                </div>

                <h3 className="text-xl font-extrabold">
                  {step.title}
                </h3>

                <p className="text-gray-500 mt-3 text-sm leading-7 max-w-xs mx-auto">
                  {step.desc}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* ================= CTA ================= */}

      <section className="px-5 md:px-10 py-20 bg-white">

        <div className="max-w-7xl mx-auto bg-[#ff4d2d] rounded-[35px] p-10 md:p-16 relative overflow-hidden">

          <div className="absolute -right-20 -top-24 w-80 h-80 bg-white/10 rounded-full"></div>

          <div className="absolute right-40 -bottom-40 w-80 h-80 bg-white/10 rounded-full"></div>

          <div className="relative z-10 max-w-2xl">

            <span className="text-orange-100 text-sm font-bold tracking-[3px]">
              YOUR CRAVINGS, OUR PRIORITY
            </span>

            <h2 className="text-4xl md:text-6xl text-white font-extrabold mt-5 leading-tight">
              Hungry?
              <br />
              Let's Get You
              <br />
              Something Delicious.
            </h2>

            <p className="text-orange-100 mt-6 leading-7">
              Your favourite meals are waiting for you.
              Start exploring and order something amazing today!
            </p>

            <Link
              to="/signin"
              className="inline-flex items-center gap-3 mt-8 bg-white text-[#ff4d2d] px-7 py-4 rounded-xl font-extrabold hover:-translate-y-1 hover:shadow-xl transition-all"
            >
              Start Ordering
              <FaArrowRight />
            </Link>

          </div>

          <div className="absolute right-10 bottom-0 text-[180px] md:text-[260px] opacity-20 rotate-[-15deg]">
            🍔
          </div>

        </div>

      </section>

      {/* ================= FOOTER ================= */}

      <footer className="bg-[#171717] text-white px-5 md:px-10 pt-16 pb-7">

        <div className="max-w-7xl mx-auto">

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 pb-14">

            <div>

              <h2 className="text-3xl font-extrabold">
                VINGO<span className="text-[#ff4d2d]">.</span>
              </h2>

              <p className="text-gray-400 text-sm leading-7 mt-5 max-w-xs">
                Making food ordering simple, convenient and delicious.
                Bringing your favourite food closer to you.
              </p>

              <div className="flex gap-4 mt-6">

                {[FaInstagram, FaFacebook, FaTwitter].map((Icon, index) => (
                  <a
                    key={index}
                    href="#home"
                    aria-label="Social media"
                    className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-[#ff4d2d] transition"
                  >
                    <Icon />
                  </a>
                ))}

              </div>

            </div>

            <div>
              <h3 className="font-extrabold text-lg mb-6">
                Quick Links
              </h3>

              <div className="flex flex-col gap-4 text-gray-400 text-sm">
                <a href="#home" className="hover:text-[#ff4d2d]">Home</a>
                <a href="#categories" className="hover:text-[#ff4d2d]">Categories</a>
                <a href="#popular" className="hover:text-[#ff4d2d]">Popular Food</a>
                <a href="#about" className="hover:text-[#ff4d2d]">About Us</a>
              </div>
            </div>

            <div>
              <h3 className="font-extrabold text-lg mb-6">
                Account
              </h3>

              <div className="flex flex-col gap-4 text-gray-400 text-sm">
                <Link to="/signin" className="hover:text-[#ff4d2d]">Login</Link>
                <Link to="/signup" className="hover:text-[#ff4d2d]">Register</Link>
              </div>
            </div>

            <div>
              <h3 className="font-extrabold text-lg mb-6">
                Contact Us
              </h3>

              <div className="flex flex-col gap-4 text-gray-400 text-sm">
                <p>India</p>
                <p>support@vingo.com</p>
                <p>Food delivered with love ❤️</p>
              </div>
            </div>

          </div>

          <div className="border-t border-white/10 pt-7 flex flex-col sm:flex-row justify-between items-center gap-4 text-gray-500 text-sm">

            <p>© 2026 VINGO. All rights reserved.</p>

            <p>Made with ❤️ for food lovers.</p>

          </div>

        </div>

      </footer>

    </div>
  );
}

export default LandingPage;