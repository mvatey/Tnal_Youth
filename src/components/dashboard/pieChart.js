// components/dashboard/DonutChart.jsx
"use client";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const data = [
  { name: "សមាជិកបានបង់", value: 280, color: "#16A34A" },
  { name: "សមាជិកមិនទាន់", value: 220, color: "#4B3391" },
];

export default function DonutChart() {
  return (
    <div className="flex items-center gap-8">
      <div className="w-48 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={60} outerRadius={90} paddingAngle={2}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-3">
        {data.map((entry, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-text-secondary">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
            {entry.name} <span className="font-semibold text-text-primary">{entry.value} នាក់</span>
          </div>
        ))}
      </div>
    </div>
  );
}