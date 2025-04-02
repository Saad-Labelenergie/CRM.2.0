import { create } from 'zustand';
import { addDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

interface CalendarState {
  currentDate: Date;
  selectedDate: Date;
  selectedTeams: string[];
  setCurrentDate: (date: Date) => void;
  setSelectedDate: (date: Date) => void;
  nextPeriod: () => void;
  previousPeriod: () => void;
  goToToday: () => void;
  getDaysInView: () => Date[];
  toggleTeam: (teamId: string) => void;
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  currentDate: new Date(),
  selectedDate: new Date(),
  selectedTeams: [],

  setCurrentDate: (date) => set({ currentDate: date }),
  setSelectedDate: (date) => set({ selectedDate: date }),

  goToToday: () => set({ currentDate: new Date() }),

  toggleTeam: (teamId) => set(state => ({
    selectedTeams: state.selectedTeams.includes(teamId)
      ? state.selectedTeams.filter(id => id !== teamId)
      : [...state.selectedTeams, teamId]
  })),

  nextPeriod: () => {
    const { currentDate } = get();
    set({ currentDate: addDays(currentDate, 7) });
  },

  previousPeriod: () => {
    const { currentDate } = get();
    set({ currentDate: addDays(currentDate, -7) });
  },

  getDaysInView: () => {
    const { currentDate } = get();
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }
}));