// TrustVerificationSection.jsx
import React from 'react';
import { motion } from 'framer-motion';

// Pet-centric animated SVG icons
const PawIcon = ({ className }) => (
  <motion.svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    initial={{ scale: 0.9, rotate: 0 }}
    whileInView={{ scale: 1, rotate: 0 }}
    whileHover={{ scale: 1.08 }}
    transition={{ type: 'spring', stiffness: 240, damping: 18 }}
  >
    {/* Toes */}
    <motion.circle cx="7.5" cy="8" r="2.2" />
    <motion.circle cx="12" cy="6.5" r="2.2" />
    <motion.circle cx="16.5" cy="8" r="2.2" />
    <motion.circle cx="10" cy="11.2" r="2.2" />
    {/* Pad */}
    <motion.path
      d="M12 12.5c-3.8 0-6 2.2-6 4.4 0 2 1.6 3.6 3.6 3.6 1.2 0 2.3-.6 3.1-1.6.8 1 1.9 1.6 3.1 1.6 2 0 3.6-1.6 3.6-3.6 0-2.2-2.2-4.4-6-4.4z"
    />
  </motion.svg>
);

const HomeHeartIcon = ({ className }) => (
  <motion.svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    initial={{ y: 4, opacity: 0 }}
    whileInView={{ y: 0, opacity: 1 }}
    whileHover={{ scale: 1.06 }}
    transition={{ duration: 0.6, ease: 'easeOut' }}
  >
    <path d="M3 10.5l9-7 9 7V19a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-8.5z" />
    <path d="M12 3.5V7" />
    {/* Heart inside home */}
    <motion.path
      fill="currentColor"
      stroke="none"
      initial={{ scale: 0.85 }}
      whileInView={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
      d="M12 12.5c-.9-1-2.7-1.1-3.7 0-1 1-1 2.6 0 3.6l3.2 3.1c.3.3.8.3 1.1 0l3.2-3.1c1-1 1-2.6 0-3.6-1-1-2.8-1-3.8 0z"
    />
  </motion.svg>
);

const ShieldPawIcon = ({ className }) => (
  <motion.svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    initial={{ rotateX: 12, opacity: 0 }}
    whileInView={{ rotateX: 0, opacity: 1 }}
    whileHover={{ scale: 1.06 }}
    transition={{ type: 'spring', stiffness: 160, damping: 16 }}
  >
    {/* Shield */}
    <path d="M12 2.5l8 3.6v6.3c0 6.2-5.3 8.7-8 9.9-2.7-1.2-8-3.7-8-9.9V6.1l8-3.6z" />
    {/* Paw inside */}
    <motion.g fill="currentColor" stroke="none" initial={{ scale: 0.9 }} whileInView={{ scale: 1 }}>
      <circle cx="10" cy="11" r="1.2" />
      <circle cx="14" cy="11" r="1.2" />
      <circle cx="12" cy="9.5" r="1.2" />
      <path d="M12 12.5c-2.2 0-3.4 1.2-3.4 2.5 0 1.1.9 2 2 2 .7 0 1.3-.4 1.7-1 .4.6 1 .9 1.7 1 1.1 0 2-.9 2-2 0-1.3-1.2-2.5-3.4-2.5z" />
    </motion.g>
  </motion.svg>
);

// Motion presets
const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.14, delayChildren: 0.05 } },
};

const card = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 140, damping: 16 } },
  hover: {
    y: -10,
    scale: 1.02,
    boxShadow: '0 20px 50px rgba(20, 20, 20, 0.12)',
    transition: { type: 'spring', stiffness: 240, damping: 18 },
  },
};

const TrustVerificationSection = () => {
  return (
    <section className="relative bg-[#FAFAF5] px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900">
            Trust, safety, and a kinder adoption journey
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            We bake security and care into every step—from verified shelters to safe handovers and after‑adoption support.
          </p>
        </motion.div>

        {/* Cards + animated connectors */}
        <div className="relative">
          {/* Connectors (desktop only) */}
          <div className="hidden md:block absolute left-0 right-0 top-1/2 -translate-y-1/2 pointer-events-none">
            {/* base line */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mx-[8%] h-1 rounded-full bg-gradient-to-r from-emerald-300/50 via-rose-300/50 to-indigo-300/50"
            />
            {/* moving paw dot */}
            <motion.div
              className="relative"
              initial={{ x: '8%' }}
              whileInView={{ x: '92%' }}
              transition={{ duration: 3.2, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
            >
              <PawIcon className="absolute -top-7 h-8 w-8 text-emerald-500 drop-shadow" />
            </motion.div>
          </div>

          {/* Grid */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {/* Card 1: Verified shelters */}
            <motion.div variants={card} whileHover="hover" className="group relative rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
              {/* Accent top bar */}
              <div className="absolute inset-x-8 top-0 h-1.5 rounded-b-full bg-gradient-to-r from-rose-300 via-rose-400 to-rose-300" />
              {/* Icon center */}
              <div className="flex items-center justify-center">
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 rounded-full bg-rose-200"
                    style={{ filter: 'blur(16px)' }}
                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <HomeHeartIcon className="relative h-28 w-28 text-rose-500" />
                </div>
              </div>

              <div className="mt-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900">Verified shelters</h3>
                <p className="mt-3 text-gray-600">
                  We partner with registered shelters and rescues. Listings are reviewed before going live.
                </p>
                <ul className="mt-5 space-y-2 text-sm text-gray-600">
                  <li>• Organization verification and paperwork</li>
                  <li>• Photo and info completeness checks</li>
                  <li>• Ongoing re‑verification cycles</li>
                </ul>
              </div>
            </motion.div>

            {/* Card 2: Safe adoption flow */}
            <motion.div variants={card} whileHover="hover" className="group relative rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="absolute inset-x-8 top-0 h-1.5 rounded-b-full bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-300" />
              {/* Icon center */}
              <div className="flex items-center justify-center">
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 rounded-full bg-emerald-200"
                    style={{ filter: 'blur(16px)' }}
                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                  />
                  <ShieldPawIcon className="relative h-28 w-28 text-emerald-600" />
                </div>
              </div>

              <div className="mt-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900">Safe adoption flow</h3>
                <p className="mt-3 text-gray-600">
                  Transparent steps with ID checks, screening, and secure handover guidance—built to protect pets and people.
                </p>
                <ul className="mt-5 space-y-2 text-sm text-gray-600">
                  <li>• Applicant screening and ID verification</li>
                  <li>• Clear agreements and expectations</li>
                  <li>• Secure, documented handovers</li>
                </ul>
              </div>
            </motion.div>

            {/* Card 3: Caring support */}
            <motion.div variants={card} whileHover="hover" className="group relative rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="absolute inset-x-8 top-0 h-1.5 rounded-b-full bg-gradient-to-r from-indigo-300 via-indigo-400 to-indigo-300" />
              {/* Icon center */}
              <div className="flex items-center justify-center">
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 rounded-full bg-indigo-200"
                    style={{ filter: 'blur(16px)' }}
                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                  />
                  <PawIcon className="relative h-28 w-28 text-indigo-600" />
                </div>
              </div>

              <div className="mt-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900">Caring community support</h3>
                <p className="mt-3 text-gray-600">
                  Guidance before and after adoption, with resources and fast escalation if something seems off.
                </p>
                <ul className="mt-5 space-y-2 text-sm text-gray-600">
                  <li>• 24/7 reporting and assistance</li>
                  <li>• Care guides and checklists</li>
                  <li>• Community tips from experienced adopters</li>
                </ul>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Soft paw-print flourish */}
        <div className="mt-14 flex items-center justify-center gap-2 text-gray-400">
          <motion.span
            aria-hidden="true"
            initial={{ x: -10, opacity: 0.4 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-sm"
          >
            • • •
          </motion.span>
          <span className="text-sm">Every step is for their wellbeing.</span>
        </div>
      </div>
    </section>
  );
};

export default TrustVerificationSection;