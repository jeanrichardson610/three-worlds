import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { NetWorthPoint } from "@/types/banking";

function formatUSD(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default function NetWorthChart({ data }: { data: NetWorthPoint[] }) {
  const firstProjectedIndex = data.findIndex((p) => p.projected);

  const chartData = data.map((p, i) => ({
    date: new Date(p.date).toLocaleDateString("en-US", { month: "short" }),
    actual: !p.projected ? p.netWorth : null,
    projected: i >= firstProjectedIndex - 1 ? p.netWorth : null,
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e3252" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#7f93b4"
            tick={{ fontSize: 12, fill: "#7f93b4" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            stroke="#7f93b4"
            tick={{ fontSize: 12, fill: "#7f93b4" }}
            axisLine={false}
            tickLine={false}
            width={56}
            tickFormatter={(v) => formatUSD(v)}
          />
          <Tooltip
            formatter={(value: number) => formatUSD(value)}
            contentStyle={{
              background: "#0f1c30",
              border: "1px solid #1e3252",
              borderRadius: 12,
              color: "#eaf1fb",
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#33d6ac"
            strokeWidth={2.5}
            dot={false}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="projected"
            stroke="#33d6ac"
            strokeWidth={2.5}
            strokeDasharray="6 6"
            strokeOpacity={0.65}
            dot={false}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-1 flex items-center gap-4 text-[11px] text-bank-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded-full bg-bank-mint" /> Actual
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="h-0.5 w-4 rounded-full bg-bank-mint opacity-60"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, #33d6ac 0 4px, transparent 4px 7px)",
            }}
          />
          Projected
        </span>
      </div>
    </div>
  );
}