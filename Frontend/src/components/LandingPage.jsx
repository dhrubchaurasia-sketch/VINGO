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