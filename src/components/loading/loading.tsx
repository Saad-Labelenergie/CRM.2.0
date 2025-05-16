import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scale, Users, HardHat, AlertTriangle, Calendar, Search, Filter, MoreVertical, Plus, CheckCircle, Truck, Package, ChevronDown, ChevronRight, History } from 'lucide-react';
import { useScheduling } from '../../lib/scheduling/scheduling-context';
import { format, startOfWeek, addDays, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { AssignProjectModal } from './components/assign-project-modal';
import { MaterialLoadingModal } from './components/material-loading-modal';
import { LoadingStats } from './components/loading-stats';
import { LoadingHistoryModal } from './components/loading-history-modal';

interface Project {
  id: string;
  name: string;
  hours: number;
  date: string;
  teamId?: string;
  materials?: Material[];
  projectId?: string;
  documentsSubmitted?: boolean; 
}
// Update the Material interface to include comments
interface Material {
  id: number;
  name: string;
  status: 'loaded' | 'not_loaded' | 'installed' | 'not_installed';
  comments?: string; // Add comments field
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
  const [searchTerm, setSearchTerm] = useState('');
  const [teamsWithLoad, setTeamsWithLoad] = useState<TeamWithLoad[]>([]);
  const [collapsedTeams, setCollapsedTeams] = useState<Record<string, boolean>>({});
  const [documentsRemis, setDocumentsRemis] = useState<Record<string, boolean>>({});
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false); // Add state for history modal
  const [selectedTeam, setSelectedTeam] = useState<TeamWithLoad | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'week'>('list');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const { teams, appointments, projects, updateProjectMaterials, updateTeamLoad, updateProject, updateAppointmentMaterials } = useScheduling();
  
  // Fonction pour obtenir les jours de la semaine actuelle (lundi au vendredi)
  const getWeekDays = (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 1 }); // Commence le lundi
    const days = [];
    
    for (let i = 0; i < 5; i++) { // Lundi à vendredi (5 jours)
      days.push(addDays(start, i));
    }
    
    return days;
  };
  
  // Obtenir les jours de la semaine actuelle
  const weekDays = getWeekDays(currentWeek);
  
  // Fonction pour passer à la semaine suivante
  const goToNextWeek = () => {
    setCurrentWeek(addDays(currentWeek, 7));
  };
  
  // Fonction pour revenir à la semaine précédente
  const goToPreviousWeek = () => {
    setCurrentWeek(addDays(currentWeek, -7));
  };
  
  // Fonction pour formater la plage de dates de la semaine
  const formatWeekRange = () => {
    const startDate = format(weekDays[0], 'd', { locale: fr });
    const endDate = format(weekDays[4], 'd MMMM yyyy', { locale: fr });
    return `Semaine du ${startDate} au ${endDate}`;
  };
  
  const handleDocumentChange = (projectId: string, checked: boolean) => {
    setDocumentsRemis(prev => ({
      ...prev,
      [projectId]: checked
    }));
    console.log(`Document pour le projet ${projectId} marqué comme ${checked ? 'remis' : 'non remis'}`);
  };
  
  useEffect(() => {
    if (projects.length > 0) {
      const documentsState = projects.reduce((acc, project) => {
        if (project.id) {
          acc[project.id] = false; 
        }
        return acc;
      }, {} as Record<string, boolean>);
      setDocumentsRemis(documentsState);
    }
  }, [projects]);
  
  const countMaterialsToLoad = (team: TeamWithLoad) => {
    return team.projects.reduce((count, project) => {
      if (!project.materials) return count;
      return count + project.materials.filter(m => m.status === 'not_loaded').length;
    }, 0);
  };
  
  const calculateTeamProgress = (team: TeamWithLoad) => {
    if (!team.projects.length) return 0;
    const total = team.projects.reduce(
      (sum, project) => sum + calculateProgress(project, documentsRemis[project.id] || false),
      0
    );
    return Math.round(total / team.projects.length);
  };
  
  const calculateProgress = (project: Project, documentsRemis: boolean) => {
    if (!project.materials) return 0;
    const totalItems = project.materials.length + 1; // +1 for documents
    const loadedItems = project.materials.filter(m => m.status === 'loaded').length;
    const docsValue = documentsRemis ? 1 : 0; 
    return Math.round(((loadedItems + docsValue) / totalItems) * 100);
  };
  
  // Ajoutez cette fonction pour mettre à jour la charge dans la BDD
  const updateTeamLoadInDatabase = async (teamId: string, currentLoad: number) => {
    try {
      await updateTeamLoad(teamId, currentLoad);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la charge de l'équipe:", error);
    }
  };
  
  // Modifiez l'useEffect qui calcule la charge des équipes
  useEffect(() => {
    if (teams.length > 0 && appointments.length > 0 && projects.length > 0) {
      const activeTeams = teams.filter(team => team.isActive);
      const teamsWithProjects = activeTeams.map(team => {
        // Trouver tous les rendez-vous assignés à cette équipe
        const teamAppointments = appointments.filter(
          app => app.team === team.name && app.status !== 'non_attribue'
        );
        // Convertir les rendez-vous en projets avec leurs matériaux
        const teamProjects = teamAppointments.map(app => {
          // Trouver le projet correspondant à ce rendez-vous
          const relatedProject = projects.find(p => 
            p.name === app.title && 
            p.team === team.name && 
            p.startDate === app.date
          );
          
          // Correction ici pour s'assurer que les statuts sont correctement convertis
          const convertedMaterials = relatedProject?.materials
            ? relatedProject.materials.map(m => ({
                ...m,
                status: m.status === 'installed'
                  ? 'loaded' as const
                  : m.status === 'not_installed'
                  ? 'not_loaded' as const
                  : (m.status as 'loaded' | 'not_loaded' | 'installed' | 'not_installed')
              }))
            : [
                { id: 1, name: "Unité intérieure", status: "not_loaded" as const },
                { id: 2, name: "Unité extérieure", status: "not_loaded" as const },
                { id: 3, name: "Tuyauterie", status: "not_loaded" as const },
                { id: 4, name: "Supports", status: "not_loaded" as const }
              ];
          
          // Vérification de débogage
          console.log('Projet chargé:', relatedProject?.name, 'Matériaux:', 
            relatedProject?.materials, 'Convertis:', convertedMaterials);
          
          return {
            id: app.id,
            name: app.title,
            hours: app.duration === '1h' ? 1 : 
                   app.duration === '2h' ? 2 : 
                   app.duration === '4h' ? 4 : 8, // Estimation basée sur la durée
            date: format(new Date(app.date), 'dd/MM/yyyy'),
            teamId: team.id,
            materials: convertedMaterials,
            projectId: relatedProject?.id // Stocker l'ID du projet pour les mises à jour
          };
        });    
        // Calculer la charge actuelle
        const totalHours = teamProjects.reduce((sum, project) => sum + project.hours, 0);
        const currentLoad = Math.min(Math.round((totalHours / 40) * 100), 100); // 40h = capacité hebdomadaire     
        // Vérifier si la charge a changé avant de la mettre à jour dans la BDD
        if (team.currentLoad !== currentLoad) {
          updateTeamLoadInDatabase(team.id, currentLoad);
        }
        return {
          ...team,
          projects: teamProjects,
          capacity: 40, // Capacité hebdomadaire en heures
          currentLoad
        };
      }); 
      setTeamsWithLoad(teamsWithProjects);
    } else {
      // Utiliser les données statiques si aucune donnée n'est disponible
      setTeamsWithLoad([
        // ... vos données statiques existantes ...
      ]);
    }
  }, [teams, appointments, projects, updateTeamLoad]);
  
  // Add the toggleTeamCollapse function
  const toggleTeamCollapse = (teamId: string) => {
    setCollapsedTeams(prev => ({
      ...prev,
      [teamId]: !prev[teamId]
    }));
  };
  
  // Filtrer les équipes en fonction de la recherche
  const filteredTeams = teamsWithLoad.filter(team => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return true; // Si la recherche est vide, tout afficher
  
    // Vérifie si le nom de l'équipe correspond
    if ((team.name || '').toLowerCase().includes(search)) return true;
  
    // Vérifie si un projet de l'équipe correspond
    return team.projects.some(project =>
      (project.name || '').toLowerCase().includes(search)
    );
  });
  
  const handleOpenAssignModal = (team: TeamWithLoad) => {
    setSelectedTeam(team);
    setIsAssignModalOpen(true);
  };
  
  const handleAssignProject = (teamId: string, projectData: any) => {
    // Ici, vous implémenteriez la logique pour assigner un projet à une équipe
    console.log('Assigning project to team:', teamId, projectData);
    setIsAssignModalOpen(false);
  };
  
  const handleOpenMaterialModal = (project: Project) => {
    setSelectedProject(project);
    setIsMaterialModalOpen(true);
  };
  
  const handleUpdateMaterials = async (projectId: string, materials: Material[]) => {
    try {
      console.log("Updating materials for project:", projectId, materials);
      // Convert materials to the expected format for the backend
      const formattedMaterials = materials.map(material => {
        return {
          id: material.id,
          name: material.name,
          status: material.status === 'loaded' ? 'installed' as const : 
                   material.status === 'not_loaded' ? 'not_installed' as const :
                   material.status, // Keep as is if already 'installed' or 'not_installed'
                   // Préserver les commentaires lors de la mise à jour
                   comments: material.comments || ''
                 };
      });
      
      await updateProjectMaterials(projectId, formattedMaterials);
      const relatedAppointment = appointments.find(app => 
        app.projectId === projectId
      );
      
      if (relatedAppointment) {
        await updateAppointmentMaterials(relatedAppointment.id, formattedMaterials);
      }
      
      // Mettre à jour l'état local avec les matériaux mis à jour
      setTeamsWithLoad(prevTeams => {
        return prevTeams.map(team => ({
          ...team,
          projects: team.projects.map(project => {
            if (project.projectId === projectId || project.id === projectId) {
              console.log("Updating local project materials:", materials);
              // Stocker les matériaux avec le statut d'affichage correct
              return { 
                ...project, 
                materials: [...materials] 
              };
            }
            return project;
          })
        }));
      });
      
      // Enregistrer les données dans le localStorage pour la persistance
      const localStorageKey = `project_materials_${projectId}`;
      localStorage.setItem(localStorageKey, JSON.stringify(materials));
      
      setIsMaterialModalOpen(false);
    } catch (error) {
      console.error("Error updating materials:", error);
    }
  };
  
  // Calcul des statistiques globales
  const totalTeams = teamsWithLoad.length;
  const totalProjects = teamsWithLoad.reduce((sum, team) => sum + team.projects.length, 0);
  const avgProgress =
    totalTeams > 0
      ? Math.round(
          teamsWithLoad.reduce((sum, team) => sum + calculateTeamProgress(team), 0) / totalTeams
        )
      : 0;
  const totalMaterialsToLoad = teamsWithLoad.reduce(
    (sum, team) => sum + countMaterialsToLoad(team),
    0
  );

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
          <p className="text-muted-foreground mt-1">Gérez la répartition des chantiers et le chargement des matériels</p>
        </div>
        
        {/* Boutons pour changer de vue */}
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 rounded-lg flex items-center ${
              viewMode === 'list' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground'
            }`}
          >
            <Users className="w-4 h-4 mr-2" />
            Vue par équipe
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode('week')}
            className={`px-3 py-2 rounded-lg flex items-center ${
              viewMode === 'week' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground'
            }`}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Vue par semaine
          </motion.button>
          
          {/* Bouton pour afficher l'historique */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsHistoryModalOpen(true)}
            className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg flex items-center"
          >
            <History className="w-4 h-4 mr-2" />
            Historique
          </motion.button>
        </div>
      </div>
      
      {/* Using the extracted LoadingStats component */}
      <LoadingStats 
        totalTeams={totalTeams}
        totalProjects={totalProjects}
        avgProgress={avgProgress}
        totalMaterialsToLoad={totalMaterialsToLoad}
      />
      
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
      
      {viewMode === 'week' ? (
        <div className="mt-4">
          {/* Navigation de semaine */}
          <div className="flex justify-between items-center mb-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={goToPreviousWeek}
              className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg"
            >
              Semaine précédente
            </motion.button>
            
            <h2 className="text-xl font-semibold">{formatWeekRange()}</h2>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={goToNextWeek}
              className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg"
            >
              Semaine suivante
            </motion.button>
          </div>
          
          {/* Vue hebdomadaire */}
          <div className="overflow-x-auto">
            <div className="min-w-[1000px]">
              {/* En-tête des jours */}
              <div className="grid grid-cols-[200px_repeat(5,1fr)] border-b border-border/50">
                <div className="p-4 font-medium">Équipes</div>
                {weekDays.map(day => (
                  <div
                    key={day.toString()}
                    className={`p-4 text-center ${isToday(day) ? 'bg-primary/10' : ''}`}
                  >
                    <div className="text-sm font-medium text-muted-foreground">
                      {format(day, 'EEEE', { locale: fr })}
                    </div>
                    <div className="mt-1 text-lg font-semibold">
                      {format(day, 'd MMMM', { locale: fr })}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Lignes des équipes */}
              {filteredTeams.map(team => (
                <div key={team.id} className="grid grid-cols-[200px_repeat(5,1fr)] border-b border-border/50">
                  {/* Nom de l'équipe */}
                  <div className="p-4 flex items-center">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-2">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{team.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {team.projects.length} projet(s)
                      </div>
                    </div>
                  </div>
                  
                  {/* Projets par jour */}
                  {weekDays.map(day => {
                    const formattedDate = format(day, 'dd/MM/yyyy');
                    const dayProjects = team.projects.filter(project => project.date === formattedDate);
                    
                    return (
                      <div key={day.toString()} className="p-2 border-l border-border/50">
                        {dayProjects.length === 0 ? (
                          <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                            Aucun chargement
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {dayProjects.map(project => {
                              const progress = calculateProgress(project, documentsRemis[project.id] || false);
                              return (
                                <motion.div
                                  key={project.id}
                                  whileHover={{ scale: 1.02 }}
                                  className="bg-card p-2 rounded-lg border border-border/50 shadow-sm cursor-pointer"
                                  onClick={() => handleOpenMaterialModal(project)}
                                >
                                  <div className="flex justify-between items-center mb-1">
                                    <div className="font-medium text-sm truncate">{project.name}</div>
                                    <div className="flex items-center">
                                      {progress === 100 ? (
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                      ) : (
                                        <Package className="w-4 h-4 text-amber-500" />
                                      )}
                                    </div>
                                  </div>
                                  <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${
                                        progress >= 100 ? 'bg-green-500' :
                                        progress >= 75 ? 'bg-blue-500' :
                                        progress >= 50 ? 'bg-amber-500' :
                                        progress >= 25 ? 'bg-orange-500' :
                                        'bg-red-500'
                                      }`}
                                      style={{ width: `${progress}%` }}
                                    />
                                  </div>
                                  <div className="flex justify-between items-center mt-1">
                                    <div className="text-xs text-muted-foreground">
                                      {project.materials?.filter(m => m.status === 'not_loaded').length || 0} à charger
                                    </div>
                                    <div className="text-xs font-medium">{progress}%</div>
                                  </div>
                                  
                                  {/* Option pour les documents remis */}
                                  <div className="flex items-center mt-2 pt-2 border-t border-border/30">
                                    <input 
                                      type="checkbox" 
                                      id={`document-week-${project.id}`}
                                      checked={documentsRemis[project.id] || false}
                                      onChange={(e) => handleDocumentChange(project.id, e.target.checked)}
                                      className="mr-2 h-3 w-3 rounded border-gray-300 text-primary focus:ring-primary"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                    <label 
                                      htmlFor={`document-week-${project.id}`} 
                                      className="text-xs"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      Document remis
                                    </label>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
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
                  {/* Ajouter un bouton pour replier/déplier */}
                  <button 
                    onClick={() => toggleTeamCollapse(team.id)}
                    className="p-1 hover:bg-accent rounded-full transition-colors"
                  >
                    {collapsedTeams[team.id] ? (
                      <ChevronRight className="w-5 h-5 text-primary" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-primary" />
                    )}
                  </button>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{team.name}</h3>
                    <div className="flex items-center mt-1">
                      <Scale className="w-4 h-4 text-muted-foreground mr-1" />
                      <span className="text-sm text-muted-foreground">
                        Progression : {calculateTeamProgress(team)}%
                      </span> 
                      <div className="ml-2 w-16 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            calculateTeamProgress(team) >= 100 ? 'bg-green-500' :
                            calculateTeamProgress(team) >= 75 ? 'bg-blue-500' :
                            calculateTeamProgress(team) >= 50 ? 'bg-amber-500' :
                            calculateTeamProgress(team) >= 25 ? 'bg-orange-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${calculateTeamProgress(team)}%` }}
                        />
                      </div>
                     
                      {/* Afficher le nombre de matériels à charger */}
                      {countMaterialsToLoad(team) > 0 && (
                        <span className="ml-3 text-xs px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full flex items-center">
                          <Package className="w-3 h-3 mr-1" />
                          {countMaterialsToLoad(team)} matériels à charger
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex space-x-2">
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
              {/* Afficher les projets seulement si l'équipe n'est pas repliée */}
              {!collapsedTeams[team.id] && (
                <div className="mt-6 space-y-4">
                  {team.projects.length === 0 ? (
                    <div className="bg-accent/30 rounded-lg p-4 text-center text-muted-foreground">
                      Aucun projet assigné à cette équipe
                    </div>
                  ) : (
                    team.projects.map((project, index) => (
                      <div
                        key={project.id || index}
                        className={`bg-accent/50 rounded-lg p-4 space-y-2 border-2 ${
                          calculateProgress(project, documentsRemis[project.id] || false) === 0 
                            ? 'border-red-500' : 
                          calculateProgress(project, documentsRemis[project.id] || false) >= 100 
                            ? 'border-green-500' : 
                          calculateProgress(project, documentsRemis[project.id] || false) >= 75 
                            ? 'border-blue-500' :
                          calculateProgress(project, documentsRemis[project.id] || false) >= 50 
                            ? 'border-amber-500' :
                          calculateProgress(project, documentsRemis[project.id] || false) >= 25 
                            ? 'border-orange-500' :
                          'border-red-500'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <HardHat className="w-4 h-4 text-primary" />
                            <span className="font-medium">{project.name}</span>
                          </div>
                          {/* Ajout de la barre de progression dynamique à côté du titre */}
                          <div className="flex items-center">
                            <div className="flex items-center mr-2">
                              <span className="text-xs font-medium mr-2">
                                {calculateProgress(project, documentsRemis[project.id] || false)}%
                              </span>
                              <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    calculateProgress(project, documentsRemis[project.id] || false) >= 100 
                                      ? 'bg-green-500' : 
                                    calculateProgress(project, documentsRemis[project.id] || false) >= 75 
                                      ? 'bg-blue-500' :
                                    calculateProgress(project, documentsRemis[project.id] || false) >= 50 
                                      ? 'bg-amber-500' :
                                    calculateProgress(project, documentsRemis[project.id] || false) >= 25 
                                      ? 'bg-orange-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ 
                                    width: `${calculateProgress(project, documentsRemis[project.id] || false)}%` 
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{project.date}</span>
                      </div>
                      {/* Option pour les documents remis */}
                      <div className="flex items-center mt-2">
                        <input 
                          type="checkbox" 
                          id={`document-${project.id}`}
                          checked={documentsRemis[project.id] || false}
                          onChange={(e) => handleDocumentChange(project.id, e.target.checked)}
                          className="mr-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor={`document-${project.id}`} className="text-sm">
                          Document remis
                        </label>
                      </div>
                      {/* Affichage des matériaux et de leur statut */}
                      {project.materials && (
                        <div className="mt-3 pt-3 border-t border-border/50">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium">Matériels à charger</h4>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleOpenMaterialModal(project)}
                              className="text-xs px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-md flex items-center"
                            >
                              <Truck className="w-3 h-3 mr-1" />
                              Gérer
                            </motion.button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {project.materials.map((material) => (
                              <div 
                                key={material.id} 
                                className={`flex flex-col p-2 rounded-md text-xs ${
                                  material.status === 'loaded' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                  'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400'
                                }`}
                              >
                                <div className="flex items-center">
                                  {material.status === 'loaded' ? (
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                  ) : (
                                    <Package className="w-3 h-3 mr-1" />
                                  )}
                                  {material.name}
                                </div>
                                {/* Display comment if it exists */}
                                {material.comments && (
                                  <div className="mt-1 text-xs italic text-muted-foreground border-t border-border/30 pt-1">
                                    "{material.comments}"
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
            {team.currentLoad >= 90 && (
              <div className="mt-4 flex items-center text-orange-500 bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg">
                <AlertTriangle className="w-4 h-4 mr-2" />
                <span className="text-sm">Cette équipe approche de sa capacité maximale</span>
              </div>
            )}
                    </motion.div>
        ))}
      </motion.div>
    )}
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
      {/* Modal pour gérer les matériaux */}
      {isMaterialModalOpen && selectedProject && (
        <MaterialLoadingModal
          isOpen={isMaterialModalOpen}
          onClose={() => setIsMaterialModalOpen(false)}
          project={selectedProject}
          onUpdateMaterials={handleUpdateMaterials}
        />
      )}
      {/* Modal pour l'historique de chargement */}
      {isHistoryModalOpen && (
        <LoadingHistoryModal
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
        />
      )}
    </motion.div>
  );
}