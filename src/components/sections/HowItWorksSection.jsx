import React from 'react';
import { Search, Shield, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const HowItWorksSection = () => {
  const steps = [
    {
      icon: Search,
      title: 'Discover a Pet',
      description: 'Browse listings of pets available for adoption or sale.',
    },
    {
      icon: Shield,
      title: 'Connect and Verify',
      description: 'Communicate securely through our platform and complete the verification process.',
    },
    {
      icon: Home,
      title: 'Bring Your Pet Home',
      description: 'Finalize the adoption or sale and welcome your new pet home.',
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#FAFAF5]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Finding your perfect pet companion is just three simple steps away. Follow our streamlined process to connect with your new family member.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <div className="relative">
            {steps.map((step, index) => (
              <motion.div 
                key={index} 
                className="flex items-start gap-6 pb-12 relative"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                {/* Connecting line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-12 bg-gray-200 transform -translate-x-0.5"></div>
                )}
                
                <motion.div 
                  className="flex-shrink-0 relative z-10"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-12 h-12 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center shadow-sm">
                    <step.icon className="w-5 h-5 text-gray-500" />
                  </div>
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;