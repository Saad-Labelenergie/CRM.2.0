import React from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

interface ProjectInfoProps {
  type: string;
  startDate: string;
  team: string | { name: string };
  status: string;
  progress: number;
}

export function ProjectInfo({ type, startDate, team, status, progress }: ProjectInfoProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
    >
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
</div>          </div>
        </div>
        <div className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground">Statut</div>
            <div className="mt-1">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm font-medium">
                {status}
              </span>
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Progression</div>
            <div className="mt-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}