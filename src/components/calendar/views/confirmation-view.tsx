import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useCalendarStore } from '../../../lib/calendar/calendar-store';
import { useScheduling } from '../../../lib/scheduling/scheduling-context';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function ConfirmationView() {
  const { currentDate, selectedTeams } = useCalendarStore();
  const { appointments } = useScheduling();

  // Filtrer uniquement les rendez-vous non attribués
  const unassignedAppointments = appointments.filter(appointment => {
    const matchesDate = appointment.date === format(currentDate, 'yyyy-MM-dd');
    const isUnassigned = appointment.status === 'non_attribue';
    return matchesDate && isUnassigned;
  });

  return (
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

          {unassignedAppointments.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-muted-foreground">
                Aucun rendez-vous non attribué pour cette date
              </p>
            </div>
          ) : (
            unassignedAppointments.map((appointment, index) => {
              const [hours, minutes] = appointment.time.split(':').map(Number);
              const duration = parseInt(appointment.duration);
              const top = hours * 60 + minutes;
              const height = duration * 60;

              return (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute left-2 right-2 rounded-lg p-2 cursor-pointer bg-orange-100 dark:bg-orange-900/30 border-l-4 border-orange-500"
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                  }}
                >
                  <div className="font-medium text-sm">{appointment.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {appointment.client.name}
                  </div>
                  <div className="text-xs mt-1 text-orange-600 dark:text-orange-400">
                    En attente d'attribution
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}