import React, { useState,useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ProjectHeader } from './project-header';
import { ProjectInfo } from './project-info';
import { ProjectSteps } from './project-steps';
import { ProjectMaterials } from './project-materials';
import { ProjectDocuments } from './project-documents';
import { ProjectComments } from './project-comments';
import { useScheduling } from '../../../lib/scheduling/scheduling-context';
import { useProjects } from '../../../lib/hooks/useProjects';
import { updateProjectStatus } from '../../../lib/hooks/useProjects';
import { doc,updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { updateProjectSteps } from '../../../lib/hooks/useProjects';



export function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, updateProjectMaterials } = useScheduling();
  const [showStepHistory, setShowStepHistory] = useState<number[]>([]);
  const [showAllComments, setShowAllComments] = useState(false);

  const defaultSteps: Step[] = [
    { id: 2, name: "Arriver sur place", status: 'en_attente', timestamps: {} },
    { id: 3, name: "Photos avant chantier", status: 'en_attente', timestamps: {} },
    { id: 4, name: "Récupération documents client", status: 'en_attente', timestamps: {} },
    { id: 5, name: "Commencer", status: 'en_attente', timestamps: {} },
    { id: 6, name: "Terminé", status: 'en_attente', timestamps: {} },
    { id: 7, name: "Dossier signé", status: 'en_attente', timestamps: {} },
  ];
  
  const [steps, setSteps] = useState<Step[]>(defaultSteps);

  useEffect(() => {
    const projectFromStore = projects.find(p => p.id === id);
    if (projectFromStore?.steps && projectFromStore.steps.length > 0) {
      setSteps(projectFromStore.steps);
    }
  }, [projects, id]);
  
  //Changement fait - a voir apres
  const onStepStatusChange = (stepId: number, updatedSteps: Step[]) => {
    console.log("📤 Sauvegarde des steps dans Firestore", updatedSteps);
    setSteps(updatedSteps);
  
    if (project?.id) {
      updateProjectSteps(project.id, updatedSteps);
    }
  };
  
  
  
  const project = projects.find(p => p.id === id);

  if (!project) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Projet non trouvé</h2>
          <button
            onClick={() => navigate('/projects')}
            className="text-primary hover:underline"
          >
            Retour à la liste des projets
          </button>
        </div>
      </div>
    );
  }

  const handleToggleHistory = (stepId: number) => {
    setShowStepHistory(prev =>
      prev.includes(stepId)
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  const handleStepStatusChange = async (stepId: number) => {
    if (!project?.id) return;
  
    // Met à jour localement
    onStepStatusChange(stepId);
    

    // Corection a voir apres
    // Détermine le nouveau statut global du projet
    const getNewProjectStatus = (stepId: number): string => {
      const completedSteps = steps.filter(s => s.status === 'valide').length;
      
      if (completedSteps === steps.length) return 'termine';
      if (completedSteps > 0) return 'en_cours';
      return 'charge';
    };
  
    const newStatus = getNewProjectStatus(stepId);
  
    // Met à jour sur Firestore
    await updateProjectStatus(project.id, newStatus);
  };
  

  const handleDocumentToggle = (docId: number) => {
    // Logique de toggle document
  };

  const handleMaterialStatusChange = (materials: any[]) => {
    if (project.id) {
      updateProjectMaterials(project.id, materials);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
<ProjectHeader
  onBack={() => navigate('/projects')}
  projectName={project.name}
  clientName={project.client.name}
  status={project.status}
  onConfirmClick={() => updateProjectStatus(project.id, 'confirmer')}
/>

<ProjectSteps 
  steps={steps}
  showStepHistory={showStepHistory}
  projectStatus ={project.status}
  onToggleHistory={handleToggleHistory}
  onStepStatusChange={onStepStatusChange}
  projectId={project.id}
  client={project.client} 
  
/>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ProjectInfo
  type={project.type}
  startDate={project.startDate}
  team={project.team || 'Non assigné'}
  status={project.status}
  progress={75}
  onStatusChange={(newStatus) => updateProjectStatus(project.id, newStatus)}
/>


        <ProjectMaterials
          materials={(project.products || []).map((p, index) => ({
            id: p.id || index, // fallback si pas d'ID
            name: p.name,
            reference: p.reference || 'REF-UNKNOWN',
            quantity: p.quantity || 1,
            installed: 0,
            unit: p.unit || 'unité',
            status: 'pending'
          }))}
          onUpdate={handleMaterialStatusChange}

        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ProjectDocuments
  projectId={project.id} 
  documents={project.documents ?? { 
    pieceIdentite: false,
    avisImpot: false,
    taxeFonciere: false
  }}
/>


        <ProjectComments
          projectId={project.id}
          showAllComments={showAllComments}
          onToggleShowAll={() => setShowAllComments(!showAllComments)}
        />
      </div>
    </motion.div>
  );
}