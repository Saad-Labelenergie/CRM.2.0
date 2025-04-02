import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Truck, Calendar, AlertCircle } from 'lucide-react';

interface VehicleHistoryEntry {
  id: string;
  model: string;
  registration: string;
  startDate: string;
  endDate: string | null;
  notes?: string;
}

interface VehicleHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: VehicleHistoryEntry[];
  onSave: (entry: Omit<VehicleHistoryEntry, 'id'>) => void;
}

export function VehicleHistoryModal({ isOpen, onClose, history, onSave }: VehicleHistoryModalProps) {
  const [formData, setFormData] = useState<Omit<VehicleHistoryEntry, 'id'>>({
    model: '',
    registration: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: null,
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.model.trim()) {
      newErrors.model = 'Le modèle est requis';
    }
    if (!formData.registration.trim()) {
      newErrors.registration = 'L\'immatriculation est requise';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'La date de début est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
      setFormData({
        model: '',
        registration: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: null,
        notes: ''
      });
      onClose();
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
            className="relative w-full max-w-2xl bg-card p-6 rounded-xl shadow-xl z-50 border border-border/50 mx-4 max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center">
                <Truck className="w-5 h-5 mr-2 text-primary" />
                Historique des véhicules
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-accent/50 rounded-lg p-4 space-y-4">
                  <h3 className="font-medium">Ajouter un véhicule</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Modèle *
                      </label>
                      <input
                        type="text"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="ex: Citroën Jumpy"
                      />
                      {errors.model && (
                        <p className="text-destructive text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.model}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Immatriculation *
                      </label>
                      <input
                        type="text"
                        value={formData.registration}
                        onChange={(e) => setFormData({ ...formData, registration: e.target.value })}
                        className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="ex: AB-123-CD"
                      />
                      {errors.registration && (
                        <p className="text-destructive text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.registration}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Date de début *
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      {errors.startDate && (
                        <p className="text-destructive text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.startDate}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Date de fin
                      </label>
                      <input
                        type="date"
                        value={formData.endDate || ''}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value || null })}
                        className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Notes
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-24 resize-none"
                        placeholder="Informations complémentaires..."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Ajouter
                  </motion.button>
                </div>
              </form>

              <div className="mt-8">
                <h3 className="font-medium mb-4">Historique</h3>
                <div className="space-y-4">
                  {history.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Aucun historique disponible
                    </p>
                  ) : (
                    history.map((entry) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-accent/50 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{entry.model}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {entry.registration}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4 mr-1" />
                              {entry.startDate}
                            </div>
                            {entry.endDate && (
                              <div className="text-sm text-muted-foreground mt-1">
                                Jusqu'au {entry.endDate}
                              </div>
                            )}
                          </div>
                        </div>
                        {entry.notes && (
                          <p className="text-sm text-muted-foreground mt-2 border-t border-border/50 pt-2">
                            {entry.notes}
                          </p>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}