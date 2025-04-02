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
  return useFirebase<Client>('clients', { orderByField: 'name' });
}