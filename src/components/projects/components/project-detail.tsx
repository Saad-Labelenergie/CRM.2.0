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

const mockMaterials = [
  {
    id: 1,
    name: "Climatiseur Mural 9000 BTU",
    reference: "CLIM-MUR-9000",
    quantity: 2,
    installed: 0,
    unit: "unité",
    status: "pending"
  },
  {
    id: 2,
    name: "Support mural",
    reference: "SUP-MUR-001",
    quantity: 4,
    installed: 0,
    unit: "pièce",
    status: "pending"
  }
];

const mockSteps = [
  {
    id: 1,
    name: "Chargement du matériel",
    status: "charger",
    timestamps: {
      charger: {
        date: "2024-02-20",
        time: "08:00",
        user: "Jean D."
      }
    }
  },
  {
    id: 2,
    name: "Installation",
    status: "commencer",
    timestamps: {
      charger: {
        date: "2024-02-20",
        time: "08:00",
        user: "Jean D."
      },
      commencer: {
        date: "2024-02-20",
        time: "09:30",
        user: "Jean D."
      }
    }
  },
  {
    id: 3,
    name: "Tests et mise en service",
    status: "commencer",
    timestamps: {
      charger: {
        date: "2024-02-20",
        time: "08:00",
        user: "Jean D."
      }
    }
  }
];

const mockComments = [
  {
    id: 1,
    author: "Jean D.",
    date: "2024-02-20T08:00:00",
    content: "Matériel chargé et vérifié"
  },
  {
    id: 2,
    author: "Sophie M.",
    date: "2024-02-20T09:30:00",
    content: "Installation démarrée"
  },
  {
    id: 3,
    author: "Pierre L.",
    date: "2024-02-20T11:15:00",
    content: "Support client contacté pour validation emplacement"
  }
];

export function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, updateProjectMaterials } = useScheduling();
  const [showStepHistory, setShowStepHistory] = useState<number[]>([]);
  const [showAllComments, setShowAllComments] = useState(false);

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

  const handleStepStatusChange = (stepId: number) => {
    // Logique de changement de statut
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
      />

      <ProjectSteps
        steps={mockSteps}
        showStepHistory={showStepHistory}
        onToggleHistory={handleToggleHistory}
        onStepStatusChange={handleStepStatusChange}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProjectInfo
          type={project.type}
          startDate={project.startDate}
          team={project.team || 'Non assigné'}
          status={project.status}
          progress={75}
        />

        <ProjectMaterials
          materials={project.materials || mockMaterials}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProjectDocuments
          documents={[
            {
              id: 1,
              name: "Devis signé",
              status: "received",
              date: "2024-02-15",
              isDefault: true
            },
            {
              id: 2,
              name: "Bon de commande",
              status: "received",
              date: "2024-02-15",
              isDefault: true
            },
            {
              id: 3,
              name: "PV de réception",
              status: "pending",
              date: null,
              isDefault: true
            }
          ]}
          onDocumentToggle={handleDocumentToggle}
        />

        <ProjectComments
          comments={mockComments}
          showAllComments={showAllComments}
          onToggleShowAll={() => setShowAllComments(!showAllComments)}
        />
      </div>
    </motion.div>
  );
}