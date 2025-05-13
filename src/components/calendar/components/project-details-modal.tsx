import React, { useState, useEffect } from 'react';
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
  ArrowRight,
  Check
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { UpdateClientModal } from './change-semain';
import { useScheduling } from '../../../lib/scheduling/scheduling-context';
import { updateProjectStatus } from '../../../lib/hooks/useProjects';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

// Définir les couleurs de statut comme dans team-schedule-view.tsx
const PROJECT_STATUS_COLORS = {
  'confirmer': '#E67C73',  // Confirmé - rouge clair
  'placer': '#039BE5',     // Placé - bleu clair
  'charger': '#3F51B5',    // Chargé - bleu indigo
  'encours': '#8E24AA',    // En cours - violet
  'terminer': '#33B679',   // Terminé - vert
  'annuler': '#D50000',    // Annulé - rouge vif
  'attribue': '#039BE5',   // Attribué - bleu clair
};

// Mappage des statuts pour standardisation
const STATUS_MAPPING: Record<string, string> = {
  'encours': 'encours',
  'terminer': 'terminer',
  'annuler': 'annuler',
  'charger': 'charger',
  'confirmer': 'confirmer',
  'placer': 'placer',
  'attribue': 'attribue',
};

// Traduction des statuts pour l'affichage
const STATUS_DISPLAY_NAMES: Record<string, string> = {
  'encours': 'En cours',
  'terminer': 'Terminé',
  'annuler': 'Annulé',
  'charger': 'Chargé',
  'confirmer': 'Confirmé',
  'placer': 'Placé',
  'attribue': 'Attribué',
};

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
    contact?: {
      email: string;
      phone: string;
      firstName: string;
      lastName: string;
    };
    date: string;
    time: string;
    team: string | null;
    duration: string;
    status: string;
    commentaires?: Array<{
      authorName: string;
      content: string;
      date: string;
      id: string;
    }>;
  } | null;
}

export function ProjectDetailsModal({ isOpen, onClose, appointment }: ProjectDetailsModalProps) {
  const navigate = useNavigate();
  const [isChangeDateModalOpen, setIsChangeDateModalOpen] = useState(false);
  const { updateAppointmentTeam } = useScheduling();
  const [associatedProject, setAssociatedProject] = useState<any>(null);
  
  useEffect(() => {
    // Rechercher le projet associé lorsque le rendez-vous change
    const fetchAssociatedProject = async () => {
      if (!appointment) return;
      
      try {
        const projectsRef = collection(db, 'projects');
        const q = query(projectsRef, where('name', '==', appointment.title));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const projectData = querySnapshot.docs[0].data();
          console.log("Données brutes du projet:", projectData);
          
          // S'assurer que les données du projet sont correctement structurées
          setAssociatedProject({
            id: querySnapshot.docs[0].id,
            ...projectData
          });
          
          // Vérifier si le projet a des produits avec un statut
          if (projectData.products && projectData.products.length > 0) {
            console.log("Produits trouvés:", projectData.products);
            console.log("Statut du produit:", projectData.products[0].status);
          }
        } else {
          setAssociatedProject(null);
          console.log("Aucun projet associé trouvé");
        }
      } catch (error) {
        console.error("Erreur lors de la recherche du projet associé:", error);
        setAssociatedProject(null);
      }
    };
    
    fetchAssociatedProject();
  }, [appointment]);
  
  if (!appointment) return null;

  // Déterminer le statut à afficher (priorité au statut du produit dans le projet)
  // Vérifier si les produits existent dans la structure de données
  const products = associatedProject?.products || [];
  const productStatus = products.length > 0 ? products[0].status : undefined;
  
  console.log("Produits:", products);
  console.log("Statut du produit:", productStatus);
  console.log("Statut du projet:", associatedProject?.status);
  console.log("Statut du rendez-vous:", appointment.status);
  
  const displayStatus = productStatus || associatedProject?.status || appointment.status;
  console.log("Statut final affiché:", displayStatus);
  
  const mappedStatus = STATUS_MAPPING[displayStatus] || displayStatus;
  const statusDisplayName = STATUS_DISPLAY_NAMES[mappedStatus] || mappedStatus;
  const statusColor = PROJECT_STATUS_COLORS[mappedStatus as keyof typeof PROJECT_STATUS_COLORS] || '#999';

  // Add this to debug the commentaires structure
  console.log('Appointment data:', appointment);
  if (appointment?.commentaires) {
    console.log('Commentaires structure:', {
      authorName: appointment.commentaires[0]?.authorName,
      content: appointment.commentaires[0]?.content,
      date: appointment.commentaires[0]?.date,
      id: appointment.commentaires[0]?.id
    });
  }

  const handleViewProject = () => {
    navigate(`/projects/${appointment.id}`);
    onClose();
  };

  const handleViewClient = () => {
    navigate(`/clients/${appointment.client.id}`);
    onClose();
  };

  const handleChangeDate = () => {
    setIsChangeDateModalOpen(true);
  };

  // Add this new function to handle project confirmation
  const handleConfirmProject = async () => {
    try {
      console.log("Tentative de confirmation du projet avec ID:", appointment.id);
      
      // First, update the appointment status
      const appointmentRef = doc(db, 'appointments', appointment.id);
      await updateDoc(appointmentRef, {
        status: 'confirmer',
        updatedAt: new Date()
      });
      console.log("Statut de l'appointment mis à jour: confirmer");
      
      // Then try to find and update the associated project
      if (associatedProject?.id) {
        console.log("ID du projet trouvé:", associatedProject.id);
        await updateProjectStatus(associatedProject.id, 'confirmer');
        console.log("Projet confirmé avec succès");
        
        // Mettre à jour l'état local
        setAssociatedProject({
          ...associatedProject,
          status: 'confirmer'
        });
        
        // Force refresh of the calendar view
        window.dispatchEvent(new CustomEvent('project-status-updated', { 
          detail: { 
            projectId: associatedProject.id, 
            appointmentId: appointment.id,
            status: 'confirmer' 
          } 
        }));
      } else {
        // Look for a project with the same name/title as the appointment
        const projectsRef = collection(db, 'projects');
        const q = query(projectsRef, where('name', '==', appointment.title));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const projectId = querySnapshot.docs[0].id;
          console.log("ID du projet trouvé:", projectId);
          await updateProjectStatus(projectId, 'confirmer');
          console.log("Projet confirmé avec succès");
          
          // Force refresh of the calendar view
          window.dispatchEvent(new CustomEvent('project-status-updated', { 
            detail: { 
              projectId, 
              appointmentId: appointment.id,
              status: 'confirmer' 
            } 
          }));
        } else {
          console.log("Aucun projet trouvé avec ce titre, mise à jour de l'appointment uniquement");
        }
      }
      
      onClose();
    } catch (error) {
      console.error('Erreur lors de la confirmation du projet:', error);
    }
  };

  const handleSaveDateChange = async (newData: any) => {
    try {
      await updateAppointmentTeam(
        appointment.id,
        newData.team?.name || appointment.team,
        newData.installationDate
      );
      
      // Close the modal
      setIsChangeDateModalOpen(false);
      
      // Optionally refresh the parent component or show a success message
      // You might want to add a toast notification here
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la date:', error);
      // Handle error (show error message, etc.)
    }
  };

  return (
    <>
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
                        <AlertCircle className="w-4 h-4 mr-2" style={{ color: statusColor }} />
                        <span style={{ color: statusColor, fontWeight: 'medium' }}>
                          Statut : {statusDisplayName}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-accent/50 rounded-lg p-4">
                  <h3 className="font-medium mb-4">Produit</h3>
                  <p className="text-sm">{appointment.title}</p>
                </div>

                {/* Update this section for comments */}
                {appointment?.commentaires && appointment.commentaires.length > 0 && (
                  <div className="bg-accent/50 rounded-lg p-4">
                    <h3 className="font-medium mb-4">Commentaires</h3>
                    {appointment.commentaires.map((comment, index) => (
                      <div key={comment.id} className="mb-4">
                        <div className="flex justify-between text-sm text-muted-foreground mb-1">
                          <span>{comment.authorName}</span>
                          <span>{format(new Date(comment.date), 'dd/MM/yyyy HH:mm', { locale: fr })}</span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                        {appointment.commentaires && index < appointment.commentaires.length - 1 && (
                          <hr className="my-2 border-border/50" />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Contacts */}
                <div className="bg-accent/50 rounded-lg p-4">
                  <h3 className="font-medium mb-4">Contacts</h3>
                  <div className="space-y-2">
                    {appointment.contact?.phone && (
                      <div className="flex items-center text-sm">
                        <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span>{appointment.contact.phone}</span>
                      </div>
                    )}
                    {appointment.contact?.email && (
                      <div className="flex items-center text-sm">
                        <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span>{appointment.contact.email}</span>
                      </div>
                    )}
                  </div>
                </div>


                <div className="flex justify-end pt-4 space-x-2">
                  {/* Afficher le bouton Confirmer seulement si le statut n'est pas déjà confirmé ou terminé */}
                  {mappedStatus !== 'confirmer' && mappedStatus !== 'terminer' && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleConfirmProject}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Confirmer
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleChangeDate}
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors flex items-center"
                  >
                    Décaler
                  </motion.button>
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

      <UpdateClientModal
        isOpen={isChangeDateModalOpen}
        onClose={() => setIsChangeDateModalOpen(false)}
        initialData={appointment}
        onSave={handleSaveDateChange}
        appointment={appointment}
        teams={[]} // Passer les équipes disponibles si nécessaire
      />
    </>
  );
}


