import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays, startOfWeek, endOfWeek, isToday, differenceInMinutes, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useCalendarStore } from '../../../lib/calendar/calendar-store';
import { useScheduling } from '../../../lib/scheduling/scheduling-context';
import { ChangeTeamModal } from '../components/change-team-modal';
import { ChangeWeekTeamModal } from '../components/change-week-team-modal';
import { ProjectDetailsModal } from '../components/project-details-modal';
import { ExternalLink, Trash2, Eye, X, AlertTriangle, CalendarDays } from 'lucide-react';
import { Toast } from '../../ui/toast';
// Ajout de l'import du composant de changement de semaine
import { ChangeSemainModal } from '../components/change-semain';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const WORKING_HOURS = { start: { hour: 9, minute: 0 }, end: { hour: 18, minute: 0 } };

interface TeamScheduleViewProps {
  filteredAppointments?: any[];
  filteredTeams?: any[];
}

export function TeamScheduleView({ filteredAppointments, filteredTeams }: TeamScheduleViewProps) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date();
      const parisTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
      setCurrentTime(parisTime);
    };
    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const calculateTimePosition = (day: Date) => {
    if (!isToday(day)) return null;
    const startOfWorkDay = new Date(day);
    startOfWorkDay.setHours(WORKING_HOURS.start.hour, WORKING_HOURS.start.minute, 0);
    const endOfWorkDay = new Date(day);
    endOfWorkDay.setHours(WORKING_HOURS.end.hour, WORKING_HOURS.end.minute, 0);
    const totalWorkMinutes = differenceInMinutes(endOfWorkDay, startOfWorkDay);
    const minutesSinceStart = differenceInMinutes(currentTime, startOfWorkDay);
    if (minutesSinceStart < 0) return 0;
    if (minutesSinceStart > totalWorkMinutes) return 1;
    return minutesSinceStart / totalWorkMinutes;
  };

  const { currentDate, selectedTeams } = useCalendarStore();
  const { appointments, teams, updateAppointmentTeam, deleteAppointment } = useScheduling();
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isChangeTeamModalOpen, setIsChangeTeamModalOpen] = useState(false);
  const [isProjectDetailsModalOpen, setIsProjectDetailsModalOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null);

  const [changeWeekTeamData, setChangeWeekTeamData] = useState<{
    isOpen: boolean;
    team: { id: string; name: string; } | null;
  }>({
    isOpen: false,
    team: null
  });

  // Ajout des états pour la modale de changement de date
  const [isChangeSemainModalOpen, setIsChangeSemainModalOpen] = useState(false);
  const [appointmentToChangeDate, setAppointmentToChangeDate] = useState<any>(null);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
    .filter(day => day.getDay() !== 0 && day.getDay() !== 6);

  const activeTeams = teams.filter(team => team.isActive);

  const teamsToDisplay = filteredTeams ||
    (selectedTeams.length > 0
      ? activeTeams.filter(team => selectedTeams.includes(team.id))
      : activeTeams);

  const assignedAppointments = filteredAppointments || appointments.filter(appointment => {
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

  const handleDeleteAppointment = (e: React.MouseEvent, appointment: any) => {
    e.stopPropagation();
    setSelectedAppointment(appointment);
    setAppointmentToDelete(appointment.id);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteAppointment = async () => {
    if (appointmentToDelete) {
      try {
        await deleteAppointment(appointmentToDelete);
        setShowSuccessToast(true);
        setIsDeleteModalOpen(false);
      } catch (error) {
        console.error('Erreur lors de la suppression du rendez-vous:', error);
      }
    }
  };

  const handleChangeTeam = (appointmentId: string, newTeamName: string) => {
    updateAppointmentTeam(appointmentId, newTeamName);
  };

  const handleChangeWeekTeam = (currentTeamId: string, newTeamName: string) => {
    const currentTeam = teams.find(t => t.id === currentTeamId);
    const newTeam = teams.find(t => t.name === newTeamName);
    if (!currentTeam || !newTeam) {
      console.warn("Team(s) not found, aborting swap.");
      return;
    }
    const weekStart = weekDays[0];
    const weekEnd = weekDays[weekDays.length - 1];
    const currentTeamAppointments = appointments.filter(app =>
      app.team === currentTeam.name &&
      new Date(app.date) >= weekStart &&
      new Date(app.date) <= weekEnd
    );
    const newTeamAppointments = appointments.filter(app =>
      app.team === newTeam.name &&
      new Date(app.date) >= weekStart &&
      new Date(app.date) <= weekEnd
    );
    currentTeamAppointments.forEach(app => {
      updateAppointmentTeam(app.id, newTeam.name);
    });
    newTeamAppointments.forEach(app => {
      updateAppointmentTeam(app.id, currentTeam.name);
    });
  };

  // Fonction de sauvegarde pour la modale de changement de date
  const handleChangeAppointmentDate = (appointmentId: string, newDate: string) => {
    // À adapter selon ta logique métier (ex: updateAppointmentDate)
    // updateAppointmentDate(appointmentId, newDate);
    setIsChangeSemainModalOpen(false);
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
              className={`p-4 text-center border-l border-border/50 relative ${
                isToday(day) ? 'bg-accent/10' : ''
              }`}
            >
              <div className="text-sm font-medium text-muted-foreground">
                {format(day, 'EEEE', { locale: fr })}
              </div>
              <div className="mt-1 font-semibold">
                {format(day, 'd MMMM', { locale: fr })}
              </div>
              {isToday(day) && (
                <div
                  className="absolute top-0 left-0 w-full h-1 bg-primary"
                  style={{ opacity: 0.7 }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Grille des équipes et rendez-vous */}
        {teamsToDisplay.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">Aucune équipe active</h3>
            <p className="text-muted-foreground">
              Activez des équipes pour voir leur planning
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {teamsToDisplay.map(team => (
              <div
                key={team.id}
                className="grid grid-cols-[200px_repeat(5,1fr)] border-b border-border/50"
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
                {weekDays.map((day, dayIndex) => {
                  const dayAppointments = assignedAppointments.filter(appointment => {
                    const startsThisDay = appointment.date === format(day, 'yyyy-MM-dd');
                    return (startsThisDay && appointment.team === team.name &&
                      (!appointment.parentId || appointment.isFirstDay));
                  });

                  const timePosition = calculateTimePosition(day);

                  return (
                    <div
                      key={day.toString()}
                      className={`min-h-[120px] p-2 border-l border-border/50 relative ${
                        isToday(day) ? 'bg-accent/10' : ''
                      }`}
                    >
                      {isToday(day) && timePosition !== null && (
                        <div
                          className="absolute top-0 h-full bg-primary"
                          style={{
                            width: '2px',
                            left: `calc(${timePosition * 100}%)`,
                            opacity: 0.7,
                            zIndex: 5
                          }}
                        />
                      )}

                      <div className="relative h-full">
                        {dayAppointments.map((appointment, index) => {
                          let colSpan = 1;
                          let isShort = false;

                          if (appointment.duration) {
                            const durationMatch = appointment.duration.match(/(\d+\.?\d*)\s*(jour|jours)/i);
                            if (durationMatch) {
                              const durationDays = Math.min(2, parseFloat(durationMatch[1]));
                              colSpan = Math.min(durationDays, weekDays.length - dayIndex);
                            }
                            const hourMatch = appointment.duration.match(/(\d+)\s*h/i);
                            if (hourMatch && parseInt(hourMatch[1]) <= 4) {
                              colSpan = 0.5;
                              isShort = true;
                            }
                          }

                          const shortAppointments = dayAppointments.filter(app => {
                            const hourMatch = app.duration?.match(/(\d+)\s*h/i);
                            return hourMatch && parseInt(hourMatch[1]) <= 4;
                          });

                          let positionStyle = {};
                          if (isShort && shortAppointments.length > 1) {
                            const shortIndex = shortAppointments.findIndex(app => app.id === appointment.id);
                            if (shortIndex === 0) {
                              positionStyle = { left: '1px', right: 'auto', width: 'calc(50% - 2px)', top: 0 };
                            } else if (shortIndex === 1) {
                              positionStyle = { right: '1px', left: 'auto', width: 'calc(50% - 2px)', top: 0 };
                            } else {
                              positionStyle = { right: '1px', left: 'auto', width: 'calc(50% - 2px)', top: `${(shortIndex) * 5}px` };
                            }
                          } else {
                            positionStyle = {
                              left: '1px',
                              width: colSpan === 0.5
                                ? 'calc(50% - 2px)'
                                : colSpan > 1
                                  ? `calc(${colSpan * 100}% - ${colSpan * 4}px)`
                                  : 'calc(100% - 2px)',
                              right: colSpan > 1 ? 'auto' : '1px',
                              top: `${index * 5}px`,
                            };
                          }

                          return (
                            <motion.div
                              key={appointment.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              onClick={() => handleAppointmentClick(appointment)}
                              className={`
                                absolute rounded-lg p-2 cursor-pointer 
                                shadow-sm hover:shadow-md transition-shadow duration-200 
                                border-l-4 group
                              `}
                              style={{
                                borderColor: team.color || '#ccc',
                                backgroundColor: `${team.color}1A`,
                                zIndex: 10 + index,
                                ...positionStyle,
                              }}
                            >
                              <div className="text-sm font-semibold overflow-hidden uppercase">
                                {appointment.client.name}
                              </div>
                              {appointment.title && (
                                <div className="text-xs font-medium mt-1 text-primary">
                                  {appointment.title}
                                </div>
                              )}
                              {/* Action buttons */}
                              <div className="absolute top-1 right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => handleViewDetails(e, appointment)}
                                  className="p-1 rounded-full hover:bg-black/20"
                                  title="Voir détails"
                                >
                                  <Eye className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => handleDeleteAppointment(e, appointment)}
                                  className="p-1 rounded-full hover:bg-black/20"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    setAppointmentToChangeDate(appointment);
                                    setIsChangeSemainModalOpen(true);
                                  }}
                                  className="p-1 rounded-full hover:bg-black/20"
                                  title="Changer la date"
                                >
                                  <CalendarDays className="w-3 h-3" />
                                </button>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
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

      {/* Modale de changement de date */}
      <ChangeSemainModal
        isOpen={isChangeSemainModalOpen}
        onClose={() => setIsChangeSemainModalOpen(false)}
        appointment={appointmentToChangeDate}
        appointments={appointments}
        teams={activeTeams} // <-- Ajoute cette ligne
        onSave={handleChangeAppointmentDate}
      />
      <AnimatePresence>
        {isDeleteModalOpen && selectedAppointment && (
          <div className="fixed inset-0 flex items-center justify-center z-[100]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50"
              onClick={() => setIsDeleteModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-card p-6 rounded-xl shadow-xl z-[101] border border-border/50 mx-4"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-destructive" />
                  <h2 className="text-xl font-semibold">Supprimer le rendez-vous</h2>
                </div>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-muted-foreground mb-6">
                Êtes-vous sûr de vouloir supprimer le rendez-vous suivant ?
                <br /><br />
                <span className="font-medium">{selectedAppointment.title || 'Rendez-vous'}</span>
                <br />
                Client : {selectedAppointment.client?.name}
                <br />
                Date : {selectedAppointment.date}
                <br /><br />
                Cette action est irréversible.
              </p>

              <div className="flex justify-end space-x-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-accent hover:bg-accent/80 transition-colors"
                >
                  Annuler
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmDeleteAppointment}
                  className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}