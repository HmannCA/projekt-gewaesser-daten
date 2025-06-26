import React from 'react';
import { MessageSquare, User, Send, X, Calendar } from 'lucide-react';
import { getLevelColor } from '../../constants/config.js';

const CommentSection = ({
  commentKey,
  comments,
  showComments,
  setShowComments,
  newComment,
  setNewComment,
  onSaveComment,
  onDeleteComment,
  currentUser,
  detailLevel
}) => {
  return (
    <div className="mt-6 pt-6 border-t dark:border-gray-700">
      <button
        onClick={() => setShowComments({ ...showComments, [commentKey]: !showComments[commentKey] })}
        className="flex items-center space-x-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
      >
        <MessageSquare className="w-4 h-4" />
        <span>Diskussion & Zusammenarbeit ({comments.length})</span>
      </button>
      
      {showComments[commentKey] && (
        <div className="mt-4 space-y-3">
          {comments
            .filter(comment => comment && typeof comment === 'object' && comment.id)
            .map((comment) => {
              const authorName = (comment.author && typeof comment.author === 'object') 
                ? comment.author.firstName 
                : comment.author;

              return (
                <div key={comment.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg group relative">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">{authorName}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getLevelColor(comment.level)}`}>
                        {comment.level}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{comment.timestamp ? new Date(comment.timestamp).toLocaleString('de-DE') : ''}</span>
                    </span>
                  </div>
                  <p className="text-sm">{comment.text}</p>
                  
                  {currentUser && currentUser.email === 'Sven.Huettemann@kreis-vg.de' && (
                    <button 
                      onClick={() => onDeleteComment(comment.id)} 
                      className="absolute top-2 right-2 p-1 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-500 hover:bg-red-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Kommentar löschen"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          
          {currentUser ? (
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Kommentar hinzufügen..."
                value={newComment[commentKey] || ''}
                onChange={(e) => setNewComment({ ...newComment, [commentKey]: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && onSaveComment()}
                className="flex-1 px-3 py-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600"
              />
              <button
                onClick={onSaveComment}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">Bitte melden Sie sich an, um Kommentare zu schreiben.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentSection;