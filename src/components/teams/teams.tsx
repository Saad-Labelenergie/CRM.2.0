import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UserPlus, 
  Search, 
  Star, 
  Calendar, 
  Briefcase, 
  Users, 
  Truck, 
  Circle,
  Settings,
  Wrench,
  Power,
  TrendingUp,
  TrendingDown,
  BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NewTeamModal } from './components/new-team-modal';
import { ManageSkillsModal } from './components/manage-skills-modal';
import { ToggleTeamModal } from './components/toggle-team-modal';
import { useScheduling } from '../../lib/scheduling/scheduling-context';
import { Toast } from '../ui/toast';

const dashboardData = {
  totalTeams: 0,
  activeTeams: 0,
  inactiveTeams: 0,
  monthlyGrowth: [
    { month: 'Jan', count: 0 },
    { month: 'Fév', count: 0 },
    { month: 'Mar', count: 0 }
  ]
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

export function Teams() {
  const navigate = useNavigate();
  const { teams, toggleTeamActive, createTeam } = useScheduling();
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewTeamModalOpen, setIsNewTeamModalOpen] = useState(false);
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toggleModalData, setToggleModalData] = useState<{
    isOpen: boolean;
    teamId: string;
    teamName: string;
    isActive: boolean;
  }>({
    isOpen: false,
    teamId: '',
    teamName: '',
    isActive: false
  });
  

  const [skills, setSkills] = useState<string[]>([
    'Climatisation',
    'Chauffage',
    'Ventilation',
    'Maintenance',
    'Dépannage'
  ]);

  const lastMonth = dashboardData.monthlyGrowth[dashboardData.monthlyGrowth.length - 1];
  const previousMonth = dashboardData.monthlyGrowth[dashboardData.monthlyGrowth.length - 2];
  const growthPercentage = previousMonth.count === 0 ? 0 : ((lastMonth.count - previousMonth.count) / previousMonth.count * 100).toFixed(1);

  const handleCreateTeam = async (newTeam: any) => {
    try {
      await createTeam({
        name: newTeam.name,
        expertise: newTeam.expertise,
        isActive: true,
        color: newTeam.color,
        projects: [] // ← Initialisation du champ
      });
      
      setShowSuccessToast(true);
      setIsNewTeamModalOpen(false);
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  const handleSaveSkills = (newSkills: string[]) => {
    setSkills(newSkills);
  };

  const handleToggleTeam = (teamId: string, teamName: string, isActive: boolean) => {
    setToggleModalData({
      isOpen: true,
      teamId,
      teamName,
      isActive
    });
  };

  const handleConfirmToggle = () => {
    toggleTeamActive(toggleModalData.teamId);
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.expertise.some(exp => exp.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const renderDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <motion.div
        variants={itemVariants}
        className="bg-card rounded-xl p-6 shadow-lg border border-border/50"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-muted-foreground">Total des équipes</div>
            <div className="text-3xl font-bold mt-2">{teams.length}</div>
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-primary" />
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
          {Number(growthPercentage) > 0 ? (
            <>
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-500">+{growthPercentage}%</span>
            </>
          ) : (
            <>
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              <span className="text-red-500">{growthPercentage}%</span>
            </>
          )}
          <span className="text-muted-foreground ml-1">vs mois dernier</span>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="bg-card rounded-xl p-6 shadow-lg border border-border/50"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-medium text-muted-foreground">Statut des équipes</div>
          <Power className="w-5 h-5 text-orange-500" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2" />
              <span className="text-sm">Actives</span>
            </div>
            <span className="font-medium">{teams.filter(t => t.isActive).length}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-red-500 mr-2" />
              <span className="text-sm">Inactives</span>
            </div>
            <span className="font-medium">{teams.filter(t => !t.isActive).length}</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="bg-card rounded-xl p-6 shadow-lg border border-border/50"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-medium text-muted-foreground">Évolution mensuelle</div>
          <BarChart3 className="w-5 h-5 text-blue-500" />
        </div>
        <div className="flex items-end justify-between h-12">
          {dashboardData.monthlyGrowth.map((data, index) => (
            <div key={data.month} className="flex flex-col items-center">
              <div 
                className="w-8 bg-primary/10 rounded-t-lg"
                style={{
                  height: `${teams.length > 0 ? (data.count / teams.length) * 100 : 0}%`,
                  opacity: index === dashboardData.monthlyGrowth.length - 1 ? 1 : 0.5
                }}
              />
              <div className="mt-2 text-xs text-muted-foreground">{data.month}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Gestion des Équipes</h1>
          <p className="text-muted-foreground mt-1">Gérez vos équipes et leurs assignations</p>
        </div>
        <div className="flex items-center space-x-2">
          {/* <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsSkillsModalOpen(true)}
            className="flex items-center px-4 py-2.5 bg-accent hover:bg-accent/80 rounded-xl transition-colors"
          >
            <Wrench className="w-4 h-4 mr-2" />
            Compétences
          </motion.button> */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsNewTeamModalOpen(true)}
            className="flex items-center px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors shadow-lg"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Nouvelle Équipe
          </motion.button>
        </div>
      </div>

      {renderDashboard()}

      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <input
          type="text"
          placeholder="Rechercher une équipe..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
        />
      </div>

      {filteredTeams.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border/50">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Aucune équipe</h3>
          <p className="text-muted-foreground">
            Commencez par créer une nouvelle équipe en cliquant sur le bouton "Nouvelle Équipe"
          </p>
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredTeams.map((team) => (
            <motion.div
              key={team.id}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center relative">
                    <Users className="w-7 h-7 text-primary" />
                    <div 
                      className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background"
                      style={{ backgroundColor: team.color }}
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{team.name}</h3>
                    <div className="flex items-center mt-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm ml-1 text-muted-foreground">4.8</span>
                    </div>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleTeam(team.id, team.name, team.isActive);
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    team.isActive 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50'
                      : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'
                  }`}
                >
                  <Power className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="mt-6 space-y-4 relative group">
  <button
    onClick={() => navigate(`/teams/${team.id}`)}
    className="absolute inset-0 z-0 rounded-xl focus:outline-none"
    aria-label={`Voir les détails de ${team.name}`}
  />
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Users className="w-4 h-4 mr-2" />
                    <span>0 membres</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Briefcase className="w-4 h-4 mr-2" />
                    <span>0 projets actifs</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Disponible</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Truck className="w-4 h-4 mr-2" />
                    <span>Non assigné</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {team.expertise.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="text-sm text-muted-foreground">
                    Aucun membre assigné
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    team.isActive 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {team.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <NewTeamModal
        isOpen={isNewTeamModalOpen}
        onClose={() => setIsNewTeamModalOpen(false)}
        onSave={handleCreateTeam}
      />

      <ManageSkillsModal
        isOpen={isSkillsModalOpen}
        onClose={() => setIsSkillsModalOpen(false)}
        skills={skills}
        onSave={handleSaveSkills}
      />

      <ToggleTeamModal
        isOpen={toggleModalData.isOpen}
        onClose={() => setToggleModalData(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmToggle}
        teamName={toggleModalData.teamName}
        isActive={toggleModalData.isActive}
      />

      <Toast
        message="L'équipe a été créée avec succès !"
        isVisible={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
      />
    </motion.div>
  );
}