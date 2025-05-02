import React, { useState, useEffect } from 'react';
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
  BadgeCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, limit, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

// Add an interface for the login activity
interface LoginActivity {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  timestamp: any; // Using 'any' for Firestore timestamp
  action: string;
  deviceInfo: string;
  sessionId?: string; // Optional for backward compatibility
}

export function UserProfile() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const userName = currentUser?.name || 'Utilisateur';
  const userRole = currentUser?.role || 'Utilisateur';
  
  // Update the state with proper typing
  const [loginActivities, setLoginActivities] = useState<LoginActivity[]>([]);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('');
  
  // Fonction pour récupérer les activités
  const fetchLoginActivities = async () => {
    try {
      // Si l'utilisateur est connecté et a un ID
      if (currentUser?.id) {
        // Récupérer les activités de connexion depuis Firestore
        const activitiesRef = collection(db, 'loginActivities');
        
        // Utiliser directement l'approche de fallback pour éviter les erreurs d'index
        // jusqu'à ce que l'index soit créé dans Firebase
        const simpleQuery = showAllUsers && userRole === "Administrateur"
          ? query(activitiesRef, limit(50))
          : query(activitiesRef, where('userId', '==', currentUser.id), limit(20));
        
        const querySnapshot = await getDocs(simpleQuery);
        
        const activities: LoginActivity[] = [];
        querySnapshot.forEach((doc) => {
          activities.push({ id: doc.id, ...doc.data() } as LoginActivity);
        });
        
        // Trier manuellement par date décroissante
        activities.sort((a, b) => {
          const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
          const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
          return dateB.getTime() - dateA.getTime();
        });
        
        // Mettre à jour les informations de dernière connexion si nécessaire
        if (activities.length > 0 && activities[0].action === 'Connexion') {
          const lastLoginTimestamp = activities[0].timestamp?.toDate ? 
            activities[0].timestamp.toDate() : 
            new Date(activities[0].timestamp);
          
          // Mettre à jour l'objet currentUser dans le localStorage
          const updatedUser = {
            ...currentUser,
            lastLogin: lastLoginTimestamp
          };
          
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        }
        
        // Limiter les résultats
        setLoginActivities(activities.slice(0, showAllUsers ? 20 : 10));
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des activités de connexion:", error);
    }
  };

  // Fonction pour enregistrer une déconnexion manuelle
  const recordLogout = async () => {
    try {
      if (currentUser?.id) {
        const activityData = {
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          timestamp: new Date(),
          action: 'Déconnexion manuelle',
          deviceInfo: navigator.userAgent
        };
        
        await addDoc(collection(db, 'loginActivities'), activityData);
        console.log("Déconnexion manuelle enregistrée avec succès");
        
        // Rafraîchir les activités
        fetchLoginActivities();
      }
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la déconnexion manuelle:", error);
    }
  };

  // Fonction pour recréer la collection si nécessaire
  const recreateCollection = async () => {
    try {
      if (currentUser?.id) {
        const activityData = {
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          timestamp: new Date(),
          action: 'Recréation de collection',
          deviceInfo: navigator.userAgent
        };
        
        await addDoc(collection(db, 'loginActivities'), activityData);
        alert('Collection recréée avec succès');
        
        // Rafraîchir les activités
        fetchLoginActivities();
      }
    } catch (error) {
      console.error("Erreur lors de la recréation de la collection:", error);
      alert('Erreur lors de la recréation de la collection');
    }
  };

  // Fonction pour nettoyer les entrées en double
  const cleanupDuplicateEntries = async () => {
    try {
      if (currentUser?.id && userRole === "Administrateur") {
        // Récupérer toutes les activités
        const activitiesRef = collection(db, 'loginActivities');
        const q = query(activitiesRef, limit(1000));
        const querySnapshot = await getDocs(q);
        
        const activities: LoginActivity[] = [];
        querySnapshot.forEach((doc) => {
          activities.push({ id: doc.id, ...doc.data() } as LoginActivity);
        });
        
        // Identifier les doublons (même utilisateur, même action, même minute)
        const uniqueActivities = new Map();
        const duplicates: string[] = [];
        
        activities.forEach(activity => {
          const timestamp = activity.timestamp?.toDate ? 
            activity.timestamp.toDate() : 
            new Date(activity.timestamp);
          
          // Créer une clé unique basée sur l'utilisateur, l'action et l'heure arrondie à la minute
          const key = `${activity.userId}-${activity.action}-${timestamp.getFullYear()}-${timestamp.getMonth()}-${timestamp.getDate()}-${timestamp.getHours()}-${timestamp.getMinutes()}`;
          
          if (!uniqueActivities.has(key)) {
            uniqueActivities.set(key, activity.id);
          } else {
            // C'est un doublon
            duplicates.push(activity.id);
          }
        });
        
        // Supprimer les doublons
        let deletedCount = 0;
        if (duplicates.length > 0) {
          for (const docId of duplicates) {
            try {
              await deleteDoc(doc(db, 'loginActivities', docId));
              deletedCount++;
            } catch (deleteError) {
              console.error(`Erreur lors de la suppression du document ${docId}:`, deleteError);
            }
          }
        }
        
        // Enregistrer une activité de nettoyage
        const activityData = {
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          timestamp: new Date(),
          action: `Nettoyage (${deletedCount}/${duplicates.length} doublons supprimés)`,
          deviceInfo: navigator.userAgent
        };
        
        await addDoc(collection(db, 'loginActivities'), activityData);
        alert(`${deletedCount} doublons ont été supprimés avec succès sur ${duplicates.length} identifiés.`);
        
        // Rafraîchir les activités
        fetchLoginActivities();
      }
    } catch (error) {
      console.error("Erreur lors du nettoyage des doublons:", error);
      alert('Erreur lors du nettoyage des doublons');
    }
  };

  // Fonction pour vérifier et compléter les données utilisateur
  const checkAndUpdateUserData = async () => {
    try {
      if (currentUser?.id) {
        // Vérifier si les dates sont manquantes
        let needsUpdate = false;
        const updatedUser = { ...currentUser };
        
        // Si la date de création est manquante, utiliser la date actuelle
        if (!currentUser.createdAt) {
          updatedUser.createdAt = new Date().toISOString();
          needsUpdate = true;
        }
        
        // Si la dernière connexion est manquante, utiliser la date actuelle
        if (!currentUser.lastLogin) {
          updatedUser.lastLogin = new Date().toISOString();
          needsUpdate = true;
        }
        
        // Mettre à jour le localStorage si nécessaire
        if (needsUpdate) {
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          console.log("Données utilisateur mises à jour avec des valeurs par défaut pour les dates manquantes");
        }
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour des données utilisateur:", error);
    }
  };

  // Fonction pour filtrer les activités
  const filteredActivities = loginActivities.filter(activity => {
    const matchesSearch = searchTerm === '' || 
      activity.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (activity.deviceInfo && activity.deviceInfo.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterAction === '' || activity.action === filterAction;
    
    return matchesSearch && matchesFilter;
  });
  
  // Obtenir les actions uniques pour le filtre
  const uniqueActions = Array.from(new Set(loginActivities.map(activity => activity.action)));

  // Effet pour récupérer les activités de connexion depuis la base de données
  useEffect(() => {
    // Vérifier et mettre à jour les données utilisateur si nécessaire
    checkAndUpdateUserData();
    
    // Récupérer les activités une seule fois au chargement
    fetchLoginActivities();
    
    // Vérifier si c'est une nouvelle session ou un rafraîchissement
    const sessionId = sessionStorage.getItem('sessionId');
    const isNewSession = !sessionId;
    
    // Enregistrer cette connexion dans la base de données seulement si c'est une nouvelle session
    if (isNewSession) {
      const recordLoginActivity = async () => {
        try {
          if (currentUser?.id) {
            // Créer un ID de session unique
            const newSessionId = Date.now().toString();
            
            const activityData = {
              userId: currentUser.id,
              userName: currentUser.name,
              userRole: currentUser.role,
              timestamp: new Date(),
              action: 'Connexion',
              deviceInfo: navigator.userAgent,
              sessionId: newSessionId
            };
            
            await addDoc(collection(db, 'loginActivities'), activityData);
            
            // Marquer la session avec un ID unique
            sessionStorage.setItem('sessionId', newSessionId);
            
            // Rafraîchir les activités après l'ajout
            fetchLoginActivities();
          }
        } catch (error) {
          console.error("Erreur lors de l'enregistrement de l'activité de connexion:", error);
        }
      };
      
      recordLoginActivity();
    } else {
      console.log(`Session existante (${sessionId}), pas d'enregistrement d'activité`);
    }
  }, [currentUser]); // Removed showAllUsers from dependencies

  // Effet séparé pour réagir aux changements de showAllUsers
  useEffect(() => {
    fetchLoginActivities();
  }, [showAllUsers]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max mx-auto"
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
              Membre de l'équipe depuis {
                currentUser.createdAt && !isNaN(new Date(currentUser.createdAt).getTime()) ? 
                  new Date(currentUser.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  }) : 'Non disponible'
              }
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
              {/* <Edit className="w-4 h-4" /> */}
              {/* Modifier mon profil */}
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
                  {currentUser.createdAt && !isNaN(new Date(currentUser.createdAt).getTime()) ? 
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
                  {currentUser.lastLogin && !isNaN(new Date(currentUser.lastLogin).getTime()) ? 
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

      {/* Recent activity section - Only visible to Administrators */}
      {userRole === "Administrateur" && (
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-card rounded-xl p-6 shadow-md border border-border/50"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Activité récente</h2>
            <div className="flex gap-2">
              {userRole === "Administrateur" && (
                <>
                  <button 
                    onClick={() => {
                      setShowAllUsers((prev) => !prev);
                    }}
                    className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-secondary/90 transition-colors"
                  >
                    {showAllUsers ? "Voir mes activités" : "Voir toutes les activités"}
                  </button>
                  {/* <button 
                    onClick={recreateCollection}
                    className="px-3 py-1 bg-primary text-white rounded-md text-sm hover:bg-primary/90 transition-colors"
                  >
                    Recréer la collection
                  </button> */}
                  <button 
                    onClick={cleanupDuplicateEntries}
                    className="px-3 py-1 bg-yellow-500 text-white rounded-md text-sm hover:bg-yellow-600 transition-colors"
                  >
                    Nettoyer doublons
                  </button>
                </>
              )}
              {/* <button 
                onClick={recordLogout}
                className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition-colors"
              >
                Enregistrer déconnexion
              </button> */}
            </div>
          </div>
          
          {/* Search and filter controls */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Rechercher par nom, action ou appareil..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
                className="w-full px-4 py-2 pl-10 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <div className="w-full sm:w-64">
              <select
                value={filterAction}
                onChange={(e) => {
                  setFilterAction(e.target.value);
                  setCurrentPage(1); // Reset to first page on filter change
                }}
                className="w-full px-4 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Toutes les actions</option>
                {uniqueActions.map(action => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
            </div>
          </div>
          
          {filteredActivities.length > 0 ? (
            <>
              <div className="space-y-4">
                {filteredActivities.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((activity) => {
                  // Gérer les différents formats de timestamp
                  const timestamp = activity.timestamp?.toDate ? 
                    activity.timestamp.toDate() : 
                    new Date(activity.timestamp);
                  
                  return (
                    <div key={activity.id} className="flex items-start p-3 rounded-lg border border-border/50 hover:bg-accent/10 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="font-medium">{activity.action}</p>
                          <span className="text-xs text-muted-foreground">
                            {timestamp.toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          <span className={showAllUsers ? "font-medium" : ""}>{activity.userName}</span> - {timestamp.toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {activity.deviceInfo ? `Appareil: ${activity.deviceInfo.substring(0, 50)}...` : ''}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Pagination controls */}
              <div className="mt-6 flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
                <div className="flex items-center mb-4 sm:mb-0">
                  <span className="mr-2">Lignes par page:</span>
                  <select 
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1); // Reset to first page when changing items per page
                    }}
                    className="bg-background border rounded px-2 py-1"
                  >
                    {[5, 10, 15, 20, 25].map(value => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center">
                  <span className="mr-4">
                    Affichage de {Math.min((currentPage - 1) * itemsPerPage + 1, filteredActivities.length)} à {Math.min(currentPage * itemsPerPage, filteredActivities.length)} sur {filteredActivities.length}
                  </span>
                  
                  <div className="flex items-center">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-1 rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    {Array.from({ length: Math.min(3, Math.ceil(filteredActivities.length / itemsPerPage)) }, (_, i) => {
                      // Show pages around current page
                      let pageToShow = i + 1;
                      if (currentPage > 2 && Math.ceil(filteredActivities.length / itemsPerPage) > 3) {
                        pageToShow = currentPage - 1 + i;
                        if (pageToShow > Math.ceil(filteredActivities.length / itemsPerPage)) {
                          pageToShow = Math.ceil(filteredActivities.length / itemsPerPage) - (2 - i);
                        }
                      }
                      
                      return (
                        <button
                          key={pageToShow}
                          onClick={() => setCurrentPage(pageToShow)}
                          className={`w-8 h-8 mx-1 rounded-md ${
                            currentPage === pageToShow 
                              ? 'bg-primary text-primary-foreground' 
                              : 'hover:bg-accent'
                          }`}
                        >
                          {pageToShow}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredActivities.length / itemsPerPage)))}
                      disabled={currentPage === Math.ceil(filteredActivities.length / itemsPerPage)}
                      className="p-1 rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Aucune activité récente à afficher</p>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );}
