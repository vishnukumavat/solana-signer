import React from 'react';
import { motion } from 'framer-motion';

type ButtonProps = {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outlined' | 'ghost';
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  isLoading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

export function Button({
  children,
  variant = 'primary',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  isLoading = false,
  icon,
  fullWidth = false,
  size = 'md',
  ...props
}: ButtonProps & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'>) {
  const sizeClasses = {
    sm: 'text-xs px-3 py-2 h-8',
    md: 'text-sm px-4 py-2.5 h-10',
    lg: 'text-base px-5 py-3 h-12',
  };
  
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-solana-purple disabled:opacity-50 disabled:pointer-events-none';
  
  const variantClasses = {
    primary: 'bg-solana-purple text-white hover:bg-purple-600 active:bg-purple-700 shadow-sm',
    secondary: 'bg-solana-blue text-white hover:bg-blue-500 active:bg-blue-600 shadow-sm',
    outlined: 'border border-solana-purple text-solana-purple dark:text-white hover:bg-solana-purple/10 active:bg-solana-purple/20',
    ghost: 'text-solana-purple dark:text-solana-blue hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700'
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
    </motion.button>
  );
} 