import React from "react";
import { LineChart as ReLineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function UserLineChart() {
  const data = [
    { name: "Mon", users: 5000 },
    { name: "Feb", users: 7000 },
    { name: "Mar", users: 6800 },
    { name: "Apr", users: 9000 },
    { name: "May", users: 8800 },
    { name: "Jul", users: 10200 },
    { name: "Sen", users: 10000 },
    { name: "Sun", users: 11500 },
  ];
  
  return (
    <ResponsiveContainer width="100%" height={200}>
      <ReLineChart data={data}>
        <XAxis 
          dataKey="name" 
          stroke="#6B7280"
          fontSize={12}
        />
        <YAxis 
          stroke="#6B7280"
          fontSize={12}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#1F2937', 
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#F9FAFB'
          }}
        />
        <Line
          type="monotone"
          dataKey="users"
          stroke="#0ea5e9"
          strokeWidth={2}
          dot={{ fill: '#0ea5e9', strokeWidth: 2 }}
        />
      </ReLineChart>
    </ResponsiveContainer>
  );
}

export default UserLineChart;