import { useState, useEffect } from 'react';
import { 
  getDocs,
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  getDoc,
  setDoc,
  QuerySnapshot,
  FirestoreError
} from 'firebase/firestore';
import { Query } from 'firebase/firestore';
interface FirebaseOptions {
  conditions?: { field: string; operator: string; value: any }[];
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
}

export function useFirebase<T>(collectionName: string, options: FirebaseOptions = {}) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let q: Query = query(collection(db, collectionName));

    if (options.conditions) {
      q = query(q, ...options.conditions.map(c => where(c.field, c.operator as any, c.value)));
    }

    if (options.orderByField) {
      q = query(q, orderBy(options.orderByField, options.orderDirection || 'asc'));
    }

    const unsubscribe = onSnapshot(q, 
      (snapshot: QuerySnapshot) => {
        // Utiliser un Map avec une clé composite
        const uniqueDocs = new Map();
        
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          const key = `${doc.id}-${data.status || 'default'}`;
          
          // Get existing document from the Map
          const existingDoc = uniqueDocs.get(key);
          const currentTimestamp = data.updatedAt?.toDate()?.getTime() || 0;
          
          if (!existingDoc || (existingDoc.updatedAt?.getTime() || 0) < currentTimestamp) {
            uniqueDocs.set(key, {
              id: data.id, // ID numérique
              _id: doc.id, // ID Firestore
              ...data,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date()
            });
          }
        });
        
        const sortedData = Array.from(uniqueDocs.values())
          .sort((a: any, b: any) => b.updatedAt.getTime() - a.updatedAt.getTime());
        
        setData(sortedData as T[]);
        setLoading(false);
      },
      (err: FirestoreError) => {
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, options]);

  const add = async (item: Omit<T, 'id'>) => {
    try {
      // Créer un nouvel objet sans le champ id
      const { id, ...itemWithoutId } = item as any;
      
      const docRef = await addDoc(collection(db, collectionName), {
        ...itemWithoutId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      // Update the document with the Firestore ID
      await updateDoc(docRef, {
        id: docRef.id
      });
      
      return docRef.id;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const update = async (id: string | number, item: Partial<T>) => {
    try {
      // Find the document in the current data using the numeric ID
      const existingDoc = data.find(doc => (doc as any).id.toString() === id.toString());
      if (!existingDoc) {
        throw new Error(`Document with ID ${id} not found in collection ${collectionName}`);
      }
  
      // Get the Firestore document ID from the document data
      const firestoreId = (existingDoc as any)._id || (existingDoc as any).firestoreId;
      if (!firestoreId) {
        throw new Error(`Firestore ID not found for document ${id}`);
      }
  
      const docRef = doc(db, collectionName, firestoreId);
      await updateDoc(docRef, {
        ...item,
        updatedAt: Timestamp.now()
      });
    } catch (err: any) {
      console.error('Operation error:', {
        error: err,
        path: `${collectionName}/${id}`,
        data: item
      });
      throw err;
    }
  };

  // const remove = async (id: string | number) => {
  //   try {
  //     // Find the document in the current data using the numeric ID
  //     const existingDoc = data.find(doc => (doc as any).id.toString() === id.toString());
  //     if (!existingDoc) {
  //       throw new Error(`Document with ID ${id} not found in collection ${collectionName}`);
  //     }
  
  //     // Get the Firestore document ID from the document data
  //     const firestoreId = (existingDoc as any)._id || (existingDoc as any).firestoreId;
  //     if (!firestoreId) {
  //       throw new Error(`Firestore ID not found for document ${id}`);
  //     }
  
  //     const docRef = doc(db, collectionName, firestoreId);
  //     await deleteDoc(docRef);
  //   } catch (err: any) {
  //     setError(err.message);
  //     throw err;
  //   }
  // };

   const remove = async (collectionName: string, name: string) => {
    try {
      const q = query(collection(db, collectionName), where("name", "==", name));
      const snapshot = await getDocs(q);
  
      if (snapshot.empty) {
        throw new Error(`Aucun document trouvé avec le nom "${name}"`);
      }
  
      // Si plusieurs documents ont le même nom, on les supprime tous
      for (const docSnap of snapshot.docs) {
        await deleteDoc(doc(db, collectionName, docSnap.id));
      }
  
      console.log(`Produit "${name}" supprimé avec succès.`);
    } catch (error) {
      console.error("Erreur lors de la suppression par nom :", error);
      throw error;
    }
  };

  return {
    data,
    loading,
    error,
    add,
    update,
    remove
  };
}