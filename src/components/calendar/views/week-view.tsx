import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useCalendarStore } from '../../../lib/calendar/calendar-store';
import { useScheduling } from '../../../lib/scheduling/scheduling-context';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function WeekView() {
  const { getDaysInView, selectedTeams } = useCalendarStore();
  const { appointments } = useScheduling();
  const days = getDaysInView();

  const filteredAppointments = appointments.filter(appointment => 
    selectedTeams.length === 0 || selectedTeams.some(teamId => 
      appointment.team && appointment.team.includes(teamId)
    )
  );

  return (
    <div className="min-w-[1200px]">
      {/* En-tête des jours */}
      <div className="grid grid-cols-[100px_repeat(7,1fr)] border-b border-border/50">
        <div /> {/* Cellule vide pour l'alignement */}
        {days.map(day => (
          <div
            key={day.toString()}
            className="p-4 text-center"
          >
            <div className="text-sm font-medium text-muted-foreground">
              {format(day, 'EEEE', { locale: fr })}
            </div>
            <div className="mt-1 text-lg font-semibold">
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* Grille des heures */}
      <div className="grid grid-cols-[100px_repeat(7,1fr)] divide-x divide-border/50">
        {/* Colonne des heures */}
        <div className="space-y-[60px] pt-[30px]">
          {HOURS.map(hour => (
            <div key={hour} className="text-sm text-muted-foreground px-4">
              {String(hour).padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {/* Colonnes des jours */}
        {days.map(day => (
          <div key={day.toString()} className="relative">
            {/* Grille des heures */}
            {HOURS.map(hour => (
              <div
                key={hour}
                className="border-t border-border/50 h-[60px] first:border-t-0"
              />
            ))}

            {/* Ligne indiquant l'heure actuelle */}
            {format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') && (
              <div 
                className="absolute left-0 right-0 border-t-2 border-primary z-10"
                style={{
                  top: `${(new Date().getHours() * 60 + new Date().getMinutes()) * (60 / 60)}px`
                }}
              />
            )}

            {/* Rendez-vous */}
            {filteredAppointments
              .filter(appointment => appointment.date === format(day, 'yyyy-MM-dd'))
              .map((appointment, index) => {
                const [hours, minutes] = appointment.time.split(':').map(Number);
                const duration = parseInt(appointment.duration);
                const top = hours * 60 + minutes;
                const height = duration * 60;

                return (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute left-1 right-1 rounded-lg p-2 cursor-pointer"
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                      backgroundColor: appointment.teamColor + '20',
                      borderLeft: `4px solid ${appointment.teamColor}`
                    }}
                  >
                    <div className="font-medium text-sm truncate">{appointment.title}</div>
                    <div className="text-xs text-muted-foreground mt-1 truncate">
                      {appointment.client.name}
                    </div>
                    {appointment.team && (
                      <div className="text-xs mt-1 truncate" style={{ color: appointment.teamColor }}>
                        {appointment.team}
                      </div>
                    )}
                  </motion.div>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
}