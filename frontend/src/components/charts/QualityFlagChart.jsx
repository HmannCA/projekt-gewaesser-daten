import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { qualityFlagData } from '../../data/chartData.js';

const QualityFlagChart = () => (
  <div className="w-full h-80 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
    <ResponsiveContainer>
      <PieChart>
        <Pie
          data={qualityFlagData}
          cx="50%"
          cy="50%"
          labelLine={false}
          innerRadius={70}
          outerRadius={110}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {qualityFlagData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => `${value}%`}
          contentStyle={{ 
            backgroundColor: 'rgba(31, 41, 55, 0.8)', 
            borderColor: '#4b5563',
            borderRadius: '0.5rem'
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

export default QualityFlagChart;