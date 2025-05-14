import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  Search,
  Filter,
  Plus,
  Trash,
  PenTool,
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HistoryEntry {
  id?: string;
  action: string;
  user: string;
  userId: string;
  clientName: string;
  clientId: string;
  details: string;
  previousValue?: string;
  newValue?: string;
  timestamp: Date;
}
interface User {
  userId: string;
  userName: string;
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

export function NotificationPopup() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string | null>(null);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [userFilter, setUserFilter] = useState<string | null>(null);
  const [isUserFilterMenuOpen, setIsUserFilterMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const historyQuery = query(
      collection(db, 'historique_dossier'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(historyQuery, (snapshot) => {
      const historyData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      })) as HistoryEntry[];
      
      // Extraire les utilisateurs uniques
      const uniqueUsers = historyData.reduce((acc: User[], entry) => {
        if (!acc.find(u => u.userId === entry.userId)) {
          acc.push({ userId: entry.userId, userName: entry.user });
        }
        return acc;
      }, []);
      setUsers(uniqueUsers);

      setHistory(historyData);
    });

    return () => unsubscribe();
  }, []);

  // Mettre à jour le filtre pour inclure les utilisateurs
  const filteredHistory = history.filter(entry => {
    const matchesSearch = 
      entry.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = !actionFilter || (
      (actionFilter === 'created' && entry.action === 'created') ||
      (actionFilter === 'modified' && (entry.action === 'modified' || entry.action === 'status_changed')) ||
      (actionFilter === 'deleted' && entry.action === 'deleted')
    );
    const matchesUser = !userFilter || entry.userId === userFilter;

    return matchesSearch && matchesAction && matchesUser;
  });


  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredHistory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Historique des Modifications</h1>
          <h2 className="text-1xl  text-primary">Suivez les modifications apportées aux dossiers clients</h2>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher dans l'historique..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
            className={`p-3 rounded-lg transition-colors hover:bg-accent border ${
              actionFilter ? 'text-primary border-primary' : 'border-border'
            }`}
          >
            <Filter className="w-5 h-5" />
          </motion.button>
          <AnimatePresence>
            {isFilterMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 top-full mt-2 w-48 bg-card rounded-lg shadow-lg border border-border z-50"
              >
                <div className="py-1">
                  <button 
                    className="flex items-center w-full px-4 py-2 text-sm hover:bg-accent"
                    onClick={() => {
                      setActionFilter('created');
                      setIsFilterMenuOpen(false);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2 text-green-500" />
                    Création
                  </button>
                  <button 
                    className="flex items-center w-full px-4 py-2 text-sm hover:bg-accent"
                    onClick={() => {
                      setActionFilter('modified');
                      setIsFilterMenuOpen(false);
                    }}
                  >
                    <PenTool className="w-4 h-4 mr-2 text-blue-500" />
                    Modification
                  </button>
                  <button 
                    className="flex items-center w-full px-4 py-2 text-sm hover:bg-accent"
                    onClick={() => {
                      setActionFilter('deleted');
                      setIsFilterMenuOpen(false);
                    }}
                  >
                    <Trash className="w-4 h-4 mr-2 text-red-500" />
                    Suppression
                  </button>
                  <button 
                    className="flex items-center w-full px-4 py-2 text-sm hover:bg-accent"
                    onClick={() => {
                      setActionFilter(null);
                      setIsFilterMenuOpen(false);
                    }}
                  >
                    Toutes les actions
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsUserFilterMenuOpen(!isUserFilterMenuOpen)}
              className={`p-3 rounded-lg transition-colors hover:bg-accent border ${
                userFilter ? 'text-primary border-primary' : 'border-border'
              }`}
            >
              <User className="w-5 h-5" />
            </motion.button>
            <AnimatePresence>
              {isUserFilterMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-card rounded-lg shadow-lg border border-border z-50"
                >
                  <div className="py-1 max-h-60 overflow-y-auto">
                    <button 
                      className="flex items-center w-full px-4 py-2 text-sm hover:bg-accent"
                      onClick={() => {
                        setUserFilter(null);
                        setIsUserFilterMenuOpen(false);
                      }}
                    >
                      Tous les utilisateurs
                    </button>
                    {users.map(user => (
                      <button
                        key={user.userId}
                        className="flex items-center w-full px-4 py-2 text-sm hover:bg-accent"
                        onClick={() => {
                          setUserFilter(user.userId);
                          setIsUserFilterMenuOpen(false);
                        }}
                      >
                        {user.userName}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
        </div>
      </div>

      {/* History List */}
      <motion.div
        variants={containerVariants}
        className="bg-card rounded-xl shadow-lg border border-border overflow-hidden"
      >
        {currentItems.map((entry, index) => (
          <motion.div
            key={entry.id}
            variants={itemVariants}
            className="p-4 border-b border-border last:border-b-0 hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className={`p-2 rounded-lg ${
                  entry.action === 'created' ? 'bg-green-100 dark:bg-green-900/30' :
                  entry.action === 'deleted' ? 'bg-red-100 dark:bg-red-900/30' :
                  'bg-blue-100 dark:bg-blue-900/30'
                }`}>
                  {entry.action === 'created' && <Plus className="w-5 h-5 text-green-700 dark:text-green-300" />}
                  {entry.action === 'deleted' && <Trash className="w-5 h-5 text-red-700 dark:text-red-300" />}
                  {entry.action === 'modified' && <PenTool className="w-5 h-5 text-blue-700 dark:text-blue-300" />}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{entry.clientName}</span>
                    <span className="text-sm text-muted-foreground">par</span>
                    <span className="font-medium text-primary">{entry.user}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{entry.details}</p>
                  {(entry.previousValue || entry.newValue) && (
                    <div className="mt-2 text-sm">
                      {entry.previousValue && (
                        <span className="text-red-500 line-through mr-2">{entry.previousValue}</span>
                      )}
                      {entry.newValue && (
                        <span className="text-green-500">{entry.newValue}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {entry.timestamp.toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Pagination */}
      {filteredHistory.length > 0 && (
  <div className="sticky bottom-0 left-0 w-full bg-card border-t border-border py-3 px-4 shadow-md flex justify-between items-center z-10">
    {/* <span className="text-sm text-muted-foreground">
      Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, filteredHistory.length)} sur {filteredHistory.length} entrées
    </span> */}
    <div className="flex space-x-1">
      {Array.from({ length: totalPages }, (_, i) => (
        <motion.button
          key={i + 1}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCurrentPage(i + 1)}
          className={`px-3 py-1 text-sm rounded-lg transition-colors ${
            currentPage === i + 1
              ? 'bg-primary text-white'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          {i + 1}
        </motion.button>
      ))}
    </div>
  </div>
)}

    </motion.div>
  );
}