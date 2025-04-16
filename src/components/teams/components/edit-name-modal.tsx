import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { doc, updateDoc } from "firebase/firestore";
import { db } from '../../../lib/firebase';
import { id } from 'date-fns/locale';

interface EditNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  teamId: string; // ✅ Assure-toi que c’est bien là
  onSave: (newName: string) => void;
}



export function EditNameModal({ teamId,isOpen, onClose, currentName, onSave }: EditNameModalProps) {
  const [name, setName] = React.useState(currentName);

  React.useEffect(() => {
    setName(currentName);
  }, [currentName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
  
    try {
      const teamRef = doc(db, "teams", teamId); // ✅ ici teamId (et pas id)
      await updateDoc(teamRef, {
        name: trimmedName,
        updatedAt: new Date()
      });
  
      onSave(trimmedName);
      onClose();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du nom de l'équipe :", error);
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
            className="relative w-full max-w-md bg-card p-6 rounded-xl shadow-xl z-50 border border-border/50 mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Modifier le nom de l'équipe</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="teamName" className="block text-sm font-medium text-muted-foreground mb-1">
                    Nom de l'équipe
                  </label>
                  <input
                    type="text"
                    id="teamName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Entrez le nom de l'équipe"
                    autoFocus
                  />
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
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Enregistrer
                  </motion.button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
  }