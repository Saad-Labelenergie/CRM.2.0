import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Pour créer des liens vers les détails du contrat
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FileText, Package, Calendar, Download } from 'lucide-react'; // Ajout de l'icône Download
import { downloadContractPdf } from '../../../utils/contract-pdf-generator'; // Importer la fonction

interface ContractData {
  id: string; // Firestore document ID
  clientId: string;
  clientName: string;
  equipmentId: string;
  equipmentName: string;
  contractNumber: string;
  contractStartDate: Timestamp;
  contractEndDate: Timestamp;
  paymentStatus: string; // Ou un autre champ pertinent à afficher dans la liste
  // Ajoutez d'autres champs si nécessaire
}

interface ClientContractsListProps {
  clientId: string; // L'ID du client pour lequel afficher les contrats
}

export function ClientContractsList({ clientId }: ClientContractsListProps) {
  const [contracts, setContracts] = useState<ContractData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClientContracts = async () => {
      // Check if clientId is provided
      if (!clientId) {
        setError("L'ID du client est requis.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Reference to the 'contracts' collection
        const contractsRef = collection(db, 'contracts');
        const q = query(contractsRef, where('clientId', '==', clientId));

        // Execute the query
        const querySnapshot = await getDocs(q);

        // Map the results to the ContractData interface
        const fetchedContracts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as ContractData[];

        // Update the component's state with the fetched contracts
        setContracts(fetchedContracts);
      } catch (err) {
        console.error("Erreur lors de la récupération des contrats du client:", err);
        setError("Impossible de charger les contrats.");
      } finally {
        setLoading(false);
      }
    };

    fetchClientContracts();
  }, [clientId]); // Re-run the effect if the clientId prop changes

  const formatDate = (timestamp: Timestamp | undefined) => {
    if (!timestamp) return '-';
    return format(timestamp.toDate(), 'dd/MM/yyyy', { locale: fr }); // Format plus court pour la liste
  };

  if (loading) {
    return <div className="p-4 text-center">Chargement des contrats...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-destructive">{error}</div>;
  }

  if (contracts.length === 0) {
    return <div className="p-4 text-muted-foreground">Aucun contrat trouvé pour ce client.</div>;
  }

  // Ajouter cette fonction pour télécharger le contrat
  const handleDownloadContract = async (e: React.MouseEvent, contract: ContractData) => {
    e.preventDefault(); // Empêcher la navigation vers la page de détails
    e.stopPropagation(); // Empêcher la propagation de l'événement
    
    try {
      await downloadContractPdf({
        contractNumber: contract.contractNumber,
        clientName: contract.clientName,
        equipmentName: contract.equipmentName,
        createdAt: contract.contractStartDate,
        contractEndDate: contract.contractEndDate
      });
    } catch (error) {
      console.error('Erreur lors du téléchargement du PDF:', error);
      alert('Erreur lors de la génération du contrat. Veuillez réessayer.');
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold mb-2">Contrats Associés</h3>
      {contracts.map((contract) => (
        <Link
          key={contract.id}
          to={`/contracts/${contract.id}`} // Lien vers la page de détail du contrat
          className="block bg-card p-4 rounded-lg border border-border/50 hover:bg-accent hover:border-primary/30 transition-colors shadow-sm"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-primary flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Contrat #{contract.contractNumber}
            </span>
            {/* Ajouter le bouton de téléchargement */}
            <button 
              onClick={(e) => handleDownloadContract(e, contract)}
              className="p-1 hover:bg-primary/10 rounded-full transition-colors"
              title="Télécharger le contrat"
            >
              <Download className="w-4 h-4 text-primary" />
            </button>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <div className="flex items-center">
              <Package className="w-4 h-4 mr-2" />
              <span>{contract.equipmentName}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span>Début: {formatDate(contract.contractStartDate)} - Fin: {formatDate(contract.contractEndDate)}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}