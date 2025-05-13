// ✅ Code modifié : EditUserModal avec avatar dynamique selon le rôle (sans upload)

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useScheduling } from '../../../lib/scheduling/scheduling-context';
import { hashPassword } from '../../../lib/utils/password';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  phone: string;
  status: 'active' | 'inactive';
  avatar?: string;
  team?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => void;
  user: User | null;
}

export function EditUserModal({ isOpen, onClose, onSave, user }: EditUserModalProps) {
  const { teams } = useScheduling();
  const [userData, setUserData] = useState<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    email: '',
    role: '',
    department: '',
    phone: '',
    status: 'active',
    avatar: '',
    team: ''
  });
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setUserData({
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        status: user.status,
        avatar: user.avatar || '',
        team: user.team || ''
      });
    }
  }, [user]);

  const getDefaultAvatar = (role: string) => {
    switch (role) {
      case 'Technicien':
        return '/images/Technicien.png';
      case 'manager':
        return '/images/Manager.png';
      case 'Administrateur':
        return '/images/Admin.png';
      default:
        return 'avatars/avatar.png';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const finalUserData = {
      ...userData,
      avatar: getDefaultAvatar(userData.role),
      ...(newPassword && { password: await hashPassword(newPassword) })
    };

    onSave(finalUserData);
    setNewPassword('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card w-full max-w-lg rounded-xl p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Modifier l'utilisateur</h2>
              <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <img
                    src={getDefaultAvatar(userData.role)}
                    alt={userData.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  La photo de profil change automatiquement selon le rôle sélectionné
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Nom complet</label>
                <input
                  type="text"
                  value={userData.name}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nouveau mot de passe (optionnel)</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 pr-10 rounded-lg border focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Rôle</label>
                  <select
                    value={userData.role}
                    onChange={(e) => setUserData({ ...userData, role: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Sélectionner un rôle</option>
                    <option value="Technicien">Technicien</option>
                    <option value="manager">Manager</option>
                    <option value="Administrateur">Administrateur</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Département</label>
                  <input
                    type="text"
                    value={userData.department}
                    onChange={(e) => setUserData({ ...userData, department: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
              </div>
              {userData.role === 'Technicien' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Équipe</label>
                  <select
                    value={userData.team}
                    onChange={(e) => setUserData({ ...userData, team: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
                    required
                  >
                    <option value="">Sélectionner une équipe</option>
                    {teams.filter(team => team.isActive).map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={userData.phone}
                  onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Statut</label>
                <select
                  value={userData.status}
                  onChange={(e) => setUserData({ ...userData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
                >
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg hover:bg-accent"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
