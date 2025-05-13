import { useFirebase } from './useFirebase';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

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

export const updateProjectStatus = async (projectId: string, newStatus: string) => {
  try {
    // Vérifier si le document existe
    const projectRef = doc(db, 'projects', projectId);
    const projectSnap = await getDoc(projectRef);
    
    if (projectSnap.exists()) {
      // Le document existe, on peut le mettre à jour
      await updateDoc(projectRef, {
        status: newStatus,
        updatedAt: new Date()
      });
      console.log(`Statut du projet mis à jour: ${newStatus}`);
    } else {
      // Le document n'existe pas, on peut le créer ou chercher le bon ID
      console.log(`Le projet avec l'ID ${projectId} n'existe pas dans Firestore`);
      
      // Rechercher le projet par d'autres moyens (par exemple par son nom)
      // Cette partie dépend de votre structure de données
    }
  } catch (error) {
    console.error('Erreur Firestore:', error);
    throw error;
  }
};

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