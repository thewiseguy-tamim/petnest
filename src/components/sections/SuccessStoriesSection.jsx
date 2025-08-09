import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Pet-themed icon
const PawIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <circle cx="7.5" cy="8" r="2.1" />
    <circle cx="12" cy="6.5" r="2.1" />
    <circle cx="16.5" cy="8" r="2.1" />
    <path d="M12 12.3c-3.4 0-5.3 2-5.3 3.9 0 1.8 1.4 3.2 3.2 3.2 1 0 1.9-.5 2.6-1.4.7.9 1.6 1.4 2.6 1.4 1.8 0 3.2-1.4 3.2-3.2 0-1.9-1.9-3.9-5.3-3.9z" />
  </svg>
);

const stories = [
  {
    name: 'The Smiths',
    petName: 'Max',
    testimonial: "Max has filled our home with joy and laughter. Adopting him was the best decision we've made!",
    fullStory: `Max came into our lives through a simple listing—but he's anything but ordinary. Energetic, loving, and incredibly intuitive, he made our home warmer the moment he stepped in.

From fetching slippers to snuggling on rainy evenings, Max is more than a pet—he's family. The adoption process was smooth and supportive, and we appreciated the follow-up guidance provided.`,
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1200&q=80&auto=format&fit=crop',
    bgColor: 'from-teal-200 to-teal-300',
    location: 'Austin, TX',
    adoptedDate: 'April 2024'
  },
  {
    name: 'Sarah M.',
    petName: 'Whiskers',
    testimonial: 'I adopted Whiskers last winter and every day since has been brighter. She’s my sweet shadow.',
    fullStory: `Whiskers is calm, expressive, and sometimes a bit of a diva. She found her favorite sun-spot in my apartment within a minute of arriving.

This platform made adoption smooth and respectful—no guesswork, just honest support. Now Whiskers chirps when I return from work, and I don’t think I’ve ever felt so loved.`,
    image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=1200&q=80&auto=format&fit=crop',
    bgColor: 'from-orange-100 to-orange-200',
    location: 'Portland, OR',
    adoptedDate: 'Jan 2025'
  },
  {
    name: 'Tamim & Family',
    petName: 'Coco',
    testimonial: 'Coco brought softness and serenity to our Dhaka home. She is truly our blessing.',
    fullStory: `We met Coco through the adoption listing one evening. She looked like she'd been waiting just for us—gentle gaze, floppy ears, patient soul.

She loves morning prayers, follows us through every room, and sits by the window watching clouds pass over Old Dhaka. Coco’s adoption wasn’t just easy—it felt like destiny. Thank you for bringing us together.`,
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=1200&q=80&auto=format&fit=crop',
    bgColor: 'from-rose-100 to-rose-200',
    location: 'Dhaka, Bangladesh',
    adoptedDate: 'June 2025'
  },
];

export default function SuccessStoriesSection() {
  const [selected, setSelected] = useState(null);

  const openModal = useCallback((story) => setSelected(story), []);
  const closeModal = useCallback(() => setSelected(null), []);

  useEffect(() => {
    if (!selected) return;
    const onEsc = (e) => e.key === 'Escape' && closeModal();
    document.addEventListener('keydown', onEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onEsc);
      document.body.style.overflow = '';
    };
  }, [selected]);

  return (
    <section className="bg-[#FAFAF5] py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">Happy Tails</h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">Real families. Real joy. Real pets that found their forever homes.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stories.map((story, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 180, damping: 20 }}
              className="rounded-xl bg-white shadow-md border border-gray-200 overflow-hidden cursor-pointer"
            >
              <div className={`h-110 w-full bg-gradient-to-br ${story.bgColor} overflow-hidden`}>
                <img src={story.image} alt={story.petName} className="w-full h-full object-cover" />
              </div>
              <div className="p-5">
                <p className="text-gray-800 text-base leading-relaxed">"{story.testimonial}"</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-teal-700 font-semibold">— {story.name}</span>
                  <button
                    onClick={() => openModal(story)}
                    className="text-sm text-gray-500 hover:text-teal-600 focus:outline-none"
                  >
                    Read story →
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-y-auto max-h-[90vh]"
              initial={{ y: 20, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 20, scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Image */}
              <div className="relative h-56 w-full overflow-hidden">
                <img src={selected.image} alt={`${selected.name} and ${selected.petName}`} className="w-full h-full object-cover" />
                <div className="absolute bottom-3 left-3 bg-white/80 text-sm text-gray-700 px-3 py-1 rounded-full shadow flex items-center gap-2">
                  <PawIcon className="h-4 w-4 text-teal-500" />
                  {selected.petName} · {selected.adoptedDate}
                </div>
                <button
                  onClick={closeModal}
                  aria-label="Close"
                  className="absolute top-4 right-4 p-2 bg-white/80 rounded-full hover:bg-white shadow"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 6l12 12M6 18l12-12" />
                  </svg>
                </button>
              </div>

              {/* Text */}
              <div className="p-6 sm:p-8">
                <h3 className="text-2xl font-bold text-gray-900">{selected.petName} & {selected.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{selected.location}</p>
                <div className="mt-5 space-y-4 text-gray-700 leading-relaxed whitespace-pre-line">
                  {selected.fullStory}
                </div>

                {/* Actions */}
                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    onClick={() => {
                      navigator.share?.({
                        title: `${selected.petName}'s Adoption Story`,
                        text: selected.testimonial,
                        url: window.location.href,
                      }) || alert("Sharing is not supported on this device.");
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded hover:bg-teal-700 transition"
                  >
                    <PawIcon className="h-4 w-4 text-white" />
                    Share Story
                  </button>

                  <button
                    onClick={closeModal}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}