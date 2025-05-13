import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ChevronDown } from 'lucide-react';

interface ProjectInfoProps {
  type: string;
  startDate: string;
  team: string | { name: string };
  status: string;
  progress: number;
  onStatusChange: (newStatus: string) => void;
  beforeImageUrl?: string;
  afterImageUrl?: string;
}

const statusOptions = [
  { value: 'placer', label: 'Placé', color: 'text-orange-500' },
  { value: 'confirmer', label: 'Confirmé', color: 'text-blue-500' },
  { value: 'charger', label: 'Chargé', color: 'text-violet-500' },
  { value: 'encours', label: 'En cours', color: 'text-yellow-500' },
  { value: 'terminer', label: 'Terminé', color: 'text-green-500' },
  { value: 'annuler', label: 'Annulé', color: 'text-red-500' }
];

const statusProgressMap: { [key: string]: number } = {
  placer: 10,
  confirmer: 25,
  charger: 50,
  encours: 75,
  terminer: 100,
  annuler: 0
};

const getProgressColor = (progress: number) => {
  if (progress <= 10) return 'bg-[#039BE5]';
  if (progress <= 25) return 'bg-[#E67C73]';
  if (progress <= 50) return 'bg-[#3F51B5]';
  if (progress <= 75) return 'bg-[#8E24AA]';
  if (progress < 100) return 'bg-[#33B679]';
  return 'bg-[#D50000]';
};

export function ProjectInfo({
  type,
  startDate,
  team,
  status,
  progress: _progress,
  onStatusChange,
  beforeImageUrl,
  afterImageUrl
}: ProjectInfoProps) {
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onStatusChange(e.target.value);
  };

  const currentStatus = statusOptions.find(opt => opt.value === status);
  const progress = statusProgressMap[status] ?? 0;

  return (
    <motion.div whileHover={{ y: -5 }} className="bg-card p-6 rounded-xl shadow-lg border border-border/50">
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <FileText className="w-5 h-5 mr-2 text-blue-500" />
        Informations du projet
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground">Type</div>
            <div className="font-medium mt-1">{type}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Date de début</div>
            <div className="font-medium mt-1">{startDate}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Équipe assignée</div>
            <div className="font-medium mt-1">
              {typeof team === 'object' ? team.name : team}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Statut</div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`w-3 h-3 rounded-full ${currentStatus?.color.replace('text', 'bg')}`}
              ></span>
              <span className={`text-sm font-medium ${currentStatus?.color}`}>
                {currentStatus?.label}
              </span>
            </div>
            {/* <div className="relative">
              <select
                value={status}
                onChange={handleStatusChange}
                className={`w-full appearance-none rounded-lg border bg-white dark:bg-muted px-3 py-2 pr-10 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium transition-colors duration-200 ${currentStatus?.color}`}
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground" />
            </div> */}
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Progression</div>
            <div className="mt-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressColor(progress)}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* La partie de avant apres images */}
      {/* {(beforeImageUrl || afterImageUrl) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {beforeImageUrl && (
            <div>
              <div className="text-sm text-muted-foreground mb-1">Avant</div>
              <img src={beforeImageUrl} alt="Photo avant" className="w-full h-64 object-cover rounded-lg shadow" />
            </div>
          )}
          {afterImageUrl && (
            <div>
              <div className="text-sm text-muted-foreground mb-1">Après</div>
              <img src={afterImageUrl} alt="Photo après" className="w-full h-64 object-cover rounded-lg shadow" />
            </div>
          )}
        </div>
      )} */}
    </motion.div>
  );
}
