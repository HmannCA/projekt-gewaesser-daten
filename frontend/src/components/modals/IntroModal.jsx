import React, { useState } from 'react';
import { Sparkles, Info } from 'lucide-react';
import MotivationCarousel from '../shared/MotivationCarousel.jsx';

const IntroModal = ({ show, onClose }) => {
  const [step, setStep] = useState(1);

  const handleClose = () => {
    localStorage.setItem('hasSeenIntroModal', 'true');
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-in fade-in-20">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-[90%] flex flex-col">
        <div className="p-6 overflow-y-auto">
          {step === 1 && (
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg"><Sparkles className="w-6 h-6 text-blue-500" /></div>
                <h3 className="text-xl font-bold">Willkommen! Der Nutzen für unsere Region</h3>
              </div>
              <p className="text-sm mb-4">
                Entdecken Sie, warum die Aufbereitung von Wasserqualitätsdaten eine strategische Investition für den Landkreis, die regionale Wirtschaft und die Forschung ist.
              </p>
              <MotivationCarousel />
            </div>
          )}
          {step === 2 && (
             <div>
              <div className="flex items-center space-x-3 mb-4">
                 <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-lg"><Info className="w-6 h-6 text-green-500" /></div>
                <h3 className="text-xl font-bold">Kurzanleitung zur Seite</h3>
              </div>
              <p className="text-sm mb-3">Diese Anwendung ist in logische Prozessschritte unterteilt, die Sie auf verschiedene Weisen erkunden können:</p>
              <ul className="list-decimal list-outside pl-5 text-sm space-y-2">
                <li><b>Prozess-Schritte (links):</b> Die Hauptnavigation führt Sie chronologisch durch den gesamten Daten-Aufbereitungsprozess.</li>
                <li><b>Info-Level (oben rechts):</b> Wählen Sie Ihre Perspektive! Wechseln Sie zwischen "Überblick", "Details" und "Technik", um maßgeschneiderte Erklärungen und Darstellungen zu sehen.</li>
                <li><b>Detail-Ansichten (aufklappbare Bereiche):</b> Jeder Prozessschritt enthält aufklappbare Bereiche. Ein Klick auf einen Titel öffnet die detaillierten Inhalte.</li>
                <li><b>Interaktive Elemente:</b> Halten Sie Ausschau nach klickbaren Grafiken und "(Erklärung)"-Buttons, um noch tiefer in die Materie einzutauchen.</li>
              </ul>
            </div>
          )}
        </div>
        <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 border-t dark:border-gray-700">
          <button onClick={handleClose} className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:underline">Nicht mehr anzeigen</button>
          <div className="flex items-center space-x-2">
            {step === 2 && (
              <button onClick={() => setStep(1)} className="px-4 py-2 text-sm font-medium bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">Zurück</button>
            )}
            {step === 1 && (
              <button onClick={() => setStep(2)} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Weiter zur Anleitung</button>
            )}
             {step === 2 && (
              <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Schließen</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroModal;