import React from 'react';
import { motion } from 'framer-motion';
import { 
  Boxes, 
  PackageCheck, 
  Package, 
  Clock, 
  PackageX,
  AlertTriangle,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';

interface Material {
  id: number;
  name: string;
  reference: string;
  quantity: number;
  installed?: number;
  unit: string;
  status: 'pending' | 'partial' | 'complete' | 'issue';
  notes?: string;
  installationStatus?: 'installed' | 'not_installed';
  installationIssue?: {
    reason: string;
    quantity: number;
  };
}

interface ProjectMaterialsProps {
  materials: Material[];
}

const installationIssueReasons = [
  "Matériel manquant",
  "Matériel endommagé",
  "Matériel non conforme",
  "Accès impossible",
  "Problème technique",
  "Report client",
  "Autre"
];

interface ProjectMaterialsProps {
  materials: Material[];
  onUpdate?: (materials: Material[]) => void;
}

export function ProjectMaterials({ materials: initialMaterials }: ProjectMaterialsProps) {
  const [materials, setMaterials] = React.useState(initialMaterials);

  const handleInstallationStatusChange = (materialId: number, status: 'installed' | 'not_installed') => {
    
    setMaterials(prevMaterials => prevMaterials.map(material => {
      if (material.id !== materialId) return material;

      if (status === 'installed') {
        return {
          ...material,
          installationStatus: 'installed',
          installed: material.quantity,
          status: 'complete',
          installationIssue: undefined
        };
      } else {
        return {
          ...material,
          installationStatus: 'not_installed',
          installed: 0,
          status: 'issue'
        };
      }
    }));
    
  };

  const handleInstallationIssueChange = (materialId: number, reason: string) => {
    setMaterials(prevMaterials => prevMaterials.map(material => {
      if (material.id !== materialId) return material;

      return {
        ...material,
        installationIssue: {
          reason,
          quantity: material.quantity
        }
      };
    }));
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
    >
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <Boxes className="w-5 h-5 mr-2 text-blue-500" />
        Produits
      </h2>
      <div className="space-y-4">
        {materials.map((material) => (
          <div
            key={material.id}
            className="p-4 bg-accent/50 rounded-lg space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{material.name}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Réf: {material.reference}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {material.installationStatus === 'installed' && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium flex items-center">
                    <PackageCheck className="w-3 h-3 mr-1" />
                    Installé
                  </span>
                )}
                {material.installationStatus === 'not_installed' && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-medium flex items-center">
                    <PackageX className="w-3 h-3 mr-1" />
                    Non installé
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="space-x-4">
                <span>
                  Prévu: <span className="font-medium">{material.quantity} {material.unit}(s)</span>
                </span>
                <span>
                  Installé: <span className="font-medium">{material.installed || 0} {material.unit}(s)</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Statut d'installation
                </label>
                <select
                  value={material.installationStatus || ''}
                  onChange={(e) => handleInstallationStatusChange(material.id, e.target.value as 'installed' | 'not_installed')}
                  className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                >
                  <option value="">Sélectionner un statut</option>
                  <option value="installed">Matériel installé</option>
                  <option value="not_installed">Matériel non installé</option>
                </select>
              </div>

              {material.installationStatus === 'not_installed' && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Raison
                  </label>
                  <select
                    value={material.installationIssue?.reason || ''}
                    onChange={(e) => handleInstallationIssueChange(material.id, e.target.value)}
                    className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    <option value="">Sélectionner une raison</option>
                    {installationIssueReasons.map((reason) => (
                      <option key={reason} value={reason}>{reason}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {material.installationStatus === 'not_installed' && material.installationIssue && (
              <div className="mt-4 flex items-start">
                <AlertTriangle className="w-4 h-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">
                  {material.quantity} {material.unit}(s) non installé(s) - Raison : {material.installationIssue.reason}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}