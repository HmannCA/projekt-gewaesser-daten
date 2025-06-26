import { Ship, Sprout, Lightbulb, Orbit, Fish, School, FileText, Map, Siren, Briefcase, FlaskConical, Building } from 'lucide-react';

export const useCaseData = {
  technik: [
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
      icon: Orbit,
      target: 'Wissenschaft, Forschungsinstitute, Wasserbauingenieure',
      summary: 'Ein lebendiges 4D-Modell des Sees, das durch Echtzeit-Sensordaten gespeist wird und als virtuelles Labor für Simulationen und Analysen dient.',
      details: {
        problem: 'Statische Modelle und seltene, punktuelle Messungen können die hochdynamischen und räumlich komplexen Prozesse in einem See (z.B. die Ausbildung von thermischen Schichtungen, Nährstoff-Hotspots, Strömungen) nur unzureichend abbilden. Für präzise Forschung und Management fehlen oft lebendige, datengestützte Gesamtbilder des Ökosystems.',
        solution: 'Der kontinuierliche, qualitätsgeflaggte Datenstrom der mobilen Sensorflotte wird genutzt, um ein dynamisches 4D-Modell (3D-Raum + Zeit) des Sees zu füttern – einen "Digitalen Zwilling". Dieses virtuelle Abbild des realen Gewässers wird in Quasi-Echtzeit durch die Messdaten kalibriert und aktualisiert. Es dient als virtuelles Labor, in dem komplexe Zusammenhänge visualisiert und Szenarien durchgespielt werden können.',
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
      id: 'tourism',
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
  überblick: [
    { 
      id: 'tourism', 
      title: 'Für Tourismus & Freizeit', 
      icon: Ship, 
      summary: 'Bessere Vorhersagen von Algenblüten können unnötige Sperrungen von Badeseen vermeiden. Das bedeutet mehr sicheren Badespaß für Sie und verlässlichere Einnahmen für Hotels und Gaststätten.' 
    },
    { 
      id: 'farming', 
      title: 'Für Umwelt & Landwirtschaft', 
      icon: Sprout, 
      summary: 'Landwirte können ihre Felder gezielter bewässern und düngen. Das spart nicht nur Wasser, sondern schützt auch unsere Seen vor überschüssigen Nährstoffen.' 
    },
    { 
      id: 'innovation', 
      title: 'Für unsere Region', 
      icon: Lightbulb, 
      summary: 'Unternehmen und Tüftler aus der Region können diese öffentlichen Daten nutzen, um neue Apps und Dienstleistungen zu entwickeln. Das schafft Arbeitsplätze und fördert die lokale Wirtschaft.' 
    }
  ]
};