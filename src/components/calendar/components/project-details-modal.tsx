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
  Check,
  Edit2,
  Printer
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { UpdateClientModal } from './change-semain';
import { EditProjectProductModal } from './edit-project-product-modal';
import { useScheduling } from '../../../lib/scheduling/scheduling-context';
import { updateProjectStatus } from '../../../lib/hooks/useProjects';
import { doc, updateDoc, collection, query, where, getDocs, getDoc } from 'firebase/firestore';
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
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const { updateAppointmentTeam } = useScheduling();
  const [associatedProject, setAssociatedProject] = useState<any>(null);
  
  useEffect(() => {
    // Rechercher le projet associé lorsque le rendez-vous change
    const fetchAssociatedProject = async () => {
      if (!appointment) return;
      
      try {
        // Log the appointment data for debugging
        console.log("Appointment data for debugging:", appointment);
        
        // First try to find an associated project
        const projectsRef = collection(db, 'projects');
        const q = query(projectsRef, where('name', '==', appointment.title));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const projectData = querySnapshot.docs[0].data();
          console.log("Données brutes du projet:", projectData);
          
          // Vérifier spécifiquement les données RAC
          console.log("Données RAC:", projectData.RAC);
          
          // S'assurer que les données du projet sont correctement structurées
          setAssociatedProject({
            id: querySnapshot.docs[0].id,
            ...projectData
          });
          
          // Vérifier si le projet a des commentaires
          if (projectData.commentaires && projectData.commentaires.length > 0) {
            console.log("Commentaires trouvés:", projectData.commentaires);
          }
          
          // Vérifier si le projet a des produits avec un statut
          if (projectData.products && projectData.products.length > 0) {
            console.log("Produits trouvés:", projectData.products);
            console.log("Statut du produit:", projectData.products[0].status);
          }
          
          // Récupérer les informations du client si disponibles
          if (projectData.clientId) {
            try {
              const clientDocRef = doc(db, 'clients', projectData.clientId);
              const clientSnapshot = await getDoc(clientDocRef);
              if (clientSnapshot.exists()) {
                const clientData = clientSnapshot.data();
                console.log("Données du client depuis le projet:", clientData);
                
                // Mettre à jour les informations du projet avec les données du client
                setAssociatedProject((prev: any) => ({
                  ...prev,
                  clientData: clientData
                }));
              }
            } catch (error) {
              console.error("Erreur lors de la récupération des données client:", error);
            }
          }
        } else {
          console.log("Aucun projet associé trouvé");
          
          // If no project is found by name, try to find by ID
          if (appointment.id) {
            try {
              const projectDocRef = doc(db, 'projects', appointment.id);
              const projectSnapshot = await getDoc(projectDocRef);
              
              if (projectSnapshot.exists()) {
                const projectData = projectSnapshot.data();
                console.log("Projet trouvé par ID:", projectData);
                
                setAssociatedProject({
                  id: appointment.id,
                  ...projectData
                });
                
                // Check for comments in this project
                if (projectData.commentaires && projectData.commentaires.length > 0) {
                  console.log("Commentaires trouvés par ID:", projectData.commentaires);
                }
              } else {
                console.log("Aucun projet trouvé avec cet ID:", appointment.id);
              }
            } catch (error) {
              console.error("Erreur lors de la recherche du projet par ID:", error);
            }
          }
        }
        
        // Regardless of whether a project was found, try to get client data directly
        // This ensures we have client data even if no project is found
        if (appointment.client && appointment.client.name) {
          try {
            // Try to find client by name
            const clientsRef = collection(db, 'clients');
            const clientQuery = query(clientsRef, where('name', '==', appointment.client.name));
            const clientQuerySnapshot = await getDocs(clientQuery);
            
            if (!clientQuerySnapshot.empty) {
              const clientData = clientQuerySnapshot.docs[0].data();
              const clientId = clientQuerySnapshot.docs[0].id;
              console.log("Client trouvé par nom:", clientData);
              
              // Set or update the associated project with client data
              setAssociatedProject((prev: any) => ({
                ...prev,
                clientData: clientData,
                clientId: clientId
              }));
            } else {
              // If client not found by name, try to find by ID if available
              if (appointment.client.id && 
                  String(appointment.client.id) !== 'NaN' && 
                  !isNaN(Number(appointment.client.id))) {
                const clientDocRef = doc(db, 'clients', appointment.client.id.toString());
                const clientSnapshot = await getDoc(clientDocRef);
                
                if (clientSnapshot.exists()) {
                  const clientData = clientSnapshot.data();
                  console.log("Client trouvé par ID:", clientData);
                  
                  setAssociatedProject((prev: any) => ({
                    ...prev,
                    clientData: clientData,
                    clientId: appointment.client.id.toString()
                  }));
                } else {
                  console.log("Aucun client trouvé avec cet ID:", appointment.client.id);
                }
              } else {
                console.log("Aucun client trouvé avec ce nom:", appointment.client.name);
              }
            }
          } catch (error) {
            console.error("Erreur lors de la récupération des données client:", error);
          }
        }
      } catch (error) {
        console.error("Erreur lors de la recherche du projet associé:", error);
        setAssociatedProject(null);
      }
    };
    
    fetchAssociatedProject();
  }, [appointment]);

  // Fonction pour récupérer spécifiquement les données RAC
  useEffect(() => {
    const fetchRACData = async () => {
      if (!appointment) return;
      
      try {
        // Si nous avons un ID de projet associé, essayons de récupérer les données RAC directement
        if (associatedProject?.id) {
          console.log("Tentative de récupération des données RAC pour le projet:", associatedProject.id);
          const projectRef = doc(db, 'projects', associatedProject.id);
          const projectSnap = await getDoc(projectRef);
          
          if (projectSnap.exists()) {
            const projectData = projectSnap.data();
            console.log("Données complètes du projet:", projectData);
            console.log("Vérification des données RAC:", projectData.RAC);
            
            // Mettre à jour l'état avec les données RAC
            if (projectData.RAC) {
              setAssociatedProject((prev: any) => ({
                ...prev,
                RAC: projectData.RAC
              }));
            }
          }
        } else {
          // Si nous n'avons pas d'ID de projet, essayons de chercher par le titre de l'appointment
          console.log("Recherche de projet par titre:", appointment.title);
          const projectsRef = collection(db, 'projects');
          const q = query(projectsRef, where('name', '==', appointment.title));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const projectData = querySnapshot.docs[0].data();
            const projectId = querySnapshot.docs[0].id;
            console.log("Projet trouvé par titre:", projectData);
            console.log("Données RAC du projet trouvé:", projectData.RAC);
            
            setAssociatedProject((prev: any) => ({
              ...prev,
              id: projectId,
              ...projectData
            }));
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données RAC:", error);
      }
    };
    
    fetchRACData();
  }, [appointment, associatedProject?.id]);
  

  // Ajouter un écouteur d'événement pour rafraîchir les données après une mise à jour des produits
  useEffect(() => {
    const handleProductUpdate = (event: CustomEvent) => {
      console.log("Événement de mise à jour des produits détecté:", event.detail);
      
      // Mettre à jour l'état local avec les nouveaux produits
      if (event.detail.projectId === associatedProject?.id) {
        console.log("Mise à jour des produits dans le modal de détails");
        setAssociatedProject((prev: any) => ({
          ...prev,
          products: event.detail.products,
          name: event.detail.products[0]?.name
        }));
      }
    };

    // Ajouter l'écouteur d'événement
    window.addEventListener('project-product-updated', handleProductUpdate as EventListener);
    
    // Nettoyer l'écouteur d'événement
    return () => {
      window.removeEventListener('project-product-updated', handleProductUpdate as EventListener);
    };
  }, [associatedProject?.id]);
  
  // Ajoutez un log pour vérifier les données RAC dans le rendu
  console.log("RAC dans associatedProject:", associatedProject?.RAC);
  
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
    // Use the clientId from associatedProject if available, otherwise use the appointment client id
    const clientId = associatedProject?.clientId || appointment.client.id;
    console.log("Navigating to client with ID:", clientId);
    navigate(`/clients/${clientId}`);
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

  // Ajouter cette fonction pour gérer la mise à jour des produits
  const handleProductUpdate = () => {
    if (associatedProject?.id) {
      setIsEditProductModalOpen(true);
    } else {
      console.log("Aucun projet associé trouvé pour modifier le produit");
      // Optionnellement afficher une notification toast ici
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const printUrl = `/print-intervention/${appointment.id}`;
                      window.open(printUrl, '_blank');
                    }}
                    className="p-2 hover:bg-accent rounded-lg transition-colors flex items-center gap-1 text-sm"
                    title="Imprimer la fiche d'intervention"
                  >
                    <Printer className="w-4 h-4" />
                    Imprimer
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-accent rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
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
                      
                      {/* Ajout de l'affichage du RAC */}
                      {associatedProject?.RAC && associatedProject.RAC.hasToCollect && (
                        <div className="flex items-center text-sm mt-2">
                          <div className="w-4 h-4 mr-2 flex items-center justify-center text-amber-500">€</div>
                          <span className="font-medium text-amber-500">
                            RAC : {associatedProject.RAC.amount} €
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-accent/50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Produit{products.length > 1 ? 's' : ''}</h3>
                    {associatedProject?.id && (
                      <button 
                        onClick={handleProductUpdate}
                        className="p-1 hover:bg-background rounded-md transition-colors"
                        title="Modifier les produits"
                      >
                        <Edit2 className="w-4 h-4 text-muted-foreground hover:text-primary" />
                      </button>
                    )}
                  </div>
                  <div className="text-sm">
                    {products.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {products.map((product: any, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <Package className="w-3 h-3 text-muted-foreground" />
                            <span>{product.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>{appointment.title}</p>
                    )}
                  </div>
                </div>

                {/* Section des commentaires - Always show the section, with a message if no comments */}
                <div className="bg-accent/50 rounded-lg p-4">
                  <h3 className="font-medium mb-4">Commentaires</h3>
                  
                  {/* Debug logging - Fixed to return null instead of void */}
                  {(() => {
                    console.log('Comment debugging:', {
                      appointmentComments: appointment.commentaires,
                      projectComments: associatedProject?.commentaires,
                      rawProject: associatedProject
                    });
                    return null;
                  })()}
                  
                  {/* Show comments if they exist - handle different data structures */}
                  {appointment.commentaires && appointment.commentaires.length > 0 ? (
                    <>
                      {/* Commentaires du rendez-vous */}
                      {appointment.commentaires.map((comment, index) => (
                        <div key={`appointment-${index}-${comment.id || ''}`} className="mb-4">
                          <div className="flex justify-between text-sm text-muted-foreground mb-1">
                            <span>{comment.authorName || 'Utilisateur'}</span>
                            <span>{comment.date ? format(new Date(comment.date), 'dd/MM/yyyy HH:mm', { locale: fr }) : ''}</span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                          {index < (appointment.commentaires?.length || 0) - 1 && (
                            <hr className="my-2 border-border/50" />
                          )}
                        </div>
                      ))}
                    </>
                  ) : associatedProject?.commentaires ? (
                    <>
                      {/* Handle both array and object structures for project comments */}
                      {Array.isArray(associatedProject.commentaires) ? (
                        associatedProject.commentaires.length > 0 ? (
                          associatedProject.commentaires.map((comment: any, index: number) => (
                            <div key={`project-array-${index}-${comment.id || ''}`} className="mb-4">
                              <div className="flex justify-between text-sm text-muted-foreground mb-1">
                                <span>{comment.authorName || "Utilisateur"}</span>
                                <span>{comment.date ? format(new Date(comment.date), 'dd/MM/yyyy HH:mm', { locale: fr }) : ""}</span>
                              </div>
                              <p className="text-sm whitespace-pre-wrap">{typeof comment.content === 'string' ? comment.content : JSON.stringify(comment)}</p>
                              {index < (associatedProject.commentaires?.length || 0) - 1 && (
                                <hr className="my-2 border-border/50" />
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">Aucun commentaire disponible</p>
                        )
                      ) : typeof associatedProject.commentaires === 'object' ? (
                        // Handle object structure (non-array)
                        Object.keys(associatedProject.commentaires).length > 0 ? (
                          Object.entries(associatedProject.commentaires).map(([key, comment]: [string, any], index: number) => (
                            <div key={`project-obj-${index}-${key}`} className="mb-4">
                              <div className="flex justify-between text-sm text-muted-foreground mb-1">
                                <span>{comment.authorName || "Utilisateur"}</span>
                                <span>{comment.date ? format(new Date(comment.date), 'dd/MM/yyyy HH:mm', { locale: fr }) : ""}</span>
                              </div>
                              <p className="text-sm whitespace-pre-wrap">{typeof comment.content === 'string' ? comment.content : JSON.stringify(comment)}</p>
                              {index < Object.keys(associatedProject.commentaires).length - 1 && (
                                <hr className="my-2 border-border/50" />
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">Aucun commentaire disponible</p>
                        )
                      ) : (
                        <p className="text-sm text-muted-foreground">Aucun commentaire disponible</p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucun commentaire disponible</p>
                  )}
                </div>

                {/* Contacts */}
                <div className="bg-accent/50 rounded-lg p-4">
                  <h3 className="font-medium mb-4">Contacts</h3>
                  <div className="space-y-2">
                    {/* Afficher le téléphone du contact */}
                    {(appointment.contact?.phone || associatedProject?.clientData?.contact?.phone) && (
                      <div className="flex items-center text-sm">
                        <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span>{appointment.contact?.phone || associatedProject?.clientData?.contact?.phone}</span>
                      </div>
                    )}
                    
                    {/* Afficher l'email du contact */}
                    {(appointment.contact?.email || associatedProject?.clientData?.contact?.email) && (
                      <div className="flex items-center text-sm">
                        <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span>{appointment.contact?.email || associatedProject?.clientData?.contact?.email}</span>
                      </div>
                    )}
                    
                    {/* Afficher le nom complet du contact */}
                    {(associatedProject?.clientData?.contact?.firstName || associatedProject?.clientData?.contact?.lastName) && (
                      <div className="flex items-center text-sm">
                        <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span>
                          {associatedProject?.clientData?.contact?.firstName} {associatedProject?.clientData?.contact?.lastName}
                        </span>
                      </div>
                    )}
                    
                    {/* Message si aucun contact n'est disponible */}
                    {!appointment.contact?.phone && !appointment.contact?.email && 
                     !associatedProject?.clientData?.contact?.phone && !associatedProject?.clientData?.contact?.email && (
                      <p className="text-sm text-muted-foreground">Aucune information de contact disponible</p>
                    )}
                  </div>
                </div>
                

                {/* Section RAC - Affichée même s'il n'y a pas un RAC à collecter */}
                <div className="bg-accent/50 rounded-lg p-4">
                  <h3 className="font-medium mb-4 flex items-center">
                    <span className="mr-2 text-muted-foreground">€</span>
                    Reste à Charge (RAC)
                  </h3>
                  
                  {associatedProject?.RAC && associatedProject.RAC.hasToCollect === true ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-amber-700 dark:text-amber-400">Montant à collecter</span>
                        <span className="text-lg font-bold text-amber-700 dark:text-amber-400">{associatedProject.RAC.amount} €</span>
                      </div>
                      <div className="text-xs text-amber-600 dark:text-amber-500 bg-amber-100 dark:bg-amber-800/30 p-2 rounded">
                        <p>Ce montant doit être collecté par l'équipe d'installation lors de l'intervention.</p>
                        <p className="mt-1">Client : {appointment.client.name}</p>
                        {associatedProject?.clientData?.contact?.phone && (
                          <p className="mt-1">Téléphone : {associatedProject.clientData.contact.phone}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucun reste à charge à collecter pour cette intervention.</p>
                  )}
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

      {associatedProject?.id && (
        <EditProjectProductModal
          isOpen={isEditProductModalOpen}
          onClose={() => setIsEditProductModalOpen(false)}
          projectId={associatedProject.id}
          currentProducts={associatedProject.products || []}
        />
      )}
    </>
  );
};
