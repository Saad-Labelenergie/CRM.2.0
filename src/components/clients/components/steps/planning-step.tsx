import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Package, Info, AlertCircle, Users, MapPin, ChevronRight, ChevronLeft, Euro, MessageSquare } from 'lucide-react';
import { useScheduling } from '../../../../lib/scheduling/scheduling-context';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TeamAvailability {
  id: string;
  name: string;
  expertise: string[];
  isActive: boolean;
}

interface Product {
  id: number;
  name: string;
  type: string;
  installationTime: number;
  price: number;
}

interface PlanningStepProps {
  selectedProducts: Product[];
  selectedTeam: TeamAvailability | null;
  installationDate: string;
  errors: Record<string, string>;
  onTeamSelect: (team: TeamAvailability) => void;
  onDateChange: (date: string) => void;
}

export function PlanningStep({
  selectedProducts,
  selectedTeam,
  installationDate,
  errors,
  onTeamSelect,
  onDateChange
}: PlanningStepProps) {
  const { teams } = useScheduling();
  const [hasPaymentToCollect, setHasPaymentToCollect] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [comment, setComment] = useState('');
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const totalInstallationTime = selectedProducts.reduce(
    (total, product) => total + product.installationTime,
    0
  );
  const daysNeeded = Math.ceil(totalInstallationTime / (8 * 60));
  const today = new Date();

  // Filtrer uniquement les équipes actives
  const availableTeams = teams.filter(team => team.isActive);

  const renderWeekCalendar = () => {
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
    const days = [];

    for (let date = weekStart; date <= weekEnd; date = addDays(date, 1)) {
      const isToday = isSameDay(date, today);
      const isSelected = installationDate && isSameDay(date, parseISO(installationDate));
      const isPast = date < today;

      days.push(
        <div
          key={date.toISOString()}
          onClick={() => !isPast && onDateChange(format(date, 'yyyy-MM-dd'))}
          className={`p-4 rounded-lg border cursor-pointer transition-all ${
            isPast ? 'opacity-50 cursor-not-allowed' :
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
        <div className="grid grid-cols-7 gap-2">
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-accent/50 rounded-lg p-4 space-y-4">
        <h3 className="font-medium flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          Planification de l'installation
        </h3>

        <div className="p-4 bg-background rounded-lg border">
          <h4 className="font-medium mb-2 flex items-center">
            <Info className="w-4 h-4 mr-2 text-blue-500" />
            Informations importantes
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center text-muted-foreground">
              <Clock className="w-4 h-4 mr-2" />
              Durée totale : {totalInstallationTime / 60} heures ({daysNeeded} jour{daysNeeded > 1 ? 's' : ''})
            </div>
            <div className="flex items-center text-muted-foreground">
              <Package className="w-4 h-4 mr-2" />
              Produits : {selectedProducts.map(p => p.type).join(', ')}
            </div>
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
          {availableTeams.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              Aucune équipe active disponible
            </div>
          ) : (
            <div className="space-y-2">
              {availableTeams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => onTeamSelect(team)}
                  className={`w-full p-3 rounded-lg text-left transition-colors flex items-center justify-between ${
                    selectedTeam?.id === team.id
                      ? 'bg-primary/10 border-primary'
                      : 'bg-background hover:bg-accent'
                  } border`}
                >
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    {team.name}
                  </div>
                  {selectedTeam?.id === team.id && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </button>
              ))}
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