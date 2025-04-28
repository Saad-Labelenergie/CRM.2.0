import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquareIcon, PlusIcon, UsersIcon } from 'lucide-react';
import { format } from 'date-fns';
import { db } from '../../../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';


interface Comment {
  id: string;
  authorName: string;
  date: string;
  content: string;
}

interface ProjectCommentsProps {
  projectId: string;
}

export function ProjectComments({ projectId }: ProjectCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [showAllComments, setShowAllComments] = useState(false);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [addingComment, setAddingComment] = useState(false);

  useEffect(() => {
    async function fetchComments() {
      const productRef = doc(db, 'projects', projectId);
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        const data = productSnap.data();
        setComments(data.commentaires || []);
      }
    }
    fetchComments();
  }, [projectId]);

  const handleAddComment = async () => {
    if (!newCommentContent.trim()) return;
  
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      console.error('Aucun utilisateur connecté');
      return;
    }
    
    const userData = JSON.parse(storedUser);
  
    const projectRef = doc(db, 'projects', projectId);
    const projectSnap = await getDoc(projectRef);
  
    if (!projectSnap.exists()) {
      console.error('Projet introuvable.');
      return;
    }
  
    const projectData = projectSnap.data();
    const existingComments = Array.isArray(projectData.commentaires) ? projectData.commentaires : [];
  
    const newComment: Comment = {
      id: Math.random().toString(36).substring(2, 15),
      authorName: userData.name || userData.email || 'Utilisateur',
      date: new Date().toISOString(),
      content: newCommentContent.trim(),
    };
  
    const updatedComments = [newComment, ...existingComments];
  
    await updateDoc(projectRef, { commentaires: updatedComments });
  
    setComments(updatedComments);
    setNewCommentContent('');
    setAddingComment(false);
  };
  

  return (
    <motion.div whileHover={{ y: -5 }} className="bg-card p-6 rounded-xl shadow-lg border border-border/50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center">
          <MessageSquareIcon className="w-5 h-5 mr-2 text-orange-500" />
          Commentaires
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setAddingComment(!addingComment)}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
        </motion.button>
      </div>

      {addingComment && (
        <div className="mb-4 space-y-2">
          <input
            type="text"
            placeholder="Écrivez votre commentaire..."
            value={newCommentContent}
            onChange={(e) => setNewCommentContent(e.target.value)}
            className="w-full p-2 border rounded-lg"
          />
          <button
            onClick={handleAddComment}
            className="w-full py-2 px-4 bg-primary hover:bg-primary/80 text-white font-medium rounded-lg transition-colors"
          >
            Publier
          </button>
        </div>
      )}

      <div className="space-y-4">
        {(showAllComments ? comments : comments.slice(0, 2)).map((comment) => (
          <div key={comment.id} className="p-3 bg-accent/50 rounded-lg">
            <div className="flex items-center text-sm text-muted-foreground">
              <UsersIcon className="w-4 h-4 mr-1" />
              {comment.authorName}

              <span className="mx-2">•</span>
              {format(new Date(comment.date), 'dd/MM/yyyy HH:mm')}
            </div>
            <p className="mt-2 text-sm">{comment.content}</p>
          </div>
        ))}

        {comments.length > 2 && (
          <button
            onClick={() => setShowAllComments((prev) => !prev)}
            className="w-full px-4 py-2 bg-accent hover:bg-accent/80 rounded-lg flex items-center justify-center text-sm font-medium transition-colors"
          >
            {showAllComments ? 'Voir moins' : 'Voir plus'}
          </button>
        )}
      </div>
    </motion.div>
  );
}
