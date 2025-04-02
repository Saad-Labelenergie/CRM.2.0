import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Calendar, 
  CheckCircle, 
  AlertTriangle,
  Search,
  Filter,
  ExternalLink,
  Building2,
  BarChart
} from 'lucide-react';

// Données des installations totales (pour le calcul du ratio)
const installations = [
  { name: "Installation Climatisation Bureau A", date: "15/02/2024" },
  { name: "Installation Climatisation Restaurant", date: "01/02/2024" },
  { name: "Installation Multi-Split", date: "15/01/2024" },
  { name: "Installation Climatisation Open Space", date: "10/01/2024" },
  { name: "Installation Système Ventilation", date: "05/01/2024" },
  { name: "Installation Climatisation Salle Serveur", date: "01/01/2024" },
];

const savData = [
  {
    id: 1,
    projectName: "Installation Climatisation Bureau A",
    client: "Entreprise ABC",
    issueDate: "20/02/2024",
    projectEndDate: "15/02/2024",
    status: "en_cours",
    description: "Problème de régulation de température",
    priority: "haute",
    type: "technique"
  },
  {
    id: 2,
    projectName: "Maintenance Système Ventilation",
    client: "Centre Commercial XYZ",
    issueDate: "12/02/2024",
    projectEndDate: "10/02/2024",
    status: "resolu",
    description: "Bruit anormal ventilation",
    priority: "moyenne",
    type: "bruit"
  },
  {
    id: 3,
    projectName: "Installation Climatisation Restaurant",
    client: "Restaurant Le Gourmet",
    issueDate: "05/02/2024",
    projectEndDate: "01/02/2024",
    status: "resolu",
    description: "Fuite condensat",
    priority: "basse",
    type: "fuite"
  },
  {
    id: 4,
    projectName: "Remplacement Système Ventilation",
    client: "Hôtel Luxe",
    issueDate: "28/01/2024",
    projectEndDate: "25/01/2024",
    status: "en_cours",
    description: "Performance insuffisante",
    priority: "haute",
    type: "performance"
  }
];

export function SAVDetails() {
  const [showAll, setShowAll] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  // Calcul des statistiques
  const totalSAV = savData.length;
  const resolvedSAV = savData.filter(sav => sav.status === 'resolu').length;
  const resolutionRate = (resolvedSAV / totalSAV * 100).toFixed(1);
  const currentSAV = savData.filter(sav => sav.status === 'en_cours').length;

  // Calcul du pourcentage de SAV par rapport aux installations
  const totalInstallations = installations.length;
  const savPercentage = ((totalSAV / totalInstallations) * 100).toFixed(1);

  // Calcul du temps moyen entre fin de chantier et ouverture SAV
  const averageResponseTime = savData.reduce((acc, sav) => {
    const endDate = new Date(sav.projectEndDate.split('/').reverse().join('-'));
    const issueDate = new Date(sav.issueDate.split('/').reverse().join('-'));
    return acc + (issueDate.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24);
  }, 0) / totalSAV;

  const filteredSAV = savData.filter(sav => {
    const matchesSearch = 
      sav.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sav.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sav.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !selectedStatus || sav.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const displayedSAV = showAll ? filteredSAV : filteredSAV.slice(0, 3);

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 text-yellow-500" />
          SAV
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
            value={selectedStatus || ''}
            onChange={(e) => setSelectedStatus(e.target.value || null)}
            className="px-3 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Tous les statuts</option>
            <option value="en_cours">En cours</option>
            <option value="resolu">Résolu</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-accent/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total SAV</span>
            <span className="text-xl font-bold">{totalSAV}</span>
          </div>
          <div className="mt-2 h-2 bg-background rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${resolutionRate}%` }}
            />
          </div>
          <div className="mt-1 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Taux de résolution</span>
            <span className="font-medium text-green-500">{resolutionRate}%</span>
          </div>
        </div>

        <div className="bg-accent/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Ratio SAV/Installations</span>
            <span className="text-xl font-bold">{savPercentage}%</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Installations totales</span>
            <span className="font-medium">{totalInstallations}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">SAV générés</span>
            <span className="font-medium">{totalSAV}</span>
          </div>
        </div>

        <div className="bg-accent/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Temps moyen avant SAV</span>
            <span className="text-xl font-bold">{averageResponseTime.toFixed(1)} jours</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">SAV en cours</span>
            <span className="font-medium text-orange-500">{currentSAV}</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        <div className="space-y-4">
          {displayedSAV.map((sav) => (
            <motion.div
              key={sav.id}
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
                    {sav.status === 'resolu' ? (
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-orange-500 mr-2" />
                    )}
                    {sav.projectName}
                  </h4>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Building2 className="w-4 h-4 mr-1" />
                    <span>{sav.client}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    sav.status === 'resolu' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                  }`}>
                    {sav.status === 'resolu' ? 'Résolu' : 'En cours'}
                  </span>
                  <div className="mt-1 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {sav.issueDate}
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm text-muted-foreground">{sav.description}</p>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>Fin des travaux : {sav.projectEndDate}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    sav.priority === 'haute' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    sav.priority === 'moyenne' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    Priorité {sav.priority}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {filteredSAV.length > 3 && (
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

      {filteredSAV.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Aucun SAV ne correspond à votre recherche
        </div>
      )}
    </motion.div>
  );
}