import { useEffect, useState } from 'react';
import { db } from '../firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp
} from 'firebase/firestore';

interface Fournisseur {
        id: string;
        name: string;
        contact?: string;
        email?: string;
        createdAt?: Timestamp;
        updatedAt?: Timestamp;
      }
      


export function useFournisseurs() {
  const [data, setData] = useState<Fournisseur[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'fournisseurs'));
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Fournisseur[];
      setData(list);
    } catch (err) {
      console.error('Erreur récupération fournisseurs :', err);
    } finally {
      setLoading(false);
    }
  };

  const add = async (fournisseur: Omit<Fournisseur, 'id'>) => {
    const ref = await addDoc(collection(db, 'fournisseurs'), fournisseur);
    await updateDoc(ref, { id: ref.id });
    await fetch();
  };
  

  const update = async (id: string, fournisseur: Partial<Fournisseur>) => {
    await updateDoc(doc(db, 'fournisseurs', id), fournisseur);
    await fetch();
  };

  const remove = async (id: string) => {
    await deleteDoc(doc(db, 'fournisseurs', id));
    await fetch();
  };

  useEffect(() => {
    fetch();
  }, []);

  return { data, loading, add, update, remove };
}
