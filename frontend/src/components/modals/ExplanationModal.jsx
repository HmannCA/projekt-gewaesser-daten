import React from 'react';
import { X } from 'lucide-react';

const ExplanationModal = ({ explanation, onClose }) => {
  if (!explanation) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-in fade-in-20" onClick={onClose}>
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-[90%] max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{explanation.title}</h3>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {explanation.content}
          </div>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default ExplanationModal;