import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronRight, ChevronLeft, Users, LayoutTemplate, Beaker, Building2, MessageSquare, Send, User, Calendar, ThumbsUp, Filter, Droplets, Activity, Database, Shield, Cloud, BarChart3, Info, CheckCircle2, AlertCircle, X, Menu, Sun, Moon, ClipboardList, Scale, BookCopy, Zap, Network, Sparkles, Code, NetworkIcon, Ship, Sprout, Lightbulb, Wrench, Fish, School, FileText, Map, Siren, Building, Briefcase, FlaskConical, Layers, Orbit } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, BarChart, Bar, ComposedChart, Area, ReferenceLine, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import bpmnProzessExperte from './assets/bpmn-prozess.png';
import bpmnProzessBuerger from './assets/bpmn-prozess-buerger.png';
import AppShowcaseComponent from './components/AppShowcaseComponent';
import HeroSection from './components/HeroSection';
import LoginModal from './components/LoginModal';

// NEUE, ROBUSTE DEFINITION der API-URL
// Prüft, ob wir im lokalen Entwicklungsmodus sind, indem sie den Hostnamen der Webseite ausliest.
const isDevelopment = window.location.hostname === 'localhost';

// Setzt die URL basierend auf der erkannten Umgebung
const API_BASE_URL = isDevelopment 
  ? '' // Im lokalen Entwicklungsmodus (localhost) ist die URL leer, damit der Vite-Proxy greift.
  : 'https://wasserqualitaet-vg-bitter-frost-7826.fly.dev'; // Die feste Live-URL des Backends.

//const API_URL = 'http://localhost:3001';

// Komponente für das interaktive Einführungs-Carousel
// Komponente für das interaktive Einführungs-Carousel
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

// KORRIGIERTE Komponente für das Einführungs-Modal


// Zentrales Objekt für alle Code-Erklärungen
const explanations = {
  validator: {
    title: "Was tut dieser Code? (Der intelligente Türsteher)",
    content: (
      <div className="space-y-3">
        <p>Dieser Code ist ein Bauplan (class) für einen intelligenten <strong>"Türsteher"</strong> für die Wasserdaten. Seine Aufgabe ist es, jeden einzelnen Messwert nach strengen Regeln zu prüfen.</p>
        <p>Er hat drei Hauptfähigkeiten (Methoden):</p>
        <ul className="list-disc list-outside pl-5">
          <li><strong>validate_range (Das Maßband):</strong> Prüft, ob ein Wert innerhalb eines erwarteten Bereichs liegt.</li>
          <li><strong>validate_rate_of_change (Der Geschwindigkeitsmesser):</strong> Erkennt unrealistische Sprünge zwischen zwei Messungen.</li>
          <li><strong>detect_anomalies (Der Profiler):</strong> Nutzt künstliche Intelligenz (IForest), um komplexe, verdächtige Muster zu finden.</li>
        </ul>
        <h6 className="font-semibold pt-2 border-t dark:border-gray-700">Verwendete Bibliotheken</h6>
        <p>Für seine Arbeit nutzt er mächtige, frei verfügbare "Spezial-Werkzeuge":</p>
        <ul className="list-disc list-outside pl-5">
          <li><strong>pandas:</strong> Das "Schweizer Taschenmesser" zur Organisation der Daten in Tabellen.</li>
          <li><strong>pyod:</strong> Eine spezialisierte "Werkzeugkiste" mit über 50 Algorithmen zur Anomalieerkennung.</li>
          <li><strong>IForest:</strong> Einer der effizientesten "Detektive" aus der pyod-Kiste, der Ausreißer findet, indem er prüft, wie leicht sie sich von anderen Daten isolieren lassen.</li>
        </ul>
      </div>
    )
  },
  consolidator: {
    title: "Was tut dieser Code? (Der sorgfältige Archivar)",
    content: (
      <div className="space-y-3">
        <p>Diese Funktion ist der <strong>"sorgfältige Archivar"</strong> des Projekts. Nachdem der "Türsteher" die Daten geprüft hat, erstellt der Archivar am Ende des Tages eine aussagekräftige und wissenschaftlich korrekte Zusammenfassung.</p>
        <p>Ein einfacher Mittelwert wäre oft irreführend. Daher wendet der Archivar <strong>parameterspezifische Methoden</strong> an:</p>
        <ul className="list-disc list-outside pl-5">
          <li><strong>Temperatur:</strong> Mittelwert, Minimum und Maximum, um die volle thermische Dynamik zu erfassen.</li>
          <li><strong>pH-Wert:</strong> Der Median, da dieser bei einer logarithmischen Skala robuster gegen Ausreißer ist.</li>
          <li><strong>Gelöster Sauerstoff:</strong> Das tägliche Minimum als kritischste Kennzahl für das Leben im See.</li>
        </ul>
        <p>Zudem gilt der Grundsatz der Repräsentativität: Eine Zusammenfassung wird nur erstellt, wenn mindestens 75% der Stundenwerte des Tages vorliegen.</p>
      </div>
    )
  },
  api: {
    title: "Was tut dieser Code? (Die öffentliche Auskunft)",
    content: (
      <div className="space-y-3">
        <p>Dieser Code erschafft die <strong>"öffentliche Auskunftstheke"</strong> des zugrundeliegenden Datensystems, eine sogenannte API (Application Programming Interface). Sie ist wie ein extrem fähiger Bibliothekar, der auf Anfragen von außen wartet.</p>
        <ul>
          <li><strong>FastAPI:</strong> Ist die von uns genutzte Technologie. Sie ist besonders schnell und erstellt automatisch eine "Bedienungsanleitung" (interaktive Dokumentation) für andere Entwickler.</li>
          <li><strong>@app.get(...):</strong> Definiert eine "Bestellung", die der Bibliothekar entgegennehmen kann, z.B.: "Gib mir alle pH-Werte vom Mai für Station X".</li>
          <li><strong>Das Ergebnis:</strong> Der Dienst holt die bestellten, sauberen Daten aus dem "Archiv" (der Datenbank) und liefert sie auf einem standardisierten "Tablett" (im JSON-Format) aus.</li>
        </ul>
      </div>
    )
  }
};

// Daten für die "Nutzen & Anwendungsfälle"-Karten und Modals
// NEUE DATENSTRUKTUR für zielgruppenspezifische Anwendungsfälle
const useCaseData = {
    technik: [
      // Die fehlerhafte Zeile "const useCases = [" wurde hier entfernt
      {
      id: 'tourism',
      title: 'Prädiktiver Tourismus',
      icon: Ship,
      target: 'Tourismus, Kommunen, Bürger',
      summary: 'KI-gestützte Vorhersage der Badewasserqualität zur Vermeidung unnötiger Seesperrungen und zum Schutz der öffentlichen Gesundheit.',
      details: {
        problem: 'Kurzfristige Algenblüten stellen ein Gesundheitsrisiko dar und führen oft zu pauschalen, langen Sperrungen, die wirtschaftlichen Schaden im Tourismus verursachen.',
        solution: 'Durch die Kombination von Echtzeit-Sensordaten (Chlorophyll, Phycocyanin, etc.) mit externen Daten (Wettervorhersage) können KI-Modelle die Wahrscheinlichkeit einer Algenblüte 48-72 Stunden im Voraus berechnen.',
        benefit: 'Ermöglicht proaktives Gewässermanagement, sichert Tourismuseinnahmen und steigert die Attraktivität der Region durch verlässliche Informationen.',
        example: 'Die wirtschaftliche Bedeutung zeigt sich z.B. in Kalifornien, wo saubere Gewässer jährlich 14 Mrd. USD direkten Tourismusumsatz generieren.'
      }
    },
    {
      id: 'farming',
      title: 'Smart Farming',
      icon: Sprout,
      target: 'Landwirte, Wasser- & Bodenverbände',
      summary: 'Analyse von Nährstoffwerten in Gewässern zur Optimierung des Düngemitteleinsatzes und zur Reduzierung der Umweltbelastung.',
      details: {
        problem: 'Die Auswaschung von überschüssigem Dünger (Nitrat, Phosphat) aus der Landwirtschaft ist eine Hauptursache für die Eutrophierung von Seen.',
        solution: 'Durch die Korrelation von Niederschlagsereignissen mit den Echtzeit-Nährstoffdaten aus den Seen können Landwirte den optimalen Zeitpunkt und die optimale Menge für die Düngung bestimmen.',
        benefit: 'Reduziert signifikant die Kosten für Düngemittel und schützt die Gewässer vor Nährstoffeinträgen. Stärkt die Position der Landwirte als verantwortungsvolle Umweltpartner.',
        example: 'Start-ups wie "Kilimo" beweisen das enorme Effizienzpotenzial datengestützter Landwirtschaft.'
      }
    },
    {
      id: 'innovation',
      title: 'Innovations-Ökosystem',
      icon: Lightbulb,
      target: 'Unternehmen, Start-ups, IT-Dienstleister',
      summary: 'Eine offene, standardisierte Daten-API als Katalysator für die lokale Digitalwirtschaft und die Gründung neuer Unternehmen.',
      details: {
        problem: 'Für die Entwicklung neuer digitaler Produkte fehlt es Gründern oft am Zugang zu qualitativ hochwertigen, standardisierten Umweltdaten.',
        solution: 'Die Bereitstellung der Daten über eine OGC SensorThings API senkt die Eintrittsbarriere für die Entwicklung neuer Apps und Dienstleistungen (z.B. für Angler, Aquakulturen, Beratungsleistungen).',
        benefit: 'Fördert die Entstehung eines sozio-technischen Ökosystems aus Kommunen, Industrie und Wissenschaft, was die lokale Wirtschaft stärkt und Arbeitsplätze schafft.',
        example: 'Das deutsche Leuchtturmprojekt "KOMMUNAL 4.0" demonstriert erfolgreich, wie solche Plattformen die regionale Wirtschaft beleben.'
      }
    },
    {
      id: 'digital-twin',
      title: 'Digitale Zwillinge und Ökosystem-Simulation',
      icon: Orbit, // Oder Orbit, je nachdem was Sie importiert haben
      target: 'Wissenschaft, Forschungsinstitute, Wasserbauingenieure',
      summary: 'Ein lebendiges 4D-Modell des Sees, das durch Echtzeit-Sensordaten gespeist wird und als virtuelles Labor für Simulationen und Analysen dient.',
      details: {
        problem: 'Statische Modelle und seltene, punktuelle Messungen können die hochdynamischen und räumlich komplexen Prozesse in einem See (z.B. die Ausbildung von thermischen Schichtungen, Nährstoff-Hotspots, Strömungen) nur unzureichend abbilden. Für präzise Forschung und Management fehlen oft lebendige, datengestützte Gesamtbilder des Ökosystems.',
        solution: 'Der kontinuierliche, qualitätsgesicherte Datenstrom der mobilen Sensorflotte wird genutzt, um ein dynamisches 4D-Modell (3D-Raum + Zeit) des Sees zu füttern – einen "Digitalen Zwilling". Dieses virtuelle Abbild des realen Gewässers wird in Quasi-Echtzeit durch die Messdaten kalibriert und aktualisiert. Es dient als virtuelles Labor, in dem komplexe Zusammenhänge visualisiert und Szenarien durchgespielt werden können.',
        benefit: 'Ermöglicht die Simulation von Extremszenarien (z.B. Hitzewellen), die Visualisierung komplexer Prozesse, die Optimierung von Sanierungsmaßnahmen vor deren Umsetzung und die risikofreie Überprüfung wissenschaftlicher Hypothesen.',
        example: 'Das Projekt folgt der Vision des "Digital Twin of the Ocean" (DITTO) Programms der Vereinten Nationen, das darauf abzielt, durch die Fusion von Sensordaten und Modellen ein interaktives, digitales Abbild globaler Gewässer zu schaffen.'
      }
    },
    {
      id: 'conservation',
      title: 'Artenschutz & Gewässer-Gesundheit',
      icon: Fish,
      target: 'Umweltverbände, Fischereivereine, Behörden',
      summary: 'Präzise Identifikation von ökologischen Stresszonen für Fische und andere Wasserlebewesen durch hochaufgelöste Daten.',
      details: {
        problem: 'Sauerstoffmangel (Hypoxie) oder thermischer Stress sind oft unsichtbar, aber tödlich für die aquatische Fauna.',
        solution: 'Die kontinuierliche Überwachung von Sauerstoff und Temperatur in verschiedenen Tiefen ermöglicht die Erstellung von detaillierten Risikokarten für aquatische Lebensräume.',
        benefit: 'Ermöglicht die Einleitung gezielter Gegenmaßnahmen (z.B. Belüftung bei Hypoxie, Anlegen von Schattenzonen bei Hitzestress) und liefert eine wissenschaftliche Grundlage für Renaturierungsprojekte.',
        example: 'Die Methoden des IGB und des LTER-Netzwerks zeigen, wie Langzeitdaten zum Schutz der Biodiversität beitragen.'
      }
    },
    {
      id: 'education',
      title: 'Bildung & Bürgerbeteiligung',
      icon: School,
      target: 'Schulen, Universitäten, Bürger',
      summary: 'Die offene Datenplattform als interaktives Lehrmittel zur Förderung von Umweltbewusstsein und "Data Literacy".',
      details: {
        problem: 'Komplexe ökologische Zusammenhänge sind oft abstrakt und schwer zu vermitteln.',
        solution: 'Die Visualisierungs-Plattform macht Daten lebendig und zugänglich. Schüler können eigene Analysen durchführen, und es können Citizen-Science-Projekte initiiert werden.',
        benefit: 'Schafft Transparenz, fördert die digitale und ökologische Bildung und stärkt die Identifikation der Bürger mit den lokalen Naturschätzen.',
        example: 'Projekte wie "Water RANGERS" zeigen, wie Bürger erfolgreich in die Gewässerüberwachung eingebunden werden können.'
      }
    }
  ],
  details: [
    {
      id: 'tourism', // Wir verwenden dieselbe ID, da es der gleiche Anwendungsfall ist
      title: 'Frühwarnsystem für Badegewässer',
      icon: Ship,
      target: 'Bürger, Tourismus, Gesundheitsämter',
      summary: 'Proaktive Erkennung von Algenblüten (Cyanobakterien), um die Bevölkerung rechtzeitig zu informieren und die Nutzung der Seen sicher zu steuern.',
      details: {
        problem: 'Kurzfristige, toxische Blaualgenblüten stellen ein Gesundheitsrisiko dar. Fehlende oder späte Warnungen gefährden Badegäste, während pauschale Sperrungen den Tourismus unnötig schädigen.',
        solution: 'Durch die Echtzeit-Analyse von Sensor-Proxies (Chlorophyll, Phycocyanin) in Kombination mit Wetterdaten können KI-Modelle das Risiko einer Algenblüte 48-72 Stunden im Voraus prognostizieren.',
        benefit: 'Ermöglicht eine gezielte und rechtzeitige Information der Bevölkerung über offizielle Kanäle. Badeverbote werden nur bei tatsächlicher Notwendigkeit ausgesprochen, was die Sicherheit erhöht und die Akzeptanz von Maßnahmen steigert.',
        example: 'Die Kombination von Sensorik und Modellierung, wie vom IGB (Leibniz-Institut für Gewässerökologie) erforscht, bildet die Grundlage für solche modernen Warnsysteme.'
      }
    },
    {
      id: 'reporting',
      title: 'Automatisierte Berichtserstellung & EU-Compliance',
      icon: FileText,
      target: 'Wasserbehörden, Landesämter',
      summary: 'Effiziente Erfüllung von Berichtspflichten durch automatische, standardkonforme Datenaggregation.',
      details: {
        problem: 'Die manuelle Erstellung von Berichten für die EU-Wasserrahmenrichtlinie (WRRL) und nationale Verordnungen ist zeitaufwändig und fehleranfällig.',
        solution: 'Das System aggregiert qualitätsgeflaggte Daten automatisch in die geforderten Formate und stellt sie als standardisierte Exporte bereit.',
        benefit: 'Massive Zeitersparnis, Erhöhung der Rechtssicherheit durch lückenlose Dokumentation und Sicherstellung der INSPIRE-Konformität.',
        example: 'Orientiert an den etablierten Berichtswegen des europäischen WISE-Systems und den Datenstandards des UBA.'
      }
    },
    {
      id: 'planning',
      title: 'Datengestützte Raum- & Infrastrukturplanung',
      icon: Map,
      target: 'Bau- & Planungsämter, Wirtschaftsförderung',
      summary: 'Nutzung von Langzeit-Datenreihen als objektive Grundlage für Planungs- und Genehmigungsverfahren.',
      details: {
        problem: 'Planungsentscheidungen für Bauprojekte oder Infrastruktur in Gewässernähe basieren oft auf veralteten oder unvollständigen Daten.',
        solution: 'Die hochaufgelösten Daten zu Wasserständen, Trübung und ökologischem Status liefern eine solide, wissenschaftliche Basis zur Bewertung von Umweltauswirkungen.',
        benefit: 'Vermeidet teure Planungsfehler, beschleunigt Genehmigungsverfahren und ermöglicht eine nachweislich nachhaltige Regionalentwicklung.',
        example: 'Ein Kernaspekt von "Smart City"-Konzepten, wie sie im EU-Projekt "Digital Water City" erprobt werden.'
      }
    },
    {
      id: 'crisis-management',
      title: 'Echtzeit-Detektion von Schadstoffeinträgen',
      icon: Siren,
      target: 'Wasserbehörde, Katastrophenschutz, Kommunen',
      summary: 'Überwacht kontinuierlich die Wasserqualität auf abrupte, unnatürliche Veränderungen, um die Einleitung von Schadstoffen durch Unfälle im Uferbereich sofort zu erkennen.',
      details: {
        problem: 'Bei Unfällen im Uferbereich (z.B. Rohrbrüche, Gülleaustritt, LKW-Unfall) können Schadstoffe unbemerkt in den See gelangen und schwere ökologische Schäden verursachen, bevor sie entdeckt werden.',
        solution: 'Die hochfrequenten Sensoren agieren als "digitale Wachposten". Die Anomalieerkennung ist darauf trainiert, plötzliche, untypische Veränderungen (z.B. Sprünge bei Trübung, pH-Wert, Leitfähigkeit) zu erkennen, die auf einen Schadstoffeintrag hindeuten, und löst einen sofortigen Alarm aus.',
        benefit: 'Verkürzt die Reaktionszeit von Tagen oder Stunden auf Minuten. Behörden können den Schaden sofort eindämmen, die Quelle identifizieren und Gegenmaßnahmen einleiten, was den ökologischen Schaden und die Folgekosten massiv reduziert.',
        example: 'Ähnliche Echtzeit-Monitoringsysteme werden erfolgreich zur Überwachung von Flüssen unterhalb von Industrieanlagen eingesetzt, um unzulässige Einleitungen sofort aufzudecken.'
      }
    }
  ],
  überblick: [ // Die Bürgeransicht bleibt vereinfacht
      { id: 'tourism', title: 'Für Tourismus & Freizeit', icon: Ship, summary: 'Bessere Vorhersagen von Algenblüten können unnötige Sperrungen von Badeseen vermeiden. Das bedeutet mehr sicheren Badespaß für Sie und verlässlichere Einnahmen für Hotels und Gaststätten.' },
      { id: 'farming', title: 'Für Umwelt & Landwirtschaft', icon: Sprout, summary: 'Landwirte können ihre Felder gezielter bewässern und düngen. Das spart nicht nur Wasser, sondern schützt auch unsere Seen vor überschüssigen Nährstoffen.' },
      { id: 'innovation', title: 'Für unsere Region', icon: Lightbulb, summary: 'Unternehmen und Tüftler aus der Region können diese öffentlichen Daten nutzen, um neue Apps und Dienstleistungen zu entwickeln. Das schafft Arbeitsplätze und fördert die lokale Wirtschaft.' }
  ]
};


// Beispieldaten basierend auf Useriner-See_2025-04-28.csv
const dailyChartData = [
  { time: '00:00', pH: 8.61, sauerstoff: 12.2 }, { time: '01:00', pH: 8.62, sauerstoff: 12.3 },
  { time: '02:00', pH: 8.63, sauerstoff: 12.4 }, { time: '03:00', pH: 8.65, sauerstoff: 12.5 },
  { time: '04:00', pH: 8.68, sauerstoff: 12.6 }, { time: '05:00', pH: 8.71, sauerstoff: 12.7 },
  { time: '06:00', pH: 8.74, sauerstoff: 12.8 }, { time: '07:00', pH: 8.77, sauerstoff: 12.9 },
  { time: '08:00', pH: 8.80, sauerstoff: 13.0 }, { time: '09:00', pH: 8.83, sauerstoff: 13.1 },
  { time: '10:00', pH: 8.85, sauerstoff: 13.2 }, { time: '11:00', pH: 8.87, sauerstoff: 13.3 },
  { time: '12:00', pH: 8.88, sauerstoff: 13.4 }, { time: '13:00', pH: 8.89, sauerstoff: 13.5 },
  { time: '14:00', pH: 8.90, sauerstoff: 13.6 }, { time: '15:00', pH: 8.90, sauerstoff: 13.6 },
  { time: '16:00', pH: 8.89, sauerstoff: 13.5 }, { time: '17:00', pH: 8.87, sauerstoff: 13.4 },
  { time: '18:00', pH: 8.85, sauerstoff: 13.3 }, { time: '19:00', pH: 8.82, sauerstoff: 13.2 },
  { time: '20:00', pH: 8.78, sauerstoff: 13.0 }, { time: '21:00', pH: 8.74, sauerstoff: 12.8 },
  { time: '22:00', pH: 8.70, sauerstoff: 12.6 }, { time: '23:00', pH: 8.68, sauerstoff: 12.5 },
];



// Eigene Komponente für die Grafik
const TagesgangChart = () => (
  <div className="w-full h-80 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
    <ResponsiveContainer>
      <LineChart data={dailyChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
        <XAxis dataKey="time" tick={{ fill: 'currentColor', fontSize: 12 }} />
        <YAxis yAxisId="left" dataKey="pH" domain={[8.6, 8.9]} tick={{ fill: '#3b82f6', fontSize: 12 }} />
        <YAxis yAxisId="right" dataKey="sauerstoff" orientation="right" domain={[12.0, 13.6]} tick={{ fill: '#14b8a6', fontSize: 12 }} />
        <Tooltip
          contentStyle={{ 
            backgroundColor: 'rgba(31, 41, 55, 0.8)', 
            borderColor: '#4b5563',
            color: '#ffffff',
            borderRadius: '0.5rem'
          }}
          itemStyle={{ color: '#ffffff' }}
          labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
        />
        <Legend />
        <Line yAxisId="left" type="monotone" dataKey="pH" stroke="#3b82f6" strokeWidth={2} name="pH-Wert" />
        <Line yAxisId="right" type="monotone" dataKey="sauerstoff" stroke="#14b8a6" strokeWidth={2} name="Gelöster Sauerstoff (mg/L)" />
      </LineChart>
    </ResponsiveContainer>
  </div>
);


// Eigene Komponente für die Validierungs-Grafik
// Daten für die Validierungs-Grafik (pH-Werte mit einem Ausreißer)
const validationChartData = [
  { time: '06:00', pH: 8.74, type: 'valid' }, { time: '07:00', pH: 8.77, type: 'valid' },
  { time: '08:00', pH: 8.80, type: 'valid' }, { time: '09:00', pH: 8.83, type: 'valid' },
  { time: '10:00', pH: 9.50, type: 'outlier' }, // <-- Künstlicher Ausreißer
  { time: '11:00', pH: 8.87, type: 'valid' }, { time: '12:00', pH: 8.88, type: 'valid' },
  { time: '13:00', pH: 8.89, type: 'valid' }, { time: '14:00', pH: 8.90, type: 'valid' },
];

// Helfer-Komponente, die für jeden Punkt die Form und Farbe bestimmt
const CustomShape = (props) => {
  const { cx, cy, payload } = props;
  if (payload.type === 'outlier') {
    // Zeichne ein rotes Kreuz für Ausreißer
    return (
      <path d={`M${cx - 5},${cy - 5}L${cx + 5},${cy + 5}M${cx + 5},${cy - 5}L${cx - 5},${cy + 5}`} stroke="#ef4444" strokeWidth="2" />
    );
  }
  // Zeichne einen grünen Kreis für valide Punkte
  return <circle cx={cx} cy={cy} r={5} fill="#10b981" />;
};

// Die finale, korrigierte Chart-Komponente
const ValidationChart = () => (
  <div className="w-full h-80 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg relative">
    <ResponsiveContainer>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2}/>
        <XAxis dataKey="time" type="category" name="Uhrzeit" tick={{ fill: 'currentColor', fontSize: 12 }} />
        <YAxis dataKey="pH" name="pH-Wert" domain={[8.6, 9.6]} tick={{ fill: 'currentColor', fontSize: 12 }} />
        <Tooltip 
          cursor={{ strokeDasharray: '3 3' }} 
          contentStyle={{ 
            backgroundColor: 'rgba(31, 41, 55, 0.8)', 
            borderColor: '#4b5563',
            borderRadius: '0.5rem'
          }}
        />
        <Scatter data={validationChartData} shape={<CustomShape />} />
      </ScatterChart>
    </ResponsiveContainer>
    {/* Eigene Legende, da die automatische nicht mehr funktioniert */}
    <div className="absolute top-2 right-4 text-xs flex space-x-4">
        <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span>Valide Daten</span>
        </div>
        <div className="flex items-center">
            <svg className="w-3 h-3 mr-2" viewBox="0 0 10 10"><path d="M0,0L10,10M10,0L0,10" stroke="#ef4444" strokeWidth="1.5"></path></svg>
            <span>Ausreißer</span>
        </div>
    </div>
  </div>
);

// FINALE, KORRIGIERTE CHART-KOMPONENTE
const ConsolidationTempChart = () => {
  const rawCsvData = `Datum;Uhrzeit;Wassertemperatur (°C);ph-Wert;Sauerstoff (mg/L)
28.04.2025;00:00:00;8.8;8.61;12.2
28.04.2025;01:00:00;8.6;8.62;12.3
28.04.2025;02:00:00;8.4;8.63;12.4
28.04.2025;03:00:00;8.3;8.65;12.5
28.04.2025;04:00:00;8.2;8.68;12.6
28.04.2025;05:00:00;8.4;8.71;12.7
28.04.2025;06:00:00;8.7;8.74;12.8
28.04.2025;07:00:00;9.1;8.77;12.9
28.04.2025;08:00:00;9.8;8.80;13.0
28.04.2025;09:00:00;10.5;8.83;13.1
28.04.2025;10:00:00;11.1;8.85;13.2
28.04.2025;11:00:00;11.6;8.87;13.3
28.04.2025;12:00:00;11.9;8.88;13.4
28.04.2025;13:00:00;12.1;8.89;13.5
28.04.2025;14:00:00;12.0;8.90;13.6
28.04.2025;15:00:00;11.8;8.90;13.6
28.04.2025;16:00:00;11.5;8.89;13.5
28.04.2025;17:00:00;11.0;8.87;13.4
28.04.2025;18:00:00;10.5;8.85;13.3
28.04.2025;19:00:00;10.1;8.82;13.2
28.04.2025;20:00:00;9.8;8.78;13.0
28.04.2025;21:00:00;9.5;8.74;12.8
28.04.2025;22:00:00;9.2;8.70;12.6
28.04.2025;23:00:00;9.0;8.68;12.5`;

  const lines = rawCsvData.trim().split('\n').slice(1).filter(line => line.trim() !== '');
  const validData = lines.map(line => {
    const parts = line.split(';');
    if (parts.length < 3) return null;
    return {
      time: (parts[1] || "").substring(0, 5),
      temp: parseFloat((parts[2] || "").replace(',', '.'))
    };
  }).filter(d => d && !isNaN(d.temp) && d.temp > -100);

  if (validData.length === 0) {
    return <div className="text-center p-4">Keine validen Daten zum Anzeigen vorhanden.</div>;
  }

  const tempValues = validData.map(p => p.temp);
  const meanTemp = tempValues.reduce((a, b) => a + b, 0) / tempValues.length;
  const minTemp = Math.min(...tempValues);
  const maxTemp = Math.max(...tempValues);
  const stdDev = Math.sqrt(tempValues.map(x => Math.pow(x - meanTemp, 2)).reduce((a, b) => a + b) / tempValues.length);
  
  const chartData = validData.map(d => ({
    ...d,
    stdDevRange: [meanTemp - stdDev, meanTemp + stdDev]
  }));

  return (
    <div className="w-full h-80 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
      <ResponsiveContainer>
        <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
          <XAxis dataKey="time" tick={{ fill: 'currentColor', fontSize: 12 }} />
          <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fill: 'currentColor', fontSize: 12 }} />
          <Tooltip 
             contentStyle={{ 
              backgroundColor: 'rgba(31, 41, 55, 0.8)', 
              borderColor: '#4b5563',
              borderRadius: '0.5rem'
            }}
          />
          <Legend verticalAlign="top" height={36}/>
          
          {/* HIER FINDET DIE RUNDUNG STATT */}
          <ReferenceLine y={maxTemp} label={{ value: `Max: ${maxTemp.toFixed(1)}°C`, position: 'insideTopRight', fill: '#ef4444' }} stroke="#ef4444" strokeDasharray="3 3" />
          <ReferenceLine y={meanTemp} label={{ value: `Mittel: ${meanTemp.toFixed(1)}°C`, position: 'insideTopRight', fill: '#a3a3a3' }} stroke="#a3a3a3" strokeDasharray="3 3" />
          <ReferenceLine y={minTemp} label={{ value: `Min: ${minTemp.toFixed(1)}°C`, position: 'insideTopRight', fill: '#3b82f6' }} stroke="#3b82f6" strokeDasharray="3 3" />
          
          <Area type="monotone" dataKey="stdDevRange" stroke="none" fill="#14b8a6" fillOpacity={0.2} name="Standardabweichung" />
          <Line type="monotone" dataKey="temp" stroke="#14b8a6" strokeWidth={2} name="Temperatur (°C)" dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

// Daten für die Qualitäts-Flag-Grafik
const qualityFlagData = [
  { name: 'Gut (1 Pass)', value: 93, color: '#10b981' },
  { name: 'Verdächtig (3 Suspect)', value: 4, color: '#f59e0b' },
  { name: 'Fehlerhaft (4 Fail)', value: 1, color: '#ef4444' },
  //{ name: 'Nicht validiert (2 Not Evaluated)', value: 2, color: 'rgb(107 114 128' },
];

// Eigene Komponente für die Qualitäts-Flag-Grafik
// Eigene Komponente für die Qualitäts-Flag-Grafik als Doughnut-Chart
const QualityFlagChart = () => (
  <div className="w-full h-80 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
    <ResponsiveContainer>
      <PieChart>
        <Pie
          data={qualityFlagData}
          cx="50%"
          cy="50%"
          labelLine={false}
          innerRadius={70} // <-- DIESE ZEILE IST NEU und erzeugt den Doughnut-Effekt
          outerRadius={110}
          fill="#8884d8"
          paddingAngle={5} // Ein kleiner Abstand zwischen den Segmenten
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {qualityFlagData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => `${value}%`}
          contentStyle={{ 
            backgroundColor: 'rgba(31, 41, 55, 0.8)', 
            borderColor: '#4b5563',
            borderRadius: '0.5rem'
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

// Daten für das Radar-Diagramm (Kosten-Nutzen-Analyse)
// Skala von 1 (schlecht) bis 10 (sehr gut)
const radarChartData = [
  { subject: 'Geringe Kosten', A: 9, B: 2, fullMark: 10 },
  { subject: 'Hohe Flexibilität', A: 10, B: 4, fullMark: 10 },
  { subject: 'Wissensaufbau', A: 10, B: 3, fullMark: 10 },
  // Berücksichtigt Ihre Anmerkung: Die Eigenentwicklung ist durch Wegfall der Bürokratie schneller.
  { subject: 'Schnelle Inbetriebnahme', A: 7, B: 3, fullMark: 10 }, 
  { subject: 'Geringe Wartung', A: 6, B: 8, fullMark: 10 },
];

// Eigene Komponente für das Radar-Diagramm
const CostBenefitRadarChart = () => (
  <div className="w-full h-80 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
    <ResponsiveContainer>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarChartData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', fontSize: 12 }} />
        <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
        <Radar name="Eigenentwicklung" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
        <Radar name="Softwarekauf" dataKey="B" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
        <Legend />
        <Tooltip 
           contentStyle={{ 
            backgroundColor: 'rgba(31, 41, 55, 0.8)', 
            borderColor: '#4b5563',
            borderRadius: '0.5rem'
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  </div>
);

// Komponente für das vergrößerte Bild-Modal
const ImageModal = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-in fade-in-20"
      onClick={onClose}
    >
      {/* HIER WURDE max-w-4xl zu max-w-6xl geändert */}
      <div 
        className="relative max-w-6xl w-[90%] p-4" // w-[90%] sorgt für gute Darstellung auf allen Bildschirmgrößen
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

// Komponente für das "Nutzen & Anwendungsfälle"-Modal
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

// Komponente für das Einführungs-Modal

const IntroModal = ({ show, onClose }) => {
  const [step, setStep] = useState(1);

  const handleClose = () => {
    // Merkt sich im Browser, dass der Nutzer die Einführung gesehen hat
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
              
              {/* HIER IST DIE KORREKTUR: Das Motivations-Karussell wird direkt eingebunden. */}
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
                <li><b>Info-Level (oben rechts):</b> Wählen Sie Ihre Perspektive! Wechseln Sie zwischen "Überblickr", "Details" und "Technik", um maßgeschneiderte Erklärungen und Darstellungen zu sehen.</li>
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

// Komponente für die Code-Erklärungen
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

function App() {
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [selectedUseCase, setSelectedUseCase] = useState(null);
  const [codeExplanation, setCodeExplanation] = useState(null);
  const [modalImageUrl, setModalImageUrl] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [detailLevel, setDetailLevel] = useState('details');
  const [activeStep, setActiveStep] = useState(0);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [showComments, setShowComments] = useState({});
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  

  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/comments`);
      if (!response.ok) {
        throw new Error('Netzwerk-Antwort war nicht ok.');
      }
      const data = await response.json();
      
      const commentsBySection = data.reduce((acc, comment) => {
        const key = `${comment.stepId}-${comment.sectionId}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(comment);
        return acc;
      }, {});
      setComments(commentsBySection);
    } catch (error) {
      console.error("Fehler beim Laden der Kommentare:", error);
    }
  }, []); 
  


// Diese Funktion wird aufgerufen, wenn der Nutzer das EINFÜHRUNGS-Modal schließt
  const handleIntroClose = () => {
    setShowIntroModal(false);
    // Wenn die Einführung geschlossen wird UND der Nutzer noch nicht angemeldet ist,
    // wird jetzt das Login-Modal getriggert.
    if (!currentUser) {
      setShowLoginModal(true);
    }
  };

  const handleLogin = async (userData) => {
    // userData enthält jetzt { ..., wantsNotifications: 'daily' } (oder 'immediate'/'none')
    console.log("Neuer Login:", userData);
    
    // Wir benennen die Eigenschaft für mehr Klarheit um
    const userToSave = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      notificationFrequency: userData.wantsNotifications 
    };

    setCurrentUser(userToSave);
    localStorage.setItem('currentUser', JSON.stringify(userToSave));
    setShowLoginModal(false);

    try {
      await fetch(`${API_BASE_URL}/api/user-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userToSave) // Sende das Objekt mit der Frequenz
      });
    } catch (error) {
      console.error('Fehler beim Synchronisieren der Nutzerdaten:', error);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setShowLoginModal(true); // Nach dem Logout das Login-Modal wieder anzeigen
  };

  

  const handleNotificationChange = async (event) => {
    if (!currentUser) return;

    const wantsNotifications = event.target.checked;

    // 1. Erstelle das aktualisierte Nutzerobjekt
    const updatedUser = { ...currentUser, wantsNotifications };

    // 2. Aktualisiere den State und den lokalen Speicher im Frontend
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));

    // 3. Sende die Änderung an das Backend, um die "Datenbank" zu aktualisieren
    try {
      await fetch(`${API_BASE_URL}/api/user-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser)
      });
      console.log(`Benachrichtigungs-Status für ${currentUser.email} auf ${wantsNotifications} gesetzt.`);
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Benachrichtigungs-Einstellung:', error);
    }
  };

// Finaler useEffect, der alle Start-Aktionen bündelt
  useEffect(() => {
    // 1. Lade die Kommentare vom Server
    fetchComments();

    // 2. Prüfe den Login-Status und entscheide, welches Modal gezeigt wird
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      // Wenn der Nutzer bereits eingeloggt ist, zeige kein Modal
      setCurrentUser(JSON.parse(savedUser));
      setShowLoginModal(false);
    } else {
      // Wenn kein Nutzer eingeloggt ist, prüfe ob die Einführung schon gesehen wurde
      const hasSeenIntro = localStorage.getItem('hasSeenIntroModal');
      if (hasSeenIntro === 'true') {
        // Einführung gesehen -> direkt zum Login
        setShowLoginModal(true);
      } else {
        // Einführung noch nicht gesehen -> zuerst die Einführung zeigen
        setShowIntroModal(true);
      }
    }
  }, [fetchComments]); // Abhängigkeit von fetchComments


  // Die neue saveComment-Funktion, die auf den Server schreibt
  const saveComment = async (stepId, sectionId) => {
    const commentKey = `${stepId}-${sectionId}`;
    if (!newComment[commentKey]?.trim() || !currentUser) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: currentUser,
          text: newComment[commentKey],
          stepId,
          sectionId,
          level: detailLevel,
        }),
      });
      if (response.ok) {
        setNewComment({ ...newComment, [commentKey]: '' });
        fetchComments(); // Kommentare neu laden, um den neuen anzuzeigen
      }
    } catch (error) {
      console.error('Fehler beim Speichern des Kommentars:', error);
    }
  };

  // Die komplett neue Funktion zum Löschen von Kommentaren
  const handleDeleteComment = async (commentId) => {
    if (!currentUser || !window.confirm("Möchten Sie diesen Kommentar wirklich endgültig löschen?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/comments/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, user: currentUser }),
      });
      if (response.ok) {
        fetchComments(); // Kommentare neu laden, um den gelöschten zu entfernen
      } else {
        const errorData = await response.text();
        alert(`Fehler: ${errorData}`);
      }
    } catch (error) {
      console.error('Fehler beim Löschen des Kommentars:', error);
    }
  };

  const toggleSection = (stepId, sectionId) => {
    const key = `${stepId}-${sectionId}`;
    setExpandedSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getLevelIcon = (level) => {
    switch(level) {
      case 'technik': return <Beaker className="w-4 h-4" />;
      case 'details': return <Building2 className="w-4 h-4" />;
      case 'überblick': return <Users className="w-4 h-4" />;
      default: return null;
    }
  };

  const getLevelColor = (level) => {
    switch(level) {
      case 'technik': return 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20';
      case 'details': return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20';
      case 'überblick': return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20';
      default: return '';
    }
  };

  const steps = [
    // Nutzen & Anwendungsfälle
  {
    id: 'nutzen-anwendungsfaelle',
    title: 'Nutzen & Anwendungsfälle',
    icon: <Sparkles className="w-6 h-6" />,
    intro: {
      technik: 'Konkrete Best-Practice-Beispiele und neue Ideen, wie die aufbereiteten Daten von verschiedenen Akteuren gewinnbringend genutzt werden können.',
      details: 'Konkrete Best-Practice-Beispiele und neue Ideen, wie die aufbereiteten Daten von verschiedenen Akteuren gewinnbringend genutzt werden können.',
      überblick: 'Was kann man mit diesen Daten eigentlich anfangen? Konkrete Beispiele für alle.'
    },
    sections: [{
      id: 'use-cases',
      title: 'Beispiele und Ideen',
      content: {
        technik: (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Die Nutzung von Wasserdaten durchläuft einen Paradigmenwechsel: von reiner Regulierung hin zu einem strategischen Vermögenswert. Die folgenden Beispiele illustrieren das wirtschaftliche und gesellschaftliche Potenzial.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {useCaseData.technik.map(useCase => (
                <button key={useCase.id} onClick={() => setSelectedUseCase(useCase)} className="text-left bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg flex flex-col space-y-3 border dark:border-gray-700 hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-500 transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-lg"><useCase.icon className="w-6 h-6 text-purple-600 dark:text-purple-400" /></div>
                    <h5 className="font-bold text-gray-800 dark:text-gray-200">{useCase.title}</h5>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{useCase.target}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex-grow">{useCase.summary}</p>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Mehr erfahren...</span>
                </button>
              ))}
            </div>
          </div>
        ),
        details: (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Neben dem allgemeinen Potenzial sind für die Verwaltung vor allem Anwendungsfälle relevant, die direkt bei der Erfüllung hoheitlicher Aufgaben, der Effizienzsteigerung und der Risikominimierung unterstützen.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {useCaseData.details.map(useCase => (
                <button key={useCase.id} onClick={() => setSelectedUseCase(useCase)} className="text-left bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg flex flex-col space-y-3 border dark:border-gray-700 hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-500 transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg"><useCase.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" /></div>
                    <h5 className="font-bold text-gray-800 dark:text-gray-200">{useCase.title}</h5>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{useCase.target}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex-grow">{useCase.summary}</p>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Mehr erfahren...</span>
                </button>
              ))}
            </div>
          </div>
        ),
        überblick: (
          <div className="space-y-4">
            {useCaseData.überblick.map(useCase => (
              <div key={useCase.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-lg"><useCase.icon className="w-5 h-5 text-green-600 dark:text-green-400" /></div>
                  <h6 className="font-semibold">{useCase.title}</h6>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{useCase.summary}</p>
              </div>
            ))}
          </div>
        )
      }
    }]
  },
  // 1. Einleitung
  {
    id: 'einleitung-motivation',
    title: 'Von Rohdaten zu wertvoller Information',
    icon: <Zap className="w-6 h-6" />,
    intro: {
      technik: 'Die strategische Motivation und der wissenschaftliche sowie gesellschaftliche Mehrwert des Projekts zur Aufbereitung von Wasserqualitätsdaten.',
      details: 'Die strategische Motivation und der wissenschaftliche sowie gesellschaftliche Mehrwert des Projekts zur Aufbereitung von Wasserqualitätsdaten.',
      überblick: 'Warum betreiben wir diesen Aufwand? Der Weg von einer einfachen Messung im See zu einer verlässlichen Information für alle.'
    }, // KORREKTUR: Das 'intro'-Objekt wird hier geschlossen.
    
    // KORREKTUR: Das 'sections'-Array ist jetzt ein eigenes Property, kein Teil von 'intro'.
    sections: [
      {
        id: 'mission-statement-wichtigkeit', // Leichte ID-Anpassung zur Eindeutigkeit
        title: 'Warum dieses Projekt wichtig ist',
        content: {
          überblick: ( <MotivationCarousel /> ),
          details: ( <MotivationCarousel /> ),
          technik: ( <MotivationCarousel /> )
        }
      },
      // KORREKTUR: Der folgende Block war fälschlicherweise ein separates Objekt.
      // Er ist jetzt der zweite Abschnitt innerhalb des ersten 'steps'-Elements.
      {
        id: 'mission-statement-vision', // Leichte ID-Anpassung zur Eindeutigkeit
        title: 'Projektvision und Ziele',
        content: {
          überblick: (
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h5 className="font-bold text-lg mb-2 text-green-800 dark:text-green-300">🏠 Für Bürgerinnen und Bürger</h5>
                <h6 className="font-semibold mb-2">Saubere Daten für saubere Seen</h6>
                <p className="text-sm mb-3">Unsere schwimmenden Messstationen senden rund um die Uhr Daten über die Wasserqualität unserer acht Seen. Aber diese Rohdaten sind wie ungewaschenes Gemüse aus dem Garten - sie enthalten noch "Dreck" und sind nicht direkt verwendbar.</p>
                
                <strong className="text-sm">Warum ist das wichtig für Sie?</strong>
                <ul className="list-disc list-outside pl-5 mt-1 text-sm space-y-1">
                  <li><b>Ihre Gesundheit:</b> Nur durch sorgfältige Datenprüfung können wir Ihnen verlässlich sagen, ob das Baden heute sicher ist.</li>
                  <li><b>Ihre Freizeit:</b> Falsche Warnungen würden bedeuten, dass Seen unnötig gesperrt werden - richtige Daten sorgen für mehr Badespaß.</li>
                  <li><b>Ihr Zuhause:</b> Saubere Gewässer steigern den Wert Ihrer Immobilie und die Attraktivität unserer Region.</li>
                </ul>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <h6 className="font-semibold mb-2 text-red-800 dark:text-red-300">Was passiert ohne Datenaufbereitung?</h6>
                <p className="text-sm">Stellen Sie sich vor, ein Sensor zeigt durch einen technischen Fehler plötzlich extrem schlechte Werte an. Ohne Prüfung würden wir möglicherweise einen völlig harmlosen See unnötig sperren. Oder schlimmer: Ein echter Alarm wird übersehen, weil so viele Fehlmeldungen eingehen. Durch die professionelle Aufbereitung erhalten Sie vertrauenswürdige Informationen, auf die Sie sich verlassen können - für Ihre Familie und Ihre Freizeitplanung.</p>
              </div>
            </div>
          ),
          details: (
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h5 className="font-bold text-lg mb-2 text-blue-800 dark:text-blue-300">🏛️ Für Verwaltung und Politik</h5>
                <h6 className="font-semibold mb-2">Rechtssicherheit und Effizienz durch qualitätsgesicherte Daten</h6>
                <p className="text-sm mb-3">Der Landkreis Vorpommern-Greifswald steht als untere Wasserbehörde unter erheblichen rechtlichen Verpflichtungen. Die EU-Wasserrahmenrichtlinie, das Wasserhaushaltsgesetz und die Badegewässerverordnung verlangen fundierte Entscheidungsgrundlagen.</p>
                
                <strong className="text-sm">Warum professionelle Datenaufbereitung unverzichtbar ist:</strong>
                <ul className="list-disc list-outside pl-5 mt-1 text-sm space-y-1">
                  <li><b>Rechtssicherheit:</b> Behördliche Entscheidungen müssen wissenschaftlich fundiert sein. Ungeprüfte Rohdaten bieten keinen Rechtsschutz bei Haftungsfragen.</li>
                  <li><b>Kosteneffizienz:</b> Falsche Alarme führen zu teuren Fehlentscheidungen. Ein ungerechtfertigter Badeverbot kostet die lokale Tourismuswirtschaft Tausende Euro pro Tag.</li>
                  <li><b>Berichtspflichten:</b> Das Land MV und die EU erwarten standardisierte, qualitätsgeprüfte Daten für offizielle Berichte.</li>
                </ul>
                <p className="text-sm mt-3">Die Investition in Datenqualität zahlt sich durch vermiedene Haftungsrisiken, effizientere Ressourcennutzung und bessere Entscheidungsgrundlagen mehrfach aus.</p>
              </div>
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <h6 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Konkrete Vorteile für den Landkreis</h6>
                <ul className="list-disc list-outside pl-5 text-sm space-y-1">
                    <li><b>Früherkennung:</b> Qualitätsgesicherte Daten ermöglichen präventive Maßnahmen statt teurer Krisenbewältigung.</li>
                    <li><b>Fördermittel:</b> EU-Umweltprogramme bevorzugen Antragsteller mit nachgewiesener Datenqualität.</li>
                    <li><b>Bürgerzufriedenheit:</b> Verlässliche Informationen stärken das Vertrauen in die Kreisverwaltung.</li>
                </ul>
              </div>
            </div>
          ),
          technik: (
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h5 className="font-bold text-lg mb-2 text-purple-800 dark:text-purple-300">🔬 Für Experten und Wissenschaft</h5>
                <h6 className="font-semibold mb-2">Wissenschaftliche Exzellenz durch mehrstufige Validierung</h6>
                <p className="text-sm mb-3">Hochfrequente Umweltdaten unterliegen systematischen Fehlerquellen: Sensordrift, Übertragungsfehler, biologisches Fouling und meteorologische Störeinflüsse. Ohne rigorose Qualitätssicherung sind diese Daten für wissenschaftliche oder operative Anwendungen unbrauchbar.</p>
                
                <strong className="text-sm">Validierungsframework nach internationalen Standards:</strong>
                <ul className="list-disc list-outside pl-5 mt-1 text-sm space-y-1">
                  <li><b>Level-0 → Level-1 Transformation:</b> Automatisierte Plausibilitätsprüfungen, Spike-Detection und Stuck-Value-Erkennung mittels robuster statistischer Verfahren (MAD-basierte Z-Scores).</li>
                  <li><b>Hierarchisches Flagging-System:</b> QARTOD-konforme Kennzeichnung ermöglicht parametrisierte Datennutzung je nach Anwendungsfall.</li>
                  <li><b>Traceability & FAIR-Compliance:</b> Vollständige Dokumentation aller QA/QC-Schritte für wissenschaftliche Reproduzierbarkeit und zur Erfüllung der FAIR-Prinzipien (Findable, Accessible, Interoperable, Reusable).</li>
                </ul>
                <p>&nbsp;</p>
                <strong className="text-sm">Wissenschaftlicher Mehrwert:</strong>
                    <ul className="list-disc list-outside pl-5 mt-1 text-sm space-y-1">
                      <li><b>Publikationsfähigkeit:</b> Nur qualitätsgesicherte Datensätze erfüllen die Standards internationaler Fachzeitschriften.</li>
                      <li><b>Vergleichbarkeit:</b> Standardisierte Validierung ermöglicht Meta-Analysen und überregionale Studien.</li>
                      <li><b>FAIR-Compliance:</b> Erfüllung der Prinzipien (Findable, Accessible, Interoperable, Reusable) als Grundvoraussetzung für moderne Datenökosysteme.</li>
                    </ul>
              </div>

              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <h6 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Regionale Forschungsrelevanz</h6>
                <p className="text-sm">DDie Mecklenburgische Seenplatte stellt ein einzigartiges limnologisches Laboratorium dar. Qualitätsgesicherte Langzeitmessreihen ermöglichen Klimawandelforschung, Eutrophierungsstudien und die Entwicklung prädiktiver Modelle für das Gewässermanagement. Ohne rigorose Datenvalidierung bleibt dieses wissenschaftliche Potenzial ungenutzt.</p>
                <p>&nbsp;</p>
                <p className="text-sm">Die Implementierung entspricht modernsten Ansätzen wie dem USGS TADA-Framework und europäischen INSPIRE-Richtlinien.</p>
              </div>
            </div>
          ),
        }
      }
    ]
  }, // KORREKTUR: Hier endet das erste, jetzt vollständige 'steps'-Element.
  {
    id: 'dateneingabe',
    title: 'Datenaufnahme & Streaming',
    icon: <Database className="w-6 h-6" />,
    intro: {
      technik: 'Implementierung einer robusten Echtzeit-Datenaufnahme-Pipeline mit Apache Kafka und ereignisgesteuerter Architektur.',
      details: 'Einrichtung eines Systems zur automatischen Erfassung der Sensordaten aus den Messstationen.',
      überblick: 'Die Messstationen senden ihre Daten automatisch an unser System.'
    },
    sections: [
      {
        id: 'architecture',
        title: 'Systemarchitektur',
        content: {
          technik: (
            <>
              {/* KORRIGIERTER EINFÜHRUNGSBLOCK */}
              <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h5 className="font-bold text-lg mb-4 text-blue-600 dark:text-blue-400">Ein Paradigmenwechsel in der Gewässerüberwachung</h5>
                <p className="text-sm mb-4 text-gray-700 dark:text-gray-300">
                  Die Installation automatischer Messstationen zur stündlichen Erfassung von Wasserqualitätsparametern markiert einen fundamentalen Wandel. Im Gegensatz zur traditionellen, niederfrequenten Beprobung ermöglichen hochfrequente Datenreihen ein tiefgreifendes, mechanistisches Verständnis der komplexen Prozesse in aquatischen Ökosystemen.
                </p>
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <Beaker className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                    <h6 className="font-semibold text-sm">Forschung</h6>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Benötigt detaillierte, qualitätsgesicherte Daten zur Prozessanalyse.</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <Building2 className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                    <h6 className="font-semibold text-sm">Behörden & Wirtschaft</h6>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Benötigen standardisierte Kennzahlen für Berichte und Planung.</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <Users className="w-6 h-6 mx-auto mb-2 text-green-500" />
                    <h6 className="font-semibold text-sm">Öffentlichkeit</h6>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Benötigt verständliche Indikatoren zum Zustand des Gewässers.</p>
                  </div>
                </div>
              </div>

              {/* Alter Inhaltsblock */}
              <div className="space-y-4">

                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
                        <h5 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Architektur der Datenaufnahme</h5>
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-3">
                          <p>
                              Die Umstellung auf eine hochfrequente, automatisierte Erfassung von Wasserqualitätsdaten stellt einen Paradigmenwechsel gegenüber der traditionellen, niederfrequenten Beprobung dar. Sie ermöglicht ein tiefgreifendes, mechanistisches Verständnis der komplexen Prozesse in aquatischen Ökosystemen. Um diesen kontinuierlichen Datenstrom effizient und zuverlässig zu verarbeiten, wird eine skalierbare Event-Streaming-Architektur eingesetzt.
                          </p>
                          <p>
                              Das technologische Herzstück dieser Architektur ist <strong>Apache Kafka</strong>, eine Plattform für Echtzeit-Daten-Streaming. In diesem System agieren die Sensoren als "Producer", die ihre Messwerte kontinuierlich in einen dedizierten Datenstrom ("Topic") senden. Kafka fungiert als robuster und hochverfügbarer Puffer, der diese Datenströme entgegennimmt und für nachgelagerte Prozesse bereitstellt. Dieses Producer-Consumer-Muster entkoppelt die Datenerfassung von der Datenverarbeitung, was die Systemstabilität erhöht und Datenverlust verhindert, selbst wenn verarbeitende Komponenten temporär ausfallen.
                          </p>
                          <p>
                              Unmittelbar nach der Aufnahme in den Datenstrom durchläuft jeder Messwert eine erste, automatisierte Qualitätskontrolle (Aufnahme-QC). Diese erste Validierungsstufe umfasst grundlegende Prüfungen wie die Validierung des Datenformats, die Verifikation von Zeitstempeln und erste Bereichsprüfungen gegen physikalisch definierte Grenzen. Dieser Schritt dient als erste Verteidigungslinie, um technisch defekte oder völlig unplausible Datenpakete frühzeitig zu identifizieren und für die weitere Analyse zu kennzeichnen.
                          </p>
                        </div>
                      </div>

                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <h5 className="font-semibold mb-2">Technische Komponenten</h5>
                  <pre className="text-sm overflow-x-auto">
        {`# Apache Kafka Setup für Datenstreaming
        version: '3.8'
        services:
        zookeeper:
        image: confluentinc/cp-zookeeper:7.4.0
        environment:
          ZOOKEEPER_CLIENT_PORT: 2181
          
        kafka:
        image: confluentinc/cp-kafka:7.4.0
        depends_on:
          - zookeeper
        environment:
          KAFKA_BROKER_ID: 1
          KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
          KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092`}
                  </pre>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h5 className="font-semibold mb-2">Datenfluss-Diagramm</h5>
                  <div className="flex items-center justify-center space-x-4 my-4">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white">
                        <Activity className="w-8 h-8" />
                      </div>
                      <p className="text-sm mt-2">Sensoren</p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-gray-400" />
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white">
                        <Database className="w-8 h-8" />
                      </div>
                      <p className="text-sm mt-2">Kafka</p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-gray-400" />
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white">
                        <Shield className="w-8 h-8" />
                      </div>
                      <p className="text-sm mt-2">Validierung</p>
                    </div>
                  </div>
                </div>
                
              </div>
            </>
          ),
          details: (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h5 className="font-semibold mb-2">Systemübersicht</h5>
                <ul className="list-disc list-outside pl-5 space-y-2">
                  <li>Automatische Datenerfassung alle 60 Minuten</li>
                  <li>Sichere Übertragung über verschlüsselte Verbindungen</li>
                  <li>Zwischenspeicherung bei Verbindungsproblemen</li>
                  <li>Automatische Wiederholung bei Übertragungsfehlern</li>
                </ul>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h5 className="font-semibold mb-2">Vorteile für die Verwaltung</h5>
                <ul className="list-disc list-outside pl-5 space-y-2">
                  <li>Keine manuelle Dateneingabe erforderlich</li>
                  <li>Echtzeit-Überwachung möglich</li>
                  <li>Automatische Fehlererkennung</li>
                  <li>Zentrale Datenverwaltung</li>
                </ul>
              </div>
            </div>
          ),
          überblick: (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h5 className="font-semibold mb-2">So funktioniert's</h5>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white flex-shrink-0">1</div>
                    <div>
                      <p className="font-medium">Messung im See</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Die Sensoren messen stündlich Temperatur, pH-Wert und weitere Werte</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white flex-shrink-0">2</div>
                    <div>
                      <p className="font-medium">Automatische Übertragung</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Die Daten werden sicher an unsere Server gesendet</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white flex-shrink-0">3</div>
                    <div>
                      <p className="font-medium">Speicherung</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Alle Messwerte werden sicher gespeichert</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        }
      }
    ]
  },
  {
    id: 'validierung',
    title: 'Mehrstufige Datenvalidierung',
    icon: <Shield className="w-6 h-6" />,
    intro: {
      technik: 'Implementierung eines vierstufigen hierarchischen Validierungsansatzes mit Machine Learning Integration.',
      details: 'Automatische Überprüfung der Messdaten auf Plausibilität und technische Fehler.',
      überblick: 'Die Messwerte werden automatisch auf ihre Richtigkeit überprüft.'
    },
    sections: [
      {
        id: 'validation-levels',
        title: 'Validierungsstufen',
        content: {
          technik: (
            <div className="space-y-4">
              {/* Wissenschaftliche Erklärung */}
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <h5 className="font-semibold mb-2">Hierarchischer Validierungsansatz</h5>
                <p className="text-sm mb-3">
                  Unser System folgt einem mehrstufigen, hierarchischen Validierungsansatz, wie er von führenden Umweltbehörden (z.B. US-EPA) entwickelt und in der wissenschaftlichen Literatur empfohlen wird. Dieser Ansatz kombiniert automatisierte Tests mit Expertenwissen, um eine hohe Datenqualität zu gewährleisten.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white flex-shrink-0 font-bold">1</div>
                    <div>
                      <p className="font-medium">Screening & Bereichsprüfungen</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Jeder eingehende Messwert wird in Echtzeit auf die Einhaltung physikalischer und betrieblicher Grenzwerte sowie auf plausible Änderungsraten geprüft. Dies dient als erste Verteidigungslinie gegen grobe Sensorfehler.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white flex-shrink-0 font-bold">2</div>
                    <div>
                      <p className="font-medium">Statistische Anomalieerkennung</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Mithilfe von Machine-Learning-Verfahren, wie dem Isolation Forest Algorithmus aus der Bibliothek <strong>PyOD</strong>, werden subtile Ausreißer und Anomalien im Datenstrom erkannt, die einfache Bereichsprüfungen nicht finden würden. Solche Verfahren können eine Genauigkeit von über 98% erreichen.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white flex-shrink-0 font-bold">3</div>
                    <div>
                      <p className="font-medium">Prozessbasierte Plausibilisierung</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Es werden Zusammenhänge zwischen verschiedenen Parametern geprüft. Beispielsweise wird die Sauerstoffsättigung in Relation zur Wassertemperatur gesetzt, um biologisch oder physikalisch unplausible Kombinationen zu identifizieren.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white flex-shrink-0 font-bold">4</div>
                    <div>
                      <p className="font-medium">Expertenprüfung</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Alle als "verdächtig" markierten Datenpunkte werden zur manuellen Überprüfung durch Fachexperten in dieser Anwendung visualisiert und können hier kommentiert und final bewertet werden.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Aufklappbarer Python-Code */}
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg">

                {/* HIER DEN NEUEN ERKLÄR-BLOCK EINFÜGEN */}
                <div className="mb-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
                  <h5 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Bibliotheken und Methodik der Validierung</h5>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-3">
                    <p>
                      Rohe Sensordaten sind anfällig für eine Reihe von Fehlern, darunter Messspitzen (Spikes), Sensor-Drift oder Ausfälle durch Biofouling. Um eine hohe Datenqualität sicherzustellen, wird ein mehrstufiger, hierarchischer Validierungsprozess angewendet. Dieser Ansatz ist eine etablierte Best Practice internationaler Umweltbehörden und kombiniert einfache, regelbasierte Prüfungen mit komplexen statistischen Verfahren.
                    </p>
                    <p>
                      Das technische Fundament dieses Prozesses bildet ein spezialisiertes Ökosystem von Python-Bibliotheken:
                    </p>
                    <ul className="list-disc list-outside pl-5 text space-y-2 pl-2">
                      <li>
                        <strong>Pandas:</strong> Dient als Grundlage für jegliche Datenmanipulation. Sämtliche Zeitreihendaten werden in Pandas DataFrames geladen, was eine effiziente Filterung, Transformation und Analyse ermöglicht.
                      </li>
                      <li>
                        <strong>Great Expectations:</strong> Diese Bibliothek wird für die deklarative Datenvalidierung eingesetzt. Sie erlaubt die Definition von "Data Contracts" oder Erwartungen, die die Daten erfüllen müssen (z.B. "Werte müssen zwischen 0 und 14 liegen", "Spalte darf keine Null-Werte enthalten"). Dies ist ideal für die systematische Umsetzung der ersten Validierungsstufen.
                      </li>
                      <li>
                        <strong>PyOD (Python Outlier Detection):</strong> Für die fortgeschrittene statistische Validierung kommt PyOD zum Einsatz. Diese Bibliothek stellt eine umfassende Sammlung von Algorithmen zur Ausreißererkennung bereit, darunter der im Code-Beispiel gezeigte <strong>Isolation Forest</strong>. Solche Modelle können komplexe, nicht-lineare Anomalien erkennen, die einfache Bereichsprüfungen übersehen würden.
                      </li>
                    </ul>
                    <p>
                      Das Ergebnis dieses Prozesses ist kein binäres "gut" oder "schlecht". Stattdessen wird jeder einzelne Datenpunkt mit einem Qualitäts-Flag versehen (z.B. nach dem QARTOD-Standard), das die Ergebnisse der durchlaufenen Tests widerspiegelt. Diese feingranulare Kennzeichnung ist entscheidend für die nachfolgende, korrekte wissenschaftliche Auswertung und Konsolidierung der Daten.
                    </p>
                  </div>
                </div>

                <details>
                  <summary className="px-4 py-3 font-medium cursor-pointer flex justify-between items-center">
                    <span>Python Implementierungsbeispiel</span>
                    <ChevronDown className="w-5 h-5 transition-transform" />
                  </summary>
                  <div className="px-4 pb-4 border-t dark:border-gray-700">
                    <pre className="text-sm overflow-x-auto mt-4">
            {`import pandas as pd
            import numpy as np
            from scipy import stats
            from pyod.models.iforest import IForest

            class WaterQualityValidator:
                def __init__(self):
                    self.anomaly_detector = IForest(contamination=0.05)
                    
                def validate_range(self, param, value, limits):
                    """Stufe 2: Bereichsvalidierung"""
                    if limits['min'] <= value <= limits['max']:
                        return 'PASS', 1
                    elif value < limits['critical_min'] or value > limits['critical_max']:
                        return 'FAIL', 4
                    else:
                        return 'SUSPECT', 3
                        
                def validate_rate_of_change(self, series, max_change):
                    """Stufe 3: Änderungsratenprüfung"""
                    changes = series.diff()
                    spikes = changes[abs(changes) > max_change]
                    return len(spikes) == 0
                    
                def detect_anomalies(self, data):
                    """Stufe 4: ML-basierte Anomalieerkennung"""
                    self.anomaly_detector.fit(data)
                    predictions = self.anomaly_detector.predict(data)
                    return predictions  # 0 = normal, 1 = anomaly`}
                    </pre>
                  </div>
                </details>
              </div>
            </div>
          ),
          details: (
            <div className="space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <h5 className="font-semibold mb-2">Automatische Qualitätsprüfungen</h5>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span>Technische Funktionsprüfung der Sensoren</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span>Plausibilitätsprüfung der Messwerte</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span>Vergleich mit historischen Daten</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span>Erkennung von Sensorausfällen</span>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h5 className="font-semibold mb-2">Qualitätskennzeichnung</h5>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-green-100 dark:bg-green-900/30 rounded">
                    <span>✓ Validierte Daten</span>
                    <span className="text-sm font-medium">Grün</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded">
                    <span>? Unsichere Daten</span>
                    <span className="text-sm font-medium">Gelb</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-red-100 dark:bg-red-900/30 rounded">
                    <span>✗ Fehlerhafte Daten</span>
                    <span className="text-sm font-medium">Rot</span>
                  </div>
                </div>
              </div>
            </div>
          ),
          überblick: (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h5 className="font-semibold mb-2">Qualitätssicherung Ihrer Daten</h5>
                <p className="text-sm mb-3">Wir prüfen jeden Messwert automatisch:</p>
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Ist der Wert realistisch?</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">z.B. pH-Wert zwischen 6.5 und 8.5</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Activity className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Hat sich der Wert plötzlich stark verändert?</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Große Sprünge werden erkannt</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Funktioniert der Sensor richtig?</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Technische Fehler werden bemerkt</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        }
      }
    ]
  },
  {
    id: 'aggregation',
    title: 'Tageskonsolidierung',
    icon: <BarChart3 className="w-6 h-6" />,
    intro: {
      technik: 'Wissenschaftlich fundierte statistische Aggregation mit parameterspezifischen Kennwerten.',
      details: 'Zusammenfassung der stündlichen Messwerte zu aussagekräftigen Tageswerten.',
      überblick: 'Aus den stündlichen Messungen berechnen wir übersichtliche Tageswerte.'
    },
    sections: [
      {
        id: 'consolidation-methods',
        title: 'Konsolidierungsmethoden',
        content: {
          technik: (
            <div className="space-y-4">
              {/* Wissenschaftliche Erklärung */}
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <h5 className="font-semibold mb-2">Parameterspezifische Aggregation</h5>
                <p className="text-sm mb-3">
                  Die Zusammenfassung von Stunden- zu Tageswerten erfolgt nicht pauschal, sondern nach parameterspezifischen, wissenschaftlich fundierten Regeln, um die Aussagekraft der Kennwerte zu maximieren.
                </p>
                <ul className="list-disc list-outside pl-5 space-y-2 text-sm">
                    <li><strong>Temperatur:</strong> Hier sind Mittel-, Minimal- und Maximalwerte relevant, um die Tagesschwankung (Diurnale Amplitude) zu erfassen.</li>
                    <li><strong>pH-Wert:</strong> Als logarithmische Größe wird für den pH-Wert primär der <strong>Median</strong> als robuster Mittelwert verwendet, da er weniger anfällig für Extremwerte ist.</li>
                    <li><strong>Gelöster Sauerstoff:</strong> Der <strong>Minimalwert</strong> ist oft der kritischste Indikator für aquatischen Stress, weshalb er gesondert ausgewiesen wird.</li>
                </ul>
              </div>

              {/* HIER DEN NEUEN ERKLÄR-BLOCK EINFÜGEN */}
              <div className="mb-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
                <h5 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Methodik der wissenschaftlichen Datenkonsolidierung</h5>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-3">
                  <p>
                    Die Aggregation von hochfrequenten stündlichen Daten zu aussagekräftigen Tageswerten ist ein kritischer Schritt, der über eine simple arithmetische Mittelung hinausgehen muss. Ein einfacher Tagesmittelwert kann kurzzeitige, aber ökologisch entscheidende Ereignisse (wie nächtliche Sauerstoffminimum-Werte oder kurzzeitige pH-Spitzen) maskieren und zu Fehlinterpretationen des Gewässerzustands führen.
                  </p>
                  <p>
                    Der hier verfolgte Ansatz ist daher eine <strong>parameter-spezifische Konsolidierung</strong>. Die Auswahl der statistischen Kennzahlen richtet sich nach der ökologischen Relevanz und der statistischen Verteilung des jeweiligen Parameters:
                  </p>
                  <ul className="list-disc list-outside pl-5 space-y-2 pl-2">
                    <li>
                      <strong>Temperatur:</strong> Hier werden <strong>Mittelwert, Minimum und Maximum</strong> berechnet, um die volle thermische Dynamik und potenzielle Stressereignisse für aquatische Lebewesen zu erfassen.
                    </li>
                    <li>
                      <strong>pH-Wert:</strong> Aufgrund der logarithmischen Skala des pH-Wertes ist der <strong>Median</strong> ein robusterer Indikator für die zentrale Tendenz als der arithmetische Mittelwert.
                    </li>
                    <li>
                      <strong>Gelöster Sauerstoff:</strong> Das tägliche <strong>Minimum</strong> ist hier die kritischste Kennzahl, da es direkt auf hypoxische Bedingungen hinweist, die zu Fischsterben führen können.
                    </li>
                  </ul>
                  <p>
                    Ein fundamentaler Grundsatz zur Gewährleistung der Repräsentativität ist zudem der Umgang mit fehlenden Daten. Ein Tagesaggregat wird nur dann als gültig erachtet, wenn eine Mindestdatenverfügbarkeit von <strong>75% der Stundenwerte</strong> des Tages gegeben ist. Dies stellt sicher, dass die berechneten Kennzahlen den Tagesverlauf adäquat widerspiegeln.
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h5 className="font-semibold mb-2">Regeln zur Datenverfügbarkeit</h5>
                <p className="text-sm mb-3">
                  Um die Repräsentativität der Tageswerte sicherzustellen, werden international etablierte Regeln angewendet:
                </p>
                <ul className="list-disc list-outside pl-5 space-y-2 text-sm">
                    <li>Ein Tageswert wird nur berechnet, wenn mindestens <strong>75% der Stundenwerte</strong> (18 von 24) innerhalb des Tages als valide eingestuft wurden.</li>
                    <li>Kleinere Datenlücken von weniger als 3 Stunden können durch lineare Interpolation gefüllt werden, werden aber entsprechend gekennzeichnet.</li>
                </ul>
              </div>

              {/* Aufklappbarer Python-Code */}
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg">
                <details>
                  <summary className="px-4 py-3 font-medium cursor-pointer flex justify-between items-center">
                    <span>Python Implementierungsbeispiel</span>
                    <ChevronDown className="w-5 h-5 transition-transform" />
                  </summary>
                  <div className="px-4 pb-4 border-t dark:border-gray-700">
                    <pre className="text-sm overflow-x-auto mt-4">
            {`def aggregate_daily_values(hourly_data, parameter):
                """Wissenschaftlich fundierte Tagesaggregation"""
                
                if parameter == 'temperature':
                    return {
                        'mean': hourly_data.mean(),
                        'min': hourly_data.min(),
                        'max': hourly_data.max(),
                        'std': hourly_data.std(),
                        'range': hourly_data.max() - hourly_data.min()
                    }
                
                elif parameter == 'ph':
                    # pH als logarithmische Größe -> Median bevorzugt
                    return {
                        'median': hourly_data.median(),
                        'mean': hourly_data.mean(),
                        'min': hourly_data.min(),
                        'max': hourly_data.max(),
                        'iqr': hourly_data.quantile(0.75) - hourly_data.quantile(0.25)
                    }
                
                elif parameter == 'dissolved_oxygen':
                    # Minimum kritisch für aquatisches Leben
                    return {
                        'mean': hourly_data.mean(),
                        'min': hourly_data.min(),
                        'min_time': hourly_data.idxmin(),
                        'percent_below_5mg': (hourly_data < 5).sum() / len(hourly_data) * 100
                    }`}
                    </pre>
                  </div>
                </details>
              </div>
            </div>
          ),
          details: (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h5 className="font-semibold mb-2">Berechnete Tageswerte</h5>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Parameter</th>
                      <th className="text-left py-2">Kennwerte</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">Temperatur</td>
                      <td className="py-2">Mittelwert, Min, Max</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">pH-Wert</td>
                      <td className="py-2">Median, Bereich</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Sauerstoff</td>
                      <td className="py-2">Mittelwert, Minimum</td>
                    </tr>
                    <tr>
                      <td className="py-2">Trübung</td>
                      <td className="py-2">Median, Maximum</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <h5 className="font-semibold mb-2">Wichtige Hinweise</h5>
                <ul className="list-disc list-outside pl-5 space-y-1 text-sm">
                  <li>Tageswerte nur bei ausreichender Datenverfügbarkeit</li>
                  <li>Extremwerte werden gesondert dokumentiert</li>
                  <li>Unsichere Werte fließen nicht in Berechnung ein</li>
                </ul>
              </div>
            </div>
          ),
          überblick: (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h5 className="font-semibold mb-2">Von Stunden- zu Tageswerten</h5>
                <div className="space-y-3">
                  <div className="bg-white dark:bg-gray-800 p-3 rounded">
                    <p className="font-medium text-sm">Beispiel Wassertemperatur:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      24 Messungen: 8.2°C, 8.3°C, 8.5°C, ... 12.1°C
                    </p>
                    <p className="text-sm mt-2">
                      <span className="font-medium">Tageswert:</span> Durchschnitt 10.2°C, 
                      Min 8.2°C, Max 12.1°C
                    </p>
                  </div>
                  <p className="text-sm">
                    So bekommen Sie auf einen Blick die wichtigsten Informationen des Tages!
                  </p>
                </div>
              </div>
            </div>
          )
        }
      }
    ]
  },
  {
    id: 'quality-flags',
    title: 'Qualitätskennzeichnung',
    icon: <CheckCircle2 className="w-6 h-6" />,
    intro: {
      technik: 'Implementierung internationaler Standards (QARTOD, SeaDataNet) für Datenqualitätsflags.',
      details: 'Klare Kennzeichnung der Datenqualität für verlässliche Entscheidungen.',
      überblick: 'Jeder Messwert bekommt eine Qualitätsbewertung, damit Sie wissen, wie verlässlich er ist.'
    },
    sections: [
      {
        id: 'flagging-system',
        title: 'Qualitätssystem',
        content: {
          technik: (
            <div className="space-y-4">

                {/* HIER DEN NEUEN ERKLÄR-BLOCK EINFÜGEN */}
                <div className="mb-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
                  <h5 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Methodik der Qualitätskennzeichnung</h5>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-3">
                    <p>
                      Ein fundamentaler Grundsatz der wissenschaftlichen Datenverarbeitung ist, fehlerhafte Daten niemals zu löschen. Stattdessen wird jeder einzelne Messwert mit einer Qualitätskennzeichnung, einem sogenannten "Flag", versehen.  Dieser Ansatz gewährleistet die Transparenz und Reproduzierbarkeit der gesamten Prozesskette und ermöglicht es nachgelagerten Nutzern, fundierte Entscheidungen über die Verwendung der Daten zu treffen.
                    </p>
                    <p>
                      Um eine hohe Interoperabilität zu gewährleisten, orientiert sich unser System am <strong>QARTOD-Standard</strong> (Quality Assurance of Real-Time Oceanographic Data), der von US-Behörden wie der NOAA entwickelt wurde.  QARTOD ist mehr als nur eine Liste von Flags; es ist ein ganzes Framework, das eine Reihe von standardisierten Tests für Echtzeitdaten definiert.
                    </p>
                    <p>
                      Die zugewiesenen Flags steuern direkt die weitere Verarbeitung in unserer Pipeline:
                    </p>
                    <ul className="list-disc list-outside pl-5 space-y-1">
                      <li><strong>Flag 1 (Pass):</strong> Nur Daten, die alle automatisierten Tests bestanden haben, werden für die Berechnung offizieller Tageskennzahlen und für Grenzwertvergleiche herangezogen. </li>
                      <li><strong>Flag 3 (Suspect):</strong> Als "verdächtig" eingestufte Daten werden von den finalen Berechnungen ausgeschlossen, aber für die Expertenansicht visualisiert. Sie können auf interessante, aber ungesicherte Ereignisse hindeuten und sind der primäre Input für die manuelle Expertenprüfung (Level-2-Validierung). </li>
                      <li><strong>Flag 4 (Fail):</strong> Daten, die als fehlerhaft erkannt wurden, werden für keine weiteren Berechnungen verwendet. Sie verbleiben jedoch mit dieser Kennzeichnung im Rohdatensatz, um eine lückenlose Dokumentation von Sensorproblemen zu gewährleisten. </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <h5 className="font-semibold mb-2">Qualitäts-Flags nach QARTOD-Standard</h5>
                    <p className="text-sm mb-3">
                        Unser System orientiert sich an internationalen Standards zur Qualitätskennzeichnung wie <strong>QARTOD</strong> (Quality Assurance of Real-Time Oceanographic Data) und <strong>SeaDataNet</strong>, um die Interoperabilität und Vergleichbarkeit der Daten zu gewährleisten. Die einfachen Farb-Codes der App lassen sich wie folgt zuordnen:
                    </p>
                    <div className="space-y-2">
                        <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-green-500 text-white rounded flex items-center justify-center font-bold flex-shrink-0">1</div>
                            <div>
                                <p className="font-medium">Pass (Grün)</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Daten haben alle automatischen QC-Tests bestanden.</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-yellow-500 text-white rounded flex items-center justify-center font-bold flex-shrink-0">3</div>
                            <div>
                                <p className="font-medium">Suspect (Gelb)</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Potenziell fehlerhafte Daten, die einer Expertenprüfung bedürfen. Die Daten sind für Trendanalysen, aber nicht für Grenzwertüberprüfungen geeignet.</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-red-500 text-white rounded flex items-center justify-center font-bold flex-shrink-0">4</div>
                            <div>
                                <p className="font-medium">Fail (Rot)</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Die Daten haben kritische Tests nicht bestanden und sollten nicht verwendet werden.</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-gray-500 text-white rounded flex items-center justify-center font-bold flex-shrink-0">2</div>
                            <div>
                                <p className="font-medium">Not Evaluated</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Daten, die noch keinem QC-Test unterzogen wurden (z.B. bei Systemausfall).</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          ),
          details: (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h5 className="font-semibold mb-2">Qualitätsstufen für Ihre Entscheidungen</h5>
                <div className="space-y-3">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded">
                    <p className="font-medium">✓ Verwendbar für alle Zwecke</p>
                    <p className="text-sm">Berichte, Analysen, Veröffentlichungen</p>
                  </div>
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded">
                    <p className="font-medium">⚠ Mit Vorsicht verwenden</p>
                    <p className="text-sm">Trends ok, aber keine kritischen Entscheidungen</p>
                  </div>
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded">
                    <p className="font-medium">✗ Nicht verwenden</p>
                    <p className="text-sm">Nur zur Dokumentation von Problemen</p>
                  </div>
                </div>
              </div>
            </div>
          ),
          überblick: (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h5 className="font-semibold mb-2">Vertrauen Sie unseren Daten</h5>
                <div className="text-center my-4">
                  <div className="inline-flex items-center space-x-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-sm mt-1">Gut</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-sm mt-1">Unsicher</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                        <X className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-sm mt-1">Fehlerhaft</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-center">
                  Jeder Wert wird geprüft und gekennzeichnet!
                </p>
              </div>
            </div>
          )
        }
      }
    ]
  },
  {
    id: 'api-export',
    title: 'Datenbereitstellung & API',
    icon: <Cloud className="w-6 h-6" />,
    intro: {
      technik: 'RESTful API mit OGC SensorThings Standard und JSON/WaterML 2.0 Export.',
      details: 'Automatisierte Bereitstellung der validierten Daten für verschiedene Nutzergruppen.',
      überblick: 'Die geprüften Daten werden öffentlich und kostenlos zur Verfügung gestellt.'
    },
    sections: [
      {
        id: 'api-design',
        title: 'Schnittstellen & Formate',
        content: {
          technik: (
            <div className="space-y-4">
              {/* HIER DEN NEUEN ERKLÄR-BLOCK EINFÜGEN */}
              <div className="mb-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
                <h5 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Technik und Standards der Datenbereitstellung</h5>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-3">
                  <p>
                    Die Bereitstellung der qualitätsgesicherten Daten folgt den <strong>FAIR-Prinzipien</strong> (Findable, Accessible, Interoperable, Reusable). Ziel ist es, die Daten nicht nur als Download anzubieten, sondern über eine standardisierte, maschinenlesbare Schnittstelle (API) zugänglich zu machen, um eine maximale Interoperabilität und Nachnutzbarkeit durch Dritte zu gewährleisten.
                  </p>
                  <p>
                    Als Kerntechnologie wird die <strong>OGC SensorThings API</strong> eingesetzt.  Dieser vom Open Geospatial Consortium (OGC) standardisierte, REST-basierte Ansatz ist speziell für das Internet der Dinge (IoT) und Sensordaten konzipiert. Er definiert ein einheitliches Datenmodell mit Entitäten wie `Thing` (Messstation), `Datastream` (Zeitreihe eines Parameters) und `Observation` (Einzelmessung).  Die Verwendung dieses Standards stellt sicher, dass externe Forscher oder Behörden die Daten ohne projektspezifischen Code direkt in ihre eigenen Systeme und Analysen integrieren können.
                  </p>
                  <p>
                    Die technische Umsetzung der API erfolgt mit <strong>FastAPI</strong>, einem modernen Python-Framework, das sich durch hohe Performance und automatische Erstellung von interaktiven Dokumentationen (via OpenAPI) auszeichnet.  Neben dem primären JSON-Format der SensorThings API wird zudem die Bereitstellung im <strong>WaterML 2.0</strong>-Format unterstützt, einem weiteren wichtigen OGC-Standard für hydrologische Zeitreihendaten.  Die Architektur ist somit auf die Einhaltung der europäischen <strong>INSPIRE-Richtlinien</strong> für Geodaten ausgerichtet.  
                  </p>
                </div>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <h5 className="font-semibold mb-2">API Endpoints</h5>
                <pre className="text-sm overflow-x-auto">
{`# FastAPI Implementation
from fastapi import FastAPI, Query
from datetime import datetime, date

app = FastAPI(title="Water Quality API")

@app.get("/api/v1/observations")
async def get_observations(
    station_id: str,
    parameter: str,
    start_date: date,
    end_date: date,
    quality_flags: List[int] = Query([1,2,3])
):
    """OGC SensorThings konformer Endpoint"""
    return {
        "@iot.count": 1440,
        "value": [
            {
                "@iot.id": "obs123",
                "phenomenonTime": "2025-01-20T10:00:00Z",
                "result": 7.8,
                "resultQuality": {
                    "qartod_flag": 1,
                    "validation_level": 2
                }
            }
        ]
    }`}
                </pre>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h5 className="font-semibold mb-2">Unterstützte Standards</h5>
                <ul className="list-disc list-outside pl-5 space-y-1 text-sm">
                  <li>OGC SensorThings API 1.1</li>
                  <li>WaterML 2.0 für Zeitreihen</li>
                  <li>JSON-LD mit schema.org Vokabular</li>
                  <li>CSV mit standardisierten Headers</li>
                </ul>
              </div>
            </div>
          ),
          details: (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h5 className="font-semibold mb-2">Datenzugriff für Ihre Anwendungen</h5>
                <div className="space-y-2">
                  <div className="flex items-start space-x-3">
                    <Database className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Excel/CSV Download</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Für Berichte und Analysen</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Cloud className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Web-API</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Für automatisierte Systeme</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <BarChart3 className="w-5 h-5 text-purple-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Dashboard</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Für visuelle Überwachung</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ),
          überblick: (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h5 className="font-semibold mb-2">So kommen Sie an die Daten</h5>
                <div className="space-y-3">
                  <div className="p-3 bg-white dark:bg-gray-800 rounded">
                    <p className="font-medium">📊 Webseite besuchen</p>
                    <p className="text-sm">Schauen Sie sich Grafiken und aktuelle Werte an</p>
                  </div>
                  <div className="p-3 bg-white dark:bg-gray-800 rounded">
                    <p className="font-medium">📥 Daten herunterladen</p>
                    <p className="text-sm">Als Excel-Datei für eigene Auswertungen</p>
                  </div>
                  <div className="p-3 bg-white dark:bg-gray-800 rounded">
                    <p className="font-medium">📱 App nutzen</p>
                    <p className="text-sm">Demnächst: Mobile App für unterwegs</p>
                  </div>
                </div>
              </div>
            </div>
          )
        }
      }
    ]
  }, 
  {
    id: 'bpmn-prozess',
    title: 'Detaillierter Prozessablauf (BPMN)',
    icon: <Network className="w-6 h-6" />,
    intro: {
      technik: 'Eine formale Darstellung des End-to-End-Prozesses von der Datenerfassung bis zur Bereitstellung nach dem BPMN 2.0 Standard.',
      details: 'Eine formale Darstellung des End-to-End-Prozesses von der Datenerfassung bis zur Bereitstellung nach dem BPMN 2.0 Standard.',
      überblick: 'Ein detaillierter Blick auf alle Schritte, die unsere Daten durchlaufen.'
    },
    sections: [{
      id: 'prozess-modell',
      title: 'Prozessmodell',
      content: {
        technik: (
          <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
            <p>Das BPMN-Modell (Business Process Model and Notation) zeigt den vollständigen Datenverarbeitungsprozess von den WAMO-Sensoren bis zur Open Data Plattform. Es umfasst:</p>
            
            <div>
              <h6 className="font-semibold text-gray-800 dark:text-gray-200">Hauptkomponenten:</h6>
              <ul className="list-disc list-outside pl-5 mt-1 space-y-1">
                <li><b>5 Verantwortungsbereiche (Lanes):</b> Sensoren, automatisierte Validierung, Expertenprüfung, Konsolidierung und ODP</li>
                <li><b>Automatisierte Validierungsschritte:</b> Syntax-Check, Gross Range Check, Stuck Value Check, Spike Check</li>
                <li><b>Qualitätssicherung:</b> Level 0 → Level 1 → Level 2 Transformation</li>
                <li><b>Freigabeprozesse:</b> Automatisch und manuell durch Experten/Administration</li>
              </ul>
            </div>

            <div>
              <h6 className="font-semibold text-gray-800 dark:text-gray-200">Wichtige Entscheidungspunkte:</h6>
              <ul className="list-disc list-outside pl-5 mt-1 space-y-1">
                <li>Syntax-Validierung nach Datenempfang</li>
                <li>Qualitätsprüfung nach automatisierter Validierung</li>
                <li>Expertenfreigabe für Level 2 Daten</li>
                <li>Administrative Freigabe vor ODP-Upload</li>
              </ul>
            </div>

            <div>
              <h6 className="font-semibold text-gray-800 dark:text-gray-200">Besonderheiten:</h6>
              <ul className="list-disc list-outside pl-5 mt-1 space-y-1">
                <li>Timer-Event für tägliche Konsolidierung um 24:00 Uhr</li>
                <li>Fehlerbehandlung mit Korrekturschleifen</li>
                <li>Datenspeicher für verschiedene Qualitätslevel</li>
                <li>Rückkopplungen bei fehlgeschlagenen Prüfungen</li>
              </ul>
            </div>

            <p className="pt-2 border-t dark:border-gray-700">
              Das Modell entspricht den in den Begleitdokumenten beschriebenen Python-Validierungsschritten und zeigt die praktische Umsetzung des wissenschaftlichen Frameworks in einem operationellen Prozess.
            </p>
            {/* NEU: Die eingefügte Grafik */}
            <div className="mt-4 pt-4 border-t dark:border-gray-700">
              <h6 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Prozessvisualisierung</h6>
              <button 
                onClick={() => setModalImageUrl(bpmnProzessExperte)}
                className="w-full p-2 bg-white dark:bg-gray-200 rounded-lg transition-transform hover:scale-[1.02] cursor-pointer"
              >
                <img src={bpmnProzessExperte} alt="BPMN Prozessablauf" className="w-full h-auto rounded" />
              </button>
              <p className="text-xs text-center mt-1 text-gray-500">Klicken zum Vergrößern</p>
            </div>
          </div>
        ),
        details: (
          <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
            <p>Das BPMN-Modell (Business Process Model and Notation) zeigt den vollständigen Datenverarbeitungsprozess von den WAMO-Sensoren bis zur Open Data Plattform. Es umfasst:</p>
            
            <div>
              <h6 className="font-semibold text-gray-800 dark:text-gray-200">Hauptkomponenten:</h6>
              <ul className="list-disc list-outside pl-5 mt-1 space-y-1">
                <li><b>5 Verantwortungsbereiche (Lanes):</b> Sensoren, automatisierte Validierung, Expertenprüfung, Konsolidierung und ODP</li>
                <li><b>Automatisierte Validierungsschritte:</b> Syntax-Check, Gross Range Check, Stuck Value Check, Spike Check</li>
                <li><b>Qualitätssicherung:</b> Level 0 → Level 1 → Level 2 Transformation</li>
                <li><b>Freigabeprozesse:</b> Automatisch und manuell durch Experten/Administration</li>
              </ul>
            </div>

            <div>
              <h6 className="font-semibold text-gray-800 dark:text-gray-200">Wichtige Entscheidungspunkte:</h6>
              <ul className="list-disc list-outside pl-5 mt-1 space-y-1">
                <li>Syntax-Validierung nach Datenempfang</li>
                <li>Qualitätsprüfung nach automatisierter Validierung</li>
                <li>Expertenfreigabe für Level 2 Daten</li>
                <li>Administrative Freigabe vor ODP-Upload</li>
              </ul>
            </div>
            
            <p className="pt-2 border-t dark:border-gray-700">
              Das Modell entspricht den in den Begleitdokumenten beschriebenen Python-Validierungsschritten und zeigt die praktische Umsetzung des wissenschaftlichen Frameworks in einem operationellen Prozess.
            </p>

            {/* NEU: Die eingefügte Grafik */}
            <div className="mt-4 pt-4 border-t dark:border-gray-700">
              <h6 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Prozessvisualisierung</h6>
              <button 
                onClick={() => setModalImageUrl(bpmnProzessExperte)}
                className="w-full p-2 bg-white dark:bg-gray-200 rounded-lg transition-transform hover:scale-[1.02] cursor-pointer"
              >
                <img src={bpmnProzessExperte} alt="BPMN Prozessablauf" className="w-full h-auto rounded" />
              </button>
              <p className="text-xs text-center mt-1 text-gray-500">Klicken zum Vergrößern</p>
            </div>
          </div>
        ),
        überblick: (
        <div className="space-y-6 text-gray-700 dark:text-gray-300">
          {/* IHR VOLLSTÄNDIGER TEXT */}
          <div className="space-y-4">
            <h5 className="font-bold text-lg text-gray-800 dark:text-gray-200">Der Weg Ihrer Wasserqualitätsdaten - einfach erklärt</h5>
            <p className="text-sm">
              Unsere acht schwimmenden Messstationen in den Seen des Landkreises sind wie kleine Laboratorien, die rund um die Uhr arbeiten. Aber wie wird aus einem technischen Messwert eine verlässliche Information, auf die Sie sich verlassen können?
            </p>

            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <h6 className="font-semibold mb-2">🔍 Schritt 1: Sammeln und Prüfen</h6>
              <p className="text-sm">Jede Stunde senden die Stationen automatisch ihre Messwerte an uns. Diese Rohdaten sind wie ungewaschenes Gemüse aus dem Garten - sie enthalten noch "Unreinheiten" und müssen erst aufbereitet werden.</p>
              <p className="text-sm mt-2"><b>Was kann schiefgehen?</b></p>
              <ul className="text-sm list-disc list-outside pl-5 mt-1">
                <li>Ein Blatt schwimmt vor den Sensor → falsche Trübungswerte</li>
                <li>Technischer Defekt → unrealistische Temperaturen von 50°C im Winter</li>
                <li>Übertragungsfehler → unleserliche oder fehlende Daten</li>
              </ul>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <h6 className="font-semibold mb-2">⚙️ Schritt 2: Automatische Qualitätsprüfung</h6>
              <p className="text-sm">Unser Computer-System prüft jeden einzelnen Messwert automatisch:</p>
              <ul className="text-sm list-disc list-outside pl-5 mt-1">
                <li><b>Plausibilitätsprüfung:</b> Kann die Wassertemperatur in unserem See wirklich 45°C betragen?</li>
                <li><b>Vergleich mit Nachbarwerten:</b> Springt ein Wert plötzlich von 15°C auf 30°C und wieder zurück?</li>
                <li><b>Sensorfehler-Erkennung:</b> Meldet ein Sensor stundenlang exakt denselben Wert?</li>
              </ul>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <h6 className="font-semibold mb-2">👨‍🔬 Schritt 3: Expertenprüfung</h6>
              <p className="text-sm">Unsere Fachleute schauen sich auffällige Werte genau an. Sie wissen zum Beispiel:</p>
              <ul className="text-sm list-disc list-outside pl-5 mt-1">
                <li>Nach einem Gewitter können Trübungswerte natürlich ansteigen</li>
                <li>In heißen Sommernächten kann der Sauerstoffgehalt tatsächlich kritisch werden</li>
                <li>Bestimmte Werte müssen im Zusammenhang betrachtet werden</li>
              </ul>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <h6 className="font-semibold mb-2">✅ Schritt 4: Finale Freigabe</h6>
              <p className="text-sm">Erst wenn alle Prüfungen abgeschlossen sind, werden die Daten für Sie bereitgestellt. Sie erhalten dann:</p>
              <ul className="text-sm list-disc list-outside pl-5 mt-1">
                <li>Aktuelle Messwerte für Ihre Freizeitplanung</li>
                <li>Verlässliche Warnungen bei Problemen</li>
                <li>Transparente Informationen über die Datenqualität</li>
              </ul>
            </div>
          </div>

          {/* DIE DAZUGEHÖRIGE GRAFIK */}
          <div className="mt-4 pt-4 border-t dark:border-gray-700">
            <button 
              onClick={() => setModalImageUrl(bpmnProzessBuerger)}
              className="w-full p-2 bg-white dark:bg-gray-200 rounded-lg transition-transform hover:scale-[1.02] cursor-pointer"
            >
              <img src={bpmnProzessBuerger} alt="Vereinfachter Prozessablauf" className="w-full h-auto rounded" />
            </button>
            <p className="text-xs text-center mt-1 text-gray-500">Klicken zum Vergrößern</p>
          </div>

          {/* DER NUTZEN */}
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg mt-6">
            <h6 className="font-bold text-lg mb-2 text-green-800 dark:text-green-300">Was bedeutet das für Sie?</h6>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start space-x-2"><span>🏊‍♀️</span><span><b>Sicher Baden:</b> Sie können sich darauf verlassen, dass Badeverbote nur ausgesprochen werden, wenn wirklich Gefahr besteht - nicht wegen eines Sensorfehlers.</span></li>
              <li className="flex items-start space-x-2"><span>🎣</span><span><b>Bessere Planung:</b> Angeln, Segeln oder Schwimmen - Sie haben verlässliche Informationen für Ihre Freizeitaktivitäten.</span></li>
              <li className="flex items-start space-x-2"><span>🏠</span><span><b>Werterhalt:</b> Saubere Gewässer steigern die Attraktivität und den Wert unserer Region.</span></li>
              <li className="flex items-start space-x-2"><span>🔍</span><span><b>Transparenz:</b> Sie können jederzeit nachvollziehen, wie die Daten entstanden sind und wie verlässlich sie sind.</span></li>
            </ul>
            <p className="text-sm mt-3 font-semibold">Kurz gesagt: Wir behandeln Ihre Sicherheit und die Qualität der Informationen genauso sorgfältig, wie Sie es von uns erwarten würden.</p>
          </div>
        </div>
        )
      }
    }]
  },
    // NEU: 4. Code-Katalog
  {
    id: 'code-katalog',
    title: 'Code-Katalog',
    icon: <Code className="w-6 h-6" />,
    intro: {
      technik: 'Der vollständige, produktive Python-Code (später Open-Source zur Nachnutzung) für die gesamte Datenverarbeitungs-Pipeline, transparent und nachnutzbar.',
      details: 'Der vollständige, produktive Python-Code (später Open-Source zur Nachnutzung) für die gesamte Datenverarbeitungs-Pipeline, transparent und nachnutzbar.',
      überblick: 'Der offengelegte Programmcode (später Open-Source zur Nachnutzung), der für die Prüfung und Aufbereitung der Daten verwendet wird.'
    },
    sections: [{
      id: 'code-collection',
      title: 'Python-Skripte',
      content: {
        technik: (
            <div className="space-y-4 text-sm">
                <p className="text-gray-600 dark:text-gray-400">
                  Dieser Katalog zentralisiert die Kern-Logiken der Datenverarbeitungspipeline. Die folgenden Python-Skripte dienen als Referenzimplementierung und Grundlage für das operative System. Zukünftig sollen sie als Open Source zur Verfügung gestellt werden.
                </p>
                
                {[
                  {
                    title: "1. Validierungs-Klasse (validator.py)",
                    code: `import pandas as pd
        from pyod.models.iforest import IForest

        class WaterQualityValidator:
            def __init__(self):
                self.anomaly_detector = IForest(contamination=0.05)
                
            def validate_range(self, param, value, limits):
                """Stufe 2: Bereichsvalidierung"""
                if limits['min'] <= value <= limits['max']:
                    return 'PASS', 1
                elif value < limits['critical_min'] or value > limits['critical_max']:
                    return 'FAIL', 4
                else:
                    return 'SUSPECT', 3
                    
            def validate_rate_of_change(self, series, max_change):
                """Stufe 3: Änderungsratenprüfung"""
                changes = series.diff()
                spikes = changes[abs(changes) > max_change]
                return len(spikes) == 0
                
            def detect_anomalies(self, data):
                """Stufe 4: ML-basierte Anomalieerkennung"""
                self.anomaly_detector.fit(data)
                predictions = self.anomaly_detector.predict(data)
                return predictions  # 0 = normal, 1 = anomaly`,
                    explanation: explanations.validator
                  },
                  {
                    title: "2. Konsolidierungs-Funktion (consolidator.py)",
                    code: `def aggregate_daily_values(hourly_data, parameter):
                """Wissenschaftlich fundierte Tagesaggregation"""
                
                # Sicherstellen, dass genügend Daten vorhanden sind (mind. 75%)
                if hourly_data.count() < 18:
                    return {'error': 'Nicht genügend valide Daten für eine repräsentative Aggregation.'}

                if parameter == 'temperature':
                    return {'mean': hourly_data.mean(), 'min': hourly_data.min(), 'max': hourly_data.max()}
                
                elif parameter == 'ph':
                    # pH als logarithmische Größe -> Median bevorzugt
                    return {'median': hourly_data.median(), 'min': hourly_data.min(), 'max': hourly_data.max()}
                
                elif parameter == 'dissolved_oxygen':
                    # Das tägliche Minimum ist hier die ökologisch kritischste Kennzahl
                    return {'mean': hourly_data.mean(), 'min': hourly_data.min()}`,
                    explanation: explanations.consolidator
                  },
                  {
                    title: "3. API-Endpunkt (Datenbereitstellung)",
                    code: `# FastAPI Implementation
        from fastapi import FastAPI, Query
        from datetime import date
        from typing import List

        app = FastAPI(title="Water Quality API", version="1.0")

        @app.get("/api/v1/observations")
        async def get_observations(
            station_id: str,
            parameter: str,
            start_date: date,
            end_date: date,
            quality_flags: List[int] = Query([1]) # Standardmäßig nur "gute" Daten abfragen
        ):
            """Stellt validierte und aggregierte Daten nach dem OGC SensorThings Standard bereit."""
            
            # Hier würde die Logik zur Abfrage der finalen Datenbanktabelle stehen
            # z.B. query_database(station_id, parameter, start_date, end_date, quality_flags)
            
            return {
                "value": [
                    {
                        "phenomenonTime": "2025-04-28T00:00:00Z",
                        "result": 10.2, # Beispiel: Tagesmittel der Temperatur
                        "parameters": { "station": station_id, "parameter": parameter }
                    }
                ]
            }`,
                    explanation: explanations.api
                  }
                ].map(item => (
                  <div key={item.title} className="bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <details>
                      <summary className="px-4 py-3 font-medium cursor-pointer flex justify-between items-center">
                        <span className="flex-grow">{item.title}</span>
                        <button 
                          onClick={(e) => { e.preventDefault(); setCodeExplanation(item.explanation); }}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline mr-4"
                        >
                          (Was tut dieser Code?)
                        </button>
                        <ChevronDown className="w-5 h-5 transition-transform" />
                      </summary>
                      <div className="px-4 pb-4 border-t dark:border-gray-700">
                        <pre className="text-sm overflow-x-auto mt-4">{item.code}</pre>
                      </div>
                    </details>
                  </div>
                ))}
              </div>
        ),
        details: (
            <div className="space-y-4 text-sm">
                <p className="text-gray-600 dark:text-gray-400">
                  Dieser Katalog zentralisiert die Kern-Logiken der Datenverarbeitungspipeline. Die folgenden Python-Skripte dienen als Referenzimplementierung und Grundlage für das operative System. Zukünftig sollen sie als Open Source zur Verfügung gestellt werden.
                </p>
                
                {[
                  {
                    title: "1. Validierungs-Klasse (validator.py)",
                    code: `import pandas as pd
        from pyod.models.iforest import IForest

        class WaterQualityValidator:
            def __init__(self):
                self.anomaly_detector = IForest(contamination=0.05)
                
            def validate_range(self, param, value, limits):
                """Stufe 2: Bereichsvalidierung"""
                if limits['min'] <= value <= limits['max']:
                    return 'PASS', 1
                elif value < limits['critical_min'] or value > limits['critical_max']:
                    return 'FAIL', 4
                else:
                    return 'SUSPECT', 3
                    
            def validate_rate_of_change(self, series, max_change):
                """Stufe 3: Änderungsratenprüfung"""
                changes = series.diff()
                spikes = changes[abs(changes) > max_change]
                return len(spikes) == 0
                
            def detect_anomalies(self, data):
                """Stufe 4: ML-basierte Anomalieerkennung"""
                self.anomaly_detector.fit(data)
                predictions = self.anomaly_detector.predict(data)
                return predictions  # 0 = normal, 1 = anomaly`,
                    explanation: explanations.validator
                  },
                  {
                    title: "2. Konsolidierungs-Funktion (consolidator.py)",
                    code: `def aggregate_daily_values(hourly_data, parameter):
                """Wissenschaftlich fundierte Tagesaggregation"""
                
                # Sicherstellen, dass genügend Daten vorhanden sind (mind. 75%)
                if hourly_data.count() < 18:
                    return {'error': 'Nicht genügend valide Daten für eine repräsentative Aggregation.'}

                if parameter == 'temperature':
                    return {'mean': hourly_data.mean(), 'min': hourly_data.min(), 'max': hourly_data.max()}
                
                elif parameter == 'ph':
                    # pH als logarithmische Größe -> Median bevorzugt
                    return {'median': hourly_data.median(), 'min': hourly_data.min(), 'max': hourly_data.max()}
                
                elif parameter == 'dissolved_oxygen':
                    # Das tägliche Minimum ist hier die ökologisch kritischste Kennzahl
                    return {'mean': hourly_data.mean(), 'min': hourly_data.min()}`,
                    explanation: explanations.consolidator
                  },
                  {
                    title: "3. API-Endpunkt (Datenbereitstellung)",
                    code: `# FastAPI Implementation
        from fastapi import FastAPI, Query
        from datetime import date
        from typing import List

        app = FastAPI(title="Water Quality API", version="1.0")

        @app.get("/api/v1/observations")
        async def get_observations(
            station_id: str,
            parameter: str,
            start_date: date,
            end_date: date,
            quality_flags: List[int] = Query([1]) # Standardmäßig nur "gute" Daten abfragen
        ):
            """Stellt validierte und aggregierte Daten nach dem OGC SensorThings Standard bereit."""
            
            # Hier würde die Logik zur Abfrage der finalen Datenbanktabelle stehen
            # z.B. query_database(station_id, parameter, start_date, end_date, quality_flags)
            
            return {
                "value": [
                    {
                        "phenomenonTime": "2025-04-28T00:00:00Z",
                        "result": 10.2, # Beispiel: Tagesmittel der Temperatur
                        "parameters": { "station": station_id, "parameter": parameter }
                    }
                ]
            }`,
                    explanation: explanations.api
                  }
                ].map(item => (
                  <div key={item.title} className="bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <details>
                      <summary className="px-4 py-3 font-medium cursor-pointer flex justify-between items-center">
                        <span className="flex-grow">{item.title}</span>
                        <button 
                          onClick={(e) => { e.preventDefault(); setCodeExplanation(item.explanation); }}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline mr-4"
                        >
                          (Was tut dieser Code?)
                        </button>
                        <ChevronDown className="w-5 h-5 transition-transform" />
                      </summary>
                      <div className="px-4 pb-4 border-t dark:border-gray-700">
                        <pre className="text-sm overflow-x-auto mt-4">{item.code}</pre>
                      </div>
                    </details>
                  </div>
                ))}
              </div>
        ),
        überblick: (
          <div className="space-y-6 text-sm text-gray-700 dark:text-gray-300">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h6 className="font-semibold text-green-800 dark:text-green-300 mb-2">Wie funktioniert die Datenverarbeitung im Hintergrund?</h6>
              <p>
                Man kann sich den Weg der Daten wie ein Fließband in einer Fabrik vorstellen. Jede Station hat eine spezielle Aufgabe, um aus einem Rohprodukt ein fertiges, geprüftes Produkt zu machen.
              </p>
            </div>

            {/* Visuelle Darstellung der Pipeline */}
            <div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-center text-xs font-medium">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex flex-col items-center justify-center space-y-1">
                  <Activity className="w-6 h-6 text-blue-500" />
                  <span>1. Messung</span>
                </div>
                <div className="flex items-center justify-center"><ChevronRight className="w-5 h-5 text-gray-400" /></div>
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex flex-col items-center justify-center space-y-1">
                  <Shield className="w-6 h-6 text-purple-500" />
                  <span>2. Qualitäts-Check</span>
                </div>
                <div className="flex items-center justify-center"><ChevronRight className="w-5 h-5 text-gray-400" /></div>
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex flex-col items-center justify-center space-y-1">
                  <BarChart3 className="w-6 h-6 text-green-500" />
                  <span>3. Tages-Info</span>
                </div>
              </div>
            </div>
            
            <ul className="list-decimal list-outside pl-5 space-y-2">
                <li>Die Sensoren im See senden ihre stündlichen Messwerte.</li>
                <li>Ein Computerprogramm prüft sofort, ob die Werte plausibel sind und kennzeichnet sie mit einer Qualitäts-Ampel.</li>
                <li>Einmal pro Nacht werden alle "grünen" Werte des Tages zu einer einzigen, aussagekräftigen Tages-Information (z.B. "Durchschnittstemperatur") zusammengefasst, die Sie dann auf der Webseite sehen.</li>
            </ul>
          </div>
        )
      }
    }]
  },
  {
    id: 'kosten-nutzen-analyse',
    title: 'Kosten-Nutzen-Analyse',
    icon: <Scale className="w-6 h-6" />,
    intro: {
      technik: 'Eine strategische Gegenüberstellung der Kosten, Flexibilität und langfristigen Wartung zwischen einer maßgeschneiderten Eigenentwicklung und dem Zukauf von Standardsoftware.',
      details: 'Eine strategische Gegenüberstellung der Kosten, Flexibilität und langfristigen Wartung zwischen einer maßgeschneiderten Eigenentwicklung und dem Zukauf von Standardsoftware.',
      überblick: 'Hier wird abgewogen, ob es besser ist, die Software für dieses Projekt selbst zu entwickeln oder eine fertige Lösung zu kaufen.'
    },
    sections: [
      {
        id: 'comparison',
        title: 'Eigenentwicklung vs. Softwarekauf',
        content: {
          technik: (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Option 1: Eigenentwicklung */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold text-lg mb-2">Option 1: Eigenentwicklung (Intern)</h3>
                  <p className="text-sm mb-4">Diese Option nutzt vorhandene Open-Source-Bibliotheken (z.B. Pandas in Python) und interne Personalressourcen. Die Logik für Validierung und Konsolidierung wird spezifisch für die Anforderungen des Projekts programmiert.</p>
                  <h4 className="font-semibold mb-2">Geschätzter Kostenrahmen<br/>(Interner Satz: 300 €/Tag)</h4>
                  <table className="w-full text-sm mb-4">
                    <thead className="text-left">
                      <tr className="border-b dark:border-gray-600">
                        <th className="py-1">Phase</th>
                        <th className="py-1">Aufwand (Tage)</th>
                        <th className="py-1">Kosten</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b dark:border-gray-700"><td>Konzeption & Architektur</td><td>2 - 4</td><td>600 - 1.200 €</td></tr>
                      <tr className="border-b dark:border-gray-700"><td>Entwicklung & Implementierung</td><td>5 - 10</td><td>1.500 - 3.000 €</td></tr>
                      <tr className="border-b dark:border-gray-700"><td>Test & Validierung</td><td>3 - 5</td><td>900 - 1.500 €</td></tr>
                      <tr className="border-b dark:border-gray-700"><td>Dokumentation & Deployment</td><td>2 - 3</td><td>600 - 900 €</td></tr>
                      <tr className="font-bold"><td>Gesamt (inkl. 20% Puffer)</td><td>14 - 26</td><td>ca. 4.320 - 7.920 €</td></tr>
                    </tbody>
                  </table>
                  <h5 className="font-semibold text-green-600 dark:text-green-500">Vorteile:</h5>
                  <ul className="list-disc list-outside pl-5 text-sm space-y-1 mt-1">
                    <li><b>Maximale Flexibilität:</b> Regeln können jederzeit angepasst und erweitert werden.</li>
                    <li><b>Keine Lizenzkosten:</b> Vollständige Kontrolle über den Code und keine Abhängigkeit von Herstellern.</li>
                    <li><b>Wissensaufbau im Haus:</b> Die Expertise bleibt in der Organisation.</li>
                    <li><b>Geringere Gesamtkosten:</b> Deutlich günstiger bei Nutzung interner Ressourcen.</li>
                  </ul>
                  <h5 className="font-semibold text-red-600 dark:text-red-500 mt-4">Nachteile:</h5>
                  <ul className="list-disc list-outside pl-5 text-sm space-y-1 mt-1">
                    <li><b>Bindet interne Ressourcen:</b> Mitarbeiter müssen für die Entwicklung abgestellt werden.</li>
                    <li><b>Volle Verantwortung:</b> Wartung, Fehlerbehebung und Weiterentwicklung liegen intern.</li>
                  </ul>
                </div>

                {/* Option 2: Softwarekauf */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold text-lg mb-2">Option 2: Einkauf kommerzieller Software</h3>
                  <p className="text-sm mb-4">Hier wird eine bestehende Softwarelösung für Datenqualitätsmanagement eingekauft. Diese bieten oft grafische Oberflächen, kommen aber mit wiederkehrenden Kosten und weniger Flexibilität.</p>
                  <h4 className="font-semibold mb-2">Geschätzter Kostenrahmen</h4>
                  <table className="w-full text-sm mb-4">
                    <thead className="text-left">
                      <tr className="border-b dark:border-gray-600">
                        <th className="py-1">Anbieter / Produkt</th>
                        <th className="py-1">Kosten (1. Jahr)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b dark:border-gray-700"><td>Talend Data Quality</td><td>ab 15.000 - 40.000 €</td></tr>
                      <tr className="border-b dark:border-gray-700"><td>Informatica DQ</td><td>ab 20.000 - 50.000 €+</td></tr>
                      <tr className="font-bold"><td>Gesamtkosten (marktüblich)</td><td>ca. 8.000 - 40.000 €+</td></tr>
                    </tbody>
                  </table>
                  
                  <h5 className="font-semibold text-green-600 dark:text-green-500">Vorteile:</h5>
                  <ul className="list-disc list-outside pl-5 text-sm space-y-1 mt-1">
                    <li><b>Schnellere Inbetriebnahme:</b> Die Grundfunktionalität ist, nach Beschaffung und Einrichtung sofort verfügbar.</li>
                    <li><b>Hersteller-Support:</b> Unterstützung und Wartung durch den Anbieter.</li>
                    <li><b>Bewährte Lösung:</b> Oft im Markt etabliert und getestet.</li>
                  </ul>
                  <h5 className="font-semibold text-red-600 dark:text-red-500 mt-4">Nachteile:</h5>
                  <ul className="list-disc llist-outside pl-5 text-sm space-y-1 mt-1">
                    <li><b>Länger andauernder Beschaffungsprozess:</b> Bei der Betrachtung des Zeitaufwandes müssen die Dauer der Anbieterauswahl, der interne Freigabe-Workflow, ggf. zu beachtende Ausschreibungsfristen, Bereitstellungzeitraum sowie Schulungaufwände mit in Betracht gezogen werden.</li>
                    <li><b>Hohe und wiederkehrende Kosten:</b> Lizenz- und Wartungsgebühren.</li>
                    <li><b>Geringere Flexibilität:</b> "Vendor-Lock-in", Anpassungen sind oft teuer oder unmöglich.</li>
                    <li><b>Blackbox-Effekt:</b> Die interne Funktionsweise ist oft nicht transparent.</li>
                  </ul>
                </div>
              </div>

              {/* Empfehlung */}
              <div className="mt-6 text-center p-4 bg-blue-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="font-bold">Empfehlung</h3>
                  <p className="mt-2">Für das vorliegende Projekt ist die <b>Eigenentwicklung die klar zu bevorzugende Option</b>. Die Anforderungen sind präzise definiert und können mit Standard-Bibliotheken effizient umgesetzt werden. Die finanziellen Einsparungen sind erheblich, und die geschaffene Lösung ist perfekt auf den Anwendungsfall zugeschnitten, flexibel und zukunftssicher.</p>
              </div>
            </div>
          ),
          details: (
            // Der Inhalt für "verwaltung" ist identisch mit "experte"
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Option 1: Eigenentwicklung */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold text-lg mb-2">Option 1: Eigenentwicklung (Intern)</h3>
                  <p className="text-sm mb-4">Diese Option nutzt vorhandene Open-Source-Bibliotheken (z.B. Pandas in Python) und interne Personalressourcen. Die Logik für Validierung und Konsolidierung wird spezifisch für die Anforderungen des Projekts programmiert.</p>
                  <h4 className="font-semibold mb-2">Geschätzter Kostenrahmen<br/>(Interner Satz: 300 €/Tag)</h4>
                  <table className="w-full text-sm mb-4">
                    <thead className="text-left">
                      <tr className="border-b dark:border-gray-600">
                        <th className="py-1">Phase</th>
                        <th className="py-1">Aufwand (Tage)</th>
                        <th className="py-1">Kosten</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b dark:border-gray-700"><td>Konzeption & Architektur</td><td>2 - 4</td><td>600 - 1.200 €</td></tr>
                      <tr className="border-b dark:border-gray-700"><td>Entwicklung & Implementierung</td><td>5 - 10</td><td>1.500 - 3.000 €</td></tr>
                      <tr className="border-b dark:border-gray-700"><td>Test & Validierung</td><td>3 - 5</td><td>900 - 1.500 €</td></tr>
                      <tr className="border-b dark:border-gray-700"><td>Dokumentation & Deployment</td><td>2 - 3</td><td>600 - 900 €</td></tr>
                      <tr className="font-bold"><td>Gesamt (inkl. 20% Puffer)</td><td>14 - 26</td><td>ca. 4.320 - 7.920 €</td></tr>
                    </tbody>
                  </table>
                  <h5 className="font-semibold text-green-600 dark:text-green-500">Vorteile:</h5>
                  <ul className="list-disc list-outside pl-5 text-sm space-y-1 mt-1">
                    <li><b>Maximale Flexibilität:</b> Regeln können jederzeit angepasst und erweitert werden.</li>
                    <li><b>Keine Lizenzkosten:</b> Vollständige Kontrolle über den Code und keine Abhängigkeit von Herstellern.</li>
                    <li><b>Wissensaufbau im Haus:</b> Die Expertise bleibt in der Organisation.</li>
                    <li><b>Geringere Gesamtkosten:</b> Deutlich günstiger bei Nutzung interner Ressourcen.</li>
                  </ul>
                  <h5 className="font-semibold text-red-600 dark:text-red-500 mt-4">Nachteile:</h5>
                  <ul className="list-disc list-outside pl-5 text-sm space-y-1 mt-1">
                    <li><b>Bindet interne Ressourcen:</b> Mitarbeiter müssen für die Entwicklung abgestellt werden.</li>
                    <li><b>Volle Verantwortung:</b> Wartung, Fehlerbehebung und Weiterentwicklung liegen intern.</li>
                  </ul>
                </div>

                {/* Option 2: Softwarekauf */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold text-lg mb-2">Option 2: Einkauf kommerzieller Software</h3>
                  <p className="text-sm mb-4">Hier wird eine bestehende Softwarelösung für Datenqualitätsmanagement eingekauft. Diese bieten oft grafische Oberflächen, kommen aber mit wiederkehrenden Kosten und weniger Flexibilität.</p>
                  <h4 className="font-semibold mb-2">Geschätzter Kostenrahmen</h4>
                  <table className="w-full text-sm mb-4">
                    <thead className="text-left">
                      <tr className="border-b dark:border-gray-600">
                        <th className="py-1">Anbieter / Produkt</th>
                        <th className="py-1">Kosten (1. Jahr)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b dark:border-gray-700"><td>Talend Data Quality</td><td>ab 15.000 - 40.000 €</td></tr>
                      <tr className="border-b dark:border-gray-700"><td>Informatica DQ</td><td>ab 20.000 - 50.000 €+</td></tr>
                      <tr className="font-bold"><td>Gesamtkosten (marktüblich)</td><td>ca. 8.000 - 40.000 €+</td></tr>
                    </tbody>
                  </table>
                  <h5 className="font-semibold text-green-600 dark:text-green-500">Vorteile:</h5>
                  <ul className="list-disc list-outside pl-5 text-sm space-y-1 mt-1">
                    <li><b>Schnellere Inbetriebnahme:</b> Die Grundfunktionalität ist sofort verfügbar.</li>
                    <li><b>Hersteller-Support:</b> Unterstützung und Wartung durch den Anbieter.</li>
                    <li><b>Bewährte Lösung:</b> Oft im Markt etabliert und getestet.</li>
                  </ul>
                  <h5 className="font-semibold text-red-600 dark:text-red-500 mt-4">Nachteile:</h5>
                  <ul className="list-disc list-outside pl-5 text-sm space-y-1 mt-1">
                    <li><b>Hohe und wiederkehrende Kosten:</b> Lizenz- und Wartungsgebühren.</li>
                    <li><b>Geringere Flexibilität:</b> "Vendor-Lock-in", Anpassungen sind oft teuer oder unmöglich.</li>
                    <li><b>Blackbox-Effekt:</b> Die interne Funktionsweise ist oft nicht transparent.</li>
                  </ul>
                </div>
              </div>

              {/* Empfehlung */}
              <div className="mt-6 text-center p-4 bg-blue-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="font-bold">Empfehlung</h3>
                  <p className="mt-2">Für das vorliegende Projekt ist die <b>Eigenentwicklung die klar zu bevorzugende Option</b>. Die Anforderungen sind präzise definiert und können mit Standard-Bibliotheken effizient umgesetzt werden. Die finanziellen Einsparungen sind erheblich, und die geschaffene Lösung ist perfekt auf den Anwendungsfall zugeschnitten, flexibel und zukunftssicher.</p>
              </div>
            </div>
          ),
          überblick: (
            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Selber machen oder kaufen?</h3>
              <p className="text-sm">Bei der Entwicklung einer solchen Plattform stellt sich immer die Frage: Baut man die Software selbst oder kauft man eine fertige Lösung? Für dieses Projekt wurde entschieden, die Software selbst zu entwickeln. Das ist langfristig günstiger, flexibler und das Wissen darüber, wie alles funktioniert, bleibt hier bei uns im Landkreis.</p>
            </div>
          )
        }
      }
    ]
  },
  {
    id: 'anwendungs-showcase',
    title: 'Anwendungs-Showcase: Die Daten in Aktion',
    icon: <LayoutTemplate className="w-6 h-6" />,
    intro: {
      technik: 'Daten und Prozesse sind die eine Seite – der erlebbare Nutzen für den Menschen die andere. Die folgenden Prototypen zeigen, wie die validierten Daten in konkrete, zielgruppengerechte Anwendungen münden.',
      details: 'Die folgenden Prototypen zeigen, wie die validierten Daten in konkrete, zielgruppengerechte Anwendungen münden und so einen echten Mehrwert für die Verwaltung, Bürger und Interessengruppen schaffen.',
      überblick: 'Was passiert eigentlich mit all den Daten? Hier sehen Sie an Beispielen, wie aus den Messungen nützliche Apps für den Alltag und die Verwaltung entstehen können.'
    },
    sections: [
      {
        id: 'app-prototypes',
        title: 'Interaktive App-Prototypen',
        content: {
          technik: ( <AppShowcaseComponent onImageClick={setModalImageUrl} /> ),
          details: ( <AppShowcaseComponent onImageClick={setModalImageUrl} /> ),
          überblick: ( <AppShowcaseComponent onImageClick={setModalImageUrl} /> )
        }
      }
    ]
  },
  {
    id: 'referenzen',
    title: 'Referenzen & Quellen',
    icon: <BookCopy className="w-6 h-6" />,
    intro: {
      technik: 'Eine Sammlung der wissenschaftlichen, technischen und regulatorischen Quellen, die als Grundlage für dieses Projekt dienen.',
      details: 'Eine Sammlung der wissenschaftlichen, technischen und regulatorischen Quellen, die als Grundlage für dieses Projekt dienen.',
      überblick: 'Hier finden Sie Links zu weiterführenden Informationen zum Thema Wasserqualität und den Grundlagen dieses Projekts.'
    },
    sections: [
      {
        id: 'source-list',
        title: 'Quellenverzeichnis',
        content: {
          technik: (
            <div className="space-y-6 text-sm">
              <div>
                <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Wissenschaftliche Publikationen</h5>
                <ul className="list-disc list-inside space-y-1">
                  <li><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC10061935/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Advances in Catchment Science, Hydrochemistry, and Aquatic...</a></li>
                  <li><a href="https://pubs.acs.org/doi/10.1021/acs.est.2c07798" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Leveraging High-Frequency Water Quality Data... (ACS Publications)</a></li>
                  <li><a href="https://open-research-europe.ec.europa.eu/articles/4-244" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">SentemQC - A novel and cost-efficient method... (Open Research Europe)</a></li>
                  <li><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC9360045/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Chlorophyll soft-sensor based on machine learning models...</a></li>
                  <li><a href="https://pubs.acs.org/doi/10.1021/es504773x" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">High-Speed Limnology: Using Advanced Sensors...</a></li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Behörden & Standards</h5>
                <ul className="list-disc list-inside space-y-1">
                  <li><a href="https://www.umweltbundesamt.de/daten/wasser/wasserwirtschaft/qualitaet-des-trinkwassers-aus-zentralen" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Qualität des Trinkwassers... (Umweltbundesamt)</a></li>
                  <li><a href="https://www.usgs.gov/publications/guidelines-and-standard-procedures-high-frequency-groundwater-quality-monitoring" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Guidelines for high-frequency monitoring... (USGS.gov)</a></li>
                  <li><a href="https://www2.gov.bc.ca/assets/gov/environment/air-land-water/water/waterquality/monitoring-water-quality/water-stewardship/stewardship_data_qaqc_guidelines.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Water Quality Data QA/QC Guidelines (Gov.bc.ca)</a></li>
                  <li><a href="https://www.lanuv.nrw.de/fileadmin/lanuvpubl/4_arbeitsblaetter/40025.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Fließgewässertypenkarten NRW (LANUV)</a></li>
                  <li><a href="https://www.lawa.de/documents/lawa-rakon-teil-b-i-gewtyp-ref-210806-final-barrierefrei_1689850884.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Rahmenkonzeption Monitoring (LAWA)</a></li>
                  <li><a href="https://www.epa.gov/choose-fish-and-shellfish-wisely/data-verification-reporting-and-validation" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Data Verification, Reporting and Validation (US EPA)</a></li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Weitere Quellen & Technische Dokumentation</h5>
                <ul className="list-disc list-inside space-y-1">
                  <li><a href="https://serc.carleton.edu/eddie/teaching_materials/modules/module9.html" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Using High-Frequency Data to Manage Water Quality (SERC)</a></li>
                  <li><a href="https://de.wikipedia.org/wiki/PH-Wert" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">pH-Wert - Wikipedia</a></li>
                  <li><a href="https://www.fondriest.com/environmental-measurements/parameters/water-quality/water-temperature/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Water Temperature (Fondriest)</a></li>
                  <li>WAMO-Datensatzbeschreibung_UserinerSee_04-2025.xlsx</li>
                </ul>
              </div>
            </div>
          ),
          details: (
            <div className="space-y-6 text-sm">
              <div>
                <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Wissenschaftliche Publikationen</h5>
                <ul className="list-disc list-inside space-y-1">
                  <li><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC10061935/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Advances in Catchment Science, Hydrochemistry, and Aquatic...</a></li>
                  <li><a href="https://pubs.acs.org/doi/10.1021/acs.est.2c07798" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Leveraging High-Frequency Water Quality Data... (ACS Publications)</a></li>
                  <li><a href="https://open-research-europe.ec.europa.eu/articles/4-244" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">SentemQC - A novel and cost-efficient method... (Open Research Europe)</a></li>
                  <li><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC9360045/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Chlorophyll soft-sensor based on machine learning models...</a></li>
                  <li><a href="https://pubs.acs.org/doi/10.1021/es504773x" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">High-Speed Limnology: Using Advanced Sensors...</a></li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Behörden & Standards</h5>
                <ul className="list-disc list-inside space-y-1">
                  <li><a href="https://www.umweltbundesamt.de/daten/wasser/wasserwirtschaft/qualitaet-des-trinkwassers-aus-zentralen" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Qualität des Trinkwassers... (Umweltbundesamt)</a></li>
                  <li><a href="https://www.usgs.gov/publications/guidelines-and-standard-procedures-high-frequency-groundwater-quality-monitoring" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Guidelines for high-frequency monitoring... (USGS.gov)</a></li>
                  <li><a href="https://www2.gov.bc.ca/assets/gov/environment/air-land-water/water/waterquality/monitoring-water-quality/water-stewardship/stewardship_data_qaqc_guidelines.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Water Quality Data QA/QC Guidelines (Gov.bc.ca)</a></li>
                  <li><a href="https.lanuv.nrw.de/fileadmin/lanuvpubl/4_arbeitsblaetter/40025.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Fließgewässertypenkarten NRW (LANUV)</a></li>
                  <li><a href="https://www.lawa.de/documents/lawa-rakon-teil-b-i-gewtyp-ref-210806-final-barrierefrei_1689850884.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Rahmenkonzeption Monitoring (LAWA)</a></li>
                  <li><a href="https://www.epa.gov/choose-fish-and-shellfish-wisely/data-verification-reporting-and-validation" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Data Verification, Reporting and Validation (US EPA)</a></li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Weitere Quellen & Technische Dokumentation</h5>
                <ul className="list-disc list-inside space-y-1">
                  <li><a href="https://serc.carleton.edu/eddie/teaching_materials/modules/module9.html" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Using High-Frequency Data to Manage Water Quality (SERC)</a></li>
                  <li><a href="https://de.wikipedia.org/wiki/PH-Wert" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">pH-Wert - Wikipedia</a></li>
                  <li><a href="https://www.fondriest.com/environmental-measurements/parameters/water-quality/water-temperature/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Water Temperature (Fondriest)</a></li>
                  <li>WAMO-Datensatzbeschreibung_UserinerSee_04-2025.xlsx</li>
                </ul>
              </div>
            </div>
          ),
          überblick: (
            <div className="space-y-4 text-sm">
              <p className="mb-2">Hier finden Sie eine Auswahl an Links zu allgemeinen Informationen rund um das Thema Wasserqualität:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <a href="https://www.umweltbundesamt.de/themen/wasser/trinkwasser/trinkwasserqualitaet/daten-zur-trinkwasserqualitaet" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    Daten zur Trinkwasserqualität in Deutschland (Umweltbundesamt)
                  </a>
                </li>
                <li>
                  <a href="https://de.wikipedia.org/wiki/PH-Wert" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    Was ist der pH-Wert? (Wikipedia)
                  </a>
                </li>
                <li>
                  <a href="https://www.studyflix.de/biologie/oekosystem-see-2525" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    Erklärung zum Ökosystem See (Studyflix)
                  </a>
                </li>
              </ul>
            </div>
          )
        }
      }
    ]
  }
];

  const filteredSteps = steps.filter(step => 
    step.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (step.intro[detailLevel] || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50'}`}>
      <HeroSection />
      {/* Header */}
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
              <div className="flex items-center space-x-2">
                <Droplets className="w-8 h-8 text-blue-500" />
                <div>
                  <h1 className="text-xl font-bold">Digitale Gewässergüte-Messstationen</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Von Rohdaten zu wertvoller Information -{'>'} Automatische Validierung & Open Data</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">

              {/* NEUER INFO-BUTTON */}
              
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
                        {/* Checkbox für Benachrichtigungen */}
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
                        
                        {/* Nutzername und Logout */}
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
                  onClick={() => setDetailLevel('überblick')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    detailLevel === 'überblick' 
                      ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-sm' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Info className="w-4 h-4 inline mr-1" />
                  Überblick
                </button>
                <button
                  onClick={() => setDetailLevel('details')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    detailLevel === 'details' 
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <ClipboardList className="w-4 h-4 inline mr-1" />
                  Details
                </button>
                <button
                  onClick={() => setDetailLevel('technik')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    detailLevel === 'technik' 
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

      <div className="flex">
        {/* Sidebar */}
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

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                {filteredSteps[activeStep]?.icon}
                <h2 className="text-2xl font-bold">{filteredSteps[activeStep]?.title}</h2>
              </div>
              
              <div className={`p-4 rounded-lg ${getLevelColor(detailLevel)}`}>
                <div className="flex items-center space-x-2 mb-2">
                  {getLevelIcon(detailLevel)}
                  <span className="text-sm font-medium">
                    {detailLevel === 'technik' ? 'Technische Ansicht' : 
                     detailLevel === 'details' ? 'Detail-Ansicht' : 'Überblick'}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  {filteredSteps[activeStep]?.intro[detailLevel]}
                </p>
              </div>
            </div>

            {/* Navigation mit kontextbezogenen Titeln */}
            <div className="flex items-stretch justify-between mb-8">
              {/* Vorheriger Schritt Button */}
              <button
                onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                disabled={activeStep === 0}
                className={`px-4 py-2 rounded-md flex items-center space-x-2 w-1/3 transition-colors ${
                  activeStep === 0 
                    ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed' 
                    : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <div className="text-left">
                  <span className="text-sm font-medium">Vorheriger Schritt</span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400 truncate">
                    {activeStep > 0 && filteredSteps[activeStep - 1]?.title}
                  </span>
                </div>
              </button>
              
              {/* Navigations-Punkte in der Mitte */}
              <div className="flex items-center justify-center space-x-2">
                {filteredSteps.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveStep(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      idx === activeStep ? 'bg-blue-600 scale-125' : 'bg-gray-300 dark:bg-gray-600 hover:bg-blue-400'
                    }`}
                    aria-label={`Gehe zu Schritt ${idx + 1}`}
                  />
                ))}
              </div>
              
              {/* Nächster Schritt Button */}
              <button
                onClick={() => setActiveStep(Math.min(filteredSteps.length - 1, activeStep + 1))}
                disabled={activeStep === filteredSteps.length - 1}
                className={`px-4 py-2 rounded-md flex items-center justify-end space-x-2 w-1/3 transition-colors ${
                  activeStep === filteredSteps.length - 1 
                    ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <div className="text-right">
                  <span className="text-sm font-medium">Nächster Schritt</span>
                  <span className={`block text-xs truncate ${activeStep === filteredSteps.length - 1 ? 'text-gray-400' : 'text-blue-200'}`}>
                    {activeStep < filteredSteps.length - 1 && filteredSteps[activeStep + 1]?.title}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* HIER DIE GRAFIK AN NEUER STELLE EINFÜGEN */}
            {filteredSteps[activeStep]?.id === 'dateneingabe' && (
              <div className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <h5 className="font-semibold mb-4 text-gray-800 dark:text-gray-200">Beispiel-Tagesgang (Useriner See, 28.04.2025)</h5>
                <TagesgangChart />
              </div>
            )}

            {/* NEUE GRAFIK FÜR VALIDIERUNG HINZUFÜGEN */}
            {filteredSteps[activeStep]?.id === 'validierung' && (
              <div className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <h5 className="font-semibold mb-4 text-gray-800 dark:text-gray-200">Beispiel: Spike-Erkennung im pH-Verlauf</h5>
                <ValidationChart />
              </div>
            )}

            {filteredSteps[activeStep]?.id === 'aggregation' && (
              <div className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <h5 className="font-semibold mb-4 text-gray-800 dark:text-gray-200">Beispiel: Tageskonsolidierung der Temperatur</h5>
                <ConsolidationTempChart />
              </div>
            )}

            {/* NEUE GRAFIK FÜR QUALITÄTS-FLAGS HINZUFÜGEN */}
            {filteredSteps[activeStep]?.id === 'quality-flags' && (
              <div className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <h5 className="font-semibold mb-4 text-gray-800 dark:text-gray-200">Beispiel: Verteilung der Qualitäts-Flags</h5>
                <QualityFlagChart />
              </div>
            )}

            {/* NEUE GRAFIK FÜR KOSTEN-NUTZEN-ANALYSE HINZUFÜGEN */}
          {filteredSteps[activeStep]?.id === 'kosten-nutzen-analyse' && (
            <div className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <h5 className="font-semibold mb-4 text-gray-800 dark:text-gray-200">Grafischer Vergleich der Optionen</h5>
              <CostBenefitRadarChart />
            </div>
          )}

            {/* Sections */}
            <div className="space-y-4">
              {filteredSteps[activeStep]?.sections.map((section) => {
                const isExpanded = expandedSections[`${filteredSteps[activeStep].id}-${section.id}`];
                const commentKey = `${filteredSteps[activeStep].id}-${section.id}`;
                const sectionComments = comments[commentKey] || [];
                
                return (
                  <div key={section.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <button
                      onClick={() => toggleSection(filteredSteps[activeStep].id, section.id)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <h3 className="text-lg font-semibold">{section.title}</h3>
                      <div className="flex items-center space-x-3">
                        {sectionComments.length > 0 && (
                          <span className="flex items-center space-x-1 text-sm text-gray-500">
                            <MessageSquare className="w-4 h-4" />
                            <span>{sectionComments.length}</span>
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
                        
                        {/* Collaboration Section */}
                        <div className="mt-6 pt-6 border-t dark:border-gray-700">
                          <button
                            onClick={() => setShowComments({ ...showComments, [commentKey]: !showComments[commentKey] })}
                            className="flex items-center space-x-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span>Diskussion & Zusammenarbeit ({sectionComments.length})</span>
                          </button>
                          
                          {showComments[commentKey] && (
                            <div className="mt-4 space-y-3">
                              {sectionComments
                                // Filtert "kaputte" Datensätze heraus (wie null oder undefined)
                                .filter(comment => comment && typeof comment === 'object' && comment.id)
                                .map((comment) => {
                                  // NEU: Stellt sicher, dass der Autor immer ein einfacher Text ist
                                  const authorName = (comment.author && typeof comment.author === 'object') 
                                    ? comment.author.firstName 
                                    : comment.author;

                                  return (
                                    <div key={comment.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg group relative">
                                      <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center space-x-2">
                                          <User className="w-4 h-4 text-gray-400" />
                                          {/* Zeigt den sicher extrahierten Namen an */}
                                          <span className="text-sm font-medium">{authorName}</span>
                                          <span className={`text-xs px-2 py-0.5 rounded-full ${getLevelColor(comment.level)}`}>
                                            {comment.level}
                                          </span>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                          {comment.timestamp ? new Date(comment.timestamp).toLocaleString('de-DE') : ''}
                                        </span>
                                      </div>
                                      <p className="text-sm">{comment.text}</p>
                                      
                                      {currentUser && currentUser.email === import.meta.env.VITE_ADMIN_EMAIL && (
                                        <button 
                                          onClick={() => handleDeleteComment(comment.id)} 
                                          className="absolute top-2 right-2 p-1 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-500 hover:bg-red-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                          title="Kommentar löschen"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      )}
                                    </div>
                                  );
                                })}
                              
                              {/* Der Input-Bereich bleibt unverändert */}
                              <div className="flex space-x-2">
                                <input
                                  type="text"
                                  placeholder="Kommentar hinzufügen..."
                                  value={newComment[commentKey] || ''}
                                  onChange={(e) => setNewComment({ ...newComment, [commentKey]: e.target.value })}
                                  onKeyPress={(e) => e.key === 'Enter' && saveComment(filteredSteps[activeStep].id, section.id)}
                                  className="flex-1 px-3 py-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600"
                                />
                                <button
                                  onClick={() => saveComment(filteredSteps[activeStep].id, section.id)}
                                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            
          </div>
        </main>
      </div>
      <ImageModal imageUrl={modalImageUrl} onClose={() => setModalImageUrl(null)} />
      <UseCaseModal useCase={selectedUseCase} onClose={() => setSelectedUseCase(null)} />
      <ExplanationModal explanation={codeExplanation} onClose={() => setCodeExplanation(null)} />
      <IntroModal show={showIntroModal} onClose={handleIntroClose} />
      <LoginModal show={showLoginModal} onLogin={handleLogin} />
    </div>
  );
}

export default App;