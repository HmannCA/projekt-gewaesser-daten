// frontend/src/components/charts/TimeSeriesChart.jsx

import React, { useState, useMemo } from 'react';
import { LineChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TimeSeriesChart = ({ data }) => {
    // State, um den vom Nutzer ausgewählten Parameter zu speichern
    const [selectedParam, setSelectedParam] = useState('Wassertemp. (0.5m)');

    // 1. Daten für das Diagramm aufbereiten
    const { chartData, availableParams } = useMemo(() => {
        if (!data) return { chartData: [], availableParams: [] };

        const tempChartData = [];
        const params = new Set();

        // Alle verfügbaren Parameter mit Mittelwerten sammeln
        Object.values(data).forEach(dayData => {
            Object.keys(dayData).forEach(key => {
                if (key.endsWith('_Mittelwert')) {
                    params.add(key.replace('_Mittelwert', ''));
                }
            });
        });

        // Daten für den ausgewählten Parameter extrahieren
        Object.entries(data).forEach(([date, dayData]) => {
            const meanValue = dayData[`${selectedParam}_Mittelwert`];
            const minValue = dayData[`${selectedParam}_Min`];
            const maxValue = dayData[`${selectedParam}_Max`];

            if (meanValue !== undefined && minValue !== undefined && maxValue !== undefined) {
                tempChartData.push({
                    date: new Date(date).toLocaleDateString('de-DE'),
                    Mittelwert: meanValue,
                    Schwankungsbereich: [minValue, maxValue]
                });
            }
        });

        return { chartData: tempChartData, availableParams: Array.from(params) };
    }, [data, selectedParam]);

    return (
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Zeitlicher Verlauf
                </h4>
                {/* Dropdown zur Auswahl des Parameters */}
                <select
                    value={selectedParam}
                    onChange={(e) => setSelectedParam(e.target.value)}
                    className="p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
                >
                    {availableParams.map(param => (
                        <option key={param} value={param}>{param}</option>
                    ))}
                </select>
            </div>
            <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer>
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: 'rgba(30, 41, 59, 0.9)', // Dunkler Hintergrund
                                borderColor: 'rgba(51, 65, 85, 0.9)'
                            }}
                            labelStyle={{ color: '#ffffff' }} // Weiße Schrift für die Überschrift (Datum)
                            itemStyle={{ color: '#ffffff' }}  // Weiße Schrift für die einzelnen Werte
                        />
                        <Legend />
                        {/* Schwankungsbereich als Fläche */}
                        <Area type="monotone" dataKey="Schwankungsbereich" stroke={false} fill="#8884d8" fillOpacity={0.2} name="Min/Max Bereich" />
                        {/* Mittelwert als Linie */}
                        <Line type="monotone" dataKey="Mittelwert" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default TimeSeriesChart;