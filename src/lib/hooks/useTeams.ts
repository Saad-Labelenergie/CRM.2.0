import { useFirebase } from './useFirebase';

export interface Team {
  id: string;
  name: string;
  expertise: string[];
  isActive: boolean;
  color: string;
  schedule: {
    date: string;
    slots: {
      start: string;
      end: string;
      isAvailable: boolean;
    }[];
  }[];
  projects?: string[]; // 🔁 RELATION
}


export function useTeams() {
  return useFirebase<Team>('teams', { orderByField: 'name' });
}