import useThemeCheck from '@/hooks/useThemeCheck';
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import React, { useMemo } from "react";

// Assuming useThemeCheck is available in this scope or imported


const data = [
  { time: "1h", price: 30 },
  { time: "2h", price: 34 },
  { time: "3h", price: 33 },
  { time: "4h", price: 35 },
];

export default function SparklineGraph() {
  const isLight = useThemeCheck();

  // Define line color based on theme
  const lineColor = isLight ? "#0e7490" : "#3b82f6";

  // Tooltip content style adjustment for light mode
  const tooltipStyle = {
    backgroundColor: isLight ? '#fff' : '#1f2937',
    border: isLight ? '1px solid #e5e7eb' : '1px solid #4b5563',
    color: isLight ? '#1f2937' : '#fff',
    borderRadius: '8px',
    padding: '8px',
    fontSize: '12px'
  };
  
  // Custom Tooltip component to apply dynamic styles
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