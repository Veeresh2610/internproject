import React from 'react';
import { motion } from 'framer-motion';

interface LoaderProps {
  size?: number;
  color?: string;
}

const Loader: React.FC<LoaderProps> = ({ size = 40, color = '#4F46E5' }) => {
  return (
    <div className="flex justify-center items-center">
      <motion.div
        style={{
          width: size,
          height: size,
          border: `4px solid ${color}`,
          borderBottomColor: 'transparent',
          borderRadius: '50%',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
};

export default Loader;