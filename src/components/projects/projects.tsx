import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
  Ban
} from 'lucide-react';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface Project {
  id: string;
  name: string;
  client: {
    id: string;
    name: string;
  };
  progress?: number;
  status?: string;
  dueDate?: string;
  location?: string;
  teamSize?: number;
  priority?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const tabs = [
  { id: 'all', label: 'Tous' },
  { id: 'confirmer', label: 'Confirmé', icon: CheckCircle },
  { id: 'placer', label: 'Placé', icon: Upload },
  { id: 'charger', label: 'Chargé', icon: Truck },
  { id: 'encours', label: 'En cours', icon: Clock },
  { id: 'terminer', label: 'Terminé', icon:Check },
  { id: 'annuler', label: 'Annuler', icon: Ban }
];
export function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const snapshot = await getDocs(collection(db, 'projects'));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Project[];
    setProjects(data);
  };

  const deleteProjectByName = async (name: string) => {
    const q = query(collection(db, 'projects'), where('name', '==', name));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      await deleteDoc(doc(db, 'projects', snapshot.docs[0].id));
      fetchProjects();
    } else {
      alert('Projet non trouvé');
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) || project.client.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = activeTab === 'all' || (project.status || 'confirmer' || 'placer' || 'charger' ||'encours' || 'terminer' || 'annuler') === activeTab;
    return matchesSearch && matchesStatus;
  });

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Projets en Cours</h1>
          <p className="text-muted-foreground mt-1">Suivez l'avancement de vos chantiers</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto space-x-2 pb-2">
  {tabs.map((tab) => (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      className={`flex items-center px-4 py-2 rounded-lg whitespace-nowrap ${
        activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
      }`}
    >
      {tab.icon && <tab.icon className="w-4 h-4 mr-2" />}
      {tab.label}
    </button>
  ))}
</div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <input
          type="text"
          placeholder="Rechercher un projet..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
        />
      </div>

      {/* Project Cards */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {filteredProjects.map((project) => (
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
                  <h3 className="font-semibold text-lg">{project.name}</h3>
                  <p className="text-sm text-muted-foreground">{project.client?.name}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                project.priority === 'Haute' ? 'bg-orange-100 text-orange-700' :
                project.priority === 'Urgente' ? 'bg-red-100 text-red-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {project.priority || 'Normale'}
              </span>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progression</span>
                  <span className="font-medium">{project.progress ?? 0}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${project.progress ?? 0}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="bg-primary h-2 rounded-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Échéance: {project.dueDate || 'Non définie'}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{project.location || 'N/A'}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="w-4 h-4 mr-2" />
                  <span>{project.teamSize ?? 0} membres</span>
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
                  deleteProjectByName(project.name);
                }}
              >
                <Trash2 className="w-4 h-4 text-red-500 inline mr-1" /> Supprimer
              </motion.button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
