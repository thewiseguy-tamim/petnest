import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import PetCardSkeleton from '../ui/PetCardSkeleton';
import petService from '../../services/petService';
import { getPetImageUrl, ImageWithFallback, PLACEHOLDERS } from '../../utils/imageUtils';

const FeaturedPetsSection = () => {
  const [featuredPets, setFeaturedPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeaturedPets = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await petService.getPets({
          limit: 4,
          availability: true,
        });
        setFeaturedPets(response.results || response || []);
      } catch (err) {
        console.error('Error fetching featured pets:', err);
        setError('Failed to load featured pets');
        setFeaturedPets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedPets();
  }, []);

  const handlePetClick = (petId) => {
    navigate(`/pets/${petId}`);
  };

  const getPetImageSrc = (pet) => getPetImageUrl(pet, 0);

  // Ensure only up to 4 pets are shown (single row)
  const displayedPets = (featuredPets || []).slice(0, 4);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  if (error && !loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Featured Pets</h2>
          <p className="text-red-500 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-[#FAFAF5] relative overflow-hidden">
      {/* Background details */}
      <div className="pointer-events-none absolute -top-8 -left-8 w-36 h-36 bg-[#FFEFB5] rounded-xl rotate-12 opacity-70" />
      <div className="pointer-events-none absolute bottom-16 right-12 w-24 h-24 bg-[#009966]/20 rounded-full blur-md" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 w-14 h-14 bg-white/60 border border-[#3F3D56]/10 rounded-lg rotate-6" />

      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800">Featured Pets</h2>
          <p className="text-gray-500 mt-2">Meet our adorable pets waiting for a loving home</p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <PetCardSkeleton key={i} />
            ))}
          </div>
        ) : displayedPets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No featured pets available at the moment.</p>
            <Link
              to="/pets"
              className="inline-flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 font-semibold mt-4"
            >
              <span>Browse All Pets</span>
              <ArrowRight size={20} />
            </Link>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {displayedPets.map((pet) => (
              <motion.div
                key={pet.id}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -4 }}
                onClick={() => handlePetClick(pet.id)}
                className="bg-[#FAFAF5] rounded-2xl hover:shadow-xl transition cursor-pointer overflow-hidden border border-[#FAFAF5] flex flex-col h-[420px]"
              >
                {/* Image Section */}
                <div className="relative h-[60%] w-full rounded-xl overflow-hidden">
                  <ImageWithFallback
                    src={getPetImageSrc(pet)}
                    fallback={PLACEHOLDERS.IMAGE}
                    alt={pet.name || 'Pet'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                  {pet.is_for_adoption ? (
                    <span className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                      Adoption
                    </span>
                  ) : pet.price ? (
                    <span className="absolute bottom-3 left-3 bg-white text-gray-800 text-sm font-semibold px-3 py-1 rounded-full shadow">
                      ${pet.price}
                    </span>
                  ) : null}

                  <button
                    className="absolute top-3 right-3 bg-white p-2 rounded-full shadow hover:bg-gray-100 transition"
                    aria-label="Favorite"
                  >
                    <motion.div whileTap={{ scale: 0.8 }}>
                      <Heart size={18} className="text-gray-600 hover:text-red-500" />
                    </motion.div>
                  </button>
                </div>

                {/* Content Section */}
                <div className="h-[40%] p-4 text-center flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{pet.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {pet.breed}, {pet.age} year{pet.age !== 1 ? 's' : ''} old
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center mt-2">
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">{pet.gender}</span>
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">{pet.pet_type}</span>
                      {pet.personality_tags?.map((tag, i) => (
                        <span key={i} className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 mt-3 rounded-full text-xs font-semibold transition"
                  >
                    Learn More
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <motion.div whileHover={{ x: 5 }}>
            <Link
              to="/pets"
              className="inline-block border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white font-semibold px-10 py-3 rounded-full transition"
            >
              View All Pets
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedPetsSection;