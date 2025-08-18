// src/pages/About.jsx
import React from 'react';
import { Heart, Users, Shield, Award } from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: Heart,
      title: 'Compassion First',
      description: 'We believe every pet deserves a loving home and treat all animals with care and respect.',
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Building a network of pet lovers who support each other in providing the best care.',
    },
    {
      icon: Shield,
      title: 'Safe & Secure',
      description: 'Verified users and secure transactions ensure a safe experience for everyone.',
    },
    {
      icon: Award,
      title: 'Quality Standards',
      description: 'We maintain high standards for all listings to ensure healthy and happy pets.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#FFE5D4] to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            About PetNest
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're on a mission to connect loving families with pets in need, creating 
            lasting bonds that bring joy to both humans and animals.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-gray-600 mb-4">
                PetNest was founded in 2024 with a simple belief: every pet deserves a loving home, 
                and every family deserves the joy of a pet companion. What started as a small 
                initiative has grown into a nationwide platform connecting thousands of pets with 
                their forever families.
              </p>
              <p className="text-gray-600 mb-4">
                We understand that finding the right pet is about more than just browsing listings. 
                It's about finding a companion that matches your lifestyle, personality, and heart. 
                That's why we've built a platform that makes this journey as smooth and meaningful 
                as possible.
              </p>
              <p className="text-gray-600">
                Today, we're proud to have facilitated over 10,000 successful adoptions and 
                continue to grow our community of pet lovers across the country.
              </p>
            </div>
            <div className="relative">
              <img
                src="/api/placeholder/600/400"
                alt="Happy pets and families"
                className="rounded-2xl shadow-xl"
              />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-green-700 rounded-full opacity-20" />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-[#F8F8F8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="text-center">
                  <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                    <Icon className="text-green-700" size={24} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600 text-sm">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-12">
            Our dedicated team works tirelessly to ensure every pet finds their perfect match 
            and every adoption story has a happy ending.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((member) => (
              <div key={member} className="text-center">
                <img
                  src="/api/placeholder/200/200"
                  alt="Team member"
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="font-semibold text-gray-900">Team Member</h3>
                <p className="text-gray-600 text-sm">Position</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;