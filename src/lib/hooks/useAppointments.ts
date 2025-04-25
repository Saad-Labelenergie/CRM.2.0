import { useFirebase } from './useFirebase';
import { updateProjectStatus as fbUpdateProjectStatus } from './useProjects';
import { useState } from 'react';


interface Appointment {
  id: string;
  title: string;
  client: {
    id: string;
    name: string;
    postalCode: string;
  };
  date: string;
  time: string;
  team: string | null;
  teamColor?: string;
  type: 'installation' | 'maintenance' | 'urgence';
  duration: string;
  status: 'non_attribue' | 'attribue' | 'termine';
  createdAt: Date;
  updatedAt: Date;
}


export function useAppointments() {
  return useFirebase<Appointment>('appointments', { orderByField: 'date' });
}

function useScheduling() {
  const [projects, setProjects] = useState<ProjectType[]>([]);

  async function updateProjectStatus(projectId: string, newStatus: string) {
    await fbUpdateProjectStatus(projectId, newStatus);
    setProjects(prev =>
      prev.map(p => (p.id === projectId ? { ...p, status: newStatus } : p))
    );
  }

  return {
    projects,
    updateProjectStatus,
  };
}