import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { radarChartData } from '../../data/chartData.js';

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

export default CostBenefitRadarChart;