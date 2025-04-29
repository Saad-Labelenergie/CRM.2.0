import React, { useState } from 'react';
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





export function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, updateProjectMaterials } = useScheduling();
  const [showStepHistory, setShowStepHistory] = useState<number[]>([]);
  const [showAllComments, setShowAllComments] = useState(false);

  const [steps, setSteps] = useState<Step[]>([
    {
      id: 1,
      name: 'Chargement',
      status: 'charger',
      timestamps: {},
    },
    {
      id: 2,
      name: 'Arriver sur place',
      status: 'charger',
      timestamps: {},
    },
    {
      id: 3,
      name: 'Photos avant chantier',
      status: 'charger',
      timestamps: {},
    },
    {
      id: 4,
      name: 'Récupération documents client',
      status: 'charger',
      timestamps: {},
    },
    {
      id: 5,
      name: 'Commencer',
      status: 'charger',
      timestamps: {},
    },
    {
      id: 6,
      name: 'Terminé',
      status: 'charger',
      timestamps: {},
    },
    {
      id: 7,
      name: 'Dossier signé',
      status: 'charger',
      timestamps: {},
    },
  ]);
  
  const onStepStatusChange = (stepId: number) => {
    setSteps((prevSteps) =>
      prevSteps.map((step) => {
        if (step.id === stepId) {
          if (step.status === 'charger') return { ...step, status: 'commencer' };
          if (step.status === 'commencer') return { ...step, status: 'en_cours' };
          if (step.status === 'en_cours') return { ...step, status: 'terminer' };
        }
        return step;
      })
    );
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
  
    // Détermine le nouveau statut global du projet
    const getNewProjectStatus = (stepId: number): string => {
      if (stepId === 1) return "charger";
      if (stepId >= 2 && stepId <= 5) return "en_cours";
      if (stepId === 7) return "terminer";
      return "en_cours";
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
  onToggleHistory={handleToggleHistory}
  onStepStatusChange={handleStepStatusChange}
  projectId={project.id}
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