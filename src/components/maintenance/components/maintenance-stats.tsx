import React from 'react';
import { motion } from 'framer-motion';
import { Wrench, CheckCircle, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MaintenanceRecord } from '../maintenance';

interface MaintenanceStatsProps {
  maintenanceStats: {
    total: number;
    completed: number;
    pending: number;
    nextDue: string | null;
  };
  monthlyStats: {
    total: number[];
    completed: number[];
    pending: number[];
  };
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

export function MaintenanceStats({ maintenanceStats, monthlyStats }: MaintenanceStatsProps) {
  // Function to generate the SVG path for charts with curved lines
  const generateChartPath = (data: number[], type: 'fill' | 'line') => {
    if (!data.length) return '';
    
    const max = Math.max(...data, 1);
    const points = data.map((val, i) => ({
      x: (i * (100 / (data.length - 1))),
      y: 30 - ((val / max) * 20)
    }));
    
    // Create a smooth curved line using bezier curves
    let path = '';
    
    if (type === 'line') {
      path = `M${points[0].x},${points[0].y}`;
      
      for (let i = 0; i < points.length - 1; i++) {
        const x1 = points[i].x;
        const y1 = points[i].y;
        const x2 = points[i + 1].x;
        const y2 = points[i + 1].y;
        
        // Control points for the curve
        const cpx1 = x1 + (x2 - x1) / 2;
        const cpy1 = y1;
        const cpx2 = x1 + (x2 - x1) / 2;
        const cpy2 = y2;
        
        path += ` C${cpx1},${cpy1} ${cpx2},${cpy2} ${x2},${y2}`;
      }
      
      return path;
    } else {
      // For fill, we need to create a closed path
      path = `M0,30 L0,${points[0].y} L${points[0].x},${points[0].y}`;
      
      for (let i = 0; i < points.length - 1; i++) {
        const x1 = points[i].x;
        const y1 = points[i].y;
        const x2 = points[i + 1].x;
        const y2 = points[i + 1].y;
        
        // Control points for the curve
        const cpx1 = x1 + (x2 - x1) / 2;
        const cpy1 = y1;
        const cpx2 = x1 + (x2 - x1) / 2;
        const cpy2 = y2;
        
        path += ` C${cpx1},${cpy1} ${cpx2},${cpy2} ${x2},${y2}`;
      }
      
      path += ` L100,${points[points.length-1].y} L100,30 Z`;
      return path;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <motion.div 
        variants={itemVariants} 
        className="bg-gradient-to-br from-card to-card/80 rounded-2xl p-6 shadow-lg border border-border/50 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-primary/5 rounded-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Total</div>
              <div className="text-3xl font-bold mt-1">{maintenanceStats.total}</div>
            </div>
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
              <Wrench className="w-7 h-7 text-primary" />
            </div>
          </div>
          <div className="h-16 w-full mt-2">
            <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path 
                d={generateChartPath(monthlyStats.total, 'fill')}
                fill="rgba(124, 58, 237, 0.2)" 
              />
              <path 
                d={generateChartPath(monthlyStats.total, 'line')}
                fill="none" 
                stroke="rgb(124, 58, 237)" 
                strokeWidth="2" 
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </motion.div>

      <motion.div 
        variants={itemVariants} 
        className="bg-gradient-to-br from-card to-card/80 rounded-2xl p-6 shadow-lg border border-border/50 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-green-500/5 rounded-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Effectuées</div>
              <div className="text-3xl font-bold mt-1">{maintenanceStats.completed}</div>
            </div>
            <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-green-500" />
            </div>
          </div>
          <div className="h-16 w-full mt-2">
            <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path 
                d={generateChartPath(monthlyStats.completed, 'fill')}
                fill="rgba(34, 197, 94, 0.2)" 
              />
              <path 
                d={generateChartPath(monthlyStats.completed, 'line')}
                fill="none" 
                stroke="rgb(34, 197, 94)" 
                strokeWidth="2" 
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </motion.div>

      <motion.div 
        variants={itemVariants} 
        className="bg-gradient-to-br from-card to-card/80 rounded-2xl p-6 shadow-lg border border-border/50 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-orange-500/5 rounded-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">En attente</div>
              <div className="text-3xl font-bold mt-1">{maintenanceStats.pending}</div>
            </div>
            <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-orange-500" />
            </div>
          </div>
          <div className="h-16 w-full mt-2">
            <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path 
                d={generateChartPath(monthlyStats.pending, 'fill')}
                fill="rgba(249, 115, 22, 0.2)" 
              />
              <path 
                d={generateChartPath(monthlyStats.pending, 'line')}
                fill="none" 
                stroke="rgb(249, 115, 22)" 
                strokeWidth="2" 
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </motion.div>
    </div>
  );
}