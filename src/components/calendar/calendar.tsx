import React, { useMemo } from 'react';
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
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useCalendarStore } from '../../lib/calendar/calendar-store';
import { useScheduling } from '../../lib/scheduling/scheduling-context';
import { TeamScheduleView } from './views/team-schedule-view';

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

  // Calcul des statistiques basé sur les rendez-vous filtrés par date
  const stats = useMemo(() => {
    // Filtrer les rendez-vous de la semaine en cours (sans filtre de recherche)
    const weekAppointments = appointments.filter(app => {
      const appDate = new Date(app.date);
      return appDate >= weekStart && appDate <= weekEnd;
    });
    
    // Date actuelle pour comparer
    const now = new Date();
    
    // Total des rendez-vous de la semaine
    const totalWeekAppointments = weekAppointments.length;
    
    // Rendez-vous par statut
    const byStatus = {
      attribue: weekAppointments.filter(app => app.status === 'attribue').length,
      termine: weekAppointments.filter(app => app.status === 'termine').length,
      nonAttribue: weekAppointments.filter(app => app.status === 'non_attribue' || !app.status).length,
      aVenir: weekAppointments.filter(app => {
        const appDate = new Date(app.date);
        return appDate > now;
      }).length
    };
    
    // Rendez-vous par équipe
    const byTeam = teams.reduce((acc, team) => {
      acc[team.id] = weekAppointments.filter(app => app.team === team.name).length;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalWeekAppointments,
      byStatus,
      byTeam
    };
  }, [appointments, weekStart, weekEnd, teams]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Planning</h1>
          <p className="text-muted-foreground mt-1">Gérez vos rendez-vous et interventions</p>
        </div>
      </div>

      {/* Statistiques du planning */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Total Rendez-vous</h3>
            <CalendarIcon className="w-5 h-5 text-primary" />
          </div>
          <p className="text-2xl font-bold mt-2">{stats.totalWeekAppointments}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Semaine du {format(weekStart, 'dd/MM', { locale: fr })} au {format(weekEnd, 'dd/MM', { locale: fr })}
          </p>
        </div>
        
        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Attribués</h3>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold mt-2">{stats.byStatus.attribue}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.totalWeekAppointments > 0 
              ? `${Math.round((stats.byStatus.attribue / stats.totalWeekAppointments) * 100)}% des rendez-vous`
              : 'Aucun rendez-vous cette semaine'}
          </p>
        </div>
        
        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Terminés</h3>
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold mt-2">{stats.byStatus.termine}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.totalWeekAppointments > 0 
              ? `${Math.round((stats.byStatus.termine / stats.totalWeekAppointments) * 100)}% des rendez-vous`
              : 'Aucun rendez-vous cette semaine'}
          </p>
        </div>
        
        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">En attente</h3>
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-bold mt-2">{stats.byStatus.nonAttribue}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.totalWeekAppointments > 0 
              ? `${Math.round((stats.byStatus.nonAttribue / stats.totalWeekAppointments) * 100)}% des rendez-vous`
              : 'Aucun rendez-vous cette semaine'}
          </p>
        </div>
        
        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Non attribués</h3>
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-bold mt-2">{stats.byStatus.nonAttribue}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.totalWeekAppointments > 0 
              ? `${Math.round((stats.byStatus.nonAttribue / stats.totalWeekAppointments) * 100)}% des rendez-vous`
              : 'Aucun rendez-vous cette semaine'}
          </p>
        </div>
        
        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">À venir</h3>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-bold mt-2">{stats.byStatus.aVenir}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.totalWeekAppointments > 0 
              ? `${Math.round((stats.byStatus.aVenir / stats.totalWeekAppointments) * 100)}% des rendez-vous`
              : 'Aucun rendez-vous cette semaine'}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un rendez-vous..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="px-4 py-3 bg-accent hover:bg-accent/80 rounded-xl flex items-center transition-colors"
          >
            <Filter className="w-5 h-5 mr-2" />
            Filtrer les équipes
            {selectedTeams.length > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-sm">
                {selectedTeams.length}
              </span>
            )}
          </motion.button>

          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full right-0 mt-2 w-64 bg-card rounded-xl shadow-lg border border-border/50 p-2 z-50"
              >
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
                        <Users className="w-4 h-4 mr-2" />
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

      <div className="bg-card rounded-xl p-6 shadow-lg border border-border/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={goToToday}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center"
            >
              <CalendarCheck className="w-4 h-4 mr-2" />
              Aujourd'hui
            </motion.button>

            <div className="flex items-center bg-accent/50 rounded-xl">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={previousPeriod}
                className="p-2 hover:bg-accent rounded-l-xl"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
              <div className="px-4 py-2 font-medium">
                Semaine du {format(weekStart, 'd')} au {format(weekEnd, 'd MMMM yyyy', { locale: fr })}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={nextPeriod}
                className="p-2 hover:bg-accent rounded-r-xl"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <TeamScheduleView 
            filteredAppointments={filteredAppointments} 
            filteredTeams={selectedTeams.length > 0 ? teams.filter(team => selectedTeams.includes(team.id)) : undefined} 
          />
        </div>
      </div>
    </div>
  );
}
