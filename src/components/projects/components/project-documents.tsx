import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileCheck, FileText, Check, X } from 'lucide-react';
import { updateProjectDocuments } from '../../../lib/hooks/useProjects';


interface DocumentOption {
  key: string;
  label: string;
}

interface ProjectDocumentsProps {
  projectId: string;
  documents: {
    pieceIdentite: boolean;
    avisImpot: boolean;
    taxeFonciere: boolean;
  };
}

const availableDocuments: DocumentOption[] = [
  { key: 'pieceIdentite', label: 'Pièce d’identité' },
  { key: 'avisImpot', label: 'Avis d’impôt' },
  { key: 'taxeFonciere', label: 'Taxe foncière' }
];

export function ProjectDocuments({ projectId, documents }: ProjectDocumentsProps) {
  const [localDocuments, setLocalDocuments] = useState(documents);
  const [loading, setLoading] = useState(false);

  const toggleDocument = async (key: string) => {
    const updatedDocuments = {
      ...localDocuments,
      [key]: !localDocuments[key as keyof typeof localDocuments]
    };
    setLocalDocuments(updatedDocuments);
    setLoading(true);
    try {
      await updateProjectDocuments(projectId, updatedDocuments);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <motion.div className="bg-card p-6 rounded-xl shadow-lg border border-border/50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center">
          <FileCheck className="w-5 h-5 mr-2 text-green-500" />
          Documents requis
        </h2>
      </div>
      <div className="space-y-4">
        {availableDocuments.map(doc => (
          <div
            key={doc.key}
            className="flex items-center justify-between p-4 bg-accent/50 rounded-lg"
          >
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-2 text-muted-foreground" />
              <span className="font-medium">{doc.label}</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
              onClick={() => toggleDocument(doc.key)}
              className={`p-2 rounded-lg transition-colors ${
                localDocuments[doc.key as keyof typeof localDocuments]
                  ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400'
              }`}
            >
              {localDocuments[doc.key as keyof typeof localDocuments] ? (
                <Check className="w-4 h-4" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </motion.button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
