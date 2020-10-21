/**
 * Variants for Framer Motion
 * @link https://www.framer.com/api/motion/
 */

const fadeIn = {
  visible: {
    opacity: 1,
  },
  hidden: {
    opacity: 0,
  },
};

const fadeInWithLift = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const fadeInParent = {
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
  hidden: {
    opacity: 0,
    transition: {
      when: "afterChildren",
    },
  },
};

const variants = {
  fadeIn,
  fadeInWithLift,
  fadeInParent,
};

export default variants;
