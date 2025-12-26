import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  glass?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = 'md',
  shadow = 'sm',
  hover = false,
  glass = false,
}) => {
  const baseClasses = 'rounded-lg border transition-all duration-200';
  
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-soft',
    md: 'shadow-medium',
    lg: 'shadow-strong',
  };

  const backgroundClasses = glass
    ? 'glass-effect'
    : 'bg-white dark:bg-dark-surface border-gray-200 dark:border-dark-border';

  const hoverClasses = hover
    ? 'hover:shadow-medium hover:-translate-y-1 cursor-pointer'
    : '';

  return (
    <motion.div
      initial={hover ? { y: 0 } : false}
      whileHover={hover ? { y: -2 } : {}}
      className={clsx(
        baseClasses,
        backgroundClasses,
        paddingClasses[padding],
        shadowClasses[shadow],
        hoverClasses,
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export default Card;