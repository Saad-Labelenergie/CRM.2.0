import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export interface Regie {
  id: string;
  nom: string;
}

export function useRegie() {
  const [regies, setRegies] = useState<Regie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'regies'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Regie[];
      setRegies(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return { regies, loading };
}
