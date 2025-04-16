import { format } from 'date-fns';

interface Payment {
  dueDate: string;
  amount: number;
  status: 'paid' | 'pending';
}

interface Maintenance {
  id: string;
  contractNumber: string;
  contractStartDate: string;
  contractEndDate: string;
  paymentSchedule: Payment[];
}

interface Intervention {
  date: string;
  type: 'preventif' | 'correctif';
  description: string;
  technician: string;
  status: 'completed' | 'pending';
}

interface ContractDetailsProps {
  maintenance: Maintenance & {
    interventions: Intervention[];
  };
}

export function ContractDetails({ maintenance }: ContractDetailsProps) {
  const isContractActive = new Date(maintenance.contractStartDate) <= new Date() &&
    new Date(maintenance.contractEndDate) >= new Date();

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl p-6 border border-border/50">
        <h2 className="text-xl font-semibold mb-4">Détails du contrat</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Numéro de contrat</p>
            <p className="font-medium">{maintenance.contractNumber}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Statut</p>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              isContractActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {isContractActive ? 'Actif' : 'Expiré'}
            </span>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Date de début</p>
            <p className="font-medium">{format(new Date(maintenance.contractStartDate), 'dd/MM/yyyy')}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Date de fin</p>
            <p className="font-medium">{format(new Date(maintenance.contractEndDate), 'dd/MM/yyyy')}</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 border border-border/50">
        <h2 className="text-xl font-semibold mb-4">Échéances de paiement</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Date</th>
              <th className="text-left py-2">Montant</th>
              <th className="text-left py-2">Statut</th>
            </tr>
          </thead>
          <tbody>
            // Dans la section map, TypeScript connaîtra maintenant les types
            {maintenance.paymentSchedule.map((payment: Payment, index: number) => (
              <tr key={index} className="border-b">
                <td className="py-2">{format(new Date(payment.dueDate), 'dd/MM/yyyy')}</td>
                <td className="py-2">{payment.amount.toLocaleString('fr-FR')} €</td>
                <td className="py-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    payment.status === 'paid' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {payment.status === 'paid' ? 'Payé' : 'En attente'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-card rounded-xl p-6 border border-border/50">
        <h2 className="text-xl font-semibold mb-4">Historique des interventions</h2>
        {maintenance.interventions?.length > 0 ? (
          <div className="space-y-4">
            {maintenance.interventions.map((intervention: Intervention, index: number) => (
              <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{format(new Date(intervention.date), 'dd/MM/yyyy')}</p>
                    <p className="text-sm text-muted-foreground">{intervention.type}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    intervention.status === 'completed' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {intervention.status === 'completed' ? 'Terminé' : 'En cours'}
                  </span>
                </div>
                <p className="mt-2">{intervention.description}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Technicien: {intervention.technician}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Aucune intervention enregistrée</p>
        )}
      </div>
    </div>
  );
}