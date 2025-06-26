import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { validationChartData } from '../../data/chartData.js';

const CustomShape = (props) => {
  const { cx, cy, payload } = props;
  if (payload.type === 'outlier') {
    return (
      <path d={`M${cx - 5},${cy - 5}L${cx + 5},${cy + 5}M${cx + 5},${cy - 5}L${cx - 5},${cy + 5}`} stroke="#ef4444" strokeWidth="2" />
    );
  }
  return <circle cx={cx} cy={cy} r={5} fill="#10b981" />;
};

const ValidationChart = () => (
  <div className="w-full h-80 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg relative">
    <ResponsiveContainer>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2}/>
        <XAxis dataKey="time" type="category" name="Uhrzeit" tick={{ fill: 'currentColor', fontSize: 12 }} />
        <YAxis dataKey="pH" name="pH-Wert" domain={[8.6, 9.6]} tick={{ fill: 'currentColor', fontSize: 12 }} />
        <Tooltip 
          cursor={{ strokeDasharray: '3 3' }} 
          contentStyle={{ 
            backgroundColor: 'rgba(31, 41, 55, 0.8)', 
            borderColor: '#4b5563',
            borderRadius: '0.5rem'
          }}
        />
        <Scatter data={validationChartData} shape={<CustomShape />} />
      </ScatterChart>
    </ResponsiveContainer>
    <div className="absolute top-2 right-4 text-xs flex space-x-4">
        <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span>Valide Daten</span>
        </div>
        <div className="flex items-center">
            <svg className="w-3 h-3 mr-2" viewBox="0 0 10 10"><path d="M0,0L10,10M10,0L0,10" stroke="#ef4444" strokeWidth="1.5"></path></svg>
            <span>Ausreißer</span>
        </div>
    </div>
  </div>
);

export default ValidationChart;