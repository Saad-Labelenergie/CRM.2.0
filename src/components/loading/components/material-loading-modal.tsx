import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Save, Loader2, MessageSquare } from 'lucide-react';
import { useScheduling } from '../../../lib/scheduling/scheduling-context';
import { updateProjectStatus  } from '../../../lib/hooks/useProjects';

interface Material {
  id: number;
  name: string;
  status: 'not_loaded' | 'loaded' | 'installed' | 'not_installed';
  comments?: string; // Add comments property
  updatedAt?: Date; // Add updatedAt property
  updatedBy?: string; // Add updatedBy property
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
  const { addLoadingRecord } = useScheduling();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [renderKey, setRenderKey] = useState(0);
  const [comment, setComment] = useState(''); // Add state for comment
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null); // Track selected material for comment

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
    
    // Force re-render to ensure UI updates
    setRenderKey(prev => prev + 1);
  };

  // Add function to handle adding a comment to a material
  const handleAddComment = (materialId: number) => {
    setSelectedMaterialId(materialId);
  };

  // Function to save comment
  const handleSaveComment = () => {
    if (!selectedMaterialId || !comment.trim()) return;
    
    setMaterials(prevMaterials => {
      return prevMaterials.map(material => 
        material.id === selectedMaterialId 
          ? { ...material, comments: comment.trim() } 
          : material
      );
    });
    
    // Reset comment form
    setComment('');
    setSelectedMaterialId(null);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      console.log("Saving materials:", materials);
      
      // S'assurer que les commentaires sont bien inclus dans les matériaux originaux
      const materialsWithComments = materials.map(material => ({
        ...material,
        // S'assurer que les commentaires sont explicitement définis
        comments: material.comments || ''
      }));
      
      // Create a loading record with comments
      if (project.projectId) {
        // Add updatedAt to each material and ensure status is only 'loaded' or 'not_loaded'
        const updatedMaterials = materialsWithComments.map(material => {
          // Convert any 'installed' or 'not_installed' status to 'loaded' or 'not_loaded'
          let normalizedStatus: 'loaded' | 'not_loaded' = 'not_loaded';
          if (material.status === 'loaded' || material.status === 'installed') {
            normalizedStatus = 'loaded';
          }
          
          return {
            id: material.id,
            name: material.name,
            status: normalizedStatus,
            updatedAt: new Date(),
            // Inclure explicitement les commentaires
            comments: material.comments || '',
            // Only include updatedBy if it's defined
            ...(material.updatedBy ? { updatedBy: material.updatedBy } : {})
          };
        });
        
        // Calculate progress based on loaded materials
        const totalItems = updatedMaterials.length;
        const loadedItems = updatedMaterials.filter(m => m.status === 'loaded').length;
        const progress = totalItems > 0 ? Math.round((loadedItems / totalItems) * 100) : 0;
        
        // Determine status based on progress
        let recordStatus: 'pending' | 'in_progress' | 'completed' = 'pending';
        if (progress === 100) {
          recordStatus = 'completed';
        } else if (progress > 0) {
          recordStatus = 'in_progress';
        }
        
        // Create a record object with all required fields and no undefined values
        const loadingRecord = {
          projectId: project.projectId,
          projectName: project.name || 'Projet sans nom',
          teamId: project.teamId || '',
          teamName: project.teamId ? 'Équipe assignée' : 'Équipe non assignée',
          materials: updatedMaterials,
          date: new Date().toISOString(),
          documentsSubmitted: false,
          progress: progress,
          status: recordStatus
        };
        
        // Log the record to verify no undefined values
        console.log("Sending loading record with comments:", loadingRecord);
        
        await addLoadingRecord(loadingRecord);
      }
      
      // Call the parent component's update function with the materials including comments
      await onUpdateMaterials(project.projectId || project.id, materialsWithComments);
      onClose();
    } catch (error) {
      console.error("Error saving materials:", error);
    } finally {
      setIsLoading(false);
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
            className="relative w-full max-w-lg bg-card p-6 rounded-xl shadow-xl z-50 border border-border/50 mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Gestion des matériels</h2>
              <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <h3 className="font-medium mb-2">Projet: {project.name}</h3>
              <p className="text-sm text-muted-foreground">Date: {project.date}</p>
            </div>
            
            <div className="space-y-4 mb-6">
              {materials.map((material) => (
                <div key={`${material.id}-${renderKey}`} className="bg-accent/50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <button
                        onClick={() => handleToggleMaterial(material.id)}
                        className={`w-5 h-5 rounded mr-3 flex items-center justify-center ${
                          material.status === 'loaded' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        {material.status === 'loaded' && <Check className="w-3 h-3" />}
                      </button>
                      <span>{material.name}</span>
                    </div>
                    <button 
                      onClick={() => handleAddComment(material.id)}
                      className="text-xs px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-md"
                    >
                      <MessageSquare className="w-3 h-3 mr-1 inline" />
                      Commentaire
                    </button>
                  </div>
                  
                  {/* Display comment if it exists */}
                  {material.comments && (
                    <div className="mt-2 text-sm bg-background/50 p-2 rounded">
                      <p className="text-muted-foreground">{material.comments}</p>
                    </div>
                  )}
                  
                  {/* Comment form */}
                  {selectedMaterialId === material.id && (
                    <div className="mt-2">
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Ajouter un commentaire..."
                        className="w-full p-2 text-sm border rounded-md"
                        rows={2}
                      />
                      <div className="flex justify-end mt-1 space-x-2">
                        <button 
                          onClick={() => setSelectedMaterialId(null)}
                          className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md"
                        >
                          Annuler
                        </button>
                        <button 
                          onClick={handleSaveComment}
                          className="text-xs px-2 py-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md"
                        >
                          Enregistrer
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-accent hover:bg-accent/80 rounded-md transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors flex items-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Enregistrer
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}