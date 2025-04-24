import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Package, Info, AlertCircle, Users, MapPin, ChevronRight, ChevronLeft, Euro, MessageSquare } from 'lucide-react';
import { useScheduling } from '../../../../lib/scheduling/scheduling-context';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { isValid, isFriday } from 'date-fns';

interface TeamAvailability {
  id?: string;
  _id: string;
  name: string;
  expertise: string[];
  isActive: boolean;
  color: string;
  createdAt?: Date;
  updatedAt?: Date;
  schedule: Array<{
    date: string;
    slots: Array<{
      start: string;
      end: string;
      isAvailable: boolean;
    }>;
  }>;
}
interface Product {
  id: number;
  name: string;
  type: string;
  installationTime: number;
  price: number;
}

interface TeamAvailability {
  id?: string;
  _id: string;
  name: string;
  expertise: string[];
  isActive: boolean;
  color: string;
  createdAt?: Date;
  updatedAt?: Date;
  schedule: Array<{
    date: string;
    slots: Array<{
      start: string;
      end: string;
      isAvailable: boolean;
    }>;
  }>;
}

export interface PlanningStepProps {
  selectedProducts: any[];
  selectedTeam: any;
  installationDate: string;
  installationDurationInDays?: number; // Add this property to the interface
  errors: Record<string, string>;
  onTeamSelect: (team: TeamAvailability) => void;
  onDateChange: (date: string) => void;
}

export function PlanningStep({
  selectedProducts,
  selectedTeam,
  installationDate,
  installationDurationInDays = 0, // Default value
  errors,
  onTeamSelect,
  onDateChange
}: PlanningStepProps) {
  const { teams, appointments } = useScheduling(); // Récupérer aussi les rendez-vous
  
  const availableTeams = (teams?.filter(team => team.isActive) || []) as TeamAvailability[];

  const [hasPaymentToCollect, setHasPaymentToCollect] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [comment, setComment] = useState('');
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const totalInstallationTime = selectedProducts.reduce(
    (total, selectedProducts) => total + selectedProducts.installationTime,
    0
  );
  const daysNeeded = Math.ceil(totalInstallationTime / (8 * 60));
  const today = new Date();

  // Filtrer les équipes disponibles en fonction de la date sélectionnée
  const getAvailableTeamsForDate = () => {
    if (!installationDate || !appointments) return availableTeams;

    // Calculer les dates pour les installations multi-jours
    const installationDates = [installationDate];
    if (installationDurationInDays > 1) {
      const nextDate = new Date(installationDate);
      nextDate.setDate(nextDate.getDate() + 1);
      installationDates.push(nextDate.toISOString().split('T')[0]);
    }

    // Filtrer les équipes qui n'ont pas de rendez-vous aux dates d'installation
    return availableTeams.filter(team => {
      // Vérifier si l'équipe a des rendez-vous aux dates d'installation
      const hasAppointmentOnDate = appointments.some(appointment => {
        return (
          appointment.team === team.name && 
          installationDates.includes(appointment.date)
        );
      });
      
      // Retourner true si l'équipe n'a pas de rendez-vous à ces dates
      return !hasAppointmentOnDate;
    });
  };

  // Obtenir les équipes disponibles pour la date sélectionnée
  const teamsAvailableForSelectedDate = getAvailableTeamsForDate();

  const renderWeekCalendar = () => {
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
    const days = [];

    for (let date = weekStart; date <= weekEnd; date = addDays(date, 1)) {
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Ignore dimanche (0) et samedi (6)
    
      const isToday = isSameDay(date, today);
      const isSelected = installationDate && isSameDay(date, parseISO(installationDate));
      const isPast = date < today;
      
      // Vérifier si ce jour doit être désactivé (vendredi pour installation > 1 jour)
      const isFridayMultiDay = dayOfWeek === 5 && installationDurationInDays > 1;
      const isDisabled = isPast || isFridayMultiDay;
    
      days.push(
        <div
          key={date.toISOString()}
          onClick={() => !isDisabled && onDateChange(format(date, 'yyyy-MM-dd'))}
          className={`p-4 rounded-lg border cursor-pointer transition-all ${
            isDisabled ? 'opacity-50 cursor-not-allowed' :
            isSelected ? 'bg-primary/20 border-primary' :
            isToday ? 'bg-accent/50' : 'hover:bg-accent/50'
          }`}
        >
          <div className="text-sm font-medium">
            {format(date, 'EEEE', { locale: fr })}
          </div>
          <div className="mt-1 text-2xl font-bold">
            {format(date, 'd')}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            {format(date, 'MMMM', { locale: fr })}
          </div>
          {isFridayMultiDay && (
            <div className="mt-1 text-xs text-amber-500">
              Non disponible (installation sur {installationDurationInDays.toFixed(1)} jours)
            </div>
          )}
        </div>
      );
    }
    

    return (
      <div className="mt-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-medium">
            {format(weekStart, 'd MMMM', { locale: fr })} - {format(weekEnd, 'd MMMM yyyy', { locale: fr })}
          </span>
          <button
            onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-5 gap-4 justify-center">
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-accent/50 rounded-lg p-4 space-y-4">
      <div className="p-4 bg-background rounded-lg border space-y-2">
  <h4 className="font-medium mb-2 flex items-center text-primary">
    <Info className="w-4 h-4 mr-2" />
    Résumé de la planification
  </h4>

  <div className="text-sm text-muted-foreground">
    <strong>Produits sélectionnés :</strong>{' '}
    {selectedProducts.length > 0
      ? selectedProducts.map(p => p.name).join(', ')
      : 'Aucun'}
  </div>

  <div className="text-sm text-muted-foreground">
    <strong>Équipe choisie :</strong>{' '}
    {selectedTeam ? selectedTeam.name : 'Aucune'}
  </div>

  <div className="text-sm text-muted-foreground">
  <strong>Date d’installation :</strong>{' '}
  {Math.floor(totalInstallationTime / 60)}h
  {totalInstallationTime % 60 > 0 ? ` ${totalInstallationTime % 60}min` : ''}

  </div>
</div>


        {/* Règlement à récupérer */}
        <div className="p-4 bg-background rounded-lg border">
          <h4 className="font-medium mb-4 flex items-center">
            <Euro className="w-4 h-4 mr-2 text-green-500" />
            Règlement à récupérer
          </h4>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hasPayment"
                checked={hasPaymentToCollect}
                onChange={(e) => {
                  setHasPaymentToCollect(e.target.checked);
                  if (!e.target.checked) setPaymentAmount('');
                }}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="hasPayment" className="text-sm">
                Règlement à récupérer lors de l'installation
              </label>
            </div>

            {hasPaymentToCollect && (
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Montant à récupérer"
                    className="w-full pl-8 pr-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    min="0"
                    step="0.01"
                  />
                  <Euro className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Commentaire */}
        <div className="p-4 bg-background rounded-lg border">
          <h4 className="font-medium mb-4 flex items-center">
            <MessageSquare className="w-4 h-4 mr-2 text-purple-500" />
            Commentaire
          </h4>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Ajouter un commentaire pour l'équipe d'installation..."
            className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-24 resize-none"
          />
        </div>

        {renderWeekCalendar()}

        <div className="mt-4">
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Équipe d'installation
          </label>
          {!teams ? (
            <div className="text-center py-4 text-muted-foreground">
              Chargement des équipes...
            </div>
          ) : installationDate ? (
            teamsAvailableForSelectedDate.length === 0 ? (
              <div className="text-center py-4 text-amber-500 bg-amber-50 rounded-lg border border-amber-200 p-3">
                <AlertCircle className="w-5 h-5 mx-auto mb-2" />
                Aucune équipe disponible à cette date. Veuillez sélectionner une autre date.
              </div>
            ) : (
              <div className="space-y-2">
                {teamsAvailableForSelectedDate.map((team) => (
                  <button
                    key={team._id}
                    onClick={() => onTeamSelect(team)}
                    className={`w-full p-3 rounded-lg text-left transition-colors flex items-center justify-between ${
                      selectedTeam?._id === team._id
                        ? 'bg-primary/10 border-primary'
                        : 'bg-background hover:bg-accent'
                    } border`}
                  >
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      {team.name}
                      <div 
                        className="w-3 h-3 rounded-full ml-2" 
                        style={{ backgroundColor: team.color || '#3B82F6' }}
                      />
                    </div>
                    {selectedTeam?._id === team._id && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </button>
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-4 text-muted-foreground bg-accent/50 rounded-lg p-3">
              Veuillez d'abord sélectionner une date d'installation
            </div>
          )}
        </div>

        {errors.installationDate && (
          <div className="text-destructive text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.installationDate}
          </div>
        )}
      </div>
    </div>
  );
}