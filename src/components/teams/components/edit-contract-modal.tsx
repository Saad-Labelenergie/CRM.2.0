import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Calendar } from 'lucide-react';

interface ContractDates {
  startDate: string;
  endDate: string | null;
}

interface EditContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDates: ContractDates;
  onSave: (dates: ContractDates) => void;
}

export function EditContractModal({ isOpen, onClose, currentDates, onSave }: EditContractModalProps) {
  const [startDate, setStartDate] = useState(currentDates.startDate);
  const [endDate, setEndDate] = useState(currentDates.endDate);
  const [hasEndDate, setHasEndDate] = useState(!!currentDates.endDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      startDate,
      endDate: hasEndDate ? endDate : null
    });
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
              <h2 className="text-xl font-semibold flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-primary" />
                Modifier les dates du contrat
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-muted-foreground mb-1">
                  Date de début
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="hasEndDate"
                    checked={hasEndDate}
                    onChange={(e) => setHasEndDate(e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="hasEndDate" className="ml-2 text-sm font-medium text-muted-foreground">
                    Définir une date de fin
                  </label>
                </div>

                {hasEndDate && (
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-muted-foreground mb-1">
                      Date de fin
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      value={endDate || ''}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required={hasEndDate}
                    />
                  </div>
                )}
              </div>

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