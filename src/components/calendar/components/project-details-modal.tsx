import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  FileText,
  Building2,
  Calendar,
  Clock,
  MapPin,
  Users,
  Package,
  Phone,
  Mail,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: {
    id: string;
    title: string;
    client: {
      id: number;
      name: string;
      postalCode: string;
    };
    date: string;
    time: string;
    team: string | null;
    duration: string;
    status: string;
  } | null;
}

export function ProjectDetailsModal({ isOpen, onClose, appointment }: ProjectDetailsModalProps) {
  const navigate = useNavigate();
  
  if (!appointment) return null;

  const handleViewProject = () => {
    navigate(`/projects/${appointment.id}`);
    onClose();
  };

  const handleViewClient = () => {
    navigate(`/clients/${appointment.client.id}`);
    onClose();
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
                <FileText className="w-5 h-5 mr-2 text-primary" />
                Détails du chantier
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
                  <Package className="w-4 h-4 mr-2" />
                  Intervention
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>{format(new Date(appointment.date), 'dd MMMM yyyy', { locale: fr })}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>{appointment.time} - Durée : {appointment.duration}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>{appointment.team || 'Non assigné'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div 
                      className="flex items-center text-sm cursor-pointer hover:text-primary transition-colors group"
                      onClick={handleViewClient}
                    >
                      <Building2 className="w-4 h-4 mr-2 text-muted-foreground group-hover:text-primary" />
                      <span>{appointment.client.name}</span>
                      <ArrowRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>Code postal : {appointment.client.postalCode}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <AlertCircle className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>Statut : {appointment.status}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-accent/50 rounded-lg p-4">
                <h3 className="font-medium mb-4">Description</h3>
                <p className="text-sm">{appointment.title}</p>
              </div>

              {/* Contacts */}
              <div className="bg-accent/50 rounded-lg p-4">
                <h3 className="font-medium mb-4">Contacts</h3>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>+33 1 23 45 67 89</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>contact@example.com</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleViewProject}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center"
                >
                  Voir le projet
                  <ArrowRight className="w-4 h-4 ml-2" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}