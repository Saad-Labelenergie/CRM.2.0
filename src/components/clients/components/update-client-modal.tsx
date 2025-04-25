import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Check,
  Building2,
  ArrowRight
} from 'lucide-react';
import { ContactStep } from './steps/contact-step';
import { AddressStep } from './steps/address-step';
import { ProductsStep } from './steps/products-step';
import { PlanningStep } from './steps/planning-step';
import { StepIndicator } from './steps/step-indicator';
import { Toast } from '../../ui/toast';
import { useScheduling } from '../../../lib/scheduling/scheduling-context';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

interface UpdateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: any) => void;
  initialData: any;
}

type Step = 'contact' | 'address' | 'products' | 'planning';

export function UpdateClientModal({ isOpen, onClose, onSave, initialData }: UpdateClientModalProps) {
  const [step, setStep] = useState<Step>('contact');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    contact: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      secondaryEmail: '',
      secondaryPhone: '',
    },
    address: {
      street: '',
      city: '',
      postalCode: '',
      country: 'France',
    },
    tag: null as 'MPR' | 'Financement' | null,
    selectedProducts: [] as any[],
    installationDate: '',
    selectedTeam: null as any,
    installationDurationInDays: 0 // Ajout de la propriété pour la durée d'installation
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const { updateProject, updateAppointment } = useScheduling();

  // 🔄 Charger les produits
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const fetched = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            specifications: data.specifications || {}
          };
        });        setProducts(fetched);
      } catch (error) {
        console.error('Erreur chargement produits :', error);
      }
    };

    if (isOpen) fetchProducts();
  }, [isOpen]);

  // 📦 Pré-remplir form avec données client et produits associés
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isOpen || !initialData || products.length === 0 || isInitialized) return;
  
    const normalizedProducts = (initialData.productsIds || []).map((pid: string) => {
      const match = products.find(p => p.id === pid);
      return match || null;
    }).filter(Boolean);
  
    // Calculate installation duration based on products
    const totalInstallationTime = normalizedProducts.reduce(
      (acc: number, p: any) => {
        let installTime = 0;
        
        if (p.specifications && p.specifications.installationTime !== undefined) {
          installTime = parseInt(p.specifications.installationTime) || 0;
        } else if (p.installationTime !== undefined) {
          installTime = parseInt(p.installationTime) || 0;
        }
        
        return acc + installTime;
      },
      0
    );

    // Calculate duration in days
    const durationInHours = Math.max(1, Math.ceil(totalInstallationTime / 60));
    const durationInDays = Math.min(2, durationInHours / 8);
  
    setFormData({
      contact: initialData.contact || {},
      address: initialData.address || {},
      tag: initialData.tag || null,
      selectedProducts: normalizedProducts,
      installationDate: initialData.installationDate || '',
      selectedTeam: initialData.team || null,
      installationDurationInDays: durationInDays // Add the missing property
    });
  
    setIsInitialized(true);
  }, [isOpen, initialData, products, isInitialized]);
  
  const handleClose = () => {
    setIsInitialized(false);
    onClose();
  }
  
  // Modifier la fonction handleFieldUpdate pour calculer la durée d'installation
  const handleFieldUpdate = (field: string, value: any) => {
    const parts = field.split('.');
    setFormData(prev => {
      const newData = { ...prev };
      let current: any = newData;
      for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      
      // Si nous mettons à jour les produits sélectionnés, calculer la durée d'installation
      if (field === 'selectedProducts') {
        // Calcul du temps d'installation total
        const totalInstallationTime = value.reduce(
          (acc: number, p: any) => {
            let installTime = 0;
            
            if (p.specifications && p.specifications.installationTime !== undefined) {
              installTime = parseInt(p.specifications.installationTime) || 0;
            } else if (p.installationTime !== undefined) {
              installTime = parseInt(p.installationTime) || 0;
            }
            
            return acc + installTime;
          },
          0
        );
  
        // Calculer la durée en heures et jours
        const durationInHours = Math.max(1, Math.ceil(totalInstallationTime / 60));
        // Limiter la durée à maximum 2 jours
        const durationInDays = Math.min(2, durationInHours / 8); // 8 heures par jour de travail
        
        console.log(`Mise à jour des produits: Durée d'installation calculée: ${durationInDays.toFixed(1)} jours`);
        
        // Mettre à jour la durée d'installation dans l'état
        newData.installationDurationInDays = durationInDays;
        
        // Si un vendredi est déjà sélectionné et que la durée est > 1 jour, réinitialiser la date
        if (newData.installationDate) {
          const selectedDate = new Date(newData.installationDate);
          if (selectedDate.getDay() === 5 && durationInDays > 1) {
            console.log("Réinitialisation de la date car c'est un vendredi et l'installation prend plus d'un jour");
            newData.installationDate = '';
          }
        }
      }
      
      return newData;
    });

    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (step === 'contact') {
      if (!formData.contact.firstName) newErrors['contact.firstName'] = 'Prénom requis';
      if (!formData.contact.lastName) newErrors['contact.lastName'] = 'Nom requis';
      if (!formData.contact.email) newErrors['contact.email'] = 'Email requis';
      else if (!emailRegex.test(formData.contact.email)) newErrors['contact.email'] = 'Email invalide';
      if (!formData.contact.phone) newErrors['contact.phone'] = 'Téléphone requis';
      if (formData.contact.secondaryEmail && !emailRegex.test(formData.contact.secondaryEmail)) {
        newErrors['contact.secondaryEmail'] = 'Email secondaire invalide';
      }
    }

    if (step === 'address') {
      if (!formData.address.street) newErrors['address.street'] = 'Rue requise';
      if (!formData.address.city) newErrors['address.city'] = 'Ville requise';
      if (!formData.address.postalCode) newErrors['address.postalCode'] = 'Code postal requis';
    }

    if (step === 'products') {
      if (formData.selectedProducts.length === 0) {
        newErrors['products'] = 'Sélectionnez au moins un produit';
      }
    }

    if (step === 'planning' && !formData.installationDate) {
      newErrors['installationDate'] = 'Date requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    
    switch (step) {
      case 'contact':
        setStep('address');
        break;
      case 'address':
        setStep('products');
        break;
      case 'products':
        setStep('planning');
        break;
      case 'planning':
        handleSubmit();
        break;
    }
  };

  const handleBack = () => {
    switch (step) {
      case 'planning':
        setStep('products');
        break;
      case 'products':
        setStep('address');
        break;
      case 'address':
        setStep('contact');
        break;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    try {
      const clientData = {
        id: initialData.id,
        name: `${formData.contact.firstName} ${formData.contact.lastName}`,
        contact: formData.contact,
        address: formData.address,
        tag: formData.tag,
        productsIds: formData.selectedProducts.map(p => p.id),
        // Add team information
        team: formData.selectedTeam ? {
          id: formData.selectedTeam._id || formData.selectedTeam.id, // Ajout d'une vérification pour l'ID
          name: formData.selectedTeam.name,
          color: formData.selectedTeam.color
        } : null,
        updatedAt: new Date()
      };
  
      // Appeler onSave pour mettre à jour le client
      await onSave(clientData);
  
      if (initialData.projectId) {
        // Calcul du temps d'installation total avec plus de vérifications
        const totalInstallationTime = formData.selectedProducts.reduce(
          (acc, p) => {
            // Vérifier où se trouve le temps d'installation dans le produit
            let installTime = 0;
            
            if (p.specifications && p.specifications.installationTime !== undefined) {
              installTime = parseInt(p.specifications.installationTime) || 0;
            } else if (p.installationTime !== undefined) {
              installTime = parseInt(p.installationTime) || 0;
            }
            
            console.log(`Produit: ${p.name}, Temps d'installation: ${installTime} minutes (source: ${p.specifications ? 'specifications' : 'direct'})`);
            return acc + installTime;
          },
          0
        );
  
        console.log(`Temps total d'installation en minutes: ${totalInstallationTime}`);
  
        // Calculer la durée en heures et jours
        const durationInHours = Math.max(1, Math.ceil(totalInstallationTime / 60));
        // Limiter la durée à maximum 2 jours
        const durationInDays = Math.min(2, durationInHours / 8); // 8 heures par jour de travail
  
        console.log(`Durée en heures: ${durationInHours}h, Durée en jours: ${durationInDays.toFixed(1)} jours (plafonnée à 2 jours)`);
  
        let durationText;
        if (durationInDays >= 1) {
          // Si c'est plus d'un jour, afficher en jours (maximum 2)
          durationText = `${durationInDays.toFixed(1)} jours`;
        } else {
          // Sinon afficher en heures
          durationText = `${durationInHours}h`;
        }
  
        console.log(`Texte de durée formaté: ${durationText}`);

        const projectName = formData.selectedProducts.map(p => p.name).join(', ');
        
        // Calculer le nombre de jours entiers pour l'affichage multi-jours
        const daysSpan = Math.ceil(durationInDays);
        
        // Créer un tableau pour stocker tous les rendez-vous (un par jour)
        const allAppointments = [];
        
        // Vérifier si nous avons déjà des rendez-vous existants
        const existingAppointments = initialData.appointments || [];
        const mainAppointmentId = existingAppointments.length > 0 ? 
          existingAppointments[0].id : 
          Math.random().toString(36).substr(2, 9);
        
        // Créer ou mettre à jour le rendez-vous principal
        const mainAppointment = {
          id: mainAppointmentId,
          title: projectName,
          // Au lieu d'un objet client imbriqué, utilisez des propriétés au niveau racine
          id2: parseInt(clientData.id),
          name: clientData.name,
          postalCode: formData.address.postalCode,
          date: formData.installationDate,
          time: "09:00",
          team: formData.selectedTeam?.name || null,
          teamColor: formData.selectedTeam?.color || null,
          type: "installation" as "installation" | "maintenance" | "urgence",
          duration: durationText,
          installationTime: totalInstallationTime,
          daysSpan: daysSpan,
          isMultiDay: daysSpan > 1,
          isFirstDay: true,
          isLastDay: daysSpan === 1,
          status: formData.selectedTeam ? 'attribue' as const : 'non_attribue' as const,
          updatedAt: new Date(),
          parentId: null
        };
        
        allAppointments.push(mainAppointment);
        if (daysSpan > 1) {
          
          for (let i = 1; i < daysSpan; i++) {
            // Calculer la date du jour suivant
            const nextDate = new Date(formData.installationDate);
            nextDate.setDate(nextDate.getDate() + i);
            
            // Chercher un rendez-vous existant pour ce jour
            const existingNextAppointment = existingAppointments.find((a: { date: string; parentId: string | null }) => 
              a.date === nextDate.toISOString().split('T')[0] && a.parentId === mainAppointmentId
            );
            
            // Créer un ID unique pour ce rendez-vous ou utiliser l'existant
            const nextAppointmentId = existingNextAppointment ? 
              existingNextAppointment.id : 
              Math.random().toString(36).substr(2, 9);
            
            // Créer le rendez-vous pour ce jour
            const nextAppointment = {
              id: nextAppointmentId,
              title: projectName,
              // Au lieu d'un objet client imbriqué, utilisez des propriétés au niveau racine
              id2: parseInt(clientData.id),
              name: clientData.name,
              postalCode: formData.address.postalCode,
              date: nextDate.toISOString().split('T')[0], // Format YYYY-MM-DD
              time: "09:00",
              team: formData.selectedTeam?.name || null,
              teamColor: formData.selectedTeam?.color || null,
              type: "installation" as "installation" | "maintenance" | "urgence",
              duration: durationText,
              installationTime: totalInstallationTime,
              daysSpan: daysSpan,
              isMultiDay: true,
              isFirstDay: false,
              isLastDay: i === daysSpan - 1, // Vrai si c'est le dernier jour
              status: formData.selectedTeam ? 'attribue' as const : 'non_attribue' as const,
              updatedAt: new Date(),
              parentId: mainAppointmentId // Référence au rendez-vous principal
            };
            
            allAppointments.push(nextAppointment);
          }
        }

        const project = {
          id: initialData.projectId,
          name: projectName,
          client: {
            id: parseInt(clientData.id), // Garder id ici car c'est la structure attendue pour les projets
            name: clientData.name
          },
          status: formData.selectedTeam ? 'attribue' as const : 'en_attente' as const,
          startDate: formData.installationDate,
          type: formData.selectedProducts[0]?.type?.toUpperCase() || 'STANDARD',
          team: formData.selectedTeam?.name || null,
          appointments: allAppointments,
          products: formData.selectedProducts,
          updatedAt: new Date()
        };

        // Mettre à jour le projet avec tous les rendez-vous
        await updateProject(project.id, {
          name: project.name,
          client: project.client,
          status: project.status as "en_attente" | "charger" | "en_cours" | "terminer",
          startDate: project.startDate,
          type: project.type,
          team: formData.selectedTeam?.name || null,
          appointments: allAppointments.map(apt => ({
            ...apt,
            type: apt.type as "installation" | "maintenance" | "urgence",
            status: apt.status as "attribue" | "non_attribue" | "termine",
          }))
        });
        
        // Mettre à jour chaque rendez-vous individuellement dans la collection appointments
        for (const appointment of allAppointments) {
          try {
            console.log(`Mise à jour du rendez-vous ${appointment.id}`, appointment);
            
            // Créer un objet qui correspond exactement à la structure attendue dans Firestore
            const appointmentData = {
              title: appointment.title,
              // Au lieu d'un objet client imbriqué, utilisez des propriétés au niveau racine
              id2: parseInt(clientData.id),
              name: clientData.name,
              postalCode: formData.address.postalCode,
              date: appointment.date,
              time: appointment.time,
              team: appointment.team,
              teamColor: appointment.teamColor,
              type: appointment.type,
              duration: appointment.duration,
              installationTime: appointment.installationTime,
              daysSpan: appointment.daysSpan,
              isMultiDay: appointment.isMultiDay,
              isFirstDay: appointment.isFirstDay,
              isLastDay: appointment.isLastDay,
              status: appointment.status,
              parentId: appointment.parentId,
              updatedAt: new Date()
            };
            
            // Vérifier si le rendez-vous existe déjà
            const appointmentExists = existingAppointments.some((a: { id: string }) => a.id === appointment.id);
            
            console.log(`Mise à jour du rendez-vous ${appointment.id} - Existe: ${appointmentExists}`);
            
            // Utiliser la fonction updateAppointment pour créer ou mettre à jour le rendez-vous
            await updateAppointment(appointment.id, appointmentData);
          } catch (appointmentError) {
            console.error(`Erreur lors de la mise à jour du rendez-vous ${appointment.id}:`, appointmentError);
            console.error('Détails de l\'erreur:', appointmentError);
          }
        }
        setShowSuccessToast(true);
        onClose();
      } else {
        setShowSuccessToast(true);
        onClose();
      }
    } catch (error) {
      console.error('Erreur update client :', error);
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
              className="relative w-full max-w-2xl bg-card p-6 rounded-xl shadow-xl z-50 border border-border/50 mx-4 max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                  <Building2 className="w-5 h-5 mr-2 text-primary" />
                  Modifier Dossier
                </h2>
                <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <StepIndicator currentStep={step} />

              <div className="overflow-y-auto flex-1">
                {step === 'contact' && (
                  <ContactStep formData={formData} errors={errors} onUpdate={handleFieldUpdate} />
                )}
                {step === 'address' && (
                  <AddressStep formData={formData} errors={errors} onUpdate={handleFieldUpdate} />
                )}
                {step === 'products' && (
                  <ProductsStep
                    products={products}
                    selectedProducts={formData.selectedProducts}
                    errors={errors}
                    onProductSelect={(product) => {
                      const isSelected = formData.selectedProducts.some(p => p.id === product.id);
                      handleFieldUpdate(
                        'selectedProducts',
                        isSelected
                          ? formData.selectedProducts.filter(p => p.id !== product.id)
                          : [...formData.selectedProducts, product]
                      );
                    }}
                    
                  />
                )}
                {step === 'planning' && (
                  <PlanningStep
                    selectedProducts={formData.selectedProducts}
                    selectedTeam={formData.selectedTeam}
                    installationDate={formData.installationDate}
                    installationDurationInDays={formData.installationDurationInDays}
                    errors={errors}
                    onTeamSelect={(team) => handleFieldUpdate('selectedTeam', team)}
                    onDateChange={(date) => handleFieldUpdate('installationDate', date)}
                  />
                )}
              </div>

              <div className="flex justify-between space-x-2 pt-6">
                {step !== 'contact' && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleBack}
                    className="px-4 py-2 rounded-lg bg-accent hover:bg-accent/80 transition-colors"
                  >
                    Retour
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={step === 'planning' ? handleSubmit : handleNext}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center ml-auto"
                >
                  {step === 'planning' ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Mettre à jour
                    </>
                  ) : (
                    <>
                      Suivant
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Toast
        message="Le dossier client a bien été mis à jour !"
        isVisible={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
      />
    </>
  ); 
}