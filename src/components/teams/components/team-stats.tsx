import React, { useState,useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Truck, Calendar, Award, Clock, PenSquare } from 'lucide-react';
import { EditSkillsModal } from './edit-skills-modal';
import { EditContractModal } from './edit-contract-modal';
import { db } from '../../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';


interface ContractDates {
  startDate: string;
  endDate: string | null;
}
interface Team {
  id: string;
  name: string;
  members?: string[];
}

interface TeamStatsProps {
  team: Team;
}

export function TeamStats({team}:TeamStatsProps) {
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  
  const [vehicules, setVehicules] = useState<any[]>([]);

  const [contractDates, setContractDates] = useState<ContractDates>({
    startDate: new Date().toISOString().split('T')[0],
    endDate: null
  });

  const handleSaveSkills = (newSkills: string[]) => {
    setSkills(newSkills);
  };

  const handleSaveContractDates = (newDates: ContractDates) => {
    setContractDates(newDates);
  };
  useEffect(() => {
    const fetchVehicules = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'vehicules'));
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setVehicules(list);
      } catch (err) {
        console.error('Erreur récupération véhicules :', err);
      }
    };
  
    fetchVehicules();
  }, []);

  const getVehiculeByTeam = (teamId: string | undefined) => {
    if (!teamId) return null;
    return vehicules.find(v => v.teamId === teamId);
  };
  

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const getRemainingDays = (endDate: string | null) => {
    if (!endDate) return null;
    
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Check if team is undefined or null
  if (!team) {
    return null; // Or return a loading skeleton/placeholder
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {/* Members Card */}
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-card p-6 rounded-xl shadow-lg border border-border/50 hover:border-primary/20 transition-all"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-muted-foreground/80 tracking-wide">Membres</h3>
          <Users className="w-6 h-6 text-blue-500/90" />
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-foreground">
            {team.members?.length || 0}
            <span className="text-base font-medium text-muted-foreground/80 ml-1">membres</span>
          </p>
          <p className="text-sm text-muted-foreground/70 flex items-center gap-1">
            <span className="h-2 w-2 bg-muted-foreground/30 rounded-full" />
            Aucun membre assigné
          </p>
        </div>
      </motion.div>

      {/* Vehicle Card */}
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-card p-6 rounded-xl shadow-lg border border-border/50 hover:border-primary/20 transition-all"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-muted-foreground/80 tracking-wide">Véhicule</h3>
          <Truck className="w-6 h-6 text-green-500/90" />
        </div>
        <div className="space-y-1">
          {(() => {
            const vehicule = getVehiculeByTeam(team.id);
            return (
              <>
                <p className="text-lg font-medium text-foreground truncate">
                  {vehicule?.modele || 'Non assigné'}
                </p>
                <p className="text-sm text-muted-foreground/70 font-mono">
                  {vehicule?.immatriculation || '–––'}
                </p>
              </>
            );
          })()}
        </div>
      </motion.div>

      {/* Contract Card */}
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-card p-6 rounded-xl shadow-lg border border-border/50 hover:border-primary/20 transition-all"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-muted-foreground/80 tracking-wide">Contrat</h3>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsContractModalOpen(true)}
              className="p-1.5 hover:bg-accent rounded-lg transition-colors group"
              title="Modifier le contrat"
            >
              <PenSquare className="w-5 h-5 text-muted-foreground/70 group-hover:text-primary" />
            </motion.button>
            <Calendar className="w-6 h-6 text-purple-500/90" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-lg font-semibold text-foreground">
              {formatDate(contractDates.startDate)}
            </p>
            <span className="text-muted-foreground/50">–</span>
            <p className="text-lg font-semibold text-foreground">
              {contractDates.endDate ? formatDate(contractDates.endDate) : '∞'}
            </p>
          </div>
          {contractDates.endDate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground/70">
              <Clock className="w-4 h-4" />
              <span>{getRemainingDays(contractDates.endDate)} jours restants</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Skills Card */}
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-card p-6 rounded-xl shadow-lg border border-border/50 hover:border-primary/20 transition-all"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-muted-foreground/80 tracking-wide">Compétences</h3>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSkillsModalOpen(true)}
              className="p-1.5 hover:bg-accent rounded-lg transition-colors group"
              title="Modifier les compétences"
            >
              <PenSquare className="w-5 h-5 text-muted-foreground/70 group-hover:text-primary" />
            </motion.button>
            <Award className="w-6 h-6 text-orange-500/90" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {skills.length === 0 ? (
            <p className="text-sm text-muted-foreground/70 italic">Aucune compétence définie</p>
          ) : (
            skills.map((skill, index) => (
              <span
                key={index}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
                  ${
                    index % 3 === 0 
                      ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 hover:bg-blue-500/20' :
                    index % 3 === 1 
                      ? 'bg-green-500/10 text-green-700 dark:text-green-300 hover:bg-green-500/20' :
                      'bg-purple-500/10 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20'
                  }`}
              >
                {skill}
              </span>
            ))
          )}
        </div>
      </motion.div>

      <EditSkillsModal
        isOpen={isSkillsModalOpen}
        onClose={() => setIsSkillsModalOpen(false)}
        currentSkills={skills}
        onSave={handleSaveSkills}
      />

      <EditContractModal
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        currentDates={contractDates}
        onSave={handleSaveContractDates}
      />
    </div>
  );
}