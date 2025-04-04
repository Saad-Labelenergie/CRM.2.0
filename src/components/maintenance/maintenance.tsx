import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, PenTool as Tool, Calendar, Clock, Building2, Users, CheckCircle, AlertTriangle, TrendingUp, BarChart3, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { NewMaintenanceModal } from './components/new-maintenance-modal';
import { Toast } from '../ui/toast';

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

const maintenanceData = {
  total: 156,
  completed: 142,
  pending: 14,
  nextDue: '2024-03-15',
  monthlyStats: [
    { month: 'Jan', count: 48 },
    { month: 'Fév', count: 52 },
    { month: 'Mar', count: 56 }
  ]
};

const maintenanceRecords = [
  {
    id: 1,
    client: "Entreprise ABC",
    equipment: "Climatiseur Mural 9000 BTU",
    lastMaintenance: "2024-02-15",
    nextMaintenance: "2024-08-15",
    status: "completed",
    type: "Préventif",
    team: "Équipe A"
  },
  {
    id: 2,
    client: "Centre Commercial XYZ",
    equipment: "Système de Ventilation",
    lastMaintenance: "2024-01-20",
    nextMaintenance: "2024-07-20",
    status: "upcoming",
    type: "Préventif",
    team: "Équipe B"
  },
  {
    id: 3,
    client: "Restaurant Le Gourmet",
    equipment: "Climatisation Industrielle",
    lastMaintenance: "2024-02-01",
    nextMaintenance: "2024-08-01",
    status: "overdue",
    type: "Correctif",
    team: null
  }
];

export function Maintenance() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isNewMaintenanceModalOpen, setIsNewMaintenanceModalOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const filteredRecords = maintenanceRecords.filter(record => {
    const matchesSearch = 
      record.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.equipment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || record.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'upcoming':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'overdue':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Effectué';
      case 'upcoming':
        return 'À venir';
      case 'overdue':
        return 'En retard';
      default:
        return status;
    }
  };

  const handleSaveMaintenance = (maintenanceData: any) => {
    console.log('Nouvelle maintenance:', maintenanceData);
    // Ici, vous ajouteriez la logique pour sauvegarder la maintenance
    setShowSuccessToast(true);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Entretien</h1>
          <p className="text-muted-foreground mt-1">Gérez les maintenances préventives et correctives</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsNewMaintenanceModalOpen(true)}
          className="flex items-center px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Maintenance
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          variants={itemVariants}
          className="bg-card rounded-xl p-6 shadow-lg border border-border/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Total</div>
              <div className="text-3xl font-bold mt-2">{maintenanceData.total}</div>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Tool className="w-6 h-6 text-primary" />
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-card rounded-xl p-6 shadow-lg border border-border/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Effectuées</div>
              <div className="text-3xl font-bold mt-2">{maintenanceData.completed}</div>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-card rounded-xl p-6 shadow-lg border border-border/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-muted-foreground">En attente</div>
              <div className="text-3xl font-bold mt-2">{maintenanceData.pending}</div>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-card rounded-xl p-6 shadow-lg border border-border/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Prochaine échéance</div>
              <div className="text-3xl font-bold mt-2">
                {format(new Date(maintenanceData.nextDue), 'dd MMM', { locale: fr })}
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher une maintenance..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
          />
        </div>
        <select
          value={selectedType || ''}
          onChange={(e) => setSelectedType(e.target.value || null)}
          className="px-4 py-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
        >
          <option value="">Tous les types</option>
          <option value="Préventif">Préventif</option>
          <option value="Correctif">Correctif</option>
        </select>
      </div>

      <motion.div
        variants={containerVariants}
        className="bg-card rounded-xl shadow-lg border border-border/50 overflow-hidden"
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left p-4 font-medium text-muted-foreground">Client</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Équipement</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Type</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Dernière</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Prochaine</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Équipe</th>
              <th className="text-center p-4 font-medium text-muted-foreground">Statut</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-muted-foreground">
                  Aucune maintenance ne correspond à votre recherche
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => (
                <motion.tr
                  key={record.id}
                  variants={itemVariants}
                  className="border-b border-border/50 last:border-0 hover:bg-accent/50 transition-colors cursor-pointer group"
                >
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-medium">{record.client}</span>
                    </div>
                  </td>
                  <td className="p-4">{record.equipment}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      record.type === 'Préventif'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                    }`}>
                      {record.type}
                    </span>
                  </td>
                  <td className="p-4">{format(new Date(record.lastMaintenance), 'dd/MM/yyyy')}</td>
                  <td className="p-4">{format(new Date(record.nextMaintenance), 'dd/MM/yyyy')}</td>
                  <td className="p-4">
                    {record.team ? (
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-muted-foreground mr-2" />
                        <span>{record.team}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Non assigné</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                        {getStatusLabel(record.status)}
                      </span>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </motion.div>

      <NewMaintenanceModal
        isOpen={isNewMaintenanceModalOpen}
        onClose={() => setIsNewMaintenanceModalOpen(false)}
        onSave={handleSaveMaintenance}
      />

      <Toast
        message="La maintenance a été créée avec succès !"
        isVisible={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
      />
    </motion.div>
  );
}