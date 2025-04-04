// Update imports to include useScheduling
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X,Edit2 } from 'lucide-react';
import { useScheduling } from '../../../lib/scheduling/scheduling-context';
import { Eye, EyeOff } from 'lucide-react';
import { hashPassword } from '../../../lib/utils/password';

// Update User interface
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  phone: string;
  status: 'active' | 'inactive';
  avatar?: string;
  team?: string; // Add team field
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
  const { teams } = useScheduling(); // Add teams from context
  const [userData, setUserData] = useState<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    email: '',
    role: '',
    department: '',
    phone: '',
    status: 'active',
    avatar: '',
    team: '' // Add team field
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
        status: user.status,
        avatar: user.avatar || '',
        team: user.team || '' // Add team field
      });
      setPreviewImage(user.avatar || null);
    }
  }, [user]);

  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  // Modifiez handleImageChange pour utiliser le bon chemin
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async () => {
      const imageDataUrl = reader.result as string;
      
      try {
        // Compression de l'image
        const compressedImage = await compressImage(imageDataUrl, 200); // Taille réduite à 200px
        
        // Mise à jour directe avec l'image en base64
        setPreviewImage(compressedImage);
        setUserData(prev => ({
          ...prev,
          avatar: compressedImage // Sauvegarde directe en base64
        }));
      } catch (error) {
        console.error('Erreur lors du traitement de l\'image:', error);
        alert('Erreur lors du traitement de l\'image. Veuillez réessayer.');
      }
    };
    reader.readAsDataURL(file);
  };

  // Ajouter la fonction de compression d'image
  const compressImage = (dataUrl: string, maxWidth: number): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compression JPEG à 70%
      };
    });
  };

  // Modifiez handleSubmit pour inclure le nouveau mot de passe
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const finalUserData = {
      ...userData,
      ...(newPassword && { password: await hashPassword(newPassword) })
    };
    
    onSave(finalUserData);
    setNewPassword('');
    onClose(); // Changed handleClose to onClose
  };

  // Ajoutez le champ de mot de passe dans le formulaire, après le champ email
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

              <div>
                <label className="block text-sm font-medium mb-1">Nouveau mot de passe (optionnel)</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 pr-10 rounded-lg border focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded-lg"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Rôle</label>
                  <select
                    value={userData.role}
                    onChange={(e) => setUserData({ ...userData, role: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Sélectionner un rôle</option>
                    <option value="technician">Technicien</option>
                    <option value="manager">Manager</option>
                    <option value="Administrateur">Administrateur</option>
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

              {userData.role === 'technician' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Équipe</label>
                  <select
                    value={userData.team}
                    onChange={(e) => setUserData({ ...userData, team: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
                    required
                  >
                    <option value="">Sélectionner une équipe</option>
                    {teams.filter(team => team.isActive).map(team => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

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