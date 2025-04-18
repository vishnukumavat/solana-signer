import React from 'react';
import { motion } from 'framer-motion';

type CardProps = {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
  variant?: 'default' | 'elevated';
};

export function Card({ 
  children, 
  className = '', 
  animate = true,
  variant = 'default'
}: CardProps) {
  const baseClasses = 'bg-white dark:bg-gray-800 rounded-xl overflow-hidden';
  
  const variantClasses = {
    default: 'border border-gray-200 dark:border-gray-700',
    elevated: 'shadow-md dark:shadow-gray-900/30'
  };
  
  if (!animate) {
    return (
      <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
        {children}
      </div>
    );
  }
  
  return (
    <motion.div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-5 border-b border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-5 border-t border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  );
} 