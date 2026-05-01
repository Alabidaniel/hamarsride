import React from "react";

export default function Footer() {
  return (
    <footer
      className="w-full border-t border-orange-200 bg-orange-600 px-6 py-12 text-white"
      style={{ width: "100vw", marginLeft: "calc(-50vw + 50%)", boxSizing: "border-box" }}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="mb-3 text-lg font-semibold text-white">About Us</h3>
          <p className="text-sm leading-7 text-orange-50/90">
            HAMARS RIDE is a reliable delivery and transportation service focused on fast dispatch, safe handling, and
            stress-free customer experience.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-lg font-semibold text-white">Contact Us</h3>
          <p className="text-sm text-orange-50/90">hamarsrideofficial@gmail.com</p>
          <p className="mt-1 text-sm text-orange-50/90">07043640694</p>
        </div>

        <div>
          <h3 className="mb-3 text-lg font-semibold text-white">Social Media</h3>
          <a
            href="https://www.instagram.com/hamarsdelivery_ng?igsh=MTJrdDY4aWgycWMweA=="
            className="text-sm text-orange-50/90 transition hover:text-white"
            target="_blank"
            rel="noreferrer"
          >
            Instagram
          </a>
          <a
            href="https://www.facebook.com/share/1DZ57YqECU/"
            className="mt-1 block text-sm text-orange-50/90 transition hover:text-white"
            target="_blank"
            rel="noreferrer"
          >
            Facebook
          </a>
          <a
            href="https://www.tiktok.com/@hamarsride?_r=1&_t=ZS-94iJKfjouMp"
            className="mt-1 block text-sm text-orange-50/90 transition hover:text-white"
            target="_blank"
            rel="noreferrer"
          >
            TikTok
          </a>
        </div>

        <div>
          <h3 className="mb-3 text-lg font-semibold text-white">Legal</h3>
          <p className="text-sm text-orange-50/90">Terms and Conditions</p>
          <p className="mt-1 text-sm text-orange-50/90">Privacy Policy</p>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl border-t border-orange-200/60 pt-6 text-center">
        <p className="text-sm text-orange-50/90">© 2026 HAMARS RIDE LOGISTICS AND TRANSPORTATION SERVICES</p>
      </div>
    </footer>
  );
}

