import Image from 'next/image';
import React from 'react';
import { FaFacebookF, FaLinkedinIn, FaTwitter, FaInstagram } from 'react-icons/fa';
import { HiOutlineMail } from 'react-icons/hi';

const Footer = () => {
  return (
    <footer className=" bg-slate-950 text-slate-300 border-t border-slate-900">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="relative h-20 w-32">
              <Image 
                src="/assets/royalty-logo.png" 
                alt="Royalty Logo" 
                fill 
                className="object-contain"
                priority
              />
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Discover premium quality and timeless style. Elevate your everyday lifestyle with Royalty.
            </p>
            <div className="flex gap-3 pt-2">
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-[#35858E] hover:text-white transition-colors duration-200">
                <FaFacebookF className="text-sm" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-[#35858E] hover:text-white transition-colors duration-200">
                <FaTwitter className="text-sm" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-[#35858E] hover:text-white transition-colors duration-200">
                <FaLinkedinIn className="text-sm" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-[#35858E] hover:text-white transition-colors duration-200">
                <FaInstagram className="text-sm" />
              </a>
            </div>
          </div>

          {/* Shop Categories */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold tracking-widest text-white uppercase">Shop</h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><a href="#" className="hover:text-[#35858E] transition-colors">New Arrivals</a></li>
              <li><a href="#" className="hover:text-[#35858E] transition-colors">Best Sellers</a></li>
              <li><a href="#" className="hover:text-[#35858E] transition-colors">Men Collection</a></li>
              <li><a href="#" className="hover:text-[#35858E] transition-colors">Women Collection</a></li>
              <li><a href="#" className="hover:text-[#35858E] transition-colors">Exclusive Offers</a></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold tracking-widest text-white uppercase">Customer Care</h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><a href="#" className="hover:text-[#35858E] transition-colors">Track Order</a></li>
              <li><a href="#" className="hover:text-[#35858E] transition-colors">Shipping & Delivery</a></li>
              <li><a href="#" className="hover:text-[#35858E] transition-colors">Returns & Exchanges</a></li>
              <li><a href="#" className="hover:text-[#35858E] transition-colors">Size Guide</a></li>
              <li><a href="#" className="hover:text-[#35858E] transition-colors">FAQs</a></li>
            </ul>
          </div>

          {/* Newsletter & Contact */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold tracking-widest text-white uppercase">Stay Updated</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Get the latest trends, product drops, and exclusive discounts delivered weekly.
            </p>

            <form className="flex items-center gap-2 max-w-sm">
              <input 
                type="email" 
                placeholder="Enter email" 
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#35858E] transition-colors"
                required
              />
              <button type="submit" className="px-4 py-2 bg-[#35858E] text-white text-xs font-semibold rounded-xl hover:bg-[#2a6b73] transition-colors shrink-0">
                Join
              </button>
            </form>
            <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
              <HiOutlineMail className="text-base text-[#35858E]" />
              <span>Email: <a href="mailto:support@royalty.com" className="text-slate-300 hover:text-[#35858E] underline decoration-slate-700">support@royalty.com</a></span>
            </div>
          </div>

        </div>
      </div>

      {/* Divider */}
      <hr className="border-slate-900 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" />

      {/* Bottom Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p className="text-center md:text-left w-full md:w-auto">
            &copy; {new Date().getFullYear()} Royalty. All rights reserved.
          </p>
          <div className="flex gap-6 justify-center md:justify-end w-full md:w-auto">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;