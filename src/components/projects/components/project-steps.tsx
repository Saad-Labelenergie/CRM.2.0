import React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Boxes,
} from 'lucide-react';
import { db } from '../../../lib/firebase';
import { updateDoc, doc } from 'firebase/firestore';

async function updateProjectStatus(projectId: string, newStatus: string, user: string) {
  try {
    const projectRef = doc(db, "projects", projectId);
    await updateDoc(projectRef, {
      status: newStatus,
      updatedAt: new Date(),
      lastUpdatedBy: user
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour :", error);
  }
}



type StepStatus = 'en_attente' | 'valide';

interface StepTimestamp {
  date: string;
  time: string;
  user: string;
}

interface Step {
  id: number;
  name: string;
  status: StepStatus;
  timestamps: {
    valide?: StepTimestamp;
  };
}

interface ProjectStepsProps {
  steps: Step[];
  showStepHistory: number[];
  onToggleHistory: (stepId: number) => void;
  onStepStatusChange: (stepId: number, updatedSteps: Step[]) => void;
  projectId: string;
  client: any; 
  projectStatus: string;
}

const getStepIcon = (status: StepStatus) => {
  return status === 'valide'
    ? <CheckCircle className="w-4 h-4 text-green-500" />
    : <Boxes className="w-4 h-4 text-gray-400" />;
};

const getStepStyle = (status: StepStatus, isActive: boolean) => {
  if (!isActive) {
    return 'bg-gray-100 border-gray-300 text-gray-400 dark:bg-gray-800/30 dark:text-gray-500';
  }

  return status === 'valide'
    ? 'bg-green-100 border-green-500 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    : 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
};

const getStepLabel = (stepId: number) => {
  switch (stepId) {
    case 2:
      return 'Arriver sur place';
    case 3:
      return 'Photos avant chantier (6 photos)';
    case 4:
      return 'Récupération documents client';
      case 4.5:
        return'Récuperation du reste a charge';
    case 5:
      return 'Commencer';
    case 6:
      return 'Terminé (12 photos après chantier)';
    case 7:
      return 'Dossier signé';
    default:
      return '';
  }
};





export function ProjectSteps({ steps, onStepStatusChange, projectId, projectStatus}: ProjectStepsProps) {
  const [loadingStepId, setLoadingStepId] = useState<number | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmingStepId, setConfirmingStepId] = useState<number | null>(null);
  const client = steps?.[0]?.clientInfo || null; // ou passe-le via props
  const stepsWithRAC = [...steps];

  const isStepActive = (steps: Step[], currentStepIndex: number): boolean => {
    if (currentStepIndex === 0) return true; // Première étape toujours active
    if (currentStepIndex === 1) return steps[0].status === 'valide'; // Activation conditionnelle
    // Ajouter plus de logique si nécessaire pour les autres étapes
    return stepsWithRAC[currentStepIndex - 1]?.status === 'valide';
  };
  

  const hasRAC = (client: any): boolean => {
    return client?.RAC?.hasToCollect === true;
  };
  
  if (hasRAC(client) && !steps.find(step => step.id === 4.5)) {
    const racStep = {
      id: 4.5,
      name: 'Reste à charge à récupérer',
      status: 'en_attente' as StepStatus,
      timestamps: {}
    };
  
    const indexToInsert = steps.findIndex(step => step.id === 4);
    stepsWithRAC.splice(indexToInsert + 1, 0, racStep);
  }

  const handleStepStatusChange = async (stepId: number) => {
    setLoadingStepId(stepId);
    try {
      const user = "Nom de l'utilisateur"; // Remplacez par le vrai utilisateur
      const newStatus = stepId === 7 ? 'terminer' : 'encours';
      await updateProjectStatus(projectId, newStatus, user);
    } finally {
      setLoadingStepId(null);
    }
  };
  const formatDateTime = () => {
    const now = new Date();
    return {
      date: now.toLocaleDateString('fr-FR'),
      time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
  };
// Modifiez la fonction handleValidation dans ProjectSteps :
const handleValidation = async () => {
  if (confirmingStepId !== null) {
    const { date, time } = formatDateTime();
    
    // Crée une copie mise à jour des steps
    const updatedSteps = steps.map(step => {
      if (step.id === confirmingStepId) {
        return {
          ...step,
          status: 'valide' as StepStatus,
          timestamps: {
            ...step.timestamps,
            valide: { 
              date, 
              time,
              user: "Utilisateur Actuel" // À remplacer par l'utilisateur réel
            }
          }
        };
      }
      return step;
    });

    // Met à jour le parent ET Firestore
    onStepStatusChange(confirmingStepId, updatedSteps);
    
    await handleStepStatusChange(confirmingStepId);
  }
  setShowConfirmationModal(false);
  setConfirmingStepId(null);
};


  return (
    <motion.div
      className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
    >
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
        Étapes du projet
      </h2>
      
      <div className="space-y-6">
        {stepsWithRAC.map((step, index) => {
          const isActive = isStepActive(steps, index);

          return (
            <div key={step.id} className="flex items-start">
              <div className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 ${getStepStyle(step.status, isActive)}`}>
                {getStepIcon(step.status)}
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`font-medium ${!isActive ? 'text-gray-400 dark:text-gray-500' : ''}`}>
                      {step.name}
                    </div>
                    <div className={`text-sm ${!isActive ? 'text-gray-400 dark:text-gray-500' : 'text-muted-foreground'}`}>
                    <div className={`text-sm ${!isActive ? 'text-gray-400 dark:text-gray-500' : 'text-muted-foreground'}`}>
  {step.id === 2 && step.status === 'valide' && step.timestamps.valide ? (
    <span className="text-green-600">
      {step.timestamps.valide.date} à {step.timestamps.valide.time}
    </span>
  ) : step.id === 4.5 && client?.RAC?.amount ? (
    <>
      {getStepLabel(step.id)}<br />
      <span className="font-semibold text-blue-600">
        Montant à récupérer : {client.RAC.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
      </span>
    </>
  ) : (
    getStepLabel(step.id)
  )}
</div>

</div>
                  </div>
                  {step.status !== 'valide' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (isActive && !loadingStepId) {
                          setConfirmingStepId(step.id);
                          setShowConfirmationModal(true);
                        }
                      }}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        !isActive || loadingStepId === step.id || projectStatus === 'placer'
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800/30 dark:text-gray-500'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}
                      
                      disabled={!isActive || loadingStepId === step.id}
                      >
                      {loadingStepId === step.id ? 'Traitement...' : 'Valider cette étape'}
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de confirmation */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Confirmer la validation</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Êtes-vous sûr de vouloir valider cette étape ?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={handleValidation}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}