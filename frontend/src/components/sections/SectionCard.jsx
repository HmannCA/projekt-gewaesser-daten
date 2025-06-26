import React from 'react';
import { ChevronDown, MessageSquare } from 'lucide-react';
import CommentSection from '../shared/CommentSection.jsx';

const SectionCard = ({
  section,
  stepId,
  detailLevel,
  isExpanded,
  onToggle,
  comments,
  newComment,
  setNewComment,
  showComments,
  setShowComments,
  onSaveComment,
  onDeleteComment,
  currentUser,
  setModalImageUrl
}) => {
  const commentKey = `${stepId}-${section.id}`;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <h3 className="text-lg font-semibold">{section.title}</h3>
        <div className="flex items-center space-x-3">
          {comments.length > 0 && (
            <span className="flex items-center space-x-1 text-sm text-gray-500">
              <MessageSquare className="w-4 h-4" />
              <span>{comments.length}</span>
            </span>
          )}
          <ChevronDown className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </button>
      
      {isExpanded && (
        <div className="px-6 pb-6 animate-in slide-in-from-top duration-200">
          <div className="pt-4 border-t dark:border-gray-700">
            {section.content[detailLevel]}
          </div>
          
          <CommentSection
            commentKey={commentKey}
            comments={comments}
            showComments={showComments}
            setShowComments={setShowComments}
            newComment={newComment}
            setNewComment={setNewComment}
            onSaveComment={() => onSaveComment(stepId, section.id)}
            onDeleteComment={onDeleteComment}
            currentUser={currentUser}
            detailLevel={detailLevel}
          />
        </div>
      )}
    </div>
  );
};

export default SectionCard;