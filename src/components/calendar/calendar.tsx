import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight,
  CalendarCheck,
  Users,
  Search,
  Filter,
  Calendar as CalendarIcon,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  BarChart
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, 
  startOfQuarter, endOfQuarter, startOfYear, endOfYear, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useCalendarStore } from '../../lib/calendar/calendar-store';
import { useScheduling } from '../../lib/scheduling/scheduling-context';
import { TeamScheduleView } from './views/team-schedule-view';

// Définir les types de périodes pour les statistiques
type StatsPeriod = 'week' | 'month' | 'quarter' | 'semester' | 'year' | 'all';

export function Calendar() {
  const { 
    currentDate, 
    nextPeriod, 
    previousPeriod,
    goToToday,
    getDaysInView,
    selectedTeams,
    toggleTeam
  } = useCalendarStore();

  const { teams, appointments } = useScheduling();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [isStatsFilterOpen, setIsStatsFilterOpen] = useState(false);
  const [statsPeriod, setStatsPeriod] = useState<StatsPeriod>('all');

  const days = getDaysInView();
  const weekStart = days[0];
  const weekEnd = days[6];

  // Filtrer les rendez-vous en fonction du terme de recherche
  const filteredAppointments = useMemo(() => {
    return appointments.filter(app => {
      // Filtrer par date (semaine en cours)
      const appDate = new Date(app.date);
      const isInCurrentWeek = appDate >= weekStart && appDate <= weekEnd;
      
      // Filtrer par équipe sélectionnée
      const isTeamSelected = selectedTeams.length === 0 || 
        (app.team && teams.some(t => selectedTeams.includes(t.id) && t.name === app.team));
      
      // Filtrer par terme de recherche
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === '' || 
        (app.title && app.title.toLowerCase().includes(searchLower)) ||
        (app.client?.name && app.client.name.toLowerCase().includes(searchLower)) ||
        (app.client?.postalCode && app.client.postalCode.toLowerCase().includes(searchLower));
      
      return isInCurrentWeek && isTeamSelected && matchesSearch;
    });
  }, [appointments, weekStart, weekEnd, selectedTeams, teams, searchTerm]);

  // Obtenir les dates de début et de fin en fonction de la période sélectionnée
  const getDateRangeForPeriod = (period: StatsPeriod): [Date, Date] => {
    const now = new Date();
    
    switch (period) {
      case 'week':
        return [startOfWeek(now, { weekStartsOn: 1 }), endOfWeek(now, { weekStartsOn: 1 })];
      case 'month':
        return [startOfMonth(now), endOfMonth(now)];
      case 'quarter':
        return [startOfQuarter(now), endOfQuarter(now)];
      case 'semester':
        // Un semestre est environ 6 mois
        const currentMonth = now.getMonth();
        const isFirstSemester = currentMonth < 6;
        const semesterStart = new Date(now.getFullYear(), isFirstSemester ? 0 : 6, 1);
        const semesterEnd = isFirstSemester 
          ? new Date(now.getFullYear(), 5, 30) 
          : new Date(now.getFullYear(), 11, 31);
        return [semesterStart, semesterEnd];
      case 'year':
        return [startOfYear(now), endOfYear(now)];
      case 'all':
      default:
        // Pour "all", on retourne des dates qui incluront tous les rendez-vous
        return [new Date(0), new Date(8640000000000000)]; // Min et max dates possibles
    }
  };

  // Calcul des statistiques basé sur la période sélectionnée
  const stats = useMemo(() => {
    const [startDate, endDate] = getDateRangeForPeriod(statsPeriod);
    
    // Filtrer les rendez-vous en fonction de la période sélectionnée
    const filteredAppointments = statsPeriod === 'all' 
      ? appointments 
      : appointments.filter(app => {
          const appDate = new Date(app.date);
          return appDate >= startDate && appDate <= endDate;
        });
    
    // Date actuelle pour comparer
    const now = new Date();
    
    // Total des rendez-vous
    const totalAppointments = filteredAppointments.length;
    
    // Rendez-vous par statut
    const byStatus = {
      attribue: filteredAppointments.filter(app => app.status === 'attribue').length,
      termine: filteredAppointments.filter(app => app.status === 'termine').length,
      nonAttribue: filteredAppointments.filter(app => app.status === 'non_attribue' || !app.status).length,
      aVenir: filteredAppointments.filter(app => {
        const appDate = new Date(app.date);
        return appDate > now;
      }).length
    };
    
    // Rendez-vous par équipe
    const byTeam = teams.reduce((acc, team) => {
      acc[team.id] = filteredAppointments.filter(app => app.team === team.name).length;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalAppointments,
      byStatus,
      byTeam,
      period: statsPeriod
    };
  }, [appointments, teams, statsPeriod]);

  // Obtenir le libellé de la période pour l'affichage
  const getPeriodLabel = (period: StatsPeriod): string => {
    switch (period) {
      case 'week': return 'Cette semaine';
      case 'month': return 'Ce mois';
      case 'quarter': return 'Ce trimestre';
      case 'semester': return 'Ce semestre';
      case 'year': return 'Cette année';
      case 'all': return 'Tous les rendez-vous';
      default: return 'Période inconnue';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Planning</h1>
          <p className="text-muted-foreground mt-1">Gérez vos rendez-vous et interventions</p>
        </div>
      </div>

      {/* Filtre des statistiques */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Statistiques</h2>
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsStatsFilterOpen(!isStatsFilterOpen)}
            className="px-4 py-2 bg-accent hover:bg-accent/80 rounded-xl flex items-center transition-colors"
          >
            <BarChart className="w-4 h-4 mr-2" />
            {getPeriodLabel(statsPeriod)}
          </motion.button>

          <AnimatePresence>
            {isStatsFilterOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full right-0 mt-2 w-48 bg-card rounded-xl shadow-lg border border-border/50 p-2 z-50"
              >
                <div className="space-y-1">
                  {(['week', 'month', 'quarter', 'semester', 'year', 'all'] as StatsPeriod[]).map((period) => (
                    <motion.button
                      key={period}
                      whileHover={{ backgroundColor: 'rgba(var(--accent), 0.5)' }}
                      onClick={() => {
                        setStatsPeriod(period);
                        setIsStatsFilterOpen(false);
                      }}
                      className={`w-full px-3 py-2 rounded-lg flex items-center justify-between ${
                        statsPeriod === period ? 'bg-primary/10' : ''
                      }`}
                    >
                      <div className="flex items-center">
                        {getPeriodLabel(period)}
                      </div>
                      {statsPeriod === period && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Statistiques du planning */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Total Rendez-vous</h3>
            <CalendarIcon className="w-5 h-5 text-primary" />
          </div>
          <p className="text-2xl font-bold mt-2">{stats.totalAppointments}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {getPeriodLabel(statsPeriod)}
          </p>
        </div>
        
        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Attribués</h3>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold mt-2">{stats.byStatus.attribue}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.totalAppointments > 0 
              ? `${Math.round((stats.byStatus.attribue / stats.totalAppointments) * 100)}% des rendez-vous`
              : 'Aucun rendez-vous'}
          </p>
        </div>
        
        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Terminés</h3>
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold mt-2">{stats.byStatus.termine}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.totalAppointments > 0 
              ? `${Math.round((stats.byStatus.termine / stats.totalAppointments) * 100)}% des rendez-vous`
              : 'Aucun rendez-vous'}
          </p>
        </div>
        
        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Non attribués</h3>
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-bold mt-2">{stats.byStatus.nonAttribue}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.totalAppointments > 0 
              ? `${Math.round((stats.byStatus.nonAttribue / stats.totalAppointments) * 100)}% des rendez-vous`
              : 'Aucun rendez-vous'}
          </p>
        </div>
      </div>

      {/* Contrôles du calendrier */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={previousPeriod}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={goToToday}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Aujourd'hui
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={nextPeriod}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
          
          <h2 className="text-xl font-semibold ml-2">
            Semaine du {format(weekStart, 'dd', { locale: fr })} au {format(weekEnd, 'dd')} {format(weekStart, 'MMMM yyyy', { locale: fr })}
          </h2>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-accent/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="p-2 bg-accent/50 hover:bg-accent rounded-xl transition-colors"
            >
              <Filter className="w-5 h-5" />
            </motion.button>
            
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full right-0 mt-2 w-64 bg-card rounded-xl shadow-lg border border-border/50 p-2 z-50"
                >
                  <div className="flex justify-between items-center mb-2 pb-2 border-b border-border">
                    <h3 className="font-medium">Filtrer par équipe</h3>
                    <button 
                      onClick={() => setIsFilterOpen(false)}
                      className="p-1 hover:bg-accent rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    {teams.map((team) => (
                      <motion.button
                        key={team.id}
                        whileHover={{ backgroundColor: 'rgba(var(--accent), 0.5)' }}
                        onClick={() => toggleTeam(team.id)}
                        className={`w-full px-3 py-2 rounded-lg flex items-center justify-between ${
                          selectedTeams.includes(team.id) ? 'bg-primary/10' : ''
                        }`}
                      >
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: team.color || '#888' }}
                          />
                          {team.name}
                        </div>
                        {selectedTeams.includes(team.id) && (
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Vue du planning */}
      <TeamScheduleView 
        filteredAppointments={filteredAppointments} 
        filteredTeams={selectedTeams.length > 0 ? teams.filter(team => selectedTeams.includes(team.id)) : undefined}
      />
    </div>
  );
}