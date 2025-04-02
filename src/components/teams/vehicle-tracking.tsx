import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Truck, 
  Car,
  Wrench,
  Gauge,
  Fuel,
  AlertOctagon,
  AlertTriangle,
  CheckCircle,
  CalendarClock,
  ChevronRight,
  History
} from 'lucide-react';
import { UpdateMileageModal } from './components/update-mileage-modal';
import { MileageHistoryModal } from './components/mileage-history-modal';
import { VehicleHistoryModal } from './components/vehicle-history-modal';

interface VehicleTrackingProps {
  vehicleData: {
    model: string;
    registration: string;
    year: number;
    fuelType: string;
    lastMaintenance: string;
    nextMaintenance: string;
    condition: string;
    currentMileage: number;
    monthlyAverage: number;
    lastReading: string;
    fuelConsumption: number;
    lastRefuel: {
      date: string;
      amount: number;
    };
    monthlyCost: number;
  };
}

// Exemple d'historique des kilométrages
const mileageHistory = [
  { date: "15/02/2024", mileage: 45280, difference: 2500 },
  { date: "15/01/2024", mileage: 42780, difference: 2300 },
  { date: "15/12/2023", mileage: 40480, difference: 2100 },
  { date: "15/11/2023", mileage: 38380, difference: 2400 },
  { date: "15/10/2023", mileage: 35980, difference: 2200 },
  { date: "15/09/2023", mileage: 33780, difference: 2150 },
  { date: "15/08/2023", mileage: 31630, difference: 2300 },
  { date: "15/07/2023", mileage: 29330, difference: 2400 },
];

export function VehicleTracking({ vehicleData }: VehicleTrackingProps) {
  const [isUpdateMileageModalOpen, setIsUpdateMileageModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isVehicleHistoryModalOpen, setIsVehicleHistoryModalOpen] = useState(false);
  const [currentMileage, setCurrentMileage] = useState(vehicleData.currentMileage);
  const [vehicleHistory, setVehicleHistory] = useState<{
    id: string;
    model: string;
    registration: string;
    startDate: string;
    endDate: string | null;
    notes?: string;
  }[]>([]);

  const handleUpdateMileage = (newMileage: number) => {
    setCurrentMileage(newMileage);
    // Ici, vous pourriez ajouter la logique pour sauvegarder le nouveau kilométrage dans votre backend
  };

  const handleAddVehicleHistory = (entry: Omit<typeof vehicleHistory[0], 'id'>) => {
    const newEntry = {
      ...entry,
      id: Math.random().toString(36).substr(2, 9)
    };
    setVehicleHistory([...vehicleHistory, newEntry]);
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center">
          <Truck className="w-5 h-5 mr-2 text-blue-500" />
          Suivi Véhicule
        </h3>
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsVehicleHistoryModalOpen(true)}
            className="px-4 py-2 bg-accent hover:bg-accent/80 rounded-lg transition-colors flex items-center"
          >
            <History className="w-4 h-4 mr-2" />
            Historique
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsUpdateMileageModalOpen(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Mettre à jour le kilométrage
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations du véhicule */}
        <div className="space-y-4">
          <div className="bg-accent/50 rounded-xl p-4">
            <h4 className="font-semibold mb-4 flex items-center">
              <Car className="w-4 h-4 mr-2 text-blue-500" />
              Informations du véhicule
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Modèle</span>
                <span className="font-medium">{vehicleData.model}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Immatriculation</span>
                <span className="font-medium">{vehicleData.registration}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Année</span>
                <span className="font-medium">{vehicleData.year}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Type de carburant</span>
                <span className="font-medium">{vehicleData.fuelType}</span>
              </div>
            </div>
          </div>

          <div className="bg-accent/50 rounded-xl p-4">
            <h4 className="font-semibold mb-4 flex items-center">
              <Wrench className="w-4 h-4 mr-2 text-orange-500" />
              Maintenance
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Dernière révision</span>
                <span className="font-medium">{vehicleData.lastMaintenance}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Prochaine révision</span>
                <div className="text-right">
                  <span className="font-medium block">{vehicleData.nextMaintenance}</span>
                  <span className="text-sm text-orange-500">Dans 15 jours</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">État général</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm">
                  {vehicleData.condition}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Suivi kilométrique */}
        <div className="space-y-4">
          <div className="bg-accent/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold flex items-center">
                <Gauge className="w-4 h-4 mr-2 text-green-500" />
                Kilométrage
              </h4>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsHistoryModalOpen(true)}
                className="text-sm text-primary flex items-center hover:underline"
              >
                Plus d'infos
                <ChevronRight className="w-4 h-4 ml-1" />
              </motion.button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Kilométrage actuel</span>
                <span className="font-medium">{currentMileage.toLocaleString()} km</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Moyenne mensuelle</span>
                <span className="font-medium">{vehicleData.monthlyAverage.toLocaleString()} km</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Dernier relevé</span>
                <span className="font-medium">{vehicleData.lastReading}</span>
              </div>
            </div>
          </div>

          <div className="bg-accent/50 rounded-xl p-4">
            <h4 className="font-semibold mb-4 flex items-center">
              <Fuel className="w-4 h-4 mr-2 text-purple-500" />
              Consommation
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Moyenne</span>
                <span className="font-medium">{vehicleData.fuelConsumption} L/100km</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Dernier plein</span>
                <div className="text-right">
                  <span className="font-medium block">{vehicleData.lastRefuel.date}</span>
                  <span className="text-sm text-muted-foreground">{vehicleData.lastRefuel.amount} L</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Coût mensuel moyen</span>
                <span className="font-medium">{vehicleData.monthlyCost} €</span>
              </div>
            </div>
          </div>

          <div className="bg-accent/50 rounded-xl p-4">
            <h4 className="font-semibold mb-4 flex items-center">
              <AlertOctagon className="w-4 h-4 mr-2 text-red-500" />
              Alertes
            </h4>
            <div className="space-y-2">
              <div className="flex items-center text-orange-500">
                <AlertTriangle className="w-4 h-4 mr-2" />
                <span className="text-sm">Révision à prévoir dans 15 jours</span>
              </div>
              <div className="flex items-center text-green-500">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span className="text-sm">Contrôle technique à jour</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <UpdateMileageModal
        isOpen={isUpdateMileageModalOpen}
        onClose={() => setIsUpdateMileageModalOpen(false)}
        currentMileage={currentMileage}
        onSave={handleUpdateMileage}
      />

      <MileageHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={mileageHistory}
      />

      <VehicleHistoryModal
        isOpen={isVehicleHistoryModalOpen}
        onClose={() => setIsVehicleHistoryModalOpen(false)}
        history={vehicleHistory}
        onSave={handleAddVehicleHistory}
      />
    </motion.div>
  );
}