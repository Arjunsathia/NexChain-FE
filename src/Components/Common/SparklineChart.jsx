import React from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

const SparklineChart = ({ data, change }) => {
  const chartData = data?.map((price, index) => ({
    price,
    index,
  }));

  const strokeColor = change < 0 ? "#f87171" : "#4ade80"; // red or green

  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="price"
          stroke={strokeColor}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SparklineChart;
