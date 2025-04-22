import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle, ChevronDown, ChevronUp, CheckCircle, AlertTriangle,
  Search, Clock, Calendar, Building2
} from 'lucide-react';
import { useSAV } from '../../../contexts/sav-context';

interface Props {
  teamId: string;
  teamName: string;
}

export function SAVDetails({ teamId, teamName }: Props) {
  const { tickets, installations } = useSAV();
  console.log('📦 tickets:', tickets);
  console.log('🏗️ installations:', installations);
  console.log('🎯 teamId:', teamId);

  const [showAll, setShowAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const teamTickets = tickets.filter(t => {
    console.log('🔍 Ticket:', t.id, 'team.id:', t.team?.id);
    return t.team?.id === teamId;
  });
  const filteredTickets = teamTickets.filter(ticket => {
    const matchesSearch = ticket.client.name.toLowerCase().includes(searchTerm.toLowerCase())
      || ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
      || ticket.product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !selectedStatus || ticket.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const displayed = showAll ? filteredTickets : filteredTickets.slice(0, 3);

  const total = teamTickets.length;
  const resolved = teamTickets.filter(t => t.status === 'resolu').length;
  const resolutionRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : '0.0';
  const enCours = teamTickets.filter(t => t.status === 'en_cours').length;
  const installsByTeam = installations.filter(i => i.team.id === teamId).length;
  const ratio = installsByTeam > 0 ? ((total / installsByTeam) * 100).toFixed(1) : '0.0';

  const responseTime = teamTickets.reduce((acc, t) => {
    const created = new Date(t.createdAt);
    const installed = new Date(t.installationDate);
    return acc + (created.getTime() - installed.getTime()) / (1000 * 60 * 60 * 24);
  }, 0) / (total || 1);
  console.log('✅ Tickets filtrés pour cette équipe:', teamTickets);


  return (
    <motion.div className="bg-card p-6 rounded-xl shadow-lg border border-border/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 text-yellow-500" />
          SAV - {teamName}
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
            <option value="nouveau">Nouveau</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total SAV" value={total} subLabel="Taux de résolution" subValue={`${resolutionRate}%`} barValue={resolutionRate} />
        <StatCard label="Ratio SAV/Installations" value={`${ratio}%`} subLabel="Installations" subValue={installsByTeam.toString()} />
        <StatCard label="Temps moyen avant SAV" value={`${responseTime.toFixed(1)} jours`} subLabel="SAV en cours" subValue={enCours.toString()} />
      </div>

      <AnimatePresence mode="popLayout">
        <div className="space-y-4">
          {displayed.map(ticket => (
            <motion.div
              key={ticket.id}
              layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="bg-accent/50 rounded-xl p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium flex items-center">
                    {ticket.status === 'resolu'
                      ? <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      : <AlertTriangle className="w-4 h-4 text-orange-500 mr-2" />
                    }
                    {ticket.product.name}
                  </h4>
                  <div className="text-sm text-muted-foreground flex items-center">
                    <Building2 className="w-4 h-4 mr-1" /> {ticket.client.name}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    ticket.status === 'resolu' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {ticket.status}
                  </span>
                  <div className="mt-1 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 inline mr-1" /> {ticket.createdAt.split('T')[0]}
                  </div>
                </div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{ticket.description}</p>
              <div className="flex justify-between items-center text-sm mt-2">
                <div className="flex items-center text-muted-foreground">
                  <Clock className="w-4 h-4 mr-1" /> Installé le {new Date(ticket.installationDate).toLocaleDateString('fr-FR')
                  }
                </div>
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                  ticket.priority === 'haute' ? 'bg-red-100 text-red-700' : ticket.priority === 'moyenne' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  Priorité {ticket.priority}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {filteredTickets.length > 3 && (
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => setShowAll(!showAll)}
          className="mt-4 w-full px-4 py-2 bg-accent hover:bg-accent/80 rounded-lg text-sm font-medium"
        >
          {showAll ? 'Voir moins' : 'Voir plus'}
          {showAll ? <ChevronUp className="ml-2 w-4 h-4" /> : <ChevronDown className="ml-2 w-4 h-4" />}
        </motion.button>
      )}

      {filteredTickets.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          Aucun ticket SAV pour cette équipe.
        </div>
      )}
    </motion.div>
  );
}

function StatCard({ label, value, subLabel, subValue, barValue }: { label: string, value: string | number, subLabel: string, subValue: string, barValue?: string | number }) {
  return (
    <div className="bg-accent/50 rounded-xl p-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-xl font-bold">{value}</span>
      </div>
      {barValue && (
        <div className="mt-2 h-2 bg-background rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: `${barValue}%` }} />
        </div>
      )}
      <div className="mt-1 flex justify-between text-sm">
        <span className="text-muted-foreground">{subLabel}</span>
        <span className="font-medium">{subValue}</span>
      </div>
    </div>
  );
}
