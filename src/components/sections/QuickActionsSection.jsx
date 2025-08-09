import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Shield, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const QuickActionsSection = () => {
  const actions = [
    {
      icon: Search,
      title: 'Browse Adoptable Pets',
      description: 'Explore our collection of pets waiting for their forever homes',
      link: '/pets',
    },
    {
      icon: Plus,
      title: 'Post a Pet',
      description: 'List your pet for adoption and find them a loving home',
      link: '/pets/create',
    },
    {
      icon: Shield,
      title: 'Learn About Verification',
      description: 'Understand our safety measures and verification process',
      link: '/about',
    },
    {
      icon: MessageCircle,
      title: 'Messages',
      description: 'Connect with pet owners and adoption seekers',
      link: '/messages',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section className="py-16 md:py-20 bg-[#FAFAF5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Get Started Today
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to find or list a pet on PetNest
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {actions.map((action, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Link
                to={action.link}
                className="block h-full"
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-emerald-300 hover:shadow-lg transition-all h-full"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="bg-emerald-100 rounded-lg p-3 w-14 h-14 mb-4 flex items-center justify-center"
                  >
                    <action.icon className="w-8 h-8 text-emerald-600" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-gray-600 text-sm">{action.description}</p>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default QuickActionsSection;