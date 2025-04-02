import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  phone: string;
  email: string;
  location: string;
  joinDate: string;
  avatar: string;
}

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: Omit<TeamMember, 'id'>) => void;
}

const defaultAvatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';

export function EditMemberModal({ isOpen, onClose, onSave }: EditMemberModalProps) {
  const [member, setMember] = useState({
    name: '',
    role: '',
    phone: '',
    email: '',
    location: '',
    joinDate: new Date().toISOString().split('T')[0],
    avatar: defaultAvatar
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (member.name && member.role && member.email) {
      onSave(member);
      onClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMember(prev => ({ ...prev, [name]: value }));
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
              <h2 className="text-xl font-semibold">Ajouter un membre</h2>
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
                  <label htmlFor="name" className="block text-sm font-medium text-muted-foreground mb-1">
                    Nom complet *
                  </label>
                  <input
                    required
                    type="text"
                    id="name"
                    name="name"
                    value={member.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Jean Dupont"
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-muted-foreground mb-1">
                    Rôle *
                  </label>
                  <select
                    required
                    id="role"
                    name="role"
                    value={member.role}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Sélectionner un rôle</option>
                    <option value="Chef d'équipe">Chef d'équipe</option>
                    <option value="Technicien">Technicien</option>
                    <option value="Assistant">Assistant</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-1">
                    Email *
                  </label>
                  <input
                    required
                    type="email"
                    id="email"
                    name="email"
                    value={member.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="jean.dupont@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-muted-foreground mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={member.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-muted-foreground mb-1">
                    Localisation
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={member.location}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Paris"
                  />
                </div>

                <div>
                  <label htmlFor="joinDate" className="block text-sm font-medium text-muted-foreground mb-1">
                    Date d'entrée
                  </label>
                  <input
                    type="date"
                    id="joinDate"
                    name="joinDate"
                    value={member.joinDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
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
                  Ajouter
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}