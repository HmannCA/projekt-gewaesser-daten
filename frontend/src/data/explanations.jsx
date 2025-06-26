import React from 'react';

export const explanations = {
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