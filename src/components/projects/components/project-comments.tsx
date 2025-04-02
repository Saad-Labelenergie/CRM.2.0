import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Plus, Users } from 'lucide-react';
import { format } from 'date-fns';

interface Comment {
  id: number;
  author: string;
  date: string;
  content: string;
}

interface ProjectCommentsProps {
  comments: Comment[];
  showAllComments: boolean;
  onToggleShowAll: () => void;
}

export function ProjectComments({ comments, showAllComments, onToggleShowAll }: ProjectCommentsProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-orange-500" />
          Commentaires
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
        </motion.button>
      </div>
      <div className="space-y-4">
        {(showAllComments ? comments : comments.slice(0, 2)).map((comment) => (
          <div
            key={comment.id}
            className="p-3 bg-accent/50 rounded-lg"
          >
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="w-4 h-4 mr-1" />
              {comment.author}
              <span className="mx-2">•</span>
              {format(new Date(comment.date), 'dd/MM/yyyy HH:mm')}
            </div>
            <p className="mt-2 text-sm">{comment.content}</p>
          </div>
        ))}
        {comments.length > 2 && (
          <button
            onClick={onToggleShowAll}
            className="w-full px-4 py-2 bg-accent hover:bg-accent/80 rounded-lg flex items-center justify-center text-sm font-medium transition-colors"
          >
            {showAllComments ? 'Voir moins' : 'Voir plus'}
          </button>
        )}
      </div>
    </motion.div>
  );
}