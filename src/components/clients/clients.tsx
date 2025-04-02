import React, { useState } from 'react';
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
  Filter, // Add this import
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NewClientModal } from './components/new-client-modal';
import { Toast } from '../ui/toast';
import { useClients } from '../../lib/hooks/useClients';
import { Calendar } from 'lucide-react';

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

// Sous-fonction de formatage
const formatDate = (date: Date) => {
  return `Client depuis le ${date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })}`;
};


type ViewMode = 'grid' | 'list';

// D'abord, ajoutons un état pour gérer le statut
export function Clients() {
  const navigate = useNavigate();
  const { data: clients = [], loading, add: addClient, updateStatus } = useClients();
  
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false); // Ajout de l'état pour le menu filtre

  // Modifier la logique de filtrage pour inclure le filtre de statut
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.contact.phone.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || client.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleSaveClient = async (clientData: any) => {
    try {
      await addClient({
        ...clientData,
        status: 'in-progress', // Ajout du statut par défaut
        createdAt: new Date(),
        updatedAt: new Date()
      });
      setShowSuccessToast(true);
      setIsNewClientModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la création du client:', error);
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
                    onClick={() => {
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
          {filteredClients.map((client) => (
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
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm ml-1 text-muted-foreground">4.8</span>
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
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Client</th>
                {/* <th className="text-left p-4 font-medium text-muted-foreground">Contact</th> */}
                <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">Email</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Téléphone</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden xl:table-cell">Adresse</th>
                <th className="text-center p-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client, index) => (
                <motion.tr
                  key={`${client.id}-${client.status}`}  // Modification de la clé
                  variants={itemVariants}
                  onClick={() => navigate(`/clients/${client.id}`)}
                  className="border-b border-border/50 last:border-0 hover:bg-accent/50 transition-colors cursor-pointer group z-10"
                >
                  <td className="p-4">
                    <div className="relative group">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm"
                      >
                        <div className="flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${
                            client.status === 'completed' ? 'bg-green-500' :
                            client.status === 'pending' ? 'bg-orange-500' :
                            'bg-blue-500'
                          }`}></span>
                          <span className="text-sm">{
                            client.status === 'completed' ? 'Terminé' :
                            client.status === 'pending' ? 'En attente' :
                            'En cours'
                          }</span>
                        </div>
                      </button>
                      {/* Menu déroulant du statut */}
                      <div className={`absolute right w-48 bg-card rounded-lg shadow-lg border border-border/50 invisible group-hover:visible z-50 ${
                        index === 0 ? 'top-full mt-2' : 'bottom-full mb-2'
                      }`}>
                        <div className="py-1">
                          <button 
                            className="flex items-center w-full px-4 py-2 text-sm hover:bg-accent"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              updateStatus(client.id, 'completed');
                            }}
                          >
                            <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                            Terminé
                          </button>
                          <button 
                            className="flex items-center w-full px-4 py-2 text-sm hover:bg-accent"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              updateStatus(client.id, 'pending');
                            }}
                          >
                            <span className="w-2 h-2 rounded-full bg-orange-500 mr-2"></span>
                            En attente
                          </button>
                          <button 
                            className="flex items-center w-full px-4 py-2 text-sm hover:bg-accent"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              updateStatus(client.id, 'in-progress');
                            }}
                          >
                            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                            En cours
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
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
                  {/* <td className="p-4">{client.contact.firstName} {client.contact.lastName}</td> */}
                  <td className="p-4 hidden lg:table-cell">{client.contact.email}</td>
                  <td className="p-4 hidden md:table-cell">{client.contact.phone}</td>
                  <td className="p-4 hidden xl:table-cell">{client.address.street}, {client.address.postalCode} {client.address.city}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center">
                      <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

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
    </motion.div>
  );
}
