import React, { useState, useEffect } from 'react';
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
  Hash,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useSAV, Installation } from '../../../contexts/sav-context';

interface NewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ticketData: any) => void;
}

const issueTypes = [
  "Panne technique",
  "Bruit anormal",
  "Performance insuffisante",
  "Fuite",
  "Problème de régulation",
  "Autre"
];

export function NewTicketModal({ isOpen, onClose, onSave }: NewTicketModalProps) {
  const { installations, installationsLoading, fetchInstallations } = useSAV();
  const [selectedInstallation, setSelectedInstallation] = useState<Installation | null>(null);
  const [description, setDescription] = useState('');
  const [issueType, setIssueType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [localLoading, setLocalLoading] = useState(false);

  // Rafraîchir les installations quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      const loadInstallations = async () => {
        setLocalLoading(true);
        try {
          await fetchInstallations();
        } catch (error) {
          console.error("Erreur lors du chargement des installations:", error);
        } finally {
          setLocalLoading(false);
        }
      };
      
      loadInstallations();
    }
  }, [isOpen, fetchInstallations]);

  // Réinitialiser le formulaire quand le modal se ferme
  useEffect(() => {
    if (!isOpen) {
      setSelectedInstallation(null);
      setDescription('');
      setIssueType('');
      setSearchTerm('');
      setErrors({});
    }
  }, [isOpen]);

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
        number: generateTicketNumber(),
        client: {
          name: selectedInstallation!.client.name,
          address: selectedInstallation!.client.address,
          id: selectedInstallation!.client.id
        },
        product: {
          name: selectedInstallation!.product.name,
          reference: selectedInstallation!.product.reference
        },
        description,
        issueType,
        status: 'nouveau',
        priority: 'moyenne',
        createdAt: new Date().toISOString(),
        team: selectedInstallation!.team ? {
          id: selectedInstallation!.team.id,
          name: selectedInstallation!.team.name
        } : undefined,
        installationDate: selectedInstallation!.installationDate
      };
      onSave(ticketData);
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
              <h2 className="text-2xl font-bold">Nouveau Ticket SAV</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-grow pr-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Sélection de l'installation */}
                <div>
                  <label className="block text-sm font-medium mb-2">Installation concernée</label>
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Rechercher par client ou produit..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>

                  {localLoading || installationsLoading ? (
                    <div className="flex items-center justify-center p-4 bg-muted/30 rounded-lg">
                      <Loader2 className="w-5 h-5 text-primary animate-spin mr-2" />
                      <span>Chargement des installations...</span>
                    </div>
                  ) : filteredInstallations.length === 0 ? (
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <AlertCircle className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground">Aucune installation trouvée</p>
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto border rounded-lg">
                      {filteredInstallations.map((installation) => {
                        // Validate the date before formatting
                        const installDate = new Date(installation.installationDate);
                        const formattedDate = !isNaN(installDate.getTime()) 
                          ? format(installDate, 'dd MMMM yyyy', { locale: fr })
                          : 'Date invalide';
                          
                        return (
                          <div
                            key={installation.id}
                            onClick={() => setSelectedInstallation(installation)}
                            className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors ${
                              selectedInstallation?.id === installation.id ? 'bg-primary/10 border-primary' : ''
                            }`}
                          >
                            <div className="flex items-start">
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
                                  <span className="font-medium">{installation.client.name}</span>
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">{installation.client.address}</div>
                                <div className="flex items-center mt-2">
                                  <Package className="w-4 h-4 mr-2 text-muted-foreground" />
                                  <span>{installation.product.name}</span>
                                </div>
                                <div className="text-sm text-muted-foreground">Réf: {installation.product.reference}</div>
                                <div className="flex items-center mt-2">
                                  <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                                  <span className="text-sm">
                                    Installation: {formattedDate}
                                  </span>
                                </div>
                                <div className="flex items-center mt-1">
                                  <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                                  <span className="text-sm">Équipe: {installation.team.name}</span>
                                </div>
                              </div>
                              {selectedInstallation?.id === installation.id && (
                                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                  <Check className="w-4 h-4 text-primary-foreground" />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {errors.installation && (
                    <p className="text-destructive text-sm mt-1">{errors.installation}</p>
                  )}
                </div>

                {/* Type de problème */}
                <div>
                  <label className="block text-sm font-medium mb-2">Type de problème</label>
                  <div className="grid grid-cols-2 gap-2">
                    {issueTypes.map((type) => (
                      <div
                        key={type}
                        onClick={() => setIssueType(type)}
                        className={`p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                          issueType === type ? 'bg-primary/10 border-primary' : ''
                        }`}
                      >
                        <span>{type}</span>
                      </div>
                    ))}
                  </div>
                  {errors.issueType && (
                    <p className="text-destructive text-sm mt-1">{errors.issueType}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">Description du problème</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Décrivez le problème en détail..."
                    rows={4}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  ></textarea>
                  {errors.description && (
                    <p className="text-destructive text-sm mt-1">{errors.description}</p>
                  )}
                </div>
              </form>
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <button
                onClick={onClose}
                className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center"
              >
                <Check className="w-4 h-4 mr-2" />
                Créer le ticket
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}