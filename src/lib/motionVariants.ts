/**
 * Variants for Framer Motion. See {@link https://www.framer.com/api/motion/}
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

const menuVariants = {
  hidden: {
    height: 0,
    transition: { when: "afterChildren", duration: 0.3 },
  },
  visible: {
    height: "auto",
    opacity: 1,
    transition: {
      when: "beforeChildren",
      duration: 0.2,
    },
  },
};
const menuItemVariants = {
  hidden: { opacity: 0, transition: { duration: 0.1 } },
  visible: { opacity: 1, transition: { duration: 0.1 } },
};

const variants = {
  fadeIn,
  fadeInWithLift,
  fadeInParent,
  menuVariants,
  menuItemVariants,
};

export default variants;
