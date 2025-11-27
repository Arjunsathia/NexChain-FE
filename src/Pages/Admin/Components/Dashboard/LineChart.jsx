import React, { useMemo, useState, useEffect } from "react";
import { LineChart as ReLineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// Utility to check if light mode is active based on global class
const useThemeCheck = () => {
    const [isLight, setIsLight] = useState(!document.documentElement.classList.contains('dark'));

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsLight(!document.documentElement.classList.contains('dark'));
        });

        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    return isLight;
};

function UserLineChart({ users = [] }) {
  const isLight = useThemeCheck();

  // Generate chart data from actual users or use mock data
  const data = useMemo(() => {
    if (users.length === 0) {
      // Mock data fallback
      return [
        { name: "Jan", users: 5000 },
        { name: "Feb", users: 7000 },
        { name: "Mar", users: 6800 },
        { name: "Apr", users: 9000 },
        { name: "May", users: 8800 },
        { name: "Jun", users: 10200 },
        { name: "Jul", users: 10000 },
        { name: "Aug", users: 11500 },
      ];
    }

    // Group users by month
    const monthCounts = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    users.forEach(user => {
      if (user.createdAt) {
        const date = new Date(user.createdAt);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
      }
    });

    // Get last 8 months
    const result = [];
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      result.push({
        name: monthNames[date.getMonth()],
        users: monthCounts[monthKey] || 0
      });
    }

    return result;
  }, [users]);

  // Theme-aware colors
  const chartColors = useMemo(() => ({
    stroke: isLight ? "#0891b2" : "#06b6d4", // cyan-600 : cyan-400
    grid: isLight ? "#e5e7eb" : "#374151", // gray-200 : gray-700
    axis: isLight ? "#6b7280" : "#9ca3af", // gray-500 : gray-400
    tooltipBg: isLight ? "#ffffff" : "#1f2937", // white : gray-800
    tooltipBorder: isLight ? "#e5e7eb" : "#374151", // gray-200 : gray-700
    tooltipText: isLight ? "#111827" : "#f9fafb", // gray-900 : gray-50
  }), [isLight]);
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ReLineChart data={data}>
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke={chartColors.grid}
          opacity={0.3}
        />
        <XAxis 
          dataKey="name" 
          stroke={chartColors.axis}
          fontSize={12}
          tickLine={false}
        />
        <YAxis 
          stroke={chartColors.axis}
          fontSize={12}
          tickLine={false}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: chartColors.tooltipBg, 
            border: 'none',
            borderRadius: '12px',
            color: chartColors.tooltipText,
            boxShadow: isLight ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' : '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.1)'
          }}
          labelStyle={{ color: chartColors.tooltipText, fontWeight: 'bold' }}
          itemStyle={{ color: chartColors.stroke }}
        />
        <Line
          type="monotone"
          dataKey="users"
          stroke={chartColors.stroke}
          strokeWidth={3}
          dot={{ fill: chartColors.stroke, strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, strokeWidth: 2 }}
        />
      </ReLineChart>
    </ResponsiveContainer>
  );
}

export default UserLineChart;