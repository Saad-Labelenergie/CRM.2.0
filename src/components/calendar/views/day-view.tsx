import React, { useState } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { useCalendarStore } from '../../../lib/calendar/calendar-store';
import { useScheduling } from '../../../lib/scheduling/scheduling-context';
import { Toast } from '../../../components/ui/toast';

// Définition des heures
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function DayView() {
  const { currentDate, selectedTeams } = useCalendarStore();
  const { appointments, deleteAppointment } = useScheduling();
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const filteredAppointments = appointments.filter(appointment => {
    const matchesDate = appointment.date === format(currentDate, 'yyyy-MM-dd');
    const matchesTeam = selectedTeams.length === 0 || selectedTeams.some(teamId => 
      appointment.team && appointment.team.includes(teamId)
    );
    return matchesDate && matchesTeam;
  });

  const handleDeleteClick = (e: React.MouseEvent, appointment: any) => {
    e.stopPropagation();
    setSelectedAppointment(appointment);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedAppointment) {
      try {
        await deleteAppointment(selectedAppointment.id);
        setShowSuccessToast(true);
      } catch (error) {
        console.error('Erreur lors de la suppression du rendez-vous:', error);
      }
    }
  };

  return (
    <>
      <div className="min-w-[800px]">
        <div className="grid grid-cols-[100px_1fr] divide-x divide-border/50">
          {/* Colonne des heures */}
          <div className="space-y-[60px] pt-[30px]">
            {HOURS.map(hour => (
              <div key={hour} className="text-sm text-muted-foreground px-4">
                {String(hour).padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Colonne des événements */}
          <div className="relative">
            {/* Grille des heures */}
            <div className="absolute inset-0">
              {HOURS.map(hour => (
                <div
                  key={hour}
                  className="border-t border-border/50 h-[60px] first:border-t-0"
                />
              ))}
            </div>

            {/* Ligne indiquant l'heure actuelle */}
            {format(currentDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') && (
              <div 
                className="absolute left-0 right-0 border-t-2 border-primary z-10"
                style={{
                  top: `${(new Date().getHours() * 60 + new Date().getMinutes()) * (60 / 60)}px`
                }}
              />
            )}

            {filteredAppointments.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-muted-foreground">
                  Aucun rendez-vous pour cette date
                </p>
              </div>
            ) : (
              filteredAppointments.map((appointment, index) => {
                const [hours, minutes] = appointment.time.split(':').map(Number);
                const duration = parseInt(appointment.duration);
                const top = hours * 60 + minutes;
                const height = duration * 60;

                return (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute left-2 right-2 rounded-lg p-2 cursor-pointer group"
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                      backgroundColor: appointment.teamColor + '20',
                      borderLeft: `4px solid ${appointment.teamColor}`
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{appointment.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {appointment.client.name}
                        </div>
                        {appointment.team && (
                          <div className="text-xs mt-1" style={{ color: appointment.teamColor }}>
                            {appointment.team}
                          </div>
                        )}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => handleDeleteClick(e, appointment)}
                        className="p-1.5 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
      {/* Toast de succès */}
      <Toast
        message="Rendez-vous supprimé avec succès"
        isVisible={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
      />
    </>
  );
}