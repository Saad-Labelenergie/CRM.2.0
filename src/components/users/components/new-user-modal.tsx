import { useState } from 'react';
import { X, Check,Edit2 } from 'lucide-react';
import { useScheduling } from '../../../lib/scheduling/scheduling-context';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
// Remove bcryptjs import and keep the local import
import { hashPassword } from '../../../lib/utils/password';
import { Eye, EyeOff } from 'lucide-react';

interface NewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: any) => void;
}

export function NewUserModal({ isOpen, onClose, onSave }: NewUserModalProps) {
  const { teams } = useScheduling();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    department: '',
    phone: '',
    status: 'active',
    team: '',
    avatar: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async () => {
      const imageDataUrl = reader.result as string;
      
      try {
        const compressedImage = await compressImage(imageDataUrl, 200);
        setPreviewImage(compressedImage);
        setUserData(prev => ({
          ...prev,
          avatar: compressedImage
        }));
      } catch (error) {
        console.error('Erreur lors du traitement de l\'image:', error);
        alert('Erreur lors du traitement de l\'image. Veuillez réessayer.');
      }
    };
    reader.readAsDataURL(file);
  };
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
      resolve(canvas.toDataURL('image/jpeg', 0.7)); 
    };
  });
};
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hashedPassword = await hashPassword(userData.password);
    onSave({
      ...userData,
      password: hashedPassword
    });
    setUserData({
      name: '',
      email: '',
      password: '',
      role: '',
      department: '',
      phone: '',
      status: 'active',
      team: '',
      avatar: ''
    });
    setPreviewImage(null);
  };
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black/50" onClick={onClose} />
          <div className="relative bg-card p-6 rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Nouvel Utilisateur</h2>
              <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Add image upload section at the top */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <img
                    src={previewImage || '/default-avatar.png'}
                    alt="Profile preview"
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
                  Click the edit icon to upload a profile photo
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nom</label>
                <input
                  type="text"
                  value={userData.name}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  className="w-full p-2 rounded-lg border bg-background"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  className="w-full p-2 rounded-lg border bg-background"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mot de passe</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={userData.password}
                    onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                    className="w-full p-2 pr-10 rounded-lg border bg-background"
                    required
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
              <div>
                <label className="block text-sm font-medium mb-1">Rôle</label>
                <select
                  value={userData.role}
                  onChange={(e) => setUserData({ ...userData, role: e.target.value })}
                  className="w-full p-2 rounded-lg border bg-background"
                  required
                >
                  <option value="">Sélectionner un rôle</option>
                  <option value="Administrateur">Administrateur</option>
                  <option value="manager">Manager</option>
                  <option value="Technicien">Technicien</option>
                </select>
              </div>
              {userData.role === 'Technicien' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Équipe</label>
                  <select
                    value={userData.team}
                    onChange={(e) => setUserData({ ...userData, team: e.target.value })}
                    className="w-full p-2 rounded-lg border bg-background"
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
                <label className="block text-sm font-medium mb-1">Département</label>
                <input
                  type="text"
                  value={userData.department}
                  onChange={(e) => setUserData({ ...userData, department: e.target.value })}
                  className="w-full p-2 rounded-lg border bg-background"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={userData.phone}
                  onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                  className="w-full p-2 rounded-lg border bg-background"
                  required
                />
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
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}