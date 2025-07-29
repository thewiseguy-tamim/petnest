// src/components/sections/TestimonialsSection.jsx
import React from 'react';
import { Star } from 'lucide-react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Pet Parent',
      content: 'PetNest helped me find my perfect companion. The process was smooth and the team was incredibly supportive!',
      rating: 5,
      image: '/api/placeholder/60/60',
    },
    {
      id: 2,
      name: 'Mike Chen',
      role: 'Dog Owner',
      content: 'I adopted Max through PetNest and it was the best decision ever. He\'s now part of our family!',
      rating: 5,
      image: '/api/placeholder/60/60',
    },
    {
      id: 3,
      name: 'Emily Davis',
      role: 'Cat Lover',
      content: 'The platform made it easy to find cats in my area. I found my two fur babies here!',
      rating: 5,
      image: '/api/placeholder/60/60',
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Happy Pet Parents
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Hear from families who found their perfect companions through PetNest
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-[#F8F8F8] rounded-lg p-6">
              <div className="flex items-center mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#FFCAB0] text-[#FFCAB0]" />
                ))}
              </div>
              <p className="text-gray-700">{testimonial.content}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;