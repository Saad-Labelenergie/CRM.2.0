import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Plus, Tag, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import { useCategories } from '../../../lib/hooks/useCategories';

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categories: string[]) => void;
}

export function ManageCategoriesModal({ isOpen, onClose, onSave }: ManageCategoriesModalProps) {
  const { data: categoriesData, add: addCategory, update: updateCategory, remove: removeCategory } = useCategories();
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (categoriesData) {
      setCategories(categoriesData.map(cat => cat.name));
    }
  }, [categoriesData]);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      setError('La catégorie ne peut pas être vide');
      return;
    }

    if (categories.includes(newCategory.trim())) {
      setError('Cette catégorie existe déjà');
      return;
    }

    try {
      await addCategory({
        name: newCategory.trim(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      setNewCategory('');
      setError('');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la catégorie:', error);
      setError('Une erreur est survenue lors de l\'ajout de la catégorie');
    }
  };

  const handleRemoveCategory = async (index: number) => {
    try {
      const categoryToRemove = categoriesData?.find(cat => cat.name === categories[index]);
      if (categoryToRemove) {
        await removeCategory(categoryToRemove.id);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la catégorie:', error);
      setError('Une erreur est survenue lors de la suppression de la catégorie');
    }
  };

  const handleEditSave = async (index: number) => {
    if (!editValue.trim()) {
      setError('La catégorie ne peut pas être vide');
      return;
    }

    if (categories.includes(editValue.trim()) && editValue.trim() !== categories[index]) {
      setError('Cette catégorie existe déjà');
      return;
    }

    try {
      const categoryToUpdate = categoriesData?.find(cat => cat.name === categories[index]);
      if (categoryToUpdate) {
        await updateCategory(categoryToUpdate.id, {
          name: editValue.trim(),
          updatedAt: new Date()
        });
      }
      setEditingIndex(null);
      setError('');
    } catch (error) {
      console.error('Erreur lors de la modification de la catégorie:', error);
      setError('Une erreur est survenue lors de la modification de la catégorie');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(categories);
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
                <Tag className="w-5 h-5 mr-2 text-primary" />
                Gérer les catégories
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
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Nouvelle catégorie
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => {
                      setNewCategory(e.target.value);
                      setError('');
                    }}
                    className="flex-1 px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Nom de la catégorie"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleAddCategory}
                    className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </motion.button>
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
                  Catégories existantes
                </label>
                <div className="space-y-2">
                  {categories.map((category, index) => (
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
                        <span>{category}</span>
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
                              setEditValue(category);
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
                          onClick={() => handleRemoveCategory(index)}
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