import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, TrendingUp, ArrowUp } from 'lucide-react';

interface MileageRecord {
  date: string;
  mileage: number;
  difference: number;
}

interface MileageHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: MileageRecord[];
}

export function MileageHistoryModal({ isOpen, onClose, history }: MileageHistoryModalProps) {
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
            className="relative w-full max-w-2xl bg-card p-6 rounded-xl shadow-xl z-50 border border-border/50 mx-4 max-h-[80vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                Historique des kilométrages
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              <div className="space-y-4">
                {history.map((record, index) => (
                  <motion.div
                    key={record.date}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-accent/50 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                        <span className="font-medium">{record.date}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          {record.mileage.toLocaleString()} km
                        </div>
                        {record.difference > 0 && (
                          <div className="flex items-center text-sm text-green-600">
                            <ArrowUp className="w-4 h-4 mr-1" />
                            +{record.difference.toLocaleString()} km
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}