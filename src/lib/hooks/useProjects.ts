import { useFirebase } from './useFirebase';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

interface StepTimestamp {
  date: string;
  time: string;
  user: string;
}

interface Step {
  id: number;
  name: string;
  status: 'en_attente' | 'valide';
  timestamps: {
    valide?: StepTimestamp;
  };
}

interface Product {
  id: number | string;
  name: string;
  reference?: string;
  quantity?: number;
  unit?: string;
  type?: string;
}

interface Project {
  id: string;
  name: string;
  client: {
    id: string;
    name: string;
  };
  products?: Product[];
  steps?: Step[]; // ✅ Ajout du tableau des étapes
  team?: string;
  startDate?: string;
  status?: 'en_attente' | 'charger' | 'en_cours' | 'terminer';
  type?: string;
  appointments?: any[];
  documents?: {
    pieceIdentite: boolean;
    avisImpot: boolean;
    taxeFonciere: boolean;
  };
}

export function useProjects() {
  return useFirebase<Project>('projects', { orderByField: 'startDate' });
}

export async function updateProjectStatus(projectId: string, newStatus: string) {
  const db = getFirestore();
  const projectRef = doc(db, 'projects', projectId);

  try {
    await updateDoc(projectRef, { 
      status: newStatus,
      updatedAt: new Date() 
    });
    console.log(`Statut du projet ${projectId} mis à jour: ${newStatus}`);
    return { id: projectId, status: newStatus };
  } catch (error) {
    console.error('Erreur Firestore:', error);
    throw error;
  }
}

export async function updateProjectSteps(projectId: string, updatedSteps: Step[]) {
  const db = getFirestore();
  const projectRef = doc(db, 'projects', projectId);

  try {
    await updateDoc(projectRef, {
      steps: updatedSteps,
      updatedAt: new Date()
    });
    console.log(`Étapes du projet ${projectId} mises à jour`);
    return { id: projectId, steps: updatedSteps };
  } catch (error) {
    console.error('Erreur Firestore:', error);
    throw error;
  }
}

export async function updateProjectDocuments(projectId: string, updatedDocuments: any) {
  const db = getFirestore();
  const projectRef = doc(db, 'projects', projectId);

  try {
    await updateDoc(projectRef, {
      documents: updatedDocuments,
      updatedAt: new Date()
    });
    console.log(`Documents du projet ${projectId} mis à jour`, updatedDocuments);
  } catch (error) {
    console.error('Erreur Firestore:', error);
    throw error;
  }
}