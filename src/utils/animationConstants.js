export const animations = {
  // Timing
  duration: {
    fast: 0.2,
    normal: 0.3,
    slow: 0.5,
    verySlow: 0.8,
  },
  
  // Easing
  easing: {
    default: [0.4, 0, 0.2, 1],
    bounce: [0.68, -0.55, 0.265, 1.55],
    smooth: [0.25, 0.46, 0.45, 0.94],
  },
  
  // Spring animations
  spring: {
    default: { type: "spring", stiffness: 400, damping: 17 },
    bouncy: { type: "spring", stiffness: 300, damping: 10 },
    stiff: { type: "spring", stiffness: 500, damping: 30 },
  },
  
  // Common variants
  fadeInUp: {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  },
  
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  
  scaleIn: {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
  },
  
  slideInLeft: {
    hidden: { x: -50, opacity: 0 },
    visible: { x: 0, opacity: 1 },
  },
  
  slideInRight: {
    hidden: { x: 50, opacity: 0 },
    visible: { x: 0, opacity: 1 },
  },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};