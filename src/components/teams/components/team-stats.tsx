import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Truck, Calendar, Award, Clock, PenSquare } from 'lucide-react';
import { EditSkillsModal } from './edit-skills-modal';
import { EditContractModal } from './edit-contract-modal';

interface ContractDates {
  startDate: string;
  endDate: string | null;
}

export function TeamStats() {
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-muted-foreground">Membres</h3>
          <Users className="w-5 h-5 text-blue-500" />
        </div>
        <p className="text-2xl font-bold mt-2">0 personnes</p>
        <p className="text-sm text-muted-foreground mt-1">Aucun membre assigné</p>
      </motion.div>

      <motion.div
        whileHover={{ y: -5 }}
        className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-muted-foreground">Véhicule</h3>
          <Truck className="w-5 h-5 text-green-500" />
        </div>
        <p className="text-2xl font-bold mt-2">Non assigné</p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm text-muted-foreground">-</p>
          <span className="text-sm text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded-full">
            En attente
          </span>
        </div>
      </motion.div>

      <motion.div
        whileHover={{ y: -5 }}
        className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-muted-foreground">Contrat</h3>
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsContractModalOpen(true)}
              className="p-1.5 hover:bg-accent rounded-lg transition-colors"
            >
              <PenSquare className="w-4 h-4 text-muted-foreground" />
            </motion.button>
            <Calendar className="w-5 h-5 text-purple-500" />
          </div>
        </div>
        <p className="text-lg font-semibold mt-2">
          {formatDate(contractDates.startDate)}
          {contractDates.endDate ? ` - ${formatDate(contractDates.endDate)}` : ' (Sans fin)'}
        </p>
        {contractDates.endDate && (
          <div className="flex items-center mt-1">
            <Clock className="w-4 h-4 text-muted-foreground mr-1" />
            <p className="text-sm text-muted-foreground">
              {getRemainingDays(contractDates.endDate)} jours restants
            </p>
          </div>
        )}
      </motion.div>

      <motion.div
        whileHover={{ y: -5 }}
        className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-muted-foreground">Compétences</h3>
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSkillsModalOpen(true)}
              className="p-1.5 hover:bg-accent rounded-lg transition-colors"
            >
              <PenSquare className="w-4 h-4 text-muted-foreground" />
            </motion.button>
            <Award className="w-5 h-5 text-orange-500" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {skills.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune compétence définie</p>
          ) : (
            skills.map((skill, index) => (
              <span
                key={index}
                className={`px-2 py-1 rounded-full text-sm ${
                  index % 3 === 0 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                  index % 3 === 1 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
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