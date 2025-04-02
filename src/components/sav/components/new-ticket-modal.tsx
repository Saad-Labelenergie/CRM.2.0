import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Check, 
  Building2, 
  Package, 
  Calendar,
  Users,
  Search,
  AlertCircle,
  Hash
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Installation {
  id: number;
  client: {
    name: string;
    address: string;
  };
  product: {
    name: string;
    reference: string;
  };
  installationDate: string;
  team: {
    name: string;
    id: number;
  };
}

interface NewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ticketData: any) => void;
}

// Données de test - À remplacer par des données réelles
const installations: Installation[] = [
  {
    id: 1,
    client: {
      name: "Entreprise ABC",
      address: "123 Avenue des Champs-Élysées, 75008 Paris"
    },
    product: {
      name: "Climatiseur Mural 9000 BTU",
      reference: "CLIM-MUR-9000"
    },
    installationDate: "2024-02-15",
    team: {
      name: "Équipe A",
      id: 1
    }
  },
  {
    id: 2,
    client: {
      name: "Centre Commercial XYZ",
      address: "45 Rue du Commerce, 69002 Lyon"
    },
    product: {
      name: "Unité Extérieure Multi-Split",
      reference: "UE-MS-18000"
    },
    installationDate: "2024-02-10",
    team: {
      name: "Équipe B",
      id: 2
    }
  }
];

const issueTypes = [
  "Panne technique",
  "Bruit anormal",
  "Performance insuffisante",
  "Fuite",
  "Problème de régulation",
  "Autre"
];

export function NewTicketModal({ isOpen, onClose, onSave }: NewTicketModalProps) {
  const [selectedInstallation, setSelectedInstallation] = useState<Installation | null>(null);
  const [description, setDescription] = useState('');
  const [issueType, setIssueType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Générer un numéro de ticket unique à 6 chiffres
  const generateTicketNumber = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const filteredInstallations = installations.filter(installation =>
    installation.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    installation.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    installation.product.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedInstallation) {
      newErrors.installation = 'Veuillez sélectionner une installation';
    }
    if (!description.trim()) {
      newErrors.description = 'Veuillez décrire le problème';
    }
    if (!issueType) {
      newErrors.issueType = 'Veuillez sélectionner un type de problème';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const ticketData = {
        ticketNumber: generateTicketNumber(),
        installation: selectedInstallation,
        description,
        issueType,
        createdAt: new Date().toISOString(),
        status: 'nouveau'
      };
      onSave(ticketData);
      onClose();
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
            className="relative w-full max-w-2xl bg-card p-6 rounded-xl shadow-xl z-50 border border-border/50 mx-4 max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center">
                <Hash className="w-5 h-5 mr-2 text-primary" />
                Nouveau Ticket SAV
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
                {/* Sélection de l'installation */}
                <div className="bg-accent/50 rounded-lg p-4 space-y-4">
                  <h3 className="font-medium flex items-center">
                    <Building2 className="w-4 h-4 mr-2" />
                    Installation concernée
                  </h3>
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Rechercher une installation..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      {filteredInstallations.map((installation) => (
                        <div
                          key={installation.id}
                          onClick={() => setSelectedInstallation(installation)}
                          className={`p-4 rounded-lg cursor-pointer transition-colors ${
                            selectedInstallation?.id === installation.id
                              ? 'bg-primary/10 border-primary'
                              : 'bg-background hover:bg-accent'
                          } border`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{installation.client.name}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {installation.client.address}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">{installation.product.name}</div>
                              <div className="text-sm text-muted-foreground">
                                Réf: {installation.product.reference}
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center justify-between text-sm">
                            <div className="flex items-center text-muted-foreground">
                              <Calendar className="w-4 h-4 mr-1" />
                              {format(new Date(installation.installationDate), 'dd MMMM yyyy', { locale: fr })}
                            </div>
                            <div className="flex items-center text-muted-foreground">
                              <Users className="w-4 h-4 mr-1" />
                              {installation.team.name}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {errors.installation && (
                      <div className="text-destructive text-sm flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.installation}
                      </div>
                    )}
                  </div>
                </div>

                {/* Type de problème */}
                <div className="bg-accent/50 rounded-lg p-4 space-y-4">
                  <h3 className="font-medium flex items-center">
                    <Package className="w-4 h-4 mr-2" />
                    Type de problème
                  </h3>
                  <select
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                    className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Sélectionner un type</option>
                    {issueTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.issueType && (
                    <div className="text-destructive text-sm flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.issueType}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="bg-accent/50 rounded-lg p-4 space-y-4">
                  <h3 className="font-medium">Description du problème</h3>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-32 resize-none"
                    placeholder="Décrivez le problème rencontré..."
                  />
                  {errors.description && (
                    <div className="text-destructive text-sm flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.description}
                    </div>
                  )}
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
                  Créer le ticket
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}