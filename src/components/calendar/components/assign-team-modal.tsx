import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Users, Calendar, Clock, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import * as Select from '@radix-ui/react-select';

interface Team {
  id: string;
  name: string;
  color: string;
  available: boolean;
}

const teams: Team[] = [
  { id: '1', name: 'Équipe A', color: '#3B82F6', available: true },
  { id: '2', name: 'Équipe B', color: '#10B981', available: true },
  { id: '3', name: 'Équipe C', color: '#F59E0B', available: false },
  { id: '4', name: 'Équipe D', color: '#8B5CF6', available: true },
];

interface AssignTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: {
    id: number;
    title: string;
    date: string;
    time: string;
    duration: string;
    client: {
      name: string;
      postalCode: string;
    };
  };
  onAssign: (eventId: number, teamName: string) => void;
}

export function AssignTeamModal({ isOpen, onClose, event, onAssign }: AssignTeamModalProps) {
  const [selectedTeam, setSelectedTeam] = React.useState<string>('');

  const handleAssign = () => {
    if (selectedTeam) {
      onAssign(event.id, selectedTeam);
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
            className="relative w-full max-w-md bg-card p-6 rounded-xl shadow-xl z-50 border border-border/50 mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary" />
                Attribuer une équipe
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Détails du rendez-vous */}
              <div className="bg-accent/50 rounded-lg p-4 space-y-2">
                <div className="font-medium">{event.title}</div>
                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {format(new Date(event.date), 'dd MMMM yyyy', { locale: fr })}
                  </div>
                  <div className="flex items-center mt-1">
                    <Clock className="w-4 h-4 mr-2" />
                    {event.time} • {event.duration}
                  </div>
                </div>
              </div>

              {/* Sélection de l'équipe */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Sélectionner une équipe
                </label>
                <Select.Root value={selectedTeam} onValueChange={setSelectedTeam}>
                  <Select.Trigger className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-between">
                    <Select.Value placeholder="Choisir une équipe" />
                    <Select.Icon>
                      <Users className="w-4 h-4 text-muted-foreground" />
                    </Select.Icon>
                  </Select.Trigger>

                  <Select.Portal>
                    <Select.Content className="bg-card border rounded-lg shadow-lg">
                      <Select.Viewport className="p-1">
                        {teams.map((team) => (
                          <Select.Item
                            key={team.id}
                            value={team.name}
                            disabled={!team.available}
                            className={`
                              relative flex items-center px-8 py-2 text-sm rounded-lg
                              data-[highlighted]:bg-accent outline-none select-none
                              ${!team.available ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                            `}
                          >
                            <div className="flex items-center">
                              <div 
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: team.color }}
                              />
                              <Select.ItemText>{team.name}</Select.ItemText>
                            </div>
                            {!team.available && (
                              <span className="absolute right-2 text-xs text-muted-foreground">
                                Non disponible
                              </span>
                            )}
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
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
                onClick={handleAssign}
                disabled={!selectedTeam}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4 mr-2" />
                Attribuer
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}