import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Check,
  Plus,
  Building2,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { ContactStep } from './steps/contact-step';
import { AddressStep } from './steps/address-step';
import { ProductsStep } from './steps/products-step';
import { PlanningStep } from './steps/planning-step';
import { StepIndicator } from './steps/step-indicator';
import { Toast } from '../../ui/toast';
import { useScheduling } from '../../../lib/scheduling/scheduling-context';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../../lib/firebase'; // adapte le chemin selon ta structure

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: any) => void;
}

type Step = 'contact' | 'address' | 'products' | 'planning';

export function NewClientModal({ isOpen, onClose, onSave }: NewClientModalProps) {
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
  const { addProject, addAppointment } = useScheduling();

  // 🔄 Charger les produits depuis Firebase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const fetchedProducts = querySnapshot.docs.map(doc => {
          console.log('Product data:', doc.data()); // Ajoutez ce log pour déboguer
          return {
            id: doc.id,
            ...doc.data(),
            installationTime: parseInt(doc.data().installationTime) || 0
          };
        });
        console.log('Fetched products:', fetchedProducts); // Et celui-ci
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Erreur lors du chargement des produits :', error);
      }
    };

    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  const handleFieldUpdate = (field: string, value: any) => {
    const fields = field.split('.');
    setFormData(prev => {
      const newData = { ...prev };
      let current: any = newData;
      for (let i = 0; i < fields.length - 1; i++) {
        current = current[fields[i]];
      }
      current[fields[fields.length - 1]] = value;
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

    switch (step) {
      case 'contact':
        if (!formData.contact.firstName) newErrors['contact.firstName'] = 'Le prénom est requis';
        if (!formData.contact.lastName) newErrors['contact.lastName'] = 'Le nom est requis';
        if (!formData.contact.email) {
          newErrors['contact.email'] = 'L\'email est requis';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact.email)) {
          newErrors['contact.email'] = 'L\'email n\'est pas valide';
        }
        if (!formData.contact.phone) newErrors['contact.phone'] = 'Le téléphone est requis';
        if (formData.contact.secondaryEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact.secondaryEmail)) {
          newErrors['contact.secondaryEmail'] = 'L\'email secondaire n\'est pas valide';
        }
        break;

      case 'address':
        if (!formData.address.street) newErrors['address.street'] = 'L\'adresse est requise';
        if (!formData.address.city) newErrors['address.city'] = 'La ville est requise';
        if (!formData.address.postalCode) newErrors['address.postalCode'] = 'Le code postal est requis';
        break;

      case 'products':
        if (formData.selectedProducts.length === 0) {
          newErrors['products'] = 'Veuillez sélectionner au moins un produit';
        }
        break;

      case 'planning':
        if (!formData.installationDate) {
          newErrors['installationDate'] = 'Veuillez sélectionner une date d\'installation';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
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
    }
  };

  const handleBack = () => {
    switch (step) {
      case 'address':
        setStep('contact');
        break;
      case 'products':
        setStep('address');
        break;
      case 'planning':
        setStep('products');
        break;
    }
  };

  const handleSubmit = async () => {
    if (validateStep()) {
      try {
        const clientData = {
          id: Math.random().toString(36).substr(2, 9),
          name: `${formData.contact.firstName} ${formData.contact.lastName}`,
          contact: formData.contact,
          address: formData.address,
          tag: formData.tag,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
          // Add team information
          team: formData.selectedTeam ? {
            id: formData.selectedTeam._id,
            name: formData.selectedTeam.name,
            color: formData.selectedTeam.color
          } : null,
          // Add selected products IDs
          productsIds: formData.selectedProducts.map(p => p.id)
        };
        onSave(clientData);

        const projectId = Math.random().toString(36).substr(2, 9);
        const projectName = formData.selectedProducts.map(p => p.name).join(", ");

        const totalInstallationTime = formData.selectedProducts.reduce(
          (acc, p) => acc + (parseInt(p.installationTime) || 0),
          0
        );

        const appointmentId = Math.random().toString(36).substr(2, 9);
        const appointment = {
          id: appointmentId,
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
          type: "installation" as "installation" | "maintenance" | "urgence",
          duration: `${Math.ceil(totalInstallationTime / 60)}h`,
          status: formData.selectedTeam ? 'attribue' as const : 'non_attribue' as const,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const project = {
          id: projectId,
          name: projectName,
          client: {
            id: parseInt(clientData.id),
            name: clientData.name
          },
          status: (formData.selectedTeam ? 'attribue' : 'en_attente') as 'en_attente' | 'charger' | 'en_cours' | 'terminer',
          startDate: formData.installationDate,
          type: formData.selectedProducts[0]?.type?.toUpperCase() || 'STANDARD',
          team: formData.selectedTeam?.name || null,
          appointments: [appointment]
        };

        await addProject(project);
        await addAppointment(appointment);

        setShowSuccessToast(true);
        onClose();
      } catch (error) {
        console.error('Erreur lors de la création du dossier:', error);
      }
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
                  Nouveau Dossier
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <StepIndicator currentStep={step} />

              <div className="overflow-y-auto flex-1">
                {step === 'contact' && (
                  <ContactStep
                    formData={formData}
                    errors={errors}
                    onUpdate={handleFieldUpdate}
                  />
                )}
                {step === 'address' && (
                  <AddressStep
                    formData={formData}
                    errors={errors}
                    onUpdate={handleFieldUpdate}
                  />
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
                  onClick={handleNext}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center ml-auto"
                >
                  {step === 'planning' ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Créer le dossier
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
        message="Le dossier a été créé avec succès ! Le rendez-vous et le projet ont été créés."
        isVisible={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
      />
    </>
  );
}
