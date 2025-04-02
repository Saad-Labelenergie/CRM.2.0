import React from 'react';
import { motion } from 'framer-motion';
import { format, isSameMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useCalendarStore } from '../../../lib/calendar/calendar-store';
import { useScheduling } from '../../../lib/scheduling/scheduling-context';

export function MonthView() {
  const { currentDate, getDaysInView, selectedTeams } = useCalendarStore();
  const { appointments } = useScheduling();
  const days = getDaysInView();

  const filteredAppointments = appointments.filter(appointment => 
    selectedTeams.length === 0 || selectedTeams.some(teamId => 
      appointment.team && appointment.team.includes(teamId)
    )
  );

  // Grouper les jours par semaine
  const weeks = days.reduce((acc, day, i) => {
    const weekIndex = Math.floor(i / 7);
    if (!acc[weekIndex]) acc[weekIndex] = [];
    acc[weekIndex].push(day);
    return acc;
  }, [] as Date[][]);

  return (
    <div className="min-w-[1000px]">
      {/* En-tête des jours */}
      <div className="grid grid-cols-7 gap-px">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Grille des jours */}
      <div className="grid grid-cols-7 gap-px bg-border/50">
        {weeks.map((week, weekIndex) => (
          <React.Fragment key={weekIndex}>
            {week.map((day) => {
              const isCurrentMonth = isSameMonth(day, currentDate);
              const dayAppointments = filteredAppointments.filter(
                appointment => appointment.date === format(day, 'yyyy-MM-dd')
              );

              return (
                <div
                  key={day.toString()}
                  className={`min-h-[120px] p-2 bg-card ${
                    !isCurrentMonth ? 'opacity-50' : ''
                  }`}
                >
                  <div className="text-sm font-medium mb-2">
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayAppointments.map((appointment) => (
                      <motion.div
                        key={appointment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-1 rounded text-sm cursor-pointer"
                        style={{
                          backgroundColor: appointment.teamColor + '20',
                          color: appointment.teamColor
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate">{appointment.time}</span>
                        </div>
                        <div className="truncate text-xs">{appointment.client.name}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}