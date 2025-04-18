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
    let q: Query = collection(db, collectionName);

    // Ajoute conditions (where)
    if (options.conditions) {
      options.conditions.forEach((c) => {
        q = query(q, where(c.field, c.operator as any, c.value));
      });
    }

    // Ajoute orderBy
    if (options.orderByField) {
      q = query(q, orderBy(options.orderByField, options.orderDirection || 'asc'));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot) => {
        const uniqueDocs = new Map();

        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data();
          const key = `${docSnap.id}-${data.status || 'default'}`;

          const currentTimestamp = data.updatedAt?.toDate?.()?.getTime?.() || 0;
          const existingDoc = uniqueDocs.get(key);

          if (!existingDoc || (existingDoc.updatedAt?.getTime?.() || 0) < currentTimestamp) {
            uniqueDocs.set(key, {
              id: data.id,       // ID logique
              _id: docSnap.id,   // Firestore doc ID
              ...data,
              createdAt: data.createdAt?.toDate?.() || new Date(),
              updatedAt: data.updatedAt?.toDate?.() || new Date()
            });
          }
        });

        const sorted = Array.from(uniqueDocs.values()).sort(
          (a: any, b: any) => b.updatedAt.getTime() - a.updatedAt.getTime()
        );

        setData(sorted as T[]);
        setLoading(false);
      },
      (err: FirestoreError) => {
        console.error('Erreur snapshot Firebase :', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, JSON.stringify(options)]);

  const add = async (item: Omit<T, 'id'>) => {
    try {
      const { id, ...itemWithoutId } = item as any;

      const docRef = await addDoc(collection(db, collectionName), {
        ...itemWithoutId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      await updateDoc(docRef, { id: docRef.id });

      return docRef.id;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const update = async (id: string | number, item: Partial<T>) => {
    try {
      const existingDoc = data.find((doc: any) => doc.id?.toString() === id.toString());

      if (!existingDoc) throw new Error(`Document ID ${id} non trouvé dans ${collectionName}`);

      const firestoreId = (existingDoc as any)._id;
      if (!firestoreId) throw new Error(`_id Firestore manquant pour ${id}`);

      const docRef = doc(db, collectionName, firestoreId);
      await updateDoc(docRef, {
        ...item,
        updatedAt: Timestamp.now()
      });
    } catch (err: any) {
      console.error('Erreur update Firebase :', err);
      throw err;
    }
  };

  const remove = async (id: string | number) => {
    try {
      const existingDoc = data.find((doc: any) => doc.id?.toString() === id.toString());

      if (!existingDoc) throw new Error(`Document ID ${id} non trouvé dans ${collectionName}`);

      const firestoreId = (existingDoc as any)._id;
      if (!firestoreId) throw new Error(`_id Firestore manquant pour ${id}`);

      const docRef = doc(db, collectionName, firestoreId);
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
