import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useFirebase } from '../../../lib/hooks/useFirebase';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
}

export function EditMemberModal({ isOpen, onClose, onSave }: EditMemberModalProps) {
  const { data: users = [], loading } = useFirebase<User>('users');

  // 🔥 Exclure les administrateurs
  const filteredUsers = users.filter(user => user.role !== 'Administrateur');

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
            className="relative w-full max-w-lg bg-card p-6 rounded-xl shadow-xl z-50 border border-border/50 mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Ajouter un membre</h2>
              <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {loading ? (
              <p className="text-center text-muted-foreground">Chargement des utilisateurs...</p>
            ) : filteredUsers.length === 0 ? (
              <p className="text-center text-muted-foreground">Aucun utilisateur disponible.</p>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between bg-accent/50 p-3 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img
                        src={user.avatar || '/default-avatar.png'}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onSave(user);
                        onClose();
                      }}
                      className="px-3 py-1 bg-primary text-white rounded-md hover:bg-primary/90"
                    >
                      Assigner
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
