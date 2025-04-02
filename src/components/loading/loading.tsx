import React from 'react';
import { motion } from 'framer-motion';
import { Scale, Users, HardHat, AlertTriangle, Calendar, Search, Filter, MoreVertical } from 'lucide-react';

const teams = [
  {
    id: 1,
    name: "Équipe Installation A",
    capacity: 100,
    currentLoad: 80,
    projects: [
      { name: "Installation Climatisation Bureau A", hours: 24, date: "15/02/2024" },
      { name: "Maintenance Système Ventilation", hours: 16, date: "16/02/2024" }
    ]
  },
  {
    id: 2,
    name: "Équipe Installation B",
    capacity: 100,
    currentLoad: 60,
    projects: [
      { name: "Installation Multi-Split Résidence", hours: 32, date: "15/02/2024" }
    ]
  },
  {
    id: 3,
    name: "Équipe Maintenance",
    capacity: 100,
    currentLoad: 90,
    projects: [
      { name: "Maintenance Préventive Centre Commercial", hours: 24, date: "15/02/2024" },
      { name: "Dépannage Urgent Climatisation", hours: 8, date: "16/02/2024" },
      { name: "Entretien Système Ventilation", hours: 16, date: "17/02/2024" }
    ]
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

export function Loading() {
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
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher une équipe ou un chantier..."
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
        {teams.map((team) => (
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
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                >
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </motion.button>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {team.projects.map((project, index) => (
                <div
                  key={index}
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
              ))}
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
    </motion.div>
  );
}