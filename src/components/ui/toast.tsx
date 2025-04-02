import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export function Toast({ message, isVisible, onClose }: ToastProps) {
  React.useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-6 py-4 rounded-xl shadow-lg border border-green-200 dark:border-green-800 flex items-center space-x-3">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">{message}</span>
            <button
              onClick={onClose}
              className="p-1 hover:bg-green-200 dark:hover:bg-green-800 rounded-lg transition-colors ml-2"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}