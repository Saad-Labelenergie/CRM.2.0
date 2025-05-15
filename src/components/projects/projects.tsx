import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import {
  UserPlus,
  Search,
  Clock,
  MapPin,
  Users,
  AlertCircle,
  Briefcase,
  Trash2,
  CircleDot,
  CheckCircle,
  Upload,
  Truck,
  Check ,
  Ban,
  List,
  LayoutGrid,
  Eye

} from 'lucide-react';
import { collection, getDocs, query, where, deleteDoc,updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

// Ajoutez ces interfaces
interface CancelReason {
  projectId: string;
  reason: 'chantier infaisable' | 'annulation client' | 'autre' | '';
}

// Modifiez l'interface Project
interface Project {
  id: string;
  name: string;
  client: {
    id: string;
    name: string;
  };
  team:String;
  progress?: number;
  status?: string;
  dueDate?: string;
  location?: string;
  teamSize?: number;
  priority?: string;
  cancellationReason?: string; // Nouveau champ
  type: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const statusProgressMap: { [key: string]: number } = {
  placer: 10,
  confirmer: 25,
  charger: 50,
  encours: 75,
  terminer: 100,
  annuler: 0
};

const getProgressColor = (progress: number) => {
  if (progress <= 10) return 'bg-[#039BE5]';
  if (progress <= 25) return 'bg-[#E67C73]';
  if (progress <= 50) return 'bg-[#3F51B5]';
  if (progress <= 75) return 'bg-[#8E24AA]';
  if (progress < 100) return 'bg-[#33B679]';
  return 'bg-[#D50000]';
};


const tabs = [
  { id: 'all', label: 'Tous', icon: null, color: 'bg-gray-200 text-gray-800' }, 
  { id: 'placer', label: 'Placé', icon: Upload, color: 'bg-orange-100 text-orange-800' },
  { id: 'confirmer', label: 'Confirmé', icon: CheckCircle, color: 'bg-yellow-100 text-yellow-800' },
  { id: 'charger', label: 'Chargé', icon: Truck, color: 'bg-blue-100 text-blue-800' },
  { id: 'encours', label: 'En cours', icon: Clock, color: 'bg-indigo-100 text-indigo-800' },
  { id: 'terminer', label: 'Terminé', icon: Check, color: 'bg-green-100 text-green-800' },
  { id: 'annuler', label: 'Annuler', icon: Ban, color: 'bg-red-100 text-red-800' }
];

// Dans le composant Projects
export function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const uniqueTeams = ['all', ...Array.from(new Set(projects.map(p => p.team)))];
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string>('all');

  const [cancelProjectData, setCancelProjectData] = useState<CancelReason>({ 
    projectId: '', 
    reason: '' 
  });
  const [cancelProjectId, setCancelProjectId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const snapshot = await getDocs(collection(db, 'projects'));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Project[];
    setProjects(data);
  };
  


// Annuler un projet :
const handleCancelProject = async () => {
  if (!cancelReason || !cancelProjectId) return;
  
  try {
    await updateDoc(doc(db, 'projects', cancelProjectId), {
      status: 'annuler',
      cancellationReason: cancelReason,
      updatedAt: new Date()
    });
    fetchProjects();
  } catch (error) {
    console.error("Erreur d'annulation :", error);
  } finally {
    setCancelProjectId(null);
    setCancelReason('');
  }
};

// Ajoutez ce modal de confirmation

const CancelConfirmationModal = ({ cancelReason, setCancelReason, setCancelProjectId, handleCancelProject, projectName }) => {
  const [customReason, setCustomReason] = useState('');

  const submitCancel = () => {
    const finalReason = cancelReason === 'autre' ? customReason : cancelReason;
    handleCancelProject(finalReason);
    setCancelProjectId(null);
    setCancelReason('');
    setCustomReason('');
  };




  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.stopPropagation()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="relative bg-card rounded-2xl shadow-2xl p-8 w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nouveau message */}
        <div className="mb-6 space-y-2 text-center">
          <h2 className="text-xl font-semibold text-destructive">
            Vous êtes sur le point d'annuler le chantier <span className="font-bold">{projectName}</span>. Êtes-vous sûr ?
          </h2>
          <p className="text-muted-foreground">
            Veuillez donner la raison de l'annulation de ce chantier.
          </p>
        </div>

        {/* Choix des raisons */}
        <div className="space-y-4 mb-8">
          {['chantier infaisable', 'annulation client', 'autre'].map((reason) => (
            <label
              key={reason}
              className="flex items-center gap-4 p-4 bg-accent/20 rounded-xl cursor-pointer hover:bg-accent/30 transition-transform transform hover:scale-[1.02]"
            >
              <input
                type="radio"
                name="cancelReason"
                value={reason}
                checked={cancelReason === reason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="form-radio text-primary focus:ring-2 focus:ring-primary h-5 w-5"
              />
              <span className="capitalize text-lg">{reason}</span>
            </label>
          ))}
        </div>

        {/* Zone de texte si "autre" */}
        {cancelReason === 'autre' && (
          <div className="mb-8">
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Entrez la raison d'annulation..."
              className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        )}

        <div className="flex justify-end gap-4">
          <button
            onClick={() => {
              setCancelProjectId(null);
              setCancelReason('');
              setCustomReason('');
            }}
            className="px-5 py-3 rounded-xl bg-muted hover:bg-muted/80 shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-muted"
          >
            Retour
          </button>
          <button
            onClick={submitCancel}
            disabled={cancelReason === 'autre' && customReason.trim() === ''}
            className="px-5 py-3 bg-destructive text-destructive-foreground rounded-xl shadow-sm hover:bg-destructive/90 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-destructive"
          >
            Confirmer
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Pagination Params
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 6;

const filteredProjects = projects.filter(project => {
  const matchesSearch =
  (project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
  (project.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
  const matchesStatus = activeTab === 'all' || project.status === activeTab;
  const matchesTeam = selectedTeam === 'all' || project.team === selectedTeam;
  return matchesSearch && matchesStatus && matchesTeam;
});
const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
const paginatedProjects = filteredProjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);


  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Statistiques */}
<motion.div 
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-8 gap-4"
>
  {/* Carte Stat */}
  {[
    { label: 'Tous', value: projects.length, color: 'bg-black text-white', icon: <List className="w-5 h-5" /> }, 
    { label: 'Placé', value: projects.filter(p => p.status === 'placer').length, color: 'bg-[#e0f7ff] text-white', icon: <Upload className="w-5 h-5" /> },
    { label: 'Confirmé', value: projects.filter(p => p.status === 'confirmer').length, color: 'bg-[#E67C73] text-white', icon: <CheckCircle className="w-5 h-5" /> },
    { label: 'Chargé', value: projects.filter(p => p.status === 'charger').length, color: 'bg-[#3F51B5] text-white', icon: <Truck className="w-5 h-5" /> },
    { label: 'En cours', value: projects.filter(p => p.status === 'encours').length, color: 'bg-[#8E24AA] text-white', icon: <Clock className="w-5 h-5" /> },
    { label: 'Terminé', value: projects.filter(p => p.status === 'terminer').length, color: 'bg-[#33B679] text-white', icon: <Check className="w-5 h-5" /> },
    { label: 'Annulé', value: projects.filter(p => p.status === 'annuler').length, color: 'bg-[#D50000] text-white', icon: <Ban className="w-5 h-5" /> },
  ].map((stat, index) => (
    <motion.div
      key={index}
      whileHover={{ scale: 1.05 }}
      className={`flex flex-col items-center justify-center p-4 rounded-xl shadow ${stat.color}`}
    >
      <div className="mb-2">{stat.icon}</div>
      <div className="text-xl font-bold">{stat.value}</div>
      <div className="text-sm">{stat.label}</div>
    </motion.div>
  ))}
</motion.div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        
        <div>
          <h1 className="text-3xl font-bold text-primary">Projets en Cours</h1>
          <p className="text-muted-foreground mt-1">Suivez l'avancement de vos chantiers</p>
        </div>
        
        {/* Boutons de vue */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto space-x-2 pb-2">
  {tabs.map((tab) => (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      className={`flex items-center px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
        activeTab === tab.id
          ? `${tab.color} font-semibold`
          : 'bg-muted text-muted-foreground hover:bg-muted/80'
      }`}
    >
      {tab.icon && <tab.icon className="w-4 h-4 mr-2" />}
      {tab.label}
    </button>
  ))}
</div>

      {/* Search Bar */}
      {/* <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <input
          type="text"
          placeholder="Rechercher un projet..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
        />
      </div> */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
  <div className="flex-1 relative">
    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
    <input
      type="text"
      placeholder="Rechercher un projet..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full pl-12 pr-4 py-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
    />
  </div>

  {/* Sélecteur d'équipe */}
  <select
    value={selectedTeam}
    onChange={(e) => setSelectedTeam(e.target.value)}
    className="w-full md:w-64 px-4 py-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
  >
    {uniqueTeams.map(team => (
      <option key={team} value={team}>
        {team === 'all' ? 'Toutes les équipes' : team}
      </option>
    ))}
  </select>
</div>
     

      {/* Project Cards */}
      {viewMode === 'grid' ? (
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        
        {paginatedProjects.map((project) => {
          const projectProgress = statusProgressMap[project.status || 'confirmer'] ?? 0;

          return(
          
          
          <motion.div
            key={project.id}
            variants={itemVariants}
            whileHover={{ y: -5 }}
            onClick={() => navigate(`/projects/${project.id}`)}
            className="bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50 relative cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{project.client?.name}</h3>
                  <p className="text-sm text-muted-foreground">{project.name}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                project.type === 'Maintenance' ? 'bg-orange-100 text-orange-700' :
                project.type === 'STANDARD' ? 'bg-blue-100 text-blue-700' :
                'bg-red-100 text-red-700'
              }`}>
                {project.type || 'Normale'}
              </span>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progression</span>
                  <span className="font-medium">{projectProgress}%</span>
                  </div>
                <div className="w-full bg-secondary rounded-full h-2">
  <motion.div
    initial={{ width: 0 }}
    animate={{ width: `${projectProgress}%` }}
    transition={{ duration: 1, ease: 'easeOut' }}
    className={`h-2 rounded-full ${getProgressColor(projectProgress)}`}
  />
</div>

              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Échéance: {project.dueDate || 'Non définie'}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{project.location || 'N/A'}</span>
                </div> */}
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="w-4 h-4 mr-2" />
                  <span>{project.team} </span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <span>{project.status || 'en_attente'}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border/50 flex justify-between items-center">
              <div className="flex -space-x-2">
                {Array.from({ length: project.teamSize ?? 0 }).map((_, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center ring-2 ring-background"
                  >
                    <span className="text-xs font-medium">T{index + 1}</span>
                  </div>
                ))}
              </div>
              <motion.button
            whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="text-sm text-primary font-medium hover:underline"
    onClick={(e) => {
      e.stopPropagation();
      setCancelProjectId(project.id);
    }}
  >
    <Ban className="w-4 h-4 text-red-500 inline mr-1" /> Annuler
  </motion.button>
            </div>
            
          </motion.div>
          
          
        );})}

      </motion.div>
      
         ) : (
          /* Nouvelle Vue Tableau */
          <div className="overflow-x-auto border rounded-lg">
          <table className="w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="text-left p-4 font-medium text-muted-foreground">Client</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Projet</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Équipe</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Statut</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Progression</th>
                <th className="text-center p-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
  <AnimatePresence>
    {paginatedProjects.map((project) => {
      const projectProgress = statusProgressMap[project.status || 'confirmer'] ?? 0;

      return (
        <motion.tr
          key={project.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => navigate(`/projects/${project.id}`)}
          className="border-b last:border-b-0 hover:bg-accent transition-colors cursor-pointer group"
        >
          <td className="p-4 text-sm text-gray-800 group-hover:text-primary">{project.client.name}</td>
          <td className="p-4 font-semibold text-sm">{project.name}</td>
          <td className="p-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              {project.team}
            </div>
          </td>
          <td className="p-4 text-sm">
            <div
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                project.status === 'annuler' ? 'bg-red-100 text-red-800' :
                project.status === 'terminer' ? 'bg-green-100 text-green-800' :
                project.status === 'encours' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}
            >
              {project.status === 'annuler' ? 'Annulé' :
                project.status === 'terminer' ? 'Terminé' :
                project.status === 'encours' ? 'En cours' :
                project.status?.replace('_', ' ')}
            </div>
          </td>
          {/* ➡️ Nouvelle colonne Progression */}
          <td className="p-4 w-48">
            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getProgressColor(projectProgress)}`}
                style={{ width: `${projectProgress}%` }}
              />
            </div>
            <div className="text-xs mt-1 text-center font-medium text-muted-foreground">{projectProgress}%</div>
          </td>

          <td className="p-4">
            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/projects/${project.id}`);
                }}
                className="p-1 hover:bg-muted rounded-full"
                title="Voir les détails"
              >
                <Eye className="w-4 h-4" />
              </motion.button> */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setCancelProjectId(project.id);
                }}
                className="p-1 hover:bg-red-100 rounded-full text-red-500"
                title="Annuler le projet"
              >
                <Ban className="w-4 h-4" />
              </motion.button>
            </div>
          </td>
        </motion.tr>
      );
    })}
  </AnimatePresence>
</tbody>


          </table>

        </div>
        )}
        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 mt-8">
  <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-3 py-1 rounded bg-muted hover:bg-muted/80 disabled:opacity-50">« First</button>
  <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 rounded bg-muted hover:bg-muted/80 disabled:opacity-50">‹ Prev</button>
  <span className="px-3">{currentPage} / {totalPages}</span>
  <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 rounded bg-muted hover:bg-muted/80 disabled:opacity-50">Next ›</button>
  <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="px-3 py-1 rounded bg-muted hover:bg-muted/80 disabled:opacity-50">Last »</button>
</div>
      <AnimatePresence>
  {cancelProjectId && (
    <CancelConfirmationModal 
      cancelReason={cancelReason}
      setCancelReason={setCancelReason}
      setCancelProjectId={setCancelProjectId}
      handleCancelProject={handleCancelProject}
      projectName={projects.find(p => p.id === cancelProjectId)?.name || ''}
    />
  )}
</AnimatePresence>

    </motion.div>
  );
}
