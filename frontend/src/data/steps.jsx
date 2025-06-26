import React from 'react';
import { Sparkles, Zap, Database, Shield, BarChart3, CheckCircle2, Cloud, Network, Code, Scale, LayoutTemplate, BookCopy, ChevronDown, Beaker, Building2, Users, CheckCircle2 as Check, AlertCircle, X, Activity, ChevronRight, User, Droplets, Lightbulb, Fish, Sprout, Ship, School, Building, Briefcase, FlaskConical, Layers, Orbit, FileText, Map, Siren, Wrench } from 'lucide-react';
import MotivationCarousel from '../components/shared/MotivationCarousel.jsx';
import AppShowcaseComponent from '../components/AppShowcaseComponent.jsx';
import bpmnProzessExperte from '../assets/bpmn-prozess.png';
import bpmnProzessBuerger from '../assets/bpmn-prozess-buerger.png';
import { useCaseData } from './useCaseData.jsx';
import { explanations } from './explanations.jsx';

export const createSteps = (handlers) => [
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
                <button key={useCase.id} onClick={() => handlers.setSelectedUseCase(useCase)} className="text-left bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg flex flex-col space-y-3 border dark:border-gray-700 hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-500 transition-all">
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
                <button key={useCase.id} onClick={() => handlers.setSelectedUseCase(useCase)} className="text-left bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg flex flex-col space-y-3 border dark:border-gray-700 hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-500 transition-all">
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
    },
    sections: [
      {
        id: 'mission-statement-wichtigkeit',
        title: 'Warum dieses Projekt wichtig ist',
        content: {
          überblick: ( <MotivationCarousel /> ),
          details: ( <MotivationCarousel /> ),
          technik: ( <MotivationCarousel /> )
        }
      },
      {
        id: 'mission-statement-vision',
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
                <p className="text-sm">Die Mecklenburgische Seenplatte stellt ein einzigartiges limnologisches Laboratorium dar. Qualitätsgesicherte Langzeitmessreihen ermöglichen Klimawandelforschung, Eutrophierungsstudien und die Entwicklung prädiktiver Modelle für das Gewässermanagement. Ohne rigorose Datenvalidierung bleibt dieses wissenschaftliche Potenzial ungenutzt.</p>
                <p>&nbsp;</p>
                <p className="text-sm">Die Implementierung entspricht modernsten Ansätzen wie dem USGS TADA-Framework und europäischen INSPIRE-Richtlinien.</p>
              </div>
            </div>
          ),
        }
      }
    ]
  },

  // 2. Datenaufnahme
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

  // 3. Validierung
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
              
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg">
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
                    <button 
                      onClick={(e) => { e.preventDefault(); handlers.setCodeExplanation(explanations.validator); }}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline mr-4"
                    >
                      (Was tut dieser Code?)
                    </button>
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
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Technische Funktionsprüfung der Sensoren</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Plausibilitätsprüfung der Messwerte</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Vergleich mit historischen Daten</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500" />
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

  // 4. Aggregation
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

              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg">
                <details>
                  <summary className="px-4 py-3 font-medium cursor-pointer flex justify-between items-center">
                    <span>Python Implementierungsbeispiel</span>
                    <button 
                      onClick={(e) => { e.preventDefault(); handlers.setCodeExplanation(explanations.consolidator); }}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline mr-4"
                    >
                      (Was tut dieser Code?)
                    </button>
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
  // 5. Quality Flags
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
                        <Check className="w-6 h-6 text-white" />
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

  // 6. API & Export
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
                <details>
                  <summary className="cursor-pointer flex justify-between items-center">
                    <span>FastAPI Implementation</span>
                    <button 
                      onClick={(e) => { e.preventDefault(); handlers.setCodeExplanation(explanations.api); }}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline mr-4"
                    >
                      (Was tut dieser Code?)
                    </button>
                    <ChevronDown className="w-5 h-5 transition-transform" />
                  </summary>
                  <pre className="text-sm overflow-x-auto mt-4">
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
                </details>
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

  // 7. BPMN Prozess
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
            <div className="mt-4 pt-4 border-t dark:border-gray-700">
              <h6 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Prozessvisualisierung</h6>
              <button 
                onClick={() => handlers.setModalImageUrl(bpmnProzessExperte)}
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

            <div className="mt-4 pt-4 border-t dark:border-gray-700">
              <h6 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Prozessvisualisierung</h6>
              <button 
                onClick={() => handlers.setModalImageUrl(bpmnProzessExperte)}
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

          <div className="mt-4 pt-4 border-t dark:border-gray-700">
            <button 
              onClick={() => handlers.setModalImageUrl(bpmnProzessBuerger)}
              className="w-full p-2 bg-white dark:bg-gray-200 rounded-lg transition-transform hover:scale-[1.02] cursor-pointer"
            >
              <img src={bpmnProzessBuerger} alt="Vereinfachter Prozessablauf" className="w-full h-auto rounded" />
            </button>
            <p className="text-xs text-center mt-1 text-gray-500">Klicken zum Vergrößern</p>
          </div>

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
  // 8. Code-Katalog
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
                          onClick={(e) => { e.preventDefault(); handlers.setCodeExplanation(item.explanation); }}
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
                          onClick={(e) => { e.preventDefault(); handlers.setCodeExplanation(item.explanation); }}
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

  // 9. Kosten-Nutzen-Analyse
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
                  <ul className="list-disc list-outside pl-5 text-sm space-y-1 mt-1">
                    <li><b>Länger andauernder Beschaffungsprozess:</b> Bei der Betrachtung des Zeitaufwandes müssen die Dauer der Anbieterauswahl, der interne Freigabe-Workflow, ggf. zu beachtende Ausschreibungsfristen, Bereitstellungzeitraum sowie Schulungsaufwände mit in Betracht gezogen werden.</li>
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
            // Der Inhalt für "details" ist identisch mit "technik"
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

  // 10. Anwendungs-Showcase
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
          technik: ( <AppShowcaseComponent onImageClick={handlers.setModalImageUrl} /> ),
          details: ( <AppShowcaseComponent onImageClick={handlers.setModalImageUrl} /> ),
          überblick: ( <AppShowcaseComponent onImageClick={handlers.setModalImageUrl} /> )
        }
      }
    ]
  },

  // 11. Referenzen
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


