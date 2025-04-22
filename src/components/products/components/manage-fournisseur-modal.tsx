import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Plus, Factory, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import { useFournisseurs } from '../../../lib/hooks/useFournisseurs';


interface ManageFournisseursModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (fournisseurs: string[]) => void;
}

export function ManageFournisseursModal({ isOpen, onClose, onSave }: ManageFournisseursModalProps) {
  const { data: fournisseursData, add, update, remove } = useFournisseurs();
  const [fournisseurs, setFournisseurs] = useState<string[]>([]);
  const [newFournisseur, setNewFournisseur] = useState({
    name: '',
    contact: '',
    email: ''
  });
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (fournisseursData) {
      setFournisseurs(fournisseursData.map(f => f.name));
    }
  }, [fournisseursData]);

  const handleAdd = async () => {
    if (!newFournisseur.name.trim()) {
      setError('Le nom du fournisseur est requis');
      return;
    }
    if (fournisseurs.includes(newFournisseur.name.trim())) {
      setError('Ce fournisseur existe déjà');
      return;
    }

    try {
        await add({
            name: newFournisseur.name.trim(),
            contact: newFournisseur.contact.trim(),
            email: newFournisseur.email.trim(),
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          setNewFournisseur({ name: '', contact: '', email: '' });
          setError('');
    } catch (err) {
      console.error('Erreur ajout fournisseur:', err);
      setError("Impossible d'ajouter ce fournisseur.");
    }
  };

  const handleRemove = async (index: number) => {
    const fournisseurToRemove = fournisseursData?.find(f => f.name === fournisseurs[index]);
    if (!fournisseurToRemove) return;
    try {
      await remove(fournisseurToRemove.id);
    } catch (err) {
      console.error('Erreur suppression fournisseur:', err);
      setError("Impossible de supprimer ce fournisseur.");
    }
  };

  const handleEditSave = async (index: number) => {
    if (!editValue.trim()) {
      setError('Le nom ne peut pas être vide');
      return;
    }
    if (fournisseurs.includes(editValue.trim()) && editValue.trim() !== fournisseurs[index]) {
      setError('Ce fournisseur existe déjà');
      return;
    }

    const fournisseurToUpdate = fournisseursData?.find(f => f.name === fournisseurs[index]);
    if (!fournisseurToUpdate) return;
    try {
      await update(fournisseurToUpdate.id, {
        name: editValue.trim(),
        updatedAt: new Date(),
      });
      setEditingIndex(null);
      setError('');
    } catch (err) {
      console.error('Erreur modification fournisseur:', err);
      setError("Impossible de modifier ce fournisseur.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(fournisseurs);
    onClose();
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
                <Factory className="w-5 h-5 mr-2 text-primary" />
                Gérer les Fournisseurs
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
              <div className="space-y-4">
  <div>
    <label className="block text-sm font-medium text-muted-foreground mb-1">
      Nom du fournisseur *
    </label>
    <input
      type="text"
      value={newFournisseur.name}
      onChange={(e) => {
        setNewFournisseur({ ...newFournisseur, name: e.target.value });
        setError('');
      }}
      className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
      placeholder="Ex : Fournisseur Delta"
    />
  </div>

  <div>
    <label className="block text-sm font-medium text-muted-foreground mb-1">
      Contact
    </label>
    <input
      type="text"
      value={newFournisseur.contact}
      onChange={(e) =>
        setNewFournisseur({ ...newFournisseur, contact: e.target.value })
      }
      className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
      placeholder="Ex : 06 11 22 33 44"
    />
  </div>

  <div>
    <label className="block text-sm font-medium text-muted-foreground mb-1">
      Email
    </label>
    <input
      type="email"
      value={newFournisseur.email}
      onChange={(e) =>
        setNewFournisseur({ ...newFournisseur, email: e.target.value })
      }
      className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
      placeholder="exemple@fournisseur.fr"
    />
  </div>

  <div className="flex justify-end pt-2">
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      type="button"
      onClick={handleAdd}
      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
    >
      Ajouter le fournisseur
    </motion.button>
  </div>
</div>

              </div>

              {error && (
                <div className="flex items-center text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-muted-foreground">
                  Fournisseurs existants
                </label>
                <div className="space-y-2">
                  {fournisseurs.map((f, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-accent/50 p-2 rounded-lg group"
                    >
                      {editingIndex === index ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => {
                            setEditValue(e.target.value);
                            setError('');
                          }}
                          className="flex-1 px-2 py-1 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mr-2"
                          autoFocus
                        />
                      ) : (
                        <span>{f}</span>
                      )}
                      <div className="flex items-center space-x-1">
                        {editingIndex === index ? (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => handleEditSave(index)}
                            className="p-1.5 hover:bg-background/50 rounded-lg transition-colors"
                          >
                            <Check className="w-4 h-4 text-green-500" />
                          </motion.button>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => {
                              setEditingIndex(index);
                              setEditValue(f);
                            }}
                            className="p-1.5 hover:bg-background/50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Edit2 className="w-4 h-4 text-muted-foreground" />
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={() => handleRemove(index)}
                          className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </motion.button>
                      </div>
                    </div>
                  ))}
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
                  Enregistrer
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
