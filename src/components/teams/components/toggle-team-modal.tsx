import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Check } from 'lucide-react';

interface ToggleTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  teamName: string;
  isActive: boolean;
}

export function ToggleTeamModal({ isOpen, onClose, onConfirm, teamName, isActive }: ToggleTeamModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-md bg-card p-6 rounded-xl shadow-xl z-50 border border-border/50 mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <AlertTriangle className={`w-5 h-5 mr-2 ${
                  isActive ? 'text-red-500' : 'text-green-500'
                }`} />
                <h2 className="text-xl font-semibold">Confirmation</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-muted-foreground mb-6">
              {isActive ? (
                <>
                  Êtes-vous sûr de vouloir <span className="text-red-500 font-medium">désactiver</span> l'équipe <span className="font-medium">{teamName}</span> ?
                  <br /><br />
                  Cette équipe ne sera plus disponible pour les planifications et les interventions.
                </>
              ) : (
                <>
                  Êtes-vous sûr de vouloir <span className="text-green-500 font-medium">activer</span> l'équipe <span className="font-medium">{teamName}</span> ?
                  <br /><br />
                  Cette équipe sera de nouveau disponible pour les planifications et les interventions.
                </>
              )}
            </p>

            <div className="flex justify-end space-x-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-accent hover:bg-accent/80 transition-colors"
              >
                Annuler
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                  isActive
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                <Check className="w-4 h-4 mr-2" />
                Confirmer
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}