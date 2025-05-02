import React, { useState,useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Plus, Users, Truck, Briefcase, Circle } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import { db } from '../../../lib/firebase';
import { getDocs,collection } from 'firebase/firestore';

interface Team {
  name: string;
  members: number;
  rating: number;
  activeProjects: number;
  nextAvailable: string;
  expertise: string[];
  vehicle: string;
  color: string;
}

interface NewTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (team: Omit<Team, 'id'>) => void;
}

const predefinedColors = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
];


export function NewTeamModal({ isOpen, onClose, onSave }: NewTeamModalProps) {
  const [categories, setCategories] = useState<string[]>([]);

useEffect(() => {
  const fetchCategories = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'products'));
      const uniqueCategories = Array.from(
        new Set(snapshot.docs.map(doc => doc.data().category).filter(Boolean))
      );
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories :', error);
    }
  };

  if (isOpen) fetchCategories();
}, [isOpen]);
  const [formData, setFormData] = useState<Partial<Team>>({
    name: '',
    members: 0,
    rating: 5.0,
    activeProjects: 0,
    nextAvailable: 'Aujourd\'hui',
    expertise: [],
    vehicle: '',
    color: predefinedColors[0]
  });
  const [newExpertise, setNewExpertise] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'Le nom est requis';
    if (!formData.vehicle) newErrors.vehicle = 'Le véhicule est requis';
    if (formData.expertise?.length === 0) newErrors.expertise = 'Au moins une expertise est requise';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData as Team);
    onClose();
  };

  const handleAddExpertise = () => {
    if (newExpertise && !formData.expertise?.includes(newExpertise)) {
      setFormData(prev => ({
        ...prev,
        expertise: [...(prev.expertise || []), newExpertise]
      }));
      setNewExpertise('');
    }
  };

  const handleRemoveExpertise = (expertiseToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise?.filter(exp => exp !== expertiseToRemove) || []
    }));
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
            className="relative w-full max-w-2xl bg-card p-6 rounded-xl shadow-xl z-50 border border-border/50 mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary" />
                Nouvelle Équipe
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Nom de l'équipe *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Nom de l'équipe"
                  />
                  {errors.name && (
                    <p className="text-destructive text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Véhicule *
                  </label>
                  <input
                    type="text"
                    value={formData.vehicle}
                    onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                    className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Modèle du véhicule"
                  />
                  {errors.vehicle && (
                    <p className="text-destructive text-sm mt-1">{errors.vehicle}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Couleur de l'équipe
                  </label>
                  <Popover.Root>
                    <Popover.Trigger asChild>
                      <button
                        type="button"
                        className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary flex items-center"
                      >
                        <div 
                          className="w-6 h-6 rounded-full mr-2"
                          style={{ backgroundColor: formData.color }}
                        />
                        <span className="text-sm">{formData.color}</span>
                      </button>
                    </Popover.Trigger>
                    <Popover.Portal>
                      <Popover.Content
                        className="bg-card rounded-lg shadow-lg border border-border/50 p-4"
                        sideOffset={5}
                      >
                        <div className="grid grid-cols-4 gap-2">
                          {predefinedColors.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setFormData({ ...formData, color })}
                              className="w-8 h-8 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary"
                              style={{ backgroundColor: color }}
                            >
                              {color === formData.color && (
                                <Check className="w-4 h-4 text-white" />
                              )}
                            </button>
                          ))}
                        </div>
                      </Popover.Content>
                    </Popover.Portal>
                  </Popover.Root>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Expertises *
                </label>
                <div className="flex space-x-2">
  <select
    value={newExpertise}
    onChange={(e) => setNewExpertise(e.target.value)}
    className="flex-1 px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
  >
    <option value="">Sélectionner une catégorie</option>
    {categories.map((cat) => (
      <option key={cat} value={cat}>{cat}</option>
    ))}
  </select>
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    type="button"
    onClick={handleAddExpertise}
    disabled={!newExpertise}
    className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
  >
    <Plus className="w-5 h-5" />
  </motion.button>
</div>

                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.expertise?.map((exp) => (
                    <span
                      key={exp}
                      className="px-3 py-1 bg-accent rounded-full text-sm flex items-center group"
                    >
                      {exp}
                      <button
                        type="button"
                        onClick={() => handleRemoveExpertise(exp)}
                        className="ml-2 p-1 rounded-full hover:bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                {errors.expertise && (
                  <p className="text-destructive text-sm mt-1">{errors.expertise}</p>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
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
                  Créer l'équipe
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}