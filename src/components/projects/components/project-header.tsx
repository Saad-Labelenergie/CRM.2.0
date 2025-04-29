import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, Edit2, Trash2 } from 'lucide-react';
import { CheckCheckIcon } from 'lucide-react';

interface ProjectHeaderProps {
  onBack: () => void;
  projectName: string;
  clientName: string;
  status: string;
  onConfirmClick?: () => void;
}



export function ProjectHeader({ onBack, projectName, clientName,onConfirmClick }: ProjectHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-accent"
        >
          <ArrowLeft className="w-6 h-6" />
        </motion.button>
        <div>
          <h1 className="text-3xl font-bold text-primary">{projectName}</h1>
          <div className="flex items-center mt-1 text-muted-foreground">
            <Building2 className="w-4 h-4 mr-1" />
            {clientName}
          </div>
        </div>
      </div>
      
       <div className="flex items-center space-x-2">
        
       {onConfirmClick && (
        
  <motion.button
    whileHover={status !== 'confirmer' ? { scale: 1.05 } : {}}
    whileTap={status !== 'confirmer' ? { scale: 0.95 } : {}}
    onClick={() => status !== 'confirmer' && onConfirmClick()}
    disabled={status === 'confirmer'}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      status === 'confirmer'
        ? 'bg-muted text-muted-foreground cursor-not-allowed'
        : 'bg-black text-white hover:bg-gray-500'
    }`}
  >
    <CheckCheckIcon /> Confirmer le chantier
    
  </motion.button>
  
)}



        {/* <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
        >
          <Edit2 className="w-5 h-5 text-muted-foreground" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
        >
          <Trash2 className="w-5 h-5 text-destructive" />
        </motion.button> */}
      </div> 
    </div>
  );
}