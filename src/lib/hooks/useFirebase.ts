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
    let q = collection(db, collectionName);

    if (options.conditions) {
      q = query(q, ...options.conditions.map(c => where(c.field, c.operator as any, c.value)));
    }

    if (options.orderByField) {
      q = query(q as any, orderBy(options.orderByField, options.orderDirection || 'asc'));
    }

    const unsubscribe = onSnapshot(q as any, 
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as T[];
        setData(items);
        setLoading(false);
      },
      (err) => {
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
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...item,
        updatedAt: Timestamp.now()
      });
    } catch (err: any) {
      setError(err.message);
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