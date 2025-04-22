import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { AddVehiculeModal } from './components/add-vehicule';

interface Vehicule {
  id: string;
  modele: string;
  immatriculation: string;
  annee: string;
  carburant: string;
}

export default function VehiculesPage() {
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchVehicules = async () => {
    const querySnapshot = await getDocs(collection(db, 'vehicules'));
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Vehicule[];
    setVehicules(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchVehicules();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Statistiques globales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 bg-card rounded-xl border border-border/50 shadow-sm">
          <h3 className="text-sm text-muted-foreground">Total véhicules</h3>
          <p className="text-2xl font-bold">{vehicules.length}</p>
        </div>
        <div className="p-4 bg-card rounded-xl border border-border/50 shadow-sm">
          <h3 className="text-sm text-muted-foreground">Année la plus récente</h3>
          <p className="text-2xl font-bold">
            {vehicules.length > 0 ? Math.max(...vehicules.map(v => parseInt(v.annee))) : '—'}
          </p>
        </div>
        <div className="p-4 bg-card rounded-xl border border-border/50 shadow-sm">
          <h3 className="text-sm text-muted-foreground">Types de carburant</h3>
          <p className="text-2xl font-bold">
            {Array.from(new Set(vehicules.map(v => v.carburant))).join(', ') || '—'}
          </p>
        </div>
      </div>

      {/* Section véhicules enregistrés */}
      <motion.div
        layout
        className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Véhicules enregistrés</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" /> Nouveau véhicule
          </button>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Chargement...</p>
        ) : vehicules.length === 0 ? (
          <p className="text-muted-foreground">Aucun véhicule enregistré.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {vehicules.map(v => (
                <motion.div
                  key={v.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 border rounded-lg bg-accent space-y-1"
                >
                  <h3 className="text-lg font-semibold">{v.modele}</h3>
                  <p className="text-sm text-muted-foreground">Immatriculation : {v.immatriculation}</p>
                  <p className="text-sm text-muted-foreground">Année : {v.annee}</p>
                  <p className="text-sm text-muted-foreground">Type de carburant : {v.carburant}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      <AddVehiculeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdded={fetchVehicules}
      />
    </div>
  );
}