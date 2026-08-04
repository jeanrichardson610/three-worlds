import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SpendingPoint } from "@/types/banking";

export default function SpendingChart({ data }: { data: SpendingPoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#33d6ac" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#33d6ac" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff6b7a" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#ff6b7a" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e3252" vertical={false} />
          <XAxis
            dataKey="month"
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
            width={48}
          />
          <Tooltip
            contentStyle={{
              background: "#0f1c30",
              border: "1px solid #1e3252",
              borderRadius: 12,
              color: "#eaf1fb",
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="income"
            stroke="#33d6ac"
            fill="url(#incomeGrad)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="spending"
            stroke="#ff6b7a"
            fill="url(#spendGrad)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
