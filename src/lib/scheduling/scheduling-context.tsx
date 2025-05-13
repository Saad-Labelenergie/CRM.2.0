import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { useFirebase } from '../hooks/useFirebase';
import { SchedulingService, Installation, Team } from './scheduling-service';
import { doc, deleteDoc, collection, query, getDocs, getDoc, updateDoc, setDoc, addDoc, where } from 'firebase/firestore';
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
  installationDate: string;  // Add this line
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
  materials?: {
    id: number;
    name: string;
    status: 'installed' | 'not_installed';
  }[];
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

// Modifiez l'interface SchedulingContextType pour inclure updateAppointmentMaterials
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
  updateAppointmentTeam: (
    appointmentId: string, 
    newTeamName: string,
    newDate?: string
  ) => Promise<void>;
  updateProjectMaterials: (projectId: string, materials: { id: number; name: string; status: 'installed' | 'not_installed'; }[]) => Promise<void>;
  createTeam: (team: Omit<Team, 'id'>) => Promise<string>;
  updateTeamLoad: (teamId: string, currentLoad: number) => Promise<void>;
  updateAppointmentMaterials: (appointmentId: string, materials: { id: number; name: string; status: 'installed' | 'not_installed'; }[]) => Promise<void>;
  addLoadingRecord: (record: Omit<LoadingRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateLoadingRecord: (id: string, updates: Partial<LoadingRecord>) => Promise<void>;
  getLoadingRecords: (teamId?: string) => Promise<LoadingRecord[]>;
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

  const updateAppointmentTeam = async (appointmentId: string, newTeamName: string, newDate?: string) => {
    try {
      const team = teams.find(t => t.name === newTeamName);
      if (!team) {
        console.warn(`Team ${newTeamName} not found`);
        return;
      }
  
      // Define the type for appointmentUpdate
      const appointmentUpdate: Partial<Appointment> = {
        team: newTeamName,
        teamColor: team.color,
        status: 'attribue' as const
      };
  
      // Add date to update if provided
      if (newDate) {
        appointmentUpdate.date = newDate;
        appointmentUpdate.installationDate = newDate;
      }
  
      await updateAppointment(appointmentId, appointmentUpdate);
  
      // Update project if exists
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
  
      // Update local state
      setAppointments(prev => prev.map(app => {
        if (app.id === appointmentId) {
          return { ...app, ...appointmentUpdate };
        }
        return app;
      }));
  
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
      
      // Vérifier si le document existe déjà
      const appointmentRef = doc(db, 'appointments', appointmentId);
      const appointmentSnap = await getDoc(appointmentRef);
      
      if (appointmentSnap.exists()) {
        // Mettre à jour le document existant
        await updateDoc(appointmentRef, {
          ...updates,
          updatedAt: new Date()
        });
        console.log(`Appointment ${appointmentId} updated successfully`);
      } else {
        // Créer un nouveau document avec l'ID spécifié
        await setDoc(appointmentRef, {
          ...updates,
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

  // Ajoutez la fonction updateTeamLoad ici, avant le return
  const updateTeamLoad = async (teamId: string, currentLoad: number) => {
    try {
      // Use type assertion to tell TypeScript that currentLoad is a valid property
      await updateTeam(teamId, { currentLoad } as Partial<Team>);
      console.log(`Charge de l'équipe ${teamId} mise à jour: ${currentLoad}%`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la charge de l\'équipe:', error);
      throw error;
    }
  };

  // Ajoutez cette fonction directement ici (pas dans un composant imbriqué)
  // Modifions la fonction updateAppointmentMaterials pour qu'elle fonctionne correctement
  const updateAppointmentMaterials = async (appointmentId: string, materials: { id: number; name: string; status: 'installed' | 'not_installed'; }[]) => {
  try {
    console.log(`Mise à jour des matériaux pour le rendez-vous ${appointmentId}:`, materials);
    
    // Vérifier si le document existe déjà
    const appointmentRef = doc(db, 'appointments', appointmentId);
    const appointmentSnap = await getDoc(appointmentRef);
    
    if (appointmentSnap.exists()) {
      // Mettre à jour le document existant
      await updateDoc(appointmentRef, {
        materials,
        updatedAt: new Date()
      });
      console.log(`Matériaux du rendez-vous ${appointmentId} mis à jour avec succès`);
      
      // Mettre à jour l'état local
      setAppointments(prev => prev.map(app => 
        app.id === appointmentId ? { ...app, materials } : app
      ));
      
      // Mettre à jour également le projet associé si nécessaire
      const project = projects.find(p => p.appointments?.some(a => a.id === appointmentId));
      if (project) {
        const updatedAppointments = project.appointments.map(a => {
          if (a.id === appointmentId) {
            return { ...a, materials };
          }
          return a;
        });
        
        await updateProject(project.id, {
          appointments: updatedAppointments,
          // Mettre à jour les matériaux du projet également
          materials
        });
      }
    } else {
      console.error(`Le rendez-vous ${appointmentId} n'existe pas`);
    }
  } catch (error) {
    console.error(`Erreur lors de la mise à jour des matériaux du rendez-vous ${appointmentId}:`, error);
    throw error;
  }
};
  
  return (
    <SchedulingContext.Provider value={{
      findOptimalSlot,
      getAvailableTeamsForDate,
      teams,
      loading: teamsLoading,
      error: teamsError,
      updateTeamSchedule: updateTeam,
      appointments,
      addAppointment,
      updateAppointment,
      deleteAppointment,
      projects,
      addProject,
      updateProject,
      toggleTeamActive,
      updateAppointmentTeam,
      updateProjectMaterials,
      createTeam,
      updateTeamLoad,
      updateAppointmentMaterials,
      addLoadingRecord,
      updateLoadingRecord,
      getLoadingRecords,
    }}>
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


interface LoadingRecord {
  id: string;
  projectId: string;
  projectName: string;
  teamId: string;
  teamName: string;
  date: string;
  materials: {
    id: number;
    name: string;
    status: 'not_loaded' | 'loaded';
    updatedAt: Date;
    updatedBy?: string;
  }[];
  documentsSubmitted: boolean;
  progress: number;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}


// Add a loading record to the "chargement" collection
const addLoadingRecord = async (record: Omit<LoadingRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const chargementRef = collection(db, 'chargement');
  const now = new Date();
  const docRef = await addDoc(chargementRef, {
    ...record,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
};

// Update a loading record in the "chargement" collection
const updateLoadingRecord = async (id: string, updates: Partial<LoadingRecord>): Promise<void> => {
  const recordRef = doc(db, 'chargement', id);
  await updateDoc(recordRef, {
    ...updates,
    updatedAt: new Date(),
  });
};

// Get loading records from the "chargement" collection (optionally filter by teamId)
const getLoadingRecords = async (teamId?: string): Promise<LoadingRecord[]> => {
  const chargementRef = collection(db, 'chargement');
  let q = query(chargementRef);
  if (teamId) {
    q = query(chargementRef, where('teamId', '==', teamId));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as LoadingRecord[];
};


// Ajouter cette fonction dans votre contexte
const getProjectIdByAppointmentId = async (appointmentId: string) => {
  try {
    // Rechercher dans la collection projects un document qui a le même ID que l'appointment
    // ou qui a une référence à cet appointment
    const projectsRef = collection(db, 'projects');
    const q = query(projectsRef, where('appointmentId', '==', appointmentId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      // Retourner l'ID du premier projet trouvé
      return querySnapshot.docs[0].id;
    }
    
    // Si aucun projet n'est trouvé avec appointmentId, essayer de chercher par nom/titre
    // Cette partie est optionnelle et dépend de votre structure de données
    const appointmentRef = doc(db, 'appointments', appointmentId);
    const appointmentSnap = await getDoc(appointmentRef);
    
    if (appointmentSnap.exists()) {
      const appointmentData = appointmentSnap.data();
      const q2 = query(projectsRef, where('name', '==', appointmentData.title));
      const querySnapshot2 = await getDocs(q2);
      
      if (!querySnapshot2.empty) {
        return querySnapshot2.docs[0].id;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Erreur lors de la recherche du projet:", error);
    return null;
  }
};

// Ajouter cette fonction à votre contexte
const contextValue = {
  // ... autres valeurs existantes
  getProjectIdByAppointmentId,
};
