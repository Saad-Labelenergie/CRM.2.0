import { addDays, isSameDay, isWeekend, setHours, setMinutes, differenceInDays, isBefore, parseISO } from 'date-fns';

// Types
export interface Installation {
  type: string;
  duration: number; // en minutes
  location: {
    postalCode: string;
    city: string;
  };
}

export interface Team {
  id: string;
  name: string;
  expertise: string[];
  schedule: {
    date: string;
    slots: TimeSlot[];
  }[];
  isActive: boolean;
}

export interface TimeSlot {
  start: string;
  end: string;
  isAvailable: boolean;
}

// Constants
const WORKING_HOURS = {
  start: { hour: 8, minute: 0 },
  end: { hour: 18, minute: 0 }
};

// Helper functions
function isWorkingDay(date: Date): boolean {
  return !isWeekend(date);
}

function getTeamScore(team: Team, installation: Installation, date: Date): number {
  let score = 100;

  // Expertise match - high priority
  if (team.expertise.includes(installation.type)) {
    score += 30;
  }

  // Pénalité pour les dates éloignées (-5 points par jour)
  const daysFromNow = differenceInDays(date, new Date());
  score -= daysFromNow * 5;

  // Bonus pour les équipes avec plus d'expertise
  score += team.expertise.length * 5;

  return Math.max(0, score); // Ensure score doesn't go below 0
}

function getSlotScore(slot: TimeSlot, installation: Installation): number {
  let score = 100;

  // Préférence pour les créneaux du matin
  const startHour = parseInt(slot.start.split(':')[0]);
  if (startHour <= 9) {
    score += 20;
  } else if (startHour <= 11) {
    score += 10;
  }

  // Bonus pour les créneaux qui permettent de terminer dans les heures de travail
  const duration = installation.duration;
  const endHour = startHour + Math.ceil(duration / 60);
  if (endHour <= WORKING_HOURS.end.hour) {
    score += 15;
  }

  return score;
}

export class SchedulingService {
  private teams: Team[] = [];

  constructor(teams: Team[]) {
    this.teams = teams;
    this.optimizeWeeklySchedule();
  }

  findOptimalSlot(installation: Installation) {
    const slots: {
      team: Team;
      startDate: Date;
      endDate: Date;
      score: number;
    }[] = [];

    // Recherche des créneaux uniquement pour les équipes actives
    const activeTeams = this.teams.filter(team => team.isActive);
    for (const team of activeTeams) {
      const teamSlots = this.findTeamSlots(team, installation);
      slots.push(...teamSlots);
    }

    // Tri des créneaux par score (le plus élevé en premier) et date (la plus proche en premier)
    return slots.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.startDate.getTime() - b.startDate.getTime();
    });
  }

  getAvailableTeamsForDate(date: string, installation: Installation): Team[] {
    return this.teams.filter(team => {
      // Vérifier si l'équipe est active
      if (!team.isActive) return false;

      // Vérifier si l'équipe a l'expertise nécessaire
      const hasExpertise = team.expertise.includes(installation.type);
      if (!hasExpertise) return false;

      // Vérifier la disponibilité à la date donnée
      const schedule = team.schedule.find(s => s.date === date);
      if (!schedule) return false;

      // Vérifier si au moins un créneau est disponible
      return schedule.slots.some(slot => slot.isAvailable);
    });
  }

  private findTeamSlots(team: Team, installation: Installation) {
    const slots: {
      team: Team;
      startDate: Date;
      endDate: Date;
      score: number;
    }[] = [];

    const duration = installation.duration;
    const today = new Date();
    let currentDate = today;

    // Recherche des créneaux sur les 14 prochains jours
    for (let i = 0; i < 14; i++) {
      if (!isWorkingDay(currentDate)) {
        currentDate = addDays(currentDate, 1);
        continue;
      }

      // Vérification de la disponibilité de l'équipe
      const teamSchedule = team.schedule.find(s => isSameDay(new Date(s.date), currentDate));
      if (teamSchedule) {
        const daySlots = this.findDaySlots(teamSchedule.slots, duration);
        
        for (const slot of daySlots) {
          const startDate = new Date(currentDate);
          startDate.setHours(parseInt(slot.start.split(':')[0]));
          startDate.setMinutes(parseInt(slot.start.split(':')[1]));

          const endDate = new Date(startDate);
          endDate.setMinutes(endDate.getMinutes() + duration);

          // Calcul du score total pour ce créneau
          const teamScore = getTeamScore(team, installation, startDate);
          const slotScore = getSlotScore(slot, installation);
          const totalScore = Math.floor((teamScore + slotScore) / 2); // Moyenne des scores

          slots.push({
            team,
            startDate,
            endDate,
            score: totalScore
          });
        }
      }

      currentDate = addDays(currentDate, 1);
    }

    return slots;
  }

  private findDaySlots(slots: TimeSlot[], duration: number): TimeSlot[] {
    const availableSlots: TimeSlot[] = [];

    // Priorisation des créneaux du matin
    const sortedSlots = [...slots].sort((a, b) => {
      const aHour = parseInt(a.start.split(':')[0]);
      const bHour = parseInt(b.start.split(':')[0]);
      return aHour - bHour;
    });

    for (const slot of sortedSlots) {
      if (!slot.isAvailable) continue;

      const startHour = parseInt(slot.start.split(':')[0]);
      const startMinute = parseInt(slot.start.split(':')[1]);
      const endHour = parseInt(slot.end.split(':')[0]);
      const endMinute = parseInt(slot.end.split(':')[1]);

      const slotDuration = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);

      if (slotDuration >= duration) {
        availableSlots.push(slot);
      }
    }

    return availableSlots;
  }

  optimizeWeeklySchedule(): void {
    // Initialisation des créneaux pour toutes les équipes
    const today = new Date();
    const startOfWeek = addDays(today, 1 - today.getDay()); // Lundi

    for (const team of this.teams) {
      for (let i = 0; i < 5; i++) { // Du lundi au vendredi
        const date = addDays(startOfWeek, i);
        if (!team.schedule.find(s => isSameDay(new Date(s.date), date))) {
          team.schedule.push({
            date: date.toISOString().split('T')[0],
            slots: [
              {
                start: '08:00',
                end: '12:00',
                isAvailable: true
              },
              {
                start: '13:00',
                end: '18:00',
                isAvailable: true
              }
            ]
          });
        }
      }
    }
  }
}