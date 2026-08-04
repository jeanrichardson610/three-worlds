import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import type { ScoreDistributionPoint } from "@/types/anime";

export default function ScoreHistogram({ data }: { data: ScoreDistributionPoint[] }) {
  if (data.length === 0) return null;

  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="scoreBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff3d81" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#33e1ed" stopOpacity={0.6} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="score"
            stroke="#a291b8"
            tick={{ fontSize: 10, fill: "#a291b8" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.05)" }}
            contentStyle={{
              background: "#17101f",
              border: "1px solid #2a1c38",
              borderRadius: 10,
              color: "#f3ecfa",
              fontSize: 12,
            }}
            labelFormatter={(v) => `Score ${v}`}
            formatter={(value: number) => [`${value} users`, "Votes"]}
          />
          <Bar dataKey="amount" fill="url(#scoreBarGrad)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}