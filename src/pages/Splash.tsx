import React from 'react';
import { motion } from '../dependencies/motion';

const Splash = () => {
  return (
    <div className="bg-linear-to-bl from-sdb via-sdb-400 to-sdb-400">
      <motion.div
        initial={{ opacity: 0.1 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex w-screen h-screen items-center justify-center"
      >
        <svg
          version="1.1"
          className="logo loading fill-current text-sp"
          viewBox="0 0 92 92"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="53.5" y="0" width="9" height="9" ry="1.8" />
          <rect x="67.5" y="1" width="7" height="7" ry="1.8" />

          <rect x="1" y="15.5" width="7" height="7" ry="1.8" />
          <rect x="39.75" y="13.75" width="10.5" height="10.5" ry="1.8" />
          <rect x="52.75" y="13.75" width="10.5" height="10.5" ry="1.8" />
          <rect x="81" y="14.5" width="9" height="9" ry="1.8" />

          <rect x="13.75" y="26.75" width="10.5" height="10.5" ry="1.8" />
          <rect x="39" y="26" width="12" height="12" ry="1.8" />
          <rect x="52" y="26" width="12" height="12" ry="1.8" />

          <rect x="0" y="40.5" width="9" height="9" ry="1.8" />
          <rect x="13.75" y="39.75" width="10.5" height="10.5" ry="1.8" />
          <rect x="26" y="39" width="12" height="12" ry="1.8" />
          <rect x="39" y="39" width="12" height="12" ry="1.8" />
          <rect x="65.75" y="39.75" width="10.5" height="10.5" ry="1.8" />

          <rect x="26" y="52" width="12" height="12" ry="1.8" />
          <rect x="52" y="52" width="12" height="12" ry="1.8" />
          <rect x="65.75" y="52.75" width="10.5" height="10.5" ry="1.8" />

          <rect x="13.75" y="65.75" width="10.5" height="10.5" ry="1.8" />
          <rect x="39.75" y="65.75" width="10.5" height="10.5" ry="1.8" />
          <rect x="52.75" y="65.75" width="10.5" height="10.5" ry="1.8" />
          <rect x="81.5" y="68.5" width="7" height="7" ry="1.8" />

          <rect x="1" y="80.5" width="7" height="7" ry="1.8" />
          <rect x="66.5" y="79.5" width="9" height="9" ry="1.8" />
        </svg>
      </motion.div>
    </div>
  );
};

export default Splash;
