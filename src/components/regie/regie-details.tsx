import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Client } from '../../lib/hooks/useClients';
import { Building2, ArrowLeft } from 'lucide-react';

export default function RegieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const regieName = location.state?.name || 'Régie inconnue';

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(clients.length / itemsPerPage);

  const paginatedClients = clients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (!id) return;

    const fetchClients = async () => {
      try {
        const q = query(collection(db, 'clients'), where('regie.id', '==', id));
        const snapshot = await getDocs(q);
        const fetchedClients = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Client[];

        setClients(fetchedClients);
      } catch (error) {
        console.error('Erreur lors de la récupération des clients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [id]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/regie')}
          className="flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Building2 className="w-6 h-6 text-primary" />
          Clients de la régie : <span className="text-primary">{regieName}</span>
        </h1>
        <div /> {/* Pour équilibrer l'espace entre le bouton retour et le titre */}
      </div>

      {loading ? (
        <p className="text-muted-foreground">Chargement des clients...</p>
      ) : clients.length === 0 ? (
        <p className="text-muted-foreground">Aucun client associé à cette régie.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedClients.map(client => (
              <div key={client.id} className="p-4 border rounded-lg shadow-sm bg-white dark:bg-muted">
                <h3 className="font-semibold text-lg">{client.name}</h3>
                <p className="text-sm text-muted-foreground">{client.contact?.email}</p>
                <p className="text-sm text-muted-foreground">{client.contact?.phone}</p>
                <p className="text-sm text-muted-foreground">Ville: {client.address?.city}</p>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-6">
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
        </>
      )}
    </div>
  );
}
