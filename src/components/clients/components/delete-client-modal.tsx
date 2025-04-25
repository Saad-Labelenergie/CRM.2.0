import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (clientId: string) => Promise<void>; 
  clientName: string;
  clientId: string; 
}

export function DeleteClientModal({ isOpen, onClose, onConfirm, clientName ,clientId}: DeleteClientModalProps) {
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
                <AlertTriangle className="w-5 h-5 mr-2 text-destructive" />
                <h2 className="text-xl font-semibold">Supprimer le client</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-muted-foreground mb-6">
              Êtes-vous sûr de vouloir supprimer le client <span className="font-medium">{clientName}</span> ?
              <br /><br />
              Cette action est irréversible et supprimera toutes les données associées à ce client.
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
                  onConfirm(clientId);
                  onClose();
                }}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}