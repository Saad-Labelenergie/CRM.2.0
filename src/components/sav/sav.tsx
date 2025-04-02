import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  AlertCircle, 
  Timer, 
  CheckCircle, 
  XCircle,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Package,
  Users,
  ArrowRight
} from 'lucide-react';
import { NewTicketModal } from './components/new-ticket-modal';
import { TicketList } from './components/ticket-list';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const tabs = [
  { id: 'all', label: 'Tous', icon: null },
  { id: 'nouveau', label: 'Nouveau', icon: AlertCircle },
  { id: 'en_cours', label: 'En cours', icon: Timer },
  { id: 'resolu', label: 'Résolu', icon: CheckCircle },
  { id: 'annule', label: 'Annulé', icon: XCircle }
];

// Données de test pour le tableau de bord
const dashboardData = {
  totalSAV: 156,
  statusBreakdown: {
    nouveau: 45,
    en_cours: 32,
    resolu: 75,
    annule: 4
  },
  teamStats: [
    { name: 'Équipe A', savCount: 28 },
    { name: 'Équipe B', savCount: 22 },
    { name: 'Équipe C', savCount: 15 },
    { name: 'Équipe D', savCount: 12 }
  ],
  monthlyGrowth: [
    { month: 'Jan', count: 42 },
    { month: 'Fév', count: 48 },
    { month: 'Mar', count: 45 },
    { month: 'Avr', count: 52 },
    { month: 'Mai', count: 48 },
    { month: 'Juin', count: 56 }
  ],
  productStats: [
    { name: 'Climatiseur Mural 9000 BTU', count: 35 },
    { name: 'Unité Extérieure Multi-Split', count: 28 },
    { name: 'Pompe à Chaleur Air/Eau', count: 22 },
    { name: 'Climatiseur Gainable', count: 18 }
  ]
};

export function SAV() {
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const handleSaveTicket = (ticketData: any) => {
    console.log('Nouveau ticket:', ticketData);
    // Ici, vous ajouteriez la logique pour sauvegarder le ticket
  };

  // Calcul de la croissance
  const currentMonth = dashboardData.monthlyGrowth[dashboardData.monthlyGrowth.length - 1];
  const previousMonth = dashboardData.monthlyGrowth[dashboardData.monthlyGrowth.length - 2];
  const growthPercentage = ((currentMonth.count - previousMonth.count) / previousMonth.count * 100).toFixed(1);

  // Trouver l'équipe avec le plus de SAV
  const topTeam = [...dashboardData.teamStats].sort((a, b) => b.savCount - a.savCount)[0];

  // Trouver le produit avec le plus de SAV
  const topProduct = [...dashboardData.productStats].sort((a, b) => b.count - a.count)[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Service Après-Vente</h1>
          <p className="text-muted-foreground mt-1">Gérez vos tickets SAV et interventions</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsNewTicketModalOpen(true)}
          className="flex items-center px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Ticket
        </motion.button>
      </div>

      {/* Tableau de bord */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total SAV */}
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Total SAV</div>
              <div className="text-3xl font-bold mt-2">{dashboardData.totalSAV}</div>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            {Number(growthPercentage) > 0 ? (
              <>
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500">+{growthPercentage}%</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                <span className="text-red-500">{growthPercentage}%</span>
              </>
            )}
            <span className="text-muted-foreground ml-1">vs mois dernier</span>
          </div>
        </motion.div>

        {/* Répartition par statut */}
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium text-muted-foreground">Par statut</div>
            <Timer className="w-5 h-5 text-orange-500" />
          </div>
          <div className="space-y-2">
            {Object.entries(dashboardData.statusBreakdown).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${
                    status === 'nouveau' ? 'bg-blue-500' :
                    status === 'en_cours' ? 'bg-orange-500' :
                    status === 'resolu' ? 'bg-green-500' :
                    'bg-red-500'
                  }`} />
                  <span className="text-sm capitalize">{status.replace('_', ' ')}</span>
                </div>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Équipe générant le plus de SAV */}
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium text-muted-foreground">Équipe la plus sollicitée</div>
            <Users className="w-5 h-5 text-purple-500" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold">{topTeam.name}</div>
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <span>{topTeam.savCount} tickets SAV</span>
              <ArrowRight className="w-4 h-4 mx-1" />
              <span className="text-primary font-medium">
                {((topTeam.savCount / dashboardData.totalSAV) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </motion.div>

        {/* Produit le plus en SAV */}
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium text-muted-foreground">Produit le plus concerné</div>
            <Package className="w-5 h-5 text-blue-500" />
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold line-clamp-2">{topProduct.name}</div>
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <span>{topProduct.count} tickets SAV</span>
              <ArrowRight className="w-4 h-4 mx-1" />
              <span className="text-primary font-medium">
                {((topProduct.count / dashboardData.totalSAV) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Graphique d'évolution */}
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
      >
        <h3 className="text-lg font-semibold mb-6">Évolution des SAV</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dashboardData.monthlyGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis 
                dataKey="month" 
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
                dataKey="count" 
                stroke="#3B82F6" 
                strokeWidth={2.5}
                dot={{ fill: '#3B82F6', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#3B82F6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="flex items-center border-b border-border/50">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ backgroundColor: 'rgba(var(--accent), 0.5)' }}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-6 py-3 relative ${
              activeTab === tab.id 
                ? 'text-primary font-medium' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.icon && <tab.icon className="w-4 h-4 mr-2" />}
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>

      <TicketList selectedStatus={activeTab === 'all' ? null : activeTab} />

      <NewTicketModal
        isOpen={isNewTicketModalOpen}
        onClose={() => setIsNewTicketModalOpen(false)}
        onSave={handleSaveTicket}
      />
    </motion.div>
  );
}