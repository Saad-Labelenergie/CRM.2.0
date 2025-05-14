import {Product} from './useProducts';
import { useFirebase } from './useFirebase';

interface Client {
  id: string;
  name: string;
  status?: 'completed' | 'pending' | 'in-progress';

  contact: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    secondaryEmail?: string;
    secondaryPhone?: string;
  };

  Product?: string;
  productsIds?: string[];

  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };

  RAC?: {
    amount: number;
    hasToCollect: boolean;
    comment?: string;
  };

  tag?: string;
  createdAt: Date;
  updatedAt: Date;
}


export function useClients() {
  const firebase = useFirebase<Client>('clients', { orderByField: 'name' });

  const updateClientStatus = async (clientId: string, status: 'completed' | 'pending' | 'in-progress') => {
    try {
      // Vérifier si le client existe dans les données locales
      const client = firebase.data.find(c => c.id === clientId);
      if (!client) {
        throw new Error(`Client ${clientId} non trouvé dans les données locales`);
      }

      console.log('Client trouvé:', client);
      console.log('Tentative de mise à jour du statut:', { clientId, status, currentStatus: client.status });

      await firebase.update(clientId, {
        status,
        updatedAt: new Date()
      });

    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du statut:', {
        error: error.message,
        code: error.code,
        details: error.details,
        clientId,
        status
      });
      throw error;
    }
  };

  const addClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const clientWithTimestamps = {
      ...clientData,
      createdAt: now,
      updatedAt: now
    };
    return firebase.add(clientWithTimestamps);
  };


const getClientProducts = (productIds: string[], allProducts: Product[]): Product[] => {
  return allProducts.filter(product => productIds.includes(product.id));
};
  

  return {
    ...firebase,
    add: addClient,
    updateStatus: updateClientStatus
  };
}