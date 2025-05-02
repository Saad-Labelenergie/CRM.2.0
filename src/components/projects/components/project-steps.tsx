import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  ChevronUp,
  ChevronDown,
  Boxes,
  Play,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { db } from '../../../lib/firebase';
import { updateDoc, doc } from 'firebase/firestore';

async function updateProjectStatus(projectId: string, newStatus: string) {
  try {
    const projectRef = doc(db, "projects", projectId);
    await updateDoc(projectRef, {
      status: newStatus,
      updatedAt: new Date(),
    });
    console.log("Statut du projet mis à jour :", newStatus);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut du projet :", error);
  }
}

const getNewProjectStatus = (stepId: number): string => {
  if (stepId >= 2 && stepId <= 6) return "encours";
  if (stepId === 7) return "terminer";
  return "en_cours";
};

type StepStatus = 'commencer' | 'en_cours' | 'terminer';

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
    commencer?: StepTimestamp;
    en_cours?: StepTimestamp;
    terminer?: StepTimestamp;
  };
}

interface ProjectStepsProps {
  steps: Step[];
  showStepHistory: number[];
  onToggleHistory: (stepId: number) => void;
  onStepStatusChange: (stepId: number) => void;
  projectId: string;
}

const getStepIcon = (status: StepStatus) => {
  switch (status) {
    case 'commencer':
      return <Play className="w-4 h-4" />;
    case 'en_cours':
      return <Loader2 className="w-4 h-4 animate-spin" />;
    case 'terminer':
      return <CheckCircle className="w-4 h-4" />;
    default:
      return <Boxes className="w-4 h-4" />;
  }
};

const getStepStyle = (status: StepStatus, isActive: boolean) => {
  if (!isActive) {
    return 'bg-gray-100 border-gray-300 text-gray-400 dark:bg-gray-800/30 dark:text-gray-500';
  }

  switch (status) {
    case 'commencer':
      return 'bg-orange-100 border-orange-500 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    case 'en_cours':
      return 'bg-purple-100 border-purple-500 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
    case 'terminer':
      return 'bg-green-100 border-green-500 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    default:
      return 'bg-background border-muted-foreground text-muted-foreground';
  }
};

const getStepLabel = (stepId: number) => {
  switch (stepId) {
    case 2  :
      return 'Arriver sur place';
    case 3:
      return 'Photos avant chantier (6 photos)';
    case 4:
      return 'Récupération documents client';
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

const isStepActive = (steps: Step[], currentStepIndex: number): boolean => {
  if (currentStepIndex === 0) return true;
  const previousStep = steps[currentStepIndex - 1];
  return previousStep.status === 'terminer';
};

export function ProjectSteps({
  steps,
  showStepHistory,
  onToggleHistory,
  onStepStatusChange,
  projectId
}: ProjectStepsProps) {
  const handleStepStatusChange = async (stepId: number) => {
    onStepStatusChange(stepId);
    const newStatus = getNewProjectStatus(stepId);
    await updateProjectStatus(projectId, newStatus);
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
    >
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
        Étapes du projet
      </h2>
      <div className="relative space-y-6 ml-4">
        {/* Ligne verticale principale */}
        <div className="absolute top-4 left-4 w-0.5 h-full bg-muted-foreground" />

        {steps
          .filter(step => step.id !== 1) // Exclusion de "Chargement"
          .map((step, index, filteredSteps) => {
            const showHistory = showStepHistory.includes(step.id);
            const isActive = isStepActive(filteredSteps, index);

            return (
              <div key={step.id} className="relative flex items-start">
                <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 ${getStepStyle(step.status, isActive)}`}>
                  {getStepIcon(step.status)}
                </div>

                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`font-medium ${!isActive ? 'text-gray-400 dark:text-gray-500' : ''}`}>
                        {step.name}
                      </div>
                      <div className={`text-sm ${!isActive ? 'text-gray-400 dark:text-gray-500' : 'text-muted-foreground'}`}>
                        {getStepLabel(step.id)}
                        {step.timestamps[step.status] && (
                          <>
                            <span className="mx-2">•</span>
                            {format(new Date(`${step.timestamps[step.status]?.date}T${step.timestamps[step.status]?.time}`), 'dd MMMM yyyy HH:mm', { locale: fr })}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onToggleHistory(step.id)}
                        className={`p-2 hover:bg-accent rounded-lg transition-colors ${!isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!isActive}
                      >
                        {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </motion.button>
                      {step.status !== 'terminer' && (
                        <motion.button
                          whileHover={isActive ? { scale: 1.05 } : {}}
                          whileTap={isActive ? { scale: 0.95 } : {}}
                          onClick={() => isActive && handleStepStatusChange(step.id)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            !isActive
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800/30 dark:text-gray-500'
                              : step.status === 'commencer'
                              ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400'
                              : step.status === 'en_cours'
                              ? 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400'
                              : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                          }`}
                          disabled={!isActive}
                        >
                          {step.status === 'commencer' && 'Démarrer'}
                          {step.status === 'en_cours' && 'Terminer'}
                        </motion.button>
                      )}
                    </div>
                  </div>

                  {showHistory && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 space-y-2"
                    >
                      {(['commencer', 'en_cours', 'terminer'] as const).map((status) => {
                        const timestamp = step.timestamps[status];
                        if (!timestamp) return null;

                        return (
                          <div
                            key={status}
                            className="flex items-center justify-between p-2 bg-accent/50 rounded-lg text-sm"
                          >
                            <div className="flex items-center">
                              {getStepIcon(status)}
                              <span className="font-medium ml-2">{getStepLabel(step.id)}</span>
                            </div>
                            <div className="text-muted-foreground">
                              <span>{format(new Date(`${timestamp.date}T${timestamp.time}`), 'dd/MM/yyyy HH:mm')}</span>
                              <span className="mx-2">•</span>
                              <span>{timestamp.user}</span>
                            </div>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </motion.div>
  );
}
