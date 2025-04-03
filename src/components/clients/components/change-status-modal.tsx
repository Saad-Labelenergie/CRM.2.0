import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';

interface ChangeStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (status: 'completed' | 'pending' | 'in-progress') => void;
  clientName: string;
  newStatus: 'completed' | 'pending' | 'in-progress';
}

export function ChangeStatusModal({ isOpen, onClose, onConfirm, clientName, newStatus }: ChangeStatusModalProps) {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'pending': return 'En attente';
      case 'in-progress': return 'En cours';
      default: return status;
    }
  };

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
                <AlertCircle className="w-5 h-5 mr-2 text-primary" />
                <h2 className="text-xl font-semibold">Changer le statut</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-muted-foreground mb-6">
              Êtes-vous sûr de vouloir changer le statut du client <span className="font-medium">{clientName}</span> à{' '}
              <span className="font-medium">{getStatusLabel(newStatus)}</span> ?
            </p>

            <div className="flex justify-end space-x-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg hover:bg-accent transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => onConfirm(newStatus)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Confirmer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}