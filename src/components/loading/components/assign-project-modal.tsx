import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Calendar, Clock, HardHat } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Project {
  id: string;
  name: string;
  hours: number;
  date: string;
  teamId?: string;
}

interface Team {
  id: string;
  name: string;
  capacity: number;
  currentLoad: number;
  projects: Project[];
  color: string;
}

interface AssignProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (teamId: string, projectData: any) => void;
  teams: Team[];
  selectedTeam: Team | null;
}

export function AssignProjectModal({ isOpen, onClose, onAssign, teams, selectedTeam }: AssignProjectModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    hours: 8,
    date: format(new Date(), 'yyyy-MM-dd'),
    teamId: selectedTeam?.id || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (selectedTeam) {
      setFormData(prev => ({ ...prev, teamId: selectedTeam.id }));
    }
  }, [selectedTeam]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Le nom du projet est requis';
    if (!formData.teamId) newErrors.teamId = 'Veuillez sélectionner une équipe';
    if (formData.hours <= 0) newErrors.hours = 'Les heures doivent être supérieures à 0';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onAssign(formData.teamId, formData);
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
            className="relative w-full max-w-md bg-card p-6 rounded-xl shadow-xl z-50 border border-border/50 mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center">
                <HardHat className="w-5 h-5 mr-2 text-primary" />
                Assigner un Projet
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom du projet</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full p-3 bg-background border rounded-lg ${
                    errors.name ? 'border-red-500' : 'border-border'
                  }`}
                  placeholder="Ex: Installation Climatisation Bureau A"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Équipe</label>
                <select
                  name="teamId"
                  value={formData.teamId}
                  onChange={handleChange}
                  className={`w-full p-3 bg-background border rounded-lg ${
                    errors.teamId ? 'border-red-500' : 'border-border'
                  }`}
                >
                  <option value="">Sélectionner une équipe</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.name} ({team.currentLoad}% occupé)
                    </option>
                  ))}
                </select>
                {errors.teamId && <p className="text-red-500 text-sm mt-1">{errors.teamId}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Heures estimées</label>
                  <input
                    type="number"
                    name="hours"
                    value={formData.hours}
                    onChange={handleChange}
                    min="1"
                    max="100"
                    className={`w-full p-3 bg-background border rounded-lg ${
                      errors.hours ? 'border-red-500' : 'border-border'
                    }`}
                  />
                  {errors.hours && <p className="text-red-500 text-sm mt-1">{errors.hours}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="w-full p-3 bg-background border border-border rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Assigner
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}