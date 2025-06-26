import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Building2, Briefcase, FlaskConical } from 'lucide-react';

const MotivationCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = [
    {
      targetGroup: "Für den Landkreis",
      icon: <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
      color: "blue",
      title: "Vom Kostenfaktor zum strategischen Vermögenswert",
      content: (
        <p>
          Dieses Projekt wandelt eine Pflichtaufgabe in eine <strong>strategische Investition</strong> um. Internationale Studien belegen eine Rendite von 5-46 Euro je investiertem Euro in Datenqualität. Wir sichern die Zukunft unserer Seenlandschaft, steigern die Effizienz der Verwaltung und positionieren Vorpommern-Greifswald als digitale <strong>Modellregion</strong> für nachhaltiges, datengestütztes Management.
        </p>
      )
    },
    {
      targetGroup: "Für Unternehmen & Vereine",
      icon: <Briefcase className="w-8 h-8 text-green-600 dark:text-green-400" />,
      color: "green",
      title: "Motor für regionale Innovation und Wertschöpfung",
      content: (
        <p>
          Wir schaffen eine neue, frei verfügbare Ressource für die gesamte Region. Qualitätsgesicherte Daten sind die Grundlage für <strong>neue Geschäftsmodelle</strong>: von Tourismus-Apps über Präzisionslandwirtschaft bis hin zu smarten Diensten für Angel- und Wassersportvereine. Dies stärkt den Standort und bietet eine nie dagewesene <strong>Planungssicherheit</strong> für alle Akteure.
        </p>
      )
    },
    {
      targetGroup: "Für Forschung & Bildung",
      icon: <FlaskConical className="w-8 h-8 text-purple-600 dark:text-purple-400" />,
      color: "purple",
      title: "Ein digitales Labor für die Spitzenforschung",
      content: (
        <p>
          Wir errichten ein <strong>limnologisches Freiluft-Labor</strong>. Hochfrequente, validierte und nach internationalen Standards (FAIR-Prinzipien) bereitgestellte Langzeitdaten sind ein Datenschatz für die Wissenschaft. Sie ermöglichen Spitzenforschung zum Klimawandel, zur Modellierung von Ökosystemen und zur Entwicklung neuer Analysemethoden, direkt vor unserer Haustür.
        </p>
      )
    }
  ];

  const handleNext = () => setActiveIndex((prev) => (prev + 1) % slides.length);
  const handlePrev = () => setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);

  const currentSlide = slides[activeIndex];

  return (
    <div className={`relative bg-${currentSlide.color}-50 dark:bg-gray-900/50 border border-${currentSlide.color}-200 dark:border-${currentSlide.color}-700/50 rounded-lg p-6 transition-all duration-500`}>
      <div className="flex items-center space-x-4 mb-4">
        <div className={`bg-white dark:bg-gray-800 p-2 rounded-lg`}>
          {currentSlide.icon}
        </div>
        <div>
          <p className={`text-sm font-bold text-${currentSlide.color}-700 dark:text-${currentSlide.color}-300`}>{currentSlide.targetGroup}</p>
          <h4 className="text-lg font-bold text-gray-900 dark:text-white">{currentSlide.title}</h4>
        </div>
      </div>
      
      <div className="text-gray-700 dark:text-gray-300 text-sm min-h-[140px] md:min-h-[120px]">
         <div key={activeIndex} className="animate-in fade-in duration-500">
           {currentSlide.content}
         </div>
      </div>

      <div className="absolute bottom-4 left-6 flex space-x-2">
        {slides.map((_, index) => (
          <button 
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`w-2.5 h-2.5 rounded-full ${activeIndex === index ? `bg-${currentSlide.color}-500` : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'}`}
          />
        ))}
      </div>

      <div className="absolute top-4 right-4 flex space-x-2">
        <button onClick={handlePrev} className="p-1 rounded-full bg-white/50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-600">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button onClick={handleNext} className="p-1 rounded-full bg-white/50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-600">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default MotivationCarousel;