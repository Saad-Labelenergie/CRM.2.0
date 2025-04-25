import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { useFirebase } from '../hooks/useFirebase';
import { SchedulingService, Installation, Team } from './scheduling-service';
import { doc, deleteDoc, collection, query, getDocs, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Mettez à jour l'interface Appointment dans ce fichier également
// Modifiez l'interface Appointment pour qu'elle soit compatible avec celle de scheduling-service.ts
interface Appointment {
  id: string;
  title: string;
<<<<<<< HEAD
  // Propriétés au niveau racine
  name?: string;
  postalCode?: string;
  id2?: number;
  // Ajout d'une propriété client optionnelle pour la compatibilité
  client?: {
    id: number;
=======
  client: {
    id: string;
>>>>>>> cb36a90c2ef46acd151c0c3c39b6329f6c3bf2d1
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
  updateAppointment: (appointmentId: string, updates: Partial<Appointment>) => Promise<void>;
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
  // Supprimer cette ligne qui crée un conflit
  // const [teams, setTeams] = useState<Team[]>([]);
  
  // Garder uniquement cette déclaration
  const { 
    data: teams, 
    loading: teamsLoading, 
    error: teamsError,
    update: updateTeam,
    add: addTeam
  } = useFirebase<Team>('teams', { orderByField: 'name' });

  // Garder cette ligne
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  const {
    data: appointmentsFromFirebase,
    add: addAppointmentToFirebase,
    update: updateAppointmentInFirebase,
    remove: removeAppointment
  } = useFirebase<Appointment>('appointments', { orderByField: 'date' });

  // Fusionner les rendez-vous de useState et useFirebase
  useEffect(() => {
    if (appointmentsFromFirebase) {
      setAppointments(appointmentsFromFirebase);
    }
  }, [appointmentsFromFirebase]);

  const {
    data: projects,
    add: addProject,
    update: updateProject
  } = useFirebase<Project>('projects', { orderByField: 'startDate' });

  // Around line 91
  const schedulingService = useMemo(() => {
    // Adapter les rendez-vous pour qu'ils soient compatibles avec SchedulingService
    const adaptedAppointments = appointments.map(apt => {
      // Créer un objet client à partir des propriétés au niveau racine
      const adaptedApt = {
        ...apt,
        client: {
          id: apt.id2 || 0,
          name: apt.name || '',
          postalCode: apt.postalCode || ''
        }
      };
      return adaptedApt;
    });
    
    return new SchedulingService(adaptedAppointments, teams || []);
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

  // Assurez-vous que cette fonction récupère tous les rendez-vous
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const appointmentsRef = collection(db, 'appointments');
        const q = query(appointmentsRef);
        const querySnapshot = await getDocs(q);
        
        const appointmentsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Appointment[];
        
        setAppointments(appointmentsData);
        console.log('Rendez-vous récupérés:', appointmentsData.length);
      } catch (error) {
        console.error('Erreur lors de la récupération des rendez-vous:', error);
      }
    };
    
    fetchAppointments();
  }, []);

  // Ajouter ces deux fonctions manquantes
  const addAppointment = async (appointment: Appointment): Promise<string> => {
    try {
      const id = await addAppointmentToFirebase(appointment);
      return id;
    } catch (error) {
      console.error('Error adding appointment:', error);
      throw error;
    }
  };

  const updateAppointment = async (appointmentId: string, updates: Partial<Appointment>): Promise<void> => {
    try {
      console.log(`Updating appointment ${appointmentId} with:`, updates);
      
      // Extraire les données client si elles existent dans l'objet updates
      let updatesToSave = { ...updates };
      
      // Si updates contient un objet client, extraire ses propriétés au niveau racine
      if (updatesToSave.client) {
        console.log(`Client object detected in updates:`, updatesToSave.client);
        
        // Extraire les propriétés du client
        if (updatesToSave.client.id !== undefined) updatesToSave.id2 = updatesToSave.client.id;
        if (updatesToSave.client.name !== undefined) updatesToSave.name = updatesToSave.client.name;
        if (updatesToSave.client.postalCode !== undefined) updatesToSave.postalCode = updatesToSave.client.postalCode;
        
        // Supprimer l'objet client car il n'existe pas dans la structure Firestore
        delete updatesToSave.client;
        
        console.log(`Restructured updates for Firestore:`, updatesToSave);
      }
      
      // Vérifier si le document existe déjà
      const appointmentRef = doc(db, 'appointments', appointmentId);
      const appointmentSnap = await getDoc(appointmentRef);
      
      if (appointmentSnap.exists()) {
        // Mettre à jour le document existant
        await updateDoc(appointmentRef, {
          ...updatesToSave,
          updatedAt: new Date()
        });
        console.log(`Appointment ${appointmentId} updated successfully`);
      } else {
        // Créer un nouveau document avec l'ID spécifié
        await setDoc(appointmentRef, {
          ...updatesToSave,
          id: appointmentId,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`Appointment ${appointmentId} created successfully`);
      }
      
      // Mettre à jour l'état local
      setAppointments((prev: Appointment[]) => {
        const index = prev.findIndex((a: Appointment) => a.id === appointmentId);
        if (index >= 0) {
          // Mettre à jour l'élément existant
          const updated = [...prev];
          updated[index] = { ...updated[index], ...updates };
          return updated;
        } else {
          // Ajouter un nouvel élément
          return [...prev, { id: appointmentId, ...updates } as Appointment];
        }
      });
    } catch (error) {
      console.error(`Error updating appointment ${appointmentId}:`, error);
      throw error;
    }
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
    updateAppointment, // Assurez-vous que cette ligne existe
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

// Supprimer cette fonction dupliquée ci-dessous
// const updateAppointment = async (id: string, data: any) => {
//   console.log(`updateAppointment appelé avec id: ${id}`);
//   console.log(`Données reçues dans updateAppointment:`, data);
//   console.log(`Structure client dans updateAppointment:`, data.client);
  
//   try {
//     // Votre code existant pour mettre à jour le rendez-vous
//     const appointmentRef = doc(db, 'appointments', id);
//     console.log(`Référence Firestore créée pour ${id}`);
    
//     const result = await updateDoc(appointmentRef, data);
//     console.log(`Mise à jour réussie pour ${id}`, result);
    
//     // Mettre à jour l'état local avec des types explicites
//     setAppointments((prev: Appointment[]) => 
//       prev.map((apt: Appointment) => apt.id === id ? { ...apt, ...data } : apt)
//     );
    
//     return { success: true, id };
//   } catch (error) {
//     console.error(`Erreur dans updateAppointment pour ${id}:`, error);
//     return { success: false, error };
//   }
// };
