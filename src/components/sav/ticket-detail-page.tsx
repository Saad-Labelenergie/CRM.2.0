import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, isValid } from 'date-fns';
import { 
  ArrowLeft, 
  AlertCircle, 
  Timer, 
  CheckCircle, 
  XCircle,
  User,
  Package,
  Calendar,
  MessageSquare,
  Tag,
  Users,
  Clock,
  Building2,
  Save
} from 'lucide-react';
import { useSAV } from '../../contexts/sav-context';

// Helper function to safely format dates
const safeFormatDate = (dateValue: string | Date | undefined, formatString: string = 'dd/MM/yyyy'): string => {
  if (!dateValue) return 'Non spécifiée';
  
  const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
  
  return isValid(date) ? format(date, formatString) : 'Date invalide';
};

export function TicketDetailPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { tickets, updateTicket } = useSAV();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<{text: string, date: Date}[]>([]);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    if (tickets.length > 0 && ticketId) {
      const foundTicket = tickets.find(t => t.id === ticketId);
      if (foundTicket) {
        setTicket(foundTicket);
        setComments(foundTicket.comments || []);
      }
      setLoading(false);
    }
  }, [tickets, ticketId]);

  const handleStatusChange = async (newStatus: "nouveau" | "en_cours" | "resolu" | "annule") => {
    if (!ticket) return;
    
    try {
      await updateTicket(ticket.id, { status: newStatus });
      setTicket({...ticket, status: newStatus});
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (err) {
      console.error('Erreur lors du changement de statut:', err);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim() || !ticket) return;
    
    const newComment = {
      text: comment,
      date: new Date()
    };
    
    const updatedComments = [...comments, newComment];
    
    try {
      await updateTicket(ticket.id, { comments: updatedComments });
      setComments(updatedComments);
      setComment('');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (err) {
      console.error('Erreur lors de l\'ajout du commentaire:', err);
    }
  };

  const getStatusIcon = () => {
    if (!ticket) return null;
    
    switch (ticket.status) {
      case 'nouveau':
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      case 'en_cours':
        return <Timer className="w-6 h-6 text-blue-500" />;
      case 'resolu':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'annule':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    if (!ticket) return '';
    
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center"
        >
          <Timer className="w-8 h-8 text-primary animate-spin" />
          <span className="ml-2 text-lg">Chargement des données...</span>
        </motion.div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="bg-destructive/10 p-6 rounded-xl text-destructive flex items-center">
        <AlertCircle className="w-6 h-6 mr-2" />
        <div>
          <h3 className="font-semibold">Ticket introuvable</h3>
          <p>Le ticket demandé n'existe pas ou a été supprimé.</p>
          <button 
            onClick={() => navigate('/sav')}
            className="mt-4 flex items-center text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Retour à la liste des tickets
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header avec bouton retour */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/sav')}
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-1" /> Retour à la liste
        </button>
        <div className="flex items-center">
          <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${
            ticket.status === 'nouveau' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500' :
            ticket.status === 'en_cours' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500' :
            ticket.status === 'resolu' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500' :
            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500'
          }`}>
            {getStatusIcon()}
            <span className="ml-2">{getStatusText()}</span>
          </div>
        </div>
      </div>

      {/* Titre et numéro de ticket */}
      <div className="bg-card p-6 rounded-xl shadow-lg border border-border/50">
        <h1 className="text-2xl font-bold flex items-center">
          <Tag className="w-6 h-6 mr-2 text-primary" />
          Ticket SAV #{ticket.number}
        </h1>
        <p className="text-muted-foreground mt-1">
          Créé le {safeFormatDate(ticket.createdAt, 'dd MMMM yyyy à HH:mm')}
        </p>
      </div>

      {/* Informations principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informations client */}
        <div className="bg-card p-6 rounded-xl shadow-lg border border-border/50">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-primary" />
            Informations client
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Nom du client</p>
              <p className="font-medium">{ticket.client.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Adresse</p>
              <p className="font-medium">{ticket.client.address?.street || 'Non spécifiée'}</p>
              <p className="font-medium">
                {ticket.client.address?.postalCode || ''} {ticket.client.address?.city || ''}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contact</p>
              <p className="font-medium">{ticket.client.phone || 'Non spécifié'}</p>
              <p className="font-medium">{ticket.client.email || 'Non spécifié'}</p>
            </div>
          </div>
        </div>

        {/* Informations produit et installation */}
        <div className="bg-card p-6 rounded-xl shadow-lg border border-border/50">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2 text-primary" />
            Produit concerné
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Produit</p>
              <p className="font-medium">{ticket.product.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Équipe d'installation</p>
              <p className="font-medium">{ticket.team?.name || 'Non assignée'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date d'installation</p>
              <p className="font-medium">
                {safeFormatDate(ticket.installationDate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date de déclaration SAV</p>
              <p className="font-medium">{safeFormatDate(ticket.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Description du problème */}
      <div className="bg-card p-6 rounded-xl shadow-lg border border-border/50">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 text-primary" />
          Problème rencontré
        </h2>
        <p className="whitespace-pre-line">{ticket.description}</p>
      </div>

      {/* Gestion du statut */}
      <div className="bg-card p-6 rounded-xl shadow-lg border border-border/50">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-primary" />
          Statut du ticket
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleStatusChange('nouveau')}
            className={`px-4 py-2 rounded-lg flex items-center ${
              ticket.status === 'nouveau' 
                ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-500 dark:bg-yellow-900/50 dark:text-yellow-400'
                : 'bg-muted hover:bg-yellow-100 hover:text-yellow-800 dark:hover:bg-yellow-900/30 dark:hover:text-yellow-400'
            }`}
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            Nouveau
          </button>
          <button
            onClick={() => handleStatusChange('en_cours')}
            className={`px-4 py-2 rounded-lg flex items-center ${
              ticket.status === 'en_cours' 
                ? 'bg-blue-100 text-blue-800 border-2 border-blue-500 dark:bg-blue-900/50 dark:text-blue-400'
                : 'bg-muted hover:bg-blue-100 hover:text-blue-800 dark:hover:bg-blue-900/30 dark:hover:text-blue-400'
            }`}
          >
            <Timer className="w-4 h-4 mr-2" />
            En cours
          </button>
          <button
            onClick={() => handleStatusChange('resolu')}
            className={`px-4 py-2 rounded-lg flex items-center ${
              ticket.status === 'resolu' 
                ? 'bg-green-100 text-green-800 border-2 border-green-500 dark:bg-green-900/50 dark:text-green-400'
                : 'bg-muted hover:bg-green-100 hover:text-green-800 dark:hover:bg-green-900/30 dark:hover:text-green-400'
            }`}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Résolu
          </button>
          <button
            onClick={() => handleStatusChange('annule')}
            className={`px-4 py-2 rounded-lg flex items-center ${
              ticket.status === 'annule' 
                ? 'bg-red-100 text-red-800 border-2 border-red-500 dark:bg-red-900/50 dark:text-red-400'
                : 'bg-muted hover:bg-red-100 hover:text-red-800 dark:hover:bg-red-900/30 dark:hover:text-red-400'
            }`}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Annulé
          </button>
        </div>
      </div>

      {/* Commentaires */}
      <div className="bg-card p-6 rounded-xl shadow-lg border border-border/50">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-primary" />
          Commentaires
        </h2>
        
        <div className="space-y-4 mb-6">
          {comments.length > 0 ? (
            comments.map((comment, index) => (
              <div key={index} className="bg-muted p-4 rounded-lg">
                <p className="whitespace-pre-line">{comment.text}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {safeFormatDate(comment.date, 'dd/MM/yyyy à HH:mm')}
                </p>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground italic">Aucun commentaire pour le moment.</p>
          )}
        </div>
        
        <div className="space-y-3">
          <h3 className="font-medium">Ajouter un commentaire</h3>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[100px]"
            placeholder="Saisissez votre commentaire ici..."
          />
          <div className="flex justify-end">
            <button
              onClick={handleAddComment}
              disabled={!comment.trim()}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toast de succès */}
      {showSuccessToast && (
        <div className="fixed bottom-4 right-4 bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400 px-4 py-2 rounded-lg shadow-lg flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          <span>Modification enregistrée avec succès</span>
        </div>
      )}
    </motion.div>
  );
}