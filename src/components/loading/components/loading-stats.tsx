import React from 'react';
import { motion } from 'framer-motion';
import { Users, HardHat, Scale, Package } from 'lucide-react';

interface LoadingStatsProps {
  totalTeams: number;
  totalProjects: number;
  avgProgress: number;
  totalMaterialsToLoad: number;
}

export function LoadingStats({
  totalTeams,
  totalProjects,
  avgProgress,
  totalMaterialsToLoad
}: LoadingStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-card p-4 rounded-xl border border-border/50 shadow-sm overflow-hidden relative"
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-sm text-muted-foreground">Équipes actives</p>
            <h3 className="text-2xl font-bold mt-1">{totalTeams}</h3>
          </div>
          <div className="p-3 bg-blue-100/20 rounded-lg text-blue-500">
            <Users className="w-6 h-6" />
          </div>
        </div>
        {/* Mini chart */}
        <div className="h-10 w-full mt-2">
          <div className="flex items-end justify-between h-full gap-1">
            {[4, 6, 5, 7, 8, totalTeams].map((value, i) => (
              <div 
                key={i} 
                className="bg-blue-500/30 rounded-sm w-full"
                style={{ height: `${(value / 10) * 100}%` }}
              ></div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        whileHover={{ y: -5 }}
        className="bg-card p-4 rounded-xl border border-border/50 shadow-sm overflow-hidden relative"
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-sm text-muted-foreground">Projets en cours</p>
            <h3 className="text-2xl font-bold mt-1">{totalProjects}</h3>
          </div>
          <div className="p-3 bg-green-100/20 rounded-lg text-green-500">
            <HardHat className="w-6 h-6" />
          </div>
        </div>
        {/* Mini chart */}
        <div className="h-10 w-full mt-2">
          <div className="flex items-end justify-between h-full gap-1">
            {[12, 15, 18, 14, 16, totalProjects].map((value, i) => (
              <div 
                key={i} 
                className="bg-green-500/30 rounded-sm w-full"
                style={{ height: `${(value / 20) * 100}%` }}
              ></div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        whileHover={{ y: -5 }}
        className="bg-card p-4 rounded-xl border border-border/50 shadow-sm overflow-hidden relative"
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-sm text-muted-foreground">Progression moyenne</p>
            <h3 className="text-2xl font-bold mt-1">{avgProgress}%</h3>
          </div>
          <div className="p-3 bg-violet-100/20 rounded-lg text-violet-500">
            <Scale className="w-6 h-6" />
          </div>
        </div>
        {/* Mini chart - line chart style with full width */}
        <div className="h-10 w-full mt-2 relative">
          <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
            <path 
              d="M0,30 L0,20 C10,15 20,25 30,20 C40,15 50,10 60,15 C70,20 80,10 90,5 L100,5" 
              fill="rgba(124, 58, 237, 0.2)" 
            />
            <path 
              d="M0,20 C10,15 20,25 30,20 C40,15 50,10 60,15 C70,20 80,10 90,5 L100,5" 
              fill="none" 
              stroke="rgb(124, 58, 237)" 
              strokeWidth="2" 
            />
          </svg>
        </div>
      </motion.div>

      <motion.div
        whileHover={{ y: -5 }}
        className="bg-card p-4 rounded-xl border border-border/50 shadow-sm overflow-hidden relative"
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-sm text-muted-foreground">Matériels à charger</p>
            <h3 className="text-2xl font-bold mt-1">{totalMaterialsToLoad}</h3>
          </div>
          <div className="p-3 bg-amber-100/20 rounded-lg text-amber-500">
            <Package className="w-6 h-6" />
          </div>
        </div>
        {/* Circular progress chart */}
        <div className="h-10 w-full mt-2 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-amber-100/30 relative">
            <svg className="w-10 h-10" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" stroke="#f0f0f0" strokeWidth="3"></circle>
              <circle 
                cx="18" 
                cy="18" 
                r="16" 
                fill="none" 
                stroke="#f59e0b" 
                strokeWidth="3" 
                strokeDasharray={`${Math.min(totalMaterialsToLoad, 100)} 100`} 
                strokeLinecap="round" 
                transform="rotate(-90 18 18)"
              ></circle>
            </svg>
          </div>
          <div className="flex-1 ml-3">
            <div className="h-2 bg-amber-100/30 rounded-full">
              <div 
                className="h-2 bg-amber-500 rounded-full" 
                style={{ width: `${Math.min(totalMaterialsToLoad, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}