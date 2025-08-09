// src/layouts/Footer.jsx
import React from 'react';
import { Facebook, Instagram, Twitter, Youtube, Mail, PawPrint, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 ]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top Section with Brand and Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-emerald-100 rounded-full p-3">
                <PawPrint className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                PetNest
              </h2>
            </div>
            <p className="text-gray-600 text-lg mb-6 max-w-md">
              Your trusted platform for finding the perfect pet companion.
              Connecting loving homes with pets in need since 2024.
            </p>
            
            {/* Social Media Icons */}
            <div className="flex space-x-4">
              <a href="#" className="bg-white p-3 rounded-full text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                <Twitter size={20} />
              </a>
              <a href="#" className="bg-white p-3 rounded-full text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                <Facebook size={20} />
              </a>
              <a href="#" className="bg-white p-3 rounded-full text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                <Instagram size={20} />
              </a>
              <a href="#" className="bg-white p-3 rounded-full text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="lg:ml-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Stay Updated</h3>
            <p className="text-gray-600 mb-6">Get weekly updates on new pets available for adoption and pet care tips</p>
            <form className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-5 py-3 border border-gray-300 rounded-full focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-gray-700"
              />
              <button
                type="submit"
                className="bg-emerald-600 text-white px-8 py-3 rounded-full hover:bg-emerald-700 transition-colors font-semibold flex items-center justify-center space-x-2"
              >
                <span>Subscribe</span>
                <Mail size={18} />
              </button>
            </form>
          </div>
        </div>

        
      </div>
    </footer>
  );
};

export default Footer;