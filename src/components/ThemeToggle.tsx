import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="relative h-10 w-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300"
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      <motion.div
        initial={false}
        animate={{
          rotate: theme === 'dark' ? 0 : 180,
          opacity: theme === 'dark' ? 1 : 0,
        }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className="absolute"
      >
        <Sun size={18} className="text-amber-500" />
      </motion.div>
      
      <motion.div
        initial={false}
        animate={{
          rotate: theme === 'light' ? 0 : -180,
          opacity: theme === 'light' ? 1 : 0,
        }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className="absolute"
      >
        <Moon size={18} className="text-solana-purple" />
      </motion.div>
    </motion.button>
  );
} 