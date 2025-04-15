import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Building2, 
  Package, 
  Calendar, 
  Users,
  PenTool as Tool,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MaintenanceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  maintenance: {
    id: number;
    client: string;
    equipment: string;
    lastMaintenance: string;
    nextMaintenance: string;
    status: string;
    type: string;
    team: string | null;
    notes?: string;
  } | null;
}

export function MaintenanceDetailModal({ isOpen, onClose, maintenance }: MaintenanceDetailModalProps) {
  if (!maintenance) return null;

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
            className="relative w-full max-w-2xl bg-card p-6 rounded-xl shadow-xl z-50 border border-border/50 mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center">
                <Tool className="w-5 h-5 mr-2 text-primary" />
                Détails de la maintenance
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Informations principales */}
              <div className="bg-accent/50 rounded-lg p-4">
                <h3 className="font-medium mb-4 flex items-center">
                  <Building2 className="w-4 h-4 mr-2" />
                  Client et équipement
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span className="font-medium">{maintenance.client}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Package className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>{maintenance.equipment}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        maintenance.type === 'Préventif'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                      }`}>
                        {maintenance.type}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(maintenance.status)}`}>
                        {getStatusLabel(maintenance.status)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="bg-accent/50 rounded-lg p-4">
                <h3 className="font-medium mb-4 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Dates
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Dernière maintenance</div>
                    <div className="font-medium">
                      {format(new Date(maintenance.lastMaintenance), 'dd MMMM yyyy', { locale: fr })}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Prochaine maintenance</div>
                    <div className="font-medium">
                      {format(new Date(maintenance.nextMaintenance), 'dd MMMM yyyy', { locale: fr })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Équipe */}
              <div className="bg-accent/50 rounded-lg p-4">
                <h3 className="font-medium mb-4 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Équipe assignée
                </h3>
                {maintenance.team ? (
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-primary mr-2" />
                    <span className="font-medium">{maintenance.team}</span>
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    Aucune équipe assignée
                  </div>
                )}
              </div>

              {/* Notes */}
              {maintenance.notes && (
                <div className="bg-accent/50 rounded-lg p-4">
                  <h3 className="font-medium mb-4 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Notes
                  </h3>
                  <p className="text-sm">{maintenance.notes}</p>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center"
                >
                  Fermer
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}