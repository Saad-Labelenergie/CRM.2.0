import React from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  Building2, 
  Calendar, 
  Shield, 
  ArrowLeft,
  Edit,
  User,
  MapPin,
  Briefcase,
  Clock,
  BadgeCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function UserProfile() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const userName = currentUser?.name || 'Utilisateur';
  const userRole = currentUser?.role || 'Utilisateur';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto"
    >
      {/* Header with back button */}
      <div className="flex items-center mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-1" /> Retour
        </button>
      </div>

      {/* Profile header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 mb-8 shadow-lg">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Remplacer le div de l'avatar par une image si disponible */}
          {currentUser.avatar ? (
            <img 
              src={currentUser.avatar} 
              alt={userName}
              className="w-32 h-32 rounded-full object-cover shadow-inner"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center shadow-inner">
              <span className="text-4xl font-bold text-primary">
                {userName ? userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
              </span>
            </div>
          )}
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold mb-2">{currentUser.name}</h1>
            
            <div className="flex items-center justify-center md:justify-start mb-4">
              <Shield className={`w-5 h-5 ${
                userRole === "Administrateur" ? "text-blue-500" :
                userRole === "Manager" ? "text-green-500" :
                "text-orange-500"
              }`} />
              <span className="ml-2 font-medium">{userRole}</span>
            </div>
            
            <p className="text-muted-foreground max-w-xl">
              Membre de l'équipe depuis {currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              }) : 'Non disponible'}
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-end">
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              currentUser.status === 'active' 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
            }`}>
              {currentUser.status === 'active' ? 'Actif' : 'Inactif'}
            </span>
            
            <button className="mt-4 flex items-center gap-2 text-primary hover:underline">
              <Edit className="w-4 h-4" />
              Modifier mon profil
            </button>
          </div>
        </div>
      </div>

      {/* Profile content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact information */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl p-6 shadow-md border border-border/50"
        >
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <User className="w-5 h-5 mr-2 text-primary" />
            Informations de contact
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <Mail className="w-5 h-5 text-muted-foreground mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{currentUser.email || 'Non spécifié'}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Phone className="w-5 h-5 text-muted-foreground mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Téléphone</p>
                <p className="font-medium">{currentUser.phone || 'Non spécifié'}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <MapPin className="w-5 h-5 text-muted-foreground mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Adresse</p>
                <p className="font-medium">{currentUser.address || 'Non spécifiée'}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Professional information */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl p-6 shadow-md border border-border/50"
        >
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <Briefcase className="w-5 h-5 mr-2 text-primary" />
            Informations professionnelles
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <Building2 className="w-5 h-5 text-muted-foreground mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Équipe</p>
                <p className="font-medium">{currentUser.team || 'Non assigné'}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Building2 className="w-5 h-5 text-muted-foreground mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Département</p>
                <p className="font-medium">{currentUser.department || 'Non spécifié'}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <BadgeCheck className="w-5 h-5 text-muted-foreground mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Rôle</p>
                <p className="font-medium">{currentUser.role || 'Utilisateur'}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Account information */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl p-6 shadow-md border border-border/50"
        >
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-primary" />
            Informations du compte
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <Calendar className="w-5 h-5 text-muted-foreground mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Date de création</p>
                <p className="font-medium">
                  {currentUser.createdAt ? 
                    new Date(currentUser.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    }) : 'Non disponible'}
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Calendar className="w-5 h-5 text-muted-foreground mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Dernière connexion</p>
                <p className="font-medium">
                  {currentUser.lastLogin ? 
                    new Date(currentUser.lastLogin).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Non disponible'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent activity section */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 bg-card rounded-xl p-6 shadow-md border border-border/50"
      >
        <h2 className="text-xl font-semibold mb-6">Activité récente</h2>
        
        {/* Placeholder for activity - can be replaced with actual data */}
        <div className="text-center py-8 text-muted-foreground">
          <p>Aucune activité récente à afficher</p>
        </div>
      </motion.div>
    </motion.div>
  );
}