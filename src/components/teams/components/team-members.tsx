import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Phone, Mail, MapPin, Calendar, UserPlus } from 'lucide-react';
import { EditMemberModal } from './edit-member-modal';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  phone: string;
  email: string;
  location: string;
  joinDate: string;
  avatar: string;
}

export function TeamMembers() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [members, setMembers] = useState<TeamMember[]>([]);

  const handleAddMember = (newMember: Omit<TeamMember, 'id'>) => {
    const id = Math.max(0, ...members.map(m => m.id)) + 1;
    setMembers([...members, { ...newMember, id }]);
  };

  const handleRemoveMember = (id: number) => {
    setMembers(members.filter(member => member.id !== id));
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center">
          <Users className="w-5 h-5 mr-2 text-purple-500" />
          Membres de l'équipe
        </h3>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Ajouter un membre
        </motion.button>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Aucun membre</h3>
          <p className="text-muted-foreground">
            Commencez par ajouter des membres à l'équipe
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {members.map((member) => (
              <motion.div
                key={member.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.02 }}
                className="bg-accent/50 rounded-xl p-4 space-y-4 relative group"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-medium">{member.name}</h4>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{member.phone}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>{member.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{member.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Depuis le {member.joinDate}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <EditMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddMember}
      />
    </motion.div>
  );
}