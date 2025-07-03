// frontend/src/components/DbViewer.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, AlertTriangle, Database } from 'lucide-react';

// Kleine Komponente, um eine einzelne Tabelle darzustellen
const DbTable = ({ tableName, data }) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
        // Zeigt eine Info an, wenn eine Tabelle leer ist oder nicht gefunden wurde
        return (
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-md text-center">
                <p className="font-medium text-gray-500 dark:text-gray-400">Tabelle '{tableName}' ist leer oder nicht vorhanden.</p>
                {data && data.status && <p className="text-sm text-red-500 mt-1">{data.status}</p>}
            </div>
        );
    }

    const headers = Object.keys(data[0]);

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        {headers.map(header => (
                            <th key={header} className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                {header.replace(/_/g, ' ')}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {headers.map(header => (
                                <td key={`${rowIndex}-${header}`} className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                                    {/* Stellt JSON-Objekte lesbar dar */}
                                    {typeof row[header] === 'object' && row[header] !== null 
                                        ? <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded">{JSON.stringify(row[header], null, 2)}</pre>
                                        : String(row[header])
                                    }
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const DbViewer = () => {
    const [dbData, setDbData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError('');
            try {
                // API-Endpunkt aufrufen, den wir im Backend erstellt haben
                const response = await axios.get('/api/show-db-content');
                setDbData(response.data);
            } catch (err) {
                const errorMessage = err.response?.data?.error || err.message || 'Ein unbekannter Fehler ist aufgetreten.';
                setError(errorMessage);
                console.error("Fehler beim Abrufen der DB-Daten:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
                <Loader2 className="w-16 h-16 animate-spin text-blue-600" />
                <p className="mt-4 text-lg font-semibold">Lade Datenbankinhalte...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">
                <AlertTriangle className="w-16 h-16" />
                <h2 className="mt-4 text-xl font-bold">Fehler beim Laden der Daten</h2>
                <p className="mt-2 text-center max-w-md">{error}</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center mb-6">
                    <Database className="w-8 h-8 mr-3 text-blue-600 dark:text-blue-400" />
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Datenbank-Inhaltsanzeige</h1>
                </div>

                <div className="space-y-8">
                    {dbData && Object.keys(dbData).map(tableName => (
                        <div key={tableName} className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200 capitalize">
                                Tabelle: <span className="text-blue-700 dark:text-blue-400 font-bold">{tableName}</span>
                            </h2>
                            <DbTable tableName={tableName} data={dbData[tableName]} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DbViewer;