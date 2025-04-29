import { useFirebase } from './useFirebase';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';


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
  products?: Product[]; // ✅ AJOUTE CECI
  team?: string;
  startDate?: string;
  status?: 'en_attente' | 'charger' | 'en_cours' | 'terminer';
  type?: string;
  appointments?: any[]; // adapte si typé
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
    await updateDoc(projectRef, { status: newStatus });
    console.log(`Statut du projet ${projectId} mis à jour: ${newStatus}`);
    return { id: projectId, status: newStatus };
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
      documents: updatedDocuments
    });
    console.log(`Documents du projet ${projectId} mis à jour`, updatedDocuments);
  } catch (error) {
    console.error('Erreur Firestore:', error);
    throw error;
  }
}