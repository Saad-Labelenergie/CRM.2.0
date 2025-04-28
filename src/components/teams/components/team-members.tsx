import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Phone, Mail, MapPin, Calendar, UserPlus, Trash2 } from 'lucide-react';
import { EditMemberModal } from './edit-member-modal';
import { db } from '../../../lib/firebase';
import {
  updateDoc,
  doc,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  location: string;
  joinDate: string;
  avatar: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  avatar?: string;
  createdAt?: any;
}

interface TeamMembersProps {
  teamId: string;
}

export function TeamMembers({ teamId }: TeamMembersProps) {
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);

  const handleConfirmRemove = async () => {
    if (!memberToRemove) return;
    await handleRemoveMember(memberToRemove.id);
    setMemberToRemove(null);
  };
  const fetchMembers = async () => {
    try {
      const teamSnap = await getDoc(doc(db, 'teams', teamId));
      const teamData = teamSnap.data();
      const memberIds: string[] = teamData?.members || [];

      if (memberIds.length === 0) {
        setMembers([]);
        return;
      }

      const chunks = memberIds.reduce<string[][]>((acc, id, i) => {
        const groupIndex = Math.floor(i / 10);
        acc[groupIndex] = acc[groupIndex] || [];
        acc[groupIndex].push(id);
        return acc;
      }, []);

      const results = await Promise.all(
        chunks.map((chunk) =>
          getDocs(query(collection(db, 'users'), where('__name__', 'in', chunk)))
        )
      );

      const fetched = results
        .flatMap((snap) => snap.docs)
        .map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            role: data.role,
            location: data.department,
            joinDate: new Date(data.createdAt?.toDate?.() || Date.now()).toLocaleDateString(),
            avatar: data.avatar || '',
          };
        });

      setMembers(fetched);
    } catch (error) {
      console.error('Erreur chargement membres :', error);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [teamId]);

  const handleAddMember = async (user: User) => {
    try {
      await updateDoc(doc(db, 'users', user.id), {
        team: teamId,
        updatedAt: new Date(),
      });

      await updateDoc(doc(db, 'teams', teamId), {
        members: arrayUnion(user.id),
      });

      await fetchMembers();
    } catch (error) {
      console.error('Erreur assignation user → équipe :', error);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        team: null,
        updatedAt: new Date(),
      });

      await updateDoc(doc(db, 'teams', teamId), {
        members: arrayRemove(userId),
      });

      await fetchMembers();
    } catch (error) {
      console.error('Erreur retrait du membre de l\'équipe :', error);
    }
  };

  return (
    <motion.div className="bg-card p-6 rounded-xl shadow-lg border border-border/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center">
          <Users className="w-5 h-5 mr-2 text-purple-500" />
          Membres de l'équipe
        </h3>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setAddModalOpen(true)}
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
          <p className="text-muted-foreground">Commencez par ajouter des membres à l'équipe</p>
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
                  <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full object-cover" />
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
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMemberToRemove(member)}
                  className="absolute top-2 right-2 p-2 rounded-full hover:bg-red-500/10 text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </motion.div>
            ))}
              {memberToRemove && (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-card rounded-xl p-6 shadow-xl border border-border/50 w-full max-w-md mx-4"
      >
        <h2 className="text-lg font-semibold mb-4">Confirmer la suppression</h2>
        <p className="text-muted-foreground mb-6">
          Êtes-vous sûr de vouloir retirer <strong>{memberToRemove.name}</strong> de l'équipe ?
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setMemberToRemove(null)}
            className="px-4 py-2 rounded-lg bg-accent hover:bg-accent/80 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirmRemove}
            className="px-4 py-2 bg-destructive text-white rounded-lg hover:bg-destructive/90 transition-colors"
          >
            Confirmer
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
          </AnimatePresence>
        </div>
      )}

<EditMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleAddMember}
        existingMembers={members}
      />
    </motion.div>
    
    
  );
  
}
