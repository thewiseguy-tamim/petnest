// PetAdoptionSection.jsx
import React, { useEffect, useRef, useState } from 'react';

const PetAdoptionSection = () => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, []);

  return (
    <section ref={sectionRef} className="bg-[#fafaf5] pt-35 p-8 relative overflow-hidden">
      {/* Background details */}
      <div className="pointer-events-none absolute -top-8 -left-8 w-36 h-36 bg-[#FFEFB5] rounded-xl rotate-12 opacity-70" />
      <div className="pointer-events-none absolute bottom-16 right-12 w-24 h-24 bg-[#009966]/20 rounded-full blur-md" />
      <div className="pointer-events-none absolute top-1/4 right-1/3 w-16 h-16 bg-white/60 border border-[#3F3D56]/10 rounded-lg rotate-6" />
      <div className="pointer-events-none absolute top-1/2 left-1/4 w-2 h-2 bg-[#009966] rounded-full animate-pulse" />

      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Image */}
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1574158622682-e40e69881006?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
              alt="Tabby cat being petted"
              className="w-full h-auto rounded-2xl shadow-lg object-cover"
            />
          </div>

          {/* Right side - Content */}
          <div className="space-y-8 relative">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                How to Adopt Your New Friend
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Ready to bring home your new best friend? Explore, meet, adopt, and start your journey of love and joy today!
              </p>
            </div>

            {/* Process Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 1 - Find Your Match */}
              <div
                className={`group bg-[#eff6ef] bg-opacity-50 backdrop-blur-sm rounded-xl p-6 hover:bg-opacity-70 hover:shadow-xl hover:-translate-y-2 transition-all duration-500 transform ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}
                style={{ transitionDelay: '600ms' }}
              >
                <div className="mb-4">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Find Your Match</h3>
                <p className="text-gray-600 text-sm">
                  Explore our website and find the perfect pet that steals your heart.
                </p>
              </div>

              {/* Card 2 - Contact and Meet */}
              <div
                className={`group bg-[#eff6ef] bg-opacity-50 backdrop-blur-sm rounded-xl p-6 hover:bg-opacity-70 hover:shadow-xl hover:-translate-y-2 transition-all duration-500 transform ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}
                style={{ transitionDelay: '750ms' }}
              >
                <div className="mb-4">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Contact and Meet</h3>
                <p className="text-gray-600 text-sm">
                  Contact the shelter to meet the pet and see if it's a match.
                </p>
              </div>

              {/* Card 3 - Complete Paperwork */}
              <div
                className={`group bg-[#eff6ef] bg-opacity-50 backdrop-blur-sm rounded-xl p-6 hover:bg-opacity-70 hover:shadow-xl hover:-translate-y-2 transition-all duration-500 transform ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}
                style={{ transitionDelay: '900ms' }}
              >
                <div className="mb-4">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Complete Paperwork</h3>
                <p className="text-gray-600 text-sm">
                  Complete the application and fee to finalize adoption.
                </p>
              </div>

              {/* Card 4 - Take Them Home */}
              <div
                className={`group bg-[#eff6ef] bg-opacity-50 backdrop-blur-sm rounded-xl p-6 hover:bg-opacity-70 hover:shadow-xl hover:-translate-y-2 transition-all duration-500 transform ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}
                style={{ transitionDelay: '1050ms' }}
              >
                <div className="mb-4">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Take Them Home</h3>
                <p className="text-gray-600 text-sm">
                  Bring your new furry friend home and start making memories together!
                </p>
              </div>
            </div>

            {/* Floating paw prints animation */}
            <div className="absolute top-10 left-10 opacity-20">
              <div className="animate-bounce" style={{ animationDelay: '2s', animationDuration: '3s' }}>
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4.5 9a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM16.5 9a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM10 5.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM8.5 15a2.5 2.5 0 015 0c0 1.5-1 2.5-2.5 2.5S8.5 16.5 8.5 15z" />
                </svg>
              </div>
            </div>

            <div className="absolute bottom-20 right-10 opacity-20">
              <div className="animate-pulse" style={{ animationDelay: '1s' }}>
                <svg className="w-4 h-4 text-pink-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PetAdoptionSection;