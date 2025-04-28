import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, CalendarDays, Users } from 'lucide-react';

interface ChangeSemainModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: any;
  appointments: any[];
  teams: any[]; // Liste des équipes actives
  onSave: (appointmentId: string, newDate: string, newTeam: any) => void;
}

export function ChangeSemainModal({
  isOpen,
  onClose,
  appointment,
  appointments,
  teams,
  onSave
}: ChangeSemainModalProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<any>(appointment?.team || null);
  const [error, setError] = useState<string>('');

  if (!appointment) return null;

  // Vérifie si la date est libre pour l'équipe sélectionnée
  const isDateFree = (date: string, teamName: string) => {
    return !appointments.some(app =>
      app.id !== appointment.id &&
      app.team === teamName &&
      app.date === date
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) {
      setError('Veuillez sélectionner une date.');
      return;
    }
    if (!selectedTeam) {
      setError('Veuillez sélectionner une équipe.');
      return;
    }
    if (!isDateFree(selectedDate, selectedTeam.name)) {
      setError('Cette date est déjà prise pour cette équipe.');
      return;
    }
    setError('');
    onSave(appointment.id, selectedDate, selectedTeam);
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
                <CalendarDays className="w-5 h-5 mr-2 text-primary" />
                Changer la date et l'équipe du rendez-vous
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Sélection de l'équipe */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Nouvelle équipe
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {teams.map(team => (
                      <button
                        type="button"
                        key={team.id}
                        className={`px-3 py-1 rounded-lg border flex items-center space-x-2
                          ${selectedTeam && selectedTeam.id === team.id
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-accent text-accent-foreground border-border'}
                        `}
                        onClick={() => setSelectedTeam(team)}
                      >
                        <Users className="w-4 h-4 mr-1" />
                        <span>{team.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {/* Sélection de la date */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Nouvelle date
                  </label>
                  <input
                    type="date"
                    className="w-full p-2 rounded border"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                  />
                </div>
                {error && (
                  <div className="text-red-500 text-sm">{error}</div>
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
                    Confirmer
                  </motion.button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}