import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Wrench, CheckCircle, AlertTriangle, PieChart, BarChart3 } from 'lucide-react';
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
  maintenanceRecords?: MaintenanceRecord[];
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

export function MaintenanceStats({ maintenanceStats, monthlyStats, maintenanceRecords = [] }: MaintenanceStatsProps) {
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

  // Calculate statistics for pie charts
  const pieChartData = useMemo(() => {
    // Type distribution (preventif vs correctif)
    const typeData = {
      preventif: maintenanceRecords.filter(r => r.type === 'preventif').length,
      correctif: maintenanceRecords.filter(r => r.type === 'correctif').length
    };
    
    // Status distribution
    const statusData = {
      completed: maintenanceRecords.filter(r => r.status === 'completed').length,
      upcoming: maintenanceRecords.filter(r => r.status === 'upcoming').length,
      pending: maintenanceRecords.filter(r => r.status === 'pending').length
    };
    
    // Equipment distribution
    const equipmentData = maintenanceRecords.reduce((acc, record) => {
      acc[record.equipmentName] = (acc[record.equipmentName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return { typeData, statusData, equipmentData };
  }, [maintenanceRecords]);

  // Function to generate pie chart
  const generatePieChart = (data: Record<string, number>, colors: Record<string, string>) => {
    const total = Object.values(data).reduce((sum, val) => sum + val, 0);
    if (total === 0) return null;
    
    let currentAngle = 0;
    const slices = Object.entries(data).map(([key, value]) => {
      const percentage = value / total;
      const startAngle = currentAngle;
      const angle = percentage * 360;
      currentAngle += angle;
      const endAngle = currentAngle;
      
      // Calculate SVG arc path
      const startRad = (startAngle - 90) * Math.PI / 180;
      const endRad = (endAngle - 90) * Math.PI / 180;
      
      const x1 = 50 + 40 * Math.cos(startRad);
      const y1 = 50 + 40 * Math.sin(startRad);
      const x2 = 50 + 40 * Math.cos(endRad);
      const y2 = 50 + 40 * Math.sin(endRad);
      
      const largeArcFlag = angle > 180 ? 1 : 0;
      
      const pathData = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
      
      return {
        key,
        value,
        percentage,
        pathData,
        color: colors[key] || '#ccc'
      };
    });
    
    return slices;
  };

  // Colors for pie charts
  const typeColors = {
    preventif: 'rgb(59, 130, 246)', // blue
    correctif: 'rgb(139, 92, 246)' // purple
  };
  
  const statusColors = {
    completed: 'rgb(34, 197, 94)', // green
    upcoming: 'rgb(249, 115, 22)', // orange
    pending: 'rgb(234, 179, 8)' // yellow
  };
  
  const equipmentColors = {
    'POELE A GRANULE': 'rgb(239, 68, 68)', // red
    'CHAUDIERE': 'rgb(16, 185, 129)', // emerald
    'CLIMATISATION': 'rgb(14, 165, 233)', // sky
    'POMPE A CHALEUR': 'rgb(168, 85, 247)' // purple
  };

  // Generate pie chart data
  const typePieChart = generatePieChart(pieChartData.typeData, typeColors);
  const statusPieChart = generatePieChart(pieChartData.statusData, statusColors);

  return (
    <div className="space-y-6">
      {/* Main stats with curved charts */}
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

      {/* Pie charts section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Type distribution pie chart */}
        <motion.div 
          variants={itemVariants} 
          className="bg-gradient-to-br from-card to-card/80 rounded-2xl p-6 shadow-lg border border-border/50"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Types d'entretien</h3>
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <PieChart className="w-5 h-5 text-primary" />
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-32 h-32 relative">
              {typePieChart && typePieChart.length > 0 ? (
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {typePieChart.map((slice, i) => (
                    <path 
                      key={i} 
                      d={slice.pathData} 
                      fill={slice.color}
                      stroke="#ffffff"
                      strokeWidth="1"
                    />
                  ))}
                  {/* Use transparent fill for the center circle instead of var(--card) */}
                  <circle cx="50" cy="50" r="25" fill="white" />
                </svg>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  Aucune donnée
                </div>
              )}
            </div>
            
            <div className="ml-4 flex-1">
              <ul className="space-y-2">
                {typePieChart?.map((slice, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: slice.color }}></div>
                      <span className="capitalize">{slice.key}</span>
                    </div>
                    <span className="font-medium">{Math.round(slice.percentage * 100)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
        
        {/* Status distribution pie chart */}
        <motion.div 
          variants={itemVariants} 
          className="bg-gradient-to-br from-card to-card/80 rounded-2xl p-6 shadow-lg border border-border/50"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Statut des entretiens</h3>
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-32 h-32 relative">
              {statusPieChart && statusPieChart.length > 0 ? (
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {statusPieChart.map((slice, i) => (
                    <path 
                      key={i} 
                      d={slice.pathData} 
                      fill={slice.color}
                      stroke="#ffffff"
                      strokeWidth="1"
                    />
                  ))}
                  {/* Use transparent fill for the center circle instead of var(--card) */}
                  <circle cx="50" cy="50" r="25" fill="white" />
                </svg>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  Aucune donnée
                </div>
              )}
            </div>
            
            <div className="ml-4 flex-1">
              <ul className="space-y-2">
                {statusPieChart?.map((slice, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: slice.color }}></div>
                      <span className="capitalize">
                        {slice.key === 'completed' ? 'Terminé' : 
                         slice.key === 'upcoming' ? 'À venir' : 'En attente'}
                      </span>
                    </div>
                    <span className="font-medium">{Math.round(slice.percentage * 100)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}