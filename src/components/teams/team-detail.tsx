import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Power } from 'lucide-react';
import { TeamHeader } from './components/team-header';
import { TeamStats } from './components/team-stats';
import { TeamPerformance } from './components/team-performance';
import { TeamMembers } from './components/team-members';
import { CompletedProjects } from './components/completed-projects';
import { SAVDetails } from './components/sav-details';
import { VehicleTracking } from './vehicle-tracking';
import { useScheduling } from '../../lib/scheduling/scheduling-context';

const defaultVehicleData = {
  model: "Non assigné",
  registration: "Non assigné",
  year: new Date().getFullYear(),
  fuelType: "Non assigné",
  lastMaintenance: "Non assigné",
  nextMaintenance: "Non assigné",
  condition: "Non assigné",
  currentMileage: 0,
  monthlyAverage: 0,
  lastReading: "Non assigné",
  fuelConsumption: 0,
  lastRefuel: {
    date: "Non assigné",
    amount: 0
  },
  monthlyCost: 0
};



export function TeamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { teams, toggleTeamActive } = useScheduling();

  const team = teams.find(t => t.id === id);

  const [localTeam, setLocalTeam] = useState<any>(team);

  const handleNameChange = (newName: string) => {
    setLocalTeam((prev: any) => ({ ...prev, name: newName }));
  };

  const handleColorChange = (newColor: string) => {
    setLocalTeam((prev: any) => ({ ...prev, color: newColor }));
  };

  if (!team) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Équipe non trouvée</h2>
          <button
            onClick={() => navigate('/teams')}
            className="text-primary hover:underline"
          >
            Retour à la liste des équipes
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/teams')}
            className="p-2 rounded-lg hover:bg-accent"
          >
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
          <TeamHeader
            teamId={team.id}
            teamName={localTeam?.name || team.name}
            teamColor={localTeam?.color || team.color}
            onNameChange={handleNameChange}
            onColorChange={handleColorChange}
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => id && toggleTeamActive(id)}
          className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
            team.isActive
              ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'
              : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50'
          }`}
        >
          <Power className="w-4 h-4" />
          <span>{team.isActive ? 'Désactiver' : 'Activer'}</span>
        </motion.button>
      </div>

      <TeamStats />
      <TeamPerformance />
      <TeamMembers teamId={team.id} />
      <CompletedProjects />
      <SAVDetails />
      <VehicleTracking vehicleData={defaultVehicleData} />
    </motion.div>
  );
}
