import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Building2, Package, Calendar, Users, FileText, DollarSign, Clock, CheckCircle, AlertTriangle, PenTool as Tool, Download } from 'lucide-react'; // Ajout de Download
import { MaintenanceRecord } from '../maintenance'; // Reuse interface if applicable
import { downloadContractPdf } from '../../../utils/contract-pdf-generator'; // Importer la fonction

interface ContractData {
  id: string;
  clientId: string;
  clientName: string;
  equipmentId: string;
  equipmentName: string;
  contractNumber: string;
  contractStartDate: Timestamp;
  contractActivationDate: Timestamp;
  contractEndDate: Timestamp;
  frequencyMonths: number;
  paymentSchedule: string;
  nextPaymentDueDate: Timestamp;
  paymentStatus: string;
  associatedMaintenanceIds: string[];
  createdAt: Timestamp;
}

export function ContractDetailPage() {
  const { contractId } = useParams<{ contractId: string }>();
  const [contract, setContract] = useState<ContractData | null>(null);
  const [maintenances, setMaintenances] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContractAndMaintenances = async () => {
      if (!contractId) {
        setError("ID de contrat manquant.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch Contract
        const contractRef = doc(db, 'contracts', contractId);
        const contractSnap = await getDoc(contractRef);

        if (!contractSnap.exists()) {
          setError("Contrat non trouvé.");
          setLoading(false);
          return;
        }

        const contractData = { id: contractSnap.id, ...contractSnap.data() } as ContractData;
        setContract(contractData);

        // Fetch Associated Maintenances (using contractNumber or contractId if stored)
        const maintenancesRef = collection(db, 'maintenances');
        // Adjust the query based on how you link maintenances (contractNumber or contractId)
        const q = query(maintenancesRef, where('contractId', '==', contractId));
        const maintenanceSnap = await getDocs(q);
        const maintenanceList = maintenanceSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MaintenanceRecord[];
        setMaintenances(maintenanceList);

      } catch (err) {
        console.error("Erreur de chargement:", err);
        setError("Impossible de charger les détails du contrat.");
      } finally {
        setLoading(false);
      }
    };

    fetchContractAndMaintenances();
  }, [contractId]);

  const formatDate = (timestamp: Timestamp | undefined) => {
    if (!timestamp) return '-';
    return format(timestamp.toDate(), 'dd MMMM yyyy', { locale: fr });
  };

   const getPaymentStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'à jour':
      case 'payé':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex items-center"><CheckCircle className="w-3 h-3 mr-1"/>À jour</span>;
      case 'en attente':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 flex items-center"><Clock className="w-3 h-3 mr-1"/>En attente</span>;
      case 'en retard':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 flex items-center"><AlertTriangle className="w-3 h-3 mr-1"/>En retard</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400">{status}</span>;
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Chargement des détails du contrat...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-destructive">{error}</div>;
  }

  if (!contract) {
    return <div className="p-6 text-center">Contrat non trouvé.</div>;
  }

  // Ajouter cette fonction pour télécharger le contrat
  const handleDownloadContract = async () => {
    if (!contract) return;
    
    try {
      console.log('Téléchargement du contrat:', contract);
      
      await downloadContractPdf({
        contractNumber: contract.contractNumber,
        clientName: contract.clientName,
        equipmentName: contract.equipmentName,
        createdAt: contract.createdAt,
        contractEndDate: contract.contractEndDate,
        paymentSchedule: contract.paymentSchedule,
        paymentStatus: contract.paymentStatus
      });
      
    } catch (error) {
      console.error('Erreur lors du téléchargement du PDF:', error);
      alert('Erreur lors de la génération du contrat. Veuillez réessayer.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Détails du Contrat #{contract.contractNumber}</h1>
        {/* Ajouter le bouton de téléchargement */}
        <button
          onClick={handleDownloadContract}
          className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Download className="w-4 h-4 mr-2" />
          Télécharger le contrat
        </button>
      </div>

      {/* Contract Info */}
      <div className="bg-card rounded-xl p-6 shadow-lg border border-border/50 space-y-4">
        <h2 className="text-xl font-semibold mb-4">Informations Générales</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><span className="font-medium text-muted-foreground">Numéro:</span> {contract.contractNumber}</div>
          <div><span className="font-medium text-muted-foreground">Début:</span> {formatDate(contract.contractStartDate)}</div>
          <div><span className="font-medium text-muted-foreground">Activation:</span> {formatDate(contract.contractActivationDate)}</div>
          <div><span className="font-medium text-muted-foreground">Fin:</span> {formatDate(contract.contractEndDate)}</div>
          <div><span className="font-medium text-muted-foreground">Fréquence:</span> {contract.frequencyMonths} mois</div>
           <div><span className="font-medium text-muted-foreground">Créé le:</span> {formatDate(contract.createdAt)}</div>
        </div>
      </div>

       {/* Client & Equipment */}
      <div className="bg-card rounded-xl p-6 shadow-lg border border-border/50 space-y-4">
         <h2 className="text-xl font-semibold mb-4">Client et Équipement</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
               <Building2 className="w-5 h-5 text-primary mt-1"/>
               <div>
                  <div className="font-medium">{contract.clientName}</div>
                  <div className="text-sm text-muted-foreground">ID: {contract.clientId}</div>
                  {/* Add link to client page if exists */}
               </div>
            </div>
             <div className="flex items-start space-x-3">
               <Package className="w-5 h-5 text-primary mt-1"/>
               <div>
                  <div className="font-medium">{contract.equipmentName}</div>
                  <div className="text-sm text-muted-foreground">ID: {contract.equipmentId}</div>
                   {/* Add link to equipment page if exists */}
               </div>
            </div>
         </div>
      </div>

      {/* Payment Info */}
      <div className="bg-card rounded-xl p-6 shadow-lg border border-border/50 space-y-4">
        <h2 className="text-xl font-semibold mb-4 flex items-center"><DollarSign className="w-5 h-5 mr-2"/>Paiement</h2>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><span className="font-medium text-muted-foreground">Échéancier:</span> {contract.paymentSchedule}</div>
            <div><span className="font-medium text-muted-foreground">Prochain paiement:</span> {formatDate(contract.nextPaymentDueDate)}</div>
            <div><span className="font-medium text-muted-foreground">Statut:</span> {getPaymentStatusBadge(contract.paymentStatus)}</div>
         </div>
         {/* Add payment history or actions here */}
      </div>

      {/* Associated Maintenances */}
      <div className="bg-card rounded-xl p-6 shadow-lg border border-border/50 space-y-4">
        {/* The Tool icon is used here */}
        <h2 className="text-xl font-semibold mb-4 flex items-center"><Tool className="w-5 h-5 mr-2"/>Interventions Associées</h2>
        {maintenances.length === 0 ? (
          <p className="text-muted-foreground">Aucune intervention associée à ce contrat pour le moment.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium text-muted-foreground">Date Prévue</th>
                <th className="text-left p-2 font-medium text-muted-foreground">Type</th>
                <th className="text-left p-2 font-medium text-muted-foreground">Équipe</th>
                <th className="text-center p-2 font-medium text-muted-foreground">Statut</th>
                {/* Add link/action column */}
              </tr>
            </thead>
            <tbody>
              {maintenances.map(maint => (
                <tr key={maint.id} className="border-b last:border-0 hover:bg-accent/50">
                  <td className="p-2">{format(new Date(maint.nextMaintenance), 'dd/MM/yyyy')}</td>
                  <td className="p-2">{maint.type}</td>
                  <td className="p-2">{maint.teamName || 'Non assigné'}</td>
                  <td className="p-2 text-center">
                     {/* Reuse getStatusLabel/Color from maintenance.tsx or define here */}
                     <span className={`px-2 py-1 rounded-full text-xs font-medium`}> {/* Add status color logic */}
                        {maint.status} {/* Add status label logic */}
                     </span>
                  </td>
                  {/* Add button to view maintenance details */}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}