import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Building2 } from 'lucide-react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
interface AddVehiculeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded: () => void;
}

export function AddVehiculeModal({ isOpen, onClose, onAdded }: AddVehiculeModalProps) {
  const [form, setForm] = useState({
    modele: '',
    immatriculation: '',
    annee: '',
    carburant: '',
    teamId: null
  });
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTeams = async () => {
      const snapshot = await getDocs(collection(db, 'teams'));
      setTeams(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as any));
    };

    if (isOpen) fetchTeams();
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!form.modele || !form.immatriculation || !form.annee || !form.carburant ) return;
    setLoading(true);

    await addDoc(collection(db, 'vehicules'), {
      modele: form.modele,
      immatriculation: form.immatriculation,
      annee: form.annee,
      carburant: form.carburant,
      teamId: form.teamId
    });

    setLoading(false);
    onAdded();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
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
            className="relative bg-card p-6 rounded-xl z-50 w-full max-w-md mx-4 border border-border/50"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-primary" />
                Ajouter un véhicule
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <input
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Modèle"
                value={form.modele}
                onChange={(e) => setForm({ ...form, modele: e.target.value })}
              />
              <input
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Immatriculation"
                value={form.immatriculation}
                onChange={(e) => setForm({ ...form, immatriculation: e.target.value })}
              />
              <input
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Année"
                value={form.annee}
                onChange={(e) => setForm({ ...form, annee: e.target.value })}
              />
              <input
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Type de carburant"
                value={form.carburant}
                onChange={(e) => setForm({ ...form, carburant: e.target.value })}
              />

            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center"
                disabled={loading}
              >
                <Check className="w-4 h-4 mr-2" /> Enregistrer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
