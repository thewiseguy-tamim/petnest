// src/components/sections/TestimonialsSection.jsx
import React from 'react';
import { Star } from 'lucide-react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: 'The Smith Family',
      location: 'California',
      text: 'We found our perfect companion Max through PetNest. The process was smooth, and the verification gave us peace of mind. Max has brought so much joy to our family!',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=100&h=100&fit=crop'
    },
    {
      name: 'The Johnsons',
      location: 'Texas',
      text: 'PetNest matched us with Bella, and it was love at first sight. The platform made it easy to find a pet that fit our lifestyle. Highly recommend!',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=100&h=100&fit=crop'
    },
    {
      name: 'The Williams',
      location: 'New York',
      text: 'The support team at PetNest was incredible. They helped us through every step of adopting Rocky. The community here truly cares about finding the right homes for pets.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=100&h=100&fit=crop'
    }
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Success Stories
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Hear from families who found their perfect pet companions through PetNest
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-orange-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.location}</p>
                </div>
              </div>
              
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={16} className="text-yellow-500 fill-current" />
                ))}
              </div>
              
              <p className="text-gray-700 italic">"{testimonial.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;