import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Package, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useScheduling } from '../../../lib/scheduling/scheduling-context';

interface LoadingHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoadingHistoryModal({ isOpen, onClose }: LoadingHistoryModalProps) {
  const { getLoadingRecords } = useScheduling();
  const [loadingRecords, setLoadingRecords] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRecords, setExpandedRecords] = useState<Record<string, boolean>>({});
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  useEffect(() => {
    const fetchLoadingHistory = async () => {
      setIsLoading(true);
      try {
        const records = await getLoadingRecords();
        setLoadingRecords(records);
      } catch (error) {
        console.error("Erreur lors de la récupération de l'historique de chargement:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchLoadingHistory();
    }
  }, [isOpen, getLoadingRecords]);

  const toggleRecordExpand = (recordId: string) => {
    setExpandedRecords(prev => ({
      ...prev,
      [recordId]: !prev[recordId]
    }));
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const filteredRecords = loadingRecords
    .filter(record => {
      const matchesSearch = searchTerm === '' || 
        record.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.teamName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !filterStatus || record.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'pending':
      default:
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Terminé';
      case 'in_progress':
        return 'En cours';
      case 'pending':
      default:
        return 'En attente';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-4xl bg-card p-6 rounded-xl shadow-xl z-50 border border-border/50 mx-4 max-h-[80vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center">
                <Package className="w-5 h-5 mr-2 text-primary" />
                Historique des chargements
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un projet ou une équipe..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                />
              </div>
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-3 bg-accent hover:bg-accent/80 rounded-xl flex items-center transition-colors"
                  onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                >
                  <Filter className="w-5 h-5 mr-2" />
                  Filtrer
                  {filterStatus && <span className="ml-2 text-xs bg-primary/20 px-2 py-0.5 rounded-full">{getStatusText(filterStatus)}</span>}
                </motion.button>
                {isFilterMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-card rounded-xl shadow-lg border border-border/50 z-10">
                    <div className="p-2">
                      <button
                        className={`w-full text-left px-3 py-2 rounded-lg hover:bg-accent transition-colors ${!filterStatus ? 'bg-primary/10' : ''}`}
                        onClick={() => {
                          setFilterStatus(null);
                          setIsFilterMenuOpen(false);
                        }}
                      >
                        Tous les statuts
                      </button>
                      <button
                        className={`w-full text-left px-3 py-2 rounded-lg hover:bg-accent transition-colors ${filterStatus === 'pending' ? 'bg-primary/10' : ''}`}
                        onClick={() => {
                          setFilterStatus('pending');
                          setIsFilterMenuOpen(false);
                        }}
                      >
                        En attente
                      </button>
                      <button
                        className={`w-full text-left px-3 py-2 rounded-lg hover:bg-accent transition-colors ${filterStatus === 'in_progress' ? 'bg-primary/10' : ''}`}
                        onClick={() => {
                          setFilterStatus('in_progress');
                          setIsFilterMenuOpen(false);
                        }}
                      >
                        En cours
                      </button>
                      <button
                        className={`w-full text-left px-3 py-2 rounded-lg hover:bg-accent transition-colors ${filterStatus === 'completed' ? 'bg-primary/10' : ''}`}
                        onClick={() => {
                          setFilterStatus('completed');
                          setIsFilterMenuOpen(false);
                        }}
                      >
                        Terminé
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-3 bg-accent hover:bg-accent/80 rounded-xl flex items-center transition-colors"
                onClick={toggleSortOrder}
              >
                {sortOrder === 'desc' ? (
                  <>
                    <ChevronDown className="w-5 h-5 mr-2" />
                    Plus récent
                  </>
                ) : (
                  <>
                    <ChevronUp className="w-5 h-5 mr-2" />
                    Plus ancien
                  </>
                )}
              </motion.button>
            </div>

            <div className="overflow-y-auto flex-1 pr-2">
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  Aucun historique de chargement trouvé
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRecords.map((record) => (
                    <div
                      key={record.id}
                      className="bg-accent/50 rounded-lg p-4 border border-border/50"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="font-medium">{record.projectName}</div>
                          <div className={`ml-3 text-xs px-2 py-0.5 rounded-full ${getStatusColor(record.status)}`}>
                            {getStatusText(record.status)}
                          </div>
                        </div>
                        <div className="flex items-center mt-2 sm:mt-0">
                          <Calendar className="w-4 h-4 mr-1 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground mr-4">
                            {format(new Date(record.date), 'dd MMMM yyyy', { locale: fr })}
                          </span>
                          <div className="flex items-center">
                            <span className="text-sm font-medium mr-2">
                              {record.progress}%
                            </span>
                            <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  record.progress >= 100 ? 'bg-green-500' : 
                                  record.progress >= 75 ? 'bg-blue-500' :
                                  record.progress >= 50 ? 'bg-amber-500' :
                                  record.progress >= 25 ? 'bg-orange-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${record.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <span>Équipe: {record.teamName}</span>
                        {record.documentsSubmitted && (
                          <span className="ml-4 text-xs px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                            Documents remis
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => toggleRecordExpand(record.id)}
                        className="text-sm text-primary hover:underline flex items-center mt-2"
                      >
                        {expandedRecords[record.id] ? (
                          <>
                            <ChevronUp className="w-4 h-4 mr-1" />
                            Masquer les détails
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4 mr-1" />
                            Voir les détails
                          </>
                        )}
                      </button>
                      {expandedRecords[record.id] && (
                        <div className="mt-4 pt-4 border-t border-border/50">
                          <h4 className="text-sm font-medium mb-3">Matériels</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {record.materials.map((material: any) => (
                              <div 
                                key={material.id} 
                                className={`flex flex-col p-2 rounded-md text-xs ${
                                  material.status === 'loaded' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                  'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <Package className="w-3 h-3 mr-1" />
                                    {material.name}
                                  </div>
                                  <div className="text-xs">
                                    {material.status === 'loaded' ? 'Chargé' : 'Non chargé'}
                                  </div>
                                </div>
                                {material.comments && (
                                  <div className="mt-1 text-xs italic border-t border-border/30 pt-1">
                                    "{material.comments}"
                                  </div>
                                )}
                                {material.updatedBy && (
                                  <div className="mt-1 text-xs text-muted-foreground">
                                    Mis à jour par: {material.updatedBy}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}