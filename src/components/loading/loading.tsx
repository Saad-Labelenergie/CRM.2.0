import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scale, Users, HardHat, AlertTriangle, Calendar, Search, Filter, MoreVertical, Plus } from 'lucide-react';
import { useScheduling } from '../../lib/scheduling/scheduling-context';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { AssignProjectModal } from './components/assign-project-modal';

// Types pour les projets et équipes
interface Project {
  id: string;
  name: string;
  hours: number;
  date: string;
  teamId?: string;
}

interface TeamWithLoad {
  id: string;
  name: string;
  capacity: number;
  currentLoad: number;
  projects: Project[];
  color: string;
  expertise: string[];
  isActive: boolean;
}

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

export function Loading() {
  const { teams, appointments } = useScheduling();
  const [searchTerm, setSearchTerm] = useState('');
  const [teamsWithLoad, setTeamsWithLoad] = useState<TeamWithLoad[]>([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamWithLoad | null>(null);

  // Calculer la charge des équipes en fonction des rendez-vous
  useEffect(() => {
    if (teams.length > 0 && appointments.length > 0) {
      const activeTeams = teams.filter(team => team.isActive);
      
      const teamsWithProjects = activeTeams.map(team => {
        // Trouver tous les rendez-vous assignés à cette équipe
        const teamAppointments = appointments.filter(
          app => app.team === team.name && app.status === 'attribue'
        );
        
        // Convertir les rendez-vous en projets
        const projects = teamAppointments.map(app => ({
          id: app.id,
          name: app.title,
          hours: app.duration === '1h' ? 1 : 
                 app.duration === '2h' ? 2 : 
                 app.duration === '4h' ? 4 : 8, // Estimation basée sur la durée
          date: format(new Date(app.date), 'dd/MM/yyyy'),
          teamId: team.id
        }));
        
        // Calculer la charge actuelle
        const totalHours = projects.reduce((sum, project) => sum + project.hours, 0);
        const currentLoad = Math.min(Math.round((totalHours / 40) * 100), 100); // 40h = capacité hebdomadaire
        
        return {
          ...team,
          projects,
          capacity: 40, // Capacité hebdomadaire en heures
          currentLoad
        };
      });
      
      setTeamsWithLoad(teamsWithProjects);
    } else {
      // Utiliser les données statiques si aucune donnée n'est disponible
      setTeamsWithLoad([
        {
          id: "1",
          name: "Équipe Installation A",
          capacity: 100,
          currentLoad: 80,
          color: "#3B82F6",
          expertise: ["Installation", "Maintenance"],
          isActive: true,
          projects: [
            { id: "p1", name: "Installation Climatisation Bureau A", hours: 24, date: "15/02/2024" },
            { id: "p2", name: "Maintenance Système Ventilation", hours: 16, date: "16/02/2024" }
          ]
        },
        {
          id: "2",
          name: "Équipe Installation B",
          capacity: 100,
          currentLoad: 60,
          color: "#10B981",
          expertise: ["Installation"],
          isActive: true,
          projects: [
            { id: "p3", name: "Installation Multi-Split Résidence", hours: 32, date: "15/02/2024" }
          ]
        },
        {
          id: "3",
          name: "Équipe Maintenance",
          capacity: 100,
          currentLoad: 90,
          color: "#F59E0B",
          expertise: ["Maintenance", "Dépannage"],
          isActive: true,
          projects: [
            { id: "p4", name: "Maintenance Préventive Centre Commercial", hours: 24, date: "15/02/2024" },
            { id: "p5", name: "Dépannage Urgent Climatisation", hours: 8, date: "16/02/2024" },
            { id: "p6", name: "Entretien Système Ventilation", hours: 16, date: "17/02/2024" }
          ]
        }
      ]);
    }
  }, [teams, appointments]);

  // Filtrer les équipes en fonction de la recherche
  const filteredTeams = teamsWithLoad.filter(team => 
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.projects.some(project => 
      project.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleOpenAssignModal = (team: TeamWithLoad) => {
    setSelectedTeam(team);
    setIsAssignModalOpen(true);
  };

  const handleAssignProject = (teamId: string, projectData: any) => {
    // Ici, vous implémenteriez la logique pour assigner un projet à une équipe
    console.log('Assigning project to team:', teamId, projectData);
    setIsAssignModalOpen(false);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Chargement des Équipes</h1>
          <p className="text-muted-foreground mt-1">Gérez la répartition des chantiers par équipe</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAssignModalOpen(true)}
          className="flex items-center px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Assigner un Projet
        </motion.button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher une équipe ou un chantier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-3 bg-accent hover:bg-accent/80 rounded-xl flex items-center transition-colors"
        >
          <Filter className="w-5 h-5 mr-2" />
          Filtrer
        </motion.button>
      </div>

      <motion.div
        variants={containerVariants}
        className="grid gap-6"
      >
        {filteredTeams.map((team) => (
          <motion.div
            key={team.id}
            variants={itemVariants}
            className="bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{team.name}</h3>
                  <div className="flex items-center mt-1">
                    <Scale className="w-4 h-4 text-muted-foreground mr-1" />
                    <span className="text-sm text-muted-foreground">
                      Charge : {team.currentLoad}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden mr-4">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${team.currentLoad}%` }}
                    className={`h-full rounded-full ${
                      team.currentLoad >= 90 ? 'bg-red-500' :
                      team.currentLoad >= 75 ? 'bg-orange-500' :
                      'bg-green-500'
                    }`}
                  />
                </div>
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleOpenAssignModal(team)}
                    className="p-2 hover:bg-primary/10 rounded-lg transition-colors text-primary"
                    title="Assigner un projet"
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                  <Link to={`/teams/${team.id}`}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 hover:bg-accent rounded-lg transition-colors"
                      title="Voir détails"
                    >
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </motion.button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {team.projects.length === 0 ? (
                <div className="bg-accent/30 rounded-lg p-4 text-center text-muted-foreground">
                  Aucun projet assigné à cette équipe
                </div>
              ) : (
                team.projects.map((project, index) => (
                  <div
                    key={project.id || index}
                    className="bg-accent/50 rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <HardHat className="w-4 h-4 text-primary" />
                        <span className="font-medium">{project.name}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        project.hours >= 24 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {project.hours}h
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{project.date}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {team.currentLoad >= 90 && (
              <div className="mt-4 flex items-center text-orange-500 bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg">
                <AlertTriangle className="w-4 h-4 mr-2" />
                <span className="text-sm">Cette équipe approche de sa capacité maximale</span>
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Modal pour assigner un projet */}
      {isAssignModalOpen && (
        <AssignProjectModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          onAssign={handleAssignProject}
          teams={teamsWithLoad}
          selectedTeam={selectedTeam}
        />
      )}
    </motion.div>
  );
}