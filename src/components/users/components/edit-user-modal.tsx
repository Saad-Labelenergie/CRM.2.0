import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Building2, Edit2 } from 'lucide-react';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';

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

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => void;
  user: User | null;
}

export function EditUserModal({ isOpen, onClose, onSave, user }: EditUserModalProps) {
  const [userData, setUserData] = useState<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    email: '',
    role: '',
    department: '',
    phone: '',
    location: '',
    status: 'active',
    avatar: ''
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setUserData({
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        location: user.location,
        status: user.status,
        avatar: user.avatar || ''
      });
      setPreviewImage(user.avatar || null);
    }
  }, [user]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    
    const reader = new FileReader();
    reader.onload = async () => {
      const imageDataUrl = reader.result as string;
      
      try {
        const storage = getStorage();
        console.log('Storage initialized:', storage.app.options); // Add this line
        
        const storageRef = ref(storage, `avatars/${user.id}/${Date.now()}.jpg`);
        
        const snapshot = await uploadString(storageRef, imageDataUrl, 'data_url');
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        setPreviewImage(downloadURL);
        setUserData(prev => ({
          ...prev,
          avatar: downloadURL
        }));
        
        console.log('Image téléchargée avec succès:', downloadURL);
      } catch (error) {
        console.error('Erreur lors du téléchargement:', error);
      }
    };
    
    reader.readAsDataURL(file);
};

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    // Ensure we're using the most up-to-date data
    const finalUserData = {
      ...userData,
      avatar: userData.avatar // Use userData.avatar directly as it's already synchronized
    };
    
    console.log('Submitting final data:', finalUserData);
    onSave(finalUserData);
    handleClose();
  };

  const handleClose = () => {
    setPreviewImage(null);
    onClose();
  };

  // Remove the floating JSX element and keep it only in the return statement
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card w-full max-w-lg rounded-xl p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Modifier l'utilisateur</h2>
              <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Add image upload section at the top */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <img
                    src={previewImage || userData.avatar}
                    alt={userData.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
                  />
                  <label 
                    htmlFor="avatar-upload" 
                    className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Click the edit icon to upload a new photo
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Nom complet</label>
                <input
                  type="text"
                  value={userData.name}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Rôle</label>
                  <select
                    value={userData.role}
                    onChange={(e) => setUserData({ ...userData, role: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
                  >
                    <option>Technicien</option>
                    <option>Manager</option>
                    <option>Administrateur</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Département</label>
                  <input
                    type="text"
                    value={userData.department}
                    onChange={(e) => setUserData({ ...userData, department: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={userData.phone}
                    onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Localisation</label>
                  <input
                    type="text"
                    value={userData.location}
                    onChange={(e) => setUserData({ ...userData, location: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Statut</label>
                <select
                  value={userData.status}
                  onChange={(e) => setUserData({ ...userData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
                >
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg hover:bg-accent"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}