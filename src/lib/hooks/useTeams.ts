import { useFirebase } from './useFirebase';

interface Team {
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
}

export function useTeams() {
  return useFirebase<Team>('teams', { orderByField: 'name' });
}