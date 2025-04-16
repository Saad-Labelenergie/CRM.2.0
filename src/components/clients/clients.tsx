import React, { useState } from 'react';
import { ChangeStatusModal } from './components/change-status-modal';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  LayoutGrid,
  List,
  Star,
  Users,
  ChevronRight,
  Building2,
  Filter,
  Calendar,
  Clock,
  BarChart3,
  Power,
  TrendingDown,
  TrendingUp,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NewClientModal } from './components/new-client-modal';
import { Toast } from '../ui/toast';
import { useClients } from '../../lib/hooks/useClients';
import {collection,addDoc,serverTimestamp,query,orderBy,onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface HistoryEntry {
  id?: string;
  action: string;
  user: string;
  userId: string;
  clientName: string;
  clientId: string;
  details: string;
  previousValue?: string;
  newValue?: string;
  timestamp: Date;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

const formatClientSinceDate = (dateInput: any) => {
  if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
    return formatDate(dateInput);
  }
  const date = new Date(dateInput);
  if (!isNaN(date.getTime())) {
    return formatDate(date);
  }
  if (dateInput?.seconds) {
    const firestoreDate = new Date(dateInput.seconds * 1000);
    return formatDate(firestoreDate);
  }
  return "Date inconnue";
};

const formatDate = (date: Date) => {
  return `Client depuis le ${date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })}`;
};

type ViewMode = 'grid' | 'list';
type ClientStatus = 'completed' | 'pending' | 'in-progress';

export function Clients() {
  const navigate = useNavigate();
  const { data: clients = [], loading, add: addClient, updateStatus } = useClients();
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [currentClientsPage, setCurrentClientsPage] = useState(1);
  const [clientsPerPage, setClientsPerPage] = useState(10);
  const [expandedHistory, setExpandedHistory] = useState(false);

  // Pagination for clients
  const clientsIndexOfLastItem = currentClientsPage * clientsPerPage;
  const clientsIndexOfFirstItem = clientsIndexOfLastItem - clientsPerPage;
  const currentClients = clients.slice(clientsIndexOfFirstItem, clientsIndexOfLastItem);
  const clientsTotalPages = Math.ceil(clients.length / clientsPerPage);

  // Pagination for history
  const historyIndexOfLastItem = currentPage * itemsPerPage;
  const historyIndexOfFirstItem = historyIndexOfLastItem - itemsPerPage;
  const currentHistoryItems = history.slice(historyIndexOfFirstItem, historyIndexOfLastItem);
  const historyTotalPages = Math.ceil(history.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const paginateClients = (pageNumber: number) => setCurrentClientsPage(pageNumber);

  const [statusChangeModal, setStatusChangeModal] = useState<{
    isOpen: boolean;
    clientId: string;
    clientName: string;
    newStatus: ClientStatus;
  }>({
    isOpen: false,
    clientId: '',
    clientName: '',
    newStatus: 'in-progress'
  });

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.contact.phone.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  React.useEffect(() => {
    const q = query(
      collection(db, 'historique_dossier'),
      orderBy('timestamp', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const entries: HistoryEntry[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        entries.push({
          id: doc.id,
          action: data.action,
          user: data.user,
          userId: data.userId,
          clientName: data.clientName,
          clientId: data.clientId,
          details: data.details,
          previousValue: data.previousValue,
          newValue: data.newValue,
          timestamp: data.timestamp.toDate()
        });
      });
      setHistory(entries);
    });

    return () => unsubscribe();
  }, []);

  const addHistoryEntry = async (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
    try {
      await addDoc(collection(db, 'historique_dossier'), {
        ...entry,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout à l'historique:", error);
    }
  };

  const dashboardData = {
    totalClients: 0,
    activeClients: 0,
    inactiveClients: 0,
    monthlyGrowth: [
      { month: 'Jan', count: 0 },
      { month: 'Fév', count: 0 },
      { month: 'Mar', count: 0 }
    ]
  };

  const renderDashboard = () => {
    const lastMonth = dashboardData.monthlyGrowth[dashboardData.monthlyGrowth.length - 1];
    const previousMonth = dashboardData.monthlyGrowth[dashboardData.monthlyGrowth.length - 2];
    const growthPercentage = previousMonth.count === 0 ? 0 : 
      ((lastMonth.count - previousMonth.count) / previousMonth.count * 100).toFixed(1);

    const completedClients = clients.filter(c => c.status === 'completed').length;
    const pendingClients = clients.filter(c => c.status === 'pending').length;
    const inProgressClients = clients.filter(c => c.status === 'in-progress').length;
    const totalClients = clients.length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          variants={itemVariants}
          className="bg-card rounded-xl p-6 shadow-lg border border-border/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Total des clients</div>
              <div className="text-3xl font-bold mt-2">{totalClients}</div>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            {Number(growthPercentage) > 0 ? (
              <>
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500">+{growthPercentage}%</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                <span className="text-red-500">{growthPercentage}%</span>
              </>
            )}
            <span className="text-muted-foreground ml-1">vs mois dernier</span>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-card rounded-xl p-6 shadow-lg border border-border/50"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium text-muted-foreground">Statut des clients</div>
            <Power className="w-5 h-5 text-orange-500" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                <span className="text-sm">Terminés</span>
              </div>
              <span className="font-medium">{completedClients}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                <span className="text-sm">En cours</span>
              </div>
              <span className="font-medium">{inProgressClients}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-orange-500 mr-2" />
                <span className="text-sm">En attente</span>
              </div>
              <span className="font-medium">{pendingClients}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-card rounded-xl p-6 shadow-lg border border-border/50"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium text-muted-foreground">Évolution mensuelle</div>
            <BarChart3 className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex items-end justify-between h-12">
            {dashboardData.monthlyGrowth.map((data, index) => (
              <div key={data.month} className="flex flex-col items-center">
                <div 
                  className="w-8 bg-primary/10 rounded-t-lg"
                  style={{
                    height: `${totalClients > 0 ? (data.count / totalClients) * 100 : 0}%`,
                    opacity: index === dashboardData.monthlyGrowth.length - 1 ? 1 : 0.5
                  }}
                />
                <div className="mt-2 text-xs text-muted-foreground">{data.month}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  };

  const handleSaveClient = async (clientData: any) => {
    try {
      const clientId = await addClient({
        ...clientData,
        status: 'in-progress', 
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await addHistoryEntry({
        action: 'created',
        user: currentUser.name,
        userId: currentUser.id,
        clientName: clientData.name,
        clientId: clientId,
        details: 'Nouveau client ajouté'
      });
      
      setShowSuccessToast(true);
      setIsNewClientModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la création du client:', error);
    }
  };

  const handleStatusUpdate = async (clientId: string, newStatus: ClientStatus, clientName: string, currentStatus: string) => {
    try {
      await updateStatus(clientId, newStatus);
      
      await addHistoryEntry({
        action: 'status_changed',
        user: currentUser.name,
        userId: currentUser.id,
        clientName: clientName,
        clientId: clientId,
        details: 'Modification de statut',
        previousValue: currentStatus,
        newValue: newStatus
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <Building2 className="w-12 h-12 mx-auto text-muted-foreground animate-pulse" />
          <h2 className="text-xl font-semibold mt-4">Chargement des clients...</h2>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Gestion des Clients</h1>
          <p className="text-muted-foreground mt-1">Gérez votre portefeuille clients</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsNewClientModalOpen(true)}
          className="flex items-center px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Client
        </motion.button>
      </div>
      {renderDashboard()}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
          />
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                setIsFilterMenuOpen(!isFilterMenuOpen);
              }}
              className={`p-2 rounded-lg transition-colors hover:bg-accent ${
                statusFilter ? 'text-primary' : ''
              }`}
            >
              <Filter className="w-5 h-5" />
            </motion.button>
            {isFilterMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-card rounded-lg shadow-lg border border-border/50 z-50">
                <div className="py-1">
                  <button 
                    className="flex items-center w-full px-4 py-2 text-sm hover:bg-accent"
                    onClick={() => {
                      setStatusFilter('completed');
                      setIsFilterMenuOpen(false);
                    }}
                  >
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                    Terminé
                  </button>
                  <button 
                    className="flex items-center w-full px-4 py-2 text-sm hover:bg-accent"
                    onClick={() => {
                      setStatusFilter('pending');
                      setIsFilterMenuOpen(false);
                    }}
                  >
                    <span className="w-2 h-2 rounded-full bg-orange-500 mr-2"></span>
                    En attente
                  </button>
                  <button 
                    className="flex items-center w-full px-4 py-2 text-sm hover:bg-accent"
                    onClick={() => {
                      setStatusFilter('in-progress');
                      setIsFilterMenuOpen(false);
                    }}
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                    En cours
                  </button>
                  <button 
                    className="flex items-center w-full px-4 py-2 text-sm hover:bg-accent"
                    onClick={(e) => {
                      setStatusFilter(null);
                      setIsFilterMenuOpen(false);
                    }}
                  >
                    Tous les statuts
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center bg-card rounded-xl border border-border/50 p-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-accent'
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-accent'
              }`}
            >
              <List className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border/50">
          <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Aucun client</h3>
          <p className="text-muted-foreground">
            Commencez par ajouter un nouveau client en cliquant sur le bouton "Nouveau Client"
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {filteredClients.slice(clientsIndexOfFirstItem, clientsIndexOfLastItem).map((client) => (
            <motion.div
              key={`${client.id}-${client.updatedAt?.getTime() || Date.now()}`}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              onClick={() => navigate(`/clients/${client.id}`)}
              className="bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{client.name}</h3>
                    <div className="flex items-center mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        client.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : client.status === 'pending'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {client.status === 'completed' ? 'Terminé' : 
                         client.status === 'pending' ? 'En attente' : 'En cours'}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{client.contact.firstName} {client.contact.lastName}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{formatClientSinceDate(client.createdAt)}</span>
                  </div>
                </div>
                {client.tag && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="flex items-center">
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm">
                        {client.tag}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          className="bg-card rounded-xl shadow-lg border border-border/50 overflow-hidden"
        >
<div className="rounded-lg border border-border/50 bg-card overflow-hidden">
  <div className="relative overflow-x-auto">
    <table className="w-full">
      <thead className="bg-muted/50">
        <tr className="border-b border-border/50">
          <th className="text-left p-4 font-medium text-muted-foreground">Statut</th>
          <th className="text-left p-4 font-medium text-muted-foreground">Client</th>
          <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">Email</th>
          <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Téléphone</th>
          <th className="text-left p-4 font-medium text-muted-foreground hidden xl:table-cell">Adresse</th>
          <th className="text-center p-4 font-medium text-muted-foreground">Actions</th>
        </tr>
      </thead>
      <tbody>
        {filteredClients.slice(clientsIndexOfFirstItem, clientsIndexOfLastItem).map((client, index) => (
          <motion.tr
            key={`${client.id}-${client.status}`}
            variants={itemVariants}
            onClick={() => navigate(`/clients/${client.id}`)}
            className="border-b border-border/50 last:border-0 hover:bg-accent/50 transition-colors cursor-pointer group"
          >
            {/* Cellule Statut avec menu déroulant */}
            <td className="p-4">
              <div className="relative group">
                <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm cursor-default">
                  <span className={`w-2 h-2 rounded-full ${
                    client.status === 'completed' ? 'bg-green-500' :
                    client.status === 'pending' ? 'bg-orange-500' :
                    'bg-blue-500'
                  }`}></span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    client.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : client.status === 'pending'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {client.status === 'completed' ? 'Terminé' : 
                    client.status === 'pending' ? 'En attente' : 'En cours'}
                  </span>
                </div>

                {/* Menu déroulant du statut */}
                <div className={`absolute right-0 w-48 bg-card rounded-lg shadow-lg border border-border/50 invisible group-hover:visible z-50 ${
                  index === filteredClients.length - 1 ? 'bottom-full mb-2' : 'top-full mt-2'
                }`}>
                  <ul className="py-1">
                    <li>
                      <button
                        className="flex items-center px-4 py-2 text-sm hover:bg-accent w-full text-left"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setStatusChangeModal({
                            isOpen: true,
                            clientId: client.id,
                            clientName: client.name,
                            newStatus: 'completed'
                          });
                        }}
                      >
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                        <span>Terminé</span>
                      </button>
                    </li>
                    <li>
                      <button
                        className="flex items-center px-4 py-2 text-sm hover:bg-accent w-full text-left"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setStatusChangeModal({
                            isOpen: true,
                            clientId: client.id,
                            clientName: client.name,
                            newStatus: 'pending'
                          });
                        }}
                      >
                        <span className="w-2 h-2 rounded-full bg-orange-500 mr-2"></span>
                        <span>En attente</span>
                      </button>
                    </li>
                    <li>
                      <button
                        className="flex items-center px-4 py-2 text-sm hover:bg-accent w-full text-left"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setStatusChangeModal({
                            isOpen: true,
                            clientId: client.id,
                            clientName: client.name,
                            newStatus: 'in-progress'
                          });
                        }}
                      >
                        <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                        <span>En cours</span>
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </td>

            {/* Cellule Client */}
            <td className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">{client.name}</div>
                  {client.tag && (
                    <div className="text-sm text-primary font-medium mt-1">{client.tag}</div>
                  )}
                </div>
              </div>
            </td>

            {/* Cellule Email */}
            <td className="p-4 hidden lg:table-cell">
              <a 
                href={`mailto:${client.contact.email}`} 
                className="hover:text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {client.contact.email}
              </a>
            </td>

            {/* Cellule Téléphone */}
            <td className="p-4 hidden md:table-cell">
              <a 
                href={`tel:${client.contact.phone}`}
                className="hover:text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {client.contact.phone}
              </a>
            </td>

            {/* Cellule Adresse */}
            <td className="p-4 hidden xl:table-cell">
              <div className="line-clamp-1">
                {client.address.street}, {client.address.postalCode} {client.address.city}
              </div>
            </td>

            {/* Cellule Actions */}
            <td className="p-4">
              <div className="flex items-center justify-center">
                <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </td>
          </motion.tr>
        ))}
      </tbody>
    </table>

    {/* Pagination */}
    {filteredClients.length > 0 && (
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-border/50 gap-4">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            Affichage de {clientsIndexOfFirstItem + 1} à {Math.min(clientsIndexOfLastItem, filteredClients.length)} sur {filteredClients.length} clients
          </div>
          <div className="flex items-center space-x-2">
            <label htmlFor="clientsPerPage" className="text-sm text-muted-foreground">
              Lignes par page:
            </label>
            <select
              id="clientsPerPage"
              value={clientsPerPage}
              onChange={(e) => {
                setClientsPerPage(Number(e.target.value));
                setCurrentClientsPage(1);
              }}
              className="bg-card border border-border/50 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              {[5, 10, 15, 20].map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => paginateClients(Math.max(1, currentClientsPage - 1))}
            disabled={currentClientsPage === 1}
            className={`px-3 py-1 rounded-lg transition-colors ${
              currentClientsPage === 1
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-accent hover:bg-accent/80'
            }`}
          >
            Précédent
          </button>
          
          {Array.from({ length: Math.min(5, clientsTotalPages) }, (_, i) => {
            let pageNumber;
            if (clientsTotalPages <= 5) {
              pageNumber = i + 1;
            } else if (currentClientsPage <= 3) {
              pageNumber = i + 1;
            } else if (currentClientsPage >= clientsTotalPages - 2) {
              pageNumber = clientsTotalPages - 4 + i;
            } else {
              pageNumber = currentClientsPage - 2 + i;
            }
            
            return (
              <button
                key={pageNumber}
                onClick={() => paginateClients(pageNumber)}
                className={`px-3 py-1 rounded-lg transition-colors min-w-[2.5rem] ${
                  currentClientsPage === pageNumber
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-accent hover:bg-accent/80'
                }`}
              >
                {pageNumber}
              </button>
            );
          })}
          
          <button
            onClick={() => paginateClients(Math.min(clientsTotalPages, currentClientsPage + 1))}
            disabled={currentClientsPage === clientsTotalPages}
            className={`px-3 py-1 rounded-lg transition-colors ${
              currentClientsPage === clientsTotalPages
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-accent hover:bg-accent/80'
            }`}
          >
            Suivant
          </button>
        </div>
      </div>
    )}
  </div>
</div>
        </motion.div>
      )}



      {/* Historique section with accordion */}
      <div className="mt-12">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setExpandedHistory(!expandedHistory)}
          className="flex items-center justify-between w-full p-4 bg-card rounded-xl shadow-lg border border-border/50 mb-4"
        >
          <h2 className="text-xl font-bold flex items-center">
            <Clock className="w-5 h-5 mr-2 text-primary" />
            Historique des modifications
          </h2>
          {expandedHistory ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </motion.button>

        {expandedHistory && (
          <div className="bg-card rounded-xl shadow-lg border border-border/50 overflow-hidden">
            <div className="relative h-[600px] overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 z-10 bg-card">
                  <tr className="border-b border-border/50">
                    <th className="text-left p-4 font-medium text-muted-foreground">Action</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Utilisateur</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Client</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Détails</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {currentHistoryItems.map((entry) => (
                    <motion.tr
                      key={entry.id}
                      variants={itemVariants}
                      className="border-b border-border/50 last:border-0 hover:bg-accent/50 transition-colors"
                    >
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          entry.action === 'created' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {entry.action === 'created' ? 'Création' : 'Modification'}
                        </span>
                      </td>
                      <td className="p-4 font-medium">{entry.user}</td>
                      <td className="p-4">{entry.clientName}</td>
                      <td className="p-4">
                        {entry.details}
                        {entry.previousValue && entry.newValue && (
                          <div className="text-xs text-muted-foreground mt-1">
                            De <span className="font-medium">{entry.previousValue}</span> à <span className="font-medium">{entry.newValue}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        {entry.timestamp.toLocaleString('fr-FR', {
                          day: 'numeric',
                          month: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination for history */}
            {history.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-border/50 gap-4">
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-muted-foreground">
                    Affichage de {historyIndexOfFirstItem + 1} à {Math.min(historyIndexOfLastItem, history.length)} sur {history.length} entrées
                  </div>
                  <div className="flex items-center space-x-2">
                    <label htmlFor="itemsPerPage" className="text-sm text-muted-foreground">
                      Lignes par page:
                    </label>
                    <select
                      id="itemsPerPage"
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="bg-card border border-border/50 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="15">15</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-lg ${
                      currentPage === 1
                        ? 'bg-muted text-muted-foreground cursor-not-allowed'
                        : 'bg-accent hover:bg-accent/80'
                    }`}
                  >
                    Précédent
                  </button>
                  
                  {Array.from({ length: Math.min(5, historyTotalPages) }, (_, i) => {
                    let pageNumber;
                    if (historyTotalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= historyTotalPages - 2) {
                      pageNumber = historyTotalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => paginate(pageNumber)}
                        className={`px-3 py-1 rounded-lg ${
                          currentPage === pageNumber
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-accent hover:bg-accent/80'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => paginate(Math.min(historyTotalPages, currentPage + 1))}
                    disabled={currentPage === historyTotalPages}
                    className={`px-3 py-1 rounded-lg ${
                      currentPage === historyTotalPages
                        ? 'bg-muted text-muted-foreground cursor-not-allowed'
                        : 'bg-accent hover:bg-accent/80'
                    }`}
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <NewClientModal
        isOpen={isNewClientModalOpen}
        onClose={() => setIsNewClientModalOpen(false)}
        onSave={handleSaveClient}
      />
      <Toast
        message="Le client a été créé avec succès !"
        isVisible={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
      />
      <ChangeStatusModal
        isOpen={statusChangeModal.isOpen}
        onClose={() => setStatusChangeModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={async (status) => {
          const currentClient = clients.find(c => c.id === statusChangeModal.clientId);
          if (currentClient) {
            await handleStatusUpdate(
              statusChangeModal.clientId, 
              status, 
              statusChangeModal.clientName,
              currentClient.status || 'pending'  
            );
          }
          setStatusChangeModal(prev => ({ ...prev, isOpen: false }));
        }}
  clientName={statusChangeModal.clientName}
  newStatus={statusChangeModal.newStatus}
/>
    </motion.div>
  );}
