import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UpdateClientModal } from './components/update-client-modal';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users,
  Mail,
  Phone,
  MapPin,
  Tag,
  Building2,
  Calendar,
  Star,
  TrendingUp,
  FileText,
  MessageSquare,
  AlertCircle,
  Edit2,
  Trash2,
  Package,
  Clock
} from 'lucide-react';
import { useClients } from '../../lib/hooks/useClients';
import { DeleteClientModal } from './components/delete-client-modal';
import { NewClientModal } from './components/new-client-modal';
import { Toast } from '../ui/toast';
import { ProductsStep } from './components/steps/products-step';

export function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: clients = [], loading, remove: removeClient,update} = useClients();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const client = clients.find(c => c.id === id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <Building2 className="w-12 h-12 mx-auto text-muted-foreground animate-pulse" />
          <h2 className="text-xl font-semibold mt-4">Chargement du client...</h2>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Client non trouvé</h2>
          <button
            onClick={() => navigate('/clients')}
            className="text-primary hover:underline"
          >
            Retour à la liste des clients
          </button>
        </div>
      </div>
    );
  }

  // Fonction utilitaire pour formater la date
const formatClientSinceDate = (dateInput: any) => {
  // Si la date est déjà un objet Date valide
  if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
    return formatDate(dateInput);
  }
  
  // Si c'est un string ou un timestamp Firestore
  const date = new Date(dateInput);
  if (!isNaN(date.getTime())) {
    return formatDate(date);
  }

  // Si c'est un objet timestamp Firestore
  if (dateInput?.seconds) {
    const firestoreDate = new Date(dateInput.seconds * 1000);
    return formatDate(firestoreDate);
  }

  return "Date inconnue";
};

// Sous-fonction de formatage
const formatDate = (date: Date) => {
  return `${date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })}`;
};

const handleUpdateClient  = async (updatedClient: any) => {
  try {
    await update(client.id, updatedClient); // Make sure you have this function in your useClients hook
    setShowSuccessToast(true);
    setIsEditModalOpen(false);
    // Optionally refresh client data
  } catch (error) {
    console.error('Error updating client:', error);
  }
};


  const handleDeleteClient = async () => {
    try {
      await removeClient(client.id);
      setShowSuccessToast(true);
      setTimeout(() => {
        navigate('/clients');
      }, 1500);
    } catch (error) {
      console.error('Erreur lors de la suppression du client:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/clients')}
            className="p-2 rounded-lg hover:bg-accent"
          >
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
          <div>
            <h1 className="text-3xl font-bold text-primary">{client.name}</h1>
            <div className="flex items-center mt-1 text-muted-foreground">
              <Building2 className="w-4 h-4 mr-1" />
              {client.address.street}, {client.address.postalCode} {client.address.city}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
        <motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  onClick={() => setIsEditModalOpen(true)}
  className="p-2 hover:bg-accent/10 rounded-lg transition-colors"
>
  <Edit2 className="w-5 h-5 text-muted-foreground" />
</motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsDeleteModalOpen(true)}
            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5 text-destructive" />
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
          >
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-500" />
              Contact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Nom</div>
                  <div className="font-medium mt-1">{client.contact.firstName} {client.contact.lastName}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div className="font-medium mt-1">{client.contact.email}</div>
                </div>
                {client.contact.secondaryEmail && (
                  <div>
                    <div className="text-sm text-muted-foreground">Email secondaire</div>
                    <div className="font-medium mt-1">{client.contact.secondaryEmail}</div>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Téléphone</div>
                  <div className="font-medium mt-1">{client.contact.phone}</div>
                </div>
                {client.contact.secondaryPhone && (
                  <div>
                    <div className="text-sm text-muted-foreground">Téléphone secondaire</div>
                    <div className="font-medium mt-1">{client.contact.secondaryPhone}</div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-muted-foreground">Client depuis</div>
                  <div className="font-medium mt-1">{formatClientSinceDate(client.createdAt)}</div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
          >
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Package className="w-5 h-5 mr-2 text-green-500" />
              Installations
            </h2>
            <div className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                Aucune installation enregistrée
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
          >
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-orange-500" />
              Rendez-vous
            </h2>
            <div className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                Aucun rendez-vous programmé
              </div>
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
          >
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-red-500" />
              Adresse
            </h2>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Rue</div>
                <div className="font-medium mt-1">{client.address.street}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Code postal</div>
                <div className="font-medium mt-1">{client.address.postalCode}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Ville</div>
                <div className="font-medium mt-1">{client.address.city}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Pays</div>
                <div className="font-medium mt-1">{client.address.country}</div>
              </div>
            </div>
          </motion.div>

          {client.tag && (
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
            >
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <Tag className="w-5 h-5 mr-2 text-purple-500" />
                Étiquette
              </h2>
              <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm inline-block">
                {client.tag}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <DeleteClientModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteClient}
        clientName={client.name}
      />
<UpdateClientModal
  isOpen={isEditModalOpen}
  onClose={() => setIsEditModalOpen(false)}
  onSave={handleUpdateClient}
  initialData={{
    ...client,
  }}
/>

      <Toast
        message="Le client a été supprimé avec succès"
        isVisible={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
      />
    </motion.div>
  );
}