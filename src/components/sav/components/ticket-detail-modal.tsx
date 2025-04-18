import React from 'react';
import { format } from 'date-fns';
import { 
  AlertCircle, 
  Timer, 
  CheckCircle, 
  XCircle,
  X,
  User,
  Package,
  Calendar,
  MessageSquare,
  Tag
} from 'lucide-react';

interface TicketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: any;
}

export function TicketDetailModal({ isOpen, onClose, ticket }: TicketDetailModalProps) {
  if (!isOpen || !ticket) return null;

  const getStatusIcon = () => {
    switch (ticket.status) {
      case 'nouveau':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'en_cours':
        return <Timer className="w-5 h-5 text-blue-500" />;
      case 'resolu':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'annule':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (ticket.status) {
      case 'nouveau':
        return 'Nouveau';
      case 'en_cours':
        return 'En cours';
      case 'resolu':
        return 'Résolu';
      case 'annule':
        return 'Annulé';
      default:
        return '';
    }
  };

  const getStatusClass = () => {
    switch (ticket.status) {
      case 'nouveau':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500';
      case 'en_cours':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500';
      case 'resolu':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500';
      case 'annule':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card p-4 border-b flex justify-between items-center z-10">
          <div className="flex items-center">
            <span className="font-mono text-sm bg-muted px-2 py-1 rounded mr-3">#{ticket.number}</span>
            <h2 className="text-xl font-bold">{ticket.issueType}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-4">Informations</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Client</p>
                    <p className="font-medium">{ticket.client.name}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <Package className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Produit</p>
                    <p className="font-medium">{ticket.product.name}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <Tag className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type de problème</p>
                    <p className="font-medium">{ticket.issueType}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date de création</p>
                    <p className="font-medium">{format(new Date(ticket.createdAt), 'dd/MM/yyyy HH:mm')}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-4">Statut</h3>
              <div className="flex items-center mb-6">
                <div className={`px-3 py-1.5 rounded-full flex items-center ${getStatusClass()}`}>
                  {getStatusIcon()}
                  <span className="ml-2 font-medium">{getStatusText()}</span>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold mb-4">Description</h3>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="whitespace-pre-wrap">{ticket.description}</p>
              </div>
            </div>
          </div>
          
          {ticket.notes && ticket.notes.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Notes et commentaires</h3>
              <div className="space-y-4">
                {ticket.notes.map((note: any, index: number) => (
                  <div key={index} className="bg-muted/30 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">{note.author}</span>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(note.date), 'dd/MM/yyyy HH:mm')}
                      </span>
                    </div>
                    <p className="text-sm">{note.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="sticky bottom-0 bg-card p-4 border-t flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-muted"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}