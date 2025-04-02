import {Product} from './useProducts';
import { useFirebase } from './useFirebase';

interface Client {
  id: string;
  name: string;
  contact: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    secondaryEmail?: string;
    secondaryPhone?: string;
  };
  products?: Product[];
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  tag?: string;
  createdAt: Date;
  updatedAt: Date;
}

export function useClients() {
  const firebase = useFirebase<Client>('clients', { orderByField: 'name' });

  const addClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const clientWithTimestamps = {
      ...clientData,
      createdAt: now,
      updatedAt: now
    };
    return firebase.add(clientWithTimestamps);
  };

  return {
    ...firebase,
    addClient
  };
}