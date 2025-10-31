import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { time: "1h", price: 30 },
  { time: "2h", price: 34 },
  { time: "3h", price: 33 },
  { time: "4h", price: 35 },
];

export default function SparklineGraph() {
  return (
    <div className="w-32 h-16 fade-in" style={{ animationDelay: "0.3s" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="price"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
          />
          <Tooltip />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}