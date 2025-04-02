import { useFirebase } from './useFirebase';

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
  status: 'non_attribue' | 'attribue' | 'termine';
  createdAt: Date;
  updatedAt: Date;
}

export function useAppointments() {
  return useFirebase<Appointment>('appointments', { orderByField: 'date' });
}