import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  PenTool as Tool, 
  Calendar, 
  Building2, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Download,
  LayoutGrid,
  List,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { NewMaintenanceModal } from './components/new-maintenance-modal';
import { MaintenanceDetailModal } from './components/maintenance-detail-modal'; 
import { Toast } from '../ui/toast';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { downloadContractPdf } from '../../utils/contract-pdf-generator'; 

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

export interface MaintenanceRecord {
  id: string;
  clientId: string;
  clientName: string;
  equipmentId: string;
  equipmentName: string;
  frequency: number;
  lastMaintenance: string;
  nextMaintenance: string;
  notes: string;
  status: string;
  teamId: string;
  teamName: string;
  type: string;
  createdAt: string;
  contractId?: string; 
  contractNumber?: string; 
}

export function Maintenance() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isNewMaintenanceModalOpen, setIsNewMaintenanceModalOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [maintenanceStats, setMaintenanceStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    nextDue: null as string | null
  });
  const [monthlyStats, setMonthlyStats] = useState({
    total: [] as number[],
    completed: [] as number[],
    pending: [] as number[]
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Fonction pour générer les données mensuelles pour les graphiques
  const generateMonthlyData = (records: MaintenanceRecord[]) => {
    const last6Months = Array.from({length: 6}, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date;
    }).reverse();

    return {
      total: last6Months.map(month => 
        records.filter(record => new Date(record.createdAt).getMonth() === month.getMonth()).length
      ),
      completed: last6Months.map(month => 
        records.filter(record => 
          record.status === 'completed' && 
          new Date(record.lastMaintenance).getMonth() === month.getMonth()
        ).length
      ),
      pending: last6Months.map(month => 
        records.filter(record => 
          (record.status === 'upcoming' || record.status === 'pending') && 
          new Date(record.nextMaintenance).getMonth() === month.getMonth()
        ).length
      )
    };
  };

  // Fonction pour générer le chemin SVG pour les graphiques
  const generateChartPath = (data: number[], type: 'fill' | 'line') => {
    if (!data.length) return '';
    
    const max = Math.max(...data, 1);
    const points = data.map((val, i) => ({
      x: (i * (100 / (data.length - 1))),
      y: 30 - ((val / max) * 20)
    }));
    
    if (type === 'fill') {
      return `M0,30 L0,${points[0].y} ${points.map(p => `L${p.x},${p.y}`).join(' ')} L100,${points[points.length-1].y} L100,30 Z`;
    }
    
    return `M0,${points[0].y} ${points.map(p => `L${p.x},${p.y}`).join(' ')}`;
  };
  
  const handleDownloadContract = async (e: React.MouseEvent, maintenance: MaintenanceRecord) => {
    e.stopPropagation();
    e.preventDefault();
    if (!maintenance.contractNumber) {
      alert('Aucun contrat associé à cette maintenance.');
      return;
    }
    try {
      await downloadContractPdf({
        contractNumber: maintenance.contractNumber,
        clientName: maintenance.clientName,
        equipmentName: maintenance.equipmentName,
        createdAt: new Date(maintenance.createdAt),
        contractEndDate: new Date(maintenance.nextMaintenance)
      });
    } catch (error) {
      console.error('Erreur lors du téléchargement du PDF:', error);
      alert('Erreur lors de la génération du contrat. Veuillez réessayer.');
    }
  };
  
  const handleViewContract = async (e: React.MouseEvent, maintenance: MaintenanceRecord) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!maintenance.contractNumber) {
      alert('Aucun contrat associé à cette maintenance.');
      return;
    }
    
    try {
      // Générer le PDF et obtenir le blob
      const pdfBlob = await downloadContractPdf({
        contractNumber: maintenance.contractNumber,
        clientName: maintenance.clientName,
        equipmentName: maintenance.equipmentName,
        createdAt: new Date(maintenance.createdAt),
        contractEndDate: new Date(maintenance.nextMaintenance)
      }, false); 
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
    } catch (error) {
      console.error('Erreur lors de l\'affichage du PDF:', error);
      alert('Erreur lors de la génération du contrat. Veuillez réessayer.');
    }
  };
  
  useEffect(() => {
    const maintenanceRef = collection(db, 'maintenances');
    const unsubscribe = onSnapshot(maintenanceRef, (snapshot) => {
      const maintenances = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MaintenanceRecord[]; 
      setMaintenanceRecords(maintenances);
      
      const stats = maintenances.reduce((acc, maintenance: MaintenanceRecord) => {
        acc.total++;
        if (maintenance.status === 'completed') acc.completed++;
        if (maintenance.status === 'upcoming' || maintenance.status === 'pending') acc.pending++;
        if (!acc.nextDue || new Date(maintenance.nextMaintenance) < new Date(acc.nextDue)) {
          acc.nextDue = maintenance.nextMaintenance;
        }
        return acc;
      }, { total: 0, completed: 0, pending: 0, nextDue: null as string | null });
  
      setMaintenanceStats(stats);
      
      // Générer les données mensuelles pour les graphiques
      setMonthlyStats(generateMonthlyData(maintenances));
    });
    return () => unsubscribe();
  }, []);
  
  const filteredRecords = maintenanceRecords.filter(record => {
    const matchesSearch = 
      record.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.equipmentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || record.type.toLowerCase() === selectedType.toLowerCase();
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
    setShowSuccessToast(true);
  };
  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  
  const handleMaintenanceClick = (maintenance: MaintenanceRecord) => {
    setSelectedMaintenance(maintenance);
    setIsDetailModalOpen(true);
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
        <div className="flex items-center space-x-3">
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
              title="Vue en grille"
            >
              <LayoutGrid className="w-4 h-4" />
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
              title="Vue en liste"
            >
              <List className="w-4 h-4" />
            </motion.button>
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div variants={itemVariants} className="bg-card rounded-xl p-6 shadow-lg border border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Total</div>
              <div className="text-3xl font-bold mt-2">{maintenanceStats.total}</div>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Tool className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="h-10 w-full mt-2">
            <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path 
                d={generateChartPath(monthlyStats.total, 'fill')}
                fill="rgba(124, 58, 237, 0.2)" 
              />
              <path 
                d={generateChartPath(monthlyStats.total, 'line')}
                fill="none" 
                stroke="rgb(124, 58, 237)" 
                strokeWidth="2" 
              />
            </svg>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-card rounded-xl p-6 shadow-lg border border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Effectuées</div>
              <div className="text-3xl font-bold mt-2">{maintenanceStats.completed}</div>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <div className="h-10 w-full mt-2">
            <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path 
                d={generateChartPath(monthlyStats.completed, 'fill')}
                fill="rgba(34, 197, 94, 0.2)" 
              />
              <path 
                d={generateChartPath(monthlyStats.completed, 'line')}
                fill="none" 
                stroke="rgb(34, 197, 94)" 
                strokeWidth="2" 
              />
            </svg>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-card rounded-xl p-6 shadow-lg border border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-muted-foreground">En attente</div>
              <div className="text-3xl font-bold mt-2">{maintenanceStats.pending}</div>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
            </div>
          </div>
          <div className="h-10 w-full mt-2">
            <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path 
                d={generateChartPath(monthlyStats.pending, 'fill')}
                fill="rgba(249, 115, 22, 0.2)" 
              />
              <path 
                d={generateChartPath(monthlyStats.pending, 'line')}
                fill="none" 
                stroke="rgb(249, 115, 22)" 
                strokeWidth="2" 
              />
            </svg>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-card rounded-xl p-6 shadow-lg border border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Prochaine échéance</div>
              <div className="text-3xl font-bold mt-2">
                {maintenanceStats.nextDue ? format(new Date(maintenanceStats.nextDue), 'dd MMM', { locale: fr }) : '-'}
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
          <option value="preventif">Préventif</option>
          <option value="correctif">Correctif</option>
        </select>
      </div>

      {viewMode === 'list' ? (
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
                <th className="text-left p-4 font-medium text-muted-foreground">Début</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Fin</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Équipe</th>
                <th className="text-center p-4 font-medium text-muted-foreground">Statut</th>
                <th className="text-center p-4 font-medium text-muted-foreground">Contrat</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-muted-foreground">
                    Aucune maintenance ne correspond à votre recherche
                  </td>
                </tr>
              ) : (
                currentItems.map((record) => (
                  <motion.tr
                    key={record.id}
                    variants={itemVariants}
                    className="border-b border-border/50 last:border-0 hover:bg-accent/50 transition-colors group cursor-pointer"
                    onClick={() => handleMaintenanceClick(record)}
                  >
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-medium">{record.clientName}</span>
                      </div>
                    </td>
                    <td className="p-4">{record.equipmentName}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        record.type === 'preventif'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                      }`}>
                        {record.type.charAt(0).toUpperCase() + record.type.slice(1)}
                      </span>
                    </td>
                    <td className="p-4">{format(new Date(record.lastMaintenance), 'dd/MM/yyyy')}</td>
                    <td className="p-4">{format(new Date(record.nextMaintenance), 'dd/MM/yyyy')}</td>
                    <td className="p-4">
                      {record.teamName ? (
                        <div className="flex items-center">
                          <Users className="w-4 h-4 text-muted-foreground mr-2" />
                          <span>{record.teamName}</span>
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
                    <td className="p-4 text-center">
                      {record.contractId ? (
                        <Link
                          to={`/contracts/${record.contractId}`}
                          title={`Voir contrat ${record.contractNumber || ''}`}
                          className="inline-flex items-center justify-center p-2 rounded-md text-primary hover:bg-primary/10 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FileText className="w-4 h-4" />
                        </Link>
                      ) : (
                        <div className="flex justify-center space-x-1">
                          <button
                            title="Télécharger contrat"
                            className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                            onClick={(e) => handleDownloadContract(e, record)}
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            title="Afficher contrat"
                            className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                            onClick={(e) => handleViewContract(e, record)}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
          
          <div className="p-4 border-t border-border/50 flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, filteredRecords.length)} sur {filteredRecords.length} maintenances
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center mr-4">
                <span className="text-sm mr-2">Lignes par page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-background border rounded-md px-2 py-1 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <button
                onClick={() => paginate(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              <span className="px-3 py-1 rounded-md bg-primary/10 text-primary">
                {currentPage}
              </span>
              <button
                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {currentItems.map((record) => (
            <motion.div
              key={record.id}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50 cursor-pointer"
              onClick={() => handleMaintenanceClick(record)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Tool className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{record.clientName}</h3>
                    <p className="text-sm text-muted-foreground">{record.equipmentName}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                  {getStatusLabel(record.status)}
                </span>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium">{record.type.charAt(0).toUpperCase() + record.type.slice(1)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Dernière:</span>
                  <span className="font-medium">{format(new Date(record.lastMaintenance), 'dd/MM/yyyy')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Prochaine:</span>
                  <span className="font-medium">{format(new Date(record.nextMaintenance), 'dd/MM/yyyy')}</span>
                </div>
                {record.teamName && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Équipe:</span>
                    <span className="font-medium">{record.teamName}</span>
                  </div>
                )}
              </div>
              {record.contractId && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <Link
                    to={`/contracts/${record.contractId}`}
                    className="flex items-center text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Voir le contrat
                  </Link>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
      <NewMaintenanceModal
        isOpen={isNewMaintenanceModalOpen}
        onClose={() => setIsNewMaintenanceModalOpen(false)}
        onSave={handleSaveMaintenance}
      />

      <MaintenanceDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        maintenance={selectedMaintenance}
      />

      <Toast
        message="La maintenance a été créée avec succès !"
        isVisible={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
      />
    </motion.div>
  );
}
