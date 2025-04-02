import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertCircle, 
  Search,
  Clock,
  Building2,
  Package,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Timer,
  ArrowUpRight,
  MoreVertical,
  Edit2,
  Trash2,
  Eye
} from 'lucide-react';

interface Ticket {
  number: string;
  client: {
    name: string;
    address: string;
  };
  product: {
    name: string;
    reference: string;
  };
  issueType: string;
  description: string;
  status: 'nouveau' | 'en_cours' | 'resolu' | 'annule';
  priority: 'haute' | 'moyenne' | 'basse';
  createdAt: string;
  assignedTeam?: string;
  installationDate: string;
  lastUpdate?: string;
}

interface TicketListProps {
  selectedStatus: string | null;
}

const tickets: Ticket[] = [
  {
    number: "123456",
    client: {
      name: "Entreprise ABC",
      address: "123 Avenue des Champs-Élysées, 75008 Paris"
    },
    product: {
      name: "Climatiseur Mural 9000 BTU",
      reference: "CLIM-MUR-9000"
    },
    issueType: "Panne technique",
    description: "L'unité ne refroidit plus correctement",
    status: "nouveau",
    priority: "haute",
    createdAt: "2024-02-20T10:30:00",
    installationDate: "2024-02-15"
  },
  {
    number: "123457",
    client: {
      name: "Centre Commercial XYZ",
      address: "45 Rue du Commerce, 69002 Lyon"
    },
    product: {
      name: "Unité Extérieure Multi-Split",
      reference: "UE-MS-18000"
    },
    issueType: "Bruit anormal",
    description: "Bruit de vibration important",
    status: "en_cours",
    priority: "moyenne",
    createdAt: "2024-02-19T14:20:00",
    assignedTeam: "Équipe A",
    installationDate: "2024-02-10",
    lastUpdate: "2024-02-20T09:15:00"
  },
  {
    number: "123458",
    client: {
      name: "Hotel Luxe",
      address: "78 Boulevard de la Croisette, 06400 Cannes"
    },
    product: {
      name: "Climatiseur Gainable",
      reference: "GAIN-24000"
    },
    issueType: "Fuite",
    description: "Fuite d'eau au niveau du faux plafond",
    status: "resolu",
    priority: "haute",
    createdAt: "2024-02-18T09:00:00",
    assignedTeam: "Équipe B",
    installationDate: "2024-02-01",
    lastUpdate: "2024-02-19T16:30:00"
  }
];

const statusConfig = {
  nouveau: {
    label: 'Nouveau',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    icon: AlertCircle
  },
  en_cours: {
    label: 'En cours',
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    icon: Timer
  },
  resolu: {
    label: 'Résolu',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    icon: CheckCircle
  },
  annule: {
    label: 'Annulé',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon: XCircle
  }
};

const priorityConfig = {
  haute: {
    label: 'Haute',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  },
  moyenne: {
    label: 'Moyenne',
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
  },
  basse: {
    label: 'Basse',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
  }
};

export function TicketList({ selectedStatus }: TicketListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !selectedStatus || ticket.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <input
          type="text"
          placeholder="Rechercher un ticket..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
        />
      </div>

      <div className="bg-card rounded-xl shadow-lg border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left p-4 font-medium text-muted-foreground">N° Ticket</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Client</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Problème</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Statut</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Priorité</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Équipe</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                <th className="text-center p-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => {
                const StatusIcon = statusConfig[ticket.status].icon;
                
                return (
                  <motion.tr
                    key={ticket.number}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-border/50 last:border-0 hover:bg-accent/50 transition-colors"
                  >
                    <td className="p-4">
                      <span className="font-mono font-medium">#{ticket.number}</span>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{ticket.client.name}</div>
                        <div className="text-sm text-muted-foreground">{ticket.product.name}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{ticket.issueType}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {ticket.description}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig[ticket.status].color}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig[ticket.status].label}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityConfig[ticket.priority].color}`}>
                        {priorityConfig[ticket.priority].label}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center">
                        {ticket.assignedTeam ? (
                          <>
                            <Users className="w-4 h-4 text-muted-foreground mr-2" />
                            <span>{ticket.assignedTeam}</span>
                          </>
                        ) : (
                          <span className="text-muted-foreground">Non assigné</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="text-sm">{formatDate(ticket.createdAt)}</div>
                        {ticket.lastUpdate && (
                          <div className="text-xs text-muted-foreground flex items-center mt-1">
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                            {formatDate(ticket.lastUpdate)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center space-x-1">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 hover:bg-accent rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 hover:bg-accent rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-muted-foreground" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredTickets.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Aucun ticket ne correspond à votre recherche
          </div>
        )}
      </div>
    </div>
  );
}