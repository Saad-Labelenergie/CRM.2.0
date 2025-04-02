import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, CheckCircle, Star, Clock, ChevronDown, ChevronUp, Search, Filter } from 'lucide-react';

const allProjects = [
  { 
    name: "Installation Climatisation Bureau A", 
    date: "15/02/2024", 
    status: "completed",
    client: "Entreprise ABC",
    duration: "3 jours",
    satisfaction: 5,
    type: "Installation"
  },
  { 
    name: "Maintenance Système Ventilation", 
    date: "10/02/2024", 
    status: "completed",
    client: "Centre Commercial XYZ",
    duration: "1 jour",
    satisfaction: 4.8,
    type: "Maintenance"
  },
  { 
    name: "Réparation Urgente Centre Commercial", 
    date: "05/02/2024", 
    status: "completed",
    client: "Galerie Marchande",
    duration: "4 heures",
    satisfaction: 4.9,
    type: "Urgence"
  },
  { 
    name: "Installation Climatisation Restaurant", 
    date: "01/02/2024", 
    status: "completed",
    client: "Restaurant Le Gourmet",
    duration: "2 jours",
    satisfaction: 4.7,
    type: "Installation"
  },
  { 
    name: "Maintenance Préventive Bureaux", 
    date: "28/01/2024", 
    status: "completed",
    client: "Société DEF",
    duration: "1 jour",
    satisfaction: 4.6,
    type: "Maintenance"
  },
  { 
    name: "Remplacement Système Ventilation", 
    date: "25/01/2024", 
    status: "completed",
    client: "Hôtel Luxe",
    duration: "4 jours",
    satisfaction: 4.9,
    type: "Installation"
  },
  { 
    name: "Dépannage Climatisation", 
    date: "20/01/2024", 
    status: "completed",
    client: "Clinique Santé",
    duration: "3 heures",
    satisfaction: 4.8,
    type: "Urgence"
  },
  { 
    name: "Installation Multi-Split", 
    date: "15/01/2024", 
    status: "completed",
    client: "Résidence Les Pins",
    duration: "5 jours",
    satisfaction: 5,
    type: "Installation"
  }
];

export function CompletedProjects() {
  const [showAll, setShowAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const filteredProjects = allProjects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || project.type === selectedType;
    return matchesSearch && matchesType;
  });

  const displayedProjects = showAll ? filteredProjects : filteredProjects.slice(0, 3);
  const projectTypes = Array.from(new Set(allProjects.map(p => p.type)));

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center">
          <Building2 className="w-5 h-5 mr-2 text-orange-500" />
          Chantiers
        </h3>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary w-[200px]"
            />
          </div>
          <select
            value={selectedType || ''}
            onChange={(e) => setSelectedType(e.target.value || null)}
            className="px-3 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Tous les types</option>
            {projectTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        <div className="space-y-4">
          {displayedProjects.map((project, index) => (
            <motion.div
              key={project.name + index}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-accent/50 rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="font-medium flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {project.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">{project.client}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                    <span className="font-medium">{project.satisfaction}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{project.date}</p>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>Durée : {project.duration}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  project.type === 'Installation' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                  project.type === 'Maintenance' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                }`}>
                  {project.type}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {filteredProjects.length > 3 && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAll(!showAll)}
          className="mt-4 w-full px-4 py-2 bg-accent hover:bg-accent/80 rounded-lg flex items-center justify-center text-sm font-medium transition-colors"
        >
          {showAll ? (
            <>
              Voir moins
              <ChevronUp className="w-4 h-4 ml-2" />
            </>
          ) : (
            <>
              Voir plus
              <ChevronDown className="w-4 h-4 ml-2" />
            </>
          )}
        </motion.button>
      )}

      {filteredProjects.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Aucun chantier ne correspond à votre recherche
        </div>
      )}
    </motion.div>
  );
}