// frontend/src/components/DataValidator.jsx - HINZUGEFÜGT: Visuelles Feedback nach Dateiauswahl

import React, { useState } from 'react';
import { uploadAndValidateZip } from '../utils/api';
// HINZUGEFÜGT: CheckCircle2 Icon für das Erfolgsfeedback
import { Loader2, ExternalLink, CheckCircle2 } from 'lucide-react';
import QualityChart from './charts/QualityChart';
import TimeSeriesChart from './charts/TimeSeriesChart';

const FileUpload = ({ onFileSelect, onSubmit, isLoading, selectedFile, statusText }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file && file.name.endsWith('.zip')) {
        onFileSelect(file);
    }
  };

  // --- BEGINN DER ÄNDERUNG ---
  // Die Klassen werden jetzt auch durch 'selectedFile' beeinflusst, um einen grünen Rahmen zu zeigen
  const dropzoneClass = `flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
    isDragging 
      ? 'border-blue-500 bg-blue-100 dark:bg-gray-600' 
      : selectedFile 
        ? 'border-green-500 bg-green-50 dark:bg-gray-700'
        : 'border-gray-300 bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500'
  }`;

  return (
    <div className="w-full max-w-2xl p-8 space-y-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white">Daten-Validierung</h2>
      <p className="text-center text-gray-600 dark:text-gray-300">Laden Sie hier eine ZIP-Datei hoch, die Ihre Rohdaten (.csv) sowie die dazugehörige Metadaten-Datei (metadata.json) enthält, um die automatische Validierung zu starten.</p>
      <div className="flex items-center justify-center w-full">
        <label 
          htmlFor="dropzone-file" 
          className={dropzoneClass}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Hier wird jetzt je nach Zustand (Datei ausgewählt oder nicht) unterschiedlicher Inhalt angezeigt */}
          {selectedFile ? (
            <div className="flex flex-col items-center justify-center text-center text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-16 h-16 mb-4" />
              <p className="text-xl font-semibold">Datei ausgewählt!</p>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mt-1">{selectedFile.name}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-10 h-10 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" /></svg>
              <p className="mb-2 text-md text-gray-500 dark:text-gray-400"><span className="font-semibold">Klicken zum Hochladen</span> oder Datei hierher ziehen</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">ZIP (MAX. 100MB)</p>
            </div>
          )}
          {/* Das Input-Feld bleibt versteckt und wird nur für den Klick-Upload benötigt */}
          {!selectedFile && <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept=".zip" />}
        </label>
      </div>
      {/* Die separate Textanzeige für den Dateinamen ist jetzt nicht mehr nötig, da sie im Drop-Feld integriert ist. */}
      
      <button
        onClick={onSubmit}
        disabled={!selectedFile || isLoading}
        className="w-full flex items-center justify-center px-5 py-3 text-base font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 disabled:bg-gray-400 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
            {statusText}
          </>
        ) : (
          'Validierung starten'
        )}
      </button>
    </div>
  );
};
// --- ENDE DER ÄNDERUNG ---


const DataValidator = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [dashboardUrl, setDashboardUrl] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState("Analysiere Daten...");

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setError('');
    setValidationResult(null);
    setDashboardUrl(null);
    setCurrentStatus("Analysiere Daten...");
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Bitte wählen Sie zuerst eine Datei aus.');
      return;
    }
    setIsLoading(true);
    setError('');
    setValidationResult(null);
    setDashboardUrl(null);
    setCurrentStatus("Initialisiere Pipeline...");
    
    const mockStatusUpdates = ["Lade Metadaten...", "Erstelle Spalten-Mapping...", "Verarbeite Stationen...", "Führe Bereichs-Analyse durch...", "Führe Spike-Analyse durch...", "Führe Stuck-Value-Analyse durch...", "Führe Kreuz-Validierung durch...", "Kombiniere Ergebnisse...", "Führe Tageskonsolidierung durch...", "Speichere Ergebnis-Datei..."];
    let updateIndex = 0;
    const intervalId = setInterval(() => {
        setCurrentStatus(mockStatusUpdates[updateIndex]);
        updateIndex = (updateIndex + 1) % mockStatusUpdates.length;
    }, 1800);

    try {
      const response = await uploadAndValidateZip(selectedFile);
      clearInterval(intervalId);
      
      if (response && response.validationResult) {
        setValidationResult(response.validationResult);
        if (response.dashboardUrl) {
            setDashboardUrl(response.dashboardUrl);
        }
        setCurrentStatus("Analyse erfolgreich abgeschlossen!");
      } else {
        throw new Error("Die Server-Antwort enthielt kein Ergebnis.");
      }
      
    } catch (err) {
      clearInterval(intervalId);
      let displayError = err.message || 'Ein unbekannter Fehler ist aufgetreten.';
      if (err.response && err.response.data && err.response.data.error) {
        displayError += `\n\n--- Details aus Python ---\n${err.response.data.error}`;
      }
      setError(`Fehler bei der Validierung: ${displayError}`);
      setCurrentStatus("Analyse fehlgeschlagen.");
      console.error("Ein Fehler ist aufgetreten:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const downloadResult = () => {
    if (!validationResult) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(validationResult, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "opendata-ergebnis.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="flex flex-col items-center w-full p-4 pt-10 sm:p-8 bg-gray-100 dark:bg-gray-900">
      <div className="w-full flex justify-center">
        <FileUpload 
            onFileSelect={handleFileSelect} 
            onSubmit={handleSubmit} 
            isLoading={isLoading}
            selectedFile={selectedFile}
            statusText={currentStatus}
        />
      </div>
      
      {error && (
        <div className="mt-6 w-full max-w-2xl p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 rounded-lg">
            <p className="text-center text-red-700 dark:text-red-200 font-semibold whitespace-pre-wrap">{error}</p>
        </div>
      )}
      
      {validationResult && (
        <div className="w-full max-w-6xl p-8 mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">Grafische Auswertung</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end">
            <QualityChart data={validationResult.tageswerte} />
            <TimeSeriesChart data={validationResult.tageswerte} />
          </div>

          {dashboardUrl && (
            <div className="mt-12">
                <div className="flex justify-center items-center mb-4">
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white">Detailliertes HTML-Dashboard</h4>
                    <a
                        href={dashboardUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4 inline-flex items-center p-2 text-sm text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="In neuem Tab öffnen"
                    >
                        <ExternalLink className="w-5 h-5" />
                    </a>
                </div>
                <div className="w-full bg-white border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
                    <iframe
                        src={dashboardUrl}
                        title="Detailliertes Validierungs-Dashboard"
                        className="w-full h-[800px] border-0"
                        sandbox="allow-scripts allow-same-origin"
                    />
                </div>
            </div>
          )}
          
          <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
             <h4 className="text-lg font-semibold text-gray-800 dark:text-white">Validierungsergebnis (opendata.json)</h4>
             <div className="flex justify-center my-4"><button onClick={downloadResult} className="px-6 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none">Ergebnis als JSON herunterladen</button></div>
             <pre className="mt-2 text-sm text-left dark:text-gray-200 rounded-md overflow-x-auto p-4 bg-black/20">{JSON.stringify(validationResult, null, 2)}</pre>
           </div>
        </div>
      )}
    </div>
  );
};

export default DataValidator;