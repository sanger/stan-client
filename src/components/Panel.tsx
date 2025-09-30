import React from 'react';
import variants from '../lib/motionVariants';
import { motion } from '../dependencies/motion';

type PanelProps = {
  children: React.ReactNode;
  dataTestId?: string;
};

export default function Panel({ children, dataTestId }: PanelProps) {
  return (
    <motion.div
      variants={variants.fadeInWithLift}
      initial={'hidden'}
      animate={'visible'}
      className="relative p-3 shadow-md"
      data-testid={dataTestId || 'panel'}
    >
      {children}
    </motion.div>
  );
}
