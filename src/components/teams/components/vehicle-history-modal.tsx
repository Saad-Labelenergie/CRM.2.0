import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Truck, Calendar, AlertCircle } from 'lucide-react';

interface VehicleHistoryEntry {
  id: string;
  model: string;
  registration: string;
  startDate: string;
  endDate: string | null;
  notes?: string;
}

interface Vehicule {
  id: string;
  modele: string;
  immatriculation: string;
  annee: string;
  carburant: string;
  team?: {
    id: string;
    name: string;
  } | null;
}

interface VehicleHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: VehicleHistoryEntry[];
  onSave: (entry: Omit<VehicleHistoryEntry, 'id'>) => void;
  selectedTeam: { id: string; name: string } | null;
}

export function VehicleHistoryModal({ isOpen, onClose, history, onSave, selectedTeam }: VehicleHistoryModalProps) {
  const [formData, setFormData] = useState<Omit<VehicleHistoryEntry, 'id'>>({
    model: '',
    registration: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: null,
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);

  const fetchVehicules = async () => {
    const snapshot = await getDocs(collection(db, 'vehicules'));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Vehicule[];
    setVehicules(data);
  };
  

  useEffect(() => {
    if (isOpen) fetchVehicules();
  }, [isOpen]);


  const assignVehiculeToTeam = async (vehiculeId: string) => {
    if (!selectedTeam) return;
    console.log("Assignation en cours:", vehiculeId, selectedTeam);
  
    try {
      const current = vehicules.find(v => v.team?.id === selectedTeam.id);
      if (current) {
        console.log("Désassignation de:", current.id);
        await updateDoc(doc(db, 'vehicules', current.id), {
          team: null,
          updatedAt: new Date().toISOString(),
        });
      }
  
      console.log("Affectation à:", vehiculeId);
      await updateDoc(doc(db, 'vehicules', vehiculeId), {
        team: { id: selectedTeam.id, name: selectedTeam.name },
        updatedAt: new Date().toISOString(),
      });
  
      console.log("Mise à jour effectuée !");
      fetchVehicules();
    } catch (err) {
      console.error('Erreur assignation véhicule :', err);
    }
  };
  
  

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.model.trim()) newErrors.model = 'Le modèle est requis';
    if (!formData.registration.trim()) newErrors.registration = 'L\'immatriculation est requise';
    if (!formData.startDate) newErrors.startDate = 'La date de début est requise';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
      setFormData({
        model: '',
        registration: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: null,
        notes: ''
      });
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
            className="relative w-full max-w-3xl bg-card p-6 rounded-xl shadow-xl z-50 border border-border/50 mx-4 max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center">
                <Truck className="w-5 h-5 mr-2 text-primary" />
                Historique des véhicules
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-8 flex-1">
              
              <div>
                <h3 className="font-medium mb-4">Associer un véhicule existant</h3>
                {vehicules.length === 0 ? (
  <p className="text-muted-foreground">Aucun véhicule disponible.</p>
) : (
  <div className="grid md:grid-cols-2 gap-4">
    {vehicules.map(v => {
const isAssigned =
v.team &&
selectedTeam &&
typeof v.team === 'object' &&
v.team.id === selectedTeam.id;
    return (
        <motion.div
          key={v.id}
          whileHover={{ scale: 1.01 }}
          className={`rounded-lg p-4 border cursor-pointer transition-all ${
            isAssigned
              ? 'bg-green-100 border-green-400 dark:bg-green-900/20'
              : 'bg-accent/50 hover:ring-2 hover:ring-primary'
          }`}
          onClick={() => {
            console.log("Click sur véhicule:", v.id);
            assignVehiculeToTeam(v.id)}}  
        >
          <h4 className="text-lg font-semibold">{v.modele}</h4>
          <p className="text-sm text-muted-foreground">Immatriculation : {v.immatriculation}</p>
          <p className="text-sm text-muted-foreground">Année : {v.annee} | Carburant : {v.carburant}</p>
          {isAssigned ? (
            <p className="mt-2 text-sm text-green-600 dark:text-green-400">Déjà assigné à cette équipe</p>
          ) : (
            <p className="mt-2 text-sm text-primary">Cliquez pour l’assigner à cette équipe</p>
          )}
        </motion.div>
      );
    })}
  </div>
)}

              </div>

              <div>
                <h3 className="font-medium mb-4">Historique</h3>
                {history.length === 0 ? (
                  <p className="text-center text-muted-foreground">Aucun historique disponible</p>
                ) : (
                  <div className="space-y-4">
                    {history.map(entry => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-accent/50 rounded-lg p-4"
                      >
                        <div className="flex justify-between">
                          <div>
                            <h4 className="font-medium">{entry.model}</h4>
                            <p className="text-sm text-muted-foreground">{entry.registration}</p>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            {entry.startDate}
                            {entry.endDate && <div className="text-xs mt-1">Fin : {entry.endDate}</div>}
                          </div>
                        </div>
                        {entry.notes && (
                          <p className="mt-2 text-sm text-muted-foreground border-t border-border/50 pt-2">{entry.notes}</p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}