import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Search, Mail, Phone, MapPin, Building2, Shield, MoreVertical, Edit2, Trash2 } from 'lucide-react';
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
  location: string;
  status: 'active' | 'inactive';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

// const users = [
//   {
//     id: 1,
//     name: "Jean Dupont",
//     email: "jean.dupont@example.com",
//     role: "Administrateur",
//     department: "Direction",
//     phone: "+33 6 12 34 56 78",
//     location: "Paris",
//     status: "active",
//     avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
//   },
//   {
//     id: 2,
//     name: "Marie Martin",
//     email: "marie.martin@example.com",
//     role: "Manager",
//     department: "Ressources Humaines",
//     phone: "+33 6 23 45 67 89",
//     location: "Lyon",
//     status: "active",
//     avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
//   },
//   {
//     id: 3,
//     name: "Pierre Bernard",
//     email: "pierre.bernard@example.com",
//     role: "Technicien",
//     department: "Maintenance",
//     phone: "+33 6 34 56 78 90",
//     location: "Marseille",
//     status: "inactive",
//     avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
//   }
// ];

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

export function Users() {
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const { data: users, loading, add: addUser, remove: removeUser, update: updateUser } = useFirebase<User>('users', { orderByField: 'name' });

  const handleSaveUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'avatar'>) => {
    try {
      const defaultAvatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";
      
      await addUser({
        ...userData,
        avatar: defaultAvatar,
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

  const handleUpdateUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'avatar'>) => {
    if (!selectedUser?.id) return;
    
    try {
      await updateUser(selectedUser.id, {
        ...userData,
        // Keep the existing avatar
        avatar: selectedUser.avatar,
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
            // Use a composite key with timestamp to ensure uniqueness
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
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{user.phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{user.location}</span>
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
    </motion.div>
  );
}