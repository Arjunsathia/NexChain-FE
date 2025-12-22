import useThemeCheck from '@/hooks/useThemeCheck';
import React, { useMemo, useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';



function UserLineChart({ users = [], timeRange = 'Month' }) {
  const isLight = useThemeCheck();

  
  const data = useMemo(() => {
    if (users.length === 0) {
      
      return timeRange === 'Week' 
        ? [
            { name: "Mon", users: 12 },
            { name: "Tue", users: 18 },
            { name: "Wed", users: 15 },
            { name: "Thu", users: 25 },
            { name: "Fri", users: 20 },
            { name: "Sat", users: 30 },
            { name: "Sun", users: 28 },
          ]
        : [
            { name: "Jan", users: 120 },
            { name: "Feb", users: 150 },
            { name: "Mar", users: 180 },
            { name: "Apr", users: 220 },
            { name: "May", users: 250 },
            { name: "Jun", users: 300 },
            { name: "Jul", users: 280 },
            { name: "Aug", users: 350 },
          ];
    }

    const now = new Date();
    const result = [];

    if (timeRange === 'Week') {
      
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dailyCounts = {};

      users.forEach(user => {
        if (user.createdAt) {
          const d = new Date(user.createdAt);
          const key = d.toDateString();
          dailyCounts[key] = (dailyCounts[key] || 0) + 1;
        }
      });

      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = d.toDateString();
        result.push({
          name: dayNames[d.getDay()],
          users: dailyCounts[key] || 0,
          fullDate: d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
        });
      }
    } else {
      
      const monthCounts = {};
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      users.forEach(user => {
        if (user.createdAt) {
          const d = new Date(user.createdAt);
          const key = `${d.getFullYear()}-${d.getMonth()}`;
          monthCounts[key] = (monthCounts[key] || 0) + 1;
        }
      });

      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        result.push({
          name: monthNames[d.getMonth()],
          users: monthCounts[key] || 0,
          fullDate: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        });
      }
    }

    return result;
  }, [users, timeRange]);

  
  const chartColors = useMemo(() => ({
    stroke: isLight ? "#0ea5e9" : "#06b6d4", 
    fillStart: isLight ? "#0ea5e9" : "#06b6d4",
    fillEnd: isLight ? "#ffffff" : "#0f172a", 
    grid: isLight ? "#f1f5f9" : "#334155", 
    axis: isLight ? "#94a3b8" : "#64748b", 
    tooltipBg: isLight ? "rgba(255, 255, 255, 0.95)" : "rgba(15, 23, 42, 0.95)",
    tooltipText: isLight ? "#0f172a" : "#f8fafc",
    tooltipBorder: isLight ? "rgba(226, 232, 240, 0.8)" : "rgba(51, 65, 85, 0.8)",
  }), [isLight]);
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartColors.fillStart} stopOpacity={0.4}/>
            <stop offset="50%" stopColor={chartColors.fillStart} stopOpacity={0.1}/>
            <stop offset="100%" stopColor={chartColors.fillStart} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid 
          vertical={false}
          stroke={chartColors.grid}
          strokeDasharray="3 3"
          opacity={0.4}
        />
        <XAxis 
          dataKey="name" 
          stroke={chartColors.axis}
          fontSize={11}
          tickLine={false}
          axisLine={false}
          dy={10}
          padding={{ left: 0, right: 0 }}
        />
        <YAxis 
          stroke={chartColors.axis}
          fontSize={11}
          tickLine={false}
          axisLine={false}
          domain={[0, 'auto']}
        />
        <Tooltip 
          cursor={{ stroke: chartColors.grid, strokeWidth: 1, strokeDasharray: '4 4' }}
          contentStyle={{ 
            backgroundColor: chartColors.tooltipBg, 
            border: `1px solid ${chartColors.tooltipBorder}`,
            borderRadius: '12px',
            color: chartColors.tooltipText,
            boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(8px)',
            padding: '12px 16px'
          }}
          itemStyle={{ color: chartColors.stroke, fontWeight: 600, fontSize: '14px' }}
          labelStyle={{ color: chartColors.axis, marginBottom: '4px', fontSize: '12px', fontWeight: 500 }}
          formatter={(value) => [value, 'New Users']}
          labelFormatter={(label, payload) => {
            if (payload && payload.length > 0) {
              return payload[0].payload.fullDate;
            }
            return label;
          }}
        />
        <Area
          type="monotone"
          dataKey="users"
          stroke={chartColors.stroke}
          strokeWidth={4}
          fillOpacity={1}
          fill="url(#colorUsers)"
          animationDuration={1500}
          activeDot={{ r: 6, strokeWidth: 0, fill: chartColors.stroke, shadow: '0 0 10px rgba(6, 182, 212, 0.5)' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default UserLineChart;