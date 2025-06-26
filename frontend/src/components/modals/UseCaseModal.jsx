import React from 'react';
import { X } from 'lucide-react';

const UseCaseModal = ({ useCase, onClose }) => {
  if (!useCase) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-in fade-in-20" onClick={onClose}>
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-[90%] max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg">
              <useCase.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{useCase.title}</h3>
              <p className="text-sm text-gray-500">{useCase.target}</p>
            </div>
          </div>
          
          <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">Problemstellung</h4>
              <p>{useCase.details.problem}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">Lösungsansatz</h4>
              <p>{useCase.details.solution}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">Konkreter Nutzen</h4>
              <p>{useCase.details.benefit}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">Praxisbeispiele / Inspiration</h4>
              <p>{useCase.details.example}</p>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default UseCaseModal;