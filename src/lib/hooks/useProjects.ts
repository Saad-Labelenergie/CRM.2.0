import { useFirebase } from './useFirebase';

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
  appointments: {
    id: string;
    title: string;
    date: string;
    time: string;
    duration: string;
    status: string;
  }[];
  materials?: {
    id: number;
    name: string;
    status: 'installed' | 'not_installed';
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export function useProjects() {
  return useFirebase<Project>('projects', { orderByField: 'startDate' });
}