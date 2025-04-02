import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, PenTool as Tool } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const performanceData = [
  { month: 'Jan', completed: 0, satisfaction: 0 },
  { month: 'Fév', completed: 0, satisfaction: 0 },
  { month: 'Mar', completed: 0, satisfaction: 0 },
  { month: 'Avr', completed: 0, satisfaction: 0 },
  { month: 'Mai', completed: 0, satisfaction: 0 },
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

const interventionData = [
  { name: 'Installation', value: 0 },
  { name: 'Maintenance', value: 0 },
  { name: 'Dépannage', value: 0 },
  { name: 'SAV', value: 0 }
];

export function TeamPerformance() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
      >
        <h3 className="text-xl font-semibold mb-6 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
          Performance Mensuelle
        </h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="month" stroke="#6B7280" fontSize={12} tickLine={false} />
              <YAxis stroke="#6B7280" fontSize={12} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(17, 24, 39, 0.8)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px'
                }}
              />
              <Legend />
              <Line 
                name="Chantiers terminés" 
                type="monotone" 
                dataKey="completed" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6' }}
              />
              <Line 
                name="Satisfaction client" 
                type="monotone" 
                dataKey="satisfaction" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ fill: '#10B981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div
        whileHover={{ y: -5 }}
        className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
      >
        <h3 className="text-xl font-semibold mb-6 flex items-center">
          <Tool className="w-5 h-5 mr-2 text-green-500" />
          Répartition des Interventions
        </h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={interventionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(17, 24, 39, 0.8)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}