import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertCircle, 
  Search,
  Users,
  CheckCircle,
  XCircle,
  Timer,
  ArrowUpRight,
  Edit2,
  Trash2,
  Eye,
  Loader2,
  Filter
} from 'lucide-react';
import { useSAV, Ticket } from '../../../contexts/sav-context';
import { format } from 'date-fns';

interface TicketListProps {
  selectedStatus: string | null;
  searchTerm: string;
  onViewTicket: (ticket: Ticket) => void;
}

export function TicketList({ selectedStatus, searchTerm, onViewTicket }: TicketListProps) {
  const { tickets, loading, updateTicket, deleteTicket } = useSAV();
  const [sortField, setSortField] = useState<keyof Ticket>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof Ticket) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !selectedStatus || selectedStatus === 'all' || ticket.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Sort tickets
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    if (sortField === 'createdAt') {
      const dateA = new Date(a[sortField]).getTime();
      const dateB = new Date(b[sortField]).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortField === 'client') {
      return sortDirection === 'asc' 
        ? a.client.name.localeCompare(b.client.name)
        : b.client.name.localeCompare(a.client.name);
    } else if (sortField === 'product') {
      return sortDirection === 'asc' 
        ? a.product.name.localeCompare(b.product.name)
        : b.product.name.localeCompare(a.product.name);
    } else {
      // For other fields
      const valueA = String(a[sortField] || '');
      const valueB = String(b[sortField] || '');
      return sortDirection === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    }
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

  const getStatusIcon = (status: Ticket['status']) => {
    switch (status) {
      case 'nouveau':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'en_cours':
        return <Timer className="w-4 h-4 text-blue-500" />;
      case 'resolu':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'annule':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: Ticket['status']) => {
    switch (status) {
      case 'nouveau':
        return 'Nouveau';
      case 'en_cours':
        return 'En cours';
      case 'resolu':
        return 'Résolu';
      case 'annule':
        return 'Annulé';
      default:
        return status;
    }
  };

  const getStatusClass = (status: Ticket['status']) => {
    switch (status) {
      case 'nouveau':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500';
      case 'en_cours':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500';
      case 'resolu':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500';
      case 'annule':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400';
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: Ticket['status']) => {
    try {
      await updateTicket(id, { status: newStatus });
    } catch (err) {
      console.error('Error updating ticket status:', err);
    }
  };

  const handleDeleteTicket = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce ticket ?')) {
      try {
        await deleteTicket(id);
      } catch (err) {
        console.error('Error deleting ticket:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 text-primary animate-spin mr-2" />
        <span>Chargement des tickets...</span>
      </div>
    );
  }

  if (filteredTickets.length === 0) {
    return (
      <div className="bg-muted/30 rounded-lg p-8 text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Aucun ticket trouvé</h3>
        <p className="text-muted-foreground">
          {searchTerm ? 'Essayez de modifier vos critères de recherche.' : 'Aucun ticket ne correspond aux critères sélectionnés.'}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border/50">
            <th className="text-left p-4 font-medium text-muted-foreground">
              <button 
                className="flex items-center hover:text-foreground"
                onClick={() => handleSort('number')}
              >
                N° Ticket
                {sortField === 'number' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
            </th>
            <th className="text-left p-4 font-medium text-muted-foreground">
              <button 
                className="flex items-center hover:text-foreground"
                onClick={() => handleSort('client')}
              >
                Client
                {sortField === 'client' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
            </th>
            <th className="text-left p-4 font-medium text-muted-foreground">
              <button 
                className="flex items-center hover:text-foreground"
                onClick={() => handleSort('issueType')}
              >
                Problème
                {sortField === 'issueType' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
            </th>
            <th className="text-left p-4 font-medium text-muted-foreground">
              <button 
                className="flex items-center hover:text-foreground"
                onClick={() => handleSort('status')}
              >
                Statut
                {sortField === 'status' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
            </th>
            <th className="text-left p-4 font-medium text-muted-foreground">
              <button 
                className="flex items-center hover:text-foreground"
                onClick={() => handleSort('createdAt')}
              >
                Date
                {sortField === 'createdAt' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
            </th>
            <th className="text-center p-4 font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedTickets.map((ticket) => (
            <tr key={ticket.id} className="border-b border-border/50 hover:bg-muted/50">
              <td className="p-4 font-mono">{ticket.number}</td>
              <td className="p-4">
                <div>
                  <div className="font-medium">{ticket.client.name}</div>
                  <div className="text-sm text-muted-foreground">{ticket.product.name}</div>
                </div>
              </td>
              <td className="p-4">
                <div>
                  <div className="font-medium">{ticket.issueType}</div>
                  <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                    {ticket.description}
                  </div>
                </div>
              </td>
              <td className="p-4">
                <span className={`px-2 py-1 rounded-full text-xs flex items-center w-fit ${getStatusClass(ticket.status)}`}>
                  {getStatusIcon(ticket.status)}
                  <span className="ml-1">{getStatusText(ticket.status)}</span>
                </span>
              </td>
              <td className="p-4">
                <div className="text-sm">
                  {formatDate(ticket.createdAt)}
                </div>
              </td>
              <td className="p-4">
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => onViewTicket(ticket)}
                    className="p-1 hover:bg-muted rounded-full"
                    title="Voir les détails"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTicket(ticket.id!)}
                    className="p-1 hover:bg-destructive/10 text-destructive rounded-full"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}