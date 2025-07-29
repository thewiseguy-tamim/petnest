// src/layouts/Footer.jsx
import React from 'react';
import { Facebook, Instagram, Twitter, Youtube, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#F8F8F8] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Brand Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'serif' }}>
            PetNest
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Your trusted platform for finding the perfect pet companion.
            <br />
            Connecting loving homes with pets in need since 2024.
          </p>
          
          {/* Social Media Icons */}
          <div className="flex justify-center space-x-4 mt-6">
            <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
              <Twitter size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
              <Facebook size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
              <Instagram size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
              <Youtube size={20} />
            </a>
          </div>
        </div>

        {/* Links Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Shop</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-gray-800">Find Cats</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-800">Find Dogs</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-800">Other Pets</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-800">Pet Supplies</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Information</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-gray-800">About Us</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-800">Contact</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-800">FAQs</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-800">Blog</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-gray-800">Terms of Service</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-800">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-800">Careers</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-800">Partners</a></li>
            </ul>
          </div>
          
          {/* Newsletter Section */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Newsletter</h3>
            <p className="text-gray-600 mb-4">Subscribe to get updates on new pets</p>
            <form className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:border-[#FFCAB0]"
              />
              <button
                type="submit"
                className="bg-[#FFCAB0] text-white px-4 py-2 rounded-r-md hover:bg-[#FFB090] transition-colors"
              >
                <Mail size={20} />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm mb-4 md:mb-0">
            © 2025 PetNest. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <img src="/api/placeholder/40/25" alt="Visa" className="h-6" />
            <img src="/api/placeholder/40/25" alt="Mastercard" className="h-6" />
            <img src="/api/placeholder/40/25" alt="PayPal" className="h-6" />
            <img src="/api/placeholder/40/25" alt="Stripe" className="h-6" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;