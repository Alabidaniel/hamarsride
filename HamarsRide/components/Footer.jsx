import React from "react";

export default function Footer() {
  return (
    <footer className="w-full bg-orange-500 px-6 py-12 text-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-3">About Us</h3>
          <p className="text-sm leading-6 text-orange-100">
            HAMARS RIDE is a reliable delivery and transportation service focused
            on fast dispatch, safe handling, and stress-free customer experience.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Contact Us</h3>
          <p className="text-sm text-orange-100">support@hamarsride.com</p>
          <p className="text-sm text-orange-100 mt-1">+234 800 000 0000</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Social Media</h3>
          <a
            href="https://www.instagram.com/hamarsdelivery_ng?igsh=MTJrdDY4aWgycWMweA=="
            className="text-sm text-orange-100 hover:text-white transition"
            target="_blank"
            rel="noreferrer"
          >
            Instagram
          </a>
          <a
            href="https://www.facebook.com/share/1DZ57YqECU/"
            className="mt-1 block text-sm text-orange-100 hover:text-white transition"
            target="_blank"
            rel="noreferrer"
          >
            Facebook
          </a>
          <a
            href="https://www.tiktok.com/@hamarsride?_r=1&_t=ZS-94iJKfjouMp"
            className="mt-1 block text-sm text-orange-100 hover:text-white transition"
            target="_blank"
            rel="noreferrer"
          >
            TikTok
          </a>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Legal</h3>
          <p className="text-sm text-orange-100">Terms and Conditions</p>
          <p className="text-sm text-orange-100 mt-1">Privacy Policy</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-orange-400/60 text-center">
        <p className="text-sm text-orange-100">
          © 2026 HAMARS RIDE LOGISTICS AND TRANSPORTATION SERVICES
        </p>
      </div>
    </footer>
  );
}
