import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertTriangle } from 'lucide-react';

interface UpdateMileageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMileage: number;
  onSave: (newMileage: number) => void;
}

export function UpdateMileageModal({ isOpen, onClose, currentMileage, onSave }: UpdateMileageModalProps) {
  const [mileage, setMileage] = useState(currentMileage);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mileage < currentMileage) {
      setError('Le nouveau kilométrage ne peut pas être inférieur au kilométrage actuel');
      return;
    }
    onSave(mileage);
    onClose();
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
              <h2 className="text-xl font-semibold">Mettre à jour le kilométrage</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="mileage" className="block text-sm font-medium text-muted-foreground mb-1">
                  Nouveau kilométrage
                </label>
                <input
                  type="number"
                  id="mileage"
                  value={mileage}
                  onChange={(e) => {
                    setMileage(Number(e.target.value));
                    setError('');
                  }}
                  className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Entrez le nouveau kilométrage"
                  min={currentMileage}
                  step="1"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Kilométrage actuel : {currentMileage.toLocaleString()} km
                </p>
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-destructive">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-accent hover:bg-accent/80 transition-colors"
                >
                  Annuler
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Enregistrer
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}