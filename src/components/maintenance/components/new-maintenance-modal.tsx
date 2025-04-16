import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Check, 
  PenTool as Tool, 
  Building2, 
  Users, 
  Search, 
  AlertCircle,
  Plus,
  ArrowRight,
  Package
} from 'lucide-react';
import { format, addMonths } from 'date-fns';
import { useClients } from '../../../lib/hooks/useClients';
import { useProducts } from '../../../lib/hooks/useProducts';
import { useScheduling } from '../../../lib/scheduling/scheduling-context';
import { NewClientModal } from '../../clients/components/new-client-modal';

// Ajouter l'import pour Firestore
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

interface NewMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (maintenanceData: any) => void;
}

type Step = 'client' | 'equipment' | 'schedule';

export function NewMaintenanceModal({ isOpen, onClose, onSave }: NewMaintenanceModalProps) {
  const { data: clients = [], loading: clientsLoading, add: addClient } = useClients();
  const { data: products = [], loading: productsLoading } = useProducts();
  const { teams } = useScheduling();
  
  const [step, setStep] = useState<Step>('client');
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    client: null as any,
    equipment: null as any,
    maintenanceType: 'preventif',
    frequency: 6, // months
    lastMaintenance: format(new Date(), 'yyyy-MM-dd'),
    nextMaintenance: format(addMonths(new Date(), 6), 'yyyy-MM-dd'),
    team: null as any,
    notes: ''
  });

  const activeTeams = teams.filter(team => team.isActive);
  
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contact.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClientSelect = (client: any) => {
    setFormData({ ...formData, client });
    if (errors.client) {
      setErrors({ ...errors, client: '' });
    }
  };

  const handleEquipmentSelect = (equipment: any) => {
    setFormData({ ...formData, equipment });
    if (errors.equipment) {
      setErrors({ ...errors, equipment: '' });
    }
  };

  const handleSaveNewClient = async (clientData: any) => {
    try {
      const clientId = await addClient({
        ...clientData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      const newClient = clients.find(c => c.id === clientId) || {
        id: clientId,
        ...clientData
      };
      handleClientSelect(newClient);
      setIsNewClientModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la création du client:', error);
    }
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 'client':
        if (!formData.client) {
          newErrors.client = 'Veuillez sélectionner un client';
        }
        break;
      case 'equipment':
        if (!formData.equipment) {
          newErrors.equipment = 'Veuillez sélectionner un équipement';
        }
        break;
      case 'schedule':
        if (!formData.lastMaintenance) {
          newErrors.lastMaintenance = 'Veuillez sélectionner une date de dernière maintenance';
        }
        if (!formData.nextMaintenance) {
          newErrors.nextMaintenance = 'Veuillez sélectionner une date de prochaine maintenance';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step === 'client') setStep('equipment');
      else if (step === 'equipment') setStep('schedule');
      else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (step === 'equipment') setStep('client');
    else if (step === 'schedule') setStep('equipment');
  };

  const handleSubmit = async () => {
    if (validateStep()) {
      try {
        const maintenanceData = {
          clientId: formData.client.id,
          clientName: formData.client.name,
          equipmentId: formData.equipment.id,
          equipmentName: formData.equipment.name,
          type: formData.maintenanceType,
          frequency: formData.frequency,
          lastMaintenance: formData.lastMaintenance,
          nextMaintenance: formData.nextMaintenance,
          teamId: formData.team?.id || null,
          teamName: formData.team?.name || null,
          notes: formData.notes,
          status: 'upcoming',
          createdAt: new Date().toISOString()
        };
  
        const maintenanceRef = collection(db, 'maintenances');
        await addDoc(maintenanceRef, maintenanceData);
        
        onSave(maintenanceData);
        onClose();
      } catch (error) {
        console.error('Erreur lors de la création de la maintenance:', error);
        // Vous pouvez ajouter ici une gestion d'erreur plus élaborée
      }
    }
  };

  const updateFrequency = (months: number) => {
    const nextDate = addMonths(new Date(formData.lastMaintenance), months);
    setFormData({
      ...formData,
      frequency: months,
      nextMaintenance: format(nextDate, 'yyyy-MM-dd')
    });
  };

  const renderClientSelection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsNewClientModalOpen(true)}
          className="ml-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau
        </motion.button>
      </div>

      {clientsLoading ? (
        <div className="flex items-center justify-center py-8">
          <Building2 className="w-8 h-8 text-muted-foreground animate-pulse" />
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Aucun client ne correspond à votre recherche
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {filteredClients.map((client) => (
            <motion.div
              key={client.id}
              whileHover={{ scale: 1.01 }}
              onClick={() => handleClientSelect(client)}
              className={`p-4 rounded-lg cursor-pointer transition-colors ${
                formData.client?.id === client.id
                  ? 'bg-primary/10 border-primary'
                  : 'bg-accent/50 hover:bg-accent'
              } border`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{client.name}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {client.contact.firstName} {client.contact.lastName}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">
                    {client.address.postalCode} {client.address.city}
                  </div>
                  {formData.client?.id === client.id && (
                    <div className="w-2 h-2 rounded-full bg-primary ml-auto mt-1" />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {errors.client && (
        <div className="text-destructive text-sm flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {errors.client}
        </div>
      )}
    </div>
  );

  const renderEquipmentSelection = () => (
    <div className="space-y-4">
      <div className="bg-accent/50 rounded-lg p-4 mb-4">
        <h3 className="font-medium mb-2">Client sélectionné</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">{formData.client.name}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {formData.client.contact.firstName} {formData.client.contact.lastName}
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setStep('client')}
            className="px-3 py-1.5 bg-background hover:bg-accent rounded-lg transition-colors text-sm"
          >
            Changer
          </motion.button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Rechercher un équipement..."
          className="w-full pl-10 pr-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {productsLoading ? (
        <div className="flex items-center justify-center py-8">
          <Package className="w-8 h-8 text-muted-foreground animate-pulse" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Aucun équipement disponible
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {products.map((product) => (
            <motion.div
              key={product.id}
              whileHover={{ scale: 1.01 }}
              onClick={() => handleEquipmentSelect(product)}
              className={`p-4 rounded-lg cursor-pointer transition-colors ${
                formData.equipment?.id === product.id
                  ? 'bg-primary/10 border-primary'
                  : 'bg-accent/50 hover:bg-accent'
              } border`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Réf: {product.reference}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">
                    {product.category}
                  </div>
                  {formData.equipment?.id === product.id && (
                    <div className="w-2 h-2 rounded-full bg-primary ml-auto mt-1" />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {errors.equipment && (
        <div className="text-destructive text-sm flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {errors.equipment}
        </div>
      )}
    </div>
  );

  const renderScheduleSelection = () => (
    <div className="space-y-6">
      <div className="bg-accent/50 rounded-lg p-4">
        <h3 className="font-medium mb-4">Type de maintenance</h3>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, maintenanceType: 'preventif' })}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
              formData.maintenanceType === 'preventif'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background hover:bg-accent'
            }`}
          >
            Préventif
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, maintenanceType: 'correctif' })}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
              formData.maintenanceType === 'correctif'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background hover:bg-accent'
            }`}
          >
            Correctif
          </button>
        </div>
      </div>

      <div className="bg-accent/50 rounded-lg p-4">
        <h3 className="font-medium mb-4">Fréquence</h3>
        <div className="grid grid-cols-3 gap-2">
          {[3, 6, 12].map((months) => (
            <button
              key={months}
              type="button"
              onClick={() => updateFrequency(months)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                formData.frequency === months
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background hover:bg-accent'
              }`}
            >
              {months} mois
            </button>
          ))}
        </div>
      </div>

      <div className="bg-accent/50 rounded-lg p-4">
        <h3 className="font-medium mb-4">Dates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Dernière maintenance
            </label>
            <input
              type="date"
              value={formData.lastMaintenance}
              onChange={(e) => {
                const lastDate = new Date(e.target.value);
                const nextDate = addMonths(lastDate, formData.frequency);
                setFormData({
                  ...formData,
                  lastMaintenance: e.target.value,
                  nextMaintenance: format(nextDate, 'yyyy-MM-dd')
                });
              }}
              className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.lastMaintenance && (
              <p className="text-destructive text-sm mt-1">{errors.lastMaintenance}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Prochaine maintenance
            </label>
            <input
              type="date"
              value={formData.nextMaintenance}
              onChange={(e) => setFormData({ ...formData, nextMaintenance: e.target.value })}
              className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.nextMaintenance && (
              <p className="text-destructive text-sm mt-1">{errors.nextMaintenance}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-accent/50 rounded-lg p-4">
        <h3 className="font-medium mb-4">Équipe assignée</h3>
        {activeTeams.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            Aucune équipe active disponible
          </div>
        ) : (
          <div className="space-y-2">
            {activeTeams.map((team) => (
              <button
                key={team.id}
                type="button"
                onClick={() => setFormData({ ...formData, team })}
                className={`w-full p-3 rounded-lg text-left transition-colors flex items-center justify-between ${
                  formData.team?.id === team.id
                    ? 'bg-primary/10 border-primary'
                    : 'bg-background hover:bg-accent'
                } border`}
              >
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  {team.name}
                </div>
                {formData.team?.id === team.id && (
                  <div className="w-2 h-2 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-accent/50 rounded-lg p-4">
        <h3 className="font-medium mb-4">Notes</h3>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Informations complémentaires..."
          className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-24 resize-none"
        />
      </div>
    </div>
  );

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
                  <Tool className="w-5 h-5 mr-2 text-primary" />
                  Nouvelle Maintenance
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
                      step === 'client' ? 'bg-primary text-primary-foreground' : 'bg-accent'
                    }`}>
                      1
                    </div>
                    <div className={`h-1 w-16 ${
                      step === 'client' ? 'bg-primary' : 'bg-accent'
                    }`} />
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step === 'equipment' ? 'bg-primary text-primary-foreground' : 'bg-accent'
                    }`}>
                      2
                    </div>
                    <div className={`h-1 w-16 ${
                      step === 'schedule' ? 'bg-primary' : 'bg-accent'
                    }`} />
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step === 'schedule' ? 'bg-primary text-primary-foreground' : 'bg-accent'
                    }`}>
                      3
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {step === 'client' && 'Sélection du client'}
                    {step === 'equipment' && 'Sélection de l\'équipement'}
                    {step === 'schedule' && 'Planification'}
                  </div>
                </div>
              </div>

              <div className="overflow-y-auto flex-1">
                {step === 'client' && renderClientSelection()}
                {step === 'equipment' && renderEquipmentSelection()}
                {step === 'schedule' && renderScheduleSelection()}
              </div>

              <div className="flex justify-between space-x-2 pt-6">
                {step !== 'client' && (
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
                  {step === 'schedule' ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Créer la maintenance
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

      <NewClientModal
        isOpen={isNewClientModalOpen}
        onClose={() => setIsNewClientModalOpen(false)}
        onSave={handleSaveNewClient}
      />
    </>
  );
}