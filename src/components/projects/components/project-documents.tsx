import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileCheck, FileText, Check, X, Plus, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Document {
  id: number;
  name: string;
  status: 'received' | 'pending';
  date: string | null;
  isDefault?: boolean;
}

interface ProjectDocumentsProps {
  documents: Document[];
  onDocumentToggle: (docId: number) => void;
}

const availableDocuments = [
  { id: 4, name: "Acte notarié" },
  { id: 5, name: "Facture Energetique" }
];

export function ProjectDocuments({ documents: initialDocuments, onDocumentToggle }: ProjectDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [isAddingDocument, setIsAddingDocument] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleAddDocument = () => {
    if (!selectedDocument) {
      setError('Veuillez sélectionner un document');
      return;
    }

    const newDoc = availableDocuments.find(doc => doc.name === selectedDocument);
    if (!newDoc) return;

    setDocuments(prev => [...prev, {
      ...newDoc,
      status: 'pending',
      date: null
    }]);

    setSelectedDocument('');
    setIsAddingDocument(false);
    setError('');
  };

  const remainingDocuments = availableDocuments.filter(
    doc => !documents.some(d => d.name === doc.name)
  );

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center">
          <FileCheck className="w-5 h-5 mr-2 text-green-500" />
          Documents
        </h2>
        {remainingDocuments.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAddingDocument(true)}
            className="flex items-center px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Ajouter un document
          </motion.button>
        )}
      </div>

      <div className="space-y-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-4 bg-accent/50 rounded-lg"
          >
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-2 text-muted-foreground" />
              <span className="font-medium">{doc.name}</span>
              {doc.isDefault && (
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs">
                  Obligatoire
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {doc.date && (
                <span className="text-sm text-muted-foreground">
                  Reçu le {format(new Date(doc.date), 'dd/MM/yyyy')}
                </span>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDocumentToggle(doc.id)}
                className={`p-2 rounded-lg transition-colors ${
                  doc.status === 'received'
                    ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400'
                }`}
              >
                {doc.status === 'received' ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <X className="w-4 h-4" />
                )}
              </motion.button>
            </div>
          </div>
        ))}

        <AnimatePresence>
          {isAddingDocument && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-accent/50 rounded-lg"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Sélectionner un document
                  </label>
                  <select
                    value={selectedDocument}
                    onChange={(e) => {
                      setSelectedDocument(e.target.value);
                      setError('');
                    }}
                    className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Choisir un document</option>
                    {remainingDocuments.map(doc => (
                      <option key={doc.id} value={doc.name}>{doc.name}</option>
                    ))}
                  </select>
                  {error && (
                    <div className="mt-1 text-sm text-destructive flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {error}
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setIsAddingDocument(false);
                      setSelectedDocument('');
                      setError('');
                    }}
                    className="px-3 py-1.5 bg-accent hover:bg-accent/80 rounded-lg transition-colors text-sm"
                  >
                    Annuler
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddDocument}
                    className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
                  >
                    Ajouter
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}