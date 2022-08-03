import React from 'react';
import variants from '../lib/motionVariants';
import { motion } from 'framer-motion';

type PanelProps = {
  children: React.ReactNode;
};

export default function Panel({ children }: PanelProps) {
  return (
    <motion.div
      variants={variants.fadeInWithLift}
      initial={'hidden'}
      animate={'visible'}
      className="relative p-3 shadow"
    >
      {children}
    </motion.div>
  );
}
