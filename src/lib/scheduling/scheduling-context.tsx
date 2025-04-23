import React, { createContext, useContext, useMemo } from 'react';
import { useFirebase } from '../hooks/useFirebase';
import { SchedulingService, Installation, Team } from './scheduling-service';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Mettez à jour l'interface Appointment dans ce fichier également
interface Appointment {
  id: string;
  title: string;
  client: {
    id: number;
    name: string;
    postalCode: string;
  };
  date: string;
  time: string;
  team: string | null;
  teamColor?: string;
  type: 'installation' | 'maintenance' | 'urgence';
  duration: string;
  installationTime?: number;
  // Ajouter ces nouvelles propriétés pour les rendez-vous multi-jours
  daysSpan?: number;
  isMultiDay?: boolean;
  isFirstDay?: boolean;
  isLastDay?: boolean;
  parentId?: string | null;
  status: 'non_attribue' | 'attribue' | 'termine';
}

interface Project {
  id: string;
  name: string;
  client: {
    id: number;
    name: string;
  };
  status: 'en_attente' | 'charger' | 'en_cours' | 'terminer';
  startDate: string;
  type: string;
  team: string | null;
  appointments: Appointment[];
  materials?: {
    id: number;
    name: string;
    status: 'installed' | 'not_installed';
  }[];
}

interface SchedulingContextType {
  findOptimalSlot: (installation: Installation) => {
    team: Team;
    startDate: Date;
    endDate: Date;
    score: number;
  }[];
  getAvailableTeamsForDate: (date: string, installation: Installation) => Team[];
  teams: Team[];
  loading: boolean;
  error: string | null;
  updateTeamSchedule: (teamId: string, schedule: any) => void;
  appointments: Appointment[];
  addAppointment: (appointment: Appointment) => Promise<string>;
  deleteAppointment: (appointmentId: string) => Promise<void>;
  projects: Project[];
  addProject: (project: Project) => Promise<string>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
  toggleTeamActive: (teamId: string) => Promise<void>;
  updateAppointmentTeam: (appointmentId: string, newTeamName: string) => Promise<void>;
  updateProjectMaterials: (projectId: string, materials: { id: number; name: string; status: 'installed' | 'not_installed'; }[]) => Promise<void>;
  createTeam: (team: Omit<Team, 'id'>) => Promise<string>;
}

const SchedulingContext = createContext<SchedulingContextType | null>(null);

export function SchedulingProvider({ children }: { children: React.ReactNode }) {
  const { 
    data: teams, 
    loading: teamsLoading, 
    error: teamsError,
    update: updateTeam,
    add: addTeam
  } = useFirebase<Team>('teams', { orderByField: 'name' });

  const {
    data: appointments,
    add: addAppointment,
    update: updateAppointment,
    remove: removeAppointment
  } = useFirebase<Appointment>('appointments', { orderByField: 'date' });

  const {
    data: projects,
    add: addProject,
    update: updateProject
  } = useFirebase<Project>('projects', { orderByField: 'startDate' });

  // Around line 91
  const schedulingService = useMemo(() => {
    return new SchedulingService(appointments || [], teams || []);
  }, [appointments, teams]);

  const findOptimalSlot = (installation: Installation) => {
    return schedulingService.findOptimalSlot(installation);
  };

  const getAvailableTeamsForDate = (date: string, installation: Installation) => {
    return schedulingService.getAvailableTeamsForDate(date, installation);
  };

  const toggleTeamActive = async (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (team) {
      await updateTeam(teamId, { isActive: !team.isActive });
    }
  };

  const createTeam = async (team: Omit<Team, 'id'>) => {
    return await addTeam(team);
  };

  const deleteAppointment = async (appointmentId: string) => {
    try {
      // Find the project containing this appointment
      const project = projects.find(p => p.appointments?.some(a => a.id === appointmentId));
      
      if (project) {
        // Remove the appointment from the project
        const updatedAppointments = project.appointments.filter(a => a.id !== appointmentId);
        await updateProject(project.id, {
          appointments: updatedAppointments
        });
      }

      // Delete the appointment document
      await removeAppointment(appointmentId);
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  };

  const updateAppointmentTeam = async (appointmentId: string, newTeamName: string) => {
    try {
      const team = teams.find(t => t.name === newTeamName);
      if (!team) {
        console.warn(`Team ${newTeamName} not found`);
        return;
      }
  
      const appointmentUpdate = {
        team: newTeamName,
        teamColor: team.color,
        status: 'attribue' as const
      };
  
      await updateAppointment(appointmentId, appointmentUpdate);
  
      const project = projects.find(p => p.appointments?.some(a => a.id === appointmentId));
      if (project) {
        const updatedAppointments = project.appointments.map(a => {
          if (a.id === appointmentId) {
            return {
              ...a,
              ...appointmentUpdate
            };
          }
          return a;
        });
  
        await updateProject(project.id, {
          team: newTeamName,
          appointments: updatedAppointments
        });
      }
    } catch (error) {
      console.error('Error updating appointment team:', error);
      throw error;
    }
  };

  const updateProjectMaterials = async (projectId: string, materials: { id: number; name: string; status: 'installed' | 'not_installed'; }[]) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    // Check if all materials are installed
    const allInstalled = materials.every(m => m.status === 'installed');
    const anyInstalled = materials.some(m => m.status === 'installed');
    const today = new Date();
    const startDate = new Date(project.startDate);

    // Determine new status
    let newStatus = project.status;
    if (allInstalled) {
      newStatus = 'terminer';
    } else if (anyInstalled && today >= startDate) {
      newStatus = 'en_cours';
    } else if (anyInstalled) {
      newStatus = 'charger';
    } else {
      newStatus = 'en_attente';
    }

    await updateProject(projectId, {
      materials,
      status: newStatus
    });
  };

  const value = {
    findOptimalSlot,
    getAvailableTeamsForDate,
    teams,
    loading: teamsLoading,
    error: teamsError,
    updateTeamSchedule: () => {},
    appointments,
    addAppointment,
    deleteAppointment,
    projects,
    addProject,
    updateProject,
    toggleTeamActive,
    updateAppointmentTeam,
    updateProjectMaterials,
    createTeam
  };

  return (
    <SchedulingContext.Provider value={value}>
      {children}
    </SchedulingContext.Provider>
  );
}

export function useScheduling() {
  const context = useContext(SchedulingContext);
  if (!context) {
    throw new Error('useScheduling must be used within a SchedulingProvider');
  }
  return context;
}
