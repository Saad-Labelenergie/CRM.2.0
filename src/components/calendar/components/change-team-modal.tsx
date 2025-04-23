import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Users, Calendar, Clock, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useScheduling } from '../../../lib/scheduling/scheduling-context';

interface ChangeTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: {
    id: string;
    title: string;
    client: {
      name: string;
    };
    date: string;
    time: string;
    duration: string;
    team: string | null;
  } | null;
  onSave: (appointmentId: string, newTeamName: string) => void;
}

export function ChangeTeamModal({ isOpen, onClose, appointment, onSave }: ChangeTeamModalProps) {
  const { teams } = useScheduling();
  const [selectedTeam, setSelectedTeam] = React.useState<string>('');

  // Réinitialiser l'équipe sélectionnée quand la modale s'ouvre
  React.useEffect(() => {
    if (isOpen && appointment) {
      setSelectedTeam(appointment.team || '');
    }
  }, [isOpen, appointment]);

  const activeTeams = teams.filter(team => team.isActive);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (appointment && selectedTeam) {
      onSave(appointment.id, selectedTeam);
      onClose();
    }
  };

  if (!appointment) return null;

  // Ajouter un log pour déboguer les données du rendez-vous
  console.log('Appointment data in modal:', appointment);

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
                <Users className="w-5 h-5 mr-2 text-primary" />
                Changer l'équipe
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-accent/50 rounded-lg p-4 mb-6">
              <h3 className="font-medium mb-4">Détails du rendez-vous</h3>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>{appointment.client.name}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>{format(new Date(appointment.date), 'dd MMMM yyyy', { locale: fr })}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>{appointment.time} - Durée : {appointment.duration}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Sélectionner une équipe
                  </label>
                  <div className="space-y-2">
                    {activeTeams.map((team) => (
                      <button
                        key={team.id}
                        type="button"
                        onClick={() => setSelectedTeam(team.name)}
                        className={`w-full p-3 rounded-lg text-left transition-colors flex items-center justify-between ${
                          selectedTeam === team.name
                            ? 'bg-primary/10 border-primary'
                            : 'bg-background hover:bg-accent'
                        } border`}
                      >
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          {team.name}
                        </div>
                        {selectedTeam === team.name && (
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </button>
                    ))}
                  </div>
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
                    disabled={!selectedTeam || selectedTeam === appointment.team}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
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