import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  Search, 
  Clock, 
  MapPin, 
  Users, 
  AlertCircle, 
  Briefcase 
} from 'lucide-react';

const projects = [
  {
    id: 1,
    name: "Installation Climatisation",
    client: "Entreprise ABC",
    progress: 75,
    status: "En cours",
    dueDate: "5 jours",
    location: "Paris 75001",
    teamSize: 4,
    priority: "Haute"
  },
  {
    id: 2,
    name: "Maintenance Préventive",
    client: "Résidence XYZ",
    progress: 30,
    status: "En attente",
    dueDate: "2 semaines",
    location: "Lyon 69001",
    teamSize: 2,
    priority: "Moyenne"
  },
  {
    id: 3,
    name: "Rénovation Système",
    client: "Hotel Luxe",
    progress: 90,
    status: "Presque terminé",
    dueDate: "2 jours",
    location: "Marseille 13001",
    teamSize: 5,
    priority: "Urgente"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

export function Projects() {
  const navigate = useNavigate();

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
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors shadow-lg"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Nouveau Projet
        </motion.button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <input
          type="text"
          placeholder="Rechercher un projet..."
          className="w-full pl-12 pr-4 py-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
        />
      </div>

      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {projects.map((project) => (
          <motion.div
            key={project.id}
            variants={itemVariants}
            whileHover={{ y: -5 }}
            onClick={() => navigate(`/projects/${project.id}`)}
            className="bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{project.name}</h3>
                  <p className="text-sm text-muted-foreground">{project.client}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                project.priority === "Haute" ? "bg-orange-100 text-orange-700" :
                project.priority === "Urgente" ? "bg-red-100 text-red-700" :
                "bg-blue-100 text-blue-700"
              }`}>
                {project.priority}
              </span>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progression</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${project.progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="bg-primary h-2 rounded-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Échéance: {project.dueDate}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{project.location}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="w-4 h-4 mr-2" />
                  <span>{project.teamSize} membres</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <span>{project.status}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border/50 flex justify-between items-center">
              <div className="flex -space-x-2">
                {Array.from({ length: project.teamSize }).map((_, index) => (
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
              >
                Voir les détails
              </motion.button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}