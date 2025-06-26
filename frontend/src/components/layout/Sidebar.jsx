import React from 'react';

const Sidebar = ({ 
  sidebarOpen, 
  filteredSteps, 
  activeStep, 
  setActiveStep, 
  searchTerm, 
  setSearchTerm 
}) => {
  return (
    <aside className={`${sidebarOpen ? 'block' : 'hidden'} lg:block w-64 bg-white dark:bg-gray-800 shadow-md min-h-screen`}>
      <div className="p-4">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        
        <nav className="space-y-2">
          {filteredSteps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(index)}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center space-x-2 ${
                activeStep === index 
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {step.icon}
              <span className="text-sm font-medium">{step.title}</span>
            </button>
          ))}
        </nav>

        <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <h3 className="font-semibold text-sm mb-2">Projektfortschritt</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Konzeption</span>
              <span className="text-green-600 dark:text-green-400">✓</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Implementierung</span>
              <span className="text-yellow-600 dark:text-yellow-400">...</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Testing</span>
              <span className="text-gray-400">-</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;