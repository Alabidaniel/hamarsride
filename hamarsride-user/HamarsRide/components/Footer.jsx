import React from "react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#d8c8b5] bg-[#8a684d] px-6 py-12 text-[#fffaf4]" style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', boxSizing: 'border-box' }}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="mb-3 text-lg font-semibold text-[#fffaf4]">About Us</h3>
          <p className="text-sm leading-7 text-[#f3e7d8]">
            HAMARS RIDE is a reliable delivery and transportation service focused on
            fast dispatch, safe handling, and stress-free customer experience.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-lg font-semibold text-[#fffaf4]">Contact Us</h3>
          <p className="text-sm text-[#f3e7d8]">hamarsrideofficial@gmail.com</p>
          <p className="mt-1 text-sm text-[#f3e7d8]">07043640694</p>
        </div>

        <div>
          <h3 className="mb-3 text-lg font-semibold text-[#fffaf4]">Social Media</h3>
          <a
            href="https://www.instagram.com/hamarsdelivery_ng?igsh=MTJrdDY4aWgycWMweA=="
            className="text-sm text-[#f3e7d8] transition hover:text-white"
            target="_blank"
            rel="noreferrer"
          >
            Instagram
          </a>
          <a
            href="https://www.facebook.com/share/1DZ57YqECU/"
            className="mt-1 block text-sm text-[#f3e7d8] transition hover:text-white"
            target="_blank"
            rel="noreferrer"
          >
            Facebook
          </a>
          <a
            href="https://www.tiktok.com/@hamarsride?_r=1&_t=ZS-94iJKfjouMp"
            className="mt-1 block text-sm text-[#f3e7d8] transition hover:text-white"
            target="_blank"
            rel="noreferrer"
          >
            TikTok
          </a>
        </div>

        <div>
          <h3 className="mb-3 text-lg font-semibold text-[#fffaf4]">Legal</h3>
          <p className="text-sm text-[#f3e7d8]">Terms and Conditions</p>
          <p className="mt-1 text-sm text-[#f3e7d8]">Privacy Policy</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-10 border-t border-[#b79272] pt-6 text-center">
        <p className="text-sm text-[#f3e7d8]">
          © 2026 HAMARS RIDE LOGISTICS AND TRANSPORTATION SERVICES
        </p>
      </div>
    </footer>
  );
}
