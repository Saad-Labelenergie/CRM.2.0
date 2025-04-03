import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight,
  CalendarCheck,
  Users,
  Search,
  Filter
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

  const { teams } = useScheduling();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

  const days = getDaysInView();
  const weekStart = days[0];
  const weekEnd = days[6];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Planning</h1>
          <p className="text-muted-foreground mt-1">Gérez vos rendez-vous et interventions</p>
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
          <TeamScheduleView />
        </div>
      </div>
    </div>
  );
}
