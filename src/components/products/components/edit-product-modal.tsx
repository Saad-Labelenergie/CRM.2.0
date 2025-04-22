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
  Euro,
  Clock
} from 'lucide-react';
import { useCategories } from '../../../lib/hooks/useCategories';

// Constantes pour le calcul du temps d'installation
const WORKING_HOURS = {
  start: 8, // 8h00
  end: 18,  // 18h00
  hoursPerDay: 10 // 10 heures par jour
};

const INSTALLATION_OPTIONS = [
  { value: 240, label: '½ journée (4h)' },
  { value: 480, label: '1 journée (8h)' },
  { value: 720, label: '1 journée ½ (12h)' },
  { value: 960, label: '2 journées (16h)' }
];

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: any) => void;
  product: {
    id: string;
    name: string;
    reference: string;
    brand: string;
    model: string;
    category: string;
    supplier: {
      name: string;
      contact: string;
      email: string;
    };
    purchasePrice: number;
    stock: {
      current: number;
      minimum: number;
      optimal: number;
    };
    certifications: string[];
    specifications: {
      installationTime?: number;
      [key: string]: any;
    };
  };
}

export function EditProductModal({ isOpen, onClose, onSave, product }: EditProductModalProps) {
  const { data: categories } = useCategories();
  const { data: fournisseurs } = useFournisseurs();
  const [formData, setFormData] = useState({
    ...product,
    supplier: {
      name: product.supplier?.name || '',
      contact: product.supplier?.contact || '',
      email: product.supplier?.email || ''
    },
    stock: {
      current: product.stock?.current || 0,
      minimum: product.stock?.minimum || 0,
      optimal: product.stock?.optimal || 0
    },
    certifications: product.certifications || [],
    specifications: {
      ...product.specifications,
      installationTime: product.specifications?.installationTime || 240 // ½ journée par défaut
    }
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...product,
        supplier: {
          name: product.supplier?.name || '',
          contact: product.supplier?.contact || '',
          email: product.supplier?.email || ''
        },
        stock: {
          current: product.stock?.current || 0,
          minimum: product.stock?.minimum || 0,
          optimal: product.stock?.optimal || 0
        },
        certifications: product.certifications || [],
        specifications: {
          ...product.specifications,
          installationTime: product.specifications?.installationTime || 240
        }
      });
    }
  }, [isOpen]);
  

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newCertification, setNewCertification] = useState('');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'Le nom est requis';
    if (!formData.reference) newErrors.reference = 'La référence est requise';
    if (!formData.brand) newErrors.brand = 'La marque est requise';
    if (!formData.category) newErrors.category = 'La catégorie est requise';
    if (!formData.supplier.name) newErrors['supplier.name'] = 'Le nom du fournisseur est requis';
    if (!formData.purchasePrice) newErrors.purchasePrice = 'Le prix d\'achat est requis';
    if (!formData.specifications.installationTime) {
      newErrors.installationTime = 'Le temps d\'installation est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave({
        ...formData,
        id: product.id,
        updatedAt: new Date()
      });
    }
  };

  const handleAddCertification = () => {
    if (newCertification && !formData.certifications.includes(newCertification)) {
      setFormData({
        ...formData,
        certifications: [...formData.certifications, newCertification]
      });
      setNewCertification('');
    }
  };

  const handleRemoveCertification = (cert: string) => {
    setFormData({
      ...formData,
      certifications: formData.certifications.filter(c => c !== cert)
    });
  };

  const handleSupplierChange = (field: keyof typeof formData.supplier, value: string) => {
    setFormData({
      ...formData,
      supplier: {
        ...formData.supplier,
        [field]: value
      }
    });
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
            className="relative w-full max-w-4xl bg-card p-6 rounded-xl shadow-xl z-50 border border-border/50 mx-4 max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center">
                <Package className="w-5 h-5 mr-2 text-primary" />
                Modifier le produit
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
              <div className="space-y-6">
                {/* Informations générales */}
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
                      />
                      {errors.brand && (
                        <p className="text-destructive text-sm mt-1">{errors.brand}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Modèle
                      </label>
                      <input
                        type="text"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
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

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Prix d'achat *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.purchasePrice}
                        onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      {errors.purchasePrice && (
                        <p className="text-destructive text-sm mt-1">{errors.purchasePrice}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Installation */}
                <div className="bg-accent/50 rounded-lg p-4 space-y-4">
                  <h3 className="font-medium flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Installation
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Temps d'installation *
                    </label>
                    <div className="flex items-center space-x-4">
                      <select
                        value={formData.specifications.installationTime}
                        onChange={(e) => setFormData({
                          ...formData,
                          specifications: {
                            ...formData.specifications,
                            installationTime: parseInt(e.target.value)
                          }
                        })}
                        className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {INSTALLATION_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Basé sur une journée de travail de {WORKING_HOURS.start}h00 à {WORKING_HOURS.end}h00
                    </p>
                    {errors.installationTime && (
                      <p className="text-destructive text-sm mt-1">{errors.installationTime}</p>
                    )}
                  </div>
                </div>

                {/* Fournisseur */}
                <div>
  <label className="block text-sm font-medium text-muted-foreground mb-1">
    Fournisseur *
  </label>
  <select
    value={formData.supplier.name}
    onChange={(e) => {
      const selected = fournisseurs?.find(f => f.name === e.target.value);
      if (selected) {
        setFormData({
          ...formData,
          supplier: {
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
    {fournisseurs?.map((f) => (
      <option key={f.id} value={f.name}>{f.name}</option>
    ))}
  </select>
  {errors['supplier.name'] && (
    <p className="text-destructive text-sm mt-1">{errors['supplier.name']}</p>
  )}
</div>

                {/* Stock */}
                <div className="bg-accent/50 rounded-lg p-4 space-y-4">
                  <h3 className="font-medium flex items-center">
                    <Package className="w-4 h-4 mr-2" />
                    Gestion du stock
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Stock actuel
                      </label>
                      <input
                        type="number"
                        value={formData.stock.current}
                        onChange={(e) => setFormData({
                          ...formData,
                          stock: { ...formData.stock, current: parseInt(e.target.value) }
                        })}
                        className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Stock minimum
                      </label>
                      <input
                        type="number"
                        value={formData.stock.minimum}
                        onChange={(e) => setFormData({
                          ...formData,
                          stock: { ...formData.stock, minimum: parseInt(e.target.value) }
                        })}
                        className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Stock optimal
                      </label>
                      <input
                        type="number"
                        value={formData.stock.optimal}
                        onChange={(e) => setFormData({
                          ...formData,
                          stock: { ...formData.stock, optimal: parseInt(e.target.value) }
                        })}
                        className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Certifications */}
                <div className="bg-accent/50 rounded-lg p-4 space-y-4">
                  <h3 className="font-medium flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Certifications
                  </h3>
                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newCertification}
                        onChange={(e) => setNewCertification(e.target.value)}
                        className="flex-1 px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Nouvelle certification..."
                      />
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={handleAddCertification}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Ajouter
                      </motion.button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.certifications.map((cert, index) => (
                        <div
                          key={index}
                          className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center group"
                        >
                          {cert}
                          <button
                            type="button"
                            onClick={() => handleRemoveCertification(cert)}
                            className="ml-2 p-1 rounded-full hover:bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-accent hover:bg-accent/80 transition-colors"
                >
                  Annuler
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Enregistrer
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}