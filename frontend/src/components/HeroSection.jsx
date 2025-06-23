// src/components/HeroSection.jsx
import React from 'react';
import { ShieldCheck, TrendingUp, Cpu } from 'lucide-react';

const HeroSection = () => {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl md:text-5xl">
          Digitalisierung als Chance:
        </h1>
        <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
          Wie wir mit offenen Daten die Zukunft des Landkreises gestalten & fördern.
        </p>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          
          {/* Wertversprechen 1: Entscheider */}
          <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <ShieldCheck className="w-8 h-8 text-blue-500" />
              <h3 className="text-lg font-bold">Für Entscheider & Politik</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Rechtssichere Entscheidungen treffen, Verwaltungsprozesse automatisieren und die öffentliche Sicherheit (z.B. Badewasserqualität) datengestützt gewährleisten.
            </p>
          </div>

          {/* Wertversprechen 2: Wirtschaft */}
          <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <h3 className="text-lg font-bold">Für Wirtschaft & Region</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Eine frei verfügbare Datengrundlage schaffen, die regionale Unternehmen und Start-ups für neue, innovative Geschäftsmodelle nutzen können.
            </p>
          </div>

          {/* Wertversprechen 3: Verwaltung */}
          <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <Cpu className="w-8 h-8 text-purple-500" />
              <h3 className="text-lg font-bold">Für die Verwaltung</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Interne Kompetenz aufbauen und nutzen, um unabhängig von teuren Fremdlösungen eine verlässliche und wissenschaftlich fundierte Datenvalidierung sicherzustellen.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HeroSection;