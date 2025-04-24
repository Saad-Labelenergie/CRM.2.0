import React from 'react';
import logo from '/images/Logo Label Energie.jpg';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Building2,
  Package,
  Calendar as CalendarIcon,
  Bell,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  UserCog,
  Wrench,
  HardHat,
  PackageCheck,
  Search,
  FolderOpen,
  PenTool as Tool,
  LogOut ,
  TruckIcon
} from 'lucide-react';
import { X, Mail, Phone, Calendar, Shield } from 'lucide-react';
import { cn } from '../../lib/utils';
import { auth } from '../../lib/firebase'; 
import { NotificationPopup } from '../Notification/NotificationPopup';

const navigation = [
  { name: 'Tableau de bord', href: '/', icon: LayoutDashboard, roles: ['administrateur', 'technicien', 'manager'] },
  { name: 'Dossiers', href: '/clients', icon: FolderOpen, roles: ['administrateur'] },
  { name: 'Produits', href: '/products', icon: Package, roles: ['administrateur'] },
  { name: 'Planning', href: '/calendar', icon: CalendarIcon, roles: ['administrateur', 'technicien', 'manager'] },
  { name: 'Equipes', href: '/teams', icon: Users, roles: ['administrateur'] },
  { name: 'Chargements', href: '/loading', icon: PackageCheck, roles: ['administrateur', 'manager'] },
  { name: 'Chantiers', href: '/projects', icon: HardHat, roles: ['administrateur', 'technicien', 'manager'] },
  { name: 'SAV', href: '/sav', icon: Wrench, roles: ['administrateur', 'manager'] },
  { name: 'Entretien', href: '/maintenance', icon: Tool, roles: ['administrateur'] },
  { name: 'Utilisateurs', href: '/users', icon: UserCog, roles: ['administrateur','technicien'] },
  {name : 'Vehicules' , href:'/vehicule',icon:TruckIcon ,roles :['administrateur']}
];



export function Layout({ children }: { children: React.ReactNode }) {
  const [isNotificationOpen, setIsNotificationOpen] = React.useState(false);
const notificationRef = React.useRef(null);

// Fermer le popup si on clique ailleurs
React.useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    if (notificationRef.current && !(notificationRef.current as any).contains(event.target)) {
      setIsNotificationOpen(false);
    }
  }
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);

  const location = useLocation();
  const navigate = useNavigate();
  const [isDark, setIsDark] = React.useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  // Ajout du state ici, au début du composant
  const [isUserDetailsOpen, setIsUserDetailsOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('currentUser');
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const sidebarVariants = {
    expanded: {
      width: "280px",
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    collapsed: {
      width: "80px",
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };
     const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
     const userName = currentUser?.name || 'Utilisateur';
     const userRole = currentUser?.role.toLowerCase() || 'Administrateur';

    const filteredNavigation = navigation.filter(item => 
    item.roles.includes(userRole.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        <motion.div 
          initial="expanded"
          animate={isCollapsed ? "collapsed" : "expanded"}
          variants={sidebarVariants}
          className="relative bg-card border-r border-border/50 flex flex-col"
        >
          {/* Toggle button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-6 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:shadow-xl z-50"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </motion.button>

          <div className="flex items-center justify-center h-16 border-b border-border/50 overflow-hidden">
            <motion.div
              animate={{ opacity: isCollapsed ? 0 : 1, scale: isCollapsed ? 0.5 : 1 }}
              transition={{ duration: 0.2 }}
              className="flex items-center"
            >
              <div>
              <img src={logo} alt="Logo" className=" h-10" />
              </div>
            </motion.div>
          </div>

          <nav className="mt-6 flex-1 px-3">
                        {/* Ajout du message de bienvenue */}
                        {!isCollapsed && (
  <div className="mb-6">
    <h1 className="text-2xl font-semibold text-foreground">
      Bonjour, <span className="text-primary">{userName}</span>
    </h1>
    <p className="text-sm text-muted-foreground">
      Bienvenue sur votre tableau de bord
    </p>
  </div>
)}
            {filteredNavigation.map((item) => { // Utilisez filteredNavigation au lieu de navigation
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-3 my-1 text-sm font-medium transition-all duration-200 relative group rounded-lg",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <motion.span
                    animate={{ 
                      opacity: isCollapsed ? 0 : 1,
                      marginLeft: isCollapsed ? 0 : "0.75rem",
                      display: isCollapsed ? "none" : "block"
                    }}
                    transition={{ duration: 0.2 }}
                    className="whitespace-nowrap font-medium"
                  >
                    {item.name}
                  </motion.span>
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {item.name}
                    </div>
                  )}
                  {isActive && !isCollapsed && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute inset-0 rounded-lg bg-primary -z-10"
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bouton de déconnexion ajouté ici */}
          <div className="p-3 border-t border-border/50">
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "flex items-center w-full px-3 py-3 text-sm font-medium transition-all duration-200 rounded-lg",
                "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              )}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <motion.span
                animate={{ 
                  opacity: isCollapsed ? 0 : 1,
                  marginLeft: isCollapsed ? 0 : "0.75rem",
                  display: isCollapsed ? "none" : "block"
                }}
                transition={{ duration: 0.2 }}
                className="whitespace-nowrap font-medium"
              >
                Déconnexion
              </motion.span>
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-destructive text-destructive-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Déconnexion
                </div>
              )}
            </motion.button>
          </div>

          <div className="p-4 border-t border-border/50">
            <motion.div
              animate={{ opacity: isCollapsed ? 0 : 1 }}
              transition={{ duration: 0.2 }}
              className="text-xs text-muted-foreground text-center"
            >
              v1.0.0
            </motion.div>
          </div>
        </motion.div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="h-16 border-b border-border/50 bg-card flex items-center justify-between px-6">
            <AnimatePresence mode="wait">
              {isSearchOpen ? (
                <motion.div
                  key="search"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "100%" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex-1 mr-4"
                >
                  <input
                    autoFocus
                    type="search"
                    placeholder="Rechercher..."
                    className="w-full px-4 py-2 rounded-lg bg-background border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    onBlur={() => setIsSearchOpen(false)}
                  />
                </motion.div>
              ) : (
                <motion.button
                  key="searchIcon"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                >
                  <Search className="w-5 h-5 text-muted-foreground" />
                </motion.button>
              )}
            </AnimatePresence>

            <div className="flex items-center space-x-4">
              {/* <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsDark(!isDark)}
                className="p-2 rounded-lg hover:bg-accent transition-colors relative group"
              >
                <AnimatePresence mode="wait">
                  {isDark ? (
                    <motion.div
                      key="sun"
                      initial={{ opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sun className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ opacity: 0, rotate: 90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: -90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {isDark ? 'Mode clair' : 'Mode sombre'}
                </span>
              </motion.button> */}
              <div className="relative" ref={notificationRef}>
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
    className="p-2 rounded-lg hover:bg-accent transition-colors relative"
  >
    <Bell className="w-5 h-5" />
    <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
  </motion.button>

  <AnimatePresence>
    {isNotificationOpen && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute right-0 mt-2 w-[36rem] max-h-[600px] overflow-y-auto bg-popover border border-border rounded-xl shadow-lg z-50"
      >
        <NotificationPopup />
      </motion.div>
    )}
  </AnimatePresence>
</div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                onClick={() => setIsUserDetailsOpen(true)}
                className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center cursor-pointer"
              >
                <span className="text-sm font-medium">
                  {userName ? userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                </span>
              </motion.div>
            </div>
          </header>

          {/* Modal des détails utilisateur */}
          <AnimatePresence>
            {isUserDetailsOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-card w-full max-w-2xl rounded-xl p-6 shadow-xl m-4"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Mon Profil</h2>
                    <button 
                      onClick={() => setIsUserDetailsOpen(false)} 
                      className="p-2 hover:bg-accent rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-2xl font-bold">
                        {userName ? userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{currentUser.name}</h3>
                      <div className="flex items-center mt-1">
                        <Shield className={`w-5 h-5 ${
                          currentUser.role === "Administrateur" ? "text-blue-500" :
                          currentUser.role === "Manager" ? "text-green-500" :
                          "text-orange-500"
                        }`} />
                        <span className="text-lg ml-2">{currentUser.role}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">{currentUser.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Téléphone</p>
                          <p className="font-medium">{currentUser.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Building2 className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Équipe</p>
                          <p className="font-medium">{currentUser.team || 'Non assigné'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Building2 className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Département</p>
                          <p className="font-medium">{currentUser.department}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Date de création</p>
                          <p className="font-medium">
                            {new Date(currentUser.createdAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          currentUser.status === 'active' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                        }`}>
                          {currentUser.status === 'active' ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Page content */}
          <main className="flex-1 overflow-auto p-6">

            
            {/* Contenu des pages enfants */}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}