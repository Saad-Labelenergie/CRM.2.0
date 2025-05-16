import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { Plus, Building2, Search, Trash2, Building } from 'lucide-react';
import { useRegie } from '../../lib/hooks/useregie';
import { db } from '../../lib/firebase';
import {
  collection, addDoc, updateDoc, doc, deleteDoc
} from 'firebase/firestore';

export default function Regie() {
  const { regies, loading } = useRegie();
  const [newRegieName, setNewRegieName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [regieToDelete, setRegieToDelete] = useState<{ id: string; nom: string } | null>(null);


  const handleAddRegie = async () => {
    if (!newRegieName.trim()) return;

    try {
      const docRef = await addDoc(collection(db, 'regies'), {
        nom: newRegieName.trim(),
        createdAt: new Date()
      });

      await updateDoc(doc(db, 'regies', docRef.id), {
        id: docRef.id
      });

      setNewRegieName('');
    } catch (error) {
      console.error("Erreur lors de l'ajout de la régie :", error);
    }
  };

  const handleDeleteRegie = async (regieId: string) => {
    try {
      await deleteDoc(doc(db, 'regies', regieId));
    } catch (error) {
      console.error("Erreur lors de la suppression de la régie :", error);
    }
  };

  const filteredRegies = regies.filter(regie =>
    regie.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const chartData = regies.map((regie) => ({
    name: regie.nom,
    count: 1,
  }));
  
  const totalPages = Math.ceil(filteredRegies.length / itemsPerPage);
  const paginatedRegies = filteredRegies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Building2 className="w-6 h-6 text-primary" />
          Gestion des Régies
        </h1>

        <div className="flex gap-2">
          <input
            type="text"
            value={newRegieName}
            onChange={(e) => setNewRegieName(e.target.value)}
            placeholder="Nom de la régie"
            className="px-3 py-2 rounded-md border w-52"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={handleAddRegie}
            className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" /> Ajouter
          </motion.button>
        </div>
      </div>
      <h2 className="text-lg font-semibold">Statistiques</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>

          <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Rechercher une régie..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border rounded-md"
        />
      </div>


      {loading ? (
  <p className="text-muted-foreground">Chargement...</p>
) : filteredRegies.length === 0 && searchTerm ? (
  <p className="text-muted-foreground">Aucune régie trouvée pour "<strong>{searchTerm}</strong>".</p>
) : filteredRegies.length === 0 ? (
  <p className="text-muted-foreground">Aucune régie disponible.</p>
) : (

        <>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            
            {paginatedRegies.map((regie) => (
              <div key={regie.id} className="p-4 border rounded-lg bg-white dark:bg-muted shadow-sm flex justify-between items-center">
                <Building />
                <div>
                  <h3 className="font-semibold text-lg">{regie.nom}</h3>
                  <p className="text-sm text-muted-foreground">ID : {regie.id}</p>
                </div>
                <button
  onClick={() => setRegieToDelete({ id: regie.id, nom: regie.nom })}
  className="text-red-600 hover:text-red-800 transition"
  title="Supprimer"
>
  <Trash2 className="w-5 h-5" />
</button>

              </div>
            ))}
          </div>
          </>
      )}
          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-muted hover:bg-muted/70 disabled:opacity-50"
            >
              Précédent
            </button>
            <span className="text-sm text-muted-foreground">{currentPage} / {totalPages}</span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded bg-muted hover:bg-muted/70 disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
          {regieToDelete && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      className="bg-white dark:bg-card rounded-xl p-6 shadow-lg w-full max-w-md border"
    >
      <h2 className="text-xl font-semibold mb-4 text-red-600">
        Supprimer la régie ?
      </h2>
      <p className="text-muted-foreground mb-6">
        Êtes-vous sûr de vouloir supprimer la régie <strong>{regieToDelete.nom}</strong> ?
        Cette action est irréversible.
      </p>
      <div className="flex justify-end gap-3">
        <button
          onClick={() => setRegieToDelete(null)}
          className="px-4 py-2 rounded bg-muted hover:bg-muted/80 transition"
        >
          Annuler
        </button>
        <button
          onClick={async () => {
            await handleDeleteRegie(regieToDelete.id);
            setRegieToDelete(null);
          }}
          className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
        >
          Supprimer
        </button>
      </div>
    </motion.div>
  </div>
)}

    </div>
  );
}
