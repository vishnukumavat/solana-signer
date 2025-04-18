import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { createPortal } from "react-dom";

type ToastProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  description?: string;
  variant?: "success" | "error" | "info";
};

export function Toast({
  open,
  setOpen,
  title,
  description,
  variant = "info",
}: ToastProps) {
  const variantStyles = {
    success: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    error: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    info: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
  };

  const variantTitleStyles = {
    success: "text-green-800 dark:text-green-400",
    error: "text-red-800 dark:text-red-400",
    info: "text-amber-800 dark:text-amber-400",
  };

  const variantIcons = {
    success: <CheckCircle className="text-green-600 dark:text-green-400" size={18} />,
    error: <AlertCircle className="text-red-600 dark:text-red-400" size={18} />,
    info: <Info className="text-amber-600 dark:text-amber-400" size={18} />,
  };

  const toastContent = (
    <ToastPrimitives.Provider swipeDirection="right">
      <AnimatePresence>
        {open && (
          <ToastPrimitives.Root
            open={open}
            onOpenChange={setOpen}
            duration={5000}
            className="z-[9999]"
          >
            <motion.div
              className={`fixed bottom-20 sm:bottom-10 right-4 sm:right-6 p-4 rounded-lg border shadow-xl max-w-md w-[calc(100%-2rem)] sm:w-auto ${variantStyles[variant]}`}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", bounce: 0.3 }}
              style={{ zIndex: 9999 }}
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 pt-0.5">
                    {variantIcons[variant]}
                  </div>
                  <div>
                    <ToastPrimitives.Title className={`font-medium mb-1 ${variantTitleStyles[variant]}`}>
                      {title}
                    </ToastPrimitives.Title>
                    {description && (
                      <ToastPrimitives.Description className="text-sm text-gray-600 dark:text-gray-400">
                        {description}
                      </ToastPrimitives.Description>
                    )}
                  </div>
                </div>
                <ToastPrimitives.Close asChild>
                  <button 
                    onClick={() => setOpen(false)}
                    className="text-gray-400 hover:text-gray-500 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Close"
                  >
                    <X size={16} />
                  </button>
                </ToastPrimitives.Close>
              </div>
            </motion.div>
          </ToastPrimitives.Root>
        )}
      </AnimatePresence>
      <ToastPrimitives.Viewport />
    </ToastPrimitives.Provider>
  );

  // Use createPortal to render the toast at the document body level
  return typeof document !== 'undefined' 
    ? createPortal(toastContent, document.body) 
    : toastContent;
} 