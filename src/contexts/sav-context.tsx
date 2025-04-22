import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  onSnapshot, 
  orderBy,
  getDocs, // Add this import
  DocumentData // Add this for typing
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// Types
export interface Ticket {
  id?: string;
  number: string;
  client: {
    name: string;
    address: string;
  };
  product: {
    name: string;
    reference: string;
  };
  issueType: string;
  description: string;
  status: 'nouveau' | 'en_cours' | 'resolu' | 'annule';
  priority: 'haute' | 'moyenne' | 'basse';
  createdAt: string;
  team?: {
    id: string;
    name: string;
    color?: string;
  };
  installationDate: string;
  lastUpdate?: string;
}

export interface Installation {
  id?: string;
  client: {
    name: string;
    address: string;
  };
  product: {
    name: string;
    reference: string;
  };
  installationDate: string;
  team: {
    name: string;
    id: string;
  };
}

export interface DashboardData {
  totalSAV: number;
  statusBreakdown: {
    nouveau: number;
    en_cours: number;
    resolu: number;
    annule: number;
  };
  teamStats: {
    name: string;
    savCount: number;
  }[];
  monthlyGrowth: {
    month: string;
    count: number;
  }[];
  productStats: {
    name: string;
    count: number;
  }[];
}

interface SAVContextType {
  tickets: Ticket[];
  installations: Installation[];
  dashboardData: DashboardData;
  loading: boolean;
  installationsLoading: boolean; // Ajout d'un état de chargement spécifique
  error: string | null;
  addTicket: (ticket: Omit<Ticket, 'id'>) => Promise<void>;
  updateTicket: (id: string, data: Partial<Ticket>) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
  fetchInstallations: () => Promise<void>; // Ajout de cette fonction
}

const SAVContext = createContext<SAVContextType | undefined>(undefined);

export const useSAV = () => {
  const context = useContext(SAVContext);
  if (context === undefined) {
    throw new Error('useSAV must be used within a SAVProvider');
  }
  return context;
};

interface SAVProviderProps {
  children: ReactNode;
}

export function SAVProvider({ children }: SAVProviderProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalSAV: 0,
    statusBreakdown: { nouveau: 0, en_cours: 0, resolu: 0, annule: 0 },
    teamStats: [],
    monthlyGrowth: [],
    productStats: []
  });
  const [loading, setLoading] = useState(true);
  const [installationsLoading, setInstallationsLoading] = useState(false); // Nouvel état
  const [error, setError] = useState<string | null>(null);

  // Charger les tickets depuis Firestore
  useEffect(() => {
    setLoading(true);
    
    try {
      const ticketsQuery = query(
        collection(db, 'tickets'),
        orderBy('createdAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(ticketsQuery, (snapshot) => {
        const ticketsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Ticket[];
        
        setTickets(ticketsData);
        updateDashboardData(ticketsData);
        setLoading(false);
      }, (err) => {
        console.error('Error fetching tickets:', err);
        setError('Erreur lors du chargement des tickets');
        setLoading(false);
      });
      
      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up tickets listener:', err);
      setError('Erreur lors de la configuration du listener de tickets');
      setLoading(false);
    }
  }, []);

  // Charger les installations depuis Firestore
  useEffect(() => {
    try {
      const installationsQuery = query(
        collection(db, 'installations'),
        orderBy('installationDate', 'desc')
      );
      
      const unsubscribe = onSnapshot(installationsQuery, (snapshot) => {
        const installationsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Installation[];
        
        setInstallations(installationsData);
      }, (err) => {
        console.error('Error fetching installations:', err);
      });
      
      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up installations listener:', err);
    }
  }, []);

  // Mettre à jour les données du tableau de bord
  const updateDashboardData = (ticketsData: Ticket[]) => {
    // Calculer le total des tickets
    const totalSAV = ticketsData.length;
    
    // Calculer la répartition par statut
    const statusBreakdown = {
      nouveau: 0,
      en_cours: 0,
      resolu: 0,
      annule: 0
    };
    
    ticketsData.forEach(ticket => {
      statusBreakdown[ticket.status]++;
    });
    
    // Calculer les statistiques par équipe
    const teamMap = new Map<string, number>();
    ticketsData.forEach(ticket => {
      if (ticket.team?.name) {
        const count = teamMap.get(ticket.team.name) || 0;
        teamMap.set(ticket.team.name, count + 1);
      }
    });
    
    const teamStats = Array.from(teamMap.entries()).map(([name, savCount]) => ({
      name,
      savCount
    })).sort((a, b) => b.savCount - a.savCount);
    
    // Calculer les statistiques par produit
    const productMap = new Map<string, number>();
    ticketsData.forEach(ticket => {
      const productName = ticket.product.name;
      const count = productMap.get(productName) || 0;
      productMap.set(productName, count + 1);
    });
    
    const productStats = Array.from(productMap.entries()).map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => b.count - a.count);
    
    // Calculer l'évolution mensuelle
    const monthlyMap = new Map<string, number>();
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    ticketsData.forEach(ticket => {
      const date = new Date(ticket.createdAt);
      const monthKey = months[date.getMonth()];
      const count = monthlyMap.get(monthKey) || 0;
      monthlyMap.set(monthKey, count + 1);
    });
    
    // Obtenir les 6 derniers mois
    const currentMonth = new Date().getMonth();
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const monthIndex = (currentMonth - i + 12) % 12;
      return months[monthIndex];
    }).reverse();
    
    const monthlyGrowth = last6Months.map(month => ({
      month,
      count: monthlyMap.get(month) || 0
    }));
    
    setDashboardData({
      totalSAV,
      statusBreakdown,
      teamStats,
      productStats,
      monthlyGrowth
    });
  };

  // Ajouter un nouveau ticket
  const addTicket = async (ticket: Omit<Ticket, 'id'>) => {
    try {
      await addDoc(collection(db, 'tickets'), {
        ...ticket,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error adding ticket:', err);
      setError('Erreur lors de l\'ajout du ticket');
      throw err;
    }
  };

  // Mettre à jour un ticket
  const updateTicket = async (id: string, data: Partial<Ticket>) => {
    try {
      const ticketRef = doc(db, 'tickets', id);
      await updateDoc(ticketRef, {
        ...data,
        lastUpdate: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error updating ticket:', err);
      setError('Erreur lors de la mise à jour du ticket');
      throw err;
    }
  };

  // Supprimer un ticket
  const deleteTicket = async (id: string) => {
    try {
      const ticketRef = doc(db, 'tickets', id);
      await deleteDoc(ticketRef);
    } catch (err) {
      console.error('Error deleting ticket:', err);
      setError('Erreur lors de la suppression du ticket');
      throw err;
    }
  };

  // Fonction pour récupérer les installations depuis Firestore
  const fetchInstallations = async () => {
    // Skip if we already have installations and they're not being refreshed
    if (installations.length > 0 && !installationsLoading) {
      console.log("Installations déjà chargées, utilisation du cache");
      return;
    }
    
    try {
      setInstallationsLoading(true);
      
      // Récupérer les clients
      const clientsSnapshot = await getDocs(collection(db, 'clients'));
      const clients = clientsSnapshot.docs.map((doc: DocumentData) => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log("Clients récupérés:", clients.length);
      
      // Récupérer tous les produits
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const products = productsSnapshot.docs.map((doc: DocumentData) => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log("Produits récupérés:", products.length);
      
      // Récupérer les installations
      let installationsData: Installation[] = [];
      
      // Dans la fonction fetchInstallations
      
      // Pour chaque client, créer au moins une installation
      for (const client of clients) {
      // Si le client a des produits associés
      if (client.productsIds && Array.isArray(client.productsIds) && client.productsIds.length > 0) {
      // Trouver les produits correspondants
      for (const productId of client.productsIds) {
      const product = products.find(p => p.id === productId);
      
      if (product) {
      // Créer une installation avec le produit trouvé
      installationsData.push({
        id: `${client.id}-${product.id}`,
        client: {
          name: client.name || `${client.contact?.firstName || ''} ${client.contact?.lastName || ''}`.trim(),
          address: client.address ? 
            `${client.address.street}, ${client.address.postalCode} ${client.address.city}` : 
            'Adresse non spécifiée'
        },
        product: {
          name: product.name || 'Produit sans nom',
          reference: product.reference || product.id || 'Réf. inconnue'
        },
        installationDate: client.updatedAt || client.createdAt || new Date().toISOString(),
        team: {
          name: client.team?.name || 'Équipe non spécifiée',
          id: client.team?.id || '0'
        }
      });
      }
      }
      } else {
      // Si le client n'a pas de produits associés, créer une installation avec un produit générique
      installationsData.push({
        id: `${client.id}-default`,
        client: {
          name: client.name || `${client.contact?.firstName || ''} ${client.contact?.lastName || ''}`.trim(),
          address: client.address ? 
            `${client.address.street}, ${client.address.postalCode} ${client.address.city}` : 
            'Adresse non spécifiée'
        },
        product: {
          name: 'Produit non spécifié',
          reference: 'Réf. non spécifiée'
        },
        installationDate: client.updatedAt || client.createdAt || new Date().toISOString(),
        team: {
          name: client.team?.name || 'Équipe non spécifiée',
          id: client.team?.id || '0'
        }
      });
      }
      }
      
      // Si aucune installation n'est trouvée, ajouter des données de test
      if (installationsData.length === 0) {
        console.log("Aucune installation trouvée, ajout de données de test");
        installationsData = [
          // Les données de test existantes restent inchangées
        ];
      }
      
      console.log("Installations récupérées:", installationsData.length);
      setInstallations(installationsData);
    } catch (err) {
      console.error('Erreur lors du chargement des installations:', err);
      setError('Erreur lors du chargement des installations');
      throw err;
    } finally {
      setInstallationsLoading(false);
    }
  };

  // Ajouter fetchInstallations à useEffect pour charger les installations au démarrage
  useEffect(() => {
    fetchInstallations();
  }, []);

  const value = {
    tickets,
    installations,
    dashboardData,
    loading,
    installationsLoading, // Exposer le nouvel état
    error,
    addTicket,
    updateTicket,
    deleteTicket,
    fetchInstallations
  };

  return <SAVContext.Provider value={value}>{children}</SAVContext.Provider>;
}
