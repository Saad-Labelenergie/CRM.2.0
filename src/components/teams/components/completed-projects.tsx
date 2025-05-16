import React, { useState } from 'react';
import {
  Building2, CheckCircle, Star, Clock,
  ChevronDown, ChevronUp, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  collection, query, where, getDocs, updateDoc, doc, arrayUnion, arrayRemove
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useFirebase } from '../../../lib/hooks/useFirebase';

interface Project {
  id: string;
  name: string;
  client: any;
  date?: string;
  satisfaction?: number;
  duration?: string;
  type: string;
  team?: string | null;
}

interface Team {
  id: string;
  name: string;
}

interface CompletedProjectsProps {
  teamID: string;
}

export function CompletedProjects({ teamID }: CompletedProjectsProps) {
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [projectToRemove, setProjectToRemove] = useState<Project | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);


  const { data: teams } = useFirebase<Team>('teams');
  const teamName = teams?.find(t => t.id === teamID)?.name;

  const { data: projects, loading } = useFirebase<Project>('projects', {
    conditions: teamName ? [{ field: 'team', operator: '==', value: teamName }] : [],
    orderByField: 'startDate',
    key: refreshKey
  });
  const fetchAvailableProjects = async () => {
    try {
      const q = query(collection(db, 'projects'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];

      setAvailableProjects(data);
    } catch (error) {
      console.error('Erreur récupération chantiers :', error);
    }
  };

  const refreshProjects = () => setRefreshKey((prev) => prev + 1);

  const handleAddProjectToTeam = async (project: Project) => {
    const team = teams?.find(t => t.id === teamID);


    try {
      await updateDoc(doc(db, 'projects', project.id), {
        teamId: teamID,
        teamName: teamName,
        updatedAt: new Date()
      });

      await updateDoc(doc(db, 'teams', teamID), {
        projects: arrayUnion(project.id)
      });

      setIsAddModalOpen(false);
      refreshProjects();
    } catch (error) {
      console.error('Erreur assignation chantier :', error);
    }
  };

  const handleRemoveProjectFromTeam = async (project: Project) => {
    try {
      await updateDoc(doc(db, 'projects', project.id), {
        teamId: null,
        teamName: null,
        updatedAt: new Date()
      });

      await updateDoc(doc(db, 'teams', teamID), {
        projects: arrayRemove(project.id)
      });

      setProjectToRemove(null);
      refreshProjects();
    } catch (error) {
      console.error('Erreur dissociation chantier :', error);
    }
  };

  const filteredProjects = projects.filter(project => {
    const search = searchTerm.toLowerCase();
    const clientMatch = typeof project.client === 'object'
      ? project.client?.name?.toLowerCase()?.includes(search)
      : project.client?.toLowerCase()?.includes(search);

    return (
      project.name?.toLowerCase().includes(search) ||
      clientMatch
    ) && (!selectedType || project.type === selectedType);
  });

  const displayedProjects = showAll ? filteredProjects : filteredProjects.slice(0, 3);
  const projectTypes = Array.from(new Set(projects.map(p => p.type)));


  return (
    <motion.div className="bg-card p-6 rounded-xl shadow-lg border border-border/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center">
          <Building2 className="w-5 h-5 mr-2 text-orange-500" />
          Chantiers de l’équipe
        </h3>
        {/* <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            fetchAvailableProjects();
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center"
        >
          <Building2 className="w-4 h-4 mr-2" />
          Ajouter un chantier
        </motion.button> */}
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 bg-background border rounded-lg text-sm w-[200px]"
          />
        </div>
        <select
          value={selectedType || ''}
          onChange={(e) => setSelectedType(e.target.value || null)}
          className="px-3 py-2 bg-background border rounded-lg text-sm"
        >
          <option value="">Tous les types</option>
          {projectTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <AnimatePresence mode="popLayout">
        <div className="space-y-4">
          {loading ? (
            <p className="text-muted-foreground">Chargement des projets...</p>
          ) : displayedProjects.length === 0 ? (
            <p className="text-muted-foreground">Aucun projet lié à cette équipe</p>
          ) : (
            displayedProjects.map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-accent/50 rounded-xl p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      {project.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {typeof project.client === 'object' ? project.client?.name : project.client}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                      <span className="font-medium">{project.satisfaction ?? '-'}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{project.date ?? '-'}</p>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-1" />
                    Durée : {project.duration ?? '-'}
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700">
                    {project.type}
                  </span>
                </div>

                <div className="flex justify-end mt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setProjectToRemove(project)}
                    className="px-3 py-1 text-sm text-red-600 border border-red-500 rounded-lg hover:bg-red-50"
                  >
                    Dissocier
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </AnimatePresence>

      {filteredProjects.length > 3 && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAll(!showAll)}
          className="mt-4 w-full px-4 py-2 bg-accent rounded-lg"
        >
          {showAll ? <>Voir moins <ChevronUp className="w-4 h-4 ml-2" /></> : <>Voir plus <ChevronDown className="w-4 h-4 ml-2" /></>}
        </motion.button>
      )}

      {isAddModalOpen && (
        <motion.div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card rounded-xl p-6 w-full max-w-lg mx-4 shadow-lg border"
          >
            <h2 className="text-lg font-semibold mb-4">Ajouter un chantier</h2>
            {availableProjects.length === 0 ? (
              <p className="text-muted-foreground">Aucun chantier disponible</p>
            ) : (
              <ul className="space-y-3 max-h-[300px] overflow-y-auto">
                {availableProjects
                .filter(p => p.team !== teamID)
                .map((project) => (
                  <li
                    key={project.id}
                    className="p-3 rounded-md border hover:bg-accent cursor-pointer flex justify-between items-center"
                    onClick={() => handleAddProjectToTeam(project)}
                  >
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {typeof project.client === 'object' ? project.client?.name : project.client}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">{project.type}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-md bg-accent hover:bg-accent/80"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {projectToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-card rounded-xl p-6 w-full max-w-md shadow-lg border"
          >
            <h2 className="text-lg font-semibold mb-4">Confirmer la dissociation</h2>
            <p className="text-muted-foreground mb-6">
              Êtes-vous sûr de vouloir retirer <strong>{projectToRemove.name}</strong> de l'équipe ?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setProjectToRemove(null)}
                className="px-4 py-2 rounded-md border border-muted text-muted-foreground hover:bg-muted"
              >
                Annuler
              </button>
              <button
                onClick={() => handleRemoveProjectFromTeam(projectToRemove)}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
              >
                Confirmer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
