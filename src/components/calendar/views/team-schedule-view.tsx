import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useCalendarStore } from '../../../lib/calendar/calendar-store';
import { useScheduling } from '../../../lib/scheduling/scheduling-context';
import { ChangeTeamModal } from '../components/change-team-modal';
import { ChangeWeekTeamModal } from '../components/change-week-team-modal';
import { ProjectDetailsModal } from '../components/project-details-modal';
import { ExternalLink, Trash2 } from 'lucide-react';
import { Toast } from '../../ui/toast';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function TeamScheduleView() {
  const { currentDate, selectedTeams } = useCalendarStore();
  const { appointments, teams, updateAppointmentTeam, updateWeekTeam, deleteAppointment } = useScheduling();
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isChangeTeamModalOpen, setIsChangeTeamModalOpen] = useState(false);
  const [isProjectDetailsModalOpen, setIsProjectDetailsModalOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [changeWeekTeamData, setChangeWeekTeamData] = useState<{
    isOpen: boolean;
    team: { id: string; name: string; } | null;
  }>({
    isOpen: false,
    team: null
  });

  // Calculer les jours de la semaine
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  .filter(day => day.getDay() !== 0 && day.getDay() !== 6); // Exclut dimanche (0) et samedi (6)

  // Filtrer uniquement les rendez-vous attribués et les équipes actives
  const activeTeams = teams.filter(team => team.isActive);
  const assignedAppointments = appointments.filter(appointment => {
    const matchesTeam = selectedTeams.length === 0 || selectedTeams.some(teamId => 
      appointment.team && appointment.team.includes(teamId)
    );
    const isAssigned = appointment.status === 'attribue';
    return matchesTeam && isAssigned;
  });

  const handleAppointmentClick = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsChangeTeamModalOpen(true);
  };

  const handleViewDetails = (e: React.MouseEvent, appointment: any) => {
    e.stopPropagation();
    setSelectedAppointment(appointment);
    setIsProjectDetailsModalOpen(true);
  };

  const handleDeleteAppointment = async (e: React.MouseEvent, appointmentId: string) => {
    e.stopPropagation();
    try {
      await deleteAppointment(appointmentId);
      setShowSuccessToast(true);
    } catch (error) {
      console.error('Erreur lors de la suppression du rendez-vous:', error);
    }
  };

  const handleChangeTeam = (appointmentId: string, newTeamName: string) => {
    updateAppointmentTeam(appointmentId, newTeamName);
  };

  const handleChangeWeekTeam = (currentTeamId: string, newTeamName: string) => {
    const weekAppointments = assignedAppointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return appointment.team === teams.find(t => t.id === currentTeamId)?.name &&
             appointmentDate >= weekStart &&
             appointmentDate <= weekEnd;
    });

    weekAppointments.forEach(appointment => {
      updateAppointmentTeam(appointment.id, newTeamName);
    });
  };

  return (
    <>
      <div className="min-w-[1200px]">
        {/* En-tête des jours */}
        <div className="grid grid-cols-[200px_repeat(5,1fr)] border-b border-border/50">
        <div className="p-4 font-medium text-muted-foreground">Équipes</div>
          {weekDays.map(day => (
            <div
              key={day.toString()}
              className="p-4 text-center border-l border-border/50"
            >
              <div className="text-sm font-medium text-muted-foreground">
                {format(day, 'EEEE', { locale: fr })}
              </div>
              <div className="mt-1 font-semibold">
                {format(day, 'd MMMM', { locale: fr })}
              </div>
            </div>
          ))}
        </div>

        {/* Grille des équipes et rendez-vous */}
        {activeTeams.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">Aucune équipe active</h3>
            <p className="text-muted-foreground">
              Activez des équipes pour voir leur planning
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {activeTeams.map(team => (
              <div
                key={team.id}
                className="grid grid-cols-[200px_repeat(7,1fr)]"
              >
                {/* Nom de l'équipe */}
                <div 
                  className="p-4 flex items-center cursor-pointer hover:bg-accent/50 rounded-lg transition-colors"
                  onClick={() => setChangeWeekTeamData({
                    isOpen: true,
                    team: { id: team.id, name: team.name }
                  })}
                >
                  <div className="font-medium">{team.name}</div>
                </div>

                {/* Cellules des jours */}
                {weekDays.map(day => {
                  const dayAppointments = assignedAppointments.filter(appointment => 
                    appointment.date === format(day, 'yyyy-MM-dd') &&
                    appointment.team === team.name
                  );

                  return (
                    <div
                      key={day.toString()}
                      className="min-h-[120px] p-2 border-l border-border/50 relative"
                    >
                      {dayAppointments.map((appointment, index) => (
                        <motion.div
                          key={appointment.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={() => handleAppointmentClick(appointment)}
                          className="mb-2 p-2 rounded-lg cursor-pointer hover:brightness-95 transition-all group"
                          style={{
                            backgroundColor: `${appointment.teamColor}20`,
                            borderLeft: `4px solid ${appointment.teamColor}`
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium truncate">
                                {appointment.time} - {appointment.title}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {appointment.client.name}
                              </div>
                              <div className="text-xs mt-1">
                                Durée: {appointment.duration}
                              </div>
                            </div>
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => handleViewDetails(e, appointment)}
                                className="p-1.5 hover:bg-background/50 rounded-lg transition-colors"
                              >
                                <ExternalLink className="w-4 h-4 text-muted-foreground" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => handleDeleteAppointment(e, appointment.id)}
                                className="p-1.5 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      ))}

                      {/* Indicateur jour actuel */}
                      {format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') && (
                        <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-primary m-2" />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      <ChangeTeamModal
        isOpen={isChangeTeamModalOpen}
        onClose={() => setIsChangeTeamModalOpen(false)}
        appointment={selectedAppointment}
        onSave={handleChangeTeam}
      />

      <ChangeWeekTeamModal
        isOpen={changeWeekTeamData.isOpen}
        onClose={() => setChangeWeekTeamData({ isOpen: false, team: null })}
        currentTeam={changeWeekTeamData.team}
        weekDates={weekDays}
        onSave={handleChangeWeekTeam}
      />

      <ProjectDetailsModal
        isOpen={isProjectDetailsModalOpen}
        onClose={() => setIsProjectDetailsModalOpen(false)}
        appointment={selectedAppointment}
      />

      <Toast
        message="Le rendez-vous a été supprimé avec succès"
        isVisible={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
      />
    </>
  );
}