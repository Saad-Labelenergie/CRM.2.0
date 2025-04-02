import { useState, useEffect } from 'react';
import { 
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
  QueryDocumentSnapshot,
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
          
          // Vérifier si le document existe déjà avec un timestamp plus récent
          const existingDoc = uniqueDocs.get(key);
          const currentTimestamp = data.updatedAt?.toDate()?.getTime() || 0;
          
          if (!existingDoc || (existingDoc.updatedAt?.getTime() || 0) < currentTimestamp) {
            uniqueDocs.set(key, {
              id: doc.id,
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
      const docRef = await addDoc(collection(db, collectionName), {
        ...item,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const update = async (id: string, item: Partial<T>) => {
    try {
      const localDoc = data.find((doc: any) => doc.id === id);
      if (!localDoc) {
        throw new Error(`Document ${id} not found in local data`);
      }

      const docRef = doc(db, collectionName, id.trim());
      
      // Create the document if it doesn't exist
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        console.log('Document not found in Firestore, creating it...', {
          id,
          localData: localDoc
        });
        
        // Create the document with local data
        await setDoc(docRef, {
          ...localDoc,
          ...item,
          updatedAt: Timestamp.now()
        });
      } else {
        // Update existing document
        await updateDoc(docRef, {
          ...item,
          updatedAt: Timestamp.now()
        });
      }

      console.log('Document operation successful:', docRef.path);
    } catch (err: any) {
      console.error('Operation error:', {
        error: err,
        path: `${collectionName}/${id}`,
        data: item
      });
      throw err;
    }
  };

  const remove = async (id: string) => {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (err: any) {
      setError(err.message);
      throw err;
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