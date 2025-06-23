import React, { useState } from 'react';
import { Layers, AlertTriangle, BookOpen, Search } from 'lucide-react'; // Search-Icon hinzugefügt

// Dies ist die aktualisierte, eigenständige Komponente.
// Sie können diesen gesamten Code in Ihre `AppShowcaseComponent.jsx` Datei kopieren.
function AppShowcaseComponent({ onImageClick }) { // <-- Prop hier empfangen
  const [activeTab, setActiveTab] = useState('buerger-app');

  const renderContent = () => {
    switch (activeTab) {
      case 'buerger-app':
        return (
          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg animate-fade-in">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Prototyp 1: Die "See-Check" App für Alle</h3>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300">Kernidee & Zielgruppe</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Eine intuitive "Go/No-Go"-App für Bürger und Familien. Sie beantwortet schnell und verständlich die Frage, ob ein See für Freizeitaktivitäten wie das Baden geeignet ist.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300">Kernfunktionen</h4>
                  <ul className="list-disc list-outside pl-5 mt-1 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>Übersichtskarte mit einfachem Ampelsystem (Grün/Gelb/Rot).</li>
                    <li>Detailansicht mit klarer Textaussage ("Baden empfohlen").</li>
                    <li>In "menschliche Sprache" übersetzte Messwerte (z.B. "Sichtigkeit: Klar").</li>
                    <li>7-Tage-Temperaturtrend zur besseren Planung.</li>
                  </ul>
                </div>
              </div>
              <div className="space-y-4">
                 <button onClick={() => onImageClick('/Mockup_1.png')} className="group block w-full text-left p-2 bg-gray-200 dark:bg-gray-700 rounded-lg transition-shadow hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                    <img src="/Mockup_1.png" alt="Startbildschirm der See-Check App" className="rounded-md shadow-lg w-full" />
                    <span className="text-xs text-center block mt-2 text-gray-500 group-hover:text-blue-500 transition-colors">Klicken zum Vergrößern</span>
                 </button>
              </div>
            </div>
          </div>
        );

      case 'profi-app':
        return (
          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg animate-fade-in">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Prototyp 2: Das "Petri-Profi" Dashboard</h3>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300">Kernidee & Zielgruppe</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Ein datenreiches Werkzeug für ambitionierte Angler und Wassersportler. Es übersetzt wissenschaftliche Daten in planungsrelevante Vorteile für den Fangerfolg.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300">Kernfunktionen</h4>
                  <ul className="list-disc list-outside pl-5 mt-1 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>Detailliertes Temperaturprofil nach Wassertiefe (Sprungschicht).</li>
                    <li>Widget-Ansicht für Sauerstoff, pH-Wert und Sichttiefe.</li>
                    <li>Highlight: Ein KI-gestützter "Beiss-Index" als Handlungsempfehlung.</li>
                    <li>Community-Karte zur Meldung und Anzeige von Fängen.</li>
                  </ul>
                </div>
              </div>
              <button onClick={() => onImageClick('/Mockup_2.png')} className="group block w-full text-left p-2 bg-gray-200 dark:bg-gray-700 rounded-lg transition-shadow hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                <img src="/Mockup_2.png" alt="Dashboard der Petri-Profi App" className="rounded-md shadow-lg w-full" />
                <span className="text-xs text-center block mt-2 text-gray-500 group-hover:text-blue-500 transition-colors">Klicken zum Vergrößern</span>
              </button>
            </div>
          </div>
        );

      case 'verwaltung-app':
        return (
          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg animate-fade-in">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Prototyp 3: Der "Digitale Lagebericht"</h3>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300">Kernidee & Zielgruppe</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Ein professionelles Kontrollzentrum für die Verwaltungsleitung. Der Fokus liegt auf Risiko-Management, Compliance und Effizienzsteigerung.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300">Kernfunktionen</h4>
                  <ul className="list-disc list-outside pl-5 mt-1 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>KPI-Leiste für den sofortigen Überblick über Gesamtstatus und Alarme.</li>
                    <li>Interaktive Lagekarte mit farbcodierten Gewässern.</li>
                    <li>Aktionszentrum zur Zuweisung von Aufgaben bei Grenzwertüberschreitungen.</li>
                    <li>Automatischer Berichts-Generator zur Erfüllung von Berichtspflichten.</li>
                  </ul>
                </div>
              </div>
              <button onClick={() => onImageClick('/Mockup_3.png')} className="group block w-full text-left p-2 bg-gray-200 dark:bg-gray-700 rounded-lg transition-shadow hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                <img src="/Mockup_3.png" alt="Dashboard des Digitalen Lageberichts" className="rounded-md shadow-lg w-full" />
                <span className="text-xs text-center block mt-2 text-gray-500 group-hover:text-blue-500 transition-colors">Klicken zum Vergrößern</span>
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getButtonClass = (tabName) => {
    return `px-4 py-2 font-semibold transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-t-md ${
      activeTab === tabName
        ? 'bg-gray-50 dark:bg-gray-800 text-blue-600 border-b-2 border-blue-600'
        : 'text-gray-500 hover:text-blue-600 hover:bg-gray-100/50 dark:hover:bg-gray-700/50'
    }`;
  };

  return (
    <div className="w-full">
      <div className="flex border-b border-gray-300 dark:border-gray-600 mb-[-1px]">
        <button className={getButtonClass('buerger-app')} onClick={() => setActiveTab('buerger-app')}>
          Für Bürger: "See-Check"
        </button>
        <button className={getButtonClass('profi-app')} onClick={() => setActiveTab('profi-app')}>
          Für Profis: "Petri-Profi"
        </button>
        <button className={getButtonClass('verwaltung-app')} onClick={() => setActiveTab('verwaltung-app')}>
          Für Verwaltung: "Lagebericht"
        </button>
      </div>
      <div className="mt-0">
        {renderContent()}
      </div>
    </div>
  );
}

export default AppShowcaseComponent;