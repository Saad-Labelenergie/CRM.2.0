import { 
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from '../firebase';

// Generic CRUD operations
export const createDocument = async (collectionName: string, data: any) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error: any) {
    throw new Error(`Error creating document: ${error.message}`);
  }
};

export const updateDocument = async (collectionName: string, docId: string, data: any) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  } catch (error: any) {
    throw new Error(`Error updating document: ${error.message}`);
  }
};

export const deleteDocument = async (collectionName: string, docId: string) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error: any) {
    throw new Error(`Error deleting document: ${error.message}`);
  }
};

export const getDocument = async (collectionName: string, docId: string) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error: any) {
    throw new Error(`Error getting document: ${error.message}`);
  }
};

export const getDocuments = async (
  collectionName: string,
  conditions?: { field: string; operator: any; value: any }[],
  orderByField?: string,
  orderDirection?: 'asc' | 'desc'
) => {
  try {
    let q = collection(db, collectionName);

    if (conditions) {
      q = query(q, ...conditions.map(c => where(c.field, c.operator, c.value)));
    }

    if (orderByField) {
      q = query(q as any, orderBy(orderByField, orderDirection || 'asc'));
    }

    const querySnapshot = await getDocs(q as any);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error: any) {
    throw new Error(`Error getting documents: ${error.message}`);
  }
};

// Collection-specific operations
export const getTeams = async () => {
  return getDocuments('teams', undefined, 'name', 'asc');
};

export const getClients = async () => {
  return getDocuments('clients', undefined, 'name', 'asc');
};

export const getProjects = async () => {
  return getDocuments('projects', undefined, 'createdAt', 'desc');
};

export const getAppointments = async () => {
  return getDocuments('appointments', undefined, 'date', 'asc');
};