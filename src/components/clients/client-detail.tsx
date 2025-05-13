import React, { useState,useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pencil } from 'lucide-react';
import EditContactModal from './components/EditContactModal';
import EditAddressModal from './components/EditAdressModal';
import EditTagModal from './components/EditTagModal';
import EditProductsStepModal from './components/EditProductsModal';
import { UpdateClientModal } from './components/update-client-modal';
import { useProducts } from '../../lib/hooks/useProducts';
import { useAppointments } from '../../lib/hooks/useAppointments';
import { useParams, useNavigate } from 'react-router-dom';
import { useSAV } from '../../contexts/sav-context';
import { db } from '../../lib/firebase';
import { 
  ArrowLeft, 
  Users,
  Mail,
  Phone,
  MapPin,
  Tag,
  Building2,
  ArrowRight ,
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
import { deleteDoc, doc, collection, query, where, getDocs } from 'firebase/firestore';

interface MaintenanceRecord {
  id: string;
  clientId: string;
  clientName: string;
  equipmentId: string;
  equipmentName: string;
  type: string;
  frequency: number;
  lastMaintenance: string;
  nextMaintenance: string;
  teamId: string | null;
  teamName: string | null;
  notes: string;
  status: string;
  contractNumber: string;
  createdAt: string;
} 

export function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: clients = [], loading, remove: removeClient,update} = useClients();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { data: products = [] } = useProducts();
  const { data: appointments = [] } = useAppointments();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);  
  const [maintenanceRecords, setMaintenanceRecords] = useState<any[]>([]);
  const { tickets } = useSAV();
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [isTagModalOpen, setIsTagModalOpen] = useState(false)
  const [isProductsModalOpen, setIsProductsModalOpen] = useState(false)




  const client = clients.find(c => c.id === id);

  useEffect(() => {
    console.log("🔍 Fetching maintenance for clientId:", id);
  
    const fetchMaintenance = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'maintenances'));
        const allRecords = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
        console.log("📦 All maintenance records:", allRecords);
  
        const filteredRecords = allRecords.filter(
          (r: any) => r.clientId?.trim() === id?.trim() // 🔥 Ajoute cette ligne ici
        );
  
        console.log("✅ Filtered maintenance records:", filteredRecords);
        setMaintenanceRecords(filteredRecords);
  
      } catch (error) {
        console.error("❌ Error fetching maintenance:", error);
      }
    };
  
    fetchMaintenance();
  }, [id]);
  
  
  
  
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

  const clientAppointments = appointments.filter(
    (a) => String(a.client.id) === String(client.id)
  );

  const assignedProducts = products.filter(product =>
    client.productsIds?.includes(product.id)
  );
  
  const totalTTC = assignedProducts.reduce((acc, product) => acc + Number(product.price?.ttc || 0), 0);
  
  // Fonction utilitaire pour formater la dates
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

// Créez une variable pour filtrer les tickets du client
const clientTickets = tickets.filter(ticket => 
  ticket.client.id === client.id
);


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


const handleDeleteClient = async (clientId: string) => {
  try {
    // Supprimer les rendez-vous associés
    const appointmentsQuery = query(
      collection(db, 'appointments'), 
      where('client.id', '==', clientId)
    );
    
    const querySnapshot = await getDocs(appointmentsQuery);
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    // Supprimer le client
    await deleteDoc(doc(db, 'clients', clientId));
    
    console.log('Client et rendez-vous supprimés avec succès');
  } catch (error) {
    console.error('Erreur lors de la suppression :', error);
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
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-xl font-semibold flex items-center">
      <Users className="w-5 h-5 mr-2 text-blue-500" />
      Contact
    </h2>
    <button onClick={() => setIsModalOpen(true)} title="Modifier le contact">
      <Pencil className="w-5 h-5 text-muted-foreground hover:text-primary transition" />
    </button>
  </div>
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
  <h2 className="text-xl font-semibold mb-6 flex items-center justify-between">
    <div className="flex items-center">
      <Package className="w-5 h-5 mr-2 text-green-500" />
      Produits
    </div>
    <div className="flex items-center gap-3">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsProductsModalOpen(true)}
        className="text-primary hover:text-primary/80 transition-colors"
      >
        <Pencil className="w-5 h-5" />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate(`/products`)}
        className="text-primary hover:text-primary/80 transition-colors"
      >
        <ArrowRight className="w-5 h-5" />
      </motion.button>
    </div>
  </h2>

  <div className="space-y-4">
    {assignedProducts.length > 0 ? (
      <>
        <ul className="divide-y divide-border">
          {assignedProducts.map((product) => (
            <li key={product.id} className="py-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-primary">{product.name}</span>
                <span className="text-sm text-muted-foreground">
                  {Number(product.price.ttc).toFixed(2)} € TTC
                </span>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-end">
          <div className="text-lg font-semibold text-green-600">
            Total : {totalTTC.toFixed(2)} € TTC
          </div>
        </div>
      </>
    ) : (
      <div className="text-center py-8 text-muted-foreground">
        Aucune installation enregistrée
      </div>
    )}
  </div>
  </motion.div>

          <motion.div
  whileHover={{ y: -5 }}
  className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
>
<h2 className="text-xl font-semibold mb-6 flex items-center justify-between">
  <div className="flex items-center">
  <Clock className="w-5 h-5 mr-2 text-orange-500" />
  Installations
  </div>
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => navigate(`/calendar`)}
    className="text-primary hover:text-primary/80 transition-colors"
  >
    <ArrowRight className="w-5 h-5" />
  </motion.button>
</h2>

  <div className="space-y-4">
    {clientAppointments.length > 0 ? (
      <ul className="divide-y divide-border">
  {clientAppointments.map((appointment) => (
    <li key={appointment.id} className="py-2">
      <div className="flex justify-between items-start gap-2">
        <div>
          <div className="font-medium text-primary">{appointment.title}</div>
          <div className="text-sm text-muted-foreground">
            {new Date(`${appointment.date}T${appointment.time}`).toLocaleString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })} • {appointment.type}
          </div>
          {appointment.team && (
            <div className="text-sm text-blue-600 mt-1">
              Équipe : <span className="font-semibold">{appointment.team}</span>
            </div>
          )}
          <div className="text-sm text-muted-foreground mt-1">
            Durée : <span className="font-medium">{appointment.duration}</span>
          </div>
        </div>
        {/* <div
          className="text-xs font-medium rounded px-2 py-1 mt-1"
          style={{
            backgroundColor: appointment.teamColor || '#E5E7EB',
            color: '#fff',
          }}
        >
          {appointment.status}
        </div> */}
      </div>
    </li>
  ))}
</ul>

    ) : (
      <div className="text-center py-8 text-muted-foreground">
        Aucun rendez-vous programmé
      </div>
    )}
  </div>
</motion.div>
<motion.div
  whileHover={{ y: -5 }}
  className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
>
<h2 className="text-xl font-semibold mb-6 flex items-center justify-between">
  <div className="flex items-center">
    <AlertCircle className="w-5 h-5 mr-2 text-yellow-500" />
    SAV ({clientTickets.length})
  </div>
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => navigate(`/sav`)}
    className="text-primary hover:text-primary/80 transition-colors"
  >
    <ArrowRight className="w-5 h-5" />
  </motion.button>
</h2>

  <div className="space-y-4">
    {clientTickets.length > 0 ? (
      <ul className="divide-y divide-border">
        {clientTickets.map((ticket) => (
          <li key={ticket.id} className="py-3 group">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-primary">
                    Ticket #{ticket.number}
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    ticket.status === 'nouveau' ? 'bg-blue-100 text-blue-800' :
                    ticket.status === 'en_cours' ? 'bg-orange-100 text-orange-800' :
                    ticket.status === 'resolu' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {ticket.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="text-sm mt-1 text-muted-foreground">
                  {ticket.product.name} ({ticket.product.reference})
                </div>
                <div className="text-sm mt-1">
                  {ticket.description}
                </div>
                <div className="flex items-center text-sm mt-2 text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(ticket.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>

              </div>
            </div>
          </li>
        ))}
      </ul>
    ) : (
      <div className="text-center py-8 text-muted-foreground">
        Aucune demande SAV enregistrée
      </div>
    )}
  </div>
</motion.div>
        </div>

        <div className="space-y-6">
        <motion.div
  whileHover={{ y: -5 }}
  className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
>
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-xl font-semibold flex items-center">
      <MapPin className="w-5 h-5 mr-2 text-red-500" />
      Adresse
    </h2>
    <button onClick={() => setIsAddressModalOpen(true)} title="Modifier l'adresse">
      <Pencil className="w-5 h-5 text-muted-foreground hover:text-primary transition" />
    </button>
  </div>

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
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-semibold flex items-center">
        <Tag className="w-5 h-5 mr-2 text-purple-500" />
        Étiquette
      </h2>
      <button onClick={() => setIsTagModalOpen(true)} title="Modifier l'étiquette">
        <Pencil className="w-5 h-5 text-muted-foreground hover:text-primary transition" />
      </button>
    </div>
    <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm inline-block">
      {client.tag}
    </div>
            </motion.div>
            
          )}
<motion.div
  whileHover={{ y: -5 }}
  className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
>
<h2 className="text-xl font-semibold mb-6 flex items-center justify-between">
  <div className="flex items-center">
  <FileText className="w-5 h-5 mr-2 text-cyan-500" />
  Entretien
  </div>
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => navigate(`/maintenance`)}
    className="text-primary hover:text-primary/80 transition-colors"
  >
    <ArrowRight className="w-5 h-5" />
  </motion.button>
</h2>

  {maintenanceRecords.length > 0 ? (
    <ul className="space-y-4">
      {maintenanceRecords.map((record) => (
        <li key={record.id} className="bg-muted/10 rounded-lg p-4 border border-border/50">
          <div className="font-semibold text-primary">{record.equipmentName}</div>
          <div className="text-sm text-muted-foreground mt-1">
            Contrat : <span className="font-medium">{record.contractNumber}</span>
          </div>
          <div className="text-sm mt-1">
            Dernier entretien : <span className="font-medium">{record.lastMaintenance}</span>
          </div>
          <div className="text-sm">
            Prochain : <span className="font-medium">{record.nextMaintenance}</span>
          </div>
          <div className="text-sm">
            Fréquence : <span className="font-medium">{record.frequency} mois</span>
          </div>
          <div className="text-sm">
            Type : <span className="font-medium capitalize">{record.type}</span>
          </div>
          <div className="text-sm text-blue-600 mt-1">
            Équipe : <span className="font-semibold">{record.teamName}</span>
          </div>
          <div className="text-sm mt-1">
            Statut : <span className={`font-semibold ${
              record.status === 'upcoming'
                ? 'text-orange-500'
                : record.status === 'done'
                ? 'text-green-600'
                : 'text-muted-foreground'
            }`}>
              {record.status}
            </span>
          </div>
        </li>
      ))}
    </ul>
  ) : (
    <div className="text-center py-4 text-muted-foreground">
      Aucun entretien enregistré
    </div>
  )}
</motion.div>

        </div>
      </div>


      <DeleteClientModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteClient}
        clientName={client.name}
        clientId={client.id}
      />
<UpdateClientModal
  isOpen={isEditModalOpen}
  onClose={() => setIsEditModalOpen(false)}
  onSave={handleUpdateClient}
  initialData={{
    ...client,
    appointments: clientAppointments
  }}
/>

      <Toast
        message="Le client a été supprimé avec succès"
        isVisible={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
      />
                  {isModalOpen && (
    <EditContactModal
      contact={client.contact}
      onClose={() => setIsModalOpen(false)}
      clientId={client.id}
    />
  )}
    {isAddressModalOpen && (
    <EditAddressModal
      address={client.address}
      clientId={client.id}
      onClose={() => setIsAddressModalOpen(false)}
    />
  )}
      {isTagModalOpen && (
      <EditTagModal
        clientId={client.id}
        currentTag={client.tag}
        onClose={() => setIsTagModalOpen(false)}
      />
    )}
{isProductsModalOpen && (
  <EditProductsStepModal
    clientId={client.id}
    initialSelectedProducts={assignedProducts}
    onClose={() => setIsProductsModalOpen(false)}
    />
)}
    </motion.div>
  );
}