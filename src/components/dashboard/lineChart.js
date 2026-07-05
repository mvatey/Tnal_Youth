// components/dashboard/LineChart.jsx
"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const data = [
  { month: "ខែមករា", value: 40 },
  { month: "ខែកុម្ភៈ", value: 78 },
  { month: "ខែមិនា", value: 30 },
  { month: "ខែមេសា", value: 65 },
  { month: "ខែឧសភា", value: 45 },
  { month: "ខែមិថុនា", value: 55 },
];

export default function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#8A56D6" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}