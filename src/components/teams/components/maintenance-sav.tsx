import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Wrench } from 'lucide-react';

export function MaintenanceSAV() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
      >
        <h3 className="text-xl font-semibold mb-6 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 text-yellow-500" />
          SAV et Incidents
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
            <span>Total SAV</span>
            <span className="font-bold">15</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
            <span>Taux de résolution</span>
            <span className="font-bold text-green-500">92%</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
            <span>Temps moyen de résolution</span>
            <span className="font-bold">48h</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
            <span>SAV en cours</span>
            <span className="font-bold text-orange-500">2</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        whileHover={{ y: -5 }}
        className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
      >
        <h3 className="text-xl font-semibold mb-6 flex items-center">
          <Wrench className="w-5 h-5 mr-2 text-blue-500" />
          Maintenance et Formation
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
            <span>Statut de l'équipe</span>
            <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm">
              Actif
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
            <span>Dernière formation</span>
            <div className="text-right">
              <span className="block font-medium">Sécurité</span>
              <span className="text-sm text-muted-foreground">15/01/2024</span>
            </div>
          </div>
          <div className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
            <span>Maintenance véhicule</span>
            <div className="text-right">
              <span className="block font-medium">28/02/2024</span>
              <span className="text-sm text-muted-foreground">Dans 15 jours</span>
            </div>
          </div>
          <div className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
            <span>Certifications à jour</span>
            <span className="font-bold text-green-500">100%</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}