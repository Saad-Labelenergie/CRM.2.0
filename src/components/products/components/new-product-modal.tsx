import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFournisseurs } from '../../../lib/hooks/useFournisseurs';
import { 
  X, 
  Check, 
  Package,
  AlertCircle,
  Tag,
  Building2,
  FileText,
  Gauge,
  Euro
} from 'lucide-react';
import { useCategories } from '../../../lib/hooks/useCategories';

interface NewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: any) => void;
}

export function NewProductModal({ isOpen, onClose, onSave }: NewProductModalProps) {
  const { data: categories } = useCategories();
  const { data: suppliers  } = useFournisseurs();
  const [step, setStep] = useState<'general' | 'supplier' | 'price'>('general');
  const [formData, setFormData] = useState({
    name: '',
    reference: '',
    brand: '',
    category: '',
    supplier: {
      id: '',
      name: '',
      contact: '',
      email: ''
    },
    specifications: {
      puissance: '',
      surface: '',
      niveau_sonore: '',
      efficacite: '',
      refrigerant: '',
      connexions: '',
      contenu: '',
      longueur: '',
      diametre: ''
    },
    price: {
      ht: '',
      tva: 20,
      ttc: ''
    }
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 'general':
        if (!formData.name) newErrors.name = 'Le nom est requis';
        if (!formData.reference) newErrors.reference = 'La référence est requise';
        if (!formData.brand) newErrors.brand = 'La marque est requise';
        if (!formData.category) newErrors.category = 'La catégorie est requise';
        break;
      case 'supplier':
        if (!formData.supplier) newErrors.supplier = 'Le fournisseur est requis';
        break;
      case 'price':
        if (!formData.price.ht) newErrors.price = 'Le prix HT est requis';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      switch (step) {
        case 'general':
          setStep('supplier');
          break;
        case 'supplier':
          setStep('price');
          break;
        case 'price':
          handleSubmit();
          break;
      }
    }
  };

  const handleBack = () => {
    switch (step) {
      case 'supplier':
        setStep('general');
        break;
      case 'price':
        setStep('supplier');
        break;
    }
  };

  const handleSubmit = () => {
    if (validateStep()) {
      onSave(formData);
      onClose();
    }
  };

  const updatePriceHT = (value: string) => {
    const priceHT = parseFloat(value) || 0;
    const tva = formData.price.tva;
    const priceTTC = priceHT * (1 + tva / 100);

    setFormData({
      ...formData,
      price: {
        ...formData.price,
        ht: value,
        ttc: priceTTC.toFixed(2)
      }
    });
  };

  const renderGeneralStep = () => (
    <div className="space-y-6">
      <div className="bg-accent/50 rounded-lg p-4 space-y-4">
        <h3 className="font-medium flex items-center">
          <Tag className="w-4 h-4 mr-2" />
          Informations générales
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Nom *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Nom du produit"
            />
            {errors.name && (
              <p className="text-destructive text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Référence *
            </label>
            <input
              type="text"
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="REF-001"
            />
            {errors.reference && (
              <p className="text-destructive text-sm mt-1">{errors.reference}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Marque *
            </label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Nom de la marque"
            />
            {errors.brand && (
              <p className="text-destructive text-sm mt-1">{errors.brand}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Catégorie *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Sélectionner une catégorie</option>
              {categories?.map(category => (
                <option key={category.id} value={category.name}>{category.name}</option>
              ))}
            </select>
            {errors.category && (
              <p className="text-destructive text-sm mt-1">{errors.category}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSupplierStep = () => (
    <div className="space-y-6">
      <div className="bg-accent/50 rounded-lg p-4 space-y-4">
        <h3 className="font-medium flex items-center">
          <Building2 className="w-4 h-4 mr-2" />
          Fournisseur
        </h3>
        <div>
        <select
  value={formData.supplier.name}
  onChange={(e) => {
    const selected = suppliers.find(f => f.name === e.target.value);
    if (selected) {
      setFormData({
        ...formData,
        supplier: {
          id: selected.id,
          name: selected.name,
          contact: selected.contact || '',
          email: selected.email || ''
        }
      });
    }
  }}
  className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
>
  <option value="">Sélectionner un fournisseur</option>
  {suppliers?.map((supplier) => (
    <option key={supplier.id} value={supplier.name}>
      {supplier.name}
    </option>
  ))}
</select>


          {errors.supplier && (
            <p className="text-destructive text-sm mt-1">{errors.supplier}</p>
          )}
        </div>
      </div>
      </div>
  );

  const renderPriceStep = () => (
    <div className="space-y-6">
      <div className="bg-accent/50 rounded-lg p-4 space-y-4">
        <h3 className="font-medium flex items-center">
          <Euro className="w-4 h-4 mr-2" />
          Prix
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Prix HT *
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.price.ht}
                onChange={(e) => updatePriceHT(e.target.value)}
                className="w-full pl-3 pr-8 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0.00"
                step="0.01"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                €
              </span>
            </div>
            {errors.price && (
              <p className="text-destructive text-sm mt-1">{errors.price}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              TVA
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.price.tva}
                readOnly
                className="w-full pl-3 pr-8 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                %
              </span>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Prix TTC
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.price.ttc}
                readOnly
                className="w-full pl-3 pr-8 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                €
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
            className="relative w-full max-w-2xl bg-card p-6 rounded-xl shadow-xl z-50 border border-border/50 mx-4 max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center">
                <Package className="w-5 h-5 mr-2 text-primary" />
                Nouveau Produit
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step === 'general' ? 'bg-primary text-primary-foreground' : 'bg-accent'
                  }`}>
                    1
                  </div>
                  <div className={`h-1 w-16 ${
                    step === 'general' ? 'bg-primary' : 'bg-accent'
                  }`} />
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step === 'supplier' ? 'bg-primary text-primary-foreground' : 'bg-accent'
                  }`}>
                    2
                  </div>
                  <div className={`h-1 w-16 ${
                    step === 'price' ? 'bg-primary' : 'bg-accent'
                  }`} />
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step === 'price' ? 'bg-primary text-primary-foreground' : 'bg-accent'
                  }`}>
                    3
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {step === 'general' && 'Informations générales'}
                  {step === 'supplier' && 'Fournisseur et spécifications'}
                  {step === 'price' && 'Prix'}
                </div>
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              {step === 'general' && renderGeneralStep()}
              {step === 'supplier' && renderSupplierStep()}
              {step === 'price' && renderPriceStep()}
            </div>

            <div className="flex justify-between space-x-2 pt-6">
              {step !== 'general' && (
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
                {step === 'price' ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Créer le produit
                  </>
                ) : (
                  'Suivant'
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}