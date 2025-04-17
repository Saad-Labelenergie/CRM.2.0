import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  AlertCircle, 
  Timer, 
  CheckCircle, 
  XCircle,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Loader2,
  Search,
  LayoutGrid,
  List,
  Eye,
  Users,  
  ArrowUpRight  
} from 'lucide-react';
import { NewTicketModal } from './components/new-ticket-modal';
import { useSAV } from '../../contexts/sav-context';
import { format } from 'date-fns';

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

const tabs = [
  { id: 'all', label: 'Tous', icon: null },
  { id: 'nouveau', label: 'Nouveau', icon: AlertCircle },
  { id: 'en_cours', label: 'En cours', icon: Timer },
  { id: 'resolu', label: 'Résolu', icon: CheckCircle },
  { id: 'annule', label: 'Annulé', icon: XCircle }
];

export function SAV() {
  const { tickets, dashboardData, loading, error, addTicket } = useSAV();
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleSaveTicket = async (ticketData: any) => {
    try {
      await addTicket(ticketData);
      setIsNewTicketModalOpen(false);
    } catch (err) {
      console.error('Error saving ticket:', err);
      // Gérer l'erreur (afficher un message, etc.)
    }
  };

  // Calcul de la croissance si les données sont disponibles
  let growthPercentage = "0.0";
  if (dashboardData.monthlyGrowth.length >= 2) {
    const currentMonth = dashboardData.monthlyGrowth[dashboardData.monthlyGrowth.length - 1];
    const previousMonth = dashboardData.monthlyGrowth[dashboardData.monthlyGrowth.length - 2];
    if (previousMonth.count > 0) {
      growthPercentage = ((currentMonth.count - previousMonth.count) / previousMonth.count * 100).toFixed(1);
    }
  }

  // Trouver l'équipe avec le plus de SAV
  const topTeam = dashboardData.teamStats.length > 0 ? dashboardData.teamStats[0] : { name: 'Aucune équipe', savCount: 0 };

  // Trouver le produit avec le plus de SAV
  const topProduct = dashboardData.productStats.length > 0 ? dashboardData.productStats[0] : { name: 'Aucun produit', count: 0 };

  // Filtrer les tickets en fonction de la recherche et du statut
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = activeTab === 'all' || ticket.status === activeTab;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTickets = filteredTickets.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);

  const handleViewTicket = (ticket: any) => {
    setSelectedTicket(ticket);
    setIsDetailModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ml-2 text-lg">Chargement des données...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 p-6 rounded-xl text-destructive flex items-center">
        <AlertCircle className="w-6 h-6 mr-2" />
        <div>
          <h3 className="font-semibold">Erreur de chargement</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div 
          variants={itemVariants}
          className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-muted-foreground">Total SAV</p>
              <h3 className="text-3xl font-bold mt-1">{dashboardData.totalSAV}</h3>
            </div>
            <div className="bg-primary/10 p-3 rounded-full">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {parseFloat(growthPercentage) > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={parseFloat(growthPercentage) > 0 ? "text-green-500" : "text-red-500"}>
              {growthPercentage}% ce mois
            </span>
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-muted-foreground">Nouveaux</p>
              <h3 className="text-3xl font-bold mt-1">{dashboardData.statusBreakdown.nouveau}</h3>
            </div>
            <div className="bg-yellow-500/10 p-3 rounded-full">
              <AlertCircle className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-muted-foreground">
              {((dashboardData.statusBreakdown.nouveau / dashboardData.totalSAV) * 100).toFixed(1)}% du total
            </span>
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-muted-foreground">En cours</p>
              <h3 className="text-3xl font-bold mt-1">{dashboardData.statusBreakdown.en_cours}</h3>
            </div>
            <div className="bg-blue-500/10 p-3 rounded-full">
              <Timer className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-muted-foreground">
              {((dashboardData.statusBreakdown.en_cours / dashboardData.totalSAV) * 100).toFixed(1)}% du total
            </span>
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-muted-foreground">Résolus</p>
              <h3 className="text-3xl font-bold mt-1">{dashboardData.statusBreakdown.resolu}</h3>
            </div>
            <div className="bg-green-500/10 p-3 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-muted-foreground">
              {((dashboardData.statusBreakdown.resolu / dashboardData.totalSAV) * 100).toFixed(1)}% du total
            </span>
          </div>
        </motion.div>
      </div>

      {/* Statistiques supplémentaires */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          variants={itemVariants}
          className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
        >
          <h3 className="text-xl font-semibold mb-4">Équipe la plus active</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-primary/10 p-3 rounded-full mr-3">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{topTeam.name}</p>
                <p className="text-sm text-muted-foreground">Équipe technique</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{topTeam.savCount}</p>
              <p className="text-sm text-muted-foreground">tickets traités</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
        >
          <h3 className="text-xl font-semibold mb-4">Produit le plus concerné</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-primary/10 p-3 rounded-full mr-3">
                <AlertCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{topProduct.name}</p>
                <p className="text-sm text-muted-foreground">Produit</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{topProduct.count}</p>
              <p className="text-sm text-muted-foreground">incidents</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Liste des tickets */}
      <div className="bg-card rounded-xl shadow-lg border border-border/50 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold">Tickets SAV</h2>
          <button
            onClick={() => setIsNewTicketModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Nouveau ticket</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex space-x-2 overflow-x-auto pb-2 sm:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-lg whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {tab.icon && <tab.icon className="w-4 h-4 mr-2" />}
                <span>{tab.label}</span>
                {tab.id !== 'all' && (
                  <span className="ml-2 bg-background/20 px-2 py-0.5 rounded-full text-xs">
                    {tab.id === 'nouveau' && dashboardData.statusBreakdown.nouveau}
                    {tab.id === 'en_cours' && dashboardData.statusBreakdown.en_cours}
                    {tab.id === 'resolu' && dashboardData.statusBreakdown.resolu}
                    {tab.id === 'annule' && dashboardData.statusBreakdown.annule}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-muted' : 'hover:bg-muted/50'}`}
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-muted' : 'hover:bg-muted/50'}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-full sm:w-auto"
              />
            </div>
          </div>
        </div>

        {viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 font-medium text-muted-foreground">N° Ticket</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Client</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Problème</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Statut</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                  <th className="text-center p-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="p-4">{ticket.number}</td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{ticket.client.name}</div>
                        <div className="text-sm text-muted-foreground">{ticket.product.name}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{ticket.issueType}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {ticket.description}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        ticket.status === 'nouveau' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500' :
                        ticket.status === 'en_cours' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500' :
                        ticket.status === 'resolu' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500' :
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500'
                      }`}>
                        {ticket.status === 'nouveau' ? 'Nouveau' :
                         ticket.status === 'en_cours' ? 'En cours' :
                         ticket.status === 'resolu' ? 'Résolu' : 'Annulé'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {format(new Date(ticket.createdAt), 'dd/MM/yyyy HH:mm')}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleViewTicket(ticket)}
                          className="p-1 hover:bg-muted rounded-full"
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentTickets.map((ticket) => (
              <div 
                key={ticket.id}
                className="bg-background p-4 rounded-lg border border-border/50 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="font-mono text-sm bg-muted px-2 py-1 rounded">#{ticket.number}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    ticket.status === 'nouveau' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500' :
                    ticket.status === 'en_cours' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500' :
                    ticket.status === 'resolu' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500' :
                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500'
                  }`}>
                    {ticket.status === 'nouveau' ? 'Nouveau' :
                     ticket.status === 'en_cours' ? 'En cours' :
                     ticket.status === 'resolu' ? 'Résolu' : 'Annulé'}
                  </span>
                </div>
                <h3 className="font-medium mb-1">{ticket.client.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{ticket.product.name}</p>
                <div className="mb-3">
                  <div className="text-sm font-medium">{ticket.issueType}</div>
                  <p className="text-sm text-muted-foreground truncate">{ticket.description}</p>
                </div>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>{format(new Date(ticket.createdAt), 'dd/MM/yyyy')}</span>
                  <button
                    onClick={() => handleViewTicket(ticket)}
                    className="flex items-center text-primary hover:underline"
                  >
                    <span>Détails</span>
                    <ArrowUpRight className="w-3 h-3 ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {filteredTickets.length > itemsPerPage && (
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-muted-foreground">
              Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, filteredTickets.length)} sur {filteredTickets.length} tickets
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border disabled:opacity-50"
              >
                Précédent
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal pour créer un nouveau ticket */}
      <NewTicketModal
        isOpen={isNewTicketModalOpen}
        onClose={() => setIsNewTicketModalOpen(false)}
        onSave={handleSaveTicket}
      />
    </motion.div>
  );
}
