import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, addDays, startOfWeek, endOfWeek, isToday, differenceInMinutes, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useCalendarStore } from '../../../lib/calendar/calendar-store';
import { useScheduling } from '../../../lib/scheduling/scheduling-context';
import { ChangeTeamModal } from '../components/change-team-modal';
import { ChangeWeekTeamModal } from '../components/change-week-team-modal';
import { ProjectDetailsModal } from '../components/project-details-modal';
// Import Eye icon from lucide-react
import { ExternalLink, Trash2, Eye } from 'lucide-react';
import { Toast } from '../../ui/toast';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const WORKING_HOURS = { start: { hour: 9, minute: 0 }, end: { hour: 18, minute: 0 } };

// Add interface for component props
// Modifiez l'interface des props
interface TeamScheduleViewProps {
  filteredAppointments?: any[]; // Optional prop for filtered appointments
  filteredTeams?: any[]; // Optional prop for filtered teams
}

export function TeamScheduleView({ filteredAppointments, filteredTeams }: TeamScheduleViewProps) {
  // État pour suivre l'heure actuelle à Paris
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  // Effet pour mettre à jour l'heure actuelle toutes les minutes
  useEffect(() => {
    const updateCurrentTime = () => {
      // Obtenir l'heure actuelle à Paris
      const now = new Date();
      const parisTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
      setCurrentTime(parisTime);
    };
    
    // Mettre à jour immédiatement
    updateCurrentTime();
    
    // Puis mettre à jour toutes les minutes
    const interval = setInterval(updateCurrentTime, 60000);
    
    // Nettoyer l'intervalle lors du démontage du composant
    return () => clearInterval(interval);
  }, []);
  
  // Calculer la position relative du trait en fonction de l'heure actuelle
  const calculateTimePosition = (day: Date) => {
    if (!isToday(day)) return null;
    
    // Calculer les minutes écoulées depuis le début de la journée
    const startOfWorkDay = new Date(day);
    startOfWorkDay.setHours(WORKING_HOURS.start.hour, WORKING_HOURS.start.minute, 0);
    
    const endOfWorkDay = new Date(day);
    endOfWorkDay.setHours(WORKING_HOURS.end.hour, WORKING_HOURS.end.minute, 0);
    
    // Calculer la position relative (0 à 1)
    const totalWorkMinutes = differenceInMinutes(endOfWorkDay, startOfWorkDay);
    const minutesSinceStart = differenceInMinutes(currentTime, startOfWorkDay);
    
    // Si en dehors des heures de travail
    if (minutesSinceStart < 0) return 0; // Avant le début de la journée
    if (minutesSinceStart > totalWorkMinutes) return 1; // Après la fin de la journée
    
    // Position relative dans la journée de travail
    return minutesSinceStart / totalWorkMinutes;
  };

  const { currentDate, selectedTeams } = useCalendarStore();
  const { appointments, teams, updateAppointmentTeam, deleteAppointment } = useScheduling();
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
  
  // Determine which teams to display
  const teamsToDisplay = filteredTeams || 
    (selectedTeams.length > 0 
      ? activeTeams.filter(team => selectedTeams.includes(team.id))
      : activeTeams);
  
  // Use filtered appointments if provided, otherwise use the default filter
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
              
              {/* Ligne verticale pour indiquer le jour actuel */}
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
                  // Filtrer les rendez-vous qui commencent ce jour ou qui sont en cours ce jour
                  const dayAppointments = assignedAppointments.filter(appointment => {
                    // Vérifier si le rendez-vous commence ce jour
                    const startsThisDay = appointment.date === format(day, 'yyyy-MM-dd');
                    
                    // Ne pas afficher les rendez-vous qui sont des jours suivants d'un rendez-vous multi-jours
                    // Nous n'affichons que le premier jour d'un rendez-vous multi-jours
                    return (startsThisDay && appointment.team === team.name && 
                           (!appointment.parentId || appointment.isFirstDay));
                  });

                  // Calculer la position du trait d'heure actuelle
                  const timePosition = calculateTimePosition(day);

                  return (
                    <div
                      key={day.toString()}
                      className={`min-h-[120px] p-2 border-l border-border/50 relative ${
                        isToday(day) ? 'bg-accent/10' : ''
                      }`}
                    >
                      {/* Ligne verticale pour le jour actuel qui se déplace avec l'heure */}
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
                      
                      {/* Affichage des rendez-vous pour ce jour et cette équipe */}
                      <div className="relative h-full">
                        {dayAppointments.map((appointment, index) => {
                          // Calculer la largeur du rendez-vous en fonction de sa durée
                          let colSpan = 1; // Par défaut, 1 jour
                          
                          // Extraire la durée en jours si disponible
                          if (appointment.duration) {
                            // Exemple: "1.5 jours" ou "2 jours"
                            const durationMatch = appointment.duration.match(/(\d+\.?\d*)\s*(jour|jours)/i);
                            if (durationMatch) {
                              // Limiter la durée à maximum 2 jours
                              const durationDays = Math.min(2, parseFloat(durationMatch[1]));
                              colSpan = Math.min(durationDays, weekDays.length - dayIndex);
                            }
                          }
                          
                          return (
                            <motion.div
                              key={appointment.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              onClick={() => handleAppointmentClick(appointment)}
                              className={`
                                absolute left-1 rounded-lg p-2 cursor-pointer 
                                shadow-sm hover:shadow-md transition-shadow duration-200 
                                border-l-4 group
                              `}
                              style={{
                                borderColor: team.color || '#ccc',
                                backgroundColor: `${team.color}1A`,
                                top: `${index * 5}px`,
                                zIndex: 10 + index,
                                // Étendre la largeur en fonction du nombre de jours
                                width: colSpan > 1 ? `calc(${colSpan * 100}% - ${colSpan * 4}px)` : 'calc(100% - 2px)',
                                right: colSpan > 1 ? 'auto' : '1px',
                              }}
                            >
                              {/* Apply bold, larger size, and wrapping */}
                              <div className="text-sm font-semibold overflow-hidden uppercase"> 
                                {appointment.client.name}
                              </div>
                              <div className="text-xs mt-1 opacity-80">{appointment.duration}</div>
                              
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
                                  onClick={(e) => handleDeleteAppointment(e, appointment.id)}
                                  className="p-1 rounded-full hover:bg-black/20"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-3 h-3" />
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
    </>
  );
}