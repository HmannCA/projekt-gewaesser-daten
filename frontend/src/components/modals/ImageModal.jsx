import React from 'react';
import { X } from 'lucide-react';

const ImageModal = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-in fade-in-20"
      onClick={onClose}
    >
      <div 
        className="relative max-w-6xl w-[90%] p-4"
        onClick={(e) => e.stopPropagation()} 
      >
        <button 
          onClick={onClose}
          className="absolute top-0 right-0 bg-white dark:bg-gray-800 rounded-full p-1.5 shadow-lg hover:scale-110 transition-transform"
        >
          <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        <img src={imageUrl} alt="Vergrößerte Ansicht des Prozessdiagramms" className="w-full h-auto max-h-[90vh] object-contain rounded-lg" />
      </div>
    </div>
  );
};

export default ImageModal;