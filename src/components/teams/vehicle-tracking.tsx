import React, { useEffect, useState } from 'react';
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
  ChevronRight,
  History,
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { UpdateMileageModal } from './components/update-mileage-modal';
import { MileageHistoryModal } from './components/mileage-history-modal';
import { VehicleHistoryModal } from './components/vehicle-history-modal';

interface VehicleFromDB {
  modele: string;
  immatriculation: string;
  annee: string;
  carburant: string;
  teamId: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  condition?: string;
  currentMileage?: number;
  monthlyAverage?: number;
  lastReading?: string;
  fuelConsumption?: number;
  lastRefuel?: { date: string; amount: number };
  monthlyCost?: number;
}

interface VehicleTrackingProps {
  teamId: string;
}

export function VehicleTracking({ teamId }: VehicleTrackingProps) {
  const [vehicles, setVehicles] = useState<VehicleFromDB[]>([]);
  const [isUpdateMileageModalOpen, setIsUpdateMileageModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isVehicleHistoryModalOpen, setIsVehicleHistoryModalOpen] = useState(false);

  useEffect(() => {
    const fetchVehicles = async () => {
      const q = query(collection(db, 'vehicules'), where('teamId', '==', teamId));
      const snapshot = await getDocs(q);
      console.log(snapshot.docs.map(doc => doc.data()));
      const data = snapshot.docs.map((doc) => doc.data() as VehicleFromDB);
      setVehicles(data);
    };
    fetchVehicles();
  }, [teamId]);

  const mileageHistory = [
    { date: "15/02/2024", mileage: 45280, difference: 2500 },
    { date: "15/01/2024", mileage: 42780, difference: 2300 },
    { date: "15/12/2023", mileage: 40480, difference: 2100 },
    { date: "15/11/2023", mileage: 38380, difference: 2400 },
  ];

  const vehicleCards = vehicles.length > 0 ? vehicles : [null];

  return (
    <>
      <div className="grid grid-cols-1 gap-6">
        {vehicleCards.map((vehicle, index) => (
          <motion.div
            key={vehicle?.immatriculation || `no-vehicle-${index}`}
            className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
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
              <div className="space-y-4">
                <Section title="Informations du véhicule" icon={<Car className="w-4 h-4 mr-2 text-blue-500" />}>
                  {vehicle ? (
                    <>
                      <Row label="Modèle" value={vehicle.modele} />
                      <Row label="Immatriculation" value={vehicle.immatriculation} />
                      <Row label="Année" value={vehicle.annee} />
                      <Row label="Carburant" value={vehicle.carburant} />
                    </>
                  ) : (
                    <Row label="Info" value="Aucun véhicule trouvé pour cette équipe." />
                  )}
                </Section>

                {/* <Section title="Maintenance" icon={<Wrench className="w-4 h-4 mr-2 text-orange-500" />}>
                  <Row label="Dernière révision" value={vehicle?.lastMaintenance || 'Non assigné'} />
                  <Row label="Prochaine révision" value={vehicle?.nextMaintenance || 'Non assigné'} />
                  <Row
                    label="État général"
                    value={
                      vehicle?.condition ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm">
                          {vehicle.condition}
                        </span>
                      ) : (
                        'Non assigné'
                      )
                    }
                  />
                </Section> */}
              </div>

              {/* <div className="space-y-4"> */}
                {/* <Section
                  title="Kilométrage"
                  icon={<Gauge className="w-4 h-4 mr-2 text-green-500" />}
                  trailing={
                    <button
                      onClick={() => setIsHistoryModalOpen(true)}
                      className="text-sm text-primary flex items-center hover:underline"
                    >
                      Plus d'infos
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  }
                >
                  <Row label="Kilométrage actuel" value={`${vehicle?.currentMileage?.toLocaleString() || 0} km`} />
                  <Row label="Moyenne mensuelle" value={`${vehicle?.monthlyAverage?.toLocaleString() || 0} km`} />
                  <Row label="Dernier relevé" value={vehicle?.lastReading || 'Non assigné'} />
                </Section> */}

                {/* <Section title="Consommation" icon={<Fuel className="w-4 h-4 mr-2 text-purple-500" />}>
                  <Row label="Moyenne" value={`${vehicle?.fuelConsumption || 0} L/100km`} />
                  <Row
                    label="Dernier plein"
                    value={
                      <div className="text-right">
                        <span className="font-medium block">{vehicle?.lastRefuel?.date || 'Non assigné'}</span>
                        <span className="text-sm text-muted-foreground">{vehicle?.lastRefuel?.amount || 0} L</span>
                      </div>
                    }
                  />
                  <Row label="Coût mensuel moyen" value={`${vehicle?.monthlyCost || 0} €`} />
                </Section> */}

                {/* <Section title="Alertes" icon={<AlertOctagon className="w-4 h-4 mr-2 text-red-500" />}>
                  <div className="flex items-center text-orange-500">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    <span className="text-sm">Révision à prévoir dans 15 jours</span>
                  </div>
                  <div className="flex items-center text-green-500">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span className="text-sm">Contrôle technique à jour</span>
                  </div>
                </Section> */}
              {/* </div> */}
            </div>
          </motion.div>
        ))}
      </div>

      <UpdateMileageModal
        isOpen={isUpdateMileageModalOpen}
        onClose={() => setIsUpdateMileageModalOpen(false)}
        currentMileage={vehicles[0]?.currentMileage || 0}
        onSave={(newMileage: number) => console.log('Save new mileage:', newMileage)}
      />

      <MileageHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={mileageHistory}
      />

      <VehicleHistoryModal
        isOpen={isVehicleHistoryModalOpen}
        onClose={() => setIsVehicleHistoryModalOpen(false)}
        history={[]} // charge historique si Firestore prévu
        onSave={(entry) => console.log('Save history entry:', entry)}
      />
    </>
  );
}

function Section({
  title,
  icon,
  children,
  trailing,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="bg-accent/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold flex items-center">
          {icon}
          {title}
        </h4>
        {trailing}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
