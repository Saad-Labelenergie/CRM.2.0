import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UserPlus, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Shield, 
  MoreVertical, 
  Edit2, 
  Trash2,
  Users as UsersIcon,
  TrendingUp 
} from 'lucide-react';
import { NewUserModal } from './components/new-user-modal';
import { useFirebase } from '../../lib/hooks/useFirebase';
import { EditUserModal } from './components/edit-user-modal';
import { UserDetailsModal } from './components/user-details-modal';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  phone: string;
  status: 'active' | 'inactive';
  avatar?: string;
  team?: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

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

// Remove the static userStats object at the top of the file
// const userStats = { ... }

export function Users() {
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const { data: users = [], loading, add: addUser, remove: removeUser, update: updateUser } = useFirebase<User>('users', { orderByField: 'name' });
  const [monthlyStats, setMonthlyStats] = useState<Array<{ month: string, count: number }>>([]);

  const calculateGrowth = () => {
    if (monthlyStats.length < 2) return '0.0';
    
    const currentCount = monthlyStats[monthlyStats.length - 1]?.count || 0;
    const previousCount = monthlyStats[monthlyStats.length - 2]?.count || currentCount;
    
    return ((currentCount / previousCount - 1) * 100).toFixed(1);
  };

  useEffect(() => {
    const calculateMonthlyStats = () => {      // Créer un tableau des 12 derniers mois
      const last12Months = Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
      }).reverse();
  
      // Initialiser les statistiques avec tous les mois à 0
      const initialStats = last12Months.reduce((acc, month) => {
        acc[month] = { month, count: 0 };
        return acc;
      }, {} as Record<string, { month: string, count: number }>);
  
      // Calculer les totaux cumulatifs
      const stats = users.reduce((acc, user) => {
        const userDate = new Date(user.createdAt);
        const userMonth = userDate.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
        
        // Mettre à jour tous les mois après la création de l'utilisateur
        last12Months.forEach(month => {
          const [m, y] = month.split(' ');
          const [userM, userY] = userMonth.split(' ');
          const monthDate = new Date(`${m} 20${y}`);
          const userMonthDate = new Date(`${userM} 20${userY}`);
          
          if (monthDate >= userMonthDate) {
            acc[month].count++;
          }
        });
        
        return acc;
      }, initialStats);
  
      const sortedStats = Object.values(stats);
      setMonthlyStats(sortedStats);
    };
  
    calculateMonthlyStats();
  }, [users]);

  // Dans la section du graphique, remplacer userStats.monthlyGrowth par monthlyStats
  <div className="mt-4">
    <div className="flex items-end justify-between h-12 gap-1">
      {monthlyStats.slice(-5).map((stat) => (
        <div
          key={stat.month}
          className="w-full bg-blue-500/20 rounded-t"
          style={{
            height: `${(stat.count / Math.max(...monthlyStats.map(s => s.count))) * 100}%`,
            transition: 'height 0.3s ease'
          }}
        />
      ))}
    </div>
    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
      {monthlyStats.slice(-5).map(stat => (
        <span key={stat.month}>{stat.month}</span>
      ))}
    </div>
  </div>

  const handleSaveUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addUser({
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      setIsNewUserModalOpen(false);
    } catch (error) {
      console.error('Error adding new user:', error);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await removeUser(userId);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleShowDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailsModalOpen(true);
  };

  const handleUpdateUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!selectedUser?.id) return;
    
    try {
      await updateUser(selectedUser.id, {
        ...userData,
        updatedAt: new Date()
      });
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <UserPlus className="w-12 h-12 mx-auto text-muted-foreground animate-pulse" />
          <h2 className="text-xl font-semibold mt-4">Loading users...</h2>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground mt-1">Gérez les accès et les rôles des utilisateurs</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsNewUserModalOpen(true)}
          className="flex items-center px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors shadow-lg"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Nouvel Utilisateur
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Utilisateurs</p>
              <h3 className="text-3xl font-bold mt-2">{users.length}</h3>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
              <UsersIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-end justify-between h-12 gap-1">
              {monthlyStats.slice(-5).map((stat) => (
                <div
                  key={stat.month}
                  className="w-full bg-blue-500/20 rounded-t"
                  style={{
                    height: `${(stat.count / Math.max(...monthlyStats.map(s => s.count))) * 100}%`,
                    transition: 'height 0.3s ease'
                  }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              {monthlyStats.slice(-5).map(stat => (
                <span key={stat.month}>{stat.month}</span>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Utilisateurs Actifs</p>
              <h3 className="text-3xl font-bold mt-2">
                {users.filter(user => user.status === 'active').length}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
              <UsersIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className={`h-2 rounded-full ${users.filter(user => user.status === 'active').length > 0 ? 'bg-green-500' : 'bg-red-500'} flex-1`}>
                <div 
                  className={`h-full rounded-full ${users.filter(user => user.status === 'active').length > 0 ? 'bg-green-300' : 'bg-red-300'}`}
                  style={{ 
                    width: `${(users.filter(user => user.status === 'active').length / users.length) * 100}%` 
                  }}
                />
              </div>
              <span className={`text-sm ${users.filter(user => user.status === 'active').length > 0 ? 'text-muted-foreground' : 'text-red-500'}`}>
                {users.filter(user => user.status === 'active').length} actifs
              </span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Dernière activité:</span>
              <span className="font-medium">
                {users.some(u => u.updatedAt) 
                  ? new Date(Math.max(...users.map(u => u.updatedAt.getTime()))).toLocaleDateString()
                  : 'Aucune activité'
                }
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Répartition par Rôle</p>
              <h3 className="text-3xl font-bold mt-2">
                {users.length}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
              <Shield className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Administrateurs:</span>
              <span className="font-medium">{users.filter(user => user.role === "Administrateur").length}</span>
            </div>
            <div className="flex justify-between">
              <span>Managers:</span>
              <span className="font-medium">{users.filter(user => user.role === "Manager").length}</span>
            </div>
            <div className="flex justify-between">
              <span>Techniciens:</span>
              <span className="font-medium">{users.filter(user => user.role === "Technicien").length}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Évolution Mensuelle</p>
              <h3 className="text-3xl font-bold mt-2">
                +{calculateGrowth()}%
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </motion.div>
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nouveaux ce mois</p>
              <h3 className="text-3xl font-bold mt-2">
                {users.filter(user => {
                  const now = new Date();
                  const userDate = new Date(user.createdAt);
                  return userDate.getMonth() === now.getMonth() && 
                         userDate.getFullYear() === now.getFullYear();
                }).length}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-500">
              <UserPlus className="w-6 h-6" />
            </div>
          </div>
        </motion.div>
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Départements</p>
              <h3 className="text-3xl font-bold mt-2">
                {new Set(users.map(user => user.department)).size}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Le plus grand: {
              Object.entries(
                users.reduce((acc, user) => ({
                  ...acc,
                  [user.department]: (acc[user.department] || 0) + 1
                }), {} as Record<string, number>)
              ).sort(([,a], [,b]) => b - a)[0]?.[0]
            }
          </div>
        </motion.div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <input
          type="text"
          placeholder="Rechercher un utilisateur..."
          className="w-full pl-12 pr-4 py-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
        />
      </div>

      <motion.div
        variants={containerVariants}
        className="grid gap-6"
      >
        {users.map((user) => (
          <motion.div
            key={`${user.id}-${user.updatedAt?.getTime()}`}
            variants={itemVariants}
            className="bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-lg">{user.name}</h3>
                  <div className="flex items-center mt-1">
                    <Shield className={`w-4 h-4 ${
                      user.role === "Administrateur" ? "text-blue-500" :
                      user.role === "Manager" ? "text-green-500" :
                      "text-orange-500"
                    }`} />
                    <span className="text-sm text-muted-foreground ml-1">{user.role}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEditUser(user)}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-muted-foreground" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDeleteUser(user.id)}
                  className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleShowDetails(user)}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                >
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </motion.button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{user.phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span>{user.department}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                user.status === 'active' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
              }`}>
                {user.status === 'active' ? 'Actif' : 'Inactif'}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <NewUserModal
        isOpen={isNewUserModalOpen}
        onClose={() => setIsNewUserModalOpen(false)}
        onSave={handleSaveUser}
      />

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdateUser}
        user={selectedUser}
      />

      <UserDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        user={selectedUser}
      />
    </motion.div>
  );
}