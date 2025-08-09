import React from 'react';
import { motion } from 'framer-motion';
import { PawPrint, Heart, ShieldCheck, Sparkles, Users } from 'lucide-react';
import about from '../../assets/about.png';

const COLORS = {
  text: '#1a1a2e',
  background: '#fafaf5',
  primary: '#2bb673',
  secondary: '#f4ecd2',
  accent: '#5b4b8b',
};

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: 'easeOut' },
  }),
};

const AboutUs = () => {
  return (
    <section style={styles.section}>
      {/* Decorative Blobs */}
      <div style={styles.blobOne} />
      <div style={styles.blobTwo} />

      <div style={styles.wrapper}>
        {/* Left: Text/Story */}
        <motion.div
          style={styles.textContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
          custom={0}
        >
          {/* Eyebrow */}
          <motion.div
            variants={fadeInUp}
            custom={0.1}
            style={styles.eyebrow}
          >
            <Sparkles size={16} color={COLORS.accent} />
            <span>About HeartPaws</span>
          </motion.div>

          {/* Heading */}
          <motion.h2
            style={styles.heading}
            variants={fadeInUp}
            custom={0.2}
          >
            Our Story <span style={styles.headingAccent}>With Heart</span>
          </motion.h2>

          <motion.p style={styles.paragraph} variants={fadeInUp} custom={0.3}>
            HeartPaws began with a simple but powerful belief: every animal deserves a loving home, and every adoption should feel like a celebration.
            We saw too many platforms that felt transactional, cold, or confusing—and we knew there had to be a better way.
          </motion.p>

          <motion.p style={styles.paragraph} variants={fadeInUp} custom={0.4}>
            So we built HeartPaws to be different. A place where stories matter. Where verified shelters meet compassionate adopters.
            Where every click feels warm, every testimonial feels real, and every adoption is a moment worth sharing.
          </motion.p>

          <motion.p style={styles.paragraph} variants={fadeInUp} custom={0.5}>
            From animated pet profiles to heartfelt success stories, we’ve designed every detail to spark trust, joy, and connection.
            Because adoption isn’t just about finding a pet—it’s about finding family.
          </motion.p>

          {/* Feature Pills */}
          <motion.ul style={styles.pillList} variants={fadeInUp} custom={0.6}>
            <li style={styles.pill}><ShieldCheck size={16} /> Verified Shelters</li>
            <li style={styles.pill}><Heart size={16} /> Compassionate Matches</li>
            <li style={styles.pill}><Users size={16} /> Supportive Community</li>
          </motion.ul>

          {/* Accent Box */}
          <motion.div style={styles.accentBox} variants={fadeInUp} custom={0.7}>
            <PawPrint size={18} color={COLORS.accent} />
            <p style={styles.accentText}>
              Join us in building a world where tails wag brighter, hearts heal faster, and love finds its way home.
            </p>
          </motion.div>

    

          {/* Stats */}
          <motion.div style={styles.statsRow} variants={fadeInUp} custom={0.9}>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>8k+</div>
              <div style={styles.statLabel}>Adoptions</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>120+</div>
              <div style={styles.statLabel}>Partner Shelters</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>98%</div>
              <div style={styles.statLabel}>Match Satisfaction</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right: Visual */}
        <motion.div
          style={styles.imageContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
          custom={0.3}
        >
          <div style={styles.imageWrap}>
            {/* Halo */}
            <div style={styles.halo} />
            <img
              src={about}
              alt="Happy pet adoption moment"
              style={styles.image}
            />

            {/* Floating Cards */}
            <motion.div
              style={styles.floatCardLeft}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <ShieldCheck size={16} color={COLORS.primary} />
              <span>Verified Shelter</span>
            </motion.div>

            <motion.div
              style={styles.floatCardRight}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.5 }}
            >
              <Heart size={16} color="#e25563" />
              <span>Happy Tails</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const styles = {
  section: {
    position: 'relative',
    backgroundColor: COLORS.background,
    padding: '6rem 2rem',
    color: COLORS.text,
    fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
    overflow: 'hidden',
  },
  blobOne: {
    position: 'absolute',
    top: -80,
    left: -60,
    width: 320,
    height: 320,
    background: `radial-gradient(closest-side, ${COLORS.secondary}, transparent)`,
    filter: 'blur(8px)',
    opacity: 0.55,
    zIndex: 0,
    borderRadius: '50%',
  },
  blobTwo: {
    position: 'absolute',
    bottom: -90,
    right: -60,
    width: 360,
    height: 360,
    background: `radial-gradient(closest-side, ${COLORS.primary}30, transparent)`,
    filter: 'blur(12px)',
    opacity: 0.5,
    zIndex: 0,
    borderRadius: '50%',
  },
  wrapper: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'row',
    gap: '3rem',
    alignItems: 'center',
    maxWidth: 1200,
    margin: '0 auto',
    flexWrap: 'wrap',
  },
  textContainer: {
    flex: 1,
    minWidth: 320,
  },
  eyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    color: COLORS.accent,
    border: '1px solid #eee',
    borderRadius: 999,
    padding: '6px 10px',
    fontWeight: 700,
    fontSize: 12,
    boxShadow: '0 6px 20px rgba(91,75,139,0.08)',
    marginBottom: 12,
  },
  heading: {
    fontSize: '3rem',
    lineHeight: 1.15,
    margin: '0 0 1rem 0',
    fontWeight: 800,
    color: COLORS.text,
  },
  headingAccent: {
    backgroundImage: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.primary})`,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
  },
  paragraph: {
    fontSize: '1.1rem',
    lineHeight: 1.9,
    marginBottom: '1.2rem',
    opacity: 0.95,
  },
  pillList: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 1.5rem 0',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 12px',
    borderRadius: 999,
    backgroundColor: '#fff',
    border: '1px solid #eee',
    fontSize: 13,
    fontWeight: 600,
    color: COLORS.text,
    boxShadow: '0 8px 24px rgba(26,26,46,0.06)',
  },
  accentBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: COLORS.secondary,
    padding: '1rem 1.25rem',
    borderRadius: 14,
    marginTop: '1rem',
    marginBottom: '1.25rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
  },
  accentText: {
    color: COLORS.accent,
    fontWeight: 600,
    fontSize: '1.05rem',
    margin: 0,
  },
  ctaRow: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
    marginTop: 8,
    marginBottom: 18,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    padding: '12px 18px',
    fontWeight: 700,
    letterSpacing: 0.2,
    cursor: 'pointer',
    boxShadow: '0 10px 26px rgba(43,182,115,0.22)',
  },
  secondaryBtn: {
    backgroundColor: '#fff',
    color: COLORS.text,
    border: '1.5px solid #e9e9e9',
    borderRadius: 12,
    padding: '12px 16px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  statsRow: {
    display: 'flex',
    gap: 16,
    flexWrap: 'wrap',
    marginTop: 6,
  },
  statCard: {
    backgroundColor: '#fff',
    border: '1px solid #eee',
    borderRadius: 12,
    padding: '12px 16px',
    minWidth: 140,
    boxShadow: '0 8px 24px rgba(26,26,46,0.06)',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 800,
    color: COLORS.text,
    lineHeight: 1.1,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.text,
    opacity: 0.7,
  },
  imageContainer: {
    flex: 1,
    minWidth: 320,
    textAlign: 'center',
  },
  imageWrap: {
    position: 'relative',
    width: '100%',
    maxWidth: 560,
    margin: '0 auto',
  },
  halo: {
    position: 'absolute',
    inset: -10,
    borderRadius: 24,
    background: `linear-gradient(135deg, ${COLORS.secondary}, #fff)`,
    filter: 'blur(10px)',
    opacity: 0.6,
    zIndex: 0,
  },
  image: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    borderRadius: 20,
    border: '6px solid #fff',
    boxShadow: '0 18px 50px rgba(26,26,46,0.15)',
  },
  floatCardLeft: {
    position: 'absolute',
    left: -10,
    top: 24,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    border: '1px solid #eee',
    padding: '8px 12px',
    borderRadius: 12,
    boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
    zIndex: 2,
    fontWeight: 600,
    fontSize: 13,
    color: COLORS.text,
  },
  floatCardRight: {
    position: 'absolute',
    right: -10,
    bottom: 24,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    border: '1px solid #eee',
    padding: '8px 12px',
    borderRadius: 12,
    boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
    zIndex: 2,
    fontWeight: 600,
    fontSize: 13,
    color: COLORS.text,
  },
};

export default AboutUs;