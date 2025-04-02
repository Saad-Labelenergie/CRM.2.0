import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Check, 
  ChevronRight, 
  Building2, 
  Package, 
  Calendar,
  Clock,
  Search,
  AlertCircle
} from 'lucide-react';
import { format, addDays, setHours, setMinutes, isBefore, isAfter, addMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: any) => void;
  currentDate?: Date;
}

// Mock data - Replace with actual data from your system
const clients = [
  { id: 1, name: "Entreprise ABC", address: "123 Avenue des Champs-Élysées, 75008 Paris" },
  { id: 2, name: "Résidence Les Pins", address: "45 Rue du Commerce, 69002 Lyon" },
  { id: 3, name: "Hotel Luxe Palace", address: "78 Boulevard de la Croisette, 06400 Cannes" },
];

const products = [
  { 
    id: 1, 
    name: "Climatiseur Mural 9000 BTU",
    installationTime: 240, // minutes
    type: "climatisation"
  },
  { 
    id: 2, 
    name: "Unité Extérieure Multi-Split",
    installationTime: 480, // minutes (full day)
    type: "climatisation"
  },
  { 
    id: 3, 
    name: "Pompe à Chaleur Air/Eau",
    installationTime: 960, // minutes (2 days)
    type: "chauffage"
  },
];

// Working hours configuration
const WORKING_HOURS = {
  start: { hour: 8, minute: 30 },
  end: { hour: 18, minute: 30 },
  workingDays: [1, 2, 3, 4, 5], // Monday to Friday
};

type Step = 'client' | 'products' | 'datetime';

export function NewAppointmentModal({ isOpen, onClose, onSave, currentDate }: NewAppointmentModalProps) {
  const [step, setStep] = useState<Step>('client');
  const [selectedClient, setSelectedClient] = useState<typeof clients[0] | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<typeof products[0][]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(currentDate || new Date());
  const [selectedTime, setSelectedTime] = useState('08:30');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate total installation time
  const getTotalInstallationTime = () => {
    return selectedProducts.reduce((total, product) => total + product.installationTime, 0);
  };

  // Calculate number of days needed
  const getDaysNeeded = () => {
    const totalMinutes = getTotalInstallationTime();
    const minutesPerDay = (WORKING_HOURS.end.hour * 60 + WORKING_HOURS.end.minute) - 
                         (WORKING_HOURS.start.hour * 60 + WORKING_HOURS.start.minute);
    return Math.ceil(totalMinutes / minutesPerDay);
  };

  // Generate available time slots
  const getAvailableTimeSlots = () => {
    const slots = [];
    let currentTime = setMinutes(setHours(new Date(), WORKING_HOURS.start.hour), WORKING_HOURS.start.minute);
    const endTime = setMinutes(setHours(new Date(), WORKING_HOURS.end.hour), WORKING_HOURS.end.minute);

    while (isBefore(currentTime, endTime)) {
      slots.push(format(currentTime, 'HH:mm'));
      currentTime = addMinutes(currentTime, 30);
    }

    return slots;
  };

  const handleNext = () => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 'client':
        if (!selectedClient) {
          newErrors.client = 'Veuillez sélectionner un client';
        }
        break;
      case 'products':
        if (selectedProducts.length === 0) {
          newErrors.products = 'Veuillez sélectionner au moins un produit';
        }
        break;
      case 'datetime':
        if (!selectedDate || !selectedTime) {
          newErrors.datetime = 'Veuillez sélectionner une date et une heure';
        }
        break;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (step === 'client') setStep('products');
    else if (step === 'products') setStep('datetime');
    else {
      onSave({
        client: selectedClient,
        products: selectedProducts,
        date: selectedDate,
        time: selectedTime,
        daysNeeded: getDaysNeeded()
      });
      onClose();
    }
  };

  const handleBack = () => {
    if (step === 'products') setStep('client');
    else if (step === 'datetime') setStep('products');
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderClientSelection = () => (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Rechercher un client..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="space-y-2">
        {filteredClients.map((client) => (
          <motion.div
            key={client.id}
            whileHover={{ scale: 1.01 }}
            onClick={() => setSelectedClient(client)}
            className={`p-4 rounded-lg cursor-pointer transition-colors ${
              selectedClient?.id === client.id
                ? 'bg-primary/10 border-primary'
                : 'bg-accent/50 hover:bg-accent'
            } border`}
          >
            <div className="font-medium">{client.name}</div>
            <div className="text-sm text-muted-foreground mt-1">{client.address}</div>
          </motion.div>
        ))}
      </div>

      {errors.client && (
        <div className="text-destructive text-sm flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {errors.client}
        </div>
      )}
    </div>
  );

  const renderProductSelection = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        {products.map((product) => (
          <motion.div
            key={product.id}
            whileHover={{ scale: 1.01 }}
            onClick={() => {
              if (selectedProducts.find(p => p.id === product.id)) {
                setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
              } else {
                setSelectedProducts([...selectedProducts, product]);
              }
            }}
            className={`p-4 rounded-lg cursor-pointer transition-colors ${
              selectedProducts.find(p => p.id === product.id)
                ? 'bg-primary/10 border-primary'
                : 'bg-accent/50 hover:bg-accent'
            } border`}
          >
            <div className="font-medium">{product.name}</div>
            <div className="text-sm text-muted-foreground mt-1">
              Durée d'installation : {product.installationTime / 60} heures
            </div>
          </motion.div>
        ))}
      </div>

      {selectedProducts.length > 0 && (
        <div className="p-4 bg-accent/50 rounded-lg">
          <div className="font-medium">Résumé de l'installation</div>
          <div className="text-sm text-muted-foreground mt-2">
            Durée totale : {getTotalInstallationTime() / 60} heures
            <br />
            Nombre de jours nécessaires : {getDaysNeeded()} jour(s)
          </div>
        </div>
      )}

      {errors.products && (
        <div className="text-destructive text-sm flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {errors.products}
        </div>
      )}
    </div>
  );

  const renderDateTimeSelection = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Date de début
          </label>
          <input
            type="date"
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            min={format(new Date(), 'yyyy-MM-dd')}
            className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Heure de début
          </label>
          <select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {getAvailableTimeSlots().map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-4 bg-accent/50 rounded-lg space-y-2">
        <div className="font-medium">Récapitulatif</div>
        <div className="text-sm text-muted-foreground">
          <div className="flex items-center">
            <Building2 className="w-4 h-4 mr-2" />
            {selectedClient?.name}
          </div>
          <div className="flex items-center mt-1">
            <Package className="w-4 h-4 mr-2" />
            {selectedProducts.length} produit(s)
          </div>
          <div className="flex items-center mt-1">
            <Calendar className="w-4 h-4 mr-2" />
            {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
          </div>
          <div className="flex items-center mt-1">
            <Clock className="w-4 h-4 mr-2" />
            {selectedTime}
          </div>
        </div>
      </div>

      {errors.datetime && (
        <div className="text-destructive text-sm flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {errors.datetime}
        </div>
      )}
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
            className="relative w-full max-w-2xl bg-card p-6 rounded-xl shadow-xl z-50 border border-border/50 mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Nouveau Rendez-vous</h2>
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
                    step === 'products' ? 'bg-primary text-primary-foreground' : 'bg-accent'
                  }`}>
                    2
                  </div>
                  <div className={`h-1 w-16 ${
                    step === 'datetime' ? 'bg-primary' : 'bg-accent'
                  }`} />
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step === 'datetime' ? 'bg-primary text-primary-foreground' : 'bg-accent'
                  }`}>
                    3
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {step === 'client' && 'Sélection du client'}
                  {step === 'products' && 'Sélection des produits'}
                  {step === 'datetime' && 'Date et heure'}
                </div>
              </div>
            </div>

            <div className="mb-6">
              {step === 'client' && renderClientSelection()}
              {step === 'products' && renderProductSelection()}
              {step === 'datetime' && renderDateTimeSelection()}
            </div>

            <div className="flex justify-between">
              {step !== 'client' ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBack}
                  className="px-4 py-2 rounded-lg bg-accent hover:bg-accent/80 transition-colors"
                >
                  Retour
                </motion.button>
              ) : (
                <div />
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center"
              >
                {step === 'datetime' ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Confirmer
                  </>
                ) : (
                  <>
                    Suivant
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}