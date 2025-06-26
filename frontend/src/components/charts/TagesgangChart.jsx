import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { dailyChartData } from '../../data/chartData.js';

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

export default TagesgangChart;