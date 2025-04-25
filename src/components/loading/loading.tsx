import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scale, Users, HardHat, AlertTriangle, Calendar, Search, Filter, MoreVertical, Plus, CheckCircle, Truck, Package } from 'lucide-react';
import { useScheduling } from '../../lib/scheduling/scheduling-context';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { AssignProjectModal } from './components/assign-project-modal';
import { MaterialLoadingModal } from './components/material-loading-modal';

// Types pour les projets et équipes
interface Project {
  id: string;
  name: string;
  hours: number;
  date: string;
  teamId?: string;
  materials?: Material[];
  projectId?: string; // Add this property
}

interface Material {
  id: number;
  name: string;
  status: 'not_loaded' | 'loaded' | 'installed' | 'not_installed';
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
  const { teams, appointments, projects, updateProjectMaterials } = useScheduling();
  const [searchTerm, setSearchTerm] = useState('');
  const [teamsWithLoad, setTeamsWithLoad] = useState<TeamWithLoad[]>([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamWithLoad | null>(null);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [documentsRemis, setDocumentsRemis] = useState<Record<string, boolean>>({});

  // Fonction pour gérer le changement d'état du document remis
  const handleDocumentChange = (projectId: string, checked: boolean) => {
    setDocumentsRemis(prev => ({
      ...prev,
      [projectId]: checked
    }));
  };

  // Fonction pour calculer le pourcentage de progression
  const calculateProgress = (project: Project, isDocumentRemis: boolean) => {
    if (!project.materials || project.materials.length === 0) return 0;
    
    // Calculer le pourcentage des matériels chargés
    const loadedMaterials = project.materials.filter(m => m.status === 'loaded').length;
    const totalMaterials = project.materials.length;
    
    // Si le document n'est pas remis, la progression maximale est de 90%
    const materialsProgress = (loadedMaterials / totalMaterials) * (isDocumentRemis ? 100 : 90);
    
    return Math.round(materialsProgress);
  };

  // Vérifier si le projet est complet (tous les matériels chargés et document remis)
  const isProjectComplete = (project: Project, isDocumentRemis: boolean) => {
    if (!project.materials || project.materials.length === 0) return false;
    
    const allMaterialsLoaded = project.materials.every(m => m.status === 'loaded');
    return allMaterialsLoaded && isDocumentRemis;
  };

  // Calculer la charge des équipes en fonction des rendez-vous
  useEffect(() => {
    if (teams.length > 0 && appointments.length > 0 && projects.length > 0) {
      const activeTeams = teams.filter(team => team.isActive);
      
      const teamsWithProjects = activeTeams.map(team => {
        // Trouver tous les rendez-vous assignés à cette équipe
        const teamAppointments = appointments.filter(
          app => app.team === team.name && app.status === 'attribue'
        );
        
        // Convertir les rendez-vous en projets avec leurs matériaux
        const teamProjects = teamAppointments.map(app => {
          // Trouver le projet correspondant à ce rendez-vous
          const relatedProject = projects.find(p => 
            p.name === app.title && 
            p.team === team.name && 
            p.startDate === app.date
          );
          
          return {
            id: app.id,
            name: app.title,
            hours: app.duration === '1h' ? 1 : 
                   app.duration === '2h' ? 2 : 
                   app.duration === '4h' ? 4 : 8, // Estimation basée sur la durée
            date: format(new Date(app.date), 'dd/MM/yyyy'),
            teamId: team.id,
            // Ajouter les matériaux du projet s'ils existent
            materials: relatedProject?.materials || [
              // Matériaux par défaut si aucun n'est défini
              { id: 1, name: "Unité intérieure", status: "not_loaded" },
              { id: 2, name: "Unité extérieure", status: "not_loaded" },
              { id: 3, name: "Tuyauterie", status: "not_loaded" },
              { id: 4, name: "Supports", status: "not_loaded" }
            ],
            projectId: relatedProject?.id // Stocker l'ID du projet pour les mises à jour
          };
        });
        
        // Calculer la charge actuelle
        const totalHours = teamProjects.reduce((sum, project) => sum + project.hours, 0);
        const currentLoad = Math.min(Math.round((totalHours / 40) * 100), 100); // 40h = capacité hebdomadaire
        
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
  }, [teams, appointments, projects]);

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

  const handleOpenMaterialModal = (project: Project) => {
    setSelectedProject(project);
    setIsMaterialModalOpen(true);
  };

  const handleUpdateMaterials = async (projectId: string, materials: Material[]) => {
    try {
      console.log("Updating materials for project:", projectId, materials);
      
      // Conserver le statut 'loaded' ou 'not_loaded' pour l'affichage local
      const displayMaterials = [...materials];
      
      // Convert materials to the expected format for the backend
      // Map 'loaded' to 'installed' and 'not_loaded' to 'not_installed'
      const formattedMaterials = materials.map(material => {
        return {
          id: material.id,
          name: material.name,
          // Convert status to match the expected type
          status: material.status === 'loaded' ? 'installed' as const : 
                 material.status === 'not_loaded' ? 'not_installed' as const :
                 material.status // Keep as is if already 'installed' or 'not_installed'
        };
      });
      
      // Mettre à jour les matériaux du projet dans Firebase ou votre backend
      await updateProjectMaterials(projectId, formattedMaterials);
      
      // Mettre à jour l'état local avec les matériaux originaux (avec loaded/not_loaded)
      setTeamsWithLoad(prevTeams => {
        return prevTeams.map(team => ({
          ...team,
          projects: team.projects.map(project => {
            if (project.projectId === projectId || project.id === projectId) {
              console.log("Updating local project materials:", displayMaterials);
              return { ...project, materials: displayMaterials };
            }
            return project;
          })
        }));
      });
      
      setIsMaterialModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour des matériaux:', error);
    }
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
          <p className="text-muted-foreground mt-1">Gérez la répartition des chantiers et le chargement des matériels</p>
        </div>
        {/* <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAssignModalOpen(true)}
          className="flex items-center px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Assigner un Projet
        </motion.button> */}
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
                  {/* Bouton d'assignation de projet supprimé */}
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
                      {/* Suppression de l'affichage des heures */}
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
                              className={`flex items-center p-2 rounded-md text-xs ${
                                material.status === 'loaded' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400'
                              }`}
                            >
                              {material.status === 'loaded' ? (
                                <CheckCircle className="w-3 h-3 mr-1" />
                              ) : (
                                <Package className="w-3 h-3 mr-1" />
                              )}
                              {material.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
            {/* Barre d'avancement dynamique */}
                        <div className="mt-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progression</span>
                            {calculateProgress(project, documentsRemis[project.id] || false)}%
                          </div>
                          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                isProjectComplete(project, documentsRemis[project.id] || false) 
                                  ? 'bg-green-500' 
                                  : 'bg-blue-500'
                              }`}
                              style={{ 
                                width: `${calculateProgress(project, documentsRemis[project.id] || false)}%` 
                              }}
                            />
                          </div>
                        </div>
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

      {/* Modal pour gérer les matériaux */}
      {isMaterialModalOpen && selectedProject && (
        <MaterialLoadingModal
          isOpen={isMaterialModalOpen}
          onClose={() => setIsMaterialModalOpen(false)}
          project={selectedProject}
          onUpdateMaterials={handleUpdateMaterials}
        />
      )}
    </motion.div>
  );
}
