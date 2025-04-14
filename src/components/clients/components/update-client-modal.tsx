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
    selectedTeam: null as any
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
  
    setFormData({
      contact: initialData.contact || {},
      address: initialData.address || {},
      tag: initialData.tag || null,
      selectedProducts: normalizedProducts,
      installationDate: initialData.installationDate || '',
      selectedTeam: initialData.team || null
    });
  
    setIsInitialized(true); // 💥 empêchera toute réinitialisation future
  }, [isOpen, initialData, products, isInitialized]);
  
  const handleClose = () => {
    setIsInitialized(false);
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
    if (validateStep()) {
      setStep(prev => ({
        contact: 'address',
        address: 'products',
        products: 'planning',
        planning: 'planning'
      }[prev]));
    }
  };

  const handleBack = () => {
    setStep(prev => ({
      planning: 'products',
      products: 'address',
      address: 'contact',
      contact: 'contact'
    }[prev]));
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
      };

      onSave(clientData);

      if (initialData.projectId) {
        const projectName = formData.selectedProducts.map(p => p.name).join(', ');

        const appointment = {
          id: initialData.appointmentId,
          title: projectName,
          client: {
            id: parseInt(clientData.id),
            name: clientData.name,
            postalCode: formData.address.postalCode
          },
          date: formData.installationDate,
          time: "09:00",
          team: formData.selectedTeam?.name || null,
          teamColor: formData.selectedTeam?.color || null,
          type: "installation",
          duration: `${Math.ceil(formData.selectedProducts.reduce((acc, p) => acc + p.installationTime, 0) / 60)}h`,
          status: formData.selectedTeam ? 'attribue' : 'non_attribue'
        };

        const project = {
          id: initialData.projectId,
          name: projectName,
          client: {
            id: parseInt(clientData.id),
            name: clientData.name
          },
          status: formData.selectedTeam ? 'attribue' : 'en_attente',
          startDate: formData.installationDate,
          type: formData.selectedProducts[0]?.type?.toUpperCase() || '',
          team: formData.selectedTeam?.name || null,
          appointments: [appointment],
          products: formData.selectedProducts
        };

        await updateProject(project);
        await updateAppointment(appointment);
      }

      setShowSuccessToast(true);
      onClose();
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
