// frontend/src/components/charts/QualityChart.jsx
// HINWEIS: Angepasst, um die gleiche Container-Struktur wie das Zeitreihen-Diagramm zu haben.

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const getFlagName = (flag) => {
    switch (flag) {
        case 1: return 'Gut';
        case 3: return 'Verdächtig';
        case 4: return 'Schlecht';
        default: return 'Unbekannt';
    }
};

const QualityChart = ({ data }) => {
    const processDataForChart = (validationResult) => {
        if (!validationResult) return [];
        const flagCounts = { 1: 0, 3: 0, 4: 0 };
        for (const date in validationResult) {
            const dayData = validationResult[date];
            for (const key in dayData) {
                if (key.endsWith('_Aggregat_QARTOD_Flag')) {
                    const flag = dayData[key];
                    if (flag in flagCounts) {
                        flagCounts[flag]++;
                    }
                }
            }
        }
        return Object.keys(flagCounts).map(flag => ({
            name: getFlagName(parseInt(flag)),
            Anzahl: flagCounts[flag],
            fill: getFlagName(parseInt(flag)) === 'Gut' ? '#22c55e' : getFlagName(parseInt(flag)) === 'Verdächtig' ? '#f59e0b' : '#ef4444',
        }));
    };

    const chartData = processDataForChart(data);

    return (
        // --- BEGINN DER ÄNDERUNG ---
        // Wir fügen den gleichen äußeren Rahmen wie beim anderen Diagramm hinzu
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <h4 className="text-lg font-semibold text-center text-gray-800 dark:text-white mb-4">
                Übersicht der Datenqualität
            </h4>
            {/* Der innere Container für das Diagramm */}
            <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer>
                    <BarChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        barCategoryGap="20%"
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip 
                            cursor={{fill: 'rgba(206, 212, 218, 0.3)'}}
                            contentStyle={{ 
                                backgroundColor: 'rgba(30, 41, 59, 0.9)',
                                borderColor: 'rgba(51, 65, 85, 0.9)',
                                color: '#ffffff'
                            }}
                        />
                        <Bar dataKey="Anzahl" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
        // --- ENDE DER ÄNDERUNG ---
    );
};

export default QualityChart;