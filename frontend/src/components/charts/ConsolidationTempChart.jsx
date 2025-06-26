import React from 'react';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { rawCsvData } from '../../data/chartData.js';

const ConsolidationTempChart = () => {
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

export default ConsolidationTempChart;