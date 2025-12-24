import useThemeCheck from '@/hooks/useThemeCheck';
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import React from "react";




const data = [
  { time: "1h", price: 30 },
  { time: "2h", price: 34 },
  { time: "3h", price: 33 },
  { time: "4h", price: 35 },
];

export default function SparklineGraph() {
  const isLight = useThemeCheck();


  const lineColor = isLight ? "#0e7490" : "#3b82f6";


  const tooltipStyle = {
    backgroundColor: isLight ? '#fff' : '#1f2937',
    border: isLight ? '1px solid #e5e7eb' : '1px solid #4b5563',
    color: isLight ? '#1f2937' : '#fff',
    borderRadius: '8px',
    padding: '8px',
    fontSize: '12px'
  };


  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={tooltipStyle}>
          <p className="label">{`${label} : $${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full fade-in" style={{ animationDelay: "0.1s" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="price"
            stroke={lineColor}
            strokeWidth={2}
            dot={false}
          />
          <Tooltip content={<CustomTooltip />} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}