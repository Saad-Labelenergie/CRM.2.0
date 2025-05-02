import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Check,
  Building2,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { PlanningStep } from '../../clients/components/steps/planning-step';
import { Toast } from '../../ui/toast';
import { useScheduling } from '../../../lib/scheduling/scheduling-context';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

interface Team {
  id: string;
  name: string;
  color: string;
}

interface UpdateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: any) => void;
  initialData: any;
  appointment: any;
  teams: Team[]; // Add this line to include the teams property
}

type Step = 'contact' | 'address' | 'products' | 'planning';

export function UpdateClientModal({ isOpen, onClose, onSave, initialData, teams }: UpdateClientModalProps) {
  const [step, setStep] = useState<Step>('planning'); // Start directly at the 'planning' step
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    address: {
      street: '',
      city: '',
      postalCode: '',
      country: 'France',
    },
    selectedProducts: [] as any[],
    installationDate: '',
    selectedTeam: null as any
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const { updateProject } = useScheduling();

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

  // Dans la fonction UpdateClientModal, nous devons nous assurer que initialData est correctement passé
  
  useEffect(() => {
    if (!isOpen || !initialData || products.length === 0 || isInitialized) return;
  
    console.log("Données initiales:", initialData); // Ajout d'un log pour vérifier les données initiales
    
    const normalizedProducts = (initialData.productsIds || []).map((pid: string) => {
      const match = products.find(p => p.id === pid);
      return match || null;
    }).filter(Boolean);
  
    setFormData({
      address: initialData.address || {},
      selectedProducts: normalizedProducts,
      installationDate: initialData.installationDate || '',
      selectedTeam: initialData.team || null
    });
  
    setIsInitialized(true);
  }, [isOpen, initialData, products, isInitialized]);
  
  const handleClose = () => {
    setIsInitialized(false);
    // Reset form data when closing
    setFormData({
      address: {
        street: '',
        city: '',
        postalCode: '',
        country: 'France',
      },
      selectedProducts: [] as any[],
      installationDate: '',
      selectedTeam: null as any
    });
    onClose();
  }
  
  const handleFieldUpdate = (field: string, value: any) => {
    const parts = field.split('.');
    setFormData(prev => {
      const newData = { ...prev };
      let current: any = newData;
      for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
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
      console.log("Données du formulaire avant soumission:", formData);
      
      // S'assurer que la date est au bon format
      const formattedDate = formData.installationDate;
      
      const updatedData = {
        id: initialData?.id,
        installationDate: formattedDate,
        date: formattedDate, // Ajouter ce champ
        team: formData.selectedTeam ? {
          id: formData.selectedTeam.id,
          name: formData.selectedTeam.name,
          color: formData.selectedTeam.color
        } : null
      };
  
      console.log("Données finales envoyées à onSave:", updatedData);
      await onSave(updatedData);
      setShowSuccessToast(true);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du client:', error);
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
              onClick={handleClose}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-card p-6 rounded-xl shadow-xl z-50 border border-border/50 mx-4 max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-primary" />
                  Modifier le rendez-vous
                </h2>
                <button onClick={handleClose} className="p-2 hover:bg-accent rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Display initial date information */}
              {initialData && initialData.installationDate && (
                <div className="mb-4 p-3 bg-muted rounded-lg border border-border">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date actuelle du rendez-vous:</p>
                      <p className="font-medium">
                        {new Date(initialData.installationDate).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  {initialData.team && (
                    <div className="flex items-center mt-2">
                      <Building2 className="w-5 h-5 mr-2 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Équipe assignée:</p>
                        <div className="flex items-center">
                          <span 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: initialData.team.color || '#888' }}
                          />
                          <p className="font-medium">{initialData.team.name}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="overflow-y-auto flex-1">
                {step === 'planning' && (
                  <PlanningStep
                    selectedProducts={formData.selectedProducts}
                    selectedTeam={formData.selectedTeam}
                    installationDate={formData.installationDate}
                    initialDate={initialData?.date || initialData?.installationDate} // Utilisons date ou installationDate
                    errors={errors}
                    onTeamSelect={(team) => handleFieldUpdate('selectedTeam', team)}
                    onDateChange={(date) => handleFieldUpdate('installationDate', date)}
                  />
                )}
              </div>

              <div className="flex justify-between space-x-2 pt-6">
               
                
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