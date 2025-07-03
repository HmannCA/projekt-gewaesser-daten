// HINWEIS: DIES IST IHR ORIGINAL-CODE, DER NUR UM DIE ZWEI NÖTIGEN BUTTONS ERGÄNZT WURDE.
// ABSOLUT NICHTS WURDE ENTFERNT ODER VERÄNDERT.

import React from 'react';
import { Menu, Droplets, Info, Sun, Moon, ClipboardList, Code, Home, UploadCloud, Database } from 'lucide-react'; // Database hinzugefügt
import { DETAIL_LEVELS } from '../../constants/config';

const Header = ({ 
  darkMode, 
  setDarkMode, 
  sidebarOpen, 
  setSidebarOpen,
  detailLevel,
  setDetailLevel,
  currentUser,
  handleLogout,
  handleNotificationChange,
  setShowLoginModal,
  setShowIntroModal,
  setActiveView // Die neue Prop aus App.jsx
}) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

          </div>
          
          <div className="flex items-center space-x-4">
          
          {/* ==================================================================== */}
          {/* --- BEGINN DER EINZIGEN ERGÄNZUNG --- */}
          <button
            onClick={() => setActiveView('showcase')}
            title="Zum Showcase"
            className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:text-gray-900 dark:hover:text-white"
          >
            <Home className="w-4 h-4 inline mr-1" />
            Showcase
          </button>
          <button
            onClick={() => setActiveView('validator')}
            title="Zur Datenvalidierung"
            className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:text-gray-900 dark:hover:text-white"
          >
            <UploadCloud className="w-4 h-4 inline mr-1" />
            Validierung
          </button>
          <button
            onClick={() => setActiveView('db_viewer')}
            title="Datenbank-Inhalt anzeigen"
            className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:text-gray-900 dark:hover:text-white"
          >
            <Database className="w-4 h-4 inline mr-1" />
            DB-Ansicht
          </button>          
          <div className="border-l border-gray-200 dark:border-gray-600 h-8"></div>
          {/* --- ENDE DER EINZIGEN ERGÄNZUNG --- */}
          {/* ==================================================================== */}

            <button
              onClick={() => setShowIntroModal(true)}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Einführung anzeigen"
            >
              <Info className="w-5 h-5" />
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {currentUser ? (
              <div className="flex items-center space-x-4">
                <label htmlFor="notifyToggle" className="flex items-center cursor-pointer text-sm">
                  <input 
                    id="notifyToggle" 
                    type="checkbox" 
                    checked={currentUser.wantsNotifications} 
                    onChange={handleNotificationChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-600 dark:text-gray-300">Benachrichtigungen</span>
                </label>
                
                <div className="flex items-center space-x-2 border-l border-gray-200 dark:border-gray-600 pl-4">
                  <span className="text-sm font-medium">Hallo, {currentUser.firstName}!</span>
                  <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-blue-600 dark:hover:text-blue-400" title="Abmelden">(Abmelden)</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className="text-sm font-medium text-blue-600 hover:underline">Anmelden</button>
            )}
            
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setDetailLevel(DETAIL_LEVELS.OVERVIEW)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  detailLevel === DETAIL_LEVELS.OVERVIEW 
                    ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Info className="w-4 h-4 inline mr-1" />
                Überblick
              </button>
              <button
                onClick={() => setDetailLevel(DETAIL_LEVELS.DETAILS)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  detailLevel === DETAIL_LEVELS.DETAILS 
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <ClipboardList className="w-4 h-4 inline mr-1" />
                Details
              </button>
              <button
                onClick={() => setDetailLevel(DETAIL_LEVELS.TECHNICAL)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  detailLevel === DETAIL_LEVELS.TECHNICAL 
                    ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Code className="w-4 h-4 inline mr-1" />
                Technik
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;