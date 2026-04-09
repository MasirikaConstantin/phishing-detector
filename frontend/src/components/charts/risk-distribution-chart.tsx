import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS: Record<string, string> = {
  low: "#1D8A5A",
  medium: "#F2A93B",
  high: "#E75844",
  critical: "#B91C1C",
};

export function RiskDistributionChart({ data }: { data: { label: string; value: number }[] }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="label" innerRadius={72} outerRadius={100}>
            {data.map((entry) => (
              <Cell key={entry.label} fill={COLORS[entry.label] ?? "#2563EB"} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
