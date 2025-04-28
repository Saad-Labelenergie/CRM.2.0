import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Package, CheckCircle, Truck, AlertTriangle } from 'lucide-react';

interface Material {
  id: number;
  name: string;
  status: 'not_loaded' | 'loaded' | 'installed' | 'not_installed';
}

interface Project {
  id: string;
  name: string;
  hours: number;
  date: string;
  teamId?: string;
  materials?: Material[];
  projectId?: string;
}

interface MaterialLoadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onUpdateMaterials: (projectId: string, materials: Material[]) => void;
}

export function MaterialLoadingModal({ isOpen, onClose, project, onUpdateMaterials }: MaterialLoadingModalProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [renderKey, setRenderKey] = useState(0); // Ajouter un état pour forcer le rendu

  // Initialiser les matériaux lorsque le modal s'ouvre
  useEffect(() => {
    if (isOpen && project.materials) {
      setMaterials([...project.materials]);
    }
  }, [isOpen, project]);

  // Dans la fonction handleToggleMaterial, assurons-nous que l'état est correctement mis à jour
  const handleToggleMaterial = (materialId: number) => {
    console.log("Toggling material:", materialId);
    setMaterials(prevMaterials => {
      const newMaterials = prevMaterials.map(material => 
        material.id === materialId 
          ? { 
              ...material, 
              status: material.status === 'loaded' 
                ? 'not_loaded' as const 
                : 'loaded' as const 
            } 
          : material
      );
      console.log("New materials state:", newMaterials);
      return newMaterials;
    });
  };
  
  // Ajoutons un useEffect pour déboguer les changements d'état
  useEffect(() => {
    console.log("Materials state in modal:", materials);
  }, [materials]);
  
  // Dans la fonction handleSave, assurons-nous que les données sont correctement formatées
  const handleSave = async () => {
    // Utiliser projectId s'il existe, sinon utiliser l'ID du projet
    const idToUse = project.projectId || project.id;
    
    if (!idToUse) {
      console.error("ID du projet manquant");
      return;
    }
    
    setIsLoading(true);
    try {
      console.log("Saving materials:", materials);
      await onUpdateMaterials(idToUse, materials);
      onClose(); // Fermer le modal après une sauvegarde réussie
    } catch (error) {
      console.error("Erreur lors de la mise à jour des matériaux:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const allLoaded = materials.every(m => m.status === 'loaded');
  const anyLoaded = materials.some(m => m.status === 'loaded');
  const noneLoaded = materials.every(m => m.status === 'not_loaded');

  if (!isOpen) return null;

  // Utiliser renderKey dans le rendu pour forcer un nouveau rendu
  return (
    <div key={renderKey} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card rounded-xl shadow-xl w-full max-w-md overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <h2 className="text-lg font-semibold">Chargement des matériels</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-accent/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <h3 className="font-medium">{project.name}</h3>
            <p className="text-sm text-muted-foreground">Date: {project.date}</p>
          </div>

          <div className="space-y-3 mb-6">
            <p className="text-sm font-medium">Matériels à charger:</p>
            {materials.map((material) => (
              <div
                key={material.id}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  material.status === 'loaded' 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                    : 'bg-accent/50 hover:bg-accent'
                }`}
                onClick={() => handleToggleMaterial(material.id)}
              >
                <div className="flex items-center">
                  {material.status === 'loaded' ? (
                    <CheckCircle className="w-5 h-5 mr-2" />
                  ) : (
                    <Package className="w-5 h-5 mr-2" />
                  )}
                  <span>{material.name}</span>
                </div>
                <div className="text-xs font-medium">
                  {material.status === 'loaded' ? 'Chargé' : 'Non chargé'}
                </div>
              </div>
            ))}
          </div>

          {/* Statut global */}
          <div className={`p-3 rounded-lg mb-4 ${
            allLoaded ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
            noneLoaded ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
            'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
          }`}>
            <div className="flex items-center">
              {allLoaded ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : noneLoaded ? (
                <AlertTriangle className="w-5 h-5 mr-2" />
              ) : (
                <Truck className="w-5 h-5 mr-2" />
              )}
              <span>
                {allLoaded ? 'Tous les matériels sont chargés' :
                 noneLoaded ? 'Aucun matériel n\'est chargé' :
                 'Chargement partiel des matériels'}
              </span>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-accent hover:bg-accent/80 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}