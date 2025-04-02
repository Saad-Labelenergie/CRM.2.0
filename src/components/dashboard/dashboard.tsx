import React from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Users,
  Briefcase,
  Clock,
  AlertCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';

const data = [
  { name: 'Jan', projects: 4, teams: 3 },
  { name: 'Feb', projects: 6, teams: 4 },
  { name: 'Mar', projects: 8, teams: 5 },
  { name: 'Apr', projects: 7, teams: 5 },
  { name: 'May', projects: 9, teams: 6 },
];

const stats = [
  {
    name: 'Équipes Actives',
    value: '12',
    icon: Users,
    change: '+2',
    changeType: 'increase',
    color: 'bg-blue-500/10 text-blue-500'
  },
  {
    name: 'Projets en Cours',
    value: '24',
    icon: Briefcase,
    change: '+5',
    changeType: 'increase',
    color: 'bg-green-500/10 text-green-500'
  },
  {
    name: 'Tâches en Attente',
    value: '38',
    icon: Clock,
    change: '-3',
    changeType: 'decrease',
    color: 'bg-orange-500/10 text-orange-500'
  },
  {
    name: 'Problèmes Ouverts',
    value: '15',
    icon: AlertCircle,
    change: '+2',
    changeType: 'increase',
    color: 'bg-red-500/10 text-red-500'
  },
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

export function Dashboard() {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            variants={itemVariants}
            className="bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-border/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                <h3 className="text-3xl font-bold mt-2 tracking-tight">{stat.value}</h3>
              </div>
              <div className={cn("p-3 rounded-xl", stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className={cn(
                "text-sm font-medium flex items-center",
                stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              )}>
                {stat.change}
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: stat.changeType === 'increase' ? 45 : -45 }}
                  className="ml-1"
                >
                  ―
                </motion.div>
              </span>
              <span className="text-sm text-muted-foreground ml-1.5">depuis le mois dernier</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          variants={itemVariants}
          className="bg-card rounded-xl p-6 shadow-lg border border-border/50"
        >
          <h3 className="text-xl font-semibold mb-6">Croissance des Projets & Équipes</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis 
                  dataKey="name" 
                  stroke="#6B7280" 
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#6B7280" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="projects" 
                  stroke="#3B82F6" 
                  strokeWidth={2.5}
                  dot={{ fill: '#3B82F6', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#3B82F6' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="teams" 
                  stroke="#10B981" 
                  strokeWidth={2.5}
                  dot={{ fill: '#10B981', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#10B981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-card rounded-xl p-6 shadow-lg border border-border/50"
        >
          <h3 className="text-xl font-semibold mb-6">Activité Récente</h3>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((_, i) => (
              <motion.div 
                key={i}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center space-x-4 group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors duration-300">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium group-hover:text-primary transition-colors duration-300">
                    Nouvelle équipe assignée au Projet X
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Il y a 2 heures</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}